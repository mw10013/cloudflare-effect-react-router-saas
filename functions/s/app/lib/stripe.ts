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

export function createStripe() {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });

  const getPrices = async (): Promise<PriceWithLookupKey[]> => {
    const priceData = [
      { lookup_key: "basic", unit_amount: 5000 }, // $50 in cents
      { lookup_key: "pro", unit_amount: 10000 }, // $100 in cents
    ];

    const priceList = await stripe.prices.list({
      lookup_keys: priceData.map((p) => p.lookup_key),
      expand: ["data.product"],
    });
    if (priceList.data.length === 0) {
      return await Promise.all(
        priceData.map(async ({ lookup_key, unit_amount }) => {
          const name = lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1);
          const product = await stripe.products.create({
            name,
            description: `${name} subscription plan`,
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

  return {
    stripe,
    getPrices,
  };
}

/*

  const ensurePrice = async (
    lookup_key: string,
    unit_amount: number,
  ): Promise<StripeType.Price> => {
    const list = await stripe.stripe.prices.list({
      lookup_keys: [lookup_key],
      limit: 1,
    });
    if (list.data[0]) {
      return list.data[0];
    } else {
      const name = lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1);
      const product = await stripe.stripe.products.create({
        name,
        description: `${name} subscription plan`,
      });
      return await stripe.stripe.prices.create({
        product: product.id,
        unit_amount,
        currency: "usd",
        recurring: {
          interval: "month",
          trial_period_days: 7,
        },
        lookup_key,
      });
    }
  };

  */
