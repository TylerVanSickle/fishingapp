"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/Select";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Fish, Scale, Ruler, CalendarDays, Camera, X, Lock, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors";
const labelClass = "block text-sm text-slate-400 mb-1.5";

type Spot = { id: string; name: string; state: string | null; water_type: string };
type FishSpecies = { id: string; name: string };
type Bait = { id: string; name: string; type: string };

const BAIT_TYPE_LABELS: Record<string, string> = {
  lure: "Lures", fly: "Flies", live: "Live Bait", powerBait: "PowerBait", other: "Other",
};

export default function EditCatchPage() {
  const router = useRouter();
  const params = useParams();
  const catchId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [spots, setSpots] = useState<Spot[]>([]);
  const [fish, setFish] = useState<FishSpecies[]>([]);
  const [baits, setBaits] = useState<Bait[]>([]);

  const [spotId, setSpotId] = useState("");
  const [fishId, setFishId] = useState("");
  const [baitId, setBaitId] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [lengthIn, setLengthIn] = useState("");
  const [caughtAt, setCaughtAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: c }, { data: s }, { data: f }, { data: b }] = await Promise.all([
        supabase.from("catches").select("*").eq("id", catchId).eq("user_id", user.id).single(),
        supabase.from("spots").select("id, name, state, water_type").eq("approved", true).order("name"),
        supabase.from("fish_species").select("id, name").order("name"),
        supabase.from("baits").select("id, name, type").order("type").order("name"),
      ]);

      if (!c) { setNotFound(true); setLoading(false); return; }

      setSpotId(c.spot_id ?? "");
      setFishId(c.fish_id ?? "");
      setBaitId(c.bait_id ?? "");
      setWeightLbs(c.weight_lbs != null ? String(c.weight_lbs) : "");
      setLengthIn(c.length_in != null ? String(c.length_in) : "");
      setCaughtAt(c.caught_at ? new Date(c.caught_at).toISOString().slice(0, 16) : "");
      setNotes(c.notes ?? "");
      setIsPrivate(!!(c as Record<string, unknown>).is_private);
      setExistingPhotoUrl(c.photo_url ?? null);

      if (s) setSpots(s as Spot[]);
      if (f) setFish(f);
      if (b) setBaits(b);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catchId]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhotoFile(file);
    setNewPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    let photoUrl = existingPhotoUrl;
    if (newPhotoFile) {
      const ext = newPhotoFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("catch-photos").upload(path, newPhotoFile, { upsert: false });
      if (!uploadErr) {
        photoUrl = supabase.storage.from("catch-photos").getPublicUrl(path).data.publicUrl;
      }
    }

    const { error: err } = await supabase.from("catches").update({
      spot_id: spotId,
      fish_id: fishId,
      bait_id: baitId || null,
      weight_lbs: weightLbs ? parseFloat(weightLbs) : null,
      length_in: lengthIn ? parseFloat(lengthIn) : null,
      caught_at: new Date(caughtAt).toISOString(),
      notes: notes || null,
      photo_url: photoUrl,
      is_private: isPrivate,
    }).eq("id", catchId).eq("user_id", user.id);

    if (err) { setError(err.message); setSaving(false); return; }
    router.push(`/catches/${catchId}`);
    router.refresh();
  }

  const baitGroups = baits.reduce<Record<string, Bait[]>>((acc, b) => {
    acc[b.type] = acc[b.type] ?? [];
    acc[b.type].push(b);
    return acc;
  }, {});

  const spotOptions = spots.map(s => ({ id: s.id, label: s.name, sub: [s.water_type, s.state].filter(Boolean).join(" · ") }));
  const fishOptions = fish.map(f => ({ id: f.id, label: f.name }));

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (notFound) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-slate-400">Catch not found or you don&apos;t have permission to edit it.</p>
      <Link href="/profile/logbook" className="text-blue-400 hover:text-blue-300 text-sm mt-3 inline-block">← Back to logbook</Link>
    </div>
  );

  const displayPhoto = newPhotoPreview ?? existingPhotoUrl;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href={`/catches/${catchId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to catch
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <Fish className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Catch</h1>
          <p className="text-slate-500 text-xs">Update your catch details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Where &amp; What</h2>
          <div>
            <label className={labelClass}>Spot *</label>
            <SearchableSelect options={spotOptions} value={spotId} onChange={setSpotId} placeholder="Search for a spot..." required />
          </div>
          <div>
            <label className={labelClass}>Fish Species *</label>
            <SearchableSelect options={fishOptions} value={fishId} onChange={setFishId} placeholder="Search for a species..." required />
          </div>
          <div>
            <label className={labelClass}>Bait / Lure</label>
            <Select value={baitId} onChange={e => setBaitId(e.target.value)}>
              <option value="">Select bait (optional)</option>
              {Object.entries(baitGroups).map(([type, items]) => (
                <optgroup key={type} label={BAIT_TYPE_LABELS[type] ?? type}>
                  {items.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </optgroup>
              ))}
            </Select>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Measurements</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}><Scale size={12} className="inline mr-1" />Weight (lbs)</label>
              <input type="number" step="0.1" min="0" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="2.5" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Ruler size={12} className="inline mr-1" />Length (in)</label>
              <input type="number" step="0.5" min="0" value={lengthIn} onChange={e => setLengthIn(e.target.value)} placeholder='14"' className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}><CalendarDays size={12} className="inline mr-1" />Date &amp; Time *</label>
            <input type="datetime-local" value={caughtAt} onChange={e => setCaughtAt(e.target.value)} required className={`${inputClass} scheme-dark`} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Weather, water conditions, tips..." className={`${inputClass} resize-none`} />
        </div>

        {/* Photo */}
        <div>
          <label className={labelClass}><Camera size={12} className="inline mr-1" />Photo</label>
          {displayPhoto ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayPhoto} alt="Catch" className="h-40 rounded-xl object-cover border border-white/10" />
              <button type="button" onClick={() => { setNewPhotoFile(null); setNewPhotoPreview(null); setExistingPhotoUrl(null); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                <X size={12} />
              </button>
              {!newPhotoPreview && <p className="text-xs text-slate-600 mt-1">Current photo · click ✕ to remove</p>}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-white/15 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors">
              <Camera size={20} className="text-slate-600 mb-1" />
              <span className="text-xs text-slate-600">Click to add a photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Privacy */}
        <button type="button" onClick={() => setIsPrivate(p => !p)}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-colors text-left ${isPrivate ? "border-amber-500/30 bg-amber-500/8 text-amber-300" : "border-white/8 bg-white/2 text-slate-400 hover:border-white/15"}`}>
          <Lock size={15} className={isPrivate ? "text-amber-400" : "text-slate-600"} />
          <div className="flex-1">
            <p className="text-sm font-medium">{isPrivate ? "Private catch" : "Public catch"}</p>
            <p className="text-xs text-slate-600 mt-0.5">{isPrivate ? "Only you can see this" : "Visible to the community"}</p>
          </div>
          <div className={`w-9 h-5 rounded-full transition-colors ${isPrivate ? "bg-amber-500" : "bg-white/10"}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white mt-0.75 transition-all ${isPrivate ? "ml-4.5" : "ml-0.75"}`} />
          </div>
        </button>

        {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-red-400 text-sm">{error}</p></div>}

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={16} />{saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
