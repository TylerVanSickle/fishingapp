"use client";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, MapPin, Fish, X } from "lucide-react";
import Link from "next/link";

type SpotResult = { id: string; name: string; state: string | null; water_type: string | null };
type FishResult = { id: string; name: string };

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [spots, setSpots] = useState<SpotResult[]>([]);
  const [fish, setFish] = useState<FishResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setSpots([]);
      setFish([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const supabase = createClient();
      const [spotsRes, fishRes] = await Promise.all([
        supabase
          .from("spots")
          .select("id, name, state, water_type")
          .eq("approved", true)
          .ilike("name", `%${query}%`)
          .limit(5),
        supabase
          .from("fish_species")
          .select("id, name")
          .ilike("name", `%${query}%`)
          .limit(5),
      ]);
      setSpots(spotsRes.data ?? []);
      setFish(fishRes.data ?? []);
      setSearched(true);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setSpots([]);
    setFish([]);
    setSearched(false);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") closeSearch();
  }

  const hasResults = spots.length > 0 || fish.length > 0;
  const showDropdown = open && query.length >= 2 && (loading || searched);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          aria-label="Open search"
        >
          <Search size={16} />
        </button>
      ) : (
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search spots, fish..."
            className="w-64 pl-9 pr-8 py-2 rounded-full bg-white/8 border border-white/12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
          <button
            onClick={closeSearch}
            className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close search"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl border border-white/8 bg-[#0a1628] shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-slate-500 text-sm gap-2">
              <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="py-6 text-center text-slate-500 text-sm">No results found</div>
          ) : (
            <div className="py-1.5">
              {spots.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Spots
                  </div>
                  {spots.map((s) => (
                    <Link
                      key={s.id}
                      href={`/spots/${s.id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group"
                    >
                      <MapPin size={14} className="text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-200 group-hover:text-white truncate transition-colors">
                          {s.name}
                        </div>
                        {s.state && (
                          <div className="text-xs text-slate-600">{s.state}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </>
              )}
              {fish.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide mt-1">
                    Fish Species
                  </div>
                  {fish.map((f) => (
                    <Link
                      key={f.id}
                      href={`/fish/${f.id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group"
                    >
                      <Fish size={14} className="text-cyan-400 shrink-0" />
                      <div className="text-sm text-slate-200 group-hover:text-white transition-colors">
                        {f.name}
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
