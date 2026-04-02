"use client";

import { useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { verifySpot } from "@/lib/actions/trips";

interface Props {
  spotId: string;
  isVerified: boolean;
  verificationCount: number;
}

export default function SpotVerifyButton({ spotId, isVerified, verificationCount }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => verifySpot(spotId, isVerified));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isVerified ? "Unmark as accurate" : "Confirm this spot info is accurate"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
        isVerified
          ? "bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/8"
          : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
      }`}
    >
      <ShieldCheck size={13} />
      {isVerified ? "Verified by you" : "Confirm accurate"}
      {verificationCount > 0 && (
        <span className={`${isVerified ? "text-green-500/70" : "text-slate-600"}`}>
          · {verificationCount}
        </span>
      )}
    </button>
  );
}
