"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Fish, MapPin } from "lucide-react";

const TECHNIQUES = [
  { value: "", label: "All Techniques" },
  { value: "fly_fishing", label: "Fly Fishing" },
  { value: "spinning", label: "Spinning" },
  { value: "bait", label: "Bait Fishing" },
  { value: "lure", label: "Lure / Jerkbait" },
  { value: "jigging", label: "Jigging" },
  { value: "trolling", label: "Trolling" },
  { value: "ice_fishing", label: "Ice Fishing" },
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

interface Props {
  speciesNames: string[];
}

export default function WhereFishFilters({ speciesNames }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentMode = params.get("mode") ?? "find";
  const [spotInput, setSpotInput] = useState(params.get("spot") ?? "");

  // Keep input in sync if URL changes (e.g. clear)
  useEffect(() => {
    setSpotInput(params.get("spot") ?? "");
  }, [params]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    startTransition(() => router.replace(`/pro/where-to-fish?${next.toString()}`));
  }

  function switchMode(mode: string) {
    // Clear filters that don't apply to the other mode
    const next = new URLSearchParams();
    next.set("mode", mode);
    startTransition(() => router.replace(`/pro/where-to-fish?${next.toString()}`));
  }

  function submitSpotSearch(e: React.FormEvent) {
    e.preventDefault();
    update("spot", spotInput.trim());
  }

  const selectClass = "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none cursor-pointer";

  return (
    <div className="mb-6 space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/4 border border-white/8 w-fit">
        <button
          onClick={() => switchMode("find")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            currentMode === "find"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Fish size={13} />
          Find Spots by Fish
        </button>
        <button
          onClick={() => switchMode("spot")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            currentMode === "spot"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MapPin size={13} />
          Explore a Spot
        </button>
      </div>

      {/* Find Spots filters */}
      {currentMode === "find" && (
        <div className="flex flex-wrap gap-3">
          <select
            value={params.get("fish") ?? ""}
            onChange={(e) => update("fish", e.target.value)}
            disabled={isPending}
            className={selectClass}
          >
            <option value="" className="bg-[#0a1628]">All Species</option>
            {speciesNames.map((s) => (
              <option key={s} value={s} className="bg-[#0a1628]">{s}</option>
            ))}
          </select>

          <select
            value={params.get("state") ?? ""}
            onChange={(e) => update("state", e.target.value)}
            disabled={isPending}
            className={selectClass}
          >
            <option value="" className="bg-[#0a1628]">All States</option>
            {US_STATES.map((s) => (
              <option key={s} value={s} className="bg-[#0a1628]">{s}</option>
            ))}
          </select>

          <select
            value={params.get("technique") ?? ""}
            onChange={(e) => update("technique", e.target.value)}
            disabled={isPending}
            className={selectClass}
          >
            {TECHNIQUES.map((t) => (
              <option key={t.value} value={t.value} className="bg-[#0a1628]">{t.label}</option>
            ))}
          </select>

          {(params.get("fish") || params.get("state") || params.get("technique")) && (
            <button
              onClick={() => switchMode("find")}
              className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 border border-white/8 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Explore Spot search */}
      {currentMode === "spot" && (
        <form onSubmit={submitSpotSearch} className="flex gap-2">
          <input
            type="text"
            value={spotInput}
            onChange={(e) => setSpotInput(e.target.value)}
            placeholder="Search lake or river name…"
            className="flex-1 max-w-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            Search
          </button>
        </form>
      )}

      {isPending && (
        <span className="text-xs text-slate-500">Updating…</span>
      )}
    </div>
  );
}
