import {
  CLINICIAN,
  expect,
  londonSlot,
  mock,
  nextMonthTuesday,
  pickCalendarDay,
  seedReturningPatient,
  signInWithOtp,
  test,
} from "./fixtures";

test.describe("patient sign-in with email code", () => {
  test("rejects a wrong code, then signs a new patient in to registration", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Full name").fill("Nina New");
    await page.getByLabel("Email").fill("nina.new@example.com");
    await page.getByLabel("Mobile number").click();
    await page.keyboard.type("7700900222");
    await page.getByRole("button", { name: "Get started" }).click();

    await expect(page.getByText("ni•••@example.com")).toBeVisible();

    await page.getByLabel("Verification code").fill("000000");
    await expect(page.getByText("That code isn't right or has expired")).toBeVisible();

    await page.getByLabel("Verification code").fill("123456");
    await expect(page).toHaveURL(/\/patients\/[^/]+\/register$/);
    await expect(page.getByRole("heading", { name: /Welcome, Nina/ })).toBeVisible();

    // The new account was given the name and phone from step 1.
    const user = (await mock.state()).users.find((u) => u.email === "nina.new@example.com");
    expect(user).toMatchObject({ name: "Nina New", phone: "+447700900222" });
  });

  test("patient pages can't be opened without signing in", async ({ page }) => {
    await seedReturningPatient();
    await page.goto("/patients/user_returning/new-appointment");
    await expect(page).toHaveURL("/");
  });
});

test.describe("booking an appointment", () => {
  test("greys out taken slots and books a free one", async ({ page }) => {
    const { userId, email } = await seedReturningPatient();
    const day = nextMonthTuesday();
    await mock.seed({
      rows: {
        appointments: [
          {
            userId: "someone_else",
            patient: "patient_other",
            primaryPhysician: CLINICIAN,
            schedule: londonSlot(day, 10).toISOString(),
            status: "scheduled",
            reason: "Eye examination",
          },
        ],
      },
    });

    await signInWithOtp(page, { name: "Rita Returning", email });
    await expect(page).toHaveURL(`/patients/${userId}/new-appointment`);

    await pickCalendarDay(page, day);
    await expect(page.getByRole("radio", { name: "10:00, already booked" })).toBeDisabled();
    await expect(page.getByText("Greyed-out times are already booked")).toBeVisible();

    await page.getByRole("radio", { name: "11:00", exact: true }).click();
    await page.getByRole("button", { name: "Eye examination" }).click();
    await page.getByRole("button", { name: "Request appointment" }).click();

    await expect(page.getByRole("heading", { name: /Request received/ })).toBeVisible();
    await expect(page.getByText("11:00")).toBeVisible();

    const created = (await mock.state()).rows.appointments.find((a) => a.userId === userId);
    expect(created).toMatchObject({
      status: "pending",
      primaryPhysician: CLINICIAN,
      schedule: londonSlot(day, 11).toISOString(),
    });
  });

  test("server rejects a slot taken after the page loaded (race)", async ({ page }) => {
    const { userId, email } = await seedReturningPatient();
    const day = nextMonthTuesday();

    await signInWithOtp(page, { name: "Rita Returning", email });
    await pickCalendarDay(page, day);
    await page.getByRole("radio", { name: "09:30", exact: true }).click();
    await page.getByRole("button", { name: "Eye examination" }).click();

    // Someone else grabs 09:30 while this patient is still on the page.
    await mock.seed({
      rows: {
        appointments: [
          {
            userId: "racer",
            patient: "p",
            primaryPhysician: CLINICIAN,
            schedule: londonSlot(day, 9, 30).toISOString(),
            status: "pending",
            reason: "Eye examination",
          },
        ],
      },
    });

    await page.getByRole("button", { name: "Request appointment" }).click();
    await expect(page.getByText("that time has just been booked")).toBeVisible();
    await expect(page).toHaveURL(`/patients/${userId}/new-appointment`);
    const mine = (await mock.state()).rows.appointments.filter((a) => a.userId === userId);
    expect(mine).toHaveLength(0);
  });

  test("switching clinician frees up their slots", async ({ page }) => {
    const { email } = await seedReturningPatient();
    const day = nextMonthTuesday();
    await mock.seed({
      rows: {
        appointments: [
          {
            userId: "x",
            patient: "y",
            primaryPhysician: CLINICIAN,
            schedule: londonSlot(day, 10).toISOString(),
            status: "pending",
            reason: "Eye examination",
          },
        ],
      },
    });

    await signInWithOtp(page, { name: "Rita Returning", email });
    await pickCalendarDay(page, day);
    await expect(page.getByRole("radio", { name: "10:00, already booked" })).toBeDisabled();

    await page.getByRole("radio", { name: "Julia A. Haller" }).click();
    await expect(page.getByRole("radio", { name: "10:00", exact: true })).toBeEnabled();
  });
});
