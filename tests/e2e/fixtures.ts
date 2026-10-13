import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

import { test as base, expect, type Page } from "@playwright/test";
import pg from "pg";

import { fromLondonTime } from "../../lib/slots";
import { OUTBOX_DIR, TEST_DATABASE_URL } from "../../playwright.config";

export const ADMIN_PASSKEY = "2468";
export const CLINICIAN = "Keith Barton";

// ---------- database ----------

let pool: pg.Pool | undefined;
const getPool = () => (pool ??= new pg.Pool({ connectionString: TEST_DATABASE_URL, max: 2 }));

export const db = {
  query: <T extends pg.QueryResultRow>(text: string, params: unknown[] = []) =>
    getPool().query<T>(text, params),

  reset: () => getPool().query("TRUNCATE appointments, patients, login_codes CASCADE"),

  /** A patient who has finished registration. */
  async seedPatient(overrides: { email?: string; name?: string; phone?: string } = {}) {
    const email = overrides.email ?? `patient-${randomUUID().slice(0, 8)}@example.com`;
    const { rows } = await getPool().query<{ id: string }>(
      `INSERT INTO patients (email, name, phone, primary_physician, registered_at, privacy_consent)
       VALUES ($1, $2, $3, $4, now(), true) RETURNING id`,
      [email, overrides.name ?? "Rita Returning", overrides.phone ?? "+447700900111", CLINICIAN]
    );
    return { id: rows[0].id, email };
  },

  async seedAppointment(a: {
    patientId: string;
    schedule: Date;
    status?: "pending" | "scheduled" | "cancelled";
    physician?: string;
    reason?: string;
  }) {
    const { rows } = await getPool().query<{ id: string }>(
      `INSERT INTO appointments (patient_id, primary_physician, schedule, status, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        a.patientId,
        a.physician ?? CLINICIAN,
        a.schedule,
        a.status ?? "pending",
        a.reason ?? "Eye examination",
      ]
    );
    return rows[0].id;
  },
};

// ---------- email / SMS outbox ----------

type OutboxMessage =
  | { kind: "email"; to: string; subject: string; text: string }
  | { kind: "sms"; to: string; body: string };

export async function outbox(): Promise<OutboxMessage[]> {
  await mkdir(OUTBOX_DIR, { recursive: true });
  const files = (await readdir(OUTBOX_DIR)).sort();
  return Promise.all(
    files.map(async (f) => JSON.parse(await readFile(join(OUTBOX_DIR, f), "utf8")))
  );
}

/** The most recent sign-in code emailed to an address. */
export async function latestCode(email: string) {
  await expect
    .poll(async () => (await outbox()).some((m) => m.kind === "email" && m.to === email))
    .toBe(true);
  const mail = (await outbox()).filter((m) => m.kind === "email" && m.to === email).at(-1);
  const code = mail && "subject" in mail ? mail.subject.match(/\b\d{6}\b/)?.[0] : undefined;
  if (!code) throw new Error(`No sign-in code emailed to ${email}`);
  return code;
}

// ---------- dates ----------

/** First Tuesday of next month — always open and inside the 90-day booking window. */
export function nextMonthTuesday() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
  return d;
}

export const londonSlot = (day: Date, hour: number, minute = 0) =>
  fromLondonTime(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);

// ---------- UI helpers ----------

/** react-day-picker marks each day with data-day in the calendar's locale (en-GB). */
export async function pickCalendarDay(page: Page, day: Date) {
  await page
    .getByRole("button", { name: /next month/i })
    .first()
    .click();
  await page.locator(`button[data-day="${day.toLocaleDateString("en-GB")}"]`).click();
}

export async function requestCode(page: Page, details: { name: string; email: string }) {
  await page.goto("/");
  await page.getByLabel("Full name").fill(details.name);
  await page.getByLabel("Email").fill(details.email);
  await page.getByLabel("Mobile number").click();
  await page.keyboard.type("7700900123");
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();
}

export async function signInWithOtp(page: Page, details: { name: string; email: string }) {
  await requestCode(page, details);
  await page.getByLabel("Verification code").fill(await latestCode(details.email));
}

// ---------- test ----------

export const test = base.extend<{ resetBackend: void }>({
  resetBackend: [
    async ({}, use) => {
      await db.reset();
      await rm(OUTBOX_DIR, { recursive: true, force: true });
      await use();
    },
    { auto: true },
  ],
});

export { expect };
