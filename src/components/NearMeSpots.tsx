"use client";

import { useState } from "react";
import Link from "next/link";
import { LocateFixed, Fish, Waves } from "lucide-react";

type Spot = {
  id: string;
  name: string;
  water_type: string;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  spot_fish: { fish_species: { id: string; name: string } | null }[];
};

const WATER_COLOR: Record<string, string> = {
  river:     "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  stream:    "text-sky-400 bg-sky-500/10 border-sky-500/20",
  lake:      "text-blue-400 bg-blue-500/10 border-blue-500/20",
  reservoir: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  pond:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number) {
  const miles = km * 0.621371;
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export default function NearMeSpots({ spots }: { spots: Spot[] }) {
  const [status, setStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [sorted, setSorted] = useState<(Spot & { distKm: number })[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const withDist = spots
          .filter((s) => s.latitude != null && s.longitude != null)
          .map((s) => ({
            ...s,
            distKm: haversineKm(latitude, longitude, s.latitude!, s.longitude!),
          }))
          .sort((a, b) => a.distKm - b.distKm)
          .slice(0, 20);
        setSorted(withDist);
        setStatus("done");
      },
      (err) => {
        setError(err.code === 1 ? "Location access denied — check browser permissions" : "Could not get your location");
        setStatus("error");
      },
      { timeout: 8000 }
    );
  }

  if (status === "idle" || status === "locating" || status === "error") {
    return (
      <div className="mb-6">
        <button
          onClick={locate}
          disabled={status === "locating"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/12 text-slate-300 hover:text-white hover:border-blue-500/40 text-sm transition-colors disabled:opacity-50"
        >
          <LocateFixed size={14} className={status === "locating" ? "animate-pulse text-blue-400" : ""} />
          {status === "locating" ? "Finding your location..." : "Near Me"}
        </button>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400">
          <LocateFixed size={13} className="text-blue-400" />
          Nearest Spots to You
        </h2>
        <button
          onClick={() => { setSorted(null); setStatus("idle"); }}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted?.map((spot) => {
          const fish = spot.spot_fish
            .map((sf) => sf.fish_species)
            .filter(Boolean) as { id: string; name: string }[];
          const wtColor = WATER_COLOR[spot.water_type] ?? WATER_COLOR.lake;

          return (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="group block p-4 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight text-sm">
                    {spot.name}
                  </h3>
                  <p className="text-xs text-blue-400 mt-0.5">{fmtDist(spot.distKm)} away</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${wtColor}`}>
                  <Waves size={9} />
                  <span className="capitalize">{spot.water_type}</span>
                </span>
              </div>
              {fish.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Fish size={10} className="text-blue-400 shrink-0" />
                  {fish.slice(0, 3).map((f) => (
                    <span key={f.id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {f.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
