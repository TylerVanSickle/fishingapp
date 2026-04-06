import { createClient } from "@/lib/supabase/server";
import { Users, MapPin, Fish, FileText, Clock, MessageSquare } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthISO = monthStart.toISOString();

  const [
    { count: userCount },
    { count: spotCount },
    { count: pendingCount },
    { count: catchCount },
    { count: monthCatches },
    { count: reportCount },
    { data: recentCatches },
    { data: recentReports },
    { data: contacts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("spots").select("*", { count: "exact", head: true }).eq("approved", true),
    supabase.from("spots").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("catches").select("*", { count: "exact", head: true }),
    supabase.from("catches").select("*", { count: "exact", head: true }).gte("caught_at", monthISO),
    supabase.from("fishing_reports").select("*", { count: "exact", head: true }),
    supabase.from("catches")
      .select("id, caught_at, fish_species(name), spots(name), profiles!user_id(username)")
      .order("caught_at", { ascending: false })
      .limit(8),
    supabase.from("fishing_reports")
      .select("id, body, activity_level, created_at, spots(name), profiles!user_id(username)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("contact_submissions")
      .select("id, name, email, category, message, read, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const stats = [
    { label: "Total Users",      value: userCount ?? 0,    icon: Users,    color: "text-blue-400 bg-blue-600/10 border-blue-600/15" },
    { label: "Approved Spots",   value: spotCount ?? 0,    icon: MapPin,   color: "text-cyan-400 bg-cyan-600/10 border-cyan-600/15" },
    { label: "Pending Review",   value: pendingCount ?? 0, icon: Clock,    color: pendingCount ? "text-amber-400 bg-amber-600/10 border-amber-500/25" : "text-slate-400 bg-white/5 border-white/8" },
    { label: "Total Catches",    value: catchCount ?? 0,   icon: Fish,     color: "text-green-400 bg-green-600/10 border-green-600/15" },
    { label: "Catches This Month", value: monthCatches ?? 0, icon: Fish,   color: "text-violet-400 bg-violet-600/10 border-violet-600/15" },
    { label: "Fishing Reports",  value: reportCount ?? 0,  icon: FileText, color: "text-orange-400 bg-orange-600/10 border-orange-600/15" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`p-5 rounded-2xl border ${color.split(" ").slice(2).join(" ")} bg-white/2`}>
            <div className={`w-9 h-9 rounded-xl ${color.split(" ").slice(1, 3).join(" ")} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color.split(" ")[0]} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent catches */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Recent Catches</h2>
          <div className="space-y-2">
            {recentCatches?.map((c) => {
              const fish = c.fish_species as unknown as { name: string } | null;
              const spot = c.spots as unknown as { name: string } | null;
              const profile = c.profiles as unknown as { username: string } | null;
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-white/6 bg-white/2 text-sm">
                  <div>
                    <span className="text-slate-200">{fish?.name ?? "?"}</span>
                    <span className="text-slate-600 mx-2">·</span>
                    <span className="text-slate-500">{spot?.name ?? "?"}</span>
                  </div>
                  <span className="text-xs text-slate-600">{profile?.username ?? "?"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent reports */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Recent Fishing Reports</h2>
          <div className="space-y-2">
            {recentReports?.map((r) => {
              const spot = r.spots as unknown as { name: string } | null;
              const profile = r.profiles as unknown as { username: string } | null;
              const LEVEL_COLORS: Record<string, string> = { slow: "text-slate-400", moderate: "text-yellow-400", good: "text-green-400", hot: "text-orange-400" };
              return (
                <div key={r.id} className="p-3 rounded-xl border border-white/6 bg-white/2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300">{spot?.name ?? "?"}</span>
                    <span className={`text-xs capitalize ${LEVEL_COLORS[r.activity_level] ?? "text-slate-400"}`}>{r.activity_level}</span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-1">{r.body}</p>
                  <p className="text-slate-700 text-xs mt-1">by {profile?.username ?? "?"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact submissions summary */}
      {(contacts?.length ?? 0) > 0 && (
        <div className="mt-8 p-4 rounded-2xl border border-blue-600/20 bg-blue-600/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare size={16} className="text-blue-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-blue-400">
                {(contacts as unknown as { read: boolean }[]).filter((c) => !c.read).length}
              </span>{" "}
              unread contact submission{(contacts as unknown as { read: boolean }[]).filter((c) => !c.read).length !== 1 ? "s" : ""}
            </span>
          </div>
          <a href="/admin/contact" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
            View all →
          </a>
        </div>
      )}
    </div>
  );
}
