import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Map, Calendar, MapPin, Fish, Utensils, Wrench, CheckSquare,
  Globe, Waves, Check, Lock,
} from "lucide-react";

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select(`
      id, name, description, planned_date, is_public, user_id,
      bait_plan, gear_notes, checklist, target_species,
      profiles!user_id(username),
      trip_spots(
        sort_order,
        spots(id, name, water_type, state)
      )
    `)
    .eq("id", id)
    .single();

  if (!trip) notFound();

  const isPublic = !!(trip as unknown as { is_public?: boolean }).is_public;
  if (!isPublic) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-slate-500" size={28} />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">This trip is private</h1>
        <p className="text-slate-500 text-sm">The owner hasn&apos;t shared this trip publicly.</p>
        <Link href="/trips" className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors">
          Plan your own trip →
        </Link>
      </div>
    );
  }

  type TripSpotRow = {
    sort_order: number;
    spots: { id: string; name: string; water_type: string; state: string | null } | null;
  };

  const tripSpots = ((trip.trip_spots as unknown as TripSpotRow[]) ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ts) => ts.spots)
    .filter(Boolean) as { id: string; name: string; water_type: string; state: string | null }[];

  const profile = trip.profiles as unknown as { username: string } | null;
  type SharedTripExtras = {
    bait_plan?: string | null;
    gear_notes?: string | null;
    checklist?: { text: string; done: boolean }[] | null;
    target_species?: string[] | null;
  };
  const tripEx = trip as unknown as SharedTripExtras;

  const baitPlan = tripEx.bait_plan ?? null;
  const gearNotes = tripEx.gear_notes ?? null;
  const checklist = tripEx.checklist ?? [];
  const targetSpeciesIds = tripEx.target_species ?? [];

  // Fetch species names if any targeted
  let speciesNames: string[] = [];
  if (targetSpeciesIds.length > 0) {
    const { data: species } = await supabase
      .from("fish_species")
      .select("id, name")
      .in("id", targetSpeciesIds);
    speciesNames = (species ?? []).map((s) => s.name);
  }

  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Map className="text-blue-400" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/15 border border-green-500/20 rounded-full px-2 py-0.5">
              <Globe size={10} /> Public Trip
            </span>
            {profile && (
              <Link href={`/anglers/${trip.user_id}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                by @{profile.username}
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
          {trip.planned_date && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Calendar size={13} />
              {new Date(trip.planned_date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          )}
          {trip.description && (
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{trip.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Spots */}
        {tripSpots.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin size={11} /> Spots ({tripSpots.length})
            </h3>
            <div className="flex flex-col gap-2">
              {tripSpots.map((spot, i) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.id}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-xs text-slate-700 w-4">{i + 1}</span>
                  <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                    {spot.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600 capitalize">
                    <Waves size={10} /> {spot.water_type}
                    {spot.state && <>, {spot.state}</>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Target Species */}
        {speciesNames.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Fish size={11} /> Target Species
            </h3>
            <div className="flex flex-wrap gap-2">
              {speciesNames.map((name) => (
                <span key={name} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bait Plan */}
          {baitPlan && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Utensils size={11} /> Bait Plan
              </h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{baitPlan}</p>
            </div>
          )}

          {/* Gear Notes */}
          {gearNotes && (
            <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Wrench size={11} /> Gear & Setup
              </h3>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{gearNotes}</p>
            </div>
          )}
        </div>

        {/* Checklist */}
        {checklist.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <CheckSquare size={11} /> Packing Checklist
              </span>
              <span className="text-slate-600 font-normal normal-case text-xs">{doneCount}/{checklist.length} packed</span>
            </h3>
            <div className="h-1 rounded-full bg-white/6 mb-4 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: checklist.length ? `${(doneCount / checklist.length) * 100}%` : "0%" }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${item.done ? "bg-green-500 border-green-500" : "border-white/20"}`}>
                    {item.done && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-sm ${item.done ? "line-through text-slate-600" : "text-slate-300"}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-8 pt-6 border-t border-white/6 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-slate-500">Plan your own fishing trip on HookLine</p>
        <Link
          href="/trips"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          Plan a Trip →
        </Link>
      </div>
    </div>
  );
}
