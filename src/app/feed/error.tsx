"use client";

import { RefreshCw, Fish } from "lucide-react";

export default function FeedError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
        <Fish size={24} className="text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Feed failed to load</h2>
      <p className="text-slate-500 text-sm mb-6">Something went wrong loading the catch feed.</p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/12 text-slate-300 hover:text-white text-sm transition-colors"
      >
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}
