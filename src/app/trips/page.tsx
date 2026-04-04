import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Map, Calendar, Plus, Globe, Lock, ChevronRight, Zap, Sparkles } from "lucide-react";
import { createTrip } from "@/lib/actions/trips";

const FREE_TRIP_LIMIT = 3;

export default async function TripsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/trips");

  const [{ data: trips }, { data: profileData }] = await Promise.all([
    supabase
      .from("trips")
      .select("id, name, description, planned_date, is_public, checklist, trip_spots(spot_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("is_pro").eq("id", user.id).single(),
  ]);
  const isPro = !!(profileData as unknown as { is_pro?: boolean } | null)?.is_pro;
  const tripCount = trips?.length ?? 0;
  const atFreeLimit = !isPro && tripCount >= FREE_TRIP_LIMIT;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
            <Map className="text-blue-400" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Trips</h1>
            <p className="text-slate-500 text-xs">{trips?.length ?? 0} trip{trips?.length !== 1 ? "s" : ""} planned</p>
          </div>
        </div>
        <Link
          href="/trips/planner"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <Zap size={12} /> Trip Intel
        </Link>
      </div>

      {/* Create trip form */}
      {atFreeLimit ? (
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 mb-6 flex items-center gap-4">
          <Sparkles size={20} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white mb-0.5">Free plan limit reached</p>
            <p className="text-xs text-slate-400">You&apos;ve used all {FREE_TRIP_LIMIT} free trips. Upgrade to Pro for unlimited trip planning, bait plans, gear notes, solunar forecasts, and public sharing.</p>
          </div>
          <Link href="/pro" className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors">
            <Sparkles size={13} /> Go Pro
          </Link>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-6">
          <h2 className="text-sm font-semibold text-blue-300 mb-4 flex items-center gap-2">
            <Plus size={14} /> Plan a New Trip
            {!isPro && <span className="text-xs text-slate-600 font-normal">{tripCount}/{FREE_TRIP_LIMIT} free trips used</span>}
          </h2>
          <form action={createTrip} className="flex flex-col gap-3">
            <div>
              <input
                name="name"
                required
                placeholder="Trip name (e.g. Opening Day at Strawberry)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b1628] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                maxLength={80}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="description"
                placeholder="Notes (optional)"
                className="px-3.5 py-2.5 rounded-xl bg-[#0b1628] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              <input
                name="planned_date"
                type="date"
                className="px-3.5 py-2.5 rounded-xl bg-[#0b1628] border border-white/10 text-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-sm scheme-dark"
              />
            </div>
            <button
              type="submit"
              className="self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Create Trip
            </button>
          </form>
        </div>
      )}

      {/* Trips list */}
      {!trips?.length ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <Map size={32} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-400 font-medium">No trips yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first trip above to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => {
            type ChecklistItem = { text: string; done: boolean };
            const checklist = (trip.checklist as unknown as ChecklistItem[] | null) ?? [];
            const spotCount = (trip.trip_spots as { spot_id: string }[])?.length ?? 0;
            const doneCount = checklist.filter((c) => c.done).length;
            const isPublic = (trip as Record<string, unknown>).is_public as boolean;

            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group p-5 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                        {trip.name}
                      </h3>
                      {isPublic ? (
                        <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-1.5 py-0.5">
                          <Globe size={9} /> Public
                        </span>
                      ) : (
                        <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-slate-600 bg-white/4 rounded-full px-1.5 py-0.5">
                          <Lock size={9} /> Private
                        </span>
                      )}
                    </div>
                    {trip.description && (
                      <p className="text-xs text-slate-500 truncate mb-2">{trip.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      {trip.planned_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(trip.planned_date + "T12:00:00").toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      )}
                      {spotCount > 0 && (
                        <span>{spotCount} spot{spotCount !== 1 ? "s" : ""}</span>
                      )}
                      {checklist.length > 0 && (
                        <span>{doneCount}/{checklist.length} packed</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
                </div>

                {/* Checklist mini progress */}
                {checklist.length > 0 && (
                  <div className="mt-3 h-1 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${(doneCount / checklist.length) * 100}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
