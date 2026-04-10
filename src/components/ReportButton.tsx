"use client";

import { useState, useTransition } from "react";
import { Flag, X, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toaster";

const REASONS = [
  "Inappropriate content",
  "Offensive language",
  "Nudity or sexual content",
  "Spam or advertising",
  "Harassment or bullying",
  "Misinformation",
  "Other",
];

interface Props {
  contentType: "catch" | "spot" | "profile";
  contentId: string;
  /** True if current user is the owner — don't show report on own content */
  isOwn?: boolean;
}

export default function ReportButton({ contentType, contentId, isOwn = false }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const supabase = createClient();

  if (isOwn) return null;

  async function submit() {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast("Sign in to report content", "error"); return; }

      const { error } = await supabase.from("content_reports").insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason: reason || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast("You've already reported this", "info");
        } else {
          toast("Failed to submit report", "error");
        }
      } else {
        setDone(true);
        toast("Report submitted — our team will review it", "success");
      }
      setOpen(false);
    });
  }

  if (done) return (
    <span className="flex items-center gap-1 text-xs text-slate-600">
      <Flag size={11} /> Reported
    </span>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-400 transition-colors"
        title={`Report this ${contentType}`}
      >
        <Flag size={12} /> Report
      </button>

      {open && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 pb-24 sm:pb-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#0b1628] border border-white/12 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-base">Report {contentType}</h3>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Help keep HookLine family-friendly. Reports are reviewed by our moderation team.
            </p>

            <div className="relative mb-4">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-white/5 border border-white/12 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none text-sm transition-colors scheme-dark"
              >
                <option value="">Select a reason (optional)</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
