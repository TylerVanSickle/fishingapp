"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  X, Fish, MapPin, Navigation2, Scale, Ruler,
  Waves, TrendingUp, Clock, ChevronRight, Flame
} from "lucide-react";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";
import type { Spot } from "@/types/database";

type SpotWithFish = Spot & {
  spot_fish: { fish_species: { id: string; name: string } | null }[];
};

type CatchItem = {
  id: string;
  caught_at: string;
  weight_lbs: number | null;
  length_in: number | null;
  notes: string | null;
  fish_species: { name: string } | null;
  baits: { name: string; type: string } | null;
  profiles: { username: string } | null;
};

type BaitCount = { name: string; count: number };

const WATER_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; techniques: string[] }> = {
  river:     { label: "River",      color: "text-cyan-300",   bg: "bg-cyan-500/15 border-cyan-500/25",   techniques: ["Fly Fishing", "Spin Fishing", "Nymphing"] },
  stream:    { label: "Stream",     color: "text-sky-300",    bg: "bg-sky-500/15 border-sky-500/25",     techniques: ["Fly Fishing", "Spin Fishing"] },
  lake:      { label: "Lake",       color: "text-blue-300",   bg: "bg-blue-500/15 border-blue-500/25",   techniques: ["Shore Fishing", "Boat Fishing", "Trolling"] },
  reservoir: { label: "Reservoir",  color: "text-violet-300", bg: "bg-violet-500/15 border-violet-500/25", techniques: ["Trolling", "Boat Fishing", "Shore Fishing"] },
  pond:      { label: "Pond",       color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/25", techniques: ["Shore Fishing", "Family Friendly"] },
};

function openDirections(lat: number, lng: number) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMac = /Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  if (isIOS || isMac) {
    window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`);
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function SpotPanel({
  spot,
  onClose,
}: {
  spot: SpotWithFish;
  onClose: () => void;
}) {
  const [catches, setCatches] = useState<CatchItem[]>([]);
  const [topBaits, setTopBaits] = useState<BaitCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fish = spot.spot_fish
    .map((sf) => sf.fish_species)
    .filter(Boolean) as { id: string; name: string }[];

  const wt = WATER_TYPE_CONFIG[spot.water_type] ?? WATER_TYPE_CONFIG.lake;
  const forecastScore = computeFishingScore(Number(spot.longitude));
  const forecast = scoreLabel(forecastScore);

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);

    supabase
      .from("catches")
      .select("id, caught_at, weight_lbs, length_in, notes, fish_species(name), baits(name, type), profiles!user_id(username)")
      .eq("spot_id", spot.id)
      .order("caught_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCatches(data as unknown as CatchItem[]);
          const counts: Record<string, number> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data as any[]).forEach((c) => {
            const baitName = Array.isArray(c.baits) ? c.baits[0]?.name : c.baits?.name;
            if (baitName) counts[baitName] = (counts[baitName] ?? 0) + 1;
          });
          setTopBaits(
            Object.entries(counts)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 4)
          );
        }
        setLoading(false);
      });
  }, [spot.id]);

  return (
    <div className="h-full flex flex-col bg-[#070e1c] border-l border-white/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/6 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${wt.bg} ${wt.color}`}>
              <Waves size={11} />
              {wt.label}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{ color: forecast.color, borderColor: `${forecast.color}40`, background: `${forecast.color}15` }}
            >
              <Flame size={10} />
              {forecast.label} {forecastScore.toFixed(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <h2 className="text-xl font-bold text-white mb-1 leading-tight">{spot.name}</h2>

        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <MapPin size={11} />
          <span>
            {(spot as unknown as { state?: string }).state
              ? `${(spot as unknown as { state?: string }).state} · `
              : ""}
            {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
          </span>
        </div>

        {spot.description && (
          <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-2">
            {spot.description}
          </p>
        )}

        {/* Techniques */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {wt.techniques.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/8">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Fish species */}
        {fish.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Fish size={13} className="text-blue-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Fish Here</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fish.map((f) => (
                <Link
                  key={f.id}
                  href={`/fish/${f.id}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-200 border border-blue-500/20 hover:bg-blue-500/25 hover:text-white transition-colors"
                >
                  {f.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Access notes */}
        {spot.access_notes && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-semibold text-amber-500/70 uppercase tracking-wide mb-1">Access</p>
            <p className="text-xs text-slate-400 leading-relaxed">{spot.access_notes}</p>
          </div>
        )}

        {/* Top baits */}
        {!loading && topBaits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <TrendingUp size={13} className="text-blue-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Top Baits</span>
              <span className="text-xs text-slate-700 ml-auto">{catches.length} catches</span>
            </div>
            <div className="space-y-2">
              {topBaits.map((bait, i) => (
                <div key={bait.name} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-blue-600 w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <div
                      className="h-1.5 rounded-full bg-blue-600/30"
                      style={{ width: `${(bait.count / topBaits[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-300 shrink-0">{bait.name}</span>
                  <span className="text-xs text-slate-600 w-6 text-right">{bait.count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent catches */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Clock size={13} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent Catches</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-white/3 animate-pulse" />
              ))}
            </div>
          ) : catches.length === 0 ? (
            <div className="py-6 text-center rounded-xl border border-white/5">
              <Fish size={20} className="mx-auto mb-2 text-slate-700" />
              <p className="text-xs text-slate-600">No catches yet — be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {catches.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-white/3 border border-white/6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200">
                      {c.fish_species?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-slate-600">{timeAgo(c.caught_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {c.weight_lbs && (
                      <span className="flex items-center gap-1"><Scale size={10} />{c.weight_lbs} lbs</span>
                    )}
                    {c.length_in && (
                      <span className="flex items-center gap-1"><Ruler size={10} />{c.length_in}&quot;</span>
                    )}
                    {c.baits && (
                      <span className="text-slate-600">on {c.baits.name}</span>
                    )}
                  </div>
                  {c.profiles && (
                    <p className="text-xs text-slate-700 mt-1">by {c.profiles.username}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 py-4 border-t border-white/6 space-y-2 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openDirections(spot.latitude, spot.longitude)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            <Navigation2 size={14} className="text-blue-400" />
            Directions
          </button>
          <Link
            href={`/log-catch?spot=${spot.id}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Fish size={14} />
            Log Catch
          </Link>
        </div>
        <Link
          href={`/spots/${spot.id}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View full details <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
