import { createClient } from "@/lib/supabase/server";
import MapView from "@/components/MapView";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let homeState: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("home_state").eq("id", user.id).single();
    homeState = (profile as { home_state?: string } | null)?.home_state ?? null;
  }

  const [{ data: spots }, { data: catchLocations }] = await Promise.all([
    supabase
      .from("spots")
      .select(`*, spot_fish ( fish_species ( id, name ) )`)
      .eq("approved", true),
    // Fetch catch coordinates for the heatmap (via spot coords)
    supabase
      .from("catches")
      .select("spots(latitude, longitude)")
      .eq("is_private", false)
      .not("spot_id", "is", null)
      .limit(2000),
  ]);

  // Flatten to [lng, lat] pairs where coords exist
  type CatchLoc = { spots: { latitude: number; longitude: number } | null };
  const heatmapPoints = (catchLocations ?? [])
    .map((c) => (c as unknown as CatchLoc).spots)
    .filter((s): s is { latitude: number; longitude: number } => s != null && s.latitude != null && s.longitude != null)
    .map((s) => [s.longitude, s.latitude] as [number, number]);

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <MapView spots={spots ?? []} heatmapPoints={heatmapPoints} homeState={homeState} />
    </div>
  );
}
