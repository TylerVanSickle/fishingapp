import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield } from "lucide-react";

const SEASON_COLORS: Record<string, string> = {
  spring: "text-green-400 bg-green-500/10 border-green-500/20",
  summer: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  fall:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  winter: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

export default async function RegulationsPage() {
  const supabase = await createClient();

  const { data: species } = await supabase
    .from("fish_species")
    .select("id, name, legal_size_in, best_seasons, description")
    .order("name");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <Shield className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Fishing Regulations</h1>
          <p className="text-slate-500 text-xs">General size limits &amp; best seasons</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-amber-300 text-sm leading-relaxed">
          Always verify current regulations with your state fish &amp; wildlife agency — rules vary by water body, state, and year. This is general guidance only.
        </p>
      </div>

      {/* Species list */}
      <div className="flex flex-col gap-3">
        {species?.map((s) => {
          const seasons: string[] = Array.isArray(s.best_seasons) ? s.best_seasons : [];

          return (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2"
            >
              {/* Left: name + description */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/fish/${s.id}`}
                  className="font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  {s.name}
                </Link>
                {s.description && (
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{s.description}</p>
                )}
              </div>

              {/* Right: size badge + season badges */}
              <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 whitespace-nowrap">
                  {s.legal_size_in != null ? `Min ${s.legal_size_in}"` : "No minimum"}
                </span>
                {seasons.map((season) => (
                  <span
                    key={season}
                    className={`text-xs px-2 py-0.5 rounded-full border capitalize ${SEASON_COLORS[season] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}
                  >
                    {season}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {(!species || species.length === 0) && (
          <p className="text-sm text-slate-600 text-center py-12">No species data available.</p>
        )}
      </div>
    </div>
  );
}
