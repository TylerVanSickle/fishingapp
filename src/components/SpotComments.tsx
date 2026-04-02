"use client";

import { useState, useTransition, useRef } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { addSpotComment, deleteSpotComment } from "@/lib/actions/social";
import { useToast } from "@/components/ui/Toaster";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  profiles: { username: string } | null;
  user_id: string;
}

interface Props {
  spotId: string;
  comments: Comment[];
  currentUserId: string | null;
}

export default function SpotComments({ spotId, comments, currentUserId }: Props) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const text = body;
    setBody("");
    startTransition(async () => {
      try {
        await addSpotComment(spotId, text);
        toast("Comment posted!");
      } catch {
        toast("Could not post comment", "error");
      }
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      try {
        await deleteSpotComment(commentId, spotId);
        toast("Comment deleted", "info");
      } catch {
        toast("Could not delete comment", "error");
      }
    });
  }

  return (
    <div>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
        <MessageSquare size={14} className="text-purple-400" /> Discussion
        {comments.length > 0 && (
          <span className="text-slate-700 font-normal normal-case text-xs">({comments.length})</span>
        )}
      </h2>

      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share tips, ask questions…"
              rows={2}
              maxLength={1000}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/4 border border-white/8 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/6 resize-none text-sm transition-colors"
            />
            <button
              type="submit"
              disabled={!body.trim() || isPending}
              className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-default"
            >
              <Send size={13} />
            </button>
          </div>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-slate-600 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-300 text-xs font-bold">
                  {c.profiles?.username?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-medium text-slate-300">{c.profiles?.username ?? "Angler"}</span>
                  <span className="text-xs text-slate-600">
                    {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
              </div>
              {currentUserId === c.user_id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all mt-0.5 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
