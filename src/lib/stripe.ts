import Stripe from "stripe";

// Lazily initialized so the build doesn't fail when STRIPE_SECRET_KEY isn't present
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    });
  }
  return _stripe;
}

// Keep named export for backwards compat — routes that import { stripe } still work
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    label: "Monthly",
    amount: "$9.99/mo",
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
    label: "Annual",
    amount: "$79.99/yr",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
