import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { ArrowLeft, Sparkles, Check, CreditCard, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { ManageSubscriptionButton } from "@/components/StripeButtons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Pro" };

export default async function ManageProPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/pro/manage");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const p = profile as { is_pro?: boolean; stripe_customer_id?: string; stripe_subscription_id?: string } | null;

  if (!p?.is_pro) redirect("/pro");

  // Fetch subscription details from Stripe
  let sub: {
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    planName: string;
    amount: string;
    interval: string;
  } | null = null;

  if (p.stripe_subscription_id) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(p.stripe_subscription_id, {
        expand: ["items.data.price.product"],
      });

      const item = stripeSub.items.data[0];
      const price = item?.price;
      const interval = price?.recurring?.interval ?? "month";
      const amount = price?.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : "";

      sub = {
        status: stripeSub.status,
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        planName: interval === "year" ? "Annual" : "Monthly",
        amount,
        interval,
      };
    } catch {
      // Stripe fetch failed — show basic UI without details
    }
  }

  const renewsOrEndsLabel = sub?.cancelAtPeriodEnd ? "Access ends" : "Renews";

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link href="/pro" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Pro
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <Sparkles size={18} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">HookLine Pro</h1>
          <p className="text-xs text-slate-500">Manage your subscription</p>
        </div>
      </div>

      {/* Current plan card */}
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white">{sub?.planName ?? "Pro"} Plan</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                sub?.cancelAtPeriodEnd
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "bg-green-500/15 text-green-400 border border-green-500/20"
              }`}>
                {sub?.cancelAtPeriodEnd ? "Cancels soon" : "Active"}
              </span>
            </div>
            {sub && (
              <p className="text-2xl font-black text-white">
                {sub.amount}
                <span className="text-sm font-normal text-slate-500">/{sub.interval}</span>
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Check size={18} className="text-amber-400" />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {sub?.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={13} className="text-slate-600 shrink-0" />
              {renewsOrEndsLabel} {sub.currentPeriodEnd.toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-400">
            <CreditCard size={13} className="text-slate-600 shrink-0" />
            Billed via Stripe — payment info managed securely
          </div>
        </div>
      </div>

      {sub?.cancelAtPeriodEnd && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/8 border border-orange-500/15 mb-4">
          <AlertCircle size={15} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-400">
            Your subscription is set to cancel. You&apos;ll keep Pro access until{" "}
            <strong className="text-white">
              {sub.currentPeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </strong>
            . You can reactivate anytime before then.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h2 className="text-sm font-semibold text-white mb-1">Change or cancel plan</h2>
          <p className="text-xs text-slate-500 mb-4">
            Switch between monthly and annual, update your payment method, or cancel — all through Stripe&apos;s secure portal.
          </p>
          <ManageSubscriptionButton fullWidth />
        </div>

        {sub && !sub.cancelAtPeriodEnd && (
          <div className="p-4 rounded-xl border border-white/6 bg-white/[0.01]">
            <div className="flex items-start gap-2">
              <RefreshCw size={13} className="text-slate-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">
                  {sub.interval === "month" ? "Save 33% with Annual" : "On Annual — best value"}
                </p>
                <p className="text-xs text-slate-600">
                  {sub.interval === "month"
                    ? "Switch to annual billing in the portal above and pay $79.99/yr instead of $119.88/yr."
                    : "You're already on the best value plan at $79.99/yr."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-700 text-center mt-8">
        Questions? Contact us through the app. Billing is handled by{" "}
        <span className="text-slate-600">Stripe</span>.
      </p>
    </div>
  );
}
