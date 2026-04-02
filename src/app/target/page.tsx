import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Target, Fish, MapPin, Clock, Sparkles, ChevronRight } from "lucide-react";

export default async function TargetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  // Get all species with catch counts
  const { data: fishList } = await supabase
    .from("fish_species")
    .select("id, name, description, image_url")
    .order("name");

  // Get catch counts per species (public only)
  const { data: countData } = await supabase
    .from("catches")
    .select("fish_id");

  const catchCounts: Record<string, number> = {};
  (countData ?? []).forEach(c => {
    catchCounts[c.fish_id] = (catchCounts[c.fish_id] ?? 0) + 1;
  });

  const fishWithCounts = (fishList ?? [])
    .map(f => ({ ...f, catchCount: catchCounts[f.id] ?? 0 }))
    .sort((a, b) => b.catchCount - a.catchCount);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center">
          <Target className="text-red-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Species Targeting</h1>
          <p className="text-slate-500 text-xs">Pick your target — get spots, baits, and timing intel</p>
        </div>
        {!isPro && (
          <Link href="/pro" className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-colors">
            <Sparkles size={11} /> Unlock full intel with Pro
          </Link>
        )}
      </div>
      <p className="text-slate-600 text-sm mb-8 ml-13 pl-1">Select a species below to see where it&apos;s been caught recently, which baits work best, and the optimal times to fish.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fishWithCounts.map(f => (
          <Link
            key={f.id}
            href={`/target/${f.id}`}
            className="group flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center shrink-0">
              <Fish size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{f.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {f.catchCount > 0 ? `${f.catchCount} catch${f.catchCount !== 1 ? "es" : ""} logged` : "No catches yet"}
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
