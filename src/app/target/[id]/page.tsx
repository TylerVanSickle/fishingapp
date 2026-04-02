import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Target, MapPin, Fish, Scale, Clock, Sparkles, ArrowLeft, Users } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function TargetSpeciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  const { data: fish } = await supabase.from("fish_species").select("*").eq("id", id).single();
  if (!fish) notFound();

  // Fetch catches for this species
  const { data: catches } = await supabase
    .from("catches")
    .select("id, caught_at, weight_lbs, length_in, photo_url, spots(id, name, water_type, state), baits(id, name), profiles!user_id(username)")
    .eq("fish_id", id)
    .order("caught_at", { ascending: false })
    .limit(100);

  const publicCatches = (catches ?? []).filter(c => !(c as Record<string, unknown>).is_private);

  // Aggregate top spots
  const spotMap: Record<string, { id: string; name: string; water_type: string; state: string | null; count: number; lastCaught: string }> = {};
  publicCatches.forEach(c => {
    const spot = c.spots as unknown as { id: string; name: string; water_type: string; state: string | null } | null;
    if (!spot) return;
    if (!spotMap[spot.id]) spotMap[spot.id] = { ...spot, count: 0, lastCaught: c.caught_at };
    spotMap[spot.id].count++;
  });
  const topSpots = Object.values(spotMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // Aggregate top baits
  const baitMap: Record<string, { id: string; name: string; count: number }> = {};
  publicCatches.forEach(c => {
    const bait = c.baits as unknown as { id: string; name: string } | null;
    if (!bait) return;
    baitMap[bait.id] = baitMap[bait.id] ?? { ...bait, count: 0 };
    baitMap[bait.id].count++;
  });
  const topBaits = Object.values(baitMap).sort((a, b) => b.count - a.count).slice(0, 5);

  // Best time of day (Pro)
  const hourCounts = Array(24).fill(0);
  publicCatches.forEach(c => {
    const h = new Date(c.caught_at).getHours();
    hourCounts[h]++;
  });
  const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
  function fmtHour(h: number) {
    if (h === 0) return "Midnight";
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return "Noon";
    return `${h - 12}:00 PM`;
  }

  // Stats
  const withWeight = publicCatches.filter(c => c.weight_lbs != null);
  const avgWeight = withWeight.length ? withWeight.reduce((s, c) => s + c.weight_lbs!, 0) / withWeight.length : null;
  const maxWeight = withWeight.length ? Math.max(...withWeight.map(c => c.weight_lbs!)) : null;
  const uniqueAnglers = new Set(publicCatches.map(c => (c.profiles as unknown as { username: string } | null)?.username)).size;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/target" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
        <ArrowLeft size={12} /> All Species
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Target className="text-blue-400" size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{fish.name}</h1>
            <Link href={`/fish/${fish.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Species guide →
            </Link>
          </div>
          {fish.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{fish.description}</p>}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Catches", value: publicCatches.length },
          { label: "Anglers", value: uniqueAnglers },
          { label: "Avg Weight", value: avgWeight ? `${avgWeight.toFixed(1)} lbs` : "—" },
          { label: "Record", value: maxWeight ? `${maxWeight} lbs` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-xl border border-white/8 bg-white/2 text-center">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        {/* Top Spots */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <MapPin size={12} className="text-cyan-400" /> Top Spots
          </h2>
          {topSpots.length === 0 ? (
            <p className="text-sm text-slate-600">No catches logged yet.</p>
          ) : (
            <div className="space-y-2">
              {topSpots.map((spot, i) => (
                <Link key={spot.id} href={`/spots/${spot.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors group">
                  <span className="text-sm font-black text-slate-700 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{spot.name}</p>
                    <p className="text-xs text-slate-600">{spot.water_type}{spot.state ? ` · ${spot.state}` : ""}</p>
                  </div>
                  <span className="text-xs text-cyan-400 font-semibold shrink-0">{spot.count} 🎣</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Baits */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Fish size={12} className="text-green-400" /> Best Baits & Lures
          </h2>
          {topBaits.length === 0 ? (
            <p className="text-sm text-slate-600">No bait data yet.</p>
          ) : (
            <div className="space-y-2">
              {topBaits.map((bait, i) => (
                <div key={bait.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/2">
                  <span className="text-sm font-black text-slate-700 w-4">{i + 1}</span>
                  <p className="flex-1 text-sm text-slate-300 truncate">{bait.name}</p>
                  <span className="text-xs text-green-400 font-semibold shrink-0">{bait.count} catches</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best time of day — Pro gated */}
      <div className="mb-6 relative">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Clock size={12} className="text-amber-400" /> Best Time of Day
        </h2>
        <div className={`p-4 rounded-2xl border border-white/8 bg-white/2 ${!isPro ? "blur-sm pointer-events-none select-none" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Peak window: <span className="text-amber-400">{fmtHour(bestHour)}</span></p>
              <p className="text-xs text-slate-500">{hourCounts[bestHour]} catches logged during this hour</p>
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-16">
            {hourCounts.map((count, h) => {
              const maxCount = Math.max(...hourCounts, 1);
              const pct = (count / maxCount) * 100;
              const isDay = h >= 6 && h < 20;
              return (
                <div key={h} className="flex-1 flex flex-col justify-end items-center gap-0.5">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: isDay ? "#f59e0b" : "#3b82f6", opacity: pct > 0 ? 0.8 : 0.2 }}
                    title={`${fmtHour(h)}: ${count} catches`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-700">
            <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>
          </div>
        </div>
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#060d1a]/60">
            <div className="text-center">
              <Sparkles size={20} className="text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white mb-1">Pro feature</p>
              <Link href="/pro" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors">
                Unlock timing intel
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent catches */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Users size={12} className="text-violet-400" /> Recent Community Catches
        </h2>
        {publicCatches.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <Fish size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No catches logged yet. Be the first!</p>
            <Link href={`/log-catch?fish=${id}`} className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block">Log a {fish.name} →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {publicCatches.slice(0, 8).map(c => {
              const spot = c.spots as unknown as { id: string; name: string } | null;
              const profile = c.profiles as unknown as { username: string } | null;
              return (
                <Link key={c.id} href={`/catches/${c.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                    {c.photo_url
                      ? <img src={c.photo_url} alt="" className="w-full h-full object-cover" />  // eslint-disable-line
                      : <div className="w-full h-full flex items-center justify-center"><Fish size={14} className="text-slate-700" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">
                      {c.weight_lbs ? <><Scale size={10} className="inline mr-1" /><strong className="text-white">{c.weight_lbs} lbs</strong> · </> : ""}
                      @{profile?.username ?? "angler"}
                    </p>
                    {spot && <p className="text-xs text-slate-600 flex items-center gap-1"><MapPin size={9} />{spot.name}</p>}
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{timeAgo(c.caught_at)}</span>
                </Link>
              );
            })}
            {publicCatches.length > 8 && (
              <p className="text-center text-xs text-slate-600 pt-1">+{publicCatches.length - 8} more catches</p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-8 p-4 rounded-xl border border-blue-500/15 bg-blue-500/5 flex items-center gap-4">
        <Target size={20} className="text-blue-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Ready to target {fish.name}?</p>
          <p className="text-xs text-slate-500">Log your catch to contribute to the community intel</p>
        </div>
        <Link href={`/log-catch?fish=${id}`} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shrink-0">
          Log Catch
        </Link>
      </div>
    </div>
  );
}
