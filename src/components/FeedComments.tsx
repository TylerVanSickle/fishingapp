"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send } from "lucide-react";
import { addCatchComment } from "@/lib/actions/social";
import Avatar from "@/components/Avatar";

type Comment = {
  id: string;
  catch_id: string;
  content: string;
  created_at: string;
  profiles: { id: string; username: string } | null;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function FeedComments({
  catchId,
  initialComments,
  isLoggedIn,
  currentUserId,
}: {
  catchId: string;
  initialComments: Comment[];
  isLoggedIn: boolean;
  currentUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const count = comments.length;

  // Show newest first in feed, but display oldest-first when expanded
  const displayed = open ? [...comments].reverse() : [];
  const hasMore = count > 3;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = text.trim();
    if (!val || pending) return;
    setText("");

    // Optimistic update
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      catch_id: catchId,
      content: val,
      created_at: new Date().toISOString(),
      profiles: { id: currentUserId ?? "", username: "you" },
    };
    setComments((prev) => [optimistic, ...prev]);

    startTransition(async () => {
      try {
        await addCatchComment(catchId, val);
      } catch {
        // Revert optimistic update on failure
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        setText(val);
      }
    });
  }

  return (
    <div className="border-t border-white/6 pt-3">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2"
      >
        <MessageSquare size={13} />
        {count === 0 ? "Add a comment" : `${count} comment${count !== 1 ? "s" : ""}`}
      </button>

      {open && (
        <div className="space-y-3">
          {/* Comments list */}
          {displayed.length > 0 && (
            <div className="space-y-2.5">
              {(hasMore ? displayed.slice(-3) : displayed).map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar url={null} username={c.profiles?.username ?? "?"} size={22} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {c.profiles?.id ? (
                        <Link href={`/anglers/${c.profiles.id}`} className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                          @{c.profiles.username}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-slate-300">@{c.profiles?.username ?? "?"}</span>
                      )}
                      <span className="text-xs text-slate-600">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
              {hasMore && (
                <Link href={`/catches/${catchId}`} className="text-xs text-blue-500 hover:text-blue-400 transition-colors block">
                  View all {count} comments →
                </Link>
              )}
            </div>
          )}

          {/* Input */}
          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={500}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!text.trim() || pending}
                className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={12} className="text-white" />
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in to comment →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
