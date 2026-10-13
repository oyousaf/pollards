// Throwaway Postgres for end-to-end tests: PGlite (real Postgres compiled to WASM)
// exposed over the Postgres wire protocol, so the app's normal `pg` client connects
// to it unchanged. In-memory, migrated on start — no local install or Docker needed.

import { spawn } from "node:child_process";
import { createServer } from "node:http";

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const PORT = Number(process.env.TEST_DB_PORT ?? 5499);
const url = `postgresql://postgres:postgres@127.0.0.1:${PORT}/postgres`;

const db = await PGlite.create();
const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: PORT, maxConnections: 20 });
await server.start();

// Must be async: a blocking child would starve the in-process server.
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ["scripts/migrate-db.mjs"], {
    env: { ...process.env, DATABASE_URL: url, DATABASE_SSL: "false" },
    stdio: "inherit",
  });
  child.on("exit", (code) =>
    code === 0 ? resolve() : reject(new Error(`migrations failed (${code})`))
  );
});

// Readiness probe for Playwright: only answers once migrations have run.
const READY_PORT = Number(process.env.TEST_DB_READY_PORT ?? 5498);
createServer((_, res) => res.end("ready")).listen(READY_PORT, "127.0.0.1");
console.log(`test database ready on ${url}`);

const shutdown = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
