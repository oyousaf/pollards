// Applies db/migrations/*.sql in order, once each, inside a transaction.
// Records a checksum per file and refuses to continue if an applied migration was edited.
// Usage: DATABASE_URL=... node scripts/migrate-db.mjs

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const OFF = ["false", "disable", "off", "0"];

async function main() {
  // Pick up DATABASE_URL from the app's .env when run via `npm run db:migrate`.
  try {
    process.loadEnvFile(".env");
  } catch {
    // No .env file — rely on the process environment.
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");

  const pool = new pg.Pool({
    connectionString,
    ssl: OFF.includes(process.env.DATABASE_SSL?.toLowerCase() ?? "false")
      ? false
      : { rejectUnauthorized: false },
  });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

    for (const file of files) {
      const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const { rows } = await client.query(
        "SELECT checksum FROM schema_migrations WHERE name = $1",
        [file]
      );

      if (rows[0]) {
        if (rows[0].checksum !== checksum)
          throw new Error(`Applied migration was modified: ${file}`);
        continue;
      }

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [
          file,
          checksum,
        ]);
        await client.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    console.log("Database is up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
});
