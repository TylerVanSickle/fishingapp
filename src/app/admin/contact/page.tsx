import { createClient } from "@/lib/supabase/server";
import { MessageSquare, CheckCheck } from "lucide-react";
import { markContactRead, markAllContactRead } from "@/lib/actions/admin";

type Submission = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  read: boolean;
  created_at: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  billing: "text-amber-400 border-amber-500/25 bg-amber-600/10",
  bug:     "text-red-400 border-red-500/25 bg-red-600/10",
  feature: "text-violet-400 border-violet-500/25 bg-violet-600/10",
  account: "text-blue-400 border-blue-500/25 bg-blue-600/10",
  other:   "text-slate-400 border-white/10 bg-white/5",
};

export default async function AdminContactPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("contact_submissions")
    .select("id, name, email, category, message, read, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const submissions = (data ?? []) as Submission[];
  const unreadCount = submissions.filter((s) => !s.read).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/25">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <form action={markAllContactRead}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          </form>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
            <MessageSquare size={20} className="text-slate-600" />
          </div>
          <p className="text-slate-500 text-sm">No contact submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const catColor = CATEGORY_COLORS[sub.category] ?? CATEGORY_COLORS.other;
            return (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border transition-colors ${
                  sub.read ? "border-white/6 bg-white/2" : "border-blue-600/20 bg-blue-600/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {!sub.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <span className="text-slate-200 font-semibold text-sm">{sub.name}</span>
                      <span className="text-slate-600 text-xs ml-2">{sub.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className={`text-xs capitalize px-2.5 py-1 rounded-full border font-medium ${catColor}`}>
                      {sub.category}
                    </span>
                    <span className="text-xs text-slate-600">
                      {new Date(sub.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "numeric", minute: "2-digit",
                      })}
                    </span>
                    {!sub.read && (
                      <form action={markContactRead.bind(null, sub.id)}>
                        <button
                          type="submit"
                          className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Mark read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{sub.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
