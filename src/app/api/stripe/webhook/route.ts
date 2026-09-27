import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Stripe Webhook: 決済完了・更新・解約に合わせてサブスクリプションの状態を更新する(要件 3.4 ②-1)
 * 受け付けるイベント: checkout.session.completed / customer.subscription.updated / customer.subscription.deleted
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new NextResponse("missing signature", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new NextResponse("invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && typeof session.subscription === "string") {
        await syncSubscription(await stripe.subscriptions.retrieve(session.subscription));
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}

function mapStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "active" as const;
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "unpaid" as const;
    default:
      return "inactive" as const;
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const politicianId = sub.metadata.politician_id;
  if (!politicianId) return;
  const item = sub.items.data[0];
  const periodEnd = item?.current_period_end;

  await createServiceClient()
    .from("subscriptions")
    .upsert({
      politician_id: politicianId,
      plan_type: planFromPriceId(item?.price.id) ?? (sub.metadata.plan as "monthly" | "yearly" | undefined) ?? null,
      payment_method: "stripe",
      status: mapStatus(sub.status),
      period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      updated_at: new Date().toISOString(),
    });
}
