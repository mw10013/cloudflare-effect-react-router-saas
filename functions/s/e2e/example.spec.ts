import { expect, test } from "@playwright/test";

/*
<h1 class="text-center text-6xl font-bold tracking-tighter md:text-8xl">SaaS</h1>
*/

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});

test("homepage has SaaS title", async ({ page }) => {
  await page.goto("/");

  // Expect the page to contain the heading 'SaaS'
  await expect(page.getByRole("heading", { name: "SaaS" })).toBeVisible();
});


