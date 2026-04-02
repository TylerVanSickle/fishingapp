"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Save } from "lucide-react";
import { Select } from "@/components/ui/Select";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors";
const labelClass = "block text-sm text-slate-400 mb-1.5";

export default function NewJournalEntry() {
  const router = useRouter();
  const supabase = createClient();

  const [outingDate, setOutingDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [weather, setWeather] = useState("");
  const [wind, setWind] = useState("");
  const [tempF, setTempF] = useState("");
  const [waterClarity, setWaterClarity] = useState("");
  const [waterTempF, setWaterTempF] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) { setError("Notes are required."); return; }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error: err } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      outing_date: outingDate,
      title: title || null,
      body: body.trim(),
      weather: weather || null,
      wind: wind || null,
      temp_f: tempF ? parseFloat(tempF) : null,
      water_clarity: waterClarity || null,
      water_temp_f: waterTempF ? parseFloat(waterTempF) : null,
      mood: mood || null,
    }).select("id").single();

    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/journal/${data!.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <BookOpen className="text-amber-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">New Journal Entry</h1>
          <p className="text-slate-500 text-xs">Log this outing for future reference</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Date + title */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Outing Date *</label>
              <input type="date" value={outingDate} onChange={e => setOutingDate(e.target.value)} required className={`${inputClass} scheme-dark`} />
            </div>
            <div>
              <label className={labelClass}>Mood</label>
              <Select value={mood} onChange={e => setMood(e.target.value)}>
                <option value="">How&apos;d it go?</option>
                <option value="great">🤩 Great</option>
                <option value="good">😊 Good</option>
                <option value="okay">😐 Okay</option>
                <option value="slow">😴 Slow</option>
                <option value="skunked">😤 Skunked</option>
              </Select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Title (optional)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Morning on the Provo — crushed it"
              className={inputClass} maxLength={120} />
          </div>
        </div>

        {/* Conditions */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Conditions</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Weather</label>
              <Select value={weather} onChange={e => setWeather(e.target.value)}>
                <option value="">Select...</option>
                {["Sunny","Partly Cloudy","Overcast","Foggy","Light Rain","Heavy Rain","Windy","Snow"].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className={labelClass}>Wind</label>
              <Select value={wind} onChange={e => setWind(e.target.value)}>
                <option value="">Select...</option>
                {["Calm","Light Breeze","Moderate","Strong","Very Strong"].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className={labelClass}>Air Temp (°F)</label>
              <input type="number" step="1" value={tempF} onChange={e => setTempF(e.target.value)} placeholder="65" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Water Temp (°F)</label>
              <input type="number" step="0.5" value={waterTempF} onChange={e => setWaterTempF(e.target.value)} placeholder="52" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Water Clarity</label>
            <Select value={waterClarity} onChange={e => setWaterClarity(e.target.value)}>
              <option value="">Select...</option>
              {["Crystal Clear","Clear","Slightly Murky","Murky","Very Murky","Chocolate"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={8}
            placeholder="What worked, what didn't, where you fished, techniques you tried, things to remember for next time..."
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-slate-700 mt-1">{body.length} characters</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={16} />{loading ? "Saving..." : "Save Entry"}
        </button>
      </form>
    </div>
  );
}
