import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Moon, Sun, Clock, TrendingUp, Calendar, Cloud, Wind, Droplets } from "lucide-react";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";

// Utah center as default — in future we can use user's home_state lat/lng
const DEFAULT_LNG = -111.5;
const DEFAULT_LAT = 40.2;

const WX_DESCS: Record<number, string> = {
  0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 51: "Light Drizzle", 61: "Light Rain", 63: "Rain",
  71: "Light Snow", 80: "Showers", 95: "Thunderstorm",
};
function wxDesc(code: number) {
  const keys = Object.keys(WX_DESCS).map(Number).filter(k => k <= code);
  const best = keys.length ? Math.max(...keys) : 0;
  return WX_DESCS[best] ?? "Cloudy";
}
function wxIcon(code: number) {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code < 60) return "🌫️";
  if (code < 70) return "🌧️";
  if (code < 80) return "🌨️";
  if (code < 90) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

function moonPhaseName(phase: number): { name: string; emoji: string } {
  if (phase < 0.0625 || phase >= 0.9375) return { name: "New Moon",        emoji: "🌑" };
  if (phase < 0.1875)                    return { name: "Waxing Crescent",  emoji: "🌒" };
  if (phase < 0.3125)                    return { name: "First Quarter",    emoji: "🌓" };
  if (phase < 0.4375)                    return { name: "Waxing Gibbous",   emoji: "🌔" };
  if (phase < 0.5625)                    return { name: "Full Moon",        emoji: "🌕" };
  if (phase < 0.6875)                    return { name: "Waning Gibbous",   emoji: "🌖" };
  if (phase < 0.8125)                    return { name: "Last Quarter",     emoji: "🌗" };
  return                                        { name: "Waning Crescent",  emoji: "🌘" };
}

function getMoonPhase(date: Date): number {
  const NEW_MOON_EPOCH_MS = 946929240000;
  const LUNAR_CYCLE_MS = 29.53058867 * 24 * 3600 * 1000;
  return ((date.getTime() - NEW_MOON_EPOCH_MS) % LUNAR_CYCLE_MS) / LUNAR_CYCLE_MS;
}

type WxCurrent = { temperature_2m: number; windspeed_10m: number; weathercode: number; precipitation: number };
type WxDaily = { time: string[]; weathercode: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_sum: number[] };

async function fetchWeather(): Promise<{ current: WxCurrent; daily: WxDaily } | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LNG}&current=temperature_2m,windspeed_10m,weathercode,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FDenver&forecast_days=7`,
      { next: { revalidate: 1800 } }
    );
    const d = await res.json();
    if (d.current && d.daily) return { current: d.current, daily: d.daily };
  } catch { /* ignore */ }
  return null;
}

export default async function ForecastPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  const [weather] = await Promise.all([fetchWeather()]);

  const now = new Date();
  const todayScore = computeFishingScore(DEFAULT_LNG, now);
  const todayLabel = scoreLabel(todayScore);
  const moonPhase = getMoonPhase(now);
  const moon = moonPhaseName(moonPhase);

  // Compute hourly scores for today
  const hourlyScores = Array.from({ length: 24 }, (_, h) => {
    const d = new Date(now);
    d.setHours(h, 0, 0, 0);
    const score = computeFishingScore(DEFAULT_LNG, d);
    const label = scoreLabel(score);
    return { hour: h, score, label };
  });

  // Find best windows (top 3 hours)
  const sorted = [...hourlyScores].sort((a, b) => b.score - a.score);
  const bestHours = sorted.slice(0, 3).sort((a, b) => a.hour - b.hour);

  // 7-day outlook
  const weekScores = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    d.setHours(10, 0, 0, 0); // Score at 10am each day as representative
    const score = computeFishingScore(DEFAULT_LNG, d);
    const label = scoreLabel(score);
    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    return { dayName, date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), score, label };
  });

  function fmtHour(h: number) {
    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";
    return `${h - 12} PM`;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <TrendingUp className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Fishing Forecast</h1>
          <p className="text-slate-500 text-xs">Solunar timing + moon phase for today and the week ahead</p>
        </div>
      </div>

      {/* Today hero */}
      <div className="mb-6 p-5 rounded-2xl border border-white/10 bg-white/3" style={{ borderColor: todayLabel.color + "40", background: todayLabel.color + "08" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Right now</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black" style={{ color: todayLabel.color }}>{todayScore}</span>
              <div>
                <p className="text-xl font-bold" style={{ color: todayLabel.color }}>{todayLabel.label}</p>
                <p className="text-xs text-slate-500">out of 10 · fishing conditions</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl mb-1">{moon.emoji}</p>
            <p className="text-sm font-semibold text-white">{moon.name}</p>
            <p className="text-xs text-slate-500">{Math.round(moonPhase * 100)}% through cycle</p>
          </div>
        </div>
      </div>

      {/* Current weather */}
      {weather && (
        <div className="mb-6 p-4 rounded-2xl border border-white/8 bg-white/2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Cloud size={12} /> Current Conditions · Utah
          </h2>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{wxIcon(weather.current.weathercode)}</span>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round(weather.current.temperature_2m)}°F</p>
                <p className="text-xs text-slate-500">{wxDesc(weather.current.weathercode)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Wind size={13} className="text-blue-400" /> {Math.round(weather.current.windspeed_10m)} mph</span>
              {weather.current.precipitation > 0 && (
                <span className="flex items-center gap-1.5"><Droplets size={13} className="text-cyan-400" /> {weather.current.precipitation}&quot; precip</span>
              )}
            </div>
            {/* Fishing impact tip */}
            <p className="text-xs text-slate-600 ml-auto">
              {weather.current.weathercode <= 1 && "Clear skies → fish may run deeper, try slower presentations."}
              {weather.current.weathercode >= 2 && weather.current.weathercode <= 3 && "Overcast conditions often mean active surface feeding."}
              {weather.current.weathercode >= 60 && weather.current.weathercode < 70 && "Rain can trigger aggressive feeding — great time to be out."}
              {weather.current.weathercode >= 80 && "Post-storm clarity improving — fish are waking up."}
            </p>
          </div>
        </div>
      )}

      {/* Best windows today */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Clock size={12} /> Best Windows Today
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {bestHours.map(({ hour, score, label }) => (
            <div key={hour} className="p-4 rounded-xl border text-center" style={{ borderColor: label.color + "40", background: label.color + "10" }}>
              <p className="text-lg font-bold" style={{ color: label.color }}>{fmtHour(hour)}</p>
              <p className="text-2xl font-black text-white mt-1">{score}</p>
              <p className="text-xs mt-0.5" style={{ color: label.color }}>{label.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly chart — Pro gated */}
      <div className="mb-6 relative">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Sun size={12} /> Hourly Breakdown
        </h2>
        <div className={`rounded-2xl border border-white/8 overflow-hidden ${!isPro ? "select-none" : ""}`}>
          <div className="p-4 grid grid-cols-6 sm:grid-cols-8 gap-2">
            {hourlyScores.map(({ hour, score, label }) => {
              const isNow = hour === now.getHours();
              return (
                <div
                  key={hour}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isNow ? "bg-white/10 ring-1 ring-white/20" : ""}`}
                >
                  <p className="text-[10px] text-slate-600">{fmtHour(hour)}</p>
                  <div className="w-full bg-white/5 rounded-full overflow-hidden h-16 flex flex-col justify-end">
                    <div
                      className="w-full rounded-full transition-all"
                      style={{ height: `${(score / 10) * 100}%`, backgroundColor: label.color, minHeight: 2 }}
                    />
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: label.color }}>{score}</p>
                </div>
              );
            })}
          </div>
        </div>
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(to bottom, transparent 0%, #060d1a 60%)" }}>
            <div className="text-center px-6 pb-6">
              <Sparkles size={24} className="text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white mb-1">Full hourly breakdown is Pro</p>
              <p className="text-xs text-slate-500 mb-3">See the best hour-by-hour fishing windows for any day</p>
              <Link href="/pro" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors">
                <Sparkles size={11} /> Upgrade to Pro
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 7-day outlook */}
      <div className="mb-6 relative">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Calendar size={12} /> 7-Day Outlook
        </h2>
        <div className={`space-y-2 ${!isPro ? "select-none" : ""}`}>
          {weekScores.map(({ dayName, date, score, label }, i) => {
            const wx = weather?.daily;
            const wxCode = wx?.weathercode?.[i];
            const hi = wx?.temperature_2m_max?.[i];
            const lo = wx?.temperature_2m_min?.[i];
            return (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2">
                <div className="w-24 shrink-0">
                  <p className="text-sm font-semibold text-white">{dayName}</p>
                  <p className="text-xs text-slate-600">{date}</p>
                </div>
                {wxCode != null && (
                  <div className="flex items-center gap-1.5 w-20 shrink-0">
                    <span className="text-base">{wxIcon(wxCode)}</span>
                    <div className="text-xs leading-tight">
                      {hi != null && <p className="text-slate-300">{Math.round(hi)}°</p>}
                      {lo != null && <p className="text-slate-600">{Math.round(lo)}°</p>}
                    </div>
                  </div>
                )}
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(score / 10) * 100}%`, backgroundColor: label.color }} />
                </div>
                <div className="w-16 text-right shrink-0">
                  <span className="text-sm font-bold" style={{ color: label.color }}>{score}</span>
                  <span className="text-xs text-slate-600 ml-1">{label.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        {!isPro && (
          <div className="absolute inset-0 flex items-end justify-center rounded-2xl pb-4" style={{ background: "linear-gradient(to bottom, transparent 0%, #060d1a 55%)" }}>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-2">7-day forecast is a <span className="text-amber-400 font-semibold">Pro</span> feature</p>
              <Link href="/pro" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors">
                <Sparkles size={11} /> Unlock with Pro
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl border border-white/6 bg-white/1">
        <p className="text-xs font-semibold text-slate-500 mb-2">How scores are calculated</p>
        <p className="text-xs text-slate-600">
          Scores (0–10) are calculated using solunar theory — the relationship between moon position, lunar phase, and feeding patterns.
          Major feeding windows occur when the moon is directly overhead or underfoot. Minor windows occur at 90° positions.
          New and full moons amplify activity. Golden hours at dawn and dusk add bonus points.
        </p>
      </div>
    </div>
  );
}
