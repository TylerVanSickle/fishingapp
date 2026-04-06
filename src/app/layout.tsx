import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import ServiceWorkerInit from "@/components/ServiceWorkerInit";
import { ToastProvider } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/server";

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
        <ToastProvider>
          <ServiceWorkerInit />
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <MobileNav user={user} unreadCount={unreadCount} isPro={isPro} />
        </ToastProvider>
      </body>
    </html>
  );
}
