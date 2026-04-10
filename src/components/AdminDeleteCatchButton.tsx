"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { adminDeleteCatch } from "@/lib/actions/catches";

export default function AdminDeleteCatchButton({ catchId, label }: { catchId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await adminDeleteCatch(catchId);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Delete catch"
      >
        <Trash2 size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0b1628] border border-white/12 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
                <h3 className="font-semibold text-white text-base">Delete Catch</h3>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-1">
              Are you sure you want to delete this catch?
            </p>
            <p className="text-xs text-slate-600 mb-5">
              {label} — this will also remove its comments and reactions. This cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
