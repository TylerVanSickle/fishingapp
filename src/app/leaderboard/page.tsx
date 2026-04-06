import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Trophy, Fish, MapPin, Scale, Medal } from "lucide-react";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const monthStart = thisMonth.toISOString();

  const [
    { data: biggestCatches },
    { data: monthlyCatches },
    { data: speciesCatches },
  ] = await Promise.all([
    // Biggest catches all time — filter private in JS
    supabase
      .from("catches")
      .select("id, weight_lbs, length_in, caught_at, is_private, fish_species(name), spots(name), profiles!user_id(id, username)")
      .not("weight_lbs", "is", null)
      .order("weight_lbs", { ascending: false })
      .limit(50),

    // Most catches this month — filter private in JS
    supabase
      .from("catches")
      .select("user_id, is_private, profiles!user_id(id, username)")
      .gte("caught_at", monthStart),

    // Most species caught — filter private in JS
    supabase
      .from("catches")
      .select("user_id, fish_id, is_private, profiles!user_id(id, username)"),
  ]);

  function isPublic(c: { visibility?: string; is_private?: boolean }) {
    const vis = c.visibility;
    return (vis ?? (c.is_private ? "private" : "public")) === "public";
  }

  const monthlyCounts: Record<string, { id: string; username: string; count: number }> = {};
  monthlyCatches?.forEach((c) => {
    if (!isPublic(c as unknown as { visibility?: string; is_private?: boolean })) return;
    const profile = c.profiles as unknown as { id: string; username: string } | null;
    if (!profile) return;
    monthlyCounts[c.user_id] = monthlyCounts[c.user_id] ?? { id: profile.id, username: profile.username, count: 0 };
    monthlyCounts[c.user_id].count++;
  });
  const monthlyLeaders = Object.values(monthlyCounts).sort((a, b) => b.count - a.count).slice(0, 10);

  const speciesMap: Record<string, { id: string; username: string; species: Set<string> }> = {};
  speciesCatches?.forEach((c) => {
    if (!isPublic(c as unknown as { visibility?: string; is_private?: boolean })) return;
    const profile = c.profiles as unknown as { id: string; username: string } | null;
    if (!profile) return;
    if (!speciesMap[c.user_id]) speciesMap[c.user_id] = { id: profile.id, username: profile.username, species: new Set() };
    speciesMap[c.user_id].species.add(c.fish_id);
  });
  const speciesLeaders = Object.values(speciesMap)
    .map(({ id, username, species }) => ({ id, username, count: species.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const publicBiggest = (biggestCatches ?? [])
    .filter((c) => isPublic(c as unknown as { visibility?: string; is_private?: boolean }))
    .slice(0, 10);

  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const rankIcon = (i: number) =>
    i === 0 ? <Medal size={18} className="text-yellow-400 mx-auto" /> :
    i === 1 ? <Medal size={18} className="text-slate-300 mx-auto" /> :
    i === 2 ? <Medal size={18} className="text-amber-600 mx-auto" /> :
    <span className="text-xs text-slate-600 font-mono">#{i + 1}</span>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
          <Trophy className="text-yellow-400" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-400 text-sm">Top anglers across HookLine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Biggest catches */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={16} className="text-blue-400" />
            <h2 className="font-semibold text-slate-200">Biggest Catches — All Time</h2>
          </div>
          <div className="space-y-2">
            {publicBiggest.length > 0 ? publicBiggest.map((c, i) => {
              const fish = c.fish_species as unknown as { name: string } | null;
              const spot = c.spots as unknown as { name: string } | null;
              const profile = c.profiles as unknown as { id: string; username: string } | null;
              return (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-colors">
                  <div className="w-8 shrink-0 text-center">{rankIcon(i)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/catches/${c.id}`} className="font-semibold text-slate-200 hover:text-white transition-colors">
                        {c.weight_lbs} lbs
                      </Link>
                      {c.length_in && <span className="text-xs text-slate-500">{c.length_in}&quot;</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {fish?.name ?? "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600 flex-wrap">
                      {profile && (
                        <Link href={`/anglers/${profile.id}`} className="hover:text-blue-400 transition-colors">
                          @{profile.username}
                        </Link>
                      )}
                      {spot && (
                        <><span>·</span><span className="flex items-center gap-1"><MapPin size={10} />{spot.name}</span></>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-700 shrink-0">
                    {new Date(c.caught_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center py-12 text-slate-600">
                <Scale size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No catches with weight logged yet.</p>
                <Link href="/log-catch" className="text-blue-500 hover:text-blue-400 text-sm mt-2 inline-block">Log the first one →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Monthly */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Fish size={16} className="text-cyan-400" />
              <h2 className="font-semibold text-slate-200 text-sm">Most Catches — {monthName}</h2>
            </div>
            {monthlyLeaders.length === 0 ? (
              <div className="py-8 text-center rounded-xl border border-dashed border-white/8">
                <p className="text-sm text-slate-600">No catches logged this month yet.</p>
                <Link href="/log-catch" className="text-blue-500 hover:text-blue-400 text-xs mt-1 inline-block">Be the first →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {monthlyLeaders.map(({ id, username, count }, i) => (
                  <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/2">
                    <span className="text-xs text-slate-600 font-mono w-5">{rankIcon(i)}</span>
                    <Link href={`/anglers/${id}`} className="flex-1 text-sm text-slate-300 hover:text-blue-400 transition-colors truncate">
                      @{username}
                    </Link>
                    <span className="text-sm font-semibold text-white shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Species */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-violet-400" />
              <h2 className="font-semibold text-slate-200 text-sm">Most Species — All Time</h2>
            </div>
            {speciesLeaders.length === 0 ? (
              <p className="text-sm text-slate-600 py-4 text-center">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {speciesLeaders.map(({ id, username, count }, i) => (
                  <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/2">
                    <span className="text-xs text-slate-600 font-mono w-5">{rankIcon(i)}</span>
                    <Link href={`/anglers/${id}`} className="flex-1 text-sm text-slate-300 hover:text-blue-400 transition-colors truncate">
                      @{username}
                    </Link>
                    <span className="text-xs text-violet-400 font-semibold shrink-0">{count} sp.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
