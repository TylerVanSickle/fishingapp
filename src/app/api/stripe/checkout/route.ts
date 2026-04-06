import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { plan } = await req.json() as { plan: PlanKey };
  const priceId = PLANS[plan]?.priceId;
  if (!priceId || priceId === "price_REPLACE_ME") {
    return NextResponse.json({ error: "Stripe price IDs not configured yet" }, { status: 400 });
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, username")
    .eq("id", user.id)
    .single();

  const profileData = profile as { stripe_customer_id?: string; username?: string } | null;
  let customerId = profileData?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profileData?.username ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  let session;
  try {
    session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pro`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    allow_promotion_codes: true,
    metadata: { supabase_user_id: user.id },
    });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
