"use client";

import { deleteTrip } from "@/lib/actions/trips";

export default function DeleteTripButton({ tripId }: { tripId: string }) {
  return (
    <form
      action={deleteTrip.bind(null, tripId)}
      onSubmit={(e) => {
        if (!confirm("Delete this trip? This cannot be undone.")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-xs text-slate-600 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
      >
        Delete trip
      </button>
    </form>
  );
}
