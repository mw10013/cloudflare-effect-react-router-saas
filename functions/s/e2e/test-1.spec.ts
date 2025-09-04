import { expect, test } from "@playwright/test";

test("sign in and sign out", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sign in / Sign up" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@e2e.com");
  await page.getByRole("textbox", { name: "Email" }).press("Enter");
  await page.getByRole("link", { name: "magic-link" }).click();
  await expect(
    page.getByRole("button", { name: "e2e@e2e.com", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in / Sign up" }),
  ).toBeVisible();
});


