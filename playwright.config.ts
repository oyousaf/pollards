import { resolve } from "node:path";

import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const DB_PORT = 5499;
const DB_READY_PORT = 5498;

/** Outgoing email/SMS are written here as JSON instead of being sent. */
export const OUTBOX_DIR = resolve("test-results/outbox");
export const TEST_DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/postgres`;

/** Env for the app under test: in-memory Postgres, file outbox, throwaway uploads. */
export const testEnv = {
  DATABASE_URL: TEST_DATABASE_URL,
  DATABASE_SSL: "false",
  DATABASE_POOL_MAX: "5",
  ADMIN_PASSKEY: "2468",
  SESSION_SECRET: "e2e-session-secret-e2e-session-secret-0000",
  MAIL_OUTBOX_DIR: OUTBOX_DIR,
  UPLOAD_DIR: resolve("test-results/uploads"),
  RESEND_API_KEY: "",
  NEXT_PUBLIC_GA_ID: "",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false, // tests share one database
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    timezoneId: "Europe/London",
    locale: "en-GB",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: [
    {
      command: "node tests/e2e/test-db.mjs",
      url: `http://127.0.0.1:${DB_READY_PORT}`,
      env: { TEST_DB_PORT: String(DB_PORT), TEST_DB_READY_PORT: String(DB_READY_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: `http://127.0.0.1:${PORT}`,
      env: testEnv,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
