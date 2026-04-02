import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Map, Calendar, X, Plus, Waves, MapPin } from "lucide-react";
import TripSpotSearch from "@/components/TripSpotSearch";
import { removeSpotFromTrip } from "@/lib/actions/trips";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/trips/" + id);

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, description, planned_date, user_id, trip_spots(spot_id, sort_order, spots(id, name, water_type, state))")
    .eq("id", id)
    .single();

  if (!trip) notFound();
  if (trip.user_id !== user.id) notFound();

  type TripSpot = {
    spot_id: string;
    sort_order: number;
    spots: { id: string; name: string; water_type: string; state: string | null } | null;
  };

  const tripSpots = ((trip.trip_spots as unknown as TripSpot[]) ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ts) => ts.spots)
    .filter(Boolean) as { id: string; name: string; water_type: string; state: string | null }[];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> My trips
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Map className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
          {trip.planned_date && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Calendar size={13} />
              {new Date(trip.planned_date).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          )}
          {trip.description && (
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{trip.description}</p>
          )}
        </div>
      </div>

      {/* Spots section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <MapPin size={13} className="text-blue-400" /> Spots ({tripSpots.length})
        </h2>

        {tripSpots.length > 0 ? (
          <div className="flex flex-col gap-3 mb-5">
            {tripSpots.map((spot, i) => (
              <div key={spot.id} className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-white/2 group">
                <span className="text-xs font-mono text-blue-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/spots/${spot.id}`}
                    className="font-medium text-slate-200 hover:text-blue-300 transition-colors"
                  >
                    {spot.name}
                  </Link>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Waves size={10} />
                    {spot.water_type}
                    {spot.state && <><span className="text-slate-700">·</span>{spot.state}</>}
                  </p>
                </div>
                <form action={removeSpotFromTrip.bind(null, id, spot.id)}>
                  <button
                    type="submit"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"
                    title="Remove from trip"
                  >
                    <X size={14} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-sm mb-4">No spots added yet. Search below to add spots to your trip.</p>
        )}

        {/* Add spot search */}
        <TripSpotSearch tripId={id} existingSpotIds={tripSpots.map((s) => s.id)} />
      </div>
    </div>
  );
}
