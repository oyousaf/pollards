import { test as base, expect, type Page } from "@playwright/test";

import { fromLondonTime } from "../../lib/slots";

const MOCK = "http://127.0.0.1:4010";
export const VALID_OTP = "123456";
export const ADMIN_PASSKEY = "2468";
export const CLINICIAN = "Keith Barton";

type MockState = {
  users: { $id: string; email: string; name: string; phone: string }[];
  rows: Record<string, Record<string, unknown>[]>;
  sms: { users: string[]; content: string }[];
};

export const mock = {
  reset: () => fetch(`${MOCK}/__reset`, { method: "POST" }),
  seed: (data: { users?: object[]; rows?: Record<string, object[]> }) =>
    fetch(`${MOCK}/__seed`, { method: "POST", body: JSON.stringify(data) }),
  state: (): Promise<MockState> => fetch(`${MOCK}/__state`).then((r) => r.json()),
};

/** First Tuesday of next month — always open and inside the 90-day booking window. */
export function nextMonthTuesday() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
  return d;
}

export const londonSlot = (day: Date, hour: number, minute = 0) =>
  fromLondonTime(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);

/** react-day-picker marks each day with data-day in the calendar's locale (en-GB). */
export async function pickCalendarDay(page: Page, day: Date) {
  await page
    .getByRole("button", { name: /next month/i })
    .first()
    .click();
  await page.locator(`button[data-day="${day.toLocaleDateString("en-GB")}"]`).click();
}

/** Seeds a registered, returning patient. */
export async function seedReturningPatient(email = "returning@example.com") {
  const userId = "user_returning";
  await mock.seed({
    users: [{ $id: userId, email, name: "Rita Returning", phone: "+447700900111" }],
    rows: {
      patients: [
        {
          $id: "patient_rita",
          userId,
          name: "Rita Returning",
          email,
          phone: "+447700900111",
          primaryPhysician: CLINICIAN,
        },
      ],
    },
  });
  return { userId, email };
}

export async function signInWithOtp(page: Page, details: { name: string; email: string }) {
  await page.goto("/");
  await page.getByLabel("Full name").fill(details.name);
  await page.getByLabel("Email").fill(details.email);
  await page.getByLabel("Mobile number").click();
  await page.keyboard.type("7700900123");
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();
  await page.getByLabel("Verification code").fill(VALID_OTP);
}

export const test = base.extend<{ resetBackend: void }>({
  resetBackend: [
    async ({}, use) => {
      await mock.reset();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
