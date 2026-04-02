"use client";

import { useState, useTransition, useRef } from "react";
import { MessageCircle, Trash2, Flag, Send } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { addCatchComment, deleteCatchComment, reportCatchComment } from "@/lib/actions/social";
import { useToast } from "@/components/ui/Toaster";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { id: string; username: string; avatar_url: string | null } | null;
};

interface Props {
  catchId: string;
  initialComments: Comment[];
  currentUserId: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CatchComments({ catchId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [reported, setReported] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      try {
        await addCatchComment(catchId, trimmed);
        setText("");
        // Optimistic update — server revalidate will catch up
        setComments((prev) => [
          {
            id: crypto.randomUUID(),
            content: trimmed,
            created_at: new Date().toISOString(),
            user_id: currentUserId!,
            profiles: null,
          },
          ...prev,
        ]);
      } catch {
        toast("Failed to post comment", "error");
      }
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      try {
        await deleteCatchComment(commentId, catchId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch {
        toast("Failed to delete comment", "error");
      }
    });
  }

  function handleReport(commentId: string) {
    startTransition(async () => {
      try {
        await reportCatchComment(commentId);
        setReported((prev) => new Set([...prev, commentId]));
        toast("Comment reported — we'll review it", "info");
      } catch {
        toast("Failed to report comment", "error");
      }
    });
  }

  return (
    <div className="mt-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
        <MessageCircle size={13} className="text-blue-400" />
        Comments {comments.length > 0 && <span className="text-blue-500 normal-case font-normal">{comments.length}</span>}
      </h3>

      {/* Add comment */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
            }}
            rows={1}
            maxLength={500}
            placeholder="Add a comment…"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim() || isPending}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-600 mb-4">
          <Link href="/login" className="text-blue-400 hover:text-blue-300">Log in</Link> to comment.
        </p>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-xs text-slate-600">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              {c.profiles ? (
                <Link href={`/anglers/${c.profiles.id}`} className="shrink-0 mt-0.5">
                  <Avatar url={c.profiles.avatar_url} username={c.profiles.username} size={28} />
                </Link>
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  {c.profiles ? (
                    <Link href={`/anglers/${c.profiles.id}`} className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                      @{c.profiles.username}
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-slate-300">You</span>
                  )}
                  <span className="text-[10px] text-slate-600">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed break-words">{c.content}</p>
              </div>
              <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                {c.user_id === currentUserId ? (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={isPending}
                    title="Delete comment"
                    className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                ) : !reported.has(c.id) && (
                  <button
                    onClick={() => handleReport(c.id)}
                    disabled={isPending}
                    title="Report comment"
                    className="p-1 rounded text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Flag size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
