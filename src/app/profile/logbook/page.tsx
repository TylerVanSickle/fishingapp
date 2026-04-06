"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Fish, Scale, Ruler, MapPin, Calendar,
  Filter, ChevronRight, Camera, Lock,
} from "lucide-react";

type SearchParams = Promise<{
  species?: string;
  spot?: string;
  from?: string;
  to?: string;
  sort?: string;
  photo?: string;
}>;

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function LogbookPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profile/logbook");

  // Build the query with filters
  let query = supabase
    .from("catches")
    .select("id, caught_at, weight_lbs, length_in, notes, photo_url, is_private, fish_species(id, name), spots(id, name, water_type, state), baits(name)")
    .eq("user_id", user.id);

  if (sp.species) query = query.eq("fish_id", sp.species);
  if (sp.spot)    query = query.eq("spot_id", sp.spot);
  if (sp.from)    query = query.gte("caught_at", new Date(sp.from).toISOString());
  if (sp.to)      query = query.lte("caught_at", new Date(sp.to + "T23:59:59").toISOString());
  if (sp.photo === "1") query = query.not("photo_url", "is", null);

  const sortCol = sp.sort === "weight" ? "weight_lbs" : sp.sort === "length" ? "length_in" : "caught_at";
  query = query.order(sortCol, { ascending: false, nullsFirst: false });

  const { data: catches } = await query.limit(200);

  // Fetch filter options in parallel
  const [{ data: allFish }, { data: allSpots }] = await Promise.all([
    supabase.from("fish_species").select("id, name").order("name"),
    supabase.from("spots").select("id, name").eq("approved", true).order("name"),
  ]);

  // Compute quick stats from result set
  const totalCatches = catches?.length ?? 0;
  const withWeight = catches?.filter(c => c.weight_lbs != null) ?? [];
  const heaviest = withWeight.reduce<(typeof withWeight)[0] | null>((best, c) => c.weight_lbs! > (best?.weight_lbs ?? 0) ? c : best, null);
  const totalWeight = withWeight.reduce((sum, c) => sum + (c.weight_lbs ?? 0), 0);
  const speciesSet = new Set(catches?.map(c => (c.fish_species as unknown as { id: string } | null)?.id).filter(Boolean));
  const withPhoto = catches?.filter(c => c.photo_url).length ?? 0;

  const hasFilters = !!(sp.species || sp.spot || sp.from || sp.to || sp.photo);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center">
          <BookOpen className="text-emerald-400" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white leading-tight">My Logbook</h1>
          <p className="text-slate-500 text-xs">Your complete catch history</p>
        </div>
        <Link href="/log-catch" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
          + Log Catch
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Catches", value: totalCatches, icon: Fish, color: "text-blue-400" },
          { label: "Species", value: speciesSet.size, icon: Fish, color: "text-green-400" },
          { label: "With Photos", value: withPhoto, icon: Camera, color: "text-violet-400" },
          { label: "Total Weight", value: totalWeight > 0 ? `${totalWeight.toFixed(1)} lbs` : "—", icon: Scale, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-3 rounded-xl border border-white/8 bg-white/2 flex items-center gap-3">
            <Icon size={16} className={color} />
            <div>
              <p className="text-lg font-bold text-white leading-none">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="mb-6 p-4 rounded-2xl border border-white/8 bg-white/2">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={13} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Filter & Sort</span>
          {hasFilters && (
            <Link href="/profile/logbook" className="ml-auto text-xs text-blue-400 hover:text-blue-300">
              Clear filters
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <select name="species" defaultValue={sp.species ?? ""} className="col-span-1 px-3 py-2 rounded-lg bg-[#0c1a2e] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
            <option value="">All Species</option>
            {allFish?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select name="spot" defaultValue={sp.spot ?? ""} className="col-span-1 px-3 py-2 rounded-lg bg-[#0c1a2e] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
            <option value="">All Spots</option>
            {allSpots?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" name="from" defaultValue={sp.from ?? ""} placeholder="From date"
            className="col-span-1 px-3 py-2 rounded-lg bg-[#0c1a2e] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-blue-500 scheme-dark" />
          <input type="date" name="to" defaultValue={sp.to ?? ""} placeholder="To date"
            className="col-span-1 px-3 py-2 rounded-lg bg-[#0c1a2e] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-blue-500 scheme-dark" />
          <select name="sort" defaultValue={sp.sort ?? "date"} className="col-span-1 px-3 py-2 rounded-lg bg-[#0c1a2e] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-blue-500">
            <option value="date">Sort: Newest</option>
            <option value="weight">Sort: Heaviest</option>
            <option value="length">Sort: Longest</option>
          </select>
          <button type="submit" className="col-span-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
            Apply
          </button>
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer w-fit">
          <input type="checkbox" name="photo" value="1" defaultChecked={sp.photo === "1"} className="accent-blue-500" />
          <span className="text-xs text-slate-400">Photos only</span>
        </label>
      </form>

      {/* Personal best callout */}
      {heaviest && !hasFilters && (
        <div className="mb-5 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Scale size={16} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-400/80 font-semibold uppercase tracking-wide mb-0.5">Personal Best</p>
            <p className="text-sm text-white font-semibold">
              {(heaviest.fish_species as unknown as { name: string } | null)?.name ?? "Unknown"} — {heaviest.weight_lbs} lbs
              {heaviest.length_in ? ` · ${heaviest.length_in}"` : ""}
            </p>
            <p className="text-xs text-slate-500">{fmt(heaviest.caught_at)} · {(heaviest.spots as unknown as { name: string } | null)?.name ?? "?"}</p>
          </div>
          <Link href={`/catches/${heaviest.id}`} className="shrink-0 text-amber-400 hover:text-amber-300">
            <ChevronRight size={18} />
          </Link>
        </div>
      )}

      {/* Catch list */}
      {!catches || catches.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Fish size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{hasFilters ? "No catches match your filters." : "No catches logged yet."}</p>
          {!hasFilters && (
            <Link href="/log-catch" className="text-blue-500 hover:text-blue-400 text-sm mt-2 inline-block">Log your first catch →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {catches.map((c) => {
            const fish = c.fish_species as unknown as { name: string } | null;
            const spot = c.spots as unknown as { id: string; name: string; water_type: string; state: string | null } | null;
            const bait = c.baits as unknown as { name: string } | null;
            return (
              <Link
                key={c.id}
                href={`/catches/${c.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-colors group"
              >
                {/* Photo thumbnail or placeholder */}
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/8 flex items-center justify-center">
                  {c.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Fish size={20} className="text-slate-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {fish?.name ?? "Unknown Species"}
                    </span>
                    {c.is_private && <Lock size={11} className="text-amber-500/60" />}
                    {c.weight_lbs != null && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Scale size={10} />{c.weight_lbs} lbs
                      </span>
                    )}
                    {c.length_in != null && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Ruler size={10} />{c.length_in}&quot;
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-600 flex-wrap">
                    {spot && (
                      <span className="flex items-center gap-1">
                        <MapPin size={9} />{spot.name}{spot.state ? ` · ${spot.state}` : ""}
                      </span>
                    )}
                    {bait && <span>{bait.name}</span>}
                  </div>
                  {c.notes && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.notes}</p>}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">
                    <Calendar size={10} className="inline mr-1" />
                    {fmt(c.caught_at)}
                  </p>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors ml-auto mt-1" />
                </div>
              </Link>
            );
          })}
          {catches.length === 200 && (
            <p className="text-center text-xs text-slate-600 pt-2">Showing first 200 results — use filters to narrow down.</p>
          )}
        </div>
      )}
    </div>
  );
}
