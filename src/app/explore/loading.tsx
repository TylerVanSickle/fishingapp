import { Skeleton } from "@/components/ui/Skeleton";
import HookSpinner from "@/components/ui/HookSpinner";

export default function ExploreLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HookSpinner size={44} className="mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-white/8 bg-white/2 space-y-3">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
