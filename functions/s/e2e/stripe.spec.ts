import type { APIRequestContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { planData } from "../app/lib/domain";

const emailPrefix = "stripe-";

test.describe("subscribe", () => {
  planData
    .flatMap((plan) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
      },
      {
        email: `${emailPrefix}${plan.annualPriceLookupKey.toLowerCase()}@e2e.com`,
        intent: plan.annualPriceLookupKey,
        planName: plan.name,
      },
    ])
    .forEach(({ email, intent, planName }) => {
      test(`${intent} for ${email}`, async ({ page, request, baseURL }) => {
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
        await page.getByTestId(intent).click();

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
        await page
          .getByRole("textbox", { name: "Cardholder name" })
          .fill(email);
        await page.getByRole("textbox", { name: "ZIP" }).click();
        await page.getByRole("textbox", { name: "ZIP" }).fill("12341");
        await page
          .getByRole("checkbox", { name: "Save my information for" })
          .uncheck();
        await page.getByTestId("hosted-payment-submit-button").click();

        await page.waitForURL(`${baseURL}**`);
        await page.getByTestId("sidebar-billing").click();
        await page.waitForURL(/billing/);

        await expect(async () => {
          await page.reload();
          await expect(page.getByTestId("active-plan")).toContainText(
            `${planName}`,
            { ignoreCase: true, timeout: 500 },
          );
          await expect(page.getByTestId("active-status")).toContainText(
            "trialing",
            { ignoreCase: true, timeout: 500 },
          );
        }).toPass({ timeout: 60_000 });
      });
    });
});

test.describe("subscribe/cancel", () => {
  planData
    .flatMap((plan) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}-cancel@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
      },
      {
        email: `${emailPrefix}${plan.annualPriceLookupKey.toLowerCase()}-cancel@e2e.com`,
        intent: plan.annualPriceLookupKey,
        planName: plan.name,
      },
    ])
    .forEach(({ email, intent, planName }) => {
      test(`${intent} for ${email}`, async ({ page, request, baseURL }) => {
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
        await page.getByTestId(intent).click();

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
        await page
          .getByRole("textbox", { name: "Cardholder name" })
          .fill(email);
        await page.getByRole("textbox", { name: "ZIP" }).click();
        await page.getByRole("textbox", { name: "ZIP" }).fill("12341");
        await page
          .getByRole("checkbox", { name: "Save my information for" })
          .uncheck();
        await page.getByTestId("hosted-payment-submit-button").click();

        await page.waitForURL(`${baseURL}**`);
        await page.getByTestId("sidebar-billing").click();
        await page.waitForURL(/billing/);

        await expect(async () => {
          await page.reload();
          await expect(page.getByTestId("active-plan")).toContainText(
            `${planName}`,
            { ignoreCase: true, timeout: 500 },
          );
          await expect(page.getByTestId("active-status")).toContainText(
            "trialing",
            { ignoreCase: true, timeout: 500 },
          );
        }).toPass({ timeout: 60_000 });

        await page.getByRole("button", { name: "Cancel Subscription" }).click();
        await page.getByTestId("confirm").click();
        await page.getByTestId("return-to-business-link").click();

        await page.waitForURL(`${baseURL}**`);
        await expect(async () => {
          await page.reload();
          expect(page.getByText("No active subscription for")).toBeVisible({
            timeout: 500,
          });
        }).toPass({ timeout: 60_000 });
      });
    });
});

test.describe("subscribe pom", () => {
  planData
    .flatMap((plan) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
      },
      {
        email: `${emailPrefix}${plan.annualPriceLookupKey.toLowerCase()}@e2e.com`,
        intent: plan.annualPriceLookupKey,
        planName: plan.name,
      },
    ])
    .forEach(({ email, intent, planName }) => {
      test(`${intent} for ${email}`, async ({ page, request, baseURL }) => {
        const pom = new StripePom(page);

        await pom.deleteUser(request, email);
        await pom.login(email);
        await pom.navigateToPricing();
        await pom.selectPlan(intent);
        await pom.fillPaymentForm(email);
        await pom.submitPayment();
        await pom.goToBilling(baseURL);
        await pom.verifySubscription(planName);
      });
    });
});

test.describe("subscribe/cancel pom", () => {
  planData
    .flatMap((plan) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}-cancel@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
      },
      {
        email: `${emailPrefix}${plan.annualPriceLookupKey.toLowerCase()}-cancel@e2e.com`,
        intent: plan.annualPriceLookupKey,
        planName: plan.name,
      },
    ])
    .forEach(({ email, intent, planName }) => {
      test(`${intent} for ${email}`, async ({ page, request, baseURL }) => {
        const pom = new StripePom(page);

        await pom.deleteUser(request, email);
        await pom.login(email);
        await pom.navigateToPricing();
        await pom.selectPlan(intent);
        await pom.fillPaymentForm(email);
        await pom.submitPayment();
        await pom.goToBilling(baseURL);
        await pom.verifySubscription(planName);
        await pom.cancelSubscription(baseURL);
      });
    });
});

class StripePom {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async deleteUser(request: APIRequestContext, email: string) {
    const response = await request.post(`/api/e2e/delete/user/${email}`);
    expect(response.ok()).toBe(true);
  }

  async login(email: string) {
    await this.page.goto("/login");
    await this.page.getByRole("textbox", { name: "Email" }).click();
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
    await this.page.getByRole("button", { name: "Send magic link" }).click();
    await this.page
      .getByRole("link", { name: "http://localhost:5173/api/" })
      .click();
  }

  async navigateToPricing() {
    await this.page.getByRole("link", { name: "Home" }).click();
    await this.page.getByRole("link", { name: "Pricing" }).click();
  }

  async selectPlan(intent: string) {
    await this.page.getByTestId(intent).click();
  }

  async fillPaymentForm(email: string) {
    // Force click needed as normal click fails due to element interception
    await this.page
      .locator("#payment-method-accordion-item-title-card")
      .click({ force: true });

    await this.page.getByRole("textbox", { name: "Card number" }).click();
    await this.page
      .getByRole("textbox", { name: "Card number" })
      .fill("4242 4242 4242 4242");
    await this.page.getByRole("textbox", { name: "Expiration" }).click();
    await this.page
      .getByRole("textbox", { name: "Expiration" })
      .fill("12 / 34");
    await this.page.getByRole("textbox", { name: "CVC" }).click();
    await this.page.getByRole("textbox", { name: "CVC" }).fill("123");
    await this.page.getByRole("textbox", { name: "Cardholder name" }).click();
    await this.page
      .getByRole("textbox", { name: "Cardholder name" })
      .fill(email);
    await this.page.getByRole("textbox", { name: "ZIP" }).click();
    await this.page.getByRole("textbox", { name: "ZIP" }).fill("12341");
    await this.page
      .getByRole("checkbox", { name: "Save my information for" })
      .uncheck();
  }

  async submitPayment() {
    await this.page.getByTestId("hosted-payment-submit-button").click();
  }

  async goToBilling(baseURL?: string) {
    await this.page.waitForURL(`${baseURL!}**`);
    await this.page.getByTestId("sidebar-billing").click();
    await this.page.waitForURL(/billing/);
  }

  async verifySubscription(planName: string) {
    await expect(async () => {
      await this.page.reload();
      await expect(this.page.getByTestId("active-plan")).toContainText(
        `${planName}`,
        { ignoreCase: true, timeout: 500 },
      );
      await expect(this.page.getByTestId("active-status")).toContainText(
        "trialing",
        { ignoreCase: true, timeout: 500 },
      );
    }).toPass({ timeout: 60_000 });
  }

  async cancelSubscription(baseURL?: string) {
    await this.page
      .getByRole("button", { name: "Cancel Subscription" })
      .click();
    await this.page.getByTestId("confirm").click();
    await this.page.getByTestId("return-to-business-link").click();

    await this.page.waitForURL(`${baseURL!}**`);
    await expect(async () => {
      await this.page.reload();
      expect(this.page.getByText("No active subscription for")).toBeVisible({
        timeout: 500,
      });
    }).toPass({ timeout: 60_000 });
  }
}
