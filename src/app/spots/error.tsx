"use client";

import { RefreshCw, MapPin } from "lucide-react";
import Link from "next/link";

export default function SpotsError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
        <MapPin size={24} className="text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Spots failed to load</h2>
      <p className="text-slate-500 text-sm mb-6">Something went wrong loading fishing spots.</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/12 text-slate-300 hover:text-white text-sm transition-colors"
        >
          <RefreshCw size={14} /> Try again
        </button>
        <Link href="/map" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          Open map
        </Link>
      </div>
    </div>
  );
}
