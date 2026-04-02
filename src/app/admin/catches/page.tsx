import { createClient } from "@/lib/supabase/server";
import { Trash2 } from "lucide-react";
import { adminDeleteCatch } from "@/lib/actions/catches";

export default async function AdminCatchesPage() {
  const supabase = await createClient();

  const { data: catches } = await supabase
    .from("catches")
    .select("id, caught_at, weight_lbs, length_in, notes, fish_species(name), spots(name), profiles!user_id(username), baits(name)")
    .order("caught_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Catches</h1>
        <span className="text-sm text-slate-500">{catches?.length ?? 0} shown (most recent 50)</span>
      </div>

      <div className="space-y-2">
        {catches?.map((c) => {
          const fish = c.fish_species as unknown as { name: string } | null;
          const spot = c.spots as unknown as { name: string } | null;
          const profile = c.profiles as unknown as { username: string } | null;
          const bait = c.baits as unknown as { name: string } | null;
          return (
            <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-200">{fish?.name ?? "?"}</span>
                  {c.weight_lbs && <span className="text-xs text-slate-500">{c.weight_lbs} lbs</span>}
                  {c.length_in && <span className="text-xs text-slate-500">{c.length_in}&quot;</span>}
                  {bait && <span className="text-xs text-slate-600">on {bait.name}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                  <span>@{profile?.username ?? "?"}</span>
                  <span>·</span>
                  <span>{spot?.name ?? "?"}</span>
                  <span>·</span>
                  <span>{new Date(c.caught_at).toLocaleDateString()}</span>
                </div>
                {c.notes && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.notes}</p>}
              </div>
              <form action={adminDeleteCatch.bind(null, c.id)}>
                <button
                  type="submit"
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete catch"
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
