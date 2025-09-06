import { expect, test } from "@playwright/test";

[
  { email: "stripe-basic@e2e.com", getStartedIndex: 0 },
  { email: "stripe-pro@e2e.com", getStartedIndex: 1 },
].forEach(({ email, getStartedIndex }) => {
  test(`subscribe with ${email}`, async ({ page, request }) => {
    const response = await request.post(`/api/e2e/delete/user/${email}`);
    expect(response.ok()).toBe(true);

    await page.goto("/login");
    await page.getByRole("textbox", { name: "Email" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill(email);
    await page.getByRole("button", { name: "Send magic link" }).click();
    await page
      .getByRole("link", { name: "http://localhost:5173/api/" })
      .click();
    await page.getByRole("link", { name: "Home" }).click();
    await page.getByRole("link", { name: "Pricing" }).click();
    await page
      .getByRole("button", { name: "Get Started" })
      .nth(getStartedIndex)
      .click();

    // Force click needed as normal click fails due to element interception
    await page
      .locator("#payment-method-accordion-item-title-card")
      .click({ force: true });

    await page.getByRole("textbox", { name: "Card number" }).click();
    await page
      .getByRole("textbox", { name: "Card number" })
      .fill("4242 4242 4242 4242");
    await page.getByRole("textbox", { name: "Expiration" }).click();
    await page.getByRole("textbox", { name: "Expiration" }).fill("12 / 34");
    await page.getByRole("textbox", { name: "CVC" }).click();
    await page.getByRole("textbox", { name: "CVC" }).fill("123");
    await page.getByRole("textbox", { name: "Cardholder name" }).click();
    await page.getByRole("textbox", { name: "Cardholder name" }).fill(email);
    await page.getByRole("textbox", { name: "ZIP" }).click();
    await page.getByRole("textbox", { name: "ZIP" }).fill("12341");
    await page
      .getByRole("checkbox", { name: "Save my information for" })
      .uncheck();
    await page.getByTestId("hosted-payment-submit-button").click();

    await expect(
      page.getByRole("button", { name: email, exact: true }),
    ).toBeVisible({ timeout: 60000 });
  });
});
