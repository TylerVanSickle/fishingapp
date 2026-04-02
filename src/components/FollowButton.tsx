"use client";

import { useTransition } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollow } from "@/lib/actions/social";
import { useToast } from "@/components/ui/Toaster";

interface Props {
  targetUserId: string;
  isFollowing: boolean;
  compact?: boolean;
}

export default function FollowButton({ targetUserId, isFollowing, compact = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleClick() {
    startTransition(async () => {
      try {
        await toggleFollow(targetUserId, isFollowing);
        toast(isFollowing ? "Unfollowed" : "Now following!", isFollowing ? "info" : "success");
      } catch {
        toast("Something went wrong", "error");
      }
    });
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors disabled:opacity-50 border ${
          isFollowing
            ? "border-white/15 text-slate-400 hover:text-red-400 hover:border-red-500/20"
            : "border-blue-500/40 text-blue-400 hover:bg-blue-500/15"
        }`}
      >
        {isFollowing ? <UserCheck size={11} /> : <UserPlus size={11} />}
        {isFollowing ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
        isFollowing
          ? "bg-white/8 border border-white/15 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          : "bg-blue-600 hover:bg-blue-500 text-white"
      }`}
    >
      {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
    </button>
  );
}
