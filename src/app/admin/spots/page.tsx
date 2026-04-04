import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Check, X, ExternalLink, Search } from "lucide-react";
import { approveSpot, rejectSpot } from "@/lib/actions/spots";

export default async function AdminSpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  let approvedQuery = supabase.from("spots")
    .select("*, profiles!created_by(username)")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(query ? 50 : 30);

  if (query) approvedQuery = approvedQuery.ilike("name", `%${query}%`);

  const [{ data: pending }, { data: approved }] = await Promise.all([
    supabase.from("spots")
      .select("*, profiles!created_by(username)")
      .eq("approved", false)
      .order("created_at", { ascending: false }),
    approvedQuery,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Spot Management</h1>

      {/* Pending queue */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${pending?.length ? "bg-amber-500 text-black" : "bg-white/10 text-slate-500"}`}>
            {pending?.length ?? 0}
          </span>
          Pending Approval
        </h2>

        {!pending?.length ? (
          <div className="py-8 text-center text-slate-600 text-sm rounded-xl border border-dashed border-white/8">
            No spots waiting for review.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((spot) => {
              const profile = spot.profiles as { username: string } | null;
              return (
                <div key={spot.id} className="p-5 rounded-2xl border border-amber-500/15 bg-amber-500/3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{spot.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="capitalize flex items-center gap-1"><MapPin size={10} />{spot.water_type}</span>
                        <span>{spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</span>
                        <span>by @{profile?.username ?? "?"}</span>
                      </div>
                      {spot.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{spot.description}</p>
                      )}
                      {spot.access_notes && (
                        <p className="text-xs text-slate-600 mt-1">Access: {spot.access_notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form action={approveSpot.bind(null, spot.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
                        >
                          <Check size={13} /> Approve
                        </button>
                      </form>
                      <form action={rejectSpot.bind(null, spot.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-medium transition-colors"
                        >
                          <X size={13} /> Reject
                        </button>
                      </form>
                      <a
                        href={`https://www.google.com/maps?q=${spot.latitude},${spot.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approved spots */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Approved Spots ({approved?.length ?? 0} shown)
          </h2>
          <form method="GET" action="/admin/spots" className="flex gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search approved spots..."
                className="pl-9 pr-3 py-1.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-xs w-52"
              />
            </div>
            {query && (
              <Link href="/admin/spots" className="text-xs text-slate-500 hover:text-slate-300 self-center transition-colors">Clear</Link>
            )}
          </form>
        </div>
        <div className="space-y-2">
          {approved?.map((spot) => {
            const profile = spot.profiles as { username: string } | null;
            return (
              <div key={spot.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-white/2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-200">{spot.name}</span>
                  <span className="text-slate-600 text-xs ml-3 capitalize">{spot.water_type}</span>
                </div>
                <span className="text-xs text-slate-600">@{profile?.username ?? "?"}</span>
                <Link
                  href={`/spots/${spot.id}`}
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  View →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
