"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveSpot } from "@/lib/actions/spots";
import { useToast } from "@/components/ui/Toaster";

export default function SaveSpotButton({ spotId, initialSaved }: { spotId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleToggle() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      try {
        await toggleSaveSpot(spotId, saved);
        toast(next ? "Spot saved!" : "Removed from saved spots");
      } catch {
        setSaved(saved);
        toast("Something went wrong", "error");
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-medium transition-all ${
        saved
          ? "bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/30"
          : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
      }`}
      title={saved ? "Remove from saved" : "Save this spot"}
    >
      <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save Spot"}
    </button>
  );
}
