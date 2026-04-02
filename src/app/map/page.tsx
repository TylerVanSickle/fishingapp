import { createClient } from "@/lib/supabase/server";
import MapView from "@/components/MapView";

export default async function MapPage() {
  const supabase = await createClient();

  const { data: spots } = await supabase
    .from("spots")
    .select(`
      *,
      spot_fish (
        fish_species ( id, name )
      )
    `)
    .eq("approved", true);

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <MapView spots={spots ?? []} />
    </div>
  );
}
