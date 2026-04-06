import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Fish, Map, TrendingUp, Users, Star, ShieldCheck, Trophy,
  BookOpen, ArrowRight, CheckCircle2, Zap, Brain, MapPin,
  BarChart3, Calendar, Check, ChevronRight,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/map");

  const [{ count: catchCount }, { count: spotCount }, { count: userCount }] = await Promise.all([
    supabase.from("catches").select("*", { count: "exact", head: true }),
    supabase.from("spots").select("*", { count: "exact", head: true }).eq("approved", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const features = [
    { icon: Map, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", title: "Interactive Spot Map", desc: "Browse thousands of fishing spots across every US state. Filter by water type, species, and activity level." },
    { icon: Fish, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", title: "Catch Logging", desc: "Record species, weight, length, bait, and photos. Build your personal catch history and track your personal bests." },
    { icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", title: "Live Conditions Feed", desc: "See real-time weather, USGS stream gauge data, and conditions reports from anglers at the water right now." },
    { icon: Users, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", title: "Angler Community", desc: "Follow other anglers, share catches, earn badges, and plan multi-spot trips together." },
    { icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", title: "Spot Ratings & Reviews", desc: "Rate spots, leave comments, and get the real story from anglers who've actually fished them." },
    { icon: Trophy, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", title: "Leaderboards & Badges", desc: "Compete for the biggest catch of the week, unlock achievement badges, and climb state leaderboards." },
  ];

  const proFeatures = [
    { icon: MapPin, color: "text-cyan-400", title: "Where to Fish", desc: "Real-time spot recommendations ranked by solunar, weather & your technique." },
    { icon: Brain, color: "text-violet-400", title: "Catch Pattern Analysis", desc: "Discover which times, baits, and conditions produce your best catches." },
    { icon: Zap, color: "text-yellow-400", title: "Solunar Forecast", desc: "Hyper-accurate feeding window predictions for any location." },
    { icon: Calendar, color: "text-blue-400", title: "Fishing Calendar", desc: "Full-year heatmap of your activity — spot your most productive months." },
    { icon: BarChart3, color: "text-orange-400", title: "Spot Intel", desc: "Best hours, top baits, and community-verified patterns for every spot." },
    { icon: BookOpen, color: "text-amber-400", title: "Fishing Journal", desc: "Private outing notes with conditions. Build a personal knowledge base." },
  ];

  const comparisons = [
    { them: "FishBrain's best features cost $10–$20/mo", us: "HookLine Pro is $9.99/mo — all features included" },
    { them: "Generic recommendations for any angler", us: "Personalized to your species, technique & location" },
    { them: "Cluttered with ads and paywalled maps", us: "Clean, ad-free, full spot map always free" },
    { them: "Limited US coverage outside major lakes", us: "All 50 states, including small ponds and rivers" },
  ];

  return (
    <div className="min-h-screen">

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] px-4 text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/7 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            The national fishing community — all 50 states
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
            Your next great<br />catch starts<br />
            <span className="text-blue-400">here.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Discover fishing spots, log catches, track your bests, and connect with thousands of anglers. Free forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
            >
              Get started free <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-base transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 text-center flex-wrap">
            <div>
              <div className="text-3xl font-black text-white">{(catchCount ?? 0).toLocaleString()}+</div>
              <div className="text-xs text-slate-500 mt-0.5">Catches logged</div>
            </div>
            <div className="w-px h-10 bg-white/8 hidden sm:block" />
            <div>
              <div className="text-3xl font-black text-white">{(spotCount ?? 0).toLocaleString()}+</div>
              <div className="text-xs text-slate-500 mt-0.5">Fishing spots</div>
            </div>
            <div className="w-px h-10 bg-white/8 hidden sm:block" />
            <div>
              <div className="text-3xl font-black text-white">{(userCount ?? 0).toLocaleString()}+</div>
              <div className="text-xs text-slate-500 mt-0.5">Anglers</div>
            </div>
            <div className="w-px h-10 bg-white/8 hidden sm:block" />
            <div>
              <div className="text-3xl font-black text-white">50</div>
              <div className="text-xs text-slate-500 mt-0.5">States covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── App preview strip ─────────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.01] py-16 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-10 font-medium">Everything in one place</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { emoji: "🗺️", label: "Spot Map" },
              { emoji: "🎣", label: "Log Catches" },
              { emoji: "📊", label: "Stats" },
              { emoji: "🌤️", label: "Forecast" },
              { emoji: "🏆", label: "Leaderboards" },
              { emoji: "📖", label: "Journal" },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/8 hover:bg-white/5 transition-colors">
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs text-slate-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features grid ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything you need on the water</h2>
          <p className="text-slate-400 text-lg">Built by anglers, for anglers. Always free.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title} className={`p-6 rounded-2xl border ${border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors group`}>
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <Icon className={color} size={24} />
              </div>
              <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-white/5">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Up and running in minutes</h2>
          <p className="text-slate-400">No setup required. Start exploring immediately.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { step: "01", title: "Create your free account", desc: "Sign up in 30 seconds. Pick your home state and favorite species to personalize your experience." },
            { step: "02", title: "Explore spots near you", desc: "Browse the map or use 'Near Me' to find fishing spots close to your location. Filter by water type and species." },
            { step: "03", title: "Log your catches", desc: "After a great day, log what you caught with a photo and notes. Your history builds automatically over time." },
            { step: "04", title: "Share & connect", desc: "Follow local anglers, share conditions reports, and get tips from the community about what's biting right now." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-6 rounded-2xl border border-white/6 bg-white/[0.02] hover:border-white/10 transition-colors">
              <div className="text-3xl font-black text-blue-500/25 leading-none shrink-0 select-none">{step}</div>
              <div>
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pro teaser ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            ✦ HookLine Pro
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Fish smarter, not just harder</h2>
          <p className="text-slate-400 max-w-lg mx-auto">Unlock the intelligence layer — real-time spot recommendations, pattern analysis, and technique-specific guidance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {proFeatures.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="p-5 rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] transition-colors">
              <Icon size={18} className={`${color} mb-3`} />
              <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-slate-500 mb-8">
          {["$9.99/month", "Cancel anytime", "Instant access"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check size={13} className="text-green-400" /> {t}
            </span>
          ))}
        </div>

        <div className="text-center">
          <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all hover:shadow-xl hover:shadow-amber-500/25">
            Try free first <ChevronRight size={16} />
          </Link>
          <p className="text-xs text-slate-600 mt-2">Free account required · No credit card for free tier</p>
        </div>
      </section>

      {/* ─── Comparison ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-white/5">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Why anglers choose HookLine</h2>
          <p className="text-slate-500 text-sm">We built what we wanted as anglers — not what looks good in a pitch deck.</p>
        </div>
        <div className="space-y-3">
          {comparisons.map(({ them, us }) => (
            <div key={us} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                <span className="text-red-500/60 text-base shrink-0 mt-0.5">✗</span>
                <p className="text-sm text-slate-500">{them}</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/[0.05] border border-green-500/15">
                <span className="text-green-400 text-base shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-slate-300">{us}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Trust + CTA ───────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="p-8 rounded-2xl border border-white/8 bg-white/[0.02] text-center">
          <div className="flex items-center justify-center gap-6 mb-6 flex-wrap text-sm text-slate-400">
            {[
              { icon: ShieldCheck, text: "Free forever" },
              { icon: CheckCircle2, text: "No ads" },
              { icon: BookOpen, text: "Open to all anglers" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon size={15} className="text-green-400" /> {text}
              </span>
            ))}
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Ready to find your next spot?</h2>
          <p className="text-slate-400 mb-8">Join thousands of anglers already using HookLine.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all hover:shadow-xl hover:shadow-blue-600/30"
          >
            Create your free account <ArrowRight size={18} />
          </Link>
          <p className="text-slate-600 text-xs mt-4">No credit card required for free tier.</p>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Fish size={14} className="text-blue-400" />
            </div>
            <span className="font-bold text-slate-300">HookLine</span>
            <span className="text-slate-700 text-xs ml-1">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link href="/signup" className="hover:text-slate-400 transition-colors">Sign up</Link>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Sign in</Link>
            <Link href="/pro" className="hover:text-amber-400 transition-colors text-amber-600">Pro</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/map" className="hover:text-slate-400 transition-colors">Map</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
