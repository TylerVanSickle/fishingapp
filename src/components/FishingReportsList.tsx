import { Thermometer, Droplets, Flame } from "lucide-react";

type Report = {
  id: string;
  activity_level: string;
  water_clarity: string | null;
  water_temp_f: number | null;
  body: string;
  created_at: string;
  profiles: { username: string } | null;
};

const ACTIVITY_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  slow:     { label: "Slow",     dot: "bg-slate-500",  badge: "text-slate-400  bg-slate-500/10  border-slate-500/20" },
  moderate: { label: "Moderate", dot: "bg-yellow-500", badge: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  good:     { label: "Good",     dot: "bg-green-500",  badge: "text-green-400  bg-green-500/10  border-green-500/20" },
  hot:      { label: "Hot 🔥",  dot: "bg-orange-500", badge: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
};

const CLARITY_LABELS: Record<string, string> = {
  clear:            "Clear",
  slightly_stained: "Slightly Stained",
  stained:          "Stained",
  muddy:            "Muddy",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function FishingReportsList({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return (
      <p className="text-sm text-slate-600 py-2">No reports yet. Be the first to share conditions!</p>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const ac = ACTIVITY_CONFIG[r.activity_level] ?? ACTIVITY_CONFIG.moderate;
        return (
          <div key={r.id} className="p-4 rounded-xl border border-white/8 bg-white/2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${ac.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`} />
                  {ac.label}
                </span>
                {r.water_clarity && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Droplets size={10} />{CLARITY_LABELS[r.water_clarity] ?? r.water_clarity}
                  </span>
                )}
                {r.water_temp_f && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Thermometer size={10} />{r.water_temp_f}°F
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-600 shrink-0">{timeAgo(r.created_at)}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{r.body}</p>
            <p className="text-xs text-slate-700 mt-2">by {r.profiles?.username ?? "angler"}</p>
          </div>
        );
      })}
    </div>
  );
}
