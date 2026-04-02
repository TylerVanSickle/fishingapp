"use client";

import { useTransition } from "react";
import { Lock, Globe } from "lucide-react";
import { updateMyCatch } from "@/lib/actions/catches";
import { useToast } from "@/components/ui/Toaster";

export default function PrivacyToggleButton({
  catchId,
  isPrivate,
}: {
  catchId: string;
  isPrivate: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleClick() {
    startTransition(async () => {
      try {
        await updateMyCatch(catchId, { is_private: !isPrivate });
        toast(isPrivate ? "Catch is now public" : "Catch is now private", "success");
      } catch {
        toast("Failed to update", "error");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={isPrivate ? "Make public" : "Make private"}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
        isPrivate
          ? "text-amber-500 hover:bg-amber-500/10"
          : "text-slate-700 hover:text-slate-400 hover:bg-white/5"
      }`}
    >
      {isPrivate ? <Lock size={13} /> : <Globe size={13} />}
    </button>
  );
}
