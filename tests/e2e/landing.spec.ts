import { expect, test } from "./fixtures";

test.describe("landing page", () => {
  test("shows the quote heading and short footer @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Visionaries see beyond the boundaries of eyesight/,
      })
    ).toBeVisible();
    await expect(
      page.getByText(`© ${new Date().getFullYear()} Pollards`, { exact: true })
    ).toBeVisible();
    await expect(page.getByText("Pollards Opticians, Wakefield")).toHaveCount(0);
  });

  test("validates details before sending a code", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Get started" }).click();
    await expect(page.getByText("Please enter at least 2 characters")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("sends security headers and keeps private areas out of search", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-powered-by"]).toBeUndefined();

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /patients");
  });
});
