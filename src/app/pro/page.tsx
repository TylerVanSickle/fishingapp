import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Check, MapPin, Brain, BarChart3, Calendar, Zap, Fish, Lock, BookOpen, Wrench, Target, TrendingUp } from "lucide-react";
import ProBadge from "@/components/ProBadge";

const PRO_FEATURES = [
  {
    icon: MapPin,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "Where to Fish",
    desc: "Real-time spot recommendations ranked by solunar timing, weather, technique match, and community catch data. Stop guessing — know exactly where to go.",
  },
  {
    icon: Brain,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Catch Pattern Analysis",
    desc: "Learn your own fishing patterns. See which times of day, baits, and conditions produce your best catches — personalized to your history.",
  },
  {
    icon: Calendar,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Fishing Calendar",
    desc: "Full year heatmap of your fishing activity. Spot your most productive months and identify gaps in your season.",
  },
  {
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    title: "Solunar Forecast",
    desc: "Hyper-accurate feeding window predictions for any location. Know the best 30-minute windows before you leave the house.",
  },
  {
    icon: Fish,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    title: "Technique Intelligence",
    desc: "Get spot recommendations filtered by your technique — fly, spin, bait, lure, jig, troll. Each spot rated for your specific style.",
  },
  {
    icon: BarChart3,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    title: "Personal Bests Tracker",
    desc: "Deep stats on your top catches per species. Track your improvement over time and compare against community averages.",
  },
  {
    icon: BookOpen,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Fishing Journal",
    desc: "Private outing notes with weather, water conditions, and what worked. Build a personal knowledge base that improves your fishing every season.",
  },
  {
    icon: Wrench,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Gear & Tackle Tracker",
    desc: "Save all your rod/reel setups and tag every catch to the gear that caught it. Find out which setup is your top performer.",
  },
  {
    icon: Target,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "Species Targeting Intel",
    desc: "Pick a target species and get full timing intel — best hours of the day, top spots, proven baits. All from real community catch data.",
  },
  {
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "7-Day Fishing Forecast",
    desc: "Full week solunar outlook and hourly breakdown. Plan your best fishing days before the week starts.",
  },
];

const FREE_FEATURES = [
  "Unlimited catch logging",
  "Photo uploads",
  "Social feed & follows",
  "Comments & reactions",
  "Spot map & ratings",
  "Leaderboards",
  "Species encyclopedia",
  "Basic fishing forecast",
];

export default async function ProPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();
    isPro = !!(profile as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-medium mb-4">
          <Sparkles size={14} />
          HookLine Pro
        </div>
        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
          Fish smarter,<br />not just harder.
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Pro gives you the intelligence layer — real-time spot recommendations, personal pattern analysis, and technique-specific guidance so every trip counts.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14 max-w-2xl mx-auto">
        {/* Monthly */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/3 flex flex-col">
          <div className="text-slate-400 text-sm font-medium mb-2">Monthly</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-black text-white">$15</span>
            <span className="text-slate-500 text-sm mb-1.5">/month</span>
          </div>
          <p className="text-xs text-slate-600 mb-6">Cancel anytime</p>
          {isPro ? (
            <div className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
              <Check size={14} /> You&apos;re on Pro
            </div>
          ) : (
            <button
              disabled
              className="mt-auto py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              title="Payments coming soon"
            >
              Coming Soon
            </button>
          )}
        </div>

        {/* Annual */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold tracking-wide">
              SAVE 17%
            </span>
          </div>
          <div className="text-amber-400 text-sm font-medium mb-2">Annual</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-black text-white">$150</span>
            <span className="text-slate-500 text-sm mb-1.5">/year</span>
          </div>
          <p className="text-xs text-slate-600 mb-6">$12.50/month · billed annually</p>
          {isPro ? (
            <div className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
              <Check size={14} /> You&apos;re on Pro
            </div>
          ) : (
            <button
              disabled
              className="mt-auto py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              title="Payments coming soon"
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>

      {/* Pro features grid */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white text-center mb-6">Everything Pro includes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRO_FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <div className={`w-9 h-9 rounded-xl ${bg} border flex items-center justify-center mb-3`}>
                <Icon size={16} className={color} />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Free features */}
      <div className="p-6 rounded-2xl border border-white/8 bg-white/2 max-w-2xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Always free</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          {FREE_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
              <Check size={13} className="text-green-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA if not logged in */}
      {!user && (
        <div className="text-center mt-10">
          <Link
            href="/login?redirectTo=/pro"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            Create free account
          </Link>
          <p className="text-xs text-slate-600 mt-2">No credit card required for free tier</p>
        </div>
      )}

      {/* Pro feature links */}
      {isPro && (
        <div className="mt-10 text-center space-y-2">
          <p className="text-sm text-slate-400">Jump to your Pro features:</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/pro/where-to-fish" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors text-sm">
              <MapPin size={13} /> Where to Fish
            </Link>
          </div>
        </div>
      )}

      {/* Teaser for non-pro logged-in */}
      {user && !isPro && (
        <div className="mt-10 p-5 rounded-2xl border border-amber-500/15 bg-amber-500/5 flex items-center gap-4">
          <Lock size={20} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white mb-0.5">Pro features are locked</p>
            <p className="text-xs text-slate-500">Payments are coming soon. In the meantime, <Link href="/pro/where-to-fish" className="text-amber-400 hover:text-amber-300 underline">preview Where to Fish</Link> for free.</p>
          </div>
          <ProBadge />
        </div>
      )}
    </div>
  );
}
