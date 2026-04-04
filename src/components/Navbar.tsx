import Link from "next/link";
import { Fish } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarActions from "./NavbarActions";
import GlobalSearch from "./GlobalSearch";
import NavMore from "./NavMore";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let isPro = false;
  let unreadCount = 0;
  if (user) {
    const [{ data: profile }, { count }] = await Promise.all([
      supabase.from("profiles").select("is_admin, is_pro").eq("id", user.id).single(),
      supabase.from("notifications").select("*", { count: "exact", head: true })
        .eq("user_id", user.id).eq("read", false),
    ]);
    const p = profile as unknown as { is_admin?: boolean; is_pro?: boolean } | null;
    isAdmin = !!p?.is_admin;
    isPro = !!p?.is_pro;
    unreadCount = count ?? 0;
  }

  // Primary links — always visible
  const primaryLinks = user ? [
    { href: "/map",         label: "Map" },
    { href: "/explore",     label: "Explore" },
    { href: "/feed",        label: "Feed" },
    { href: "/spots",       label: "Spots" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/log-catch",   label: "Log Catch" },
  ] : [];

  // Secondary links — in "More" dropdown
  const moreLinks = user ? [
    { href: "/catches/map",       label: "Catch Map" },
    { href: "/fish",              label: "Species" },
    { href: "/target",            label: "Species Targeting" },
    { href: "/forecast",          label: "Fishing Forecast" },
    { href: "/profile/logbook",   label: "My Logbook" },
    { href: "/journal",           label: "✦ Fishing Journal" },
    { href: "/gear",              label: "✦ Gear Tracker" },
    { href: "/trips",             label: "Trips" },
    { href: "/regulations",       label: "Regulations" },
  ] : [];

  return (
    <nav className="h-16 border-b border-white/6 bg-[#060d1a]/80 backdrop-blur-xl hidden md:flex items-center px-4 md:px-8 gap-6 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
          <Fish className="text-blue-400" size={16} />
        </div>
        Hook<span className="text-blue-400">Line</span>
      </Link>

      <div className="flex items-center gap-0.5 ml-2 flex-1 overflow-x-auto scrollbar-none">
        {primaryLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            {label}
          </Link>
        ))}

        {user && <NavMore links={moreLinks} />}

        {isPro ? (
          <Link
            href="/pro/where-to-fish"
            className="px-3 py-1.5 rounded-lg text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors whitespace-nowrap flex items-center gap-1"
          >
            ✦ Where to Fish
          </Link>
        ) : (
          <Link
            href="/pro"
            className="px-3 py-1.5 rounded-lg text-sm text-amber-500/70 hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            ✦ Pro
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors whitespace-nowrap"
          >
            Admin
          </Link>
        )}
      </div>

      <GlobalSearch />
      <NavbarActions user={user} unreadCount={unreadCount} />
    </nav>
  );
}
