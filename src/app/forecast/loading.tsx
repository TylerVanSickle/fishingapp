import { Skeleton } from "@/components/ui/Skeleton";

export default function ForecastLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-44 mb-2" />
      <Skeleton className="h-4 w-56 mb-8" />
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/8 bg-white/2 p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
