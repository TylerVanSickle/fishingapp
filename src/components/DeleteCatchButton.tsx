"use client";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMyCatch } from "@/lib/actions/catches";
import { useToast } from "@/components/ui/Toaster";

export default function DeleteCatchButton({ catchId, spotId }: { catchId: string; spotId: string }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleClick() {
    if (!confirm("Delete this catch? This can't be undone.")) return;
    startTransition(async () => {
      try {
        await deleteMyCatch(catchId, spotId);
        toast("Catch deleted", "info");
      } catch (err) {
        toast(err instanceof Error ? err.message : "Failed to delete", "error");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
      title="Delete catch"
    >
      <Trash2 size={13} />
    </button>
  );
}
