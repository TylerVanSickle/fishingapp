import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  features?: string[];
}

/** Full-page Pro gate — drop in place of the real page content when !isPro */
export default function ProGate({ title, description, icon: Icon, iconColor = "text-amber-400", features = [] }: Props) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-5">
        <Icon size={28} className={iconColor} />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide mb-4">
        <Sparkles size={11} /> PRO FEATURE
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
      <p className="text-slate-400 leading-relaxed mb-8">{description}</p>

      {features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 text-left">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-sm text-slate-300">{f}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/pro"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
      >
        <Sparkles size={15} /> Unlock with Pro
      </Link>
      <p className="text-xs text-slate-600 mt-3">$15/mo · $150/yr · Cancel anytime</p>
    </div>
  );
}

/** Inline locked section — for Pro-only sections within a page */
export function ProLockSection({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-amber-500/20 bg-amber-500/3 overflow-hidden">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-40" aria-hidden>
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1628]/90 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Lock size={11} /> Pro — {label}
        </div>
        <Link
          href="/pro"
          className="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
        >
          Upgrade to unlock →
        </Link>
      </div>
    </div>
  );
}
