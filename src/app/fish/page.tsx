import { createClient } from "@/lib/supabase/server";
import { Fish } from "lucide-react";
import FishSearch from "@/components/FishSearch";

export default async function FishPage() {
  const supabase = await createClient();

  const [{ data: species }, { data: catchCounts }] = await Promise.all([
    supabase
      .from("fish_species")
      .select("id, name, description, color_description, best_seasons, habitat")
      .order("name"),
    supabase.from("catches").select("fish_id"),
  ]);

  const countMap: Record<string, number> = {};
  catchCounts?.forEach((c) => {
    countMap[c.fish_id] = (countMap[c.fish_id] ?? 0) + 1;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Fish className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Fish Species</h1>
          <p className="text-slate-500 text-xs">
            {species?.length ?? 0} species · identification guides, habitat info &amp; fishing tips
          </p>
        </div>
      </div>

      <FishSearch species={species ?? []} countMap={countMap} />
    </div>
  );
}
