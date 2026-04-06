import { createClient } from "@/lib/supabase/server";
import CatchMapView from "@/components/CatchMapView";
import type { CatchPin } from "@/components/CatchMapView";

export default async function CatchMapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch recent public catches with spot coordinates
  let query = supabase
    .from("catches")
    .select("id, caught_at, weight_lbs, length_in, photo_url, is_private, user_id, fish_species(name), spots(id, name, latitude, longitude), profiles!user_id(id, username)")
    .not("spots", "is", null)
    .order("caught_at", { ascending: false })
    .limit(500);

  const { data: raw } = await query;

  // Filter private catches (owner can see their own)
  const catches: CatchPin[] = (raw ?? [])
    .filter(c => !c.is_private || c.user_id === user?.id)
    .map(c => {
      const spot = c.spots as unknown as { id: string; name: string; latitude: number; longitude: number } | null;
      const fish = c.fish_species as unknown as { name: string } | null;
      const profile = c.profiles as unknown as { id: string; username: string } | null;
      if (!spot) return null;
      return {
        id: c.id,
        caught_at: c.caught_at,
        weight_lbs: c.weight_lbs,
        length_in: c.length_in,
        photo_url: c.photo_url,
        latitude: spot.latitude,
        longitude: spot.longitude,
        fish_name: fish?.name ?? "Unknown",
        spot_name: spot.name,
        spot_id: spot.id,
        username: profile?.username ?? "angler",
        user_id: (c as Record<string, unknown>).user_id as string,
      } satisfies CatchPin;
    })
    .filter((c): c is CatchPin => c !== null);

  const speciesList = [...new Set(catches.map(c => c.fish_name))].sort();

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <CatchMapView catches={catches} speciesList={speciesList} />
    </div>
  );
}
