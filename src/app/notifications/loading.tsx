import { Skeleton } from "@/components/ui/Skeleton";
import HookSpinner from "@/components/ui/HookSpinner";

export default function NotificationsLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <HookSpinner size={44} className="mb-8" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-white/6 bg-white/2 flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
