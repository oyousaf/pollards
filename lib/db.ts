import "server-only";

import { Pool, type QueryResultRow } from "pg";

import { env } from "./env";

const OFF = ["false", "disable", "off", "0"];

// Reuse one pool across dev hot reloads instead of leaking connections.
const globalForDb = globalThis as unknown as { pollardsPool?: Pool };

function pool() {
  if (globalForDb.pollardsPool) return globalForDb.pollardsPool;

  const { DATABASE_URL, DATABASE_SSL, DATABASE_POOL_MAX } = env();
  // Default: no TLS for a local (loopback) database, TLS for anything remote.
  const useSsl = DATABASE_SSL
    ? !OFF.includes(DATABASE_SSL.toLowerCase())
    : !/@(localhost|127\.0\.0\.1)(:|\/)/.test(DATABASE_URL);

  globalForDb.pollardsPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    application_name: "pollards",
    max: DATABASE_POOL_MAX,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });
  return globalForDb.pollardsPool;
}

/** Runs a parameterised query. Always pass user input as `params`, never interpolate it. */
export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return pool().query<T>(text, params);
}

/** Postgres error code for a unique-constraint violation (e.g. a slot already taken). */
export const UNIQUE_VIOLATION = "23505";

export const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && error.code === UNIQUE_VIOLATION;
