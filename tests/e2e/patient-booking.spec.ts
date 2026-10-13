import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { testEnv } from "../../playwright.config";

import {
  CLINICIAN,
  db,
  expect,
  latestCode,
  londonSlot,
  nextMonthTuesday,
  outbox,
  pickCalendarDay,
  requestCode,
  signInWithOtp,
  test,
} from "./fixtures";

// 1x1 transparent PNG — enough to exercise the ID document upload.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

test.describe("patient sign-in with email code", () => {
  test("rejects a wrong code, then signs a new patient in to registration", async ({ page }) => {
    await requestCode(page, { name: "Nina New", email: "nina.new@example.com" });
    await expect(page.getByText("ni•••@example.com")).toBeVisible();

    const code = await latestCode("nina.new@example.com");
    await page.getByLabel("Verification code").fill(code === "000000" ? "111111" : "000000");
    await expect(page.getByText("That code isn't right")).toBeVisible();

    await page.getByLabel("Verification code").fill(code);
    await expect(page).toHaveURL(/\/patients\/[0-9a-f-]{36}\/register$/);
    await expect(page.getByRole("heading", { name: /Welcome, Nina/ })).toBeVisible();

    const { rows } = await db.query(
      "SELECT name, phone, registered_at FROM patients WHERE email = $1",
      ["nina.new@example.com"]
    );
    expect(rows[0]).toMatchObject({
      name: "Nina New",
      phone: "+447700900123",
      registered_at: null,
    });
  });

  test("a sign-in code works only once", async ({ page, browser }) => {
    const { email } = await db.seedPatient();
    await signInWithOtp(page, { name: "Rita Returning", email });
    await expect(page).toHaveURL(/new-appointment$/);

    // Replaying the same code from another browser must fail.
    const code = await latestCode(email);
    const other = await (await browser.newContext()).newPage();
    await requestCode(other, { name: "Rita Returning", email });
    await other.getByLabel("Verification code").fill(code);
    await expect(other.getByText(/isn't right|expired/)).toBeVisible();
  });

  test("patient pages can't be opened without signing in", async ({ page }) => {
    const { id } = await db.seedPatient();
    await page.goto(`/patients/${id}/new-appointment`);
    await expect(page).toHaveURL("/");
  });
});

test.describe("registration", () => {
  test("completes the 4-step wizard and stores the ID document privately", async ({ page }) => {
    await signInWithOtp(page, { name: "Reg Ister", email: "reg@example.com" });
    await expect(page).toHaveURL(/\/register$/);

    // Step 1 — about you (email is locked to the verified address)
    await expect(page.getByLabel("Email")).toHaveAttribute("readonly", "");
    await page.getByRole("button", { name: "Date of birth" }).click();
    await page.getByLabel("Choose the Year").selectOption("1990");
    await page.getByLabel("Choose the Month").selectOption({ label: "May" });
    await page.getByRole("dialog").getByRole("button", { name: /15/ }).first().click();
    await page.getByText("Female", { exact: true }).click();
    await page.getByLabel("Home address").fill("12 Westgate, Wakefield WF1 1XX");
    await page.getByLabel("Occupation").fill("Teacher");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2 — health
    await page.getByLabel("Emergency contact").fill("Ed Emergency");
    await page.getByLabel("Their phone number").click();
    await page.keyboard.type("7700900999");
    await page.getByRole("radio", { name: CLINICIAN }).click();
    await page.getByLabel("Healthcare provider").fill("NHS");
    await page.getByLabel("NHS or policy number").fill("4857773456");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3 — identification
    await page.locator('input[type="file"]').setInputFiles({
      name: "passport.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });
    await expect(page.getByText("passport.png")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 4 — consent
    await page.getByText("I consent to receive eye care").click();
    await page.getByText("I consent to my health information").click();
    await page.getByText("I have read and agree").click();
    await page.getByRole("button", { name: "Complete registration" }).click();

    await expect(page).toHaveURL(/\/new-appointment$/);
    const { rows } = await db.query<{
      birth_date: Date;
      gender: string;
      primary_physician: string;
      identification_document: string;
      registered_at: Date | null;
    }>("SELECT * FROM patients WHERE email = $1", ["reg@example.com"]);
    expect(rows[0]).toMatchObject({ gender: "Female", primary_physician: CLINICIAN });
    expect(rows[0].registered_at).not.toBeNull();
    expect(rows[0].identification_document).toMatch(/\.png$/);
    expect(existsSync(resolve(testEnv.UPLOAD_DIR, rows[0].identification_document))).toBe(true);
  });
});

test.describe("booking an appointment", () => {
  test("greys out taken slots and books a free one", async ({ page }) => {
    const me = await db.seedPatient();
    const other = await db.seedPatient();
    const day = nextMonthTuesday();
    await db.seedAppointment({
      patientId: other.id,
      schedule: londonSlot(day, 10),
      status: "scheduled",
    });

    await signInWithOtp(page, { name: "Rita Returning", email: me.email });
    await expect(page).toHaveURL(`/patients/${me.id}/new-appointment`);

    await pickCalendarDay(page, day);
    await expect(page.getByRole("radio", { name: "10:00, already booked" })).toBeDisabled();
    await expect(page.getByText("Greyed-out times are already booked")).toBeVisible();

    await page.getByRole("radio", { name: "11:00", exact: true }).click();
    await page.getByRole("button", { name: "Eye examination" }).click();
    await page.getByRole("button", { name: "Request appointment" }).click();

    await expect(page.getByRole("heading", { name: /Request received/ })).toBeVisible();
    await expect(page.getByText("11:00")).toBeVisible();

    const { rows } = await db.query<{ status: string; primary_physician: string; schedule: Date }>(
      "SELECT status, primary_physician, schedule FROM appointments WHERE patient_id = $1",
      [me.id]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: "pending", primary_physician: CLINICIAN });
    expect(rows[0].schedule.toISOString()).toBe(londonSlot(day, 11).toISOString());
  });

  test("the database rejects a slot taken after the page loaded (race)", async ({ page }) => {
    const me = await db.seedPatient();
    const racer = await db.seedPatient();
    const day = nextMonthTuesday();

    await signInWithOtp(page, { name: "Rita Returning", email: me.email });
    await pickCalendarDay(page, day);
    await page.getByRole("radio", { name: "09:30", exact: true }).click();
    await page.getByRole("button", { name: "Eye examination" }).click();

    // Someone else grabs 09:30 while this patient is still on the page.
    await db.seedAppointment({ patientId: racer.id, schedule: londonSlot(day, 9, 30) });

    await page.getByRole("button", { name: "Request appointment" }).click();
    await expect(page.getByText("that time has just been booked")).toBeVisible();
    await expect(page).toHaveURL(`/patients/${me.id}/new-appointment`);
    const { rows } = await db.query("SELECT 1 FROM appointments WHERE patient_id = $1", [me.id]);
    expect(rows).toHaveLength(0);
  });

  test("switching clinician frees up their slots", async ({ page }) => {
    const me = await db.seedPatient();
    const other = await db.seedPatient();
    const day = nextMonthTuesday();
    await db.seedAppointment({ patientId: other.id, schedule: londonSlot(day, 10) });

    await signInWithOtp(page, { name: "Rita Returning", email: me.email });
    await pickCalendarDay(page, day);
    await expect(page.getByRole("radio", { name: "10:00, already booked" })).toBeDisabled();

    await page.getByRole("radio", { name: "Julia A. Haller" }).click();
    await expect(page.getByRole("radio", { name: "10:00", exact: true })).toBeEnabled();
  });

  test("a cancelled appointment frees its slot", async ({ page }) => {
    const me = await db.seedPatient();
    const other = await db.seedPatient();
    const day = nextMonthTuesday();
    await db.seedAppointment({
      patientId: other.id,
      schedule: londonSlot(day, 10),
      status: "cancelled",
    });

    await signInWithOtp(page, { name: "Rita Returning", email: me.email });
    await pickCalendarDay(page, day);
    await expect(page.getByRole("radio", { name: "10:00", exact: true })).toBeEnabled();
    expect((await outbox()).filter((m) => m.kind === "email")).toHaveLength(1); // just the code
  });
});
