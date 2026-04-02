import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Fish, Map, TrendingUp, Users, Star, ShieldCheck, Trophy, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Logged-in users go straight to the map
  if (user) redirect("/map");

  // Grab a few live stats for social proof
  const [{ count: catchCount }, { count: spotCount }] = await Promise.all([
    supabase.from("catches").select("*", { count: "exact", head: true }),
    supabase.from("spots").select("*", { count: "exact", head: true }).eq("approved", true),
  ]);

  const features = [
    {
      icon: Map,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      title: "Interactive Spot Map",
      desc: "Browse thousands of fishing spots across every US state. Filter by water type, species, and activity level.",
    },
    {
      icon: Fish,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      title: "Catch Logging",
      desc: "Record species, weight, length, bait, and photos. Build your personal catch history and track your personal bests.",
    },
    {
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      title: "Live Conditions Feed",
      desc: "See real-time weather, USGS stream gauge data, and conditions reports from anglers at the water right now.",
    },
    {
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      title: "Angler Community",
      desc: "Follow other anglers, share catches, earn badges, and plan multi-spot trips together.",
    },
    {
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      title: "Spot Ratings & Reviews",
      desc: "Rate spots, leave comments, and get the real story from anglers who've actually fished them.",
    },
    {
      icon: Trophy,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      title: "Leaderboards & Badges",
      desc: "Compete for the biggest catch of the week, unlock achievement badges, and climb state leaderboards.",
    },
  ];

  const howItWorks = [
    { step: "01", title: "Create your free account", desc: "Sign up in 30 seconds. Pick your home state and favorite species to personalize your experience." },
    { step: "02", title: "Explore spots near you", desc: "Browse the map or use 'Near Me' to find fishing spots close to your location. Filter by water type and target species." },
    { step: "03", title: "Log your catches", desc: "After a great day on the water, log what you caught with a photo and notes. Your history builds over time." },
    { step: "04", title: "Share & connect", desc: "Follow local anglers, share conditions reports, and get tips from the community about what's biting." },
  ];

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/12 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/6 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            The national fishing community app
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Your next great<br />
            catch starts<br />
            <span className="text-blue-400">here.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Discover fishing spots across all 50 states, log your catches, track your personal bests, and connect with thousands of anglers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
            >
              Get started free <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-base transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Social proof numbers */}
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{(catchCount ?? 0).toLocaleString()}+</div>
              <div className="text-xs text-slate-500">Catches logged</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold text-white">{(spotCount ?? 0).toLocaleString()}+</div>
              <div className="text-xs text-slate-500">Fishing spots</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold text-white">50</div>
              <div className="text-xs text-slate-500">States covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features grid ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything you need on the water</h2>
          <p className="text-slate-400 text-lg">Built by anglers, for anglers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div
              key={title}
              className={`p-6 rounded-2xl border ${border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How it works</h2>
          <p className="text-slate-400">Get up and running in minutes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {howItWorks.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 p-6 rounded-2xl border border-white/6 bg-white/[0.02]">
              <div className="text-3xl font-black text-blue-500/30 leading-none shrink-0 select-none">{step}</div>
              <div>
                <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Trust signals ─────────────────────────────────────── */}
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
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/30"
          >
            Create your free account <ArrowRight size={18} />
          </Link>
          <p className="text-slate-600 text-xs mt-4">No credit card required.</p>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-slate-600">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Fish size={14} className="text-blue-400" />
          <span className="font-semibold text-slate-400">HookLine</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="hover:text-slate-400 transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-slate-400 transition-colors">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
