import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Check, Map, BookOpen, Wrench, Trophy, Zap, MapPin } from "lucide-react";

export default async function ProSuccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {/* Confetti-style header */}
      <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center mx-auto mb-6">
        <Sparkles size={36} className="text-amber-400" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-sm font-bold mb-4">
        <Check size={14} /> You&apos;re now on Pro
      </div>

      <h1 className="text-3xl font-black text-white mb-3">Welcome to HookLine Pro</h1>
      <p className="text-slate-400 leading-relaxed mb-8">
        Your subscription is active. Every Pro feature is now unlocked — go catch more fish.
      </p>

      {/* Feature quick-links */}
      <div className="grid grid-cols-2 gap-3 mb-8 text-left">
        {[
          { href: "/trips", icon: Map, label: "Trip Planner", desc: "Plan with intel & share" },
          { href: "/journal", icon: BookOpen, label: "Fishing Journal", desc: "Log every outing" },
          { href: "/gear", icon: Wrench, label: "Gear Tracker", desc: "Save your setups" },
          { href: "/profile/records", icon: Trophy, label: "Personal Records", desc: "Your trophy wall" },
          { href: "/forecast", icon: Zap, label: "7-Day Forecast", desc: "Solunar outlook" },
          { href: "/pro/where-to-fish", icon: MapPin, label: "Where to Fish", desc: "AI recommendations" },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="p-4 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all group"
          >
            <Icon size={16} className="text-amber-400 mb-2" />
            <p className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
      >
        Start fishing →
      </Link>
    </div>
  );
}
