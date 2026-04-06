import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Compass, TrendingUp, Fish, MapPin, Scale, Waves, Star, Users, Trophy } from "lucide-react";
import Avatar from "@/components/Avatar";
import ClickablePhoto from "@/components/ClickablePhoto";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [
    { data: recentCatches },
    { data: trendingRaw },
    { data: bigCatches },
    { data: activeAnglers },
    { data: catchOfDayRaw },
  ] = await Promise.all([
    // Latest catches (last 7 days with photos) — filter private in JS
    supabase.from("catches")
      .select("id, caught_at, weight_lbs, length_in, photo_url, notes, is_private, fish_species(name), spots(id, name), profiles!user_id(id, username, avatar_url)")
      .gte("caught_at", weekAgo)
      .not("photo_url", "is", null)
      .order("caught_at", { ascending: false })
      .limit(20),

    // Trending spots: most catches this week (no privacy concern — just spot counts)
    supabase.from("catches")
      .select("spot_id, spots(id, name, water_type, state)")
      .gte("caught_at", weekAgo)
      .not("spot_id", "is", null),

    // Biggest fish this week — filter private in JS
    supabase.from("catches")
      .select("id, weight_lbs, length_in, caught_at, is_private, fish_species(name), spots(id, name), profiles!user_id(id, username, avatar_url)")
      .gte("caught_at", weekAgo)
      .not("weight_lbs", "is", null)
      .order("weight_lbs", { ascending: false })
      .limit(20),

    // Most active anglers this week
    supabase.from("catches")
      .select("user_id, profiles!user_id(id, username, avatar_url)")
      .gte("caught_at", weekAgo),

    // Catch of the day — heaviest public catch today
    supabase.from("catches")
      .select("id, caught_at, weight_lbs, length_in, photo_url, is_private, fish_species(name), spots(id, name), profiles!user_id(id, username, avatar_url)")
      .gte("caught_at", todayStart.toISOString())
      .not("weight_lbs", "is", null)
      .order("weight_lbs", { ascending: false })
      .limit(10),
  ]);

  // Only show fully public catches on explore page
  function isPublicOnly(c: { visibility?: string; is_private?: boolean }) {
    const vis = c.visibility;
    const effective = vis ?? (c.is_private ? "private" : "public");
    return effective === "public";
  }
  const publicRecentCatches = (recentCatches ?? [])
    .filter((c) => isPublicOnly(c as unknown as { visibility?: string; is_private?: boolean }))
    .slice(0, 6);
  const publicBigCatches = (bigCatches ?? [])
    .filter((c) => isPublicOnly(c as unknown as { visibility?: string; is_private?: boolean }))
    .slice(0, 5);
  const catchOfDay = (catchOfDayRaw ?? []).find(c => isPublicOnly(c as unknown as { visibility?: string; is_private?: boolean })) ?? null;

  // Aggregate trending spots
  const spotCounts: Record<string, { id: string; name: string; water_type: string; state: string | null; count: number }> = {};
  (trendingRaw ?? []).forEach((c) => {
    const spot = c.spots as unknown as { id: string; name: string; water_type: string; state: string | null } | null;
    if (!spot) return;
    spotCounts[spot.id] = spotCounts[spot.id] ?? { ...spot, count: 0 };
    spotCounts[spot.id].count++;
  });
  const trendingSpots = Object.values(spotCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Aggregate active anglers
  const anglerCounts: Record<string, { id: string; username: string; avatar_url: string | null; count: number }> = {};
  (activeAnglers ?? []).forEach((c) => {
    const p = c.profiles as unknown as { id: string; username: string; avatar_url: string | null } | null;
    if (!p) return;
    anglerCounts[p.id] = anglerCounts[p.id] ?? { ...p, count: 0 };
    anglerCounts[p.id].count++;
  });
  const topAnglers = Object.values(anglerCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
          <Compass className="text-violet-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-slate-500 text-xs">What&apos;s happening this week</p>
        </div>
      </div>

      {/* Catch of the Day */}
      {catchOfDay && (() => {
        const fish = catchOfDay.fish_species as unknown as { name: string } | null;
        const spot = catchOfDay.spots as unknown as { id: string; name: string } | null;
        const angler = catchOfDay.profiles as unknown as { id: string; username: string; avatar_url: string | null } | null;
        return (
          <div className="mb-6 rounded-2xl border border-yellow-500/25 bg-yellow-500/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">Catch of the Day</span>
              <span className="text-xs text-slate-600 ml-1">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
            </div>
            <Link href={`/catches/${catchOfDay.id}`} className="flex items-center gap-4 px-4 pb-4 group">
              {catchOfDay.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={catchOfDay.photo_url} alt="" className="w-20 h-20 object-cover rounded-xl border border-white/10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors">
                  {fish?.name ?? "Unknown"}{catchOfDay.weight_lbs ? ` · ${catchOfDay.weight_lbs} lbs` : ""}
                </p>
                {spot && <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={11} />{spot.name}</p>}
                {angler && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar url={angler.avatar_url} username={angler.username} size={20} />
                    <span className="text-xs text-slate-500">@{angler.username}</span>
                    <span className="text-xs text-slate-700">· {timeAgo(catchOfDay.caught_at)}</span>
                  </div>
                )}
              </div>
              <Scale size={18} className="text-yellow-400/60 shrink-0" />
            </Link>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent photos */}
          {publicRecentCatches.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                <TrendingUp size={13} className="text-blue-400" /> Fresh Catches This Week
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {publicRecentCatches.map((c) => {
                  const fish = c.fish_species as unknown as { name: string } | null;
                  const spot = c.spots as unknown as { id: string; name: string } | null;
                  const angler = c.profiles as unknown as { id: string; username: string; avatar_url: string | null } | null;
                  return (
                    <Link key={c.id} href={`/catches/${c.id}`} className="group relative rounded-xl overflow-hidden border border-white/8 aspect-square block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.photo_url!}
                        alt={fish?.name ?? "Catch"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-semibold truncate">{fish?.name ?? "Unknown"}</p>
                        {c.weight_lbs && <p className="text-slate-300 text-[10px]">{c.weight_lbs} lbs</p>}
                      </div>
                      {angler && (
                        <div className="absolute top-2 left-2">
                          <Avatar url={angler.avatar_url} username={angler.username} size={22} />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Biggest fish */}
          {publicBigCatches.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                <Scale size={13} className="text-yellow-400" /> Biggest Fish This Week
              </h2>
              <div className="space-y-2">
                {publicBigCatches.map((c, i) => {
                  const fish = c.fish_species as unknown as { name: string } | null;
                  const spot = c.spots as unknown as { id: string; name: string } | null;
                  const angler = c.profiles as unknown as { id: string; username: string; avatar_url: string | null } | null;
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2">
                      <span className="text-lg font-black text-slate-700 w-6 text-center leading-none">{i + 1}</span>
                      {angler && (
                        <Link href={`/anglers/${angler.id}`}>
                          <Avatar url={angler.avatar_url} username={angler.username} size={32} />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{fish?.name ?? "Unknown"}</p>
                        <p className="text-xs text-slate-500">
                          {angler && <Link href={`/anglers/${angler.id}`} className="hover:text-blue-400 transition-colors">@{angler.username}</Link>}
                          {spot && <> · <Link href={`/spots/${spot.id}`} className="hover:text-blue-400 transition-colors">{spot.name}</Link></>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white">{c.weight_lbs} lbs</p>
                        <p className="text-xs text-slate-600">{timeAgo(c.caught_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Trending spots */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              <MapPin size={13} className="text-cyan-400" /> Hot Spots
            </h2>
            {trendingSpots.length === 0 ? (
              <p className="text-slate-600 text-sm">No data yet this week.</p>
            ) : (
              <div className="space-y-2">
                {trendingSpots.map((spot, i) => (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-colors group"
                  >
                    <span className="text-sm font-black text-slate-700 w-4 leading-none">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">{spot.name}</p>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Waves size={9} className="shrink-0" />
                        {spot.water_type}{spot.state ? ` · ${spot.state}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-cyan-400/80 font-medium shrink-0">
                      <Fish size={10} />
                      {spot.count}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Most active anglers */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              <Users size={13} className="text-violet-400" /> Active Anglers
            </h2>
            {topAnglers.length === 0 ? (
              <p className="text-slate-600 text-sm">No catches this week yet.</p>
            ) : (
              <div className="space-y-2">
                {topAnglers.map((angler, i) => (
                  <Link
                    key={angler.id}
                    href={`/anglers/${angler.id}`}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-colors group"
                  >
                    <span className="text-sm font-black text-slate-700 w-4 leading-none">{i + 1}</span>
                    <Avatar url={angler.avatar_url} username={angler.username} size={28} />
                    <p className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors truncate">@{angler.username}</p>
                    <span className="text-xs text-violet-400/80 font-medium shrink-0">{angler.count} 🎣</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Spot ratings leader */}
          <div className="p-4 rounded-xl border border-yellow-500/15 bg-yellow-500/5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-yellow-400/80 mb-2">
              <Star size={13} /> Top Rated Spots
            </h2>
            <p className="text-xs text-slate-500">
              Rate spots you&apos;ve fished to help the community find the best waters.
            </p>
            <Link href="/spots" className="mt-2 text-xs text-blue-400 hover:text-blue-300 inline-block transition-colors">
              Browse all spots →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
