import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/data";
import { getStripe } from "@/lib/stripe";

/** 解約・カード変更・領収書は Stripe Customer Portal へ(要件 3.4 ②-1) */
export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const user = await getCurrentUser();
  const customer = user?.subscription?.stripe_customer_id;
  if (!customer) return NextResponse.redirect(`${origin}/politician/plan`, 303);

  const session = await getStripe().billingPortal.sessions.create({
    customer,
    configuration: process.env.STRIPE_PORTAL_CONFIGURATION || undefined,
    return_url: `${origin}/politician/plan`,
    locale: "ja",
  });
  return NextResponse.redirect(session.url, 303);
}
