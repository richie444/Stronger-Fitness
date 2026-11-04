CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  coach TEXT NOT NULL,
  duration TEXT NOT NULL,
  image TEXT NOT NULL,
  alt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trainers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  initials TEXT NOT NULL,
  image TEXT NOT NULL,
  alt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL CHECK (price >= 0),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),
  currency CHAR(3) NOT NULL DEFAULT 'usd',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  membership_id BIGINT NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price > 0)
);

CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
