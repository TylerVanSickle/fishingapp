import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Wrench, ArrowLeft, Fish, Scale, MapPin, Calendar } from "lucide-react";

export default async function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: setup } = await supabase
    .from("gear_setups")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!setup) notFound();

  const s = setup as Record<string, unknown>;

  const { data: catches } = await supabase
    .from("catches")
    .select("id, caught_at, weight_lbs, length_in, fish_species(name), spots(id, name)")
    .eq("gear_setup_id", id)
    .eq("user_id", user.id)
    .order("caught_at", { ascending: false })
    .limit(50);

  const withWeight = (catches ?? []).filter(c => c.weight_lbs != null);
  const totalWeight = withWeight.reduce((sum, c) => sum + (c.weight_lbs ?? 0), 0);
  const heaviest = withWeight.reduce<(typeof withWeight)[0] | null>((best, c) => c.weight_lbs! > (best?.weight_lbs ?? 0) ? c : best, null);
  const speciesSet = new Set((catches ?? []).map(c => (c.fish_species as unknown as { name: string } | null)?.name).filter(Boolean));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/gear" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
        <ArrowLeft size={12} /> All Setups
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Wrench size={22} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{s.name as string}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {new Date(s.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="mb-6 p-4 rounded-2xl border border-white/8 bg-white/2 grid grid-cols-2 gap-4">
        {[
          { label: "Rod", value: s.rod },
          { label: "Reel", value: s.reel },
          { label: "Main Line", value: s.line },
          { label: "Leader", value: s.leader },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-slate-600">{label}</p>
            <p className="text-sm text-slate-300 mt-0.5">{(value as string) || <span className="text-slate-700">—</span>}</p>
          </div>
        ))}
        {(s.notes as string | null) && (
          <div className="col-span-2">
            <p className="text-xs text-slate-600">Notes</p>
            <p className="text-sm text-slate-300 mt-0.5">{s.notes as string}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-xl border border-white/8 bg-white/2 text-center">
          <p className="text-xl font-bold text-white">{catches?.length ?? 0}</p>
          <p className="text-xs text-slate-500">Catches</p>
        </div>
        <div className="p-3 rounded-xl border border-white/8 bg-white/2 text-center">
          <p className="text-xl font-bold text-white">{speciesSet.size}</p>
          <p className="text-xs text-slate-500">Species</p>
        </div>
        <div className="p-3 rounded-xl border border-white/8 bg-white/2 text-center">
          <p className="text-xl font-bold text-white">{heaviest?.weight_lbs ?? "—"}</p>
          <p className="text-xs text-slate-500">Best (lbs)</p>
        </div>
      </div>

      {/* Catch list */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Fish size={12} /> Catches with this setup
      </h2>
      {!catches || catches.length === 0 ? (
        <div className="text-center py-10 text-slate-600">
          <Fish size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No catches tagged to this setup yet.</p>
          <p className="text-xs text-slate-700 mt-1">When logging a catch, select this setup to track it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {catches.map(c => {
            const fish = c.fish_species as unknown as { name: string } | null;
            const spot = c.spots as unknown as { id: string; name: string } | null;
            return (
              <Link key={c.id} href={`/catches/${c.id}`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{fish?.name ?? "Unknown"}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5 flex-wrap">
                    {c.weight_lbs && <span className="flex items-center gap-1"><Scale size={9} />{c.weight_lbs} lbs</span>}
                    {spot && <span className="flex items-center gap-1"><MapPin size={9} />{spot.name}</span>}
                    <span className="flex items-center gap-1"><Calendar size={9} />
                      {new Date(c.caught_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {totalWeight > 0 && (
            <p className="text-xs text-slate-600 text-right pt-1">
              Total: {totalWeight.toFixed(1)} lbs across {catches.length} catches
            </p>
          )}
        </div>
      )}
    </div>
  );
}
