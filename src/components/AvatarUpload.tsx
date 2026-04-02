"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  currentUrl: string | null;
  username: string;
  onSaved: (url: string) => void;
}

export default function AvatarUpload({ currentUrl, username, onSaved }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFile(file: File) {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        // Bust cache with timestamp
        const url = `${data.publicUrl}?t=${Date.now()}`;
        await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
        onSaved(url);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-blue-400">
              {username[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 border-2 border-[#060d1a] flex items-center justify-center text-white transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Camera size={13} />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
      >
        {isPending ? "Uploading…" : preview ? "Change photo" : "Upload photo"}
      </button>
    </div>
  );
}
