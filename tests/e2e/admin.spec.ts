import type { Page } from "@playwright/test";

import { ADMIN_PASSKEY, db, expect, londonSlot, nextMonthTuesday, outbox, test } from "./fixtures";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Passkey").fill(ADMIN_PASSKEY);
  await expect(page).toHaveURL("/admin");
}

async function seedPending() {
  const patient = await db.seedPatient({ name: "Pat Pending", email: "pat@example.com" });
  const schedule = londonSlot(nextMonthTuesday(), 14);
  const id = await db.seedAppointment({
    patientId: patient.id,
    schedule,
    reason: "Contact lens fitting",
  });
  return { id, schedule };
}

test.describe("admin", () => {
  test("dashboard is protected by the 4-digit passcode", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin/login");

    const code = page.getByLabel("Passkey");
    await code.fill("1111");
    await expect(page.getByText("That passcode isn't right")).toBeVisible();

    await code.fill(ADMIN_PASSKEY);
    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("heading", { level: 1, name: "Appointments" })).toBeVisible();
  });

  test("confirms a pending appointment and notifies the patient", async ({ page }) => {
    const { id, schedule } = await seedPending();
    await signIn(page);

    const row = page.getByRole("row", { name: /Pat Pending/ });
    await expect(row).toContainText("Pending");
    await row.getByRole("button", { name: "Confirm" }).click();
    await page.getByRole("button", { name: "Confirm & notify" }).click();

    await expect(page.getByText("Appointment confirmed")).toBeVisible();
    await expect(row).toContainText("Scheduled");

    const { rows } = await db.query<{ status: string; schedule: Date }>(
      "SELECT status, schedule FROM appointments WHERE id = $1",
      [id]
    );
    expect(rows[0].status).toBe("scheduled");
    expect(rows[0].schedule.toISOString()).toBe(schedule.toISOString());

    const sent = await outbox();
    expect(sent).toContainEqual(
      expect.objectContaining({
        kind: "email",
        to: "pat@example.com",
        subject: expect.stringContaining("confirmed"),
      })
    );
    expect(sent).toContainEqual(expect.objectContaining({ kind: "sms", to: "+447700900111" }));
  });

  test("cancels with a reason and frees the slot", async ({ page }) => {
    const { id } = await seedPending();
    await signIn(page);

    const row = page.getByRole("row", { name: /Pat Pending/ });
    await row.getByRole("button", { name: /Actions for Pat Pending/ }).click();
    await page.getByRole("menuitem", { name: "Cancel" }).click();
    await page.getByLabel("Reason").fill("Optometrist unavailable");
    await page.getByRole("button", { name: "Cancel & notify" }).click();

    await expect(page.getByText("Appointment cancelled")).toBeVisible();
    await expect(row).toContainText("Cancelled");

    const { rows } = await db.query(
      "SELECT status, cancellation_reason FROM appointments WHERE id = $1",
      [id]
    );
    expect(rows[0]).toMatchObject({
      status: "cancelled",
      cancellation_reason: "Optometrist unavailable",
    });
    const email = (await outbox()).find((m) => m.kind === "email");
    expect(email).toMatchObject({ subject: expect.stringContaining("cancelled") });
    expect(email && "text" in email && email.text).toContain("Optometrist unavailable");
  });

  test("signing out ends the session", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin/login");
  });
});
