import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Ban, Clock } from "lucide-react";

export default async function BannedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, is_suspended, suspended_until, ban_reason")
    .eq("id", user.id)
    .single();

  const p = profile as unknown as {
    is_banned?: boolean; is_suspended?: boolean;
    suspended_until?: string | null; ban_reason?: string | null;
  } | null;

  const isBanned = !!p?.is_banned;
  const isSuspended = p?.is_suspended && p?.suspended_until && new Date(p.suspended_until) > new Date();

  if (!isBanned && !isSuspended) redirect("/map");

  async function handleSignOut() {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-6">
          {isBanned ? <Ban size={28} className="text-red-400" /> : <Clock size={28} className="text-orange-400" />}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {isBanned ? "Account Banned" : "Account Suspended"}
        </h1>
        <p className="text-sm text-slate-400 mb-4">
          {isBanned
            ? "Your account has been permanently banned for violating community guidelines."
            : `Your account is suspended until ${new Date(p!.suspended_until!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
          }
        </p>
        {p?.ban_reason && (
          <p className="text-xs text-slate-600 mb-6">Reason: {p.ban_reason}</p>
        )}
        <p className="text-xs text-slate-600 mb-6">
          If you believe this is a mistake, contact us at the email in our privacy policy.
        </p>
        <form action={handleSignOut}>
          <button type="submit" className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
