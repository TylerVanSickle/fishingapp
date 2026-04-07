import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Map, Fish, Users, Compass, ArrowRight, Sparkles } from "lucide-react";

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, home_state")
    .eq("id", user.id)
    .single();

  const name = profile?.username ?? "Angler";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Animated check */}
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎣</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">
          Welcome, @{name}!
        </h1>
        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
          Your account is ready. Here&apos;s a few things to get started.
        </p>

        {/* Quick actions grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/map"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center group-hover:bg-blue-600/25 transition-colors">
              <Map size={18} className="text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">Find spots</span>
          </Link>
          <Link
            href="/explore"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/15 flex items-center justify-center group-hover:bg-cyan-600/25 transition-colors">
              <Compass size={18} className="text-cyan-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">Explore</span>
          </Link>
          <Link
            href="/log-catch"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-600/15 flex items-center justify-center group-hover:bg-green-600/25 transition-colors">
              <Fish size={18} className="text-green-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">Log a catch</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 flex items-center justify-center group-hover:bg-violet-600/25 transition-colors">
              <Users size={18} className="text-violet-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">See the feed</span>
          </Link>
        </div>

        {/* Pro teaser */}
        <div className="p-4 rounded-2xl border border-amber-500/15 bg-amber-500/5 mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">HookLine Pro</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            AI-powered spot recommendations, gear tracker, fishing journal & more.
          </p>
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Learn more <ArrowRight size={11} />
          </Link>
        </div>

        {/* Continue button */}
        <Link
          href="/map"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
        >
          Start fishing <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
