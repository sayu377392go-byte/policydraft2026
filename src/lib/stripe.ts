import "server-only";
import Stripe from "stripe";
import type { PlanType } from "./constants";

let client: Stripe | null = null;

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY が設定されていません");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Stripe ダッシュボードで作成した Price の ID(月額 4,400円 / 年額 50,000円) */
export function priceIdFor(plan: PlanType) {
  const id = plan === "monthly" ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_YEARLY;
  if (!id) throw new Error(`Stripe の Price ID(${plan})が設定されていません`);
  return id;
}

export function planFromPriceId(priceId: string | undefined): PlanType | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId && priceId === process.env.STRIPE_PRICE_YEARLY) return "yearly";
  return null;
}
