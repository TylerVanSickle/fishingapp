import { Skeleton } from "@/components/ui/Skeleton";

export default function CatchDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-64 w-full rounded-2xl mb-6" />
      <div className="p-6 rounded-2xl border border-white/8 bg-white/2 mb-4 space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-2xl border border-white/8 bg-white/2 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
