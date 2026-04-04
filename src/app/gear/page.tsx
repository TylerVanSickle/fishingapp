import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wrench, Plus, ChevronRight, Fish } from "lucide-react";
import ProGate from "@/components/ProGate";

export default async function GearPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/gear");

  const { data: profile } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
  const isPro = !!(profile as unknown as { is_pro?: boolean } | null)?.is_pro;

  const { data: setups } = await supabase
    .from("gear_setups")
    .select("id, name, rod, reel, line, leader, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Catch counts per setup
  const setupIds = (setups ?? []).map(s => s.id);
  const catchCounts: Record<string, number> = {};
  if (setupIds.length > 0) {
    const { data: catchData } = await supabase
      .from("catches")
      .select("gear_setup_id")
      .in("gear_setup_id", setupIds)
      .eq("user_id", user.id);
    (catchData ?? []).forEach(c => {
      if (c.gear_setup_id) catchCounts[c.gear_setup_id] = (catchCounts[c.gear_setup_id] ?? 0) + 1;
    });
  }

  if (!isPro) {
    return (
      <ProGate
        title="Gear & Tackle Tracker"
        icon={Wrench}
        iconColor="text-amber-400"
        description="Save every rod/reel/line setup and tag your catches to the gear that caught them. Find out which setup is your top performer — and never forget what's in your bag."
        features={[
          "Save unlimited rod, reel, line & leader setups",
          "Tag every catch to the setup that caught it",
          "See which setup catches the most fish",
          "Notes per setup — what each rig is best for",
          "Quick reference before you leave the house",
          "Full catch history per setup",
        ]}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <Wrench className="text-amber-400" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white leading-tight">Gear & Tackle</h1>
          <p className="text-slate-500 text-xs">{setups?.length ?? 0} setups saved</p>
        </div>
        <Link href="/gear/new" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors">
          <Plus size={15} /> Add Setup
        </Link>
      </div>

      {!setups || setups.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Wrench size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-1">No setups saved yet.</p>
          <p className="text-xs text-slate-700 mb-4">Add your rods, reels, and lines so you can tag them to catches.</p>
          <Link href="/gear/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors">
            <Plus size={13} /> Add first setup
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {setups.map(s => (
            <Link
              key={s.id}
              href={`/gear/${s.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                <Wrench size={16} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{s.name}</p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">
                  {[s.rod, s.reel, s.line].filter(Boolean).join(" · ") || "No details added"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {catchCounts[s.id] ? (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Fish size={10} />{catchCounts[s.id]} catches
                  </p>
                ) : (
                  <p className="text-xs text-slate-700">No catches yet</p>
                )}
              </div>
              <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
