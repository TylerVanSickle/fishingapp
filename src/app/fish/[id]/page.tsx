import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: fish } = await supabase
    .from("fish_species")
    .select("name, description")
    .eq("id", id)
    .single();
  if (!fish) return { title: "Fish Species — HookLine" };
  const title = `${fish.name} — HookLine`;
  const description = fish.description ?? `Learn about ${fish.name}: habitat, best seasons, top baits, and more on HookLine.`;
  // Try to get a Wikipedia image for the OG image
  let imageUrl: string | null = null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fish.name)}`, {
      headers: { "User-Agent": "HookLineApp/1.0" },
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      imageUrl = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    }
  } catch { /* ignore */ }
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
import { ArrowLeft, Fish, MapPin, Calendar, Ruler, Scale, Info, Waves, Zap, BookOpen, Sparkles, Target } from "lucide-react";
import ProBadge from "@/components/ProBadge";

const SEASON_COLORS: Record<string, string> = {
  spring: "text-green-400 bg-green-500/10 border-green-500/20",
  summer: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  fall:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  winter: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

async function fetchWikipediaData(name: string): Promise<{ imageUrl: string | null; wikiExtract: string | null }> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      {
        headers: { "User-Agent": "HookLineApp/1.0 (fishing-community-app)" },
        next: { revalidate: 86400 }, // cache 24h
      }
    );
    if (!res.ok) return { imageUrl: null, wikiExtract: null };
    const data = await res.json();
    return {
      imageUrl: data.originalimage?.source ?? data.thumbnail?.source ?? null,
      wikiExtract: data.extract ?? null,
    };
  } catch {
    return { imageUrl: null, wikiExtract: null };
  }
}

// Technique-specific tips by habitat/diet keywords
function getTacticsTips(fish: { habitat?: string | null; diet?: string | null; water_type_preference?: string | null }): Record<string, string> {
  const habitat = (fish.habitat ?? "").toLowerCase();
  const diet = (fish.diet ?? "").toLowerCase();
  const isRiver = habitat.includes("river") || habitat.includes("stream") || habitat.includes("current");
  const isLake = habitat.includes("lake") || habitat.includes("reservoir") || habitat.includes("still");
  const eatsBait = diet.includes("insect") || diet.includes("worm") || diet.includes("invertebrate");
  const eatsFish = diet.includes("fish") || diet.includes("shad") || diet.includes("baitfish");

  return {
    "🪰 Fly Fishing": isRiver
      ? "Work dry flies during evening hatches near riffles and seams. Nymph near the bottom in deeper pools during midday."
      : eatsBait
        ? "Streamer patterns along weed edges at dawn. Dry fly when surface activity is visible."
        : "Try large streamers stripped fast near structure — triggering reaction strikes.",
    "🎣 Spinning": eatsFish
      ? "Cast parallel to structure with 3–5\" soft plastics. Vary retrieve speed until you find the strike zone."
      : "Lightweight jigs 1/16–1/4 oz work well. Slow roll near the bottom in cold water, faster in warm.",
    "🪱 Bait Fishing": eatsBait
      ? "Live nightcrawlers or wax worms suspended under a float during feeding windows. Bottom rigs at depth after midday."
      : "Cut bait or live minnows near structure. Fish heavier in current, lighter in still water.",
    "🐟 Lure / Jerkbait": eatsFish
      ? "Jerkbaits and crankbaits matching local forage. Pause-and-twitch retrieve triggers hesitant fish."
      : "Small spinners or in-line spinnerbaits. Erratic retrieve near cover in low-light conditions.",
  };
}

export default async function FishSpeciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  const { data: fish } = await supabase
    .from("fish_species")
    .select("*")
    .eq("id", id)
    .single();

  if (!fish) notFound();

  // Spots where this fish is found
  const { data: spotFish } = await supabase
    .from("spot_fish")
    .select("spots(id, name, water_type, latitude, longitude)")
    .eq("fish_id", id);

  const spots = (spotFish ?? [])
    .map((sf) => (sf.spots as unknown as { id: string; name: string; water_type: string } | null))
    .filter(Boolean) as { id: string; name: string; water_type: string }[];

  // Catch stats
  const { data: catches } = await supabase
    .from("catches")
    .select("weight_lbs, length_in, caught_at, baits(name), spots(name)")
    .eq("fish_id", id)
    .not("weight_lbs", "is", null)
    .order("weight_lbs", { ascending: false });

  const totalCatches = catches?.length ?? 0;
  const recordCatch = catches?.[0] ?? null;
  const avgWeight = totalCatches > 0
    ? (catches!.reduce((s, c) => s + (c.weight_lbs ?? 0), 0) / totalCatches).toFixed(1)
    : null;

  // Top baits
  const { data: allCatches } = await supabase
    .from("catches")
    .select("baits(name)")
    .eq("fish_id", id)
    .not("bait_id", "is", null);

  const baitCounts: Record<string, number> = {};
  allCatches?.forEach((c) => {
    const bait = c.baits as unknown as { name: string } | null;
    if (bait?.name) baitCounts[bait.name] = (baitCounts[bait.name] ?? 0) + 1;
  });
  const topBaits = Object.entries(baitCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Wikipedia photo + extract
  const { imageUrl, wikiExtract } = await fetchWikipediaData(fish.name);

  // Pro targeting tips
  const tacticsTips = getTacticsTips(fish as { habitat?: string | null; diet?: string | null });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/fish" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> All Species
      </Link>

      {/* Hero — photo banner */}
      {imageUrl && (
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/8 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={fish.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-[#060d1a] via-[#060d1a]/30 to-transparent" />
          <div className="absolute bottom-4 left-5">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{fish.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Photo via{" "}
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(fish.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                Wikipedia
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Hero card (no photo) */}
      <div className={`p-6 rounded-2xl border border-white/8 bg-white/2 mb-6 ${imageUrl ? "" : ""}`}>
        {!imageUrl && (
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Fish size={28} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-1">{fish.name}</h1>
            </div>
          </div>
        )}

        {/* Description — prefer DB field, fall back to Wikipedia extract */}
        {(fish.description || wikiExtract) && (
          <p className="text-slate-400 leading-relaxed text-sm mb-5">
            {fish.description || wikiExtract}
          </p>
        )}

        {/* Quick stats */}
        {(totalCatches > 0 || fish.legal_size_in) && (
          <div className="flex flex-wrap gap-5 pt-4 border-t border-white/6">
            {totalCatches > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalCatches}</div>
                <div className="text-xs text-slate-500">Logged catches</div>
              </div>
            )}
            {recordCatch?.weight_lbs && (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{recordCatch.weight_lbs} lbs</div>
                <div className="text-xs text-slate-500">Record (this app)</div>
              </div>
            )}
            {avgWeight && (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{avgWeight} lbs</div>
                <div className="text-xs text-slate-500">Avg weight</div>
              </div>
            )}
            {fish.legal_size_in && (
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{fish.legal_size_in}&quot;</div>
                <div className="text-xs text-slate-500">Legal size</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {fish.identification_tips && (
            <div className="p-5 rounded-2xl border border-amber-500/15 bg-amber-500/5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-3 uppercase tracking-wide">
                <Zap size={14} /> How to Identify
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{fish.identification_tips}</p>
            </div>
          )}

          {fish.color_description && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                <BookOpen size={14} /> Appearance
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{fish.color_description}</p>
            </div>
          )}

          {fish.habitat && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                <Waves size={14} /> Habitat
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{fish.habitat}</p>
            </div>
          )}

          {fish.diet && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                <Fish size={14} /> Diet &amp; Feeding
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{fish.diet}</p>
            </div>
          )}

          {fish.similar_species && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                <Info size={14} /> Similar Species
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{fish.similar_species}</p>
            </div>
          )}

          {fish.fun_fact && (
            <div className="p-5 rounded-2xl border border-blue-500/15 bg-blue-500/5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wide">
                Did You Know?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">{fish.fun_fact}</p>
            </div>
          )}

          {/* Pro Targeting Guide */}
          <div className="p-5 rounded-2xl border border-amber-500/15 bg-amber-500/4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-400/90 uppercase tracking-wide">Targeting Guide</h2>
              <ProBadge />
              {!isPro && (
                <Link href="/pro" className="ml-auto text-xs text-amber-400/70 hover:text-amber-300 underline">Unlock →</Link>
              )}
            </div>
            {isPro ? (
              <div className="space-y-3">
                {Object.entries(tacticsTips).map(([technique, tip]) => (
                  <div key={technique} className="p-3 rounded-xl bg-white/4 border border-white/8">
                    <p className="text-xs font-semibold text-slate-300 mb-1">{technique}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{tip}</p>
                  </div>
                ))}
                <Link
                  href={`/pro/where-to-fish`}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 transition-colors text-sm font-medium"
                >
                  <MapPin size={13} /> Find spots for {fish.name} now
                </Link>
              </div>
            ) : (
              <div className="relative">
                <div className="blur-sm pointer-events-none select-none space-y-2">
                  {Object.keys(tacticsTips).map((technique) => (
                    <div key={technique} className="p-3 rounded-xl bg-white/4 border border-white/8">
                      <p className="text-xs font-semibold text-slate-500 mb-1">{technique}</p>
                      <div className="h-2 bg-white/10 rounded w-4/5 mb-1" />
                      <div className="h-2 bg-white/10 rounded w-3/5" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <p className="text-sm text-white font-medium">Technique tips locked</p>
                  <Link href="/pro" className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors">
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {fish.best_seasons && fish.best_seasons.length > 0 && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                <Calendar size={13} /> Best Seasons
              </h2>
              <div className="flex flex-wrap gap-2">
                {fish.best_seasons.map((s: string) => (
                  <span key={s} className={`px-3 py-1 rounded-full border text-sm font-medium capitalize ${SEASON_COLORS[s] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fish.best_seasons && fish.best_seasons.length > 0 && (() => {
            const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const MONTH_SEASONS = ['winter','winter','spring','spring','spring','summer','summer','summer','fall','fall','fall','winter'];
            const SEASON_MONTH_COLORS: Record<string, string> = {
              spring: "bg-green-500/30 border-green-500/40 text-green-300",
              summer: "bg-yellow-500/30 border-yellow-500/40 text-yellow-300",
              fall:   "bg-orange-500/30 border-orange-500/40 text-orange-300",
              winter: "bg-sky-500/30 border-sky-500/40 text-sky-300",
            };
            return (
              <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
                <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                  <Calendar size={13} /> Best Times to Fish
                </h2>
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTHS.map((month, i) => {
                    const season = MONTH_SEASONS[i] ?? "";
                    const active = (fish.best_seasons as string[]).includes(season);
                    return (
                      <div
                        key={month}
                        className={`text-xs px-2 py-1.5 rounded-lg border text-center font-medium ${active ? (SEASON_MONTH_COLORS[season] ?? "bg-white/3 border-white/8 text-slate-600") : "bg-white/3 border-white/8 text-slate-600"}`}
                      >
                        {month}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {fish.legal_size_in && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                <Ruler size={13} /> Regulations
              </h2>
              <p className="text-sm text-slate-300">
                Minimum size: <span className="font-semibold text-white">{fish.legal_size_in}&quot;</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">Always verify current local regulations — rules vary by water body.</p>
            </div>
          )}

          {topBaits.length > 0 && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                Top Baits
                <span className="text-slate-700 font-normal normal-case">from catches</span>
              </h2>
              <div className="space-y-2">
                {topBaits.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-mono w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="h-1 rounded-full bg-blue-600/25" style={{ width: `${(count / topBaits[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{name}</span>
                    <span className="text-xs text-slate-700 w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {spots.length > 0 && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                <MapPin size={13} /> Spots
              </h2>
              <div className="space-y-2">
                {spots.map((s) => (
                  <Link
                    key={s.id}
                    href={`/spots/${s.id}`}
                    className="flex items-center justify-between text-sm text-slate-300 hover:text-white transition-colors group"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs text-slate-600 capitalize group-hover:text-blue-400 transition-colors">{s.water_type}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/log-catch?fish=${fish.id}`}
            className="block w-full py-2.5 text-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            Log a {fish.name} Catch
          </Link>
        </div>
      </div>
    </div>
  );
}
