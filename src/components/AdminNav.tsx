"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Fish, Users, ShieldCheck, Flag, MessageSquare } from "lucide-react";

const NAV = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/spots",    label: "Spots",     icon: MapPin },
  { href: "/admin/catches",  label: "Catches",   icon: Fish },
  { href: "/admin/users",    label: "Users",     icon: Users },
  { href: "/admin/reports",  label: "Reports",   icon: Flag },
  { href: "/admin/contact",  label: "Contact",   icon: MessageSquare },
];

export default function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden border-b border-white/6 bg-[#050c18]">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <ShieldCheck size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-400">Admin</span>
          <span className="text-xs text-slate-600 ml-1">@{username}</span>
        </div>
        <div className="flex overflow-x-auto scrollbar-none px-3 pb-3 gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? "text-white bg-white/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon size={13} className={active ? "text-blue-400" : undefined} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-white/6 bg-[#050c18] flex-col py-6 px-3 gap-1">
        <div className="px-3 mb-4">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
            <ShieldCheck size={15} />
            Admin Panel
          </div>
          <p className="text-xs text-slate-600 mt-0.5">@{username}</p>
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "text-white bg-white/8"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon size={15} className={active ? "text-blue-400" : undefined} />
              {label}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
