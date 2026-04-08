"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Select } from "@/components/ui/Select";
import { MapPin, Camera, X } from "lucide-react";
import { submitSpot } from "@/lib/actions/spots";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors";

const labelClass = "block text-sm text-slate-400 mb-1.5";

function SubmitSpotForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [waterType, setWaterType] = useState("lake");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(searchParams.get("lat") ?? "");
  const [longitude, setLongitude] = useState(searchParams.get("lng") ?? "");
  const [accessNotes, setAccessNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("water_type", waterType);
      formData.set("state", state);
      formData.set("description", description);
      formData.set("latitude", latitude);
      formData.set("longitude", longitude);
      formData.set("access_notes", accessNotes);

      // Upload spot photo
      let photoUrl: string | null = null;
      if (photoFile) {
        const supabase = createClient();
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("spot-photos")
          .upload(path, photoFile, { upsert: false });
        if (!uploadErr) {
          photoUrl = supabase.storage.from("spot-photos").getPublicUrl(path).data.publicUrl;
        }
      }
      formData.set("photo_url", photoUrl ?? "");

      await submitSpot(formData);
      setSuccess(true);
      setTimeout(() => router.push("/spots?submitted=1"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <MapPin className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Submit a Spot</h1>
          <p className="text-slate-500 text-xs">Spots are reviewed before appearing on the map.</p>
        </div>
      </div>

      {success && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-400 text-sm font-medium">Spot submitted! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {/* Section 1: Location Details */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Location Details</h2>

          <div>
            <label className={labelClass}>Spot Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Strawberry Reservoir North Shore"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Water Type *</label>
            <Select value={waterType} onChange={(e) => setWaterType(e.target.value)} required>
              <option value="lake">Lake</option>
              <option value="river">River</option>
              <option value="stream">Stream</option>
              <option value="reservoir">Reservoir</option>
              <option value="pond">Pond</option>
            </Select>
          </div>

          <div>
            <label className={labelClass}>State *</label>
            <Select value={state} onChange={(e) => setState(e.target.value)} required>
              <option value="">Select a state...</option>
              {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Section 2: Coordinates */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Coordinates</h2>
          <p className="text-xs text-slate-600 -mt-2">
            {latitude && longitude ? "Auto-filled from map — adjust if needed" : "Find coordinates on Google Maps: right-click any location → copy lat/lng"}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Latitude *</label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                placeholder="40.7684"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Longitude *</label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                placeholder="-111.3926"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Description</h2>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What makes this spot great? Best times to fish it?"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Access Notes</label>
            <textarea
              value={accessNotes}
              onChange={(e) => setAccessNotes(e.target.value)}
              rows={2}
              placeholder="Parking, trails, boat ramps, hazards..."
              className={`${inputClass} resize-none`}
            />
            <p className="text-xs text-slate-600 mt-1.5">Parking, trails, boat ramps, hazards...</p>
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Camera size={13} className="text-slate-500" /> Spot Photo (optional)
            </span>
          </label>
          {photoPreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Spot preview" className="h-40 rounded-xl object-cover border border-white/10" />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-white/15 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors">
              <Camera size={20} className="text-slate-600 mb-1" />
              <span className="text-xs text-slate-600">Click to add a photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}

export default function SubmitSpotPage() {
  return (
    <Suspense>
      <SubmitSpotForm />
    </Suspense>
  );
}
