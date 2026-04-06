import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Map } from "lucide-react";
import TripEditor from "./TripEditor";
import DeleteTripButton from "./DeleteTripButton";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/trips/" + id);

  const [{ data: trip }, { data: allSpecies }, { data: profileData }] = await Promise.all([
    supabase
      .from("trips")
      .select(`
        id, name, description, planned_date, user_id,
        bait_plan, gear_notes, checklist, target_species, is_public,
        trip_spots(
          spot_id, sort_order,
          spots(id, name, water_type, state, longitude)
        )
      `)
      .eq("id", id)
      .single(),
    supabase.from("fish_species").select("id, name").order("name"),
    supabase.from("profiles").select("is_pro").eq("id", user.id).single(),
  ]);
  const isPro = !!(profileData as unknown as { is_pro?: boolean } | null)?.is_pro;

  if (!trip) notFound();
  if (trip.user_id !== user.id) notFound();

  type TripSpotRow = {
    spot_id: string;
    sort_order: number;
    spots: { id: string; name: string; water_type: string; state: string | null; longitude: number | null } | null;
  };

  const tripSpots = ((trip.trip_spots as unknown as TripSpotRow[]) ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ts) => ts.spots)
    .filter(Boolean) as { id: string; name: string; water_type: string; state: string | null; longitude: number | null }[];

  type TripExtras = {
    bait_plan?: string | null;
    gear_notes?: string | null;
    checklist?: { text: string; done: boolean }[] | null;
    target_species?: string[] | null;
    is_public?: boolean;
  };
  const tripEx = trip as unknown as TripExtras;

  const tripData = {
    id: trip.id,
    name: trip.name,
    description: trip.description ?? null,
    planned_date: trip.planned_date ?? null,
    bait_plan: tripEx.bait_plan ?? null,
    gear_notes: tripEx.gear_notes ?? null,
    checklist: tripEx.checklist ?? [],
    target_species: tripEx.target_species ?? [],
    is_public: tripEx.is_public ?? false,
    user_id: trip.user_id,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> My trips
        </Link>
        <DeleteTripButton tripId={id} />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <Map className="text-blue-400" size={16} />
        </div>
        <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Trip Planner</span>
      </div>

      <TripEditor
        trip={tripData}
        tripSpots={tripSpots}
        allSpecies={allSpecies ?? []}
        isPro={isPro}
      />
    </div>
  );
}
