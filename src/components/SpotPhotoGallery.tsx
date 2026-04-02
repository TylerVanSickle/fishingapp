"use client";

import { useState, useEffect, useCallback } from "react";
import { Images, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SpotPhotoUpload from "@/components/SpotPhotoUpload";

type SpotPhoto = {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
};

interface Props {
  spotId: string;
  canUpload: boolean;
  currentUserId: string | null;
}

export default function SpotPhotoGallery({ spotId, canUpload, currentUserId }: Props) {
  const [photos, setPhotos] = useState<SpotPhoto[]>([]);
  const [lightbox, setLightbox] = useState<SpotPhoto | null>(null);
  const supabase = createClient();

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("spot_photos")
      .select("id, photo_url, caption, created_at, user_id, profiles!user_id(username)")
      .eq("spot_id", spotId)
      .order("created_at", { ascending: false })
      .limit(24);
    setPhotos((data ?? []) as unknown as SpotPhoto[]);
  }, [spotId, supabase]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  async function deletePhoto(photoId: string) {
    await supabase.from("spot_photos").delete().eq("id", photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (lightbox?.id === photoId) setLightbox(null);
  }

  if (photos.length === 0 && !canUpload) return null;

  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
        <Images size={14} className="text-blue-400" />
        Community Photos
        {photos.length > 0 && (
          <span className="text-slate-700 font-normal normal-case text-xs">({photos.length})</span>
        )}
      </h2>

      {canUpload && (
        <div className="mb-4">
          <SpotPhotoUpload spotId={spotId} onUploaded={loadPhotos} />
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative group cursor-pointer aspect-square"
              onClick={() => setLightbox(p)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.photo_url}
                alt={p.caption ?? "Spot photo"}
                className="w-full h-full object-cover rounded-xl border border-white/8 group-hover:border-white/20 transition-colors"
              />
              {p.caption && (
                <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-xs text-white line-clamp-2">{p.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.photo_url}
              alt={lightbox.caption ?? "Spot photo"}
              className="w-full rounded-2xl object-contain max-h-[70vh]"
            />
            <div className="flex items-start justify-between mt-3 px-1">
              <div>
                {lightbox.caption && (
                  <p className="text-sm text-slate-200">{lightbox.caption}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">
                  @{(lightbox.profiles as unknown as { username: string } | null)?.username ?? "angler"}
                  {" · "}
                  {new Date(lightbox.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentUserId === lightbox.user_id && (
                  <button
                    onClick={() => deletePhoto(lightbox.id)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setLightbox(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
