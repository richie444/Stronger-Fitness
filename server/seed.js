import "dotenv/config";
import { classes, memberships, trainers } from "../src/data/siteData.js";
import { initializeDatabase, pool } from "./db.js";

try {
  await initializeDatabase();

  for (const session of classes) {
    await pool.query(
      `INSERT INTO classes (id, name, category, day, time, coach, duration, image, alt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category,
       day = EXCLUDED.day, time = EXCLUDED.time, coach = EXCLUDED.coach,
       duration = EXCLUDED.duration, image = EXCLUDED.image, alt = EXCLUDED.alt`,
      [session.id, session.name, session.category, session.day, session.time, session.coach, session.duration, session.image, session.alt],
    );
  }

  for (const trainer of trainers) {
    await pool.query(
      `INSERT INTO trainers (name, role, initials, image, alt)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET role = EXCLUDED.role, initials = EXCLUDED.initials,
       image = EXCLUDED.image, alt = EXCLUDED.alt`,
      [trainer.name, trainer.role, trainer.initials, trainer.image, trainer.alt],
    );
  }

  for (const plan of memberships) {
    await pool.query(
      `INSERT INTO memberships (tier, price, features, featured)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tier) DO UPDATE SET price = EXCLUDED.price,
       features = EXCLUDED.features, featured = EXCLUDED.featured`,
      [plan.tier, plan.price, JSON.stringify(plan.features), Boolean(plan.featured)],
    );
  }

  console.log(`Seeded ${classes.length} classes, ${trainers.length} trainers, and ${memberships.length} memberships.`);
} catch (error) {
  console.error("Database seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
