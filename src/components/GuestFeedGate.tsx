"use client";

import { useState } from "react";
import Link from "next/link";
import { Fish, X } from "lucide-react";

export default function GuestFeedGate() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mt-2">
      {/* Blurred fake cards */}
      <div className="space-y-4 pointer-events-none select-none" aria-hidden>
        {[1, 2].map((i) => (
          <div key={i} className={`rounded-2xl border border-white/8 bg-white/2 overflow-hidden blur-sm opacity-${i === 1 ? "60" : "30"}`}>
            <div className="h-52 bg-white/4" />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/8" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-2 w-14 rounded bg-white/6" />
                </div>
              </div>
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/6" />
              <div className="h-3 w-3/4 rounded bg-white/6" />
            </div>
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-[#060d1a]/80 to-[#060d1a]">
        <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/12 bg-[#0b1628] p-6 shadow-2xl shadow-black/60">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
              <Fish size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Join HookLine</p>
              <p className="text-xs text-slate-500">See what anglers are catching near you</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/signup"
              className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-sm font-medium transition-colors"
            >
              Log in
            </Link>
          </div>

          <p className="text-center text-xs text-slate-700 mt-3">Free forever · No credit card</p>
        </div>
      </div>
    </div>
  );
}
