"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Search, ChevronDown, X, Plus } from "lucide-react";

type Option = { id: string; label: string; sub?: string };

type Props = {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  addNewHref?: string;
  addNewLabel?: string;
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  required,
  addNewHref,
  addNewLabel = "Add new",
}: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value);

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sub?.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSelect(opt: Option) {
    onChange(opt.id);
    setOpen(false);
    setQuery("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  }

  function handleOpen() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border text-left transition-colors ${
          open ? "border-blue-500" : "border-white/10 hover:border-white/20"
        }`}
      >
        {selected ? (
          <span className="flex-1 text-slate-100 text-sm truncate">{selected.label}</span>
        ) : (
          <span className="flex-1 text-slate-600 text-sm">{placeholder}</span>
        )}
        {selected ? (
          <X
            size={14}
            className="text-slate-500 hover:text-slate-300 shrink-0 transition-colors"
            onClick={handleClear}
          />
        ) : (
          <ChevronDown size={14} className="text-slate-500 shrink-0" />
        )}
      </button>

      {/* Hidden native select for form required validation */}
      {required && (
        <select
          required={required}
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
        >
          <option value="" />
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-white/12 bg-[#0a1628] shadow-2xl shadow-black/40 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8">
            <Search size={13} className="text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <X size={12} className="text-slate-500 hover:text-slate-300" />
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-slate-600 mb-3">No results for &ldquo;{query}&rdquo;</p>
                {addNewHref && (
                  <a
                    href={addNewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus size={12} /> {addNewLabel}
                  </a>
                )}
              </div>
            ) : (
              <>
                {filtered.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors ${
                      opt.id === value ? "bg-blue-600/15 text-blue-300" : "text-slate-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{opt.label}</div>
                      {opt.sub && (
                        <div className="text-xs text-slate-600 truncate capitalize">{opt.sub}</div>
                      )}
                    </div>
                    {opt.id === value && (
                      <span className="text-blue-400 text-xs shrink-0">✓</span>
                    )}
                  </button>
                ))}
                {addNewHref && (
                  <div className="border-t border-white/8 px-4 py-2.5">
                    <a
                      href={addNewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus size={12} /> {addNewLabel}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
