import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, MapPin, Fish, Users, ShieldCheck, Flag } from "lucide-react";

const NAV = [
  { href: "/admin",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/spots",    label: "Spots",      icon: MapPin },
  { href: "/admin/catches",  label: "Catches",    icon: Fish },
  { href: "/admin/users",    label: "Users",      icon: Users },
  { href: "/admin/reports",  label: "Reports",    icon: Flag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles").select("is_admin, username").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/6 bg-[#050c18] flex flex-col py-6 px-3 gap-1">
        <div className="px-3 mb-4">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
            <ShieldCheck size={15} />
            Admin Panel
          </div>
          <p className="text-xs text-slate-600 mt-0.5">@{profile.username}</p>
        </div>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
