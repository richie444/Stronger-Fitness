import pg from "pg";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. API database routes will be unavailable until it is configured.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export async function initializeDatabase() {
  const schemaUrl = new URL("./schema.sql", import.meta.url);
  const schema = await readFile(fileURLToPath(schemaUrl), "utf8");
  await pool.query(schema);
}
