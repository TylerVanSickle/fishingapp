"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Map } from "lucide-react";
import { createTrip } from "@/lib/actions/trips";

export default function NewTripPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createTrip(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> My trips
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <Map className="text-blue-400" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-white">Plan a trip</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Trip name *</label>
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Opening day bass trip"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Description</label>
          <textarea
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Notes about this trip…"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Planned date</label>
          <input
            name="planned_date"
            type="date"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 mt-1"
        >
          {isPending ? "Creating…" : "Create trip"}
        </button>
      </form>
    </div>
  );
}
