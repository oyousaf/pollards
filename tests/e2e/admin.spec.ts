import {
  ADMIN_PASSKEY,
  CLINICIAN,
  expect,
  londonSlot,
  mock,
  nextMonthTuesday,
  test,
} from "./fixtures";

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

  test("confirms a pending appointment and texts the patient", async ({ page }) => {
    const schedule = londonSlot(nextMonthTuesday(), 14).toISOString();
    await mock.seed({
      users: [
        { $id: "user_pat", email: "pat@example.com", name: "Pat Pending", phone: "+447700900333" },
      ],
      rows: {
        patients: [{ $id: "patient_pat", userId: "user_pat", name: "Pat Pending" }],
        appointments: [
          {
            $id: "appt_1",
            userId: "user_pat",
            patient: "patient_pat",
            primaryPhysician: CLINICIAN,
            schedule,
            status: "pending",
            reason: "Contact lens fitting",
          },
        ],
      },
    });

    await page.goto("/admin/login");
    await page.getByLabel("Passkey").fill(ADMIN_PASSKEY);
    await expect(page).toHaveURL("/admin");

    const row = page.getByRole("row", { name: /Pat Pending/ });
    await expect(row).toContainText("Pending");
    await row.getByRole("button", { name: "Confirm" }).click();
    await page.getByRole("button", { name: "Confirm & notify" }).click();

    await expect(page.getByText("Appointment confirmed")).toBeVisible();
    await expect(row).toContainText("Scheduled");

    const state = await mock.state();
    expect(state.rows.appointments[0]).toMatchObject({ status: "scheduled", schedule });
    expect(state.sms).toHaveLength(1);
    expect(state.sms[0].users).toEqual(["user_pat"]);
    expect(state.sms[0].content).toContain("confirmed");
  });

  test("signing out ends the session", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Passkey").fill(ADMIN_PASSKEY);
    await expect(page).toHaveURL("/admin");

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/admin");
    await expect(page).toHaveURL("/admin/login");
  });
});
