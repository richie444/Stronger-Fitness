# Stronger Fitness

A responsive fitness studio website built with React, Vite, Tailwind CSS, Express, and PostgreSQL.

## Project structure

- `src/` — React frontend and UI components.
- `src/components/` — header, class cards, auth dialog, and page sections.
- `src/lib/api.js` — shared browser helper for API requests and cookies.
- `src/data/siteData.js` — starter data used by the repeatable database seed script.
- `server/index.js` — Express API, authentication endpoints, and session handling.
- `server/schema.sql` — PostgreSQL tables for users, classes, trainers, and memberships.
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

## Deployment (Render + Vercel)

1. Create a managed PostgreSQL database and keep its connection string private.
2. Create a Render Web Service from this repository. The included `render.yaml` configures the API. Set `DATABASE_URL`, `SESSION_SECRET` (at least 32 random characters), and `CLIENT_URL` (the deployed frontend's origin) in Render's environment settings.
3. Once the API is deployed, run `npm run db:seed` from a local terminal with `DATABASE_URL` set to the hosted database URL.
4. Edit `vercel.json`, replacing `YOUR-BACKEND` with the actual Render service hostname. Deploy the repository to Vercel; its rewrite proxies `/api/*` to Render so session cookies remain same-site.
5. Visit `https://YOUR-BACKEND.onrender.com/api/health` and test sign-up, refresh, and sign-out on the Vercel site.

Never commit `.env` or paste database credentials into source files. `.gitignore` excludes local env files; the committed `.env.example` files contain placeholders only. Public deployment requires your own PostgreSQL account, hosting accounts, and service configuration; this repository cannot create those on your behalf.
