import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, MapPin, Fish, User, Waves, Scale } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();

  let spots: { id: string; name: string; water_type: string; state: string | null }[] = [];
  let species: { id: string; name: string; description: string | null }[] = [];
  let anglers: { id: string; username: string; home_state: string | null }[] = [];
  let catches: { id: string; weight_lbs: number | null; caught_at: string; fish_species: { name: string } | null; spots: { name: string } | null; profiles: { username: string } | null }[] = [];

  if (query.length >= 2) {
    const [{ data: s }, { data: f }, { data: a }, { data: c }] = await Promise.all([
      supabase
        .from("spots")
        .select("id, name, water_type, state")
        .ilike("name", `%${query}%`)
        .eq("approved", true)
        .order("name")
        .limit(8),
      supabase
        .from("fish_species")
        .select("id, name, description")
        .ilike("name", `%${query}%`)
        .order("name")
        .limit(8),
      supabase
        .from("profiles")
        .select("id, username, home_state")
        .ilike("username", `%${query}%`)
        .order("username")
        .limit(8),
      supabase
        .from("catches")
        .select("id, weight_lbs, caught_at, fish_species(name), spots(name), profiles!user_id(username)")
        .eq("is_private", false)
        .or(`notes.ilike.%${query}%`)
        .order("caught_at", { ascending: false })
        .limit(6),
    ]);
    spots = s ?? [];
    species = f ?? [];
    anglers = a ?? [];
    catches = (c ?? []) as unknown as typeof catches;

    // Also search catches by species name match
    if (species.length > 0) {
      const speciesIds = species.map((sp) => sp.id);
      const { data: catchesBySpecies } = await supabase
        .from("catches")
        .select("id, weight_lbs, caught_at, fish_species(name), spots(name), profiles!user_id(username)")
        .eq("is_private", false)
        .in("fish_id", speciesIds)
        .order("weight_lbs", { ascending: false, nullsFirst: false })
        .limit(6);
      const existing = new Set(catches.map((c) => c.id));
      for (const c of (catchesBySpecies ?? []) as unknown as typeof catches) {
        if (!existing.has(c.id)) catches.push(c);
      }
      catches = catches.slice(0, 8);
    }
  }

  const totalResults = spots.length + species.length + anglers.length + catches.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Search className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Search</h1>
          <p className="text-slate-500 text-xs">Find spots, species, and anglers</p>
        </div>
      </div>

      {/* Search input */}
      <form method="GET" action="/search" className="mb-8">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search spots, fish, or anglers..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </form>

      {query.length >= 2 ? (
        totalResults === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <Search size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1">Try a different spelling or shorter term</p>
          </div>
        ) : (
          <div className="space-y-6">
            {spots.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  <MapPin size={12} /> Spots
                  <span className="font-normal normal-case text-slate-700">({spots.length})</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {spots.map((s) => (
                    <Link
                      key={s.id}
                      href={`/spots/${s.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/12 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <Waves size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{s.name}</p>
                          <p className="text-xs text-slate-600 capitalize">{s.water_type}{s.state ? ` · ${s.state}` : ""}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-700 group-hover:text-blue-400 transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {species.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  <Fish size={12} /> Fish Species
                  <span className="font-normal normal-case text-slate-700">({species.length})</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {species.map((f) => (
                    <Link
                      key={f.id}
                      href={`/fish/${f.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-600/12 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <Fish size={14} className="text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{f.name}</p>
                          {f.description && (
                            <p className="text-xs text-slate-600 line-clamp-1">{f.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-700 group-hover:text-blue-400 transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {catches.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  <Scale size={12} /> Catches
                  <span className="font-normal normal-case text-slate-700">({catches.length})</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {catches.map((c) => (
                    <Link
                      key={c.id}
                      href={`/catches/${c.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-600/12 border border-green-500/20 flex items-center justify-center shrink-0">
                          <Fish size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                            {(c.fish_species as unknown as { name: string } | null)?.name ?? "Unknown"}
                            {c.weight_lbs != null && <span className="text-slate-500 font-normal"> · {c.weight_lbs} lbs</span>}
                          </p>
                          <p className="text-xs text-slate-600">
                            @{(c.profiles as unknown as { username: string } | null)?.username ?? "?"}
                            {(c.spots as unknown as { name: string } | null)?.name && ` · ${(c.spots as unknown as { name: string }).name}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-700 group-hover:text-blue-400 transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {anglers.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  <User size={12} /> Anglers
                  <span className="font-normal normal-case text-slate-700">({anglers.length})</span>
                </h2>
                <div className="flex flex-col gap-2">
                  {anglers.map((a) => (
                    <Link
                      key={a.id}
                      href={`/anglers/${a.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-600/12 border border-violet-500/20 flex items-center justify-center shrink-0">
                          <User size={14} className="text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">@{a.username}</p>
                          {a.home_state && (
                            <p className="text-xs text-slate-600">{a.home_state}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-700 group-hover:text-blue-400 transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      ) : query.length > 0 ? (
        <p className="text-center text-sm text-slate-600 py-8">Type at least 2 characters to search</p>
      ) : (
        <div className="text-center py-16 text-slate-700">
          <Search size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Start typing to search</p>
        </div>
      )}
    </div>
  );
}
