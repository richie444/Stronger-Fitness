import "dotenv/config";
import bcrypt from "bcryptjs";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import express from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import Stripe from "stripe";
import { pool, initializeDatabase } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const production = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL;
const PgSession = connectPgSimple(session);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (production) app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: clientUrl || "http://localhost:5173", credentials: true }));

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (request, response) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return response.status(503).json({ error: "Stripe webhook is not configured." });
  }

  let event;
  try {
    const signature = request.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(request.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.warn("Stripe webhook signature verification failed:", error.message);
    return response.status(400).send("Invalid Stripe signature.");
  }

  if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    const checkoutSession = event.data.object;
    if (checkoutSession.payment_status === "paid") {
      const orderId = checkoutSession.metadata?.orderId;
      if (!/^\d+$/.test(orderId || "")) {
        console.error("Stripe payment webhook is missing a valid order ID.");
        return response.json({ received: true });
      }
      try {
        const orderResult = await pool.query(
          "SELECT id, total_amount, currency, stripe_session_id FROM orders WHERE id = $1",
          [orderId],
        );
        const order = orderResult.rows[0];
        if (order && order.stripe_session_id === checkoutSession.id
          && order.total_amount === checkoutSession.amount_total
          && order.currency.trim() === checkoutSession.currency) {
          await pool.query(
            `UPDATE orders
             SET status = 'paid', paid_at = NOW(), stripe_payment_intent_id = $2
             WHERE id = $1 AND status = 'pending'`,
            [order.id, checkoutSession.payment_intent || null],
          );
        } else {
          console.error("Stripe payment did not match a pending order.", { orderId });
        }
      } catch (error) {
        console.error("Could not apply Stripe payment webhook:", error.message);
        return response.status(500).json({ error: "Could not update order." });
      }
    }
  }

  response.json({ received: true });
});

app.use(express.json({ limit: "10kb" }));
app.use(session({
  store: new PgSession({ pool, createTableIfMissing: true, tableName: "user_sessions" }),
  name: "stronger.sid",
  secret: process.env.SESSION_SECRET || "local-development-only-change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

function requireLogin(request, response, next) {
  if (!request.session.userId) return response.status(401).json({ error: "Sign in before starting checkout." });
  next();
}

function cleanUser(row) {
  return { id: row.id, name: row.name, email: row.email };
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

app.get("/api/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch {
    response.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.get("/api/classes", async (request, response, next) => {
  try {
    const category = typeof request.query.category === "string" ? request.query.category : "";
    const result = category && category !== "All classes"
      ? await pool.query("SELECT * FROM classes WHERE category = $1 ORDER BY id", [category])
      : await pool.query("SELECT * FROM classes ORDER BY id");
    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/trainers", async (_request, response, next) => {
  try {
    const result = await pool.query("SELECT id, name, role, initials, image, alt FROM trainers ORDER BY id");
    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/memberships", async (_request, response, next) => {
  try {
    const result = await pool.query("SELECT id, tier, price, features, featured FROM memberships ORDER BY price");
    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/checkout", requireLogin, async (request, response, next) => {
  if (!stripe || !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
    return response.status(503).json({ error: "Stripe test mode is not configured on the server yet." });
  }

  const membershipId = Number(request.body.membershipId);
  if (!Number.isSafeInteger(membershipId) || membershipId < 1) {
    return response.status(400).json({ error: "Choose a valid membership plan." });
  }

  const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
  if (!/^[a-z]{3}$/.test(currency)) return response.status(500).json({ error: "Stripe currency is configured incorrectly." });

  const connection = await pool.connect();
  let order;
  let membership;
  try {
    const membershipResult = await connection.query(
      "SELECT id, tier, price FROM memberships WHERE id = $1",
      [membershipId],
    );
    membership = membershipResult.rows[0];
    if (!membership) return response.status(404).json({ error: "That membership plan was not found." });

    const unitPrice = membership.price * 100;
    await connection.query("BEGIN");
    const orderResult = await connection.query(
      "INSERT INTO orders (user_id, total_amount, currency) VALUES ($1, $2, $3) RETURNING id, total_amount",
      [request.session.userId, unitPrice, currency],
    );
    order = orderResult.rows[0];
    await connection.query(
      "INSERT INTO order_items (order_id, membership_id, item_name, quantity, unit_price) VALUES ($1, $2, $3, 1, $4)",
      [order.id, membership.id, membership.tier, unitPrice],
    );
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK").catch(() => {});
    return next(error);
  } finally {
    connection.release();
  }

  try {
    const baseUrl = (clientUrl || "http://localhost:5173").replace(/\/$/, "");
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: String(request.session.userId),
      metadata: { orderId: String(order.id), userId: String(request.session.userId) },
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: order.total_amount,
          product_data: {
            name: `${membership.tier} Membership`,
            description: "Monthly Stronger Fitness membership",
          },
          recurring: { interval: "month" },
        },
      }],
      success_url: `${baseUrl}/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled#pricing`,
    }, { idempotencyKey: `membership-order-${order.id}` });

    await pool.query("UPDATE orders SET stripe_session_id = $1 WHERE id = $2", [checkoutSession.id, order.id]);
    response.status(201).json({ url: checkoutSession.url });
  } catch (error) {
    await pool.query("UPDATE orders SET status = 'failed' WHERE id = $1 AND status = 'pending'", [order.id]).catch(() => {});
    next(error);
  }
});

app.get("/api/orders/:orderId", requireLogin, async (request, response, next) => {
  const orderId = request.params.orderId;
  const checkoutSessionId = request.query.session_id;
  if (!/^\d+$/.test(orderId) || typeof checkoutSessionId !== "string") {
    return response.status(400).json({ error: "A valid order and Checkout session are required." });
  }

  try {
    const result = await pool.query(
      "SELECT id, status, total_amount, currency, stripe_session_id, created_at, paid_at FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, request.session.userId],
    );
    const order = result.rows[0];
    if (!order) return response.status(404).json({ error: "Order not found." });
    if (order.stripe_session_id !== checkoutSessionId) return response.status(403).json({ error: "Checkout session does not match this order." });

    const itemsResult = await pool.query(
      "SELECT item_name, quantity, unit_price FROM order_items WHERE order_id = $1 ORDER BY id",
      [order.id],
    );
    response.json({
      id: order.id,
      status: order.status,
      totalAmount: order.total_amount,
      currency: order.currency.trim(),
      createdAt: order.created_at,
      paidAt: order.paid_at,
      items: itemsResult.rows.map((item) => ({
        name: item.item_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", async (request, response, next) => {
  if (!request.session.userId) return response.json({ user: null });
  try {
    const result = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [request.session.userId]);
    if (!result.rows[0]) {
      request.session.destroy(() => {});
      return response.json({ user: null });
    }
    response.json({ user: cleanUser(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/signup", authLimiter, async (request, response, next) => {
  const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
  const email = normalizeEmail(request.body.email);
  const password = typeof request.body.password === "string" ? request.body.password : "";
  if (name.length < 1 || name.length > 80) return response.status(400).json({ error: "Name must be between 1 and 80 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return response.status(400).json({ error: "Enter a valid email address." });
  if (password.length < 8 || password.length > 72) return response.status(400).json({ error: "Password must be between 8 and 72 characters." });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, passwordHash],
    );
    request.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);
      request.session.userId = result.rows[0].id;
      request.session.save((saveError) => {
        if (saveError) return next(saveError);
        response.status(201).json({ user: cleanUser(result.rows[0]) });
      });
    });
  } catch (error) {
    if (error.code === "23505") return response.status(409).json({ error: "An account with that email already exists." });
    next(error);
  }
});

app.post("/api/auth/login", authLimiter, async (request, response, next) => {
  const email = normalizeEmail(request.body.email);
  const password = typeof request.body.password === "string" ? request.body.password : "";
  if (!email || !password) return response.status(400).json({ error: "Enter your email and password." });
  try {
    const result = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    request.session.regenerate((error) => {
      if (error) return next(error);
      request.session.userId = user.id;
      request.session.save((saveError) => {
        if (saveError) return next(saveError);
        response.json({ user: cleanUser(user) });
      });
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);
    response.clearCookie("stronger.sid", { httpOnly: true, secure: production, sameSite: production ? "none" : "lax" });
    response.status(204).end();
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Something went wrong. Please try again." });
});

async function start() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in your server .env before starting the API.");
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("Set SESSION_SECRET to a random value of at least 32 characters.");
  }
  await initializeDatabase();
  app.listen(port, () => console.log(`Stronger Fitness API listening on port ${port}`));
}

start().catch((error) => {
  console.error("Could not start API:", error.message);
  process.exitCode = 1;
});
