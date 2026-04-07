import HookSpinner from "@/components/ui/HookSpinner";

export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <HookSpinner size={56} />
    </div>
  );
}
