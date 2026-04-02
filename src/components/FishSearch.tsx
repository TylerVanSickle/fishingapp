"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Fish, ChevronRight } from "lucide-react";

type FishSpecies = {
  id: string;
  name: string;
  description: string | null;
  color_description: string | null;
  best_seasons: string[] | null;
};

const WATER_TYPE_BADGE: Record<string, string> = {
  trout:   "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
  bass:    "text-green-300 bg-green-500/10 border-green-500/20",
  panfish: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  other:   "text-slate-300 bg-slate-500/10 border-slate-500/20",
};

function getCategory(name: string) {
  if (name.includes("Trout") || name.includes("Muskie") || name.includes("Salmon")) return "trout";
  if (name.includes("Bass")) return "bass";
  if (name.includes("Perch") || name.includes("Walleye") || name.includes("Catfish")) return "panfish";
  return "other";
}

export default function FishSearch({
  species,
  countMap,
}: {
  species: FishSpecies[];
  countMap: Record<string, number>;
}) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? species.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : species;

  return (
    <>
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search species..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Fish size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No species matching &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fish) => {
            const cat = getCategory(fish.name);
            const catchCount = countMap[fish.id] ?? 0;
            return (
              <Link
                key={fish.id}
                href={`/fish/${fish.id}`}
                className="group flex flex-col p-5 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/15 flex items-center justify-center">
                    <Fish size={18} className="text-blue-400" />
                  </div>
                  {catchCount > 0 && (
                    <span className="text-xs text-slate-600">{catchCount} catch{catchCount !== 1 ? "es" : ""}</span>
                  )}
                </div>
                <h2 className="font-bold text-slate-100 group-hover:text-white transition-colors mb-1">{fish.name}</h2>
                {fish.color_description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{fish.color_description}</p>
                )}
                {fish.best_seasons && fish.best_seasons.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {fish.best_seasons.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/8 capitalize">{s}</span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${WATER_TYPE_BADGE[cat]} capitalize`}>
                    {cat === "trout" ? "Salmonid" : cat === "panfish" ? "Panfish/Other" : cat}
                  </span>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
