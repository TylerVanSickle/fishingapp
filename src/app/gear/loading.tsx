import { SkeletonCard } from "@/components/ui/Skeleton";

export default function GearLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-white/6 animate-pulse rounded-lg" />
          <div className="h-3 w-20 bg-white/6 animate-pulse rounded-lg" />
        </div>
        <div className="h-9 w-24 bg-white/6 animate-pulse rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
