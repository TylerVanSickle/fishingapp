"use client";

import { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toaster";

interface Props {
  spotId: string;
  onUploaded: () => void;
}

export default function SpotPhotoUpload({ spotId, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearFile() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast("Sign in to upload photos", "error"); return; }

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${spotId}/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("spot-photos")
        .upload(path, file, { upsert: false });
      if (uploadErr) throw uploadErr;

      const photoUrl = supabase.storage.from("spot-photos").getPublicUrl(path).data.publicUrl;

      const { error: insertErr } = await supabase.from("spot_photos").insert({
        spot_id: spotId,
        user_id: user.id,
        photo_url: photoUrl,
        caption: caption.trim() || null,
      });
      if (insertErr) throw insertErr;

      toast("Photo uploaded!", "success");
      clearFile();
      setCaption("");
      onUploaded();
    } catch (err) {
      toast((err as Error).message ?? "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-36 rounded-xl object-cover border border-white/10" />
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-20 rounded-xl border border-dashed border-white/15 cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors">
          <Camera size={18} className="text-slate-600 mb-1" />
          <span className="text-xs text-slate-600">Add a photo of this spot</span>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      )}
      {preview && (
        <>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            maxLength={120}
            className="w-full px-3.5 py-2 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? "Uploading..." : "Share Photo"}
          </button>
        </>
      )}
    </form>
  );
}
