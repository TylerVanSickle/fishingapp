"use client";

import { useState, useTransition } from "react";
import { Map, ChevronDown, Check } from "lucide-react";
import { addSpotToTrip } from "@/lib/actions/trips";

interface Trip {
  id: string;
  name: string;
}

interface Props {
  spotId: string;
  trips: Trip[];
  tripIdsWithSpot: string[];
}

export default function AddToTripButton({ spotId, trips, tripIdsWithSpot }: Props) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set(tripIdsWithSpot));
  const [isPending, startTransition] = useTransition();

  if (trips.length === 0) {
    return (
      <a href="/trips/new" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
        <Map size={12} /> Plan a trip
      </a>
    );
  }

  function handleAdd(tripId: string) {
    if (added.has(tripId)) return;
    setAdded((prev) => new Set([...prev, tripId]));
    startTransition(() => addSpotToTrip(tripId, spotId));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Map size={12} /> Add to trip <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#0a1628] shadow-xl z-30 overflow-hidden">
          {trips.map((trip) => {
            const isAdded = added.has(trip.id);
            return (
              <button
                key={trip.id}
                type="button"
                disabled={isAdded || isPending}
                onClick={() => handleAdd(trip.id)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-white/5 transition-colors disabled:opacity-60 disabled:cursor-default"
              >
                <span className="text-sm text-slate-300 truncate">{trip.name}</span>
                {isAdded && <Check size={13} className="text-green-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
