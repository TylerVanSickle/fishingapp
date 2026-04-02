import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowLeft, Fish, Scale, Ruler, Calendar, MapPin } from "lucide-react";
import ClickablePhoto from "@/components/ClickablePhoto";

type CatchRow = {
  id: string;
  weight_lbs: number | null;
  length_in: number | null;
  caught_at: string;
  photo_url: string | null;
  fish_species: { id: string; name: string } | null;
  spots: { id: string; name: string } | null;
};

export default async function PersonalRecordsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profile/records");

  const { data: raw } = await supabase
    .from("catches")
    .select("id, weight_lbs, length_in, caught_at, photo_url, fish_species(id, name), spots(id, name)")
    .eq("user_id", user.id)
    .order("weight_lbs", { ascending: false, nullsFirst: false });

  const catches = (raw ?? []) as unknown as CatchRow[];

  // Best catch per species by weight, then by length as fallback
  const recordsBySpecies = new Map<string, CatchRow>();
  for (const c of catches) {
    if (!c.fish_species) continue;
    const sid = c.fish_species.id;
    const existing = recordsBySpecies.get(sid);
    if (!existing) {
      recordsBySpecies.set(sid, c);
      continue;
    }
    const existW = existing.weight_lbs ?? -1;
    const currW = c.weight_lbs ?? -1;
    if (currW > existW) {
      recordsBySpecies.set(sid, c);
    } else if (currW === existW) {
      const existL = existing.length_in ?? -1;
      const currL = c.length_in ?? -1;
      if (currL > existL) recordsBySpecies.set(sid, c);
    }
  }

  // Sort records: species with weight first (desc), then by length, then no measurement
  const records = [...recordsBySpecies.values()].sort((a, b) => {
    if ((b.weight_lbs ?? -1) !== (a.weight_lbs ?? -1)) return (b.weight_lbs ?? -1) - (a.weight_lbs ?? -1);
    return (b.length_in ?? -1) - (a.length_in ?? -1);
  });

  // Total stats
  const heaviestOverall = records.reduce<CatchRow | null>((best, r) =>
    r.weight_lbs != null && (best == null || r.weight_lbs > (best.weight_lbs ?? 0)) ? r : best, null);

  const longestOverall = records.reduce<CatchRow | null>((best, r) =>
    r.length_in != null && (best == null || r.length_in > (best.length_in ?? 0)) ? r : best, null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
        <ArrowLeft size={12} /> Back to profile
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
          <Trophy className="text-amber-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Personal Records</h1>
          <p className="text-slate-500 text-xs">Your biggest catch per species</p>
        </div>
      </div>

      {/* Overall bests */}
      {(heaviestOverall || longestOverall) && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {heaviestOverall?.weight_lbs != null && (
            <Link href={`/catches/${heaviestOverall.id}`}
              className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/8 flex flex-col gap-1 hover:bg-amber-500/12 transition-colors">
              <p className="text-xs text-amber-400/70 uppercase tracking-wide font-semibold flex items-center gap-1">
                <Trophy size={10} /> Heaviest Catch
              </p>
              <p className="text-2xl font-black text-white">{heaviestOverall.weight_lbs} <span className="text-sm font-normal text-slate-400">lbs</span></p>
              <p className="text-xs text-slate-400">{heaviestOverall.fish_species?.name}</p>
            </Link>
          )}
          {longestOverall?.length_in != null && (
            <Link href={`/catches/${longestOverall.id}`}
              className="p-4 rounded-2xl border border-blue-500/25 bg-blue-500/8 flex flex-col gap-1 hover:bg-blue-500/12 transition-colors">
              <p className="text-xs text-blue-400/70 uppercase tracking-wide font-semibold flex items-center gap-1">
                <Ruler size={10} /> Longest Catch
              </p>
              <p className="text-2xl font-black text-white">{longestOverall.length_in}<span className="text-sm font-normal text-slate-400">"</span></p>
              <p className="text-xs text-slate-400">{longestOverall.fish_species?.name}</p>
            </Link>
          )}
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-20">
          <Trophy size={36} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-400 font-medium">No records yet</p>
          <p className="text-slate-600 text-sm mt-1">Start logging catches to build your trophy wall.</p>
          <Link href="/log-catch" className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            <Fish size={14} /> Log a Catch
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-600">{records.length} species on the board</p>

          {records.map((r, i) => {
            const species = r.fish_species!;
            const spot = r.spots;
            const hasWeight = r.weight_lbs != null;
            const hasLength = r.length_in != null;
            const isTopThree = i < 3;

            return (
              <Link key={r.id} href={`/catches/${r.id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors group ${isTopThree ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/8" : "border-white/8 bg-white/2 hover:bg-white/4"}`}>

                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  i === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                  i === 1 ? "bg-slate-400/15 text-slate-400 border border-slate-400/20" :
                  i === 2 ? "bg-orange-700/20 text-orange-600 border border-orange-700/20" :
                  "bg-white/5 text-slate-600 border border-white/8"
                }`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>

                {/* Photo thumbnail */}
                {r.photo_url ? (
                  <ClickablePhoto
                    src={r.photo_url}
                    alt={species.name}
                    className="w-full h-full object-cover rounded-xl"
                    thumbClassName="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center shrink-0">
                    <Fish size={20} className="text-slate-600" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-amber-200 transition-colors">{species.name}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {hasWeight && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Scale size={10} className="text-blue-400" /> {r.weight_lbs} lbs
                      </span>
                    )}
                    {hasLength && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Ruler size={10} className="text-cyan-400" /> {r.length_in}&quot;
                      </span>
                    )}
                    {!hasWeight && !hasLength && (
                      <span className="text-xs text-slate-600">No measurements</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {spot && (
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin size={9} /> {spot.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar size={9} />
                      {new Date(r.caught_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
