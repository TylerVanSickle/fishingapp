"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const TECHNIQUES = [
  { value: "", label: "All Techniques" },
  { value: "fly_fishing", label: "🪰 Fly Fishing" },
  { value: "spinning", label: "🎣 Spinning" },
  { value: "bait", label: "🪱 Bait Fishing" },
  { value: "lure", label: "🐟 Lure / Jerkbait" },
  { value: "jigging", label: "⚡ Jigging" },
  { value: "trolling", label: "🚤 Trolling" },
  { value: "ice_fishing", label: "❄️ Ice Fishing" },
];

const US_STATES = [
  "", "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

export default function WhereFishFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    startTransition(() => router.replace(`/pro/where-to-fish?${next.toString()}`));
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={params.get("technique") ?? ""}
        onChange={(e) => update("technique", e.target.value)}
        disabled={isPending}
        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none cursor-pointer"
      >
        {TECHNIQUES.map((t) => (
          <option key={t.value} value={t.value} className="bg-[#0a1628]">{t.label}</option>
        ))}
      </select>

      <select
        value={params.get("state") ?? ""}
        onChange={(e) => update("state", e.target.value)}
        disabled={isPending}
        className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 appearance-none cursor-pointer"
      >
        <option value="" className="bg-[#0a1628]">All States</option>
        {US_STATES.filter(Boolean).map((s) => (
          <option key={s} value={s} className="bg-[#0a1628]">{s}</option>
        ))}
      </select>

      {isPending && (
        <span className="text-xs text-slate-500 self-center">Updating…</span>
      )}
    </div>
  );
}
