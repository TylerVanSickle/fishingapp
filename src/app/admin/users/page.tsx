import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, User } from "lucide-react";
import { toggleUserAdmin } from "@/lib/actions/admin";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: { user: me } } = await supabase.auth.getUser();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, bio, created_at, is_admin")
    .order("created_at", { ascending: false });

  // Get catch counts
  const { data: catchData } = await supabase
    .from("catches")
    .select("user_id");
  const catchMap: Record<string, number> = {};
  catchData?.forEach((c) => {
    catchMap[c.user_id] = (catchMap[c.user_id] ?? 0) + 1;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <span className="text-sm text-slate-500">{users?.length ?? 0} total</span>
      </div>

      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className={`flex items-center gap-4 p-4 rounded-xl border ${u.is_admin ? "border-violet-500/20 bg-violet-500/3" : "border-white/8 bg-white/2"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${u.is_admin ? "bg-violet-600/20 text-violet-400" : "bg-white/5 text-slate-500"}`}>
              {u.is_admin ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">{u.username}</span>
                {u.is_admin && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">admin</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                <span>Joined {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                <span>·</span>
                <span>{catchMap[u.id] ?? 0} catches</span>
              </div>
            </div>

            {u.id !== me?.id && (
              <form action={toggleUserAdmin.bind(null, u.id, !u.is_admin)}>
                <button
                  type="submit"
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    u.is_admin
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-violet-500/30"
                  }`}
                >
                  {u.is_admin ? "Remove Admin" : "Make Admin"}
                </button>
              </form>
            )}
            {u.id === me?.id && (
              <span className="text-xs text-slate-700">(you)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
