"use client";

import { useState, useTransition } from "react";
import { submitFishingReport } from "@/lib/actions/reports";
import { Select } from "@/components/ui/Select";
import { Flame, Wind, ChevronDown } from "lucide-react";

const ACTIVITY_LEVELS = [
  { value: "slow",     label: "Slow",     color: "text-slate-400",  dot: "bg-slate-500" },
  { value: "moderate", label: "Moderate", color: "text-yellow-400", dot: "bg-yellow-500" },
  { value: "good",     label: "Good",     color: "text-green-400",  dot: "bg-green-500" },
  { value: "hot",      label: "🔥 Hot",   color: "text-orange-400", dot: "bg-orange-500" },
];

const CLARITY_OPTIONS = [
  { value: "clear",            label: "Clear" },
  { value: "slightly_stained", label: "Slightly Stained" },
  { value: "stained",          label: "Stained" },
  { value: "muddy",            label: "Muddy" },
];

export default function FishingReportForm({ spotId }: { spotId: string }) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState("moderate");
  const [clarity, setClarity] = useState("");
  const [temp, setTemp] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("spot_id", spotId);
    fd.set("activity_level", activity);
    if (clarity) fd.set("water_clarity", clarity);
    if (temp) fd.set("water_temp_f", temp);
    fd.set("body", body);

    startTransition(async () => {
      await submitFishingReport(fd);
      setBody("");
      setDone(true);
      setOpen(false);
      setTimeout(() => setDone(false), 3000);
    });
  }

  if (done) {
    return (
      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
        Report submitted — thanks for the update!
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-slate-500 hover:text-slate-300 hover:border-white/25 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <Wind size={14} /> Post a conditions report
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-white/10 bg-white/2 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-300">Conditions Report</span>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400 text-xs">
          Cancel
        </button>
      </div>

      {/* Activity level */}
      <div>
        <label className="block text-xs text-slate-500 mb-2">Fishing Activity</label>
        <div className="grid grid-cols-4 gap-2">
          {ACTIVITY_LEVELS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setActivity(a.value)}
              className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                activity === a.value
                  ? "border-blue-500/50 bg-blue-600/15 text-white"
                  : "border-white/8 bg-white/3 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className={`block w-2 h-2 rounded-full ${a.dot} mx-auto mb-1`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Water Clarity</label>
          <Select value={clarity} onChange={(e) => setClarity(e.target.value)}>
            <option value="">— optional —</option>
            {CLARITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Water Temp (°F)</label>
          <input
            type="number" step="0.5" min="32" max="90"
            value={temp} onChange={(e) => setTemp(e.target.value)}
            placeholder="e.g. 58"
            className="w-full px-3 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Notes *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={2}
          placeholder="What's the fishing like right now? Any tips?"
          className="w-full px-3 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post Report"}
      </button>
    </form>
  );
}
