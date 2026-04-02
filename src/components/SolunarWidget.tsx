"use client";

import { useMemo } from "react";
import { Moon, Sun, Fish, Clock } from "lucide-react";

// ── Solunar calculations ──────────────────────────────────────────────────────

function getMoonPhase(date: Date): { age: number; name: string; emoji: string; illumination: number } {
  // Days since known new moon: Jan 6, 2000 00:18 UTC
  const KNOWN_NEW_MOON = new Date("2000-01-06T00:18:00Z").getTime();
  const LUNAR_CYCLE = 29.530588853; // days

  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;

  // Illumination: 0 at new moon, 1 at full moon
  const illumination = (1 - Math.cos((age / LUNAR_CYCLE) * 2 * Math.PI)) / 2;

  let name: string, emoji: string;
  if (age < 1.85)       { name = "New Moon";        emoji = "🌑"; }
  else if (age < 7.38)  { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (age < 9.22)  { name = "First Quarter";   emoji = "🌓"; }
  else if (age < 14.77) { name = "Waxing Gibbous";  emoji = "🌔"; }
  else if (age < 16.61) { name = "Full Moon";       emoji = "🌕"; }
  else if (age < 22.15) { name = "Waning Gibbous";  emoji = "🌖"; }
  else if (age < 23.99) { name = "Last Quarter";    emoji = "🌗"; }
  else                  { name = "Waning Crescent";  emoji = "🌘"; }

  return { age, name, emoji, illumination };
}

function getFishingScore(moonAge: number): { score: number; label: string; color: string } {
  const LUNAR_CYCLE = 29.530588853;
  const halfCycle = LUNAR_CYCLE / 2;
  // Distance from nearest new or full moon (0 = new/full, 7.38 = quarter)
  const distanceFromSyzygy = Math.min(moonAge, LUNAR_CYCLE - moonAge, Math.abs(moonAge - halfCycle));
  // Score: 10 at new/full, ~5 at quarters
  const score = Math.round(10 - (distanceFromSyzygy / 7.38) * 5);

  let label: string, color: string;
  if (score >= 9)      { label = "Excellent";  color = "text-green-400"; }
  else if (score >= 7) { label = "Very Good";  color = "text-lime-400"; }
  else if (score >= 5) { label = "Good";       color = "text-yellow-400"; }
  else                 { label = "Fair";        color = "text-slate-400"; }

  return { score, label, color };
}

function getSolunarWindows(date: Date, lng: number): { type: "major" | "minor"; label: string; start: string; end: string }[] {
  // Approximate lunar day = 24h 50m = 1490 minutes
  const LUNAR_DAY_MIN = 1490;

  // Longitude offset: every 15° = 1 hour
  const lngOffsetMin = (lng / 360) * LUNAR_DAY_MIN;

  // Moon age in hours within current lunar day
  const KNOWN_NEW_MOON = new Date("2000-01-06T00:18:00Z").getTime();
  const elapsedMin = (date.getTime() - KNOWN_NEW_MOON) / 60000;
  const moonDayMin = ((elapsedMin + lngOffsetMin) % LUNAR_DAY_MIN + LUNAR_DAY_MIN) % LUNAR_DAY_MIN;

  // Upper transit (major #1) happens when moonDayMin = 0
  // Lower transit (major #2) happens 12h25m later
  const HALF_LUNAR = LUNAR_DAY_MIN / 2;
  const QUARTER_LUNAR = LUNAR_DAY_MIN / 4;

  const todayStart = new Date(date);
  todayStart.setHours(0, 0, 0, 0);
  const todayMin = (date.getTime() - todayStart.getTime()) / 60000;

  // Times today (minutes from midnight)
  const upperTransit = ((todayMin - moonDayMin + LUNAR_DAY_MIN) % LUNAR_DAY_MIN);
  const windows = [
    { type: "major" as const, offset: upperTransit,                     duration: 120 },
    { type: "major" as const, offset: (upperTransit + HALF_LUNAR)   % 1440, duration: 120 },
    { type: "minor" as const, offset: (upperTransit + QUARTER_LUNAR) % 1440, duration: 60  },
    { type: "minor" as const, offset: (upperTransit + 3 * QUARTER_LUNAR) % 1440, duration: 60 },
  ];

  function minsToTime(m: number) {
    const hh = Math.floor(((m % 1440) + 1440) % 1440 / 60);
    const mm = Math.floor(((m % 1440) + 1440) % 1440 % 60);
    const ampm = hh < 12 ? "AM" : "PM";
    const h = hh % 12 || 12;
    return `${h}:${String(mm).padStart(2, "0")} ${ampm}`;
  }

  return windows
    .sort((a, b) => a.offset - b.offset)
    .map((w) => ({
      type: w.type,
      label: w.type === "major" ? "Major Period" : "Minor Period",
      start: minsToTime(w.offset),
      end: minsToTime(w.offset + w.duration),
    }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SolunarWidget({ lng }: { lng: number }) {
  const { phase, windows, fishing } = useMemo(() => {
    const now = new Date();
    const phase = getMoonPhase(now);
    const fishing = getFishingScore(phase.age);
    const windows = getSolunarWindows(now, lng);
    return { phase, windows, fishing };
  }, [lng]);

  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide">
          <Moon size={14} className="text-violet-400" /> Solunar Forecast
        </h2>
        <span className="text-xs text-slate-600">Today</span>
      </div>

      {/* Moon phase + score */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl leading-none" title={phase.name}>{phase.emoji}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{phase.name}</p>
          <p className="text-xs text-slate-500">{Math.round(phase.illumination * 100)}% illuminated</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black ${fishing.color}`}>{fishing.score}<span className="text-sm font-normal text-slate-600">/10</span></div>
          <p className={`text-xs font-semibold ${fishing.color}`}>{fishing.label}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full bg-white/8 mb-5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            fishing.score >= 9 ? "bg-green-500" :
            fishing.score >= 7 ? "bg-lime-500" :
            fishing.score >= 5 ? "bg-yellow-500" : "bg-slate-500"
          }`}
          style={{ width: `${fishing.score * 10}%` }}
        />
      </div>

      {/* Feeding windows */}
      <div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
          <Clock size={11} /> Peak feeding windows
        </p>
        <div className="grid grid-cols-2 gap-2">
          {windows.map((w, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border text-center ${
                w.type === "major"
                  ? "border-violet-500/25 bg-violet-500/8"
                  : "border-white/8 bg-white/3"
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${
                w.type === "major" ? "text-violet-400" : "text-slate-500"
              }`}>
                {w.type === "major" ? "Major" : "Minor"}
              </p>
              <p className="text-xs text-slate-300 font-medium">{w.start}</p>
              <p className="text-[10px] text-slate-600">– {w.end}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-700 mt-3 text-center">
        Times approximate · Major = 2h window · Minor = 1h window
      </p>
    </div>
  );
}
