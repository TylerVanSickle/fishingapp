"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";
import { MapPin, Fish, Utensils, Clock, Cloud, Wind, Droplets, ChevronRight, Zap, Thermometer, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getSpeciesTips, getSeasonLabel } from "@/lib/fishingTips";

type Spot = {
  id: string; name: string; state: string | null;
  water_type: string; latitude: number | null; longitude: number | null;
};
type Intel = {
  species: { name: string; count: number; id: string }[];
  baits: { name: string; type: string; count: number }[];
  hourHistogram: number[];
  recentCatches: { id: string; fish: string; weight: number | null; caught_at: string; bait: string | null }[];
};
type Weather = { temp: number; windspeed: number; weathercode: number; precip: number };

const WX_DESCS: Record<number, string> = {
  0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy Fog", 51: "Light Drizzle", 53: "Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
  71: "Light Snow", 73: "Snow", 80: "Rain Showers", 95: "Thunderstorm",
};

function wxDesc(code: number) {
  return WX_DESCS[code] ?? "Cloudy";
}
function wxIcon(code: number) {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code < 60) return "🌫️";
  if (code < 70) return "🌧️";
  if (code < 80) return "🌨️";
  if (code < 90) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

function computeWindows(lng: number, date: Date) {
  const peaks: { hour: number; score: number }[] = [];
  const all: number[] = [];
  for (let h = 0; h < 24; h += 0.5) {
    const t = new Date(date);
    t.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
    const s = computeFishingScore(lng, t);
    all.push(s);
  }
  for (let i = 1; i < all.length - 1; i++) {
    if (all[i] > all[i - 1] && all[i] > all[i + 1] && all[i] >= 3) {
      peaks.push({ hour: i * 0.5, score: all[i] });
    }
  }
  peaks.sort((a, b) => b.score - a.score);
  return peaks.slice(0, 4);
}

function fmtHour(h: number) {
  const hr = Math.floor(h);
  const min = (h % 1) * 60;
  const ap = hr >= 12 ? "PM" : "AM";
  const h12 = hr % 12 || 12;
  return min ? `${h12}:${String(min).padStart(2, "0")} ${ap}` : `${h12}:00 ${ap}`;
}

const HR_LABELS = ["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a",
  "12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p"];

export default function TripPlannerClient() {
  const supabase = createClient();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotId, setSpotId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [intel, setIntel] = useState<Intel | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);

  useEffect(() => {
    supabase.from("spots").select("id, name, state, water_type, latitude, longitude")
      .eq("approved", true).order("name")
      .then(({ data }) => { if (data) setSpots(data as Spot[]); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSpot = spots.find(s => s.id === spotId) ?? null;

  const loadIntel = useCallback(async (sid: string) => {
    setLoadingIntel(true);
    setIntel(null);

    const { data: catches } = await supabase
      .from("catches")
      .select("id, caught_at, weight_lbs, fish_species(id, name), baits(name, type)")
      .eq("spot_id", sid)
      .order("caught_at", { ascending: false })
      .limit(500);

    if (!catches) { setLoadingIntel(false); return; }

    const speciesCounts = new Map<string, { name: string; id: string; count: number }>();
    const baitCounts = new Map<string, { name: string; type: string; count: number }>();
    const histogram = new Array(24).fill(0);

    for (const c of catches) {
      const fish = c.fish_species as unknown as { id: string; name: string } | null;
      const bait = c.baits as unknown as { name: string; type: string } | null;
      if (fish) {
        const e = speciesCounts.get(fish.id) ?? { name: fish.name, id: fish.id, count: 0 };
        e.count++; speciesCounts.set(fish.id, e);
      }
      if (bait) {
        const k = `${bait.name}|${bait.type}`;
        const e = baitCounts.get(k) ?? { name: bait.name, type: bait.type, count: 0 };
        e.count++; baitCounts.set(k, e);
      }
      histogram[new Date(c.caught_at).getHours()]++;
    }

    setIntel({
      species: [...speciesCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6),
      baits: [...baitCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6),
      hourHistogram: histogram,
      recentCatches: catches.slice(0, 10).map(c => {
        const fish = c.fish_species as unknown as { name: string } | null;
        const bait = c.baits as unknown as { name: string } | null;
        return { id: c.id, fish: fish?.name ?? "Unknown", weight: c.weight_lbs, caught_at: c.caught_at, bait: bait?.name ?? null };
      }),
    });
    setLoadingIntel(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!spotId) return;
    loadIntel(spotId);
  }, [spotId, loadIntel]);

  useEffect(() => {
    if (!selectedSpot?.latitude || !selectedSpot?.longitude) return;
    setWeather(null);
    const { latitude: lat, longitude: lng } = selectedSpot;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,windspeed_10m,weathercode,precipitation&temperature_unit=fahrenheit&windspeed_unit=mph`)
      .then(r => r.json())
      .then(d => {
        if (d.current) setWeather({
          temp: Math.round(d.current.temperature_2m),
          windspeed: Math.round(d.current.windspeed_10m),
          weathercode: d.current.weathercode,
          precip: d.current.precipitation,
        });
      }).catch(() => {});
  }, [selectedSpot]);

  const spotOptions = spots.map(s => ({
    id: s.id, label: s.name,
    sub: [s.water_type, s.state].filter(Boolean).join(" · "),
  }));

  const solunarPeaks = selectedSpot?.longitude
    ? computeWindows(selectedSpot.longitude, new Date(selectedDate + "T12:00:00"))
    : [];

  const maxHist = intel ? Math.max(...intel.hourHistogram, 1) : 1;
  const peakHours = intel
    ? [...intel.hourHistogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([, c]) => c > 0)
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <MapPin className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Trip Planner</h1>
          <p className="text-slate-500 text-xs">Pick a spot · get intel · catch more fish</p>
        </div>
      </div>

      {/* Pickers */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1.5">Where are you going?</label>
          <SearchableSelect options={spotOptions} value={spotId} onChange={setSpotId} placeholder="Search for a lake or river..." />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Trip date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors scheme-dark text-sm" />
        </div>
      </div>

      {/* Empty state */}
      {!spotId && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <MapPin size={32} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-400 font-medium">Select a spot to get your trip intel</p>
          <p className="text-slate-600 text-sm mt-1">Fish species, top baits, best times of day, weather &amp; solunar forecast</p>
        </div>
      )}

      {spotId && selectedSpot && (
        <div className="flex flex-col gap-5">
          {/* Spot header */}
          <div className="p-4 rounded-2xl border border-white/8 bg-white/2 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-lg">{selectedSpot.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {[selectedSpot.water_type, selectedSpot.state].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Link href={`/spots/${selectedSpot.id}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View spot <ChevronRight size={12} />
            </Link>
          </div>

          {/* Weather + Solunar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-white/8 bg-white/2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Cloud size={11} /> Current Conditions
              </h3>
              {!selectedSpot.latitude ? (
                <p className="text-sm text-slate-600">No coordinates for this spot</p>
              ) : !weather ? (
                <div className="h-16 flex items-center">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{wxIcon(weather.weathercode)}</span>
                  <div>
                    <p className="text-2xl font-bold text-white">{weather.temp}°F</p>
                    <p className="text-xs text-slate-500">{wxDesc(weather.weathercode)}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                      <span className="flex items-center gap-0.5"><Wind size={10} /> {weather.windspeed} mph</span>
                      {weather.precip > 0 && <span className="flex items-center gap-0.5"><Droplets size={10} /> {weather.precip}&quot; precip</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-white/8 bg-white/2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Zap size={11} /> Solunar Windows
              </h3>
              {!selectedSpot.longitude ? (
                <p className="text-sm text-slate-600">No coordinates for this spot</p>
              ) : solunarPeaks.length === 0 ? (
                <p className="text-sm text-slate-600">No strong feeding windows today</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {solunarPeaks.map((p, i) => {
                    const sl = scoreLabel(p.score);
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{fmtHour(p.hour)}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full bg-white/10 w-16 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${p.score * 10}%`, background: sl.color }} />
                          </div>
                          <span className="text-xs font-medium w-14" style={{ color: sl.color }}>{sl.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {loadingIntel ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : intel ? (
            <>
              {/* Species + Baits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-white/8 bg-white/2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Fish size={11} /> Top Species Here
                  </h3>
                  {intel.species.length === 0 ? (
                    <p className="text-sm text-slate-600">No community catch data yet</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {intel.species.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500"
                              style={{ width: `${(s.count / intel.species[0].count) * 100}%` }} />
                          </div>
                          <Link href={`/target/${s.id}`} className="text-sm text-slate-300 hover:text-white transition-colors w-28 truncate text-right">
                            {s.name}
                          </Link>
                          <span className="text-xs text-slate-600 w-6 text-right">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-white/8 bg-white/2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Utensils size={11} /> What&apos;s Working
                  </h3>
                  {intel.baits.length === 0 ? (
                    <p className="text-sm text-slate-600">No bait data yet</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {intel.baits.map((b, i) => (
                        <div key={`${b.name}-${b.type}`} className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div className="h-full rounded-full bg-green-500"
                              style={{ width: `${(b.count / intel.baits[0].count) * 100}%` }} />
                          </div>
                          <span className="text-sm text-slate-300 w-28 truncate text-right">{b.name}</span>
                          <span className="text-xs text-slate-600 w-6 text-right">{b.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Species-specific tips for top species */}
              {intel.species.length > 0 && selectedSpot && (() => {
                const date = new Date(selectedDate + "T12:00:00");
                const season = getSeasonLabel(date);
                return (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Target size={11} /> Species Intel · {season}
                    </h3>
                    {intel.species.slice(0, 3).map((s) => {
                      const tips = getSpeciesTips(s.name, selectedSpot.water_type, date);
                      return (
                        <div key={s.id} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
                          <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Fish size={13} className="text-blue-400" />
                              <span className="font-semibold text-sm text-white">{s.name}</span>
                              <span className="text-xs text-slate-600">{s.count} catches here</span>
                            </div>
                            <Link href={`/target/${s.id}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors">
                              More intel <ChevronRight size={11} />
                            </Link>
                          </div>
                          <div className="p-4 space-y-3">
                            {/* Water type note */}
                            <div className="flex items-start gap-2">
                              <MapPin size={11} className="text-blue-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-300 leading-relaxed">{tips.waterNote}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2.5 rounded-lg bg-white/4 border border-white/6">
                                <p className="text-[10px] text-slate-600 mb-1 flex items-center gap-1"><Thermometer size={9} /> Ideal temp</p>
                                <p className="text-xs text-slate-200 font-medium">{tips.tempRange}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-white/4 border border-white/6">
                                <p className="text-[10px] text-slate-600 mb-1 flex items-center gap-1"><Zap size={9} /> Target depth</p>
                                <p className="text-xs text-slate-200 font-medium">{tips.depth}</p>
                              </div>
                            </div>
                            {/* Season strategy */}
                            <div className="p-3 rounded-lg bg-amber-500/6 border border-amber-500/15">
                              <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <TrendingUp size={9} /> {season} strategy
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed mb-2">{tips.technique}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {tips.baits.map((b) => (
                                  <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/12 border border-amber-500/20 text-amber-300">{b}</span>
                                ))}
                              </div>
                            </div>
                            {/* Structure + timing */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-start gap-2">
                                <Target size={10} className="text-purple-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400"><span className="text-slate-500">Where:</span> {tips.structure}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock size={10} className="text-cyan-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400"><span className="text-slate-500">When:</span> {tips.timing}</p>
                              </div>
                            </div>
                            {/* Season note */}
                            <p className="text-xs text-slate-500 italic leading-relaxed border-t border-white/5 pt-2">{tips.seasonNote}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Time of day histogram */}
              <div className="p-4 rounded-2xl border border-white/8 bg-white/2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Clock size={11} /> Best Times of Day
                </h3>
                {peakHours.length > 0 && (
                  <p className="text-xs text-slate-600 mb-3">
                    Peak hours: {peakHours.map(([h]) => HR_LABELS[h]).join(", ")}
                  </p>
                )}
                <div className="flex items-end gap-px h-14 mt-2">
                  {intel.hourHistogram.map((count, h) => (
                    <div key={h} className="flex-1 flex items-end">
                      <div
                        className={`w-full rounded-sm ${count > 0 && count === Math.max(...intel.hourHistogram) ? "bg-blue-500" : count > 0 ? "bg-white/20" : "bg-transparent"}`}
                        style={{ height: `${Math.max((count / maxHist) * 100, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-700 mt-1.5 px-0.5">
                  <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
                </div>
              </div>

              {/* Tips */}
              <div className="p-4 rounded-2xl border border-amber-500/15 bg-amber-500/5">
                <h3 className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest mb-3">Trip Tips</h3>
                <div className="flex flex-col gap-2.5 text-sm text-slate-400">
                  {intel.species.length > 0 && (
                    <p>• <span className="text-slate-200">{intel.species[0].name}</span> is the most-caught species here — {intel.species[0].count} catches logged by the community.</p>
                  )}
                  {intel.baits.length > 0 && (
                    <p>• Community data says <span className="text-slate-200">{intel.baits[0].name}</span> is the top producer at this spot ({intel.baits[0].count} catches).</p>
                  )}
                  {peakHours.length > 0 && (
                    <p>• Historically, <span className="text-slate-200">{HR_LABELS[peakHours[0][0]]}</span> is the best hour here based on {peakHours[0][1]} logged catches during that window.</p>
                  )}
                  {solunarPeaks.length > 0 && (
                    <p>• Top solunar feeding window on {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}: <span className="text-slate-200">{fmtHour(solunarPeaks[0].hour)}</span> — try to be on the water before that window opens.</p>
                  )}
                  {weather && weather.weathercode <= 1 && (
                    <p>• Clear skies can push fish deeper. Try slower retrieves near structure or drop-offs.</p>
                  )}
                  {weather && weather.weathercode >= 60 && weather.weathercode < 80 && (
                    <p>• Rain in the forecast. Pre-front conditions often trigger feeding — get out early.</p>
                  )}
                  {intel.species.length === 0 && intel.baits.length === 0 && (
                    <p>• No catch data yet for this spot. Be the first to log one!</p>
                  )}
                </div>
              </div>

              {/* Recent catches */}
              {intel.recentCatches.length > 0 && (
                <div className="p-4 rounded-2xl border border-white/8 bg-white/2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recent Catches Here</h3>
                  <div className="flex flex-col">
                    {intel.recentCatches.map(c => (
                      <Link key={c.id} href={`/catches/${c.id}`}
                        className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 hover:bg-white/2 -mx-1 px-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                          <Fish size={13} className="text-slate-600 shrink-0" />
                          <div>
                            <p className="text-sm text-slate-300">{c.fish}</p>
                            {c.bait && <p className="text-xs text-slate-600">{c.bait}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          {c.weight != null && <p className="text-sm text-slate-400">{c.weight} lbs</p>}
                          <p className="text-xs text-slate-600">
                            {new Date(c.caught_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
