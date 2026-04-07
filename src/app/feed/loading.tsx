import { SkeletonFeedCard } from "@/components/ui/Skeleton";
import HookSpinner from "@/components/ui/HookSpinner";

export default function FeedLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <HookSpinner size={44} className="mb-8" />
      <div className="flex gap-2 mb-6">
        <div className="h-8 w-24 bg-white/6 animate-pulse rounded-full" />
        <div className="h-8 w-28 bg-white/6 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonFeedCard key={i} />)}
      </div>
    </div>
  );
}
