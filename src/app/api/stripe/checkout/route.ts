import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/data";
import { getStripe, priceIdFor } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";

/** Stripe Checkout セッションを作成してリダイレクト(要件 3.4 ②-1) */
export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const user = await getCurrentUser();
  if (!user?.politician) return NextResponse.redirect(`${origin}/login?next=/politician/plan`, 303);

  const form = await request.formData();
  const plan = form.get("plan") === "yearly" ? "yearly" : "monthly";
  const stripe = getStripe();
  const politician = user.politician;

  // 顧客 ID は 1 政治家につき 1 つに固定
  let customerId = user.subscription?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: politician.name,
      metadata: { politician_id: politician.id },
    });
    customerId = customer.id;
    await createServiceClient()
      .from("subscriptions")
      .upsert({ politician_id: politician.id, stripe_customer_id: customerId, updated_at: new Date().toISOString() });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    success_url: `${origin}/politician/plan?status=success`,
    cancel_url: `${origin}/politician/plan?status=cancel`,
    metadata: { politician_id: politician.id, plan },
    subscription_data: { metadata: { politician_id: politician.id, plan } },
    locale: "ja",
  });
  return NextResponse.redirect(session.url!, 303);
}
