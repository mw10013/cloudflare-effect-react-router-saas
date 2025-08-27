import { env } from "cloudflare:workers";
import Stripe from "stripe";


export function createStripe() {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
}