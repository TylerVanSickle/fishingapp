import { SkeletonSpotCard, Skeleton } from "@/components/ui/Skeleton";
import HookSpinner from "@/components/ui/HookSpinner";

export default function SpotsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <HookSpinner size={44} className="mb-8" />
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => <SkeletonSpotCard key={i} />)}
      </div>
    </div>
  );
}
