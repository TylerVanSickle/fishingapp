import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Fish, Waves, Plus, MapPin } from "lucide-react";
import NearMeSpots from "@/components/NearMeSpots";

const WATER_TABS = [
  { id: "all",       label: "All",             types: null },
  { id: "flowing",   label: "Rivers & Streams", types: ["river", "stream"] },
  { id: "lake",      label: "Lakes",            types: ["lake"] },
  { id: "reservoir", label: "Reservoirs",       types: ["reservoir"] },
  { id: "pond",      label: "Ponds",            types: ["pond"] },
];

const WATER_COLOR: Record<string, string> = {
  river:     "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  stream:    "text-sky-400 bg-sky-500/10 border-sky-500/20",
  lake:      "text-blue-400 bg-blue-500/10 border-blue-500/20",
  reservoir: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  pond:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export default async function SpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; state?: string }>;
}) {
  const { type = "all", state = "" } = await searchParams;
  const supabase = await createClient();

  const tab = WATER_TABS.find((t) => t.id === type) ?? WATER_TABS[0];

  // Fetch all approved spots (with fish) — we'll filter state client-side via query
  let query = supabase
    .from("spots")
    .select(`*, latitude, longitude, spot_fish ( fish_species ( id, name ) )`)
    .eq("approved", true)
    .order("name");

  if (tab.types) query = query.in("water_type", tab.types);
  if (state) query = query.eq("state", state);

  const { data: spots } = await query;

  // Get distinct states for the selector
  const { data: allSpots } = await supabase
    .from("spots")
    .select("state")
    .eq("approved", true)
    .not("state", "is", null);

  const states = [...new Set((allSpots ?? []).map((s: { state: string | null }) => s.state).filter(Boolean) as string[])].sort();

  // Build URL helper preserving other params
  function stateUrl(s: string) {
    const params = new URLSearchParams();
    if (type && type !== "all") params.set("type", type);
    if (s) params.set("state", s);
    const q = params.toString();
    return `/spots${q ? `?${q}` : ""}`;
  }
  function typeUrl(t: string) {
    const params = new URLSearchParams();
    if (t && t !== "all") params.set("type", t);
    if (state) params.set("state", state);
    const q = params.toString();
    return `/spots${q ? `?${q}` : ""}`;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fishing Spots</h1>
          <p className="text-slate-500 text-sm mt-0.5">{spots?.length ?? 0} location{spots?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/submit-spot"
          className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
        >
          <Plus size={14} /> Add Spot
        </Link>
      </div>

      {/* State filter */}
      {states.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <MapPin size={13} className="text-slate-500 shrink-0" />
          <Link
            href={stateUrl("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !state
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-slate-400 border border-white/10 hover:border-blue-500/30 hover:text-slate-200"
            }`}
          >
            All States
          </Link>
          {states.map((s) => (
            <Link
              key={s}
              href={stateUrl(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                state === s
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:border-blue-500/30 hover:text-slate-200"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      {/* Near Me */}
      <NearMeSpots spots={(spots ?? []) as Parameters<typeof NearMeSpots>[0]["spots"]} />

      {/* Water type tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {WATER_TABS.map((t) => (
          <Link
            key={t.id}
            href={typeUrl(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              type === t.id
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-slate-400 border border-white/10 hover:border-blue-500/30 hover:text-slate-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!spots || spots.length === 0 ? (
        <div className="text-center py-24 text-slate-600">
          <Fish size={40} className="mx-auto mb-4 opacity-30" />
          <p>No spots in this category yet.</p>
          <Link href="/submit-spot" className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-400">
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spots.map((spot) => {
            const fish = spot.spot_fish
              .map((sf: { fish_species: { id: string; name: string } | null }) => sf.fish_species)
              .filter(Boolean) as { id: string; name: string }[];

            const wtColor = WATER_COLOR[spot.water_type] ?? WATER_COLOR.lake;

            return (
              <Link
                key={spot.id}
                href={`/spots/${spot.id}`}
                className="group block p-5 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight">
                      {spot.name}
                    </h2>
                    {spot.state && (
                      <span className="text-xs text-slate-600 mt-0.5 block">{spot.state}</span>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${wtColor}`}>
                    <Waves size={10} />
                    <span className="capitalize">{spot.water_type}</span>
                  </span>
                </div>

                {spot.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{spot.description}</p>
                )}

                {fish.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Fish size={11} className="text-blue-400 shrink-0" />
                    {fish.map((f) => (
                      <span
                        key={f.id}
                        className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end">
                  <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View details →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
