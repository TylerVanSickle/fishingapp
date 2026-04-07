"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [phase, setPhase] = useState<"draw" | "show" | "fade" | "gone">("draw");

  useEffect(() => {
    // draw hook: 0-1.2s, hold: 1.2-2s, fade: 2-2.5s, remove
    const t1 = setTimeout(() => setPhase("show"), 1200);
    const t2 = setTimeout(() => setPhase("fade"), 2000);
    const t3 = setTimeout(() => setPhase("gone"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#060d1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      {/* Hook icon */}
      <div style={{
        marginBottom: 20,
        animation: "splash-float 2s ease-in-out infinite",
      }}>
        <svg
          viewBox="0 0 512 512"
          width={80}
          height={80}
          style={{
            borderRadius: 20,
            boxShadow: "0 0 60px rgba(59,130,246,0.3), 0 0 120px rgba(59,130,246,0.1)",
            filter: "drop-shadow(0 0 20px rgba(96,165,250,0.4))",
          }}
        >
          <rect width="512" height="512" rx="112" fill="#0c1a2e"/>
          <circle cx="256" cy="256" r="180" fill="#1e3a5f" opacity="0.5"/>
          {/* Hook body — draws in */}
          <path
            d="M 200 120 C 200 120 310 120 310 200 C 310 270 255 290 255 330 C 255 370 285 390 310 380"
            fill="none" stroke="#60a5fa" strokeWidth="22" strokeLinecap="round"
            style={{ strokeDasharray: 500, strokeDashoffset: 500, animation: "splash-draw 1s ease-out 0.1s forwards" }}
          />
          {/* Hook barb — draws in */}
          <path
            d="M 310 380 C 335 370 340 350 320 345"
            fill="none" stroke="#60a5fa" strokeWidth="18" strokeLinecap="round"
            style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: "splash-draw 0.4s ease-out 0.9s forwards" }}
          />
          {/* Fishing line */}
          <line
            x1="200" y1="80" x2="200" y2="120"
            stroke="#93c5fd" strokeWidth="8" strokeLinecap="round"
            style={{ opacity: 0, animation: "splash-fade-in 0.3s ease-out 0.8s forwards" }}
          />
          {/* Sparkles */}
          <circle cx="355" cy="165" r="8" fill="#38bdf8" style={{ opacity: 0, animation: "splash-fade-in 0.3s ease-out 1.1s forwards" }}/>
          <circle cx="375" cy="195" r="5" fill="#38bdf8" style={{ opacity: 0, animation: "splash-fade-in 0.3s ease-out 1.2s forwards" }}/>
          <circle cx="160" cy="200" r="6" fill="#38bdf8" style={{ opacity: 0, animation: "splash-fade-in 0.3s ease-out 1.3s forwards" }}/>
        </svg>
      </div>

      {/* Title — fades up after hook draws */}
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: "white",
        letterSpacing: "-0.025em",
        opacity: 0,
        animation: "splash-text-in 0.5s ease-out 0.8s forwards",
      }}>
        Hook<span style={{ color: "#3b82f6" }}>Line</span>
      </div>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 28 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#3b82f6",
              animation: `splash-dot 1.2s ease-in-out infinite ${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
