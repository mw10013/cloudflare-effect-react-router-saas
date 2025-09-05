import type { Stripe as StripeType } from "stripe";
import { invariant } from "@epic-web/invariant";
import { env } from "cloudflare:workers";
import Stripe from "stripe";

type Price = StripeType.Price;
type PriceWithLookupKey = Price & { lookup_key: string };
const isPriceWithLookupKey = (p: Price): p is PriceWithLookupKey =>
  p.lookup_key !== null;
function assertPriceWithLookupKey(p: Price): asserts p is PriceWithLookupKey {
  invariant(p.lookup_key !== null, "Missing lookup_key");
}

export type StripeService = ReturnType<typeof createStripeService>;

export function createStripeService() {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });

  const getPrices = async (): Promise<PriceWithLookupKey[]> => {
    const key = "stripe:prices";
    const cachedPrices = await env.KV.get(key, { type: "json" });
    if (cachedPrices) {
      // console.log(`stripeService: getPrices: cache hit`);
      return cachedPrices as PriceWithLookupKey[];
    }
    console.log(`stripeService: getPrices: cache miss`);
    const priceData = [
      { lookup_key: "basic", unit_amount: 5000 }, // $50 in cents
      { lookup_key: "pro", unit_amount: 10000 }, // $100 in cents
    ];
    const _getPrices = async (): Promise<PriceWithLookupKey[]> => {
      const priceList = await stripe.prices.list({
        lookup_keys: priceData.map((p) => p.lookup_key),
        expand: ["data.product"],
      });
      if (priceList.data.length === 0) {
        return await Promise.all(
          priceData.map(async ({ lookup_key, unit_amount }) => {
            const name =
              lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1);
            const product = await stripe.products.create({
              name,
              description: `${name} plan`,
            });
            const { lastResponse: _lr, ...price } = await stripe.prices.create({
              product: product.id,
              unit_amount,
              currency: "usd",
              recurring: { interval: "month" },
              lookup_key,
              expand: ["product"],
            });
            assertPriceWithLookupKey(price);
            return price;
          }),
        );
      } else {
        const prices = priceList.data
          .filter(isPriceWithLookupKey)
          .sort((a, b) => a.lookup_key.localeCompare(b.lookup_key));
        invariant(
          prices.length === 2,
          `Count of prices not 2 (${prices.length})`,
        );
        return prices;
      }
    };

    const prices = await _getPrices();
    await env.KV.put(key, JSON.stringify(prices));
    return prices;
  };

  const ensureBillingPortalConfiguration = async (): Promise<void> => {
    const key = "stripe:isBillingPortalConfigured";
    const isConfigured = await env.KV.get(key);
    if (isConfigured === "true") return;
    const configurations = await stripe.billingPortal.configurations.list({
      limit: 2,
    });
    if (configurations.data.length === 0) {
      const [basicPrice, proPrice] = await getPrices();
      await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Manage your subscription and billing information",
        },
        features: {
          customer_update: {
            enabled: true,
            allowed_updates: ["name", "phone"],
          },
          invoice_history: {
            enabled: true,
          },
          payment_method_update: {
            enabled: true,
          },
          // Allow immediate cancellation with prorated refunds for unused time
          subscription_cancel: {
            enabled: true,
            mode: "immediately",
            proration_behavior: "create_prorations",
          },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ["price"],
            proration_behavior: "create_prorations",
            products: [
              {
                product:
                  typeof basicPrice.product === "string"
                    ? basicPrice.product
                    : basicPrice.product.id,
                prices: [basicPrice.id],
              },
              {
                product:
                  typeof proPrice.product === "string"
                    ? proPrice.product
                    : proPrice.product.id,
                prices: [proPrice.id],
              },
            ],
          },
        },
      });
      console.log(
        `stripeService: ensureBillingPortalConfiguration: created billing portal configuration`,
      );
    } else {
      if (configurations.data.length > 1) {
        console.log(
          "WARNING: More than 1 billing portal configuration found. Should not be more than 1.",
        );
      }
      await env.KV.put(key, "true");
    }
  };

  return {
    stripe,
    getPrices,
    ensureBillingPortalConfiguration,
  };
}
