import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Sparkles, TrendingUp, Star, Fish, Waves, Clock, Zap, ChevronRight } from "lucide-react";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";
import WhereFishFilters from "@/components/WhereFishFilters";
import ProBadge from "@/components/ProBadge";
import { Suspense } from "react";

// Technique → water type scoring
const TECHNIQUE_WATER: Record<string, { best: string[]; ok: string[] }> = {
  fly_fishing:  { best: ["river", "stream", "creek"],       ok: ["lake", "reservoir"] },
  spinning:     { best: ["lake", "reservoir", "river"],      ok: ["stream", "pond"] },
  bait:         { best: ["lake", "reservoir", "river", "stream", "pond", "creek"], ok: [] },
  lure:         { best: ["lake", "reservoir", "river"],      ok: ["stream"] },
  jigging:      { best: ["lake", "reservoir"],               ok: ["river"] },
  trolling:     { best: ["lake", "reservoir"],               ok: ["river"] },
  ice_fishing:  { best: ["lake", "reservoir", "pond"],       ok: [] },
};

const TECHNIQUE_LABELS: Record<string, string> = {
  fly_fishing:  "Fly Fishing",
  spinning:     "Spinning",
  bait:         "Bait Fishing",
  lure:         "Lure / Jerkbait",
  jigging:      "Jigging",
  trolling:     "Trolling",
  ice_fishing:  "Ice Fishing",
};

const TECHNIQUE_TIPS: Record<string, (waterType: string) => string> = {
  fly_fishing:  (w) => w.includes("lake") || w.includes("reservoir")
    ? "Still-water fly: use sinking lines near drop-offs, strip slowly"
    : "Focus on riffles and pocket water — nymph or dry fly based on hatch",
  spinning:     (w) => w.includes("river") || w.includes("stream")
    ? "Cast upstream, work current seams with light spinners"
    : "Target structure — points, weed edges, and drop-offs",
  bait:         () => "Fish near the bottom during feeding windows, live bait edges out cut bait here",
  lure:         (w) => w.includes("river")
    ? "Work crankbaits along undercut banks and structure"
    : "Vary depth and retrieve speed — let the fish tell you what's working",
  jigging:      () => "Vertical jigging near structure — count down to find the feeding depth",
  trolling:     () => "Cover water in S-curves to vary depth, target thermoclines in summer",
  ice_fishing:  () => "Set tip-ups over structure in 8–20ft, jig actively during feeding windows",
};

function techniqueMatch(technique: string, waterType: string): number {
  if (!technique) return 5; // neutral when no technique selected
  const match = TECHNIQUE_WATER[technique];
  if (!match) return 5;
  const wt = waterType.toLowerCase();
  if (match.best.some((t) => wt.includes(t))) return 10;
  if (match.ok.some((t) => wt.includes(t))) return 5;
  return 0;
}

function compositeScore(solunar: number, recentCatches: number, avgRating: number, techMatch: number): number {
  const solunarNorm   = (solunar / 10) * 35;             // 0–35
  const catchNorm     = Math.min(recentCatches / 8, 1) * 30; // 0–30 (8 catches = max)
  const ratingNorm    = ((avgRating - 1) / 4) * 25;      // 0–25
  const techNorm      = (techMatch / 10) * 10;            // 0–10
  return Math.round(solunarNorm + catchNorm + ratingNorm + techNorm);
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-orange-500" :
    score >= 50 ? "bg-green-500" :
    score >= 30 ? "bg-yellow-500" :
    "bg-slate-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-white w-8 text-right">{score}</span>
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ technique?: string; state?: string }>;
}

export default async function WhereFishPage({ searchParams }: PageProps) {
  const { technique = "", state = "" } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Check pro status (or allow preview for now while payments aren't wired)
  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  // Fetch spots (filtered by state if set, limited to manageable batch)
  let spotsQuery = supabase
    .from("spots")
    .select("id, name, water_type, state, lat, lng, description")
    .eq("approved", true)
    .not("lat", "is", null)
    .not("lng", "is", null)
    .limit(60);

  if (state) spotsQuery = spotsQuery.ilike("state", state);
  const { data: spots } = await spotsQuery;

  // Fetch recent catch counts per spot (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentCatchRows } = await supabase
    .from("catches")
    .select("spot_id")
    .gte("caught_at", thirtyDaysAgo)
    .eq("is_private", false)
    .not("spot_id", "is", null);

  const catchCounts: Record<string, number> = {};
  (recentCatchRows ?? []).forEach((r) => {
    if (r.spot_id) catchCounts[r.spot_id] = (catchCounts[r.spot_id] ?? 0) + 1;
  });

  // Fetch average ratings per spot
  const { data: ratingRows } = await supabase
    .from("spot_ratings")
    .select("spot_id, rating");

  const ratingMap: Record<string, number[]> = {};
  (ratingRows ?? []).forEach((r) => {
    ratingMap[r.spot_id] = ratingMap[r.spot_id] ?? [];
    ratingMap[r.spot_id].push(r.rating);
  });

  // Score every spot
  const now = new Date();
  type ScoredSpot = {
    id: string; name: string; water_type: string; state: string | null;
    lat: number; lng: number; description: string | null;
    solunarScore: number; solunarLabel: { label: string; color: string };
    recentCatches: number; avgRating: number; techMatch: number;
    composite: number;
  };

  const scored: ScoredSpot[] = (spots ?? []).map((s) => {
    const solunarScore = computeFishingScore(s.lng as number, now);
    const recentCatches = catchCounts[s.id] ?? 0;
    const ratings = ratingMap[s.id] ?? [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 2.5;
    const techMatch = techniqueMatch(technique, (s.water_type as string) ?? "");
    const composite = compositeScore(solunarScore, recentCatches, avgRating, techMatch);
    return {
      id: s.id,
      name: s.name as string,
      water_type: (s.water_type as string) ?? "",
      state: s.state as string | null,
      lat: s.lat as number,
      lng: s.lng as number,
      description: s.description as string | null,
      solunarScore,
      solunarLabel: scoreLabel(solunarScore),
      recentCatches,
      avgRating,
      techMatch,
      composite,
    };
  });

  // Filter out technique mismatches (techMatch === 0) if a technique is selected
  const filtered = technique
    ? scored.filter((s) => s.techMatch > 0)
    : scored;

  const topSpots = filtered.sort((a, b) => b.composite - a.composite).slice(0, 10);

  const isPreview = !isPro;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <MapPin className="text-cyan-400" size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Where to Fish</h1>
            <ProBadge />
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Spots ranked by solunar timing, community activity, ratings, and technique match — right now.
          </p>
        </div>
      </div>

      {/* Preview banner for non-pro */}
      {isPreview && (
        <div className="mb-6 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="text-white font-medium">You&apos;re previewing a Pro feature.</span>
            <span className="text-slate-500 ml-1">Full results + pattern analysis unlock with Pro.</span>
          </div>
          <Link href="/pro" className="text-xs px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors shrink-0 font-medium">
            Learn more
          </Link>
        </div>
      )}

      {/* Filters */}
      <Suspense>
        <WhereFishFilters />
      </Suspense>

      {/* Current conditions summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Clock, label: "Solunar Now", value: scoreLabel(computeFishingScore(-111.9, now)).label, color: scoreLabel(computeFishingScore(-111.9, now)).color },
          { icon: TrendingUp, label: "Spots Found", value: String(topSpots.length), color: "#60a5fa" },
          { icon: Zap, label: "Top Score", value: topSpots[0] ? `${topSpots[0].composite}/100` : "—", color: "#f97316" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 rounded-xl border border-white/8 bg-white/2 text-center">
            <Icon size={14} className="mx-auto mb-1.5" style={{ color }} />
            <div className="text-base font-bold text-white">{value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Results */}
      {topSpots.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/8 text-slate-600">
          <Fish size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No spots found for these filters.</p>
          {technique && (
            <p className="text-xs mt-1">
              Try a different technique or{" "}
              <Link href="/pro/where-to-fish" className="text-blue-400">clear filters</Link>.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {topSpots.map((spot, i) => {
            // For non-pro, blur results beyond #3
            const blurred = isPreview && i >= 3;
            const tip = technique ? TECHNIQUE_TIPS[technique]?.(spot.water_type) : null;

            return (
              <div
                key={spot.id}
                className={`rounded-2xl border border-white/8 bg-white/2 overflow-hidden transition-colors ${!blurred ? "hover:border-white/14" : ""}`}
              >
                {blurred ? (
                  <div className="p-5 blur-sm select-none pointer-events-none">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-slate-700 w-7">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                        <div className="h-2 w-48 bg-white/5 rounded" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/spots/${spot.id}`} className="block p-5 group">
                    <div className="flex items-start gap-3">
                      {/* Rank */}
                      <span className={`text-xl font-black w-7 shrink-0 mt-0.5 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-700"}`}>
                        #{i + 1}
                      </span>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{spot.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1"><Waves size={9} className="shrink-0" />{spot.water_type}</span>
                              {spot.state && <span>{spot.state}</span>}
                            </div>
                          </div>
                          {/* Composite score */}
                          <div className="text-right shrink-0">
                            <div className="text-lg font-black text-white">{spot.composite}</div>
                            <div className="text-[9px] text-slate-600 uppercase tracking-wide">score</div>
                          </div>
                        </div>

                        {/* Score bar */}
                        <ScoreBar score={spot.composite} />

                        {/* Metrics row */}
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: spot.solunarLabel.color }} />
                            Solunar: <span className="font-semibold ml-0.5" style={{ color: spot.solunarLabel.color }}>{spot.solunarLabel.label}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Fish size={9} />
                            {spot.recentCatches} catches / 30d
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={9} />
                            {spot.avgRating.toFixed(1)}
                          </span>
                          {technique && (
                            <span className={`font-medium ${spot.techMatch === 10 ? "text-green-400" : "text-yellow-400"}`}>
                              {spot.techMatch === 10 ? "✓ Ideal" : "~ Ok"} for {TECHNIQUE_LABELS[technique]}
                            </span>
                          )}
                        </div>

                        {/* Technique tip */}
                        {tip && (
                          <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
                            💡 {tip}
                          </p>
                        )}
                      </div>

                      <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                    </div>
                  </Link>
                )}
              </div>
            );
          })}

          {/* Upgrade CTA after blurred results */}
          {isPreview && topSpots.length > 3 && (
            <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center">
              <Sparkles size={18} className="mx-auto mb-2 text-amber-400" />
              <p className="text-sm font-medium text-white mb-1">
                {topSpots.length - 3} more spots are hidden
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Upgrade to Pro to see all results + technique tips + pattern analysis
              </p>
              <Link href="/pro" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors">
                <Sparkles size={13} /> Unlock Pro
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
