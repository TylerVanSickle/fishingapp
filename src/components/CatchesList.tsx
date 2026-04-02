import Link from "next/link";
import { Fish, Scale, Ruler } from "lucide-react";
import ClickablePhoto from "@/components/ClickablePhoto";

type CatchItem = {
  id: string;
  caught_at: string;
  weight_lbs: number | null;
  length_in: number | null;
  notes: string | null;
  photo_url: string | null;
  fish_species: { name: string } | null;
  baits: { name: string; type: string } | null;
  profiles: { username: string } | null;
};

export default function CatchesList({ catches }: { catches: CatchItem[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
        Recent Catches
        {catches.length > 0 && (
          <span className="ml-2 text-blue-500 normal-case font-normal">{catches.length}</span>
        )}
      </h2>

      {catches.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-white/8 bg-white/2">
          <Fish size={28} className="mx-auto mb-3 text-slate-700" />
          <p className="text-sm text-slate-600">No catches logged yet — be the first!</p>
          <Link href="/log-catch" className="text-blue-500 hover:text-blue-400 text-xs mt-2 inline-block transition-colors">
            Log a catch →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {catches.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden hover:border-white/14 transition-colors group">
              {c.photo_url && (
                <ClickablePhoto
                  src={c.photo_url}
                  alt={c.fish_species?.name ?? "Catch"}
                  className="w-full max-h-48 object-contain bg-black/20"
                  thumbClassName="w-full"
                />
              )}
              <Link href={`/catches/${c.id}`} className="block p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                      {c.fish_species?.name ?? "Unknown fish"}
                    </span>
                    {c.baits && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/8">
                        {c.baits.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 shrink-0 ml-2">
                    {new Date(c.caught_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                </div>

                {(c.weight_lbs || c.length_in) && (
                  <div className="flex items-center gap-4 mb-1.5">
                    {c.weight_lbs && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Scale size={11} /> {c.weight_lbs} lbs
                      </span>
                    )}
                    {c.length_in && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Ruler size={11} /> {c.length_in}&quot;
                      </span>
                    )}
                  </div>
                )}

                {c.notes && <p className="text-sm text-slate-500 line-clamp-2 mb-1.5">{c.notes}</p>}

                <p className="text-xs text-slate-700">
                  by <span className="text-slate-600">{c.profiles?.username ?? "angler"}</span>
                  <span className="ml-1.5 text-blue-500/60 group-hover:text-blue-400 transition-colors">View details →</span>
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
