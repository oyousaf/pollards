import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const MOCK_PORT = 4010;

/** Env for the app under test: points Appwrite at the in-memory mock. */
export const testEnv = {
  APPWRITE_ENDPOINT: `http://127.0.0.1:${MOCK_PORT}/v1`,
  APPWRITE_PROJECT_ID: "test",
  APPWRITE_API_KEY: "test",
  APPWRITE_DATABASE_ID: "db",
  APPWRITE_PATIENT_TABLE_ID: "patients",
  APPWRITE_APPOINTMENT_TABLE_ID: "appointments",
  APPWRITE_BUCKET_ID: "bucket",
  ADMIN_PASSKEY: "2468",
  SESSION_SECRET: "e2e-session-secret-e2e-session-secret-0000",
  NEXT_PUBLIC_GA_ID: "",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false, // tests share one mock backend
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
      command: "node tests/e2e/mock-appwrite.mjs",
      url: `http://127.0.0.1:${MOCK_PORT}/__state`,
      env: { MOCK_APPWRITE_PORT: String(MOCK_PORT) },
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
