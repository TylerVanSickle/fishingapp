/**
 * Pure-math fishing forecast score (0–10) based on solunar timing.
 * No API calls needed. Based on lunar phase + current time proximity
 * to major/minor feeding windows.
 *
 * @param lngDeg  Spot longitude (degrees) — used to localise solar noon
 * @param now     Date to score (default: current time)
 */
export function computeFishingScore(lngDeg: number, now: Date = new Date()): number {
  // ── Lunar phase score (0–1) ────────────────────────────────────────────────
  // Known new moon: 2000-01-06T18:14Z
  const NEW_MOON_EPOCH_MS = 946929240000;
  const LUNAR_CYCLE_MS = 29.53058867 * 24 * 3600 * 1000;
  const phase = ((now.getTime() - NEW_MOON_EPOCH_MS) % LUNAR_CYCLE_MS) / LUNAR_CYCLE_MS;
  // Score peaks at new moon (0) and full moon (0.5)
  const phaseScore = Math.max(
    1 - Math.abs(phase) * 4,         // new moon peak
    1 - Math.abs(phase - 0.5) * 4,   // full moon peak
    0
  );

  // ── Local solar time (offset by longitude) ────────────────────────────────
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  const solarHour = (utcHour + lngDeg / 15 + 24) % 24;

  // ── Solunar transit times (local solar) ──────────────────────────────────
  const moonTransitLocal = (now.getTime() / (24 * 3600 * 1000) * 24.8412) % 24;
  const major1 = moonTransitLocal % 24;
  const major2 = (moonTransitLocal + 12.42) % 24;
  const minor1 = (moonTransitLocal + 6.21) % 24;
  const minor2 = (moonTransitLocal + 18.63) % 24;

  function hourDiff(a: number, b: number) {
    const d = Math.abs(a - b);
    return Math.min(d, 24 - d);
  }

  const dM1 = hourDiff(solarHour, major1);
  const dM2 = hourDiff(solarHour, major2);
  const dMi1 = hourDiff(solarHour, minor1);
  const dMi2 = hourDiff(solarHour, minor2);

  const closestMajor = Math.min(dM1, dM2);
  const closestMinor = Math.min(dMi1, dMi2);

  // Major window: ±1h, minor: ±0.5h
  const majorScore = Math.max(0, 1 - closestMajor / 1.0);
  const minorScore = Math.max(0, 1 - closestMinor / 0.5) * 0.5;
  const transitScore = Math.max(majorScore, minorScore);

  // ── Golden hours (dawn/dusk ±1.5h from 6am and 7pm solar) ─────────────────
  const dDawn = hourDiff(solarHour, 6);
  const dDusk = hourDiff(solarHour, 19);
  const goldenScore = Math.max(0, 1 - Math.min(dDawn, dDusk) / 1.5) * 0.4;

  // ── Combined score → 0–10 ──────────────────────────────────────────────────
  const raw = phaseScore * 0.4 + transitScore * 0.4 + goldenScore * 0.2;
  return Math.round(Math.min(raw * 10, 10) * 10) / 10;
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 7.5) return { label: "Hot",      color: "#f97316" };
  if (score >= 5)   return { label: "Good",     color: "#22c55e" };
  if (score >= 2.5) return { label: "Moderate", color: "#eab308" };
  return                   { label: "Slow",     color: "#64748b" };
}
