"use client";

import { useState } from "react";
import { Share2, Link, Check } from "lucide-react";

interface Props {
  title: string;
  text?: string;
  url?: string; // defaults to current page URL
}

export default function ShareButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ?? window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
    >
      {copied ? (
        <><Check size={12} className="text-green-400" /> Copied!</>
      ) : (
        <><Share2 size={12} /> Share</>
      )}
    </button>
  );
}
