"use client";

import Link from "next/link";
import { X, Fish, Waves } from "lucide-react";
import type { Spot } from "@/types/database";

type SpotWithFish = Spot & {
  spot_fish: { fish_species: { id: string; name: string } | null }[];
};

export default function SpotPopup({
  spot,
  onClose,
}: {
  spot: SpotWithFish;
  onClose: () => void;
}) {
  const fish = spot.spot_fish
    .map((sf) => sf.fish_species)
    .filter(Boolean) as { id: string; name: string }[];

  return (
    <div className="p-4 min-w-52.5 max-w-67.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-100 text-sm leading-tight">{spot.name}</h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 shrink-0 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
        <Waves size={11} />
        <span className="capitalize">{spot.water_type}</span>
      </div>

      {fish.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-4">
          <Fish size={11} className="text-blue-400 shrink-0" />
          {fish.map((f) => (
            <span
              key={f.id}
              className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20"
            >
              {f.name}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/spots/${spot.id}`}
        className="block w-full text-center text-xs py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
      >
        View spot →
      </Link>
    </div>
  );
}
