import "dotenv/config";
import bcrypt from "bcryptjs";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import express from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pool, initializeDatabase } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const production = process.env.NODE_ENV === "production";
const clientUrl = process.env.CLIENT_URL;
const PgSession = connectPgSimple(session);

if (production) app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: clientUrl || "http://localhost:5173", credentials: true }));
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
