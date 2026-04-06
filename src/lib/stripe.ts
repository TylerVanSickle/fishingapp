import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
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
