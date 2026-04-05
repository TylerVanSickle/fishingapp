import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { ToastProvider } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "HookLine | Find Your Next Fishing Spot",
  description: "Discover fishing spots across the US, log your catches, and share what's working.",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
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
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <MobileNav user={user} unreadCount={unreadCount} isPro={isPro} />
        </ToastProvider>
      </body>
    </html>
  );
}
