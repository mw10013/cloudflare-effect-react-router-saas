import type { Stripe as StripeType } from "stripe";
import { env } from "cloudflare:workers";
import Stripe from "stripe";

export function createStripe() {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });

  const getPrices = async () => {
    const LOOKUP_KEYS = ["basic", "pro"];
    const prices = await stripe.prices.list({
      lookup_keys: LOOKUP_KEYS,
      limit: 2,
    });
    return prices.data;
  };

  return {
    stripe,
  };
}

export async function ensurePrice({
  stripe,
  lookup_key,
  unit_amount,
}: {
  stripe: StripeType;
  lookup_key: string;
  unit_amount: number;
}): Promise<StripeType.Price> {
  const list = await stripe.prices.list({
    lookup_keys: [lookup_key],
    limit: 1,
  });
  if (list.data[0]) {
    return list.data[0];
  } else {
    const name = lookup_key.charAt(0).toUpperCase() + lookup_key.slice(1);
    const product = await stripe.products.create({
      name,
      description: `${name} subscription plan`,
    });
    return await stripe.prices.create({
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
}
