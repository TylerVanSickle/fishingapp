import { SkeletonProfileHeader, Skeleton } from "@/components/ui/Skeleton";
import HookSpinner from "@/components/ui/HookSpinner";

export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <HookSpinner size={44} className="mb-8" />
      <SkeletonProfileHeader />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-white/8 bg-white/2 space-y-2">
            <Skeleton className="h-7 w-12 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
