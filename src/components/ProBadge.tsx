import { Sparkles } from "lucide-react";

export default function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-linear-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 ${className}`}
    >
      <Sparkles size={9} />
      PRO
    </span>
  );
}
