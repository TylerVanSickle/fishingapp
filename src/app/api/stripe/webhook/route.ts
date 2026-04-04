import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// Stripe requires the raw body — disable Next.js body parsing
export const runtime = "nodejs";

async function getSupabaseAdmin() {
  // Use service role for webhook (bypasses RLS)
  const { createClient: createServerClient } = await import("@supabase/supabase-js");
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Use service role to bypass RLS in webhook context
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasValidServiceKey = serviceKey && serviceKey !== "REPLACE_ME" && serviceKey.startsWith("eyJ");
  if (!hasValidServiceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing or not set — webhook cannot update profiles");
    return NextResponse.json({ error: "Server misconfiguration: missing service role key" }, { status: 500 });
  }
  const supabase = await getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const subscriptionId = session.subscription as string;

      if (userId && subscriptionId) {
        const { error } = await supabase.from("profiles").update({
          is_pro: true,
          pro_since: new Date().toISOString(),
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
        }).eq("id", userId);
        if (error) console.error("Webhook: failed to set is_pro=true", error);
        else console.log("Webhook: set is_pro=true for user", userId);
      } else {
        console.error("Webhook: missing userId or subscriptionId", { userId, subscriptionId });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (userId) {
        await supabase.from("profiles").update({
          is_pro: false,
          stripe_subscription_id: null,
        }).eq("id", userId);
      } else {
        // Fallback: look up by customer ID
        const customerId = subscription.customer as string;
        await supabase.from("profiles").update({
          is_pro: false,
          stripe_subscription_id: null,
        }).eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const isActive = subscription.status === "active" || subscription.status === "trialing";

      if (userId) {
        await supabase.from("profiles").update({
          is_pro: isActive,
          stripe_subscription_id: isActive ? subscription.id : null,
        }).eq("id", userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      // Optionally notify user — for now just log
      break;
    }
  }

  return NextResponse.json({ received: true });
}
