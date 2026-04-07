import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import TopLoader from "@/components/TopLoader";
import { ToastProvider } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/server";
import { Analytics } from "@vercel/analytics/next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hooklineapp.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "HookLine — Find Your Next Fishing Spot",
    template: "%s — HookLine",
  },
  description: "Discover fishing spots across all 50 states, log your catches, track personal bests, and connect with thousands of anglers. Free forever.",
  keywords: ["fishing app", "fishing spots", "catch log", "fishing community", "solunar forecast", "fishing map"],
  authors: [{ name: "HookLine" }],
  creator: "HookLine",
  openGraph: {
    type: "website",
    siteName: "HookLine",
    title: "HookLine — Find Your Next Fishing Spot",
    description: "Discover fishing spots across all 50 states, log your catches, and connect with thousands of anglers.",
    url: APP_URL,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "HookLine — The National Fishing Community App" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HookLine — Find Your Next Fishing Spot",
    description: "Discover fishing spots, log catches, and connect with anglers across all 50 states.",
    images: ["/og-default.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HookLine",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let unreadCount = 0;
  let isPro = false;
  if (user) {
    const [{ count }, { data: profile }] = await Promise.all([
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      supabase.from("profiles").select("is_pro").eq("id", user.id).single(),
    ]);
    unreadCount = count ?? 0;
    isPro = !!(profile as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* PWA splash screen — dismissed by script below */}
        <div id="pwa-splash">
          <div className="splash-hook">
            <svg viewBox="0 0 512 512" width="80" height="80">
              <rect width="512" height="512" rx="112" fill="#0c1a2e"/>
              <circle cx="256" cy="256" r="180" fill="#1e3a5f" opacity="0.5"/>
              <path d="M 200 120 C 200 120 310 120 310 200 C 310 270 255 290 255 330 C 255 370 285 390 310 380"
                    fill="none" stroke="#60a5fa" strokeWidth="22" strokeLinecap="round" className="splash-hook-path"/>
              <path d="M 310 380 C 335 370 340 350 320 345"
                    fill="none" stroke="#60a5fa" strokeWidth="18" strokeLinecap="round" className="splash-hook-path"/>
              <line x1="200" y1="80" x2="200" y2="120" stroke="#93c5fd" strokeWidth="8" strokeLinecap="round" opacity="0.7" className="splash-line"/>
              <circle cx="355" cy="165" r="8" fill="#38bdf8" opacity="0.6"/>
              <circle cx="375" cy="195" r="5" fill="#38bdf8" opacity="0.4"/>
              <circle cx="160" cy="200" r="6" fill="#38bdf8" opacity="0.4"/>
            </svg>
          </div>
          <div className="logo-text">Hook<span>Line</span></div>
          <div className="splash-dots"><div /><div /><div /></div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            var s = document.getElementById('pwa-splash');
            if (s) {
              setTimeout(function() { s.classList.add('hide'); }, 600);
              setTimeout(function() { s.remove(); }, 1100);
            }
          });
        `}} />
        <ToastProvider>
          <TopLoader />
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <MobileNav user={user} unreadCount={unreadCount} isPro={isPro} />
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
