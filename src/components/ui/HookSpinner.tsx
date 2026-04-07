export default function HookSpinner({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg viewBox="0 0 512 512" width={size} height={size} className="animate-hook-spin">
        <rect width="512" height="512" rx="112" fill="#0c1a2e" />
        <circle cx="256" cy="256" r="180" fill="#1e3a5f" opacity="0.5" />
        <path
          d="M 200 120 C 200 120 310 120 310 200 C 310 270 255 290 255 330 C 255 370 285 390 310 380"
          fill="none" stroke="#60a5fa" strokeWidth="22" strokeLinecap="round"
        />
        <path
          d="M 310 380 C 335 370 340 350 320 345"
          fill="none" stroke="#60a5fa" strokeWidth="18" strokeLinecap="round"
        />
        <line x1="200" y1="80" x2="200" y2="120" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
        <circle cx="355" cy="165" r="8" fill="#38bdf8" opacity="0.6" />
        <circle cx="375" cy="195" r="5" fill="#38bdf8" opacity="0.4" />
        <circle cx="160" cy="200" r="6" fill="#38bdf8" opacity="0.4" />
      </svg>
    </div>
  );
}
