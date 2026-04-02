"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addSpotToTrip } from "@/lib/actions/trips";

interface Spot {
  id: string;
  name: string;
  water_type: string;
  state: string | null;
}

interface Props {
  tripId: string;
  existingSpotIds: string[];
}

export default function TripSpotSearch({ tripId, existingSpotIds }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Spot[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); setIsOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("spots")
        .select("id, name, water_type, state")
        .ilike("name", `%${value}%`)
        .eq("approved", true)
        .limit(8);
      setResults(data ?? []);
      setIsOpen(true);
    }, 300);
  }

  function handleAdd(spot: Spot) {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    startTransition(() => addSpotToTrip(tripId, spot.id));
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-blue-500/50 transition-colors">
        <Search size={14} className="text-slate-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search spots to add…"
          className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none"
        />
        {isPending && (
          <span className="text-xs text-slate-600">Adding…</span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#0a1628] shadow-xl z-30 overflow-hidden">
          {results.map((spot) => {
            const already = existingSpotIds.includes(spot.id);
            return (
              <button
                key={spot.id}
                type="button"
                disabled={already}
                onClick={() => !already && handleAdd(spot)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-40 disabled:cursor-default"
              >
                <div>
                  <p className="text-sm text-slate-200">{spot.name}</p>
                  <p className="text-xs text-slate-600 capitalize">{spot.water_type}{spot.state ? ` · ${spot.state}` : ""}</p>
                </div>
                {already ? (
                  <span className="text-xs text-slate-600">Added</span>
                ) : (
                  <Plus size={15} className="text-blue-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
