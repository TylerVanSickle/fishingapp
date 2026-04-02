"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wrench, Save } from "lucide-react";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors";
const labelClass = "block text-sm text-slate-400 mb-1.5";

export default function NewGearSetup() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [rod, setRod] = useState("");
  const [reel, setReel] = useState("");
  const [line, setLine] = useState("");
  const [leader, setLeader] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Setup name is required."); return; }
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error: err } = await supabase.from("gear_setups").insert({
      user_id: user.id,
      name: name.trim(),
      rod: rod || null,
      reel: reel || null,
      line: line || null,
      leader: leader || null,
      notes: notes || null,
    }).select("id").single();

    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/gear/${data!.id}`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <Wrench className="text-amber-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">New Setup</h1>
          <p className="text-slate-500 text-xs">Save a rod & reel configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>Setup Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            placeholder='e.g. "Trout ultralight" or "Bass heavy"'
            className={inputClass} maxLength={80} />
        </div>

        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tackle Details</h2>
          <div>
            <label className={labelClass}>Rod</label>
            <input type="text" value={rod} onChange={e => setRod(e.target.value)}
              placeholder='e.g. "St. Croix Triumph 6\'6\" UL"' className={inputClass} maxLength={100} />
          </div>
          <div>
            <label className={labelClass}>Reel</label>
            <input type="text" value={reel} onChange={e => setReel(e.target.value)}
              placeholder='e.g. "Shimano Nasci 2500"' className={inputClass} maxLength={100} />
          </div>
          <div>
            <label className={labelClass}>Main Line</label>
            <input type="text" value={line} onChange={e => setLine(e.target.value)}
              placeholder='e.g. "4lb Berkley Trilene mono"' className={inputClass} maxLength={100} />
          </div>
          <div>
            <label className={labelClass}>Leader</label>
            <input type="text" value={leader} onChange={e => setLeader(e.target.value)}
              placeholder='e.g. "2lb fluorocarbon"' className={inputClass} maxLength={100} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="What species / conditions is this setup ideal for?"
            className={`${inputClass} resize-none`} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={16} />{loading ? "Saving..." : "Save Setup"}
        </button>
      </form>
    </div>
  );
}
