import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, TrendingUp, Star, Fish, Waves, Clock, Zap, ChevronRight } from "lucide-react";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";
import WhereFishFilters from "@/components/WhereFishFilters";
import ProBadge from "@/components/ProBadge";
import ProGate from "@/components/ProGate";
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
  if (!technique) return 5;
  const match = TECHNIQUE_WATER[technique];
  if (!match) return 5;
  const wt = waterType.toLowerCase();
  if (match.best.some((t) => wt.includes(t))) return 10;
  if (match.ok.some((t) => wt.includes(t))) return 5;
  return 0;
}

function compositeScore(solunar: number, recentCatches: number, avgRating: number, techMatch: number): number {
  // Solunar: 0–40 (real-time signal, varies by location + time)
  const solunarNorm = (solunar / 10) * 40;
  // Catches: base 10pts + up to 25 bonus (so 0 catches ≠ zero contribution)
  const catchNorm   = 10 + Math.min(recentCatches / 5, 1) * 25;
  // Rating: 1→0, 3→12.5 (neutral), 5→25
  const ratingNorm  = ((avgRating - 1) / 4) * 25;
  // Technique: 0–10 (only applied when a technique is selected)
  const techNorm    = (techMatch / 10) * 10;
  return Math.round(Math.min(solunarNorm + catchNorm + ratingNorm + techNorm, 100));
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
  searchParams: Promise<{ technique?: string; state?: string; fish?: string; mode?: string; spot?: string }>;
}

export default async function WhereFishPage({ searchParams }: PageProps) {
  const { technique = "", state = "", fish = "", mode = "find", spot = "" } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  // Always fetch species list for the filter dropdown
  const { data: allSpecies } = await supabase
    .from("fish_species")
    .select("id, name")
    .order("name");

  const speciesNames = (allSpecies ?? []).map((s) => s.name as string);

  // ── MODE: EXPLORE A SPOT ──────────────────────────────────────────────────
  if (mode === "spot") {
    let exploreQuery = supabase
      .from("spots")
      .select("id, name, water_type, state, latitude, longitude, spot_fish(fish_species(id, name))")
      .eq("approved", true);

    const { data: exploreSpots } = spot
      ? await exploreQuery.ilike("name", `%${spot}%`).limit(20)
      : { data: [] };

    if (!isPro) {
      return (
        <ProGate
          title="Where to Fish"
          icon={MapPin}
          iconColor="text-cyan-400"
          description="Search by fish species to find the best spots, or look up any lake or river to see what fish you can catch there."
          features={[
            "Search by fish species → find the best spots",
            "Search by lake/river → see all fish present",
            "Live solunar scoring for every spot",
            "Ranked by catches in the last 30 days",
            "Technique-match filtering",
            "State/region filtering",
          ]}
          preview={
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
              {[85, 72, 68, 61, 54].map((score, i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/8 bg-white/2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-slate-500 w-7">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="h-4 w-40 bg-white/15 rounded mb-2" />
                      <div className="h-2 w-24 bg-white/8 rounded mb-3" />
                      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500/50" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-white/50">{score}</div>
                  </div>
                </div>
              ))}
            </div>
          }
        />
      );
    }

    type ExploreSpot = {
      id: string;
      name: string;
      water_type: string | null;
      state: string | null;
      latitude: number | null;
      longitude: number | null;
      spot_fish: { fish_species: { id: string; name: string } | null }[];
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
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
              Search a lake or river to see what fish are there.
            </p>
          </div>
        </div>

        <Suspense>
          <WhereFishFilters speciesNames={speciesNames} />
        </Suspense>

        {!spot ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/8 text-slate-600">
            <MapPin size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Type a lake or river name above to explore it.</p>
          </div>
        ) : (exploreSpots ?? []).length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/8 text-slate-600">
            <Fish size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No spots found for &ldquo;{spot}&rdquo;.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(exploreSpots as unknown as ExploreSpot[]).map((s) => {
              const now = new Date();
              const solunar = s.latitude && s.longitude ? computeFishingScore(s.longitude, now) : null;
              const sl = solunar != null ? scoreLabel(solunar) : null;
              const fishList = (s.spot_fish ?? [])
                .map((sf) => sf.fish_species?.name)
                .filter(Boolean) as string[];

              return (
                <div key={s.id} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden hover:border-white/14 transition-colors group">
                  <Link href={`/spots/${s.id}`} className="block p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{s.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {s.water_type && <span className="flex items-center gap-1"><Waves size={9} />{s.water_type}</span>}
                          {s.state && <span>{s.state}</span>}
                        </div>
                      </div>
                      {sl && (
                        <div className="text-right shrink-0">
                          <div className="text-xs font-semibold" style={{ color: sl.color }}>{sl.label}</div>
                          <div className="text-[9px] text-slate-600 uppercase tracking-wide">solunar</div>
                        </div>
                      )}
                    </div>

                    {fishList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {fishList.map((name) => (
                          <span key={name} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 italic">No species linked yet</p>
                    )}

                    <p className="text-xs text-blue-500/60 group-hover:text-blue-400 transition-colors mt-3">View spot details →</p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── MODE: FIND SPOTS (ranked) ─────────────────────────────────────────────

  // If a fish species is selected, get matching spot IDs via spot_fish
  let filteredSpotIds: string[] | null = null;
  if (fish) {
    const { data: fishRow } = await supabase
      .from("fish_species")
      .select("id")
      .eq("name", fish)
      .single();
    if (fishRow) {
      const { data: sfRows } = await supabase
        .from("spot_fish")
        .select("spot_id")
        .eq("fish_id", fishRow.id);
      filteredSpotIds = (sfRows ?? []).map((r) => r.spot_id as string);
    }
  }

  let spotsQuery = supabase
    .from("spots")
    .select("id, name, water_type, state, latitude, longitude, description, spot_fish(fish_species(id, name))")
    .eq("approved", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(150);

  if (state) spotsQuery = spotsQuery.ilike("state", state);
  if (filteredSpotIds) {
    if (filteredSpotIds.length === 0) {
      // No spots have this fish
      spotsQuery = spotsQuery.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      spotsQuery = spotsQuery.in("id", filteredSpotIds);
    }
  }

  const { data: spots } = await spotsQuery;

  // Recent catch counts
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

  // Average ratings
  const { data: ratingRows } = await supabase.from("spot_ratings").select("spot_id, rating");
  const ratingMap: Record<string, number[]> = {};
  (ratingRows ?? []).forEach((r) => {
    ratingMap[r.spot_id] = ratingMap[r.spot_id] ?? [];
    ratingMap[r.spot_id].push(r.rating);
  });

  const now = new Date();

  type SpotRow = {
    id: string; name: string; water_type: string | null; state: string | null;
    latitude: number; longitude: number; description: string | null;
    spot_fish: { fish_species: { id: string; name: string } | null }[];
  };

  type ScoredSpot = SpotRow & {
    solunarScore: number;
    solunarLabel: { label: string; color: string };
    recentCatches: number;
    avgRating: number;
    techMatch: number;
    composite: number;
    fishList: string[];
  };

  const scored: ScoredSpot[] = (spots as unknown as SpotRow[] ?? []).map((s) => {
    const solunarScore = computeFishingScore(s.longitude, now);
    const recentCatches = catchCounts[s.id] ?? 0;
    const ratings = ratingMap[s.id] ?? [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 3;
    const techMatch = techniqueMatch(technique, s.water_type ?? "");
    const composite = compositeScore(solunarScore, recentCatches, avgRating, techMatch);
    const fishList = (s.spot_fish ?? []).map((sf) => sf.fish_species?.name).filter(Boolean) as string[];
    return { ...s, water_type: s.water_type ?? "", state: s.state, solunarScore, solunarLabel: scoreLabel(solunarScore), recentCatches, avgRating, techMatch, composite, fishList };
  });

  const filtered = technique ? scored.filter((s) => s.techMatch > 0) : scored;
  const topSpots = filtered.sort((a, b) => b.composite - a.composite).slice(0, 10);

  if (!isPro) {
    return (
      <ProGate
        title="Where to Fish"
        icon={MapPin}
        iconColor="text-cyan-400"
        description="Search by fish species to find the best spots, or look up any lake or river to see what fish you can catch there."
        features={[
          "Search by fish species → find the best spots",
          "Search by lake/river → see all fish present",
          "Live solunar scoring for every spot",
          "Ranked by catches in the last 30 days",
          "Technique-match filtering",
          "State/region filtering",
        ]}
        preview={
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
            {[85, 72, 68, 61, 54].map((score, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/8 bg-white/2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-slate-500 w-7">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-white/15 rounded mb-2" />
                    <div className="h-2 w-24 bg-white/8 rounded mb-3" />
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500/50" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white/50">{score}</div>
                </div>
              </div>
            ))}
          </div>
        }
      />
    );
  }

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
            {fish
              ? `Top spots for ${fish} — ranked by conditions right now.`
              : "Spots ranked by solunar timing, community activity, ratings, and technique match — right now."}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <WhereFishFilters speciesNames={speciesNames} />
      </Suspense>

      {/* Stats */}
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
          {(fish || technique) && (
            <p className="text-xs mt-1">
              Try different filters or{" "}
              <Link href="/pro/where-to-fish" className="text-blue-400">clear all</Link>.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {topSpots.map((spot, i) => {
            const tip = technique ? TECHNIQUE_TIPS[technique]?.(spot.water_type ?? "") : null;

            return (
              <div
                key={spot.id}
                className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden transition-colors hover:border-white/14"
              >
                <Link href={`/spots/${spot.id}`} className="block p-5 group">
                  <div className="flex items-start gap-3">
                    <span className={`text-xl font-black w-7 shrink-0 mt-0.5 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-700"}`}>
                      #{i + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{spot.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1"><Waves size={9} className="shrink-0" />{spot.water_type}</span>
                            {spot.state && <span>{spot.state}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-white">{spot.composite}</div>
                          <div className="text-[9px] text-slate-600 uppercase tracking-wide">score</div>
                        </div>
                      </div>

                      <ScoreBar score={spot.composite} />

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

                      {/* Fish species tags */}
                      {spot.fishList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {spot.fishList.map((name) => (
                            <span
                              key={name}
                              className={`px-2 py-0.5 rounded-full text-[10px] border ${
                                fish && name === fish
                                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                                  : "bg-white/4 border-white/8 text-slate-500"
                              }`}
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}

                      {tip && (
                        <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
                          💡 {tip}
                        </p>
                      )}
                    </div>

                    <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
