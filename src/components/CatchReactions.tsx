"use client";

import { useTransition } from "react";
import { setCatchReaction } from "@/lib/actions/social";

const EMOJIS = ["🎣", "💪", "🏆", "🔥", "❄️"];

type Reaction = { emoji: string; count: number; reacted: boolean };

interface Props {
  catchId: string;
  reactions: Reaction[];
  currentUserReaction: string | null;
  isLoggedIn: boolean;
}

export default function CatchReactions({ catchId, reactions, currentUserReaction, isLoggedIn }: Props) {
  const [isPending, startTransition] = useTransition();

  // Build a map from emoji → count (merging server data)
  const countMap = new Map<string, number>(reactions.map((r) => [r.emoji, r.count]));

  function handleReact(emoji: string) {
    if (!isLoggedIn) return;
    const next = currentUserReaction === emoji ? null : emoji;
    startTransition(async () => {
      await setCatchReaction(catchId, next);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {EMOJIS.map((emoji) => {
        const count = countMap.get(emoji) ?? 0;
        const active = currentUserReaction === emoji;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={isPending || !isLoggedIn}
            title={isLoggedIn ? (active ? "Remove reaction" : "React") : "Log in to react"}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border transition-all disabled:opacity-60 ${
              active
                ? "bg-blue-500/20 border-blue-500/40 text-white scale-105"
                : "bg-white/4 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/8"
            } ${count === 0 && !active ? "opacity-50" : ""}`}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="text-xs font-medium text-slate-400">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
