"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateMyCatch } from "@/lib/actions/catches";

type CatchData = {
  id: string;
  caught_at: string;
  weight_lbs: number | null;
  length_in: number | null;
  notes: string | null;
  fish_id: string;
  spot_id: string;
  bait_id: string | null;
  fish_name: string;
  spot_name: string;
};

type Props = {
  catch_: CatchData;
  onClose: () => void;
};

export default function EditCatchModal({ catch_, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [weight, setWeight] = useState(catch_.weight_lbs?.toString() ?? "");
  const [length, setLength] = useState(catch_.length_in?.toString() ?? "");
  const [caughtAt, setCaughtAt] = useState(
    catch_.caught_at ? catch_.caught_at.slice(0, 16) : ""
  );
  const [notes, setNotes] = useState(catch_.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateMyCatch(catch_.id, {
        weight_lbs: weight !== "" ? parseFloat(weight) : null,
        length_in: length !== "" ? parseFloat(length) : null,
        caught_at: caughtAt ? new Date(caughtAt).toISOString() : undefined,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#0a1628] border border-white/12 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-200">Edit Catch</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-xs text-slate-500 mb-4">
          {catch_.fish_name} · {catch_.spot_name}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Length (in)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="e.g. 14"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Date &amp; Time</label>
            <input
              type="datetime-local"
              value={caughtAt}
              onChange={(e) => setCaughtAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors scheme-dark"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any notes about this catch..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
