import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HookLine — The National Fishing Community App";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060d1a 0%, #0f2040 50%, #060d1a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Glow */}
        <div style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        {/* Logo mark */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: 22,
          background: "rgba(37,99,235,0.2)",
          border: "2px solid rgba(96,165,250,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          fontSize: 52,
        }}>
          🎣
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 0, marginBottom: 20 }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: "#ffffff", letterSpacing: -2 }}>Hook</span>
          <span style={{ fontSize: 72, fontWeight: 900, color: "#60a5fa", letterSpacing: -2 }}>Line</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 26, color: "#94a3b8", fontWeight: 400, letterSpacing: 0.5 }}>
          Find your next great catch.
        </div>

        {/* Stats strip */}
        <div style={{
          display: "flex",
          gap: 48,
          marginTop: 52,
          paddingTop: 36,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          {[
            { label: "Fishing Spots", value: "10,000+" },
            { label: "States Covered", value: "All 50" },
            { label: "Always Free", value: "✓" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#ffffff" }}>{value}</span>
              <span style={{ fontSize: 16, color: "#64748b" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
