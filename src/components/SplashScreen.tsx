"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 800);
    const t2 = setTimeout(() => setVisible(false), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#060d1a] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="mb-5 animate-[splash-float_2s_ease-in-out_infinite]">
        <svg viewBox="0 0 512 512" width={80} height={80} className="rounded-[20px] drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]" style={{ boxShadow: "0 0 60px rgba(59,130,246,0.3)" }}>
          <rect width="512" height="512" rx="112" fill="#0c1a2e"/>
          <circle cx="256" cy="256" r="180" fill="#1e3a5f" opacity="0.5"/>
          <path d="M 200 120 C 200 120 310 120 310 200 C 310 270 255 290 255 330 C 255 370 285 390 310 380"
                fill="none" stroke="#60a5fa" strokeWidth="22" strokeLinecap="round"
                style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: "splash-draw 1.2s ease-out 0.2s forwards" }}/>
          <path d="M 310 380 C 335 370 340 350 320 345"
                fill="none" stroke="#60a5fa" strokeWidth="18" strokeLinecap="round"
                style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: "splash-draw 1.2s ease-out 0.2s forwards" }}/>
          <line x1="200" y1="80" x2="200" y2="120" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round"
                style={{ opacity: 0, animation: "splash-fade-in 0.4s ease-out 1s forwards" }}/>
          <circle cx="355" cy="165" r="8" fill="#38bdf8" opacity="0.6"/>
          <circle cx="375" cy="195" r="5" fill="#38bdf8" opacity="0.4"/>
          <circle cx="160" cy="200" r="6" fill="#38bdf8" opacity="0.4"/>
        </svg>
      </div>
      <div className="text-[28px] font-extrabold text-white tracking-tight"
           style={{ opacity: 0, animation: "splash-text-in 0.5s ease-out 0.6s forwards" }}>
        Hook<span className="text-blue-500">Line</span>
      </div>
      <div className="flex gap-1.5 mt-7">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-500"
            style={{ animation: `splash-dot 1.2s ease-in-out infinite ${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
