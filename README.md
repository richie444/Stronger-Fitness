# Stronger Fitness

A responsive fitness studio website built with React, Vite, Tailwind CSS, Express, and PostgreSQL.

## Project structure

- `src/` — React frontend and UI components.
- `src/components/` — header, class cards, auth dialog, and page sections.
- `src/lib/api.js` — shared browser helper for API requests and cookies.
- `src/data/siteData.js` — starter data used by the repeatable database seed script.
- `server/index.js` — Express API, authentication endpoints, and session handling.
- `server/schema.sql` — PostgreSQL tables for users, classes, trainers, memberships, orders, and order items.
- `server/seed.js` — inserts or updates the starter site data in PostgreSQL.

## Local development

1. Install Node.js 20.19+ or 22.12+.
2. Create a PostgreSQL database (for example, a Neon project).
3. Copy `.env.example` to `.env` and set `DATABASE_URL` and a private `SESSION_SECRET` of at least 32 characters.
4. Install packages with `npm install`.
5. Load the sample classes, trainers, and plans with `npm run db:seed`.
6. Start the frontend and backend together with `npm run dev`.
7. Visit the Vite URL (usually `http://localhost:5173`). The Express API runs on port 3001.

The API creates the tables at startup. The seed command is safe to run more than once. The `/api/health` endpoint reports whether PostgreSQL is reachable.

## Database in plain English

- `users` stores a member's name, unique email, and bcrypt password hash. The original password is never stored.
- `classes` holds each scheduled fitness class and its image description.
- `trainers` holds coach profiles.
- `memberships` holds plans, prices, feature lists, and the featured-plan flag.
- `user_sessions`, created and maintained by the PostgreSQL session store, keeps login sessions across page refreshes and server restarts.

## API routes

- `GET /api/health` — check API/database health.
- `GET /api/classes` — list classes; optional `?category=Strength` filter.
- `GET /api/trainers` and `GET /api/memberships` — list site content.
- `POST /api/auth/signup`, `POST /api/auth/login` — create an account or start a session.
- `GET /api/auth/me` — read the current session.
- `POST /api/auth/logout` — end the current session.
- `POST /api/checkout` — signed-in users start a monthly Stripe test subscription for a database-priced membership.
- `POST /api/webhooks/stripe` — verifies Stripe's signature and is the only route that marks orders paid.
- `GET /api/orders/:orderId?session_id=...` — signed-in order owner reads payment status and items.

## Stripe test checkout

1. In Stripe Dashboard, switch to **Test mode** and copy a test secret key (`sk_test_...`) into `STRIPE_SECRET_KEY` in your ignored local `.env`. Do not use a live key.
2. Install and authenticate the Stripe CLI, then run `npm run stripe:listen`. Copy the printed `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`, then restart the API.
3. Keep `STRIPE_CURRENCY=usd` (or use another currency enabled in your Stripe test account). Restart `npm run dev`, sign in to the site, and select a membership. The server fetches its price from PostgreSQL; the browser sends only the membership ID.
4. Complete Stripe Checkout using test card `4242 4242 4242 4242`, any future expiry date, and any CVC. The success screen checks your order several times while the verified webhook updates it.

The orders table records the user, status, total in the smallest currency unit (cents for USD), Stripe Checkout session, and paid timestamp. Order items keep a membership name and unit-price snapshot so the purchase remains understandable if a plan later changes. A new database receives both order tables when the API starts; existing databases get them through the same `CREATE TABLE IF NOT EXISTS` schema setup.

For deployment, set `STRIPE_SECRET_KEY` to a test-mode key and configure `STRIPE_WEBHOOK_SECRET` from a Stripe webhook endpoint targeting `https://YOUR-BACKEND.onrender.com/api/webhooks/stripe`. Subscribe at minimum to `checkout.session.completed` (and optionally `checkout.session.async_payment_succeeded`). Keep all Stripe secrets in Render's environment settings, never in the frontend or Git.

## Deployment (Render + Vercel)

1. Create a managed PostgreSQL database and keep its connection string private.
2. Create a Render Web Service from this repository. The included `render.yaml` configures the API. Set `DATABASE_URL`, `SESSION_SECRET` (at least 32 random characters), and `CLIENT_URL` (the deployed frontend's origin) in Render's environment settings.
3. Once the API is deployed, run `npm run db:seed` from a local terminal with `DATABASE_URL` set to the hosted database URL.
4. Edit `vercel.json`, replacing `YOUR-BACKEND` with the actual Render service hostname. Deploy the repository to Vercel; its rewrite proxies `/api/*` to Render so session cookies remain same-site.
5. Visit `https://YOUR-BACKEND.onrender.com/api/health` and test sign-up, refresh, and sign-out on the Vercel site.

Never commit `.env` or paste database credentials into source files. `.gitignore` excludes local env files; the committed `.env.example` files contain placeholders only. Public deployment requires your own PostgreSQL account, hosting accounts, and service configuration; this repository cannot create those on your behalf.
