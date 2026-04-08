import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, User, Search, Ban, Clock, AlertTriangle, Trash2 } from "lucide-react";
import {
  toggleUserAdmin, banUser, unbanUser,
  suspendUser, unsuspendUser, warnUser, deleteUserContent,
} from "@/lib/actions/admin";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q = "", filter = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  const { data: { user: me } } = await supabase.auth.getUser();

  let usersQuery = supabase
    .from("profiles")
    .select("id, username, bio, created_at, is_admin, is_pro, is_banned, is_suspended, suspended_until, ban_reason, warn_count")
    .order("created_at", { ascending: false });

  if (query) usersQuery = usersQuery.ilike("username", `%${query}%`);
  if (filter === "banned") usersQuery = usersQuery.eq("is_banned", true);
  if (filter === "suspended") usersQuery = usersQuery.eq("is_suspended", true);
  if (filter === "warned") usersQuery = usersQuery.gt("warn_count", 0);

  const { data: users } = await usersQuery.limit(100);

  const { data: catchData } = await supabase.from("catches").select("user_id");
  const catchMap: Record<string, number> = {};
  catchData?.forEach((c) => { catchMap[c.user_id] = (catchMap[c.user_id] ?? 0) + 1; });

  // Recent admin actions
  const { data: recentActions } = await supabase
    .from("admin_actions")
    .select("id, action, reason, created_at, target_user_id, profiles!admin_actions_admin_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(10);

  type UserRow = {
    id: string; username: string; bio: string | null; created_at: string;
    is_admin: boolean; is_pro: boolean; is_banned: boolean; is_suspended: boolean;
    suspended_until: string | null; ban_reason: string | null; warn_count: number;
  };

  const typedUsers = (users ?? []) as unknown as UserRow[];

  const filters = [
    { value: "", label: "All" },
    { value: "banned", label: "Banned" },
    { value: "suspended", label: "Suspended" },
    { value: "warned", label: "Warned" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-500 text-xs mt-0.5">{typedUsers.length} {query ? "results" : "total"}</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/users" className="mb-4">
        <input type="hidden" name="filter" value={filter} />
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1a2e] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          />
        </div>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/admin/users?filter=${f.value}${query ? `&q=${query}` : ""}`}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/8"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {query && (
        <Link href={`/admin/users?filter=${filter}`} className="text-xs text-slate-500 hover:text-slate-300 mb-4 inline-block transition-colors">
          ← Clear search
        </Link>
      )}

      <div className="space-y-2">
        {typedUsers.map((u) => {
          const isSuspendedNow = u.is_suspended && u.suspended_until && new Date(u.suspended_until) > new Date();
          const statusColor = u.is_banned
            ? "border-red-500/25 bg-red-500/3"
            : isSuspendedNow
              ? "border-orange-500/25 bg-orange-500/3"
              : u.is_admin
                ? "border-violet-500/20 bg-violet-500/3"
                : "border-white/8 bg-white/2";

          return (
            <div key={u.id} className={`p-4 rounded-xl border ${statusColor}`}>
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  u.is_banned ? "bg-red-600/20 text-red-400" :
                  isSuspendedNow ? "bg-orange-600/20 text-orange-400" :
                  u.is_admin ? "bg-violet-600/20 text-violet-400" : "bg-white/5 text-slate-500"
                }`}>
                  {u.is_banned ? <Ban size={16} /> : isSuspendedNow ? <Clock size={16} /> : u.is_admin ? <ShieldCheck size={16} /> : <User size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/anglers/${u.id}`} className="font-medium text-slate-200 hover:text-white transition-colors">
                      {u.username}
                    </Link>
                    {u.is_admin && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">admin</span>}
                    {u.is_pro && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">pro</span>}
                    {u.is_banned && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">banned</span>}
                    {isSuspendedNow && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                        suspended until {new Date(u.suspended_until!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    {u.warn_count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                        {u.warn_count} warning{u.warn_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                    <span>Joined {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    <span>·</span>
                    <span>{catchMap[u.id] ?? 0} catches</span>
                  </div>
                  {u.ban_reason && (u.is_banned || isSuspendedNow) && (
                    <p className="text-xs text-red-400/70 mt-1">Reason: {u.ban_reason}</p>
                  )}
                </div>
              </div>

              {/* Admin actions */}
              {u.id !== me?.id && (
                <div className="flex gap-2 mt-3 ml-13 flex-wrap">
                  {/* Admin toggle */}
                  <form action={toggleUserAdmin.bind(null, u.id, !u.is_admin)}>
                    <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      u.is_admin
                        ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}>
                      {u.is_admin ? "Remove Admin" : "Make Admin"}
                    </button>
                  </form>

                  {/* Ban / Unban */}
                  {u.is_banned ? (
                    <form action={unbanUser.bind(null, u.id)}>
                      <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors">
                        Unban
                      </button>
                    </form>
                  ) : (
                    <form action={banUser.bind(null, u.id, "Violated community guidelines")}>
                      <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1">
                        <Ban size={11} /> Ban
                      </button>
                    </form>
                  )}

                  {/* Suspend / Unsuspend */}
                  {isSuspendedNow ? (
                    <form action={unsuspendUser.bind(null, u.id)}>
                      <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors">
                        Unsuspend
                      </button>
                    </form>
                  ) : !u.is_banned && (
                    <div className="flex gap-1">
                      <form action={suspendUser.bind(null, u.id, 1, "Warning")}>
                        <button type="submit" className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors flex items-center gap-1">
                          <Clock size={11} /> 1d
                        </button>
                      </form>
                      <form action={suspendUser.bind(null, u.id, 7, "Repeated violations")}>
                        <button type="submit" className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors">
                          7d
                        </button>
                      </form>
                      <form action={suspendUser.bind(null, u.id, 30, "Serious violation")}>
                        <button type="submit" className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors">
                          30d
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Warn */}
                  <form action={warnUser.bind(null, u.id, "Community guideline reminder")}>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center gap-1">
                      <AlertTriangle size={11} /> Warn
                    </button>
                  </form>

                  {/* Delete all content */}
                  <form action={deleteUserContent.bind(null, u.id)}>
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1">
                      <Trash2 size={11} /> Delete content
                    </button>
                  </form>
                </div>
              )}
              {u.id === me?.id && <span className="text-xs text-slate-700 mt-2 block ml-13">(you)</span>}
            </div>
          );
        })}
        {typedUsers.length === 0 && (
          <p className="text-center text-sm text-slate-600 py-12">No users found{query ? ` for "${query}"` : ""}.</p>
        )}
      </div>

      {/* Recent admin actions log */}
      {recentActions && recentActions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Recent Admin Actions</h2>
          <div className="space-y-2">
            {recentActions.map((a) => {
              const action = a as unknown as { id: string; action: string; reason: string | null; created_at: string; target_user_id: string; profiles: { username: string } | null };
              return (
                <div key={action.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-white/2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    action.action === "ban" ? "bg-red-500/15 text-red-400" :
                    action.action === "suspend" ? "bg-orange-500/15 text-orange-400" :
                    action.action === "warn" ? "bg-yellow-500/15 text-yellow-400" :
                    action.action === "unban" || action.action === "unsuspend" ? "bg-green-500/15 text-green-400" :
                    "bg-white/10 text-slate-400"
                  }`}>
                    {action.action}
                  </span>
                  <span className="text-slate-500">by @{action.profiles?.username ?? "?"}</span>
                  {action.reason && <span className="text-slate-600 truncate max-w-48">— {action.reason}</span>}
                  <span className="text-slate-700 ml-auto shrink-0">
                    {new Date(action.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
