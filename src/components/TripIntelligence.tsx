"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Fish, Utensils, MapPin, Clock, ThumbsUp, ThumbsDown,
  AlertTriangle, Zap, Thermometer, ChevronDown, ChevronUp,
  TrendingUp, Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSpeciesTips, getSeasonLabel } from "@/lib/fishingTips";

type Spot = {
  id: string;
  name: string;
  water_type: string;
  state: string | null;
};
type Species = { id: string; name: string };

interface SpotSpeciesData {
  spotId: string;
  speciesId: string;
  catchCount: number;
  topBaits: { name: string; count: number }[];
  bestHours: number[]; // hours with most catches
}

interface Props {
  spots: Spot[];
  targetSpeciesIds: string[];
  allSpecies: Species[];
  plannedDate: string; // YYYY-MM-DD
}

function ConfidenceBadge({ count }: { count: number }) {
  if (count === 0) return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/12 border border-red-500/20 text-red-400">
      <ThumbsDown size={9} /> Not logged here
    </span>
  );
  if (count < 3) return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/12 border border-amber-500/20 text-amber-400">
      <AlertTriangle size={9} /> Rare ({count} catch{count !== 1 ? "es" : ""})
    </span>
  );
  if (count < 10) return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/12 border border-blue-500/20 text-blue-400">
      <ThumbsUp size={9} /> Confirmed ({count} catches)
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/12 border border-green-500/20 text-green-400">
      <TrendingUp size={9} /> Hot spot ({count}+ catches)
    </span>
  );
}

function fmtHour(h: number) {
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}${ap}`;
}

export default function TripIntelligence({ spots, targetSpeciesIds, allSpecies, plannedDate }: Props) {
  const supabase = createClient();
  const [data, setData] = useState<SpotSpeciesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const targetSpecies = allSpecies.filter((s) => targetSpeciesIds.includes(s.id));
  const date = plannedDate ? new Date(plannedDate + "T12:00:00") : new Date();

  useEffect(() => {
    if (spots.length === 0 || targetSpeciesIds.length === 0) {
      setData([]);
      return;
    }

    setLoading(true);
    const spotIds = spots.map((s) => s.id);

    // Fetch all catches at these spots for these species
    supabase
      .from("catches")
      .select("spot_id, fish_id, caught_at, baits(name)")
      .in("spot_id", spotIds)
      .in("fish_id", targetSpeciesIds)
      .then(({ data: catches }) => {
        const result: SpotSpeciesData[] = [];

        for (const spot of spots) {
          for (const species of targetSpecies) {
            const relevant = (catches ?? []).filter(
              (c) => c.spot_id === spot.id && c.fish_id === species.id
            );

            // Bait tallies
            const baitMap = new Map<string, number>();
            for (const c of relevant) {
              const b = c.baits as unknown as { name: string } | null;
              if (b?.name) baitMap.set(b.name, (baitMap.get(b.name) ?? 0) + 1);
            }
            const topBaits = [...baitMap.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([name, count]) => ({ name, count }));

            // Hour histogram
            const hourMap = new Map<number, number>();
            for (const c of relevant) {
              const h = new Date(c.caught_at).getHours();
              hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
            }
            const bestHours = [...hourMap.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([h]) => h);

            result.push({
              spotId: spot.id,
              speciesId: species.id,
              catchCount: relevant.length,
              topBaits,
              bestHours,
            });
          }
        }

        setData(result);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots.map(s => s.id).join(","), targetSpeciesIds.join(",")]);

  if (spots.length === 0 || targetSpeciesIds.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Target size={11} /> Trip Intelligence
        </h3>
        <p className="text-sm text-slate-600">
          {spots.length === 0 && targetSpeciesIds.length === 0
            ? "Add spots and target species to unlock AI-powered trip intelligence."
            : spots.length === 0
            ? "Add at least one spot to see species intel."
            : "Select target species to see how they match your spots."}
        </p>
      </div>
    );
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const season = getSeasonLabel(date);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Target size={11} /> Trip Intelligence · {season}
        </h3>
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {spots.map((spot) => (
        <div key={spot.id} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
          {/* Spot header */}
          <div className="px-5 py-3 border-b border-white/6 flex items-center gap-2">
            <MapPin size={12} className="text-blue-400 shrink-0" />
            <Link href={`/spots/${spot.id}`} className="text-sm font-semibold text-white hover:text-blue-300 transition-colors">
              {spot.name}
            </Link>
            <span className="text-xs text-slate-600 capitalize ml-1">{spot.water_type}</span>
          </div>

          {/* Species cards */}
          <div className="divide-y divide-white/4">
            {targetSpecies.map((species) => {
              const entry = data.find((d) => d.spotId === spot.id && d.speciesId === species.id);
              const tips = getSpeciesTips(species.name, spot.water_type, date);
              const key = `${spot.id}-${species.id}`;
              const isOpen = expanded.has(key);

              return (
                <div key={key}>
                  {/* Summary row */}
                  <button
                    onClick={() => toggleExpand(key)}
                    className="w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-white/3 transition-colors"
                  >
                    <Fish size={13} className="text-slate-500 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-slate-200">{species.name}</span>
                    {entry && <ConfidenceBadge count={entry.catchCount} />}
                    {loading && !entry && (
                      <div className="w-3 h-3 border border-slate-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {isOpen ? <ChevronUp size={12} className="text-slate-600 shrink-0" /> : <ChevronDown size={12} className="text-slate-600 shrink-0" />}
                  </button>

                  {/* Expanded intel */}
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4">

                      {/* Community data */}
                      {entry && entry.catchCount > 0 && (
                        <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 space-y-2.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Community Data</p>
                          {entry.topBaits.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Utensils size={11} className="text-green-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Proven baits at this spot</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {entry.topBaits.map((b) => (
                                    <span key={b.name} className="text-xs px-2 py-0.5 rounded-full bg-green-500/12 border border-green-500/20 text-green-300">
                                      {b.name} <span className="text-green-600">×{b.count}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {entry.bestHours.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Clock size={11} className="text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Best hours logged here</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {entry.bestHours.map((h) => (
                                    <span key={h} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/12 border border-blue-500/20 text-blue-300">
                                      {fmtHour(h)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* No data warning */}
                      {entry && entry.catchCount === 0 && (
                        <div className="p-3 rounded-xl bg-amber-500/6 border border-amber-500/15 flex items-start gap-2">
                          <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-300/80">
                            No community catches of {species.name} logged at {spot.name} yet. Could be untapped — or they may not be present. Use the expert tips below as your guide.
                          </p>
                        </div>
                      )}

                      {/* Water type intel */}
                      <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-2.5">
                        <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">
                          {species.name} in {spot.water_type.charAt(0).toUpperCase() + spot.water_type.slice(1)}s
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">{tips.waterNote}</p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="flex items-start gap-1.5">
                            <Thermometer size={10} className="text-orange-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-600">Ideal temp</p>
                              <p className="text-xs text-slate-300">{tips.tempRange}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Zap size={10} className="text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-600">Target depth</p>
                              <p className="text-xs text-slate-300">{tips.depth}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Season tips */}
                      <div className="p-3.5 rounded-xl bg-white/3 border border-white/8 space-y-2.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <TrendingUp size={9} /> {season} Strategy
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{tips.technique}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{tips.seasonNote}</p>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-start gap-2">
                            <Utensils size={10} className="text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-600 mb-1">Expert bait picks for {season.toLowerCase()}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {tips.baits.map((b) => (
                                  <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin size={10} className="text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-600 mb-0.5">Where to look</p>
                              <p className="text-xs text-slate-400">{tips.structure}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Clock size={10} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-slate-600 mb-0.5">Best window</p>
                              <p className="text-xs text-slate-400">{tips.timing}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
