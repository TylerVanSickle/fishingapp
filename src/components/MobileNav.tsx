"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Map, Users, Bell, User, Plus, Grid3x3, X,
  Compass, Trophy, Fish, Waves, CloudSun,
  BookOpen, Package, Route, FileText, Star, MapPin, Sparkles, MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const MORE_SECTIONS = [
  {
    label: "Discover",
    items: [
      { href: "/explore",       label: "Explore",           icon: Compass },
      { href: "/spots",         label: "Spots",             icon: MapPin },
      { href: "/fish",          label: "Species Guide",     icon: Fish },
      { href: "/leaderboard",   label: "Leaderboard",       icon: Trophy },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/forecast",      label: "Fishing Forecast",  icon: CloudSun },
      { href: "/target",        label: "Species Targeting", icon: Star },
      { href: "/catches/map",   label: "Catch Map",         icon: Waves },
      { href: "/regulations",   label: "Regulations",       icon: FileText },
    ],
  },
  {
    label: "My Fishing",
    items: [
      { href: "/profile/logbook", label: "My Logbook",     icon: BookOpen },
      { href: "/trips",           label: "Trips",          icon: Route },
      { href: "/gear",            label: "Gear Tracker",   icon: Package, pro: true },
      { href: "/journal",         label: "Journal",        icon: BookOpen, pro: true },
    ],
  },
  {
    label: "Pro",
    items: [
      { href: "/pro/where-to-fish", label: "Where to Fish", icon: MapPin, pro: true },
    ],
  },
];

export default function MobileNav({
  user,
  unreadCount = 0,
  isPro = false,
}: {
  user: SupabaseUser | null;
  unreadCount?: number;
  isPro?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Close sheet on navigation
  useEffect(() => { setSheetOpen(false); }, [pathname]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  function navClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
      active ? "text-blue-400" : "text-slate-500"
    }`;
  }

  if (!user) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#060d1a]/95 backdrop-blur-xl border-t border-white/8 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          <Link href="/" className={navClass("/")}>
            <Fish size={22} strokeWidth={pathname === "/" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/pro" className={navClass("/pro")}>
            <Sparkles size={22} strokeWidth={pathname === "/pro" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium text-amber-400">Pro</span>
          </Link>
          <Link href="/login" className={navClass("/login")}>
            <User size={22} strokeWidth={pathname === "/login" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">Sign in</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#060d1a]/95 backdrop-blur-xl border-t border-white/8 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">

          {/* Map */}
          <Link href="/map" className={navClass("/map")}>
            <Map size={22} strokeWidth={pathname === "/map" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">Map</span>
          </Link>

          {/* Feed */}
          <Link href="/feed" className={navClass("/feed")}>
            <Users size={22} strokeWidth={pathname === "/feed" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">Feed</span>
          </Link>

          {/* Center FAB */}
          <Link href="/log-catch" className="flex flex-col items-center gap-0.5 -mt-5">
            <div className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-600/40 transition-colors border-4 border-[#060d1a]">
              <Plus size={26} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-0.5">Log</span>
          </Link>

          {/* Notifications */}
          <Link href="/notifications" className={`relative ${navClass("/notifications")}`}>
            <Bell size={22} strokeWidth={pathname === "/notifications" ? 2.5 : 1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="text-[10px] font-medium">Alerts</span>
          </Link>

          {/* More */}
          <button
            onClick={() => setSheetOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${sheetOpen ? "text-blue-400" : "text-slate-500"}`}
          >
            <Grid3x3 size={22} strokeWidth={sheetOpen ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">More</span>
          </button>

        </div>
      </nav>

      {/* Bottom sheet backdrop */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-60 md:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-70 md:hidden bg-[#0b1628] border-t border-white/10 rounded-t-3xl transition-transform duration-300 ${
          sheetOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sticky top-0 bg-[#0b1628] border-b border-white/6">
          <div className="w-10 h-1 rounded-full bg-white/15 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          <span className="text-sm font-semibold text-slate-300 pt-2">Menu</span>
          <button onClick={() => setSheetOpen(false)} className="text-slate-500 hover:text-slate-300 pt-2">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5 pb-safe" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
          {MORE_SECTIONS.map((section) => {
            // Hide pro-only section if not pro (show upgrade prompt instead)
            const visibleItems = section.items.filter((item) => !item.pro || isPro);
            const proItems = section.items.filter((item) => item.pro && !isPro);

            if (visibleItems.length === 0 && section.label === "Pro") {
              // Show upgrade CTA
              return (
                <div key={section.label}>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2 px-1">{section.label}</p>
                  <Link
                    href="/pro"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium"
                  >
                    <span className="text-lg">✦</span>
                    Upgrade to Pro
                  </Link>
                </div>
              );
            }

            return (
              <div key={section.label}>
                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2 px-1">{section.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {visibleItems.map(({ href, label, icon: Icon, pro }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                          active
                            ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                            : "bg-white/3 border-white/8 text-slate-300 hover:bg-white/6"
                        }`}
                      >
                        <Icon size={16} className={pro ? "text-amber-400" : undefined} />
                        <span className="text-sm font-medium leading-tight">{label}</span>
                      </Link>
                    );
                  })}
                  {/* Pro locked items */}
                  {proItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href="/pro"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/6 bg-white/2 text-slate-600 opacity-60"
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium leading-tight">{label}</span>
                      <span className="ml-auto text-[9px] text-amber-500/60">PRO</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Account */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2 px-1">Account</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/profile"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  pathname === "/profile"
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                    : "bg-white/3 border-white/8 text-slate-300"
                }`}
              >
                <User size={16} />
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <Link
                href="/profile/edit"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  pathname === "/profile/edit"
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                    : "bg-white/3 border-white/8 text-slate-300"
                }`}
              >
                <User size={16} />
                <span className="text-sm font-medium">Edit Profile</span>
              </Link>
              <Link
                href="/contact"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  pathname === "/contact"
                    ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                    : "bg-white/3 border-white/8 text-slate-300"
                }`}
              >
                <MessageSquare size={16} />
                <span className="text-sm font-medium">Contact</span>
              </Link>
              {isPro && (
                <Link
                  href="/pro/manage"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/8 text-amber-300 col-span-2"
                >
                  <Sparkles size={16} />
                  <span className="text-sm font-medium">Manage Pro</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
