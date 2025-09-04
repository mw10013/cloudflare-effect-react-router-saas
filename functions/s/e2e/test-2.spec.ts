import { expect, test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Sign in / Sign up" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign in / Sign up" }).click();
  await expect(
    page.getByRole("button", { name: "Send magic link" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("a@a.com");
  await page.getByRole("button", { name: "Send magic link" }).click();
  await expect(
    page.getByRole("link", { name: "http://localhost:5173/api/" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "http://localhost:5173/api/" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle sidebar" }),
  ).toBeVisible();
  await page.getByText("E2E").click();
  await expect(
    page.locator("div").filter({ hasText: /^Delete User$/ }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@e2e.com");
  await page.getByRole("button", { name: "Delete User" }).click();
  await page.getByRole("button", { name: "Delete User" }).click();

  // await expect(page.getByText('E2E')).toBeVisible();
  // await page.getByText('E2E').click();
  // await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  // await page.getByRole('textbox', { name: 'Email' }).click();
  // await page.getByRole('textbox', { name: 'Email' }).fill('e2e@e2e.com');
  // await page.getByRole('button', { name: 'Delete User' }).click();
});
