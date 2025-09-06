# Plan Domain Object

## Goal

The goal is to have a plan domain object that contains the data of a saas subscription plan.
Auth would use it to derive the plans for the better-auth stripe plugin.
Pricing page would jse it to derive the pricing UI.

## Requirements

- Lives in `domain.ts` and defined as a zod schema and type.
- Shape is 

```
{
  name: string;
  monthlyPriceId: string;
  annualPriceId: string;
  freeTrialInDays: number;
}
```
- There are two plans: `basic` and `pro`.
- Each plan has two prices: `monthly` and `annual`.
- Stripe lookup keys for the prices are `basicMonthly`, `basicAnnual`, `proMonthly`, `proAnnual`.
- `freeTrialInDays` applies per plan.
- `stripe-service.ts` has `getPlans` that returns an array of `Plan` ordered by `name` ascending.
- `getPlans` caches the plans in Cloudflare KV using key `"stripe:plans"`.
- On cache miss, `getPlans` fetches prices from Stripe by lookup keys `["basicMonthly", "basicAnnual", "proMonthly", "proAnnual"]` with `expand: ["data.product"]`, then constructs and returns `Plan` objects.
- `auth.ts` uses `getPlans` to generate plans for the better-auth stripe plugin, mapping `Plan` to better-auth format (e.g., `priceId: monthlyPriceId`, `annualDiscountPriceId: annualPriceId`, `freeTrial: { days: freeTrialInDays }`).
- `_mkt.pricing.tsx` uses `getPlans` to generate the UI for pricing.
  - Use separate buttons for monthly/annual with `name="intent"` and values like `"basicMonthly"`, `"basicAnnual"`, etc.
  - Include `data-testid` attributes like `data-testid="proAnnual"`.
  - Action parses `intent` to extract plan name and annual flag (e.g., `"basicMonthly"` → plan: `"basic"`, annual: `false`).
- `ensureBillingPortalConfiguration` in `stripe-service.ts` uses the four prices from `getPlans` to configure the billing portal.
- `stripe.spec.ts` tests that `getPlans` returns the correct four prices with expected lookup keys and IDs.

## Research

### Better-Auth Stripe Plugin
- Plans are defined with `name`, `priceId`, optional `annualDiscountPriceId`, optional `limits`, optional `freeTrial: { days: number }`.
- Supports static plans array or dynamic async function returning plans.
- Upgrade API accepts `annual: boolean` to switch between monthly and annual prices.
- For UI, separate buttons can be used with intent parsing to set `annual` flag.
- Customer creation and webhook handling are built-in.

### Stripe API
- Prices can be created with `lookup_key` for easy retrieval.
- `prices.list({ lookup_keys: [...], expand: ["data.product"] })` fetches prices by lookup keys.
- Lookup keys must be unique per price.

### Cloudflare KV
- Used for caching with keys like `"stripe:prices"` or `"stripe:plans"`.
- Cache miss handling: fetch from Stripe, store in KV, return data.

### Current Implementation Gaps
- `stripe-service.ts` currently has `getPrices` for two prices (`"basic"`, `"pro"`); needs refactoring to `getPlans` for four prices.
- `auth.ts` uses `getPrices`; needs update to `getPlans` with mapping.
- `_mkt.pricing.tsx` uses `getPrices`; needs update to `getPlans` with intent parsing.
- `ensureBillingPortalConfiguration` uses two prices; needs four.
- `stripe.spec.ts` does not exist; needs creation.

## Plan
