import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";
import AdminDeleteCatchButton from "@/components/AdminDeleteCatchButton";
import Link from "next/link";

export default async function AdminCatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  let dbQuery = supabase
    .from("catches")
    .select("id, caught_at, weight_lbs, length_in, notes, fish_species(name), spots(name), profiles!user_id(username), baits(name)")
    .order("caught_at", { ascending: false })
    .limit(100);

  if (query) {
    // Search by species name via join isn't directly possible — fetch all and filter,
    // or search by notes/username. We do a broad OR on notes.
    dbQuery = dbQuery.ilike("notes", `%${query}%`);
  }

  const { data: catches } = await dbQuery;

  // If query looks like a username, also get catches by that user
  let catchesByUser: typeof catches = [];
  if (query) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", `%${query}%`)
      .limit(5);

    if (profile && profile.length > 0) {
      const ids = profile.map((p) => p.id);
      const { data: byUser } = await supabase
        .from("catches")
        .select("id, caught_at, weight_lbs, length_in, notes, fish_species(name), spots(name), profiles!user_id(username), baits(name)")
        .in("user_id", ids)
        .order("caught_at", { ascending: false })
        .limit(50);
      catchesByUser = byUser ?? [];
    }

    // Also search by species
    const { data: species } = await supabase
      .from("fish_species")
      .select("id")
      .ilike("name", `%${query}%`)
      .limit(5);
    if (species && species.length > 0) {
      const ids = species.map((s) => s.id);
      const { data: bySpecies } = await supabase
        .from("catches")
        .select("id, caught_at, weight_lbs, length_in, notes, fish_species(name), spots(name), profiles!user_id(username), baits(name)")
        .in("fish_id", ids)
        .order("caught_at", { ascending: false })
        .limit(50);
      catchesByUser = [...(catchesByUser ?? []), ...(bySpecies ?? [])];
    }
  }

  // Merge and deduplicate
  const seen = new Set<string>();
  const allCatches = [...(catches ?? []), ...catchesByUser].filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Catches</h1>
          <p className="text-slate-500 text-xs mt-0.5">{allCatches.length} {query ? "results" : "most recent"}</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/catches" className="mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by species, username, or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </form>
      {query && (
        <Link href="/admin/catches" className="text-xs text-slate-500 hover:text-slate-300 mb-4 inline-block transition-colors">
          ← Clear search
        </Link>
      )}

      <div className="space-y-2">
        {allCatches.map((c) => {
          const fish = c.fish_species as unknown as { name: string } | null;
          const spot = c.spots as unknown as { name: string } | null;
          const profile = c.profiles as unknown as { username: string } | null;
          const bait = c.baits as unknown as { name: string } | null;
          return (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/catches/${c.id}`} className="font-medium text-slate-200 hover:text-white transition-colors">
                    {fish?.name ?? "?"}
                  </Link>
                  {c.weight_lbs && <span className="text-xs text-slate-500">{c.weight_lbs} lbs</span>}
                  {c.length_in && <span className="text-xs text-slate-500">{c.length_in}&quot;</span>}
                  {bait && <span className="text-xs text-slate-600">on {bait.name}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                  <Link href={`/anglers/${c.id}`} className="hover:text-slate-400 transition-colors">@{profile?.username ?? "?"}</Link>
                  <span>·</span>
                  <span>{spot?.name ?? "—"}</span>
                  <span>·</span>
                  <span>{new Date(c.caught_at).toLocaleDateString()}</span>
                </div>
                {c.notes && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.notes}</p>}
              </div>
              <AdminDeleteCatchButton
                catchId={c.id}
                label={`${fish?.name ?? "Unknown"} by @${profile?.username ?? "?"}`}
              />
            </div>
          );
        })}
        {allCatches.length === 0 && (
          <p className="text-center text-sm text-slate-600 py-12">No catches found{query ? ` for "${query}"` : ""}.</p>
        )}
      </div>
    </div>
  );
}
