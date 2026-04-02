"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, Bell, User, Plus } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const TABS_LEFT = [
  { href: "/map",     label: "Map",     icon: Map },
  { href: "/explore", label: "Explore", icon: Compass },
];
const TABS_RIGHT = [
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile",       label: "Profile", icon: User },
];

export default function MobileNav({
  user,
  unreadCount = 0,
}: {
  user: SupabaseUser | null;
  unreadCount?: number;
}) {
  const pathname = usePathname();

  if (!user) {
    // Minimal nav for logged-out
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#060d1a]/95 backdrop-blur-xl border-t border-white/8 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          <Link href="/map" className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${pathname === "/map" ? "text-blue-400" : "text-slate-500"}`}>
            <Map size={22} strokeWidth={pathname === "/map" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">Map</span>
          </Link>
          <Link href="/explore" className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${pathname === "/explore" ? "text-blue-400" : "text-slate-500"}`}>
            <Compass size={22} strokeWidth={pathname === "/explore" ? 2.5 : 1.75} />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-slate-500">
            <User size={22} strokeWidth={1.75} />
            <span className="text-[10px] font-medium">Sign in</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#060d1a]/95 backdrop-blur-xl border-t border-white/8 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Left tabs */}
        {TABS_LEFT.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${active ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        {/* Center FAB */}
        <Link href="/log-catch" className="flex flex-col items-center gap-0.5 -mt-5">
          <div className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-600/40 transition-colors border-4 border-[#060d1a]">
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-slate-500 mt-0.5">Log</span>
        </Link>

        {/* Alerts with badge */}
        <Link
          href="/notifications"
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${pathname === "/notifications" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
        >
          <Bell size={22} strokeWidth={pathname === "/notifications" ? 2.5 : 1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Alerts</span>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${pathname === "/profile" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
        >
          <User size={22} strokeWidth={pathname === "/profile" ? 2.5 : 1.75} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
