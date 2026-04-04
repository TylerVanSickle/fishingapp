import Link from "next/link";
import { Sparkles, Lock, Check, ArrowRight, Star, Zap, TrendingUp, Fish } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  features?: string[];
  /** Optional teaser content rendered behind the gate (blurred) */
  preview?: React.ReactNode;
}

/** Full-page Pro gate — drop in place of the real page content when !isPro */
export default function ProGate({
  title,
  description,
  icon: Icon,
  iconColor = "text-amber-400",
  features = [],
  preview,
}: Props) {
  return (
    <div className="relative min-h-[70vh] flex flex-col">
      {/* Blurred background preview */}
      {preview && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="blur-xl opacity-20 scale-105 origin-top">
            {preview}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-[#0b1628]/30 via-[#0b1628]/80 to-[#0b1628]" />
        </div>
      )}

      {/* Gate content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full">
          {/* Top badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider">
              <Sparkles size={11} />
              PRO FEATURE
            </div>
          </div>

          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
              <Icon size={36} className={iconColor} />
            </div>
            <h1 className="text-3xl font-black text-white mb-3">{title}</h1>
            <p className="text-slate-400 leading-relaxed max-w-sm mx-auto">{description}</p>
          </div>

          {/* Feature list */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {features.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-white/6 bg-white/3"
                >
                  <div className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-green-400" />
                  </div>
                  <span className="text-sm text-slate-300">{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pricing callout */}
          <div className="flex items-stretch gap-3 mb-6">
            <div className="flex-1 p-4 rounded-2xl border border-white/8 bg-white/3 text-center">
              <div className="text-2xl font-black text-white">$15</div>
              <div className="text-xs text-slate-500 mt-0.5">per month</div>
              <div className="text-[10px] text-slate-600 mt-1">Cancel anytime</div>
            </div>
            <div className="flex items-center px-2 text-slate-700 text-sm font-medium">or</div>
            <div className="flex-1 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-400 text-[9px] font-bold tracking-wide">
                  SAVE 17%
                </span>
              </div>
              <div className="text-2xl font-black text-white">$150</div>
              <div className="text-xs text-amber-500/80 mt-0.5">per year</div>
              <div className="text-[10px] text-slate-600 mt-1">$12.50/mo billed annually</div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/pro"
            className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-base transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.45)]"
          >
            <Sparkles size={16} />
            Unlock Pro
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Star size={10} className="text-amber-500" /> 4.8 rating</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1"><Zap size={10} className="text-cyan-500" /> Instant access</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1"><Fish size={10} className="text-green-500" /> Catch more fish</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1"><TrendingUp size={10} className="text-violet-400" /> Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Inline locked section — for Pro-only sections within a page */
export function ProLockSection({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-amber-500/20 bg-linear-to-b from-amber-500/5 to-transparent overflow-hidden">
      {/* Blurred content preview */}
      <div className="blur-sm pointer-events-none select-none opacity-30" aria-hidden>
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 backdrop-blur-[1px]">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b1628]/95 border border-amber-500/30 shadow-lg">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Lock size={9} className="text-amber-400" />
          </div>
          <span className="text-amber-400 text-xs font-bold">{label}</span>
          <span className="text-slate-600 text-xs">· Pro only</span>
        </div>
        <Link
          href="/pro"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <Sparkles size={10} />
          Upgrade to unlock
          <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}
