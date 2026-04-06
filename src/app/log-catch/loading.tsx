import { Skeleton } from "@/components/ui/Skeleton";

export default function LogCatchLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-8" />
      <div className="space-y-5">
        <div className="rounded-2xl border border-white/8 bg-white/2 p-6 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}
