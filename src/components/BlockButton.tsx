"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";
import { blockUser, unblockUser } from "@/lib/actions/social";

export default function BlockButton({
  targetUserId,
  isBlocked: initialBlocked,
}: {
  targetUserId: string;
  isBlocked: boolean;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (blocked) {
      startTransition(async () => {
        await unblockUser(targetUserId);
        setBlocked(false);
      });
      return;
    }

    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    setConfirming(false);
    startTransition(async () => {
      await blockUser(targetUserId);
      setBlocked(true);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        blocked
          ? "bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25"
          : confirming
            ? "bg-red-600 text-white"
            : "bg-white/5 border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/25"
      } disabled:opacity-50`}
    >
      <Ban size={12} />
      {blocked ? "Unblock" : confirming ? "Confirm block?" : "Block"}
    </button>
  );
}
