import { SkeletonFeedCard } from "@/components/ui/Skeleton";

export default function FeedLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/6 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-36 bg-white/6 animate-pulse rounded-lg" />
          <div className="h-3 w-24 bg-white/6 animate-pulse rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-8 w-24 bg-white/6 animate-pulse rounded-full" />
        <div className="h-8 w-28 bg-white/6 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonFeedCard key={i} />)}
      </div>
    </div>
  );
}
