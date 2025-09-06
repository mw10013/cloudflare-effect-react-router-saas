import { expect, test } from "@playwright/test";

test.skip("sandbox delete e2e@e2e.com", async ({ page }) => {
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
  await page.waitForURL("**/admin**");
  await expect(page.getByText("E2E")).toBeVisible();
  await page.getByText("E2E").click();
  await expect(
    page.locator("div").filter({ hasText: /^Delete User$/ }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@e2e.com");
  await expect(page.getByRole("button", { name: "Delete User" })).toBeVisible();
  await page.getByRole("button", { name: "Delete User" }).click();
  await expect(page.getByRole("button", { name: "Delete User" })).toBeVisible();
  await page.getByRole("button", { name: "Delete User" }).click();

  // await expect(page.getByText('User e2e@e2e.com not found.')).toBeVisible();
  await expect(
    page
      .getByText("User e2e@e2e.com not found.")
      .or(page.getByText("Deleted user")),
  ).toBeVisible();

  await page.getByText("SaaS").click();
  await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(
    page.getByRole("link", { name: "Sign in / Sign up" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign in / Sign up" }).click();
  await expect(page.getByText("Sign in / Sign up")).toBeVisible();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@e2e.com");
  await page.getByRole("button", { name: "Send magic link" }).click();
  await expect(
    page.getByRole("link", { name: "http://localhost:5173/api/" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "http://localhost:5173/api/" }).click();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await page.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible();
  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(page.getByText("basic")).toBeVisible();

  // await page.locator('[id="react-aria7639635937-«r2»"]').click();
  await page.getByRole("button", { name: "Get Started" }).first().click();

  // Wait for the animation to finish after clicking Get Started
  await page.waitForTimeout(2000);

  await expect(
    page.getByRole("heading", { name: "Payment method" }),
  ).toBeVisible();

  // Debug: Take screenshot to see the page state
  // await page.screenshot({ path: "debug-payment-form.png" });

  // Wait for the "Card" text to ensure the form is loaded
  await page.getByText("Card").waitFor();

  // Wait for the animation to finish
  await page.waitForTimeout(2000);

  // Use JavaScript to click the accordion button to expand the card form
  await page.evaluate(() => {
    const button = document.querySelector(
      "[data-testid='card-accordion-item-button']",
    ) as HTMLElement;
    if (button) button.click();
  });

  await expect(page.getByText("Card information")).toBeVisible();
  await page.getByRole("textbox", { name: "Card number" }).click();
  await page
    .getByRole("textbox", { name: "Card number" })
    .fill("4242 4242 4242 4242");
  await page.getByRole("textbox", { name: "Expiration" }).click();
  await page.getByRole("textbox", { name: "Expiration" }).fill("12 / 34");
  await page.getByRole("textbox", { name: "CVC" }).click();
  await page.getByRole("textbox", { name: "CVC" }).fill("123");
  await page.getByRole("textbox", { name: "Cardholder name" }).click();
  await page.getByRole("textbox", { name: "Cardholder name" }).fill("e2e");
  await page.getByRole("textbox", { name: "ZIP" }).click();
  await page.getByRole("textbox", { name: "ZIP" }).fill("12341");
  await page
    .getByRole("checkbox", { name: "Save my information for" })
    .uncheck();
  await expect(page.getByTestId("hosted-payment-submit-button")).toBeVisible();
  await page.getByTestId("hosted-payment-submit-button").click();
});

test("delete e2e@e2e.com", async ({ page, request }) => {
  const response = await request.post("/api/e2e/delete/user/e2e@e2e.com");
  expect(response.ok()).toBe(true);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@e2e.com");
  await page.getByRole("button", { name: "Send magic link" }).click();
  await page.getByRole("link", { name: "http://localhost:5173/api/" }).click();
  await page.getByRole("link", { name: "Home" }).click();
  await page.getByRole("link", { name: "Pricing" }).click();
  await page.getByRole("button", { name: "Get Started" }).first().click();

  // Force click needed as normal click fails due to element interception
  await page
    .locator("#payment-method-accordion-item-title-card")
    .click({ force: true });

  // await expect(page.getByText("Card information")).toBeVisible();

  await page.getByRole("textbox", { name: "Card number" }).click();
  await page
    .getByRole("textbox", { name: "Card number" })
    .fill("4242 4242 4242 4242");
  await page.getByRole("textbox", { name: "Expiration" }).click();
  await page.getByRole("textbox", { name: "Expiration" }).fill("12 / 34");
  await page.getByRole("textbox", { name: "CVC" }).click();
  await page.getByRole("textbox", { name: "CVC" }).fill("123");
  await page.getByRole("textbox", { name: "Cardholder name" }).click();
  await page.getByRole("textbox", { name: "Cardholder name" }).fill("e2e");
  await page.getByRole("textbox", { name: "ZIP" }).click();
  await page.getByRole("textbox", { name: "ZIP" }).fill("12341");
  await page
    .getByRole("checkbox", { name: "Save my information for" })
    .uncheck();
  await page.getByTestId("hosted-payment-submit-button").click();

  await expect(
    page.getByRole("button", { name: "e2e@e2e.com", exact: true }),
  ).toBeVisible({ timeout: 60000 });
});
