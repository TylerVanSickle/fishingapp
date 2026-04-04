import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, User, Search } from "lucide-react";
import { toggleUserAdmin } from "@/lib/actions/admin";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const supabase = await createClient();

  const { data: { user: me } } = await supabase.auth.getUser();

  let usersQuery = supabase
    .from("profiles")
    .select("id, username, bio, created_at, is_admin, is_pro")
    .order("created_at", { ascending: false });

  if (query) {
    usersQuery = usersQuery.ilike("username", `%${query}%`);
  }

  const { data: users } = await usersQuery.limit(100);

  const { data: catchData } = await supabase.from("catches").select("user_id");
  const catchMap: Record<string, number> = {};
  catchData?.forEach((c) => { catchMap[c.user_id] = (catchMap[c.user_id] ?? 0) + 1; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-500 text-xs mt-0.5">{users?.length ?? 0} {query ? "results" : "total"}</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/users" className="mb-5">
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
      {query && (
        <Link href="/admin/users" className="text-xs text-slate-500 hover:text-slate-300 mb-4 inline-block transition-colors">
          ← Clear search
        </Link>
      )}

      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className={`flex items-center gap-4 p-4 rounded-xl border ${u.is_admin ? "border-violet-500/20 bg-violet-500/3" : "border-white/8 bg-white/2"}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${u.is_admin ? "bg-violet-600/20 text-violet-400" : "bg-white/5 text-slate-500"}`}>
              {u.is_admin ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/anglers/${u.id}`} className="font-medium text-slate-200 hover:text-white transition-colors">
                  {u.username}
                </Link>
                {u.is_admin && <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">admin</span>}
                {(u as unknown as { is_pro?: boolean }).is_pro && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">pro</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                <span>Joined {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                <span>·</span>
                <span>{catchMap[u.id] ?? 0} catches</span>
              </div>
            </div>

            {u.id !== me?.id ? (
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
            ) : (
              <span className="text-xs text-slate-700">(you)</span>
            )}
          </div>
        ))}
        {users?.length === 0 && (
          <p className="text-center text-sm text-slate-600 py-12">No users found for &ldquo;{query}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
