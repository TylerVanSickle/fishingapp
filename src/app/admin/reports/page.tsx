import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Flag, CheckCircle, Trash2, ExternalLink, User, MapPin, Fish } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!(profile as unknown as { is_admin?: boolean } | null)?.is_admin) redirect("/");

  const [{ data: commentReports }, { data: contentReports }] = await Promise.all([
    supabase
      .from("comment_reports")
      .select(`id, reason, created_at, reviewed, catch_comments(id, content, catch_id, is_deleted, profiles!user_id(username)), profiles!comment_reports_reporter_id_fkey(username)`)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("content_reports")
      .select(`id, content_type, content_id, reason, reviewed, created_at, profiles!content_reports_reporter_id_fkey(username)`)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  type CommentReport = {
    id: string; reason: string | null; created_at: string; reviewed: boolean;
    catch_comments: { id: string; content: string; catch_id: string; is_deleted: boolean; profiles: { username: string } | null } | null;
    profiles: { username: string } | null;
  };
  type ContentReport = {
    id: string; content_type: "catch" | "spot" | "profile"; content_id: string;
    reason: string | null; reviewed: boolean; created_at: string;
    profiles: { username: string } | null;
  };

  const commentRows = (commentReports ?? []) as unknown as CommentReport[];
  const contentRows = (contentReports ?? []) as unknown as ContentReport[];

  const pendingComments = commentRows.filter((r) => !r.reviewed);
  const doneComments = commentRows.filter((r) => r.reviewed);
  const pendingContent = contentRows.filter((r) => !r.reviewed);
  const doneContent = contentRows.filter((r) => r.reviewed);

  const totalPending = pendingComments.length + pendingContent.length;

  async function markCommentReviewed(reportId: string) {
    "use server";
    const sb = await createClient();
    await sb.from("comment_reports").update({ reviewed: true }).eq("id", reportId);
    revalidatePath("/admin/reports");
  }

  async function deleteComment(commentId: string) {
    "use server";
    const sb = await createClient();
    await sb.from("catch_comments").update({ is_deleted: true }).eq("id", commentId);
    revalidatePath("/admin/reports");
  }

  async function markContentReviewed(reportId: string) {
    "use server";
    const sb = await createClient();
    await sb.from("content_reports").update({ reviewed: true }).eq("id", reportId);
    revalidatePath("/admin/reports");
  }

  async function deleteCatch(catchId: string, reportId: string) {
    "use server";
    const sb = await createClient();
    await sb.from("catches").delete().eq("id", catchId);
    await sb.from("content_reports").update({ reviewed: true }).eq("id", reportId);
    revalidatePath("/admin/reports");
  }

  function ContentReportRow({ r }: { r: ContentReport }) {
    const Icon = r.content_type === "catch" ? Fish : r.content_type === "spot" ? MapPin : User;
    const href = r.content_type === "catch" ? `/catches/${r.content_id}` :
                 r.content_type === "spot"  ? `/spots/${r.content_id}` :
                                              `/anglers/${r.content_id}`;
    return (
      <div className={`p-4 rounded-xl border ${r.reviewed ? "border-white/5 opacity-50" : "border-red-500/20 bg-red-500/4"}`}>
        <div className="flex items-start gap-3">
          <Flag size={14} className={r.reviewed ? "text-slate-600" : "text-red-400"} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 capitalize">
                <Icon size={10} /> {r.content_type}
              </span>
              <span className="text-xs text-slate-400">
                Reported by <span className="text-slate-300">@{r.profiles?.username ?? "?"}</span>
              </span>
              {r.reason && <span className="text-xs text-slate-500">· {r.reason}</span>}
              <span className="text-xs text-slate-700">
                {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            {!r.reviewed && (
              <div className="flex gap-2 flex-wrap">
                <Link
                  href={href}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs transition-colors"
                >
                  <ExternalLink size={11} /> View {r.content_type}
                </Link>
                <form action={markContentReviewed.bind(null, r.id)}>
                  <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/20 text-green-400 hover:bg-green-500/25 transition-colors text-xs font-medium">
                    <CheckCircle size={12} /> Dismiss
                  </button>
                </form>
                {r.content_type === "catch" && (
                  <form action={deleteCatch.bind(null, r.content_id, r.id)}>
                    <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-colors text-xs font-medium">
                      <Trash2 size={12} /> Delete catch
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function CommentReportRow({ r }: { r: CommentReport }) {
    const comment = r.catch_comments;
    return (
      <div className={`p-4 rounded-xl border ${r.reviewed ? "border-white/5 opacity-50" : "border-amber-500/20 bg-amber-500/4"}`}>
        <div className="flex items-start gap-3">
          <Flag size={14} className={r.reviewed ? "text-slate-600" : "text-amber-400"} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-slate-400">
                Reported by <span className="text-slate-300">@{r.profiles?.username ?? "?"}</span>
              </span>
              {r.reason && <span className="text-xs text-slate-600">· {r.reason}</span>}
              <span className="text-xs text-slate-700">
                {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            {comment ? (
              <div className="p-3 rounded-lg bg-white/4 border border-white/8 text-sm text-slate-300 mb-2">
                <p className="mb-1">&ldquo;{comment.content}&rdquo;</p>
                <p className="text-xs text-slate-600">
                  by @{comment.profiles?.username ?? "?"} ·{" "}
                  <Link href={`/catches/${comment.catch_id}`} className="text-blue-500 hover:text-blue-400 inline-flex items-center gap-1">
                    View catch <ExternalLink size={10} />
                  </Link>
                </p>
                {comment.is_deleted && <span className="text-xs text-red-400/70 mt-1 block">Already deleted</span>}
              </div>
            ) : (
              <p className="text-xs text-slate-600 mb-2 italic">Comment was deleted</p>
            )}
            {!r.reviewed && (
              <div className="flex gap-2">
                <form action={markCommentReviewed.bind(null, r.id)}>
                  <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/20 text-green-400 hover:bg-green-500/25 transition-colors text-xs font-medium">
                    <CheckCircle size={12} /> Dismiss
                  </button>
                </form>
                {comment && !comment.is_deleted && (
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-colors text-xs font-medium">
                      <Trash2 size={12} /> Delete comment
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Flag size={16} className="text-amber-400" />
        <h1 className="text-xl font-bold text-white">Reports & Moderation</h1>
        {totalPending > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold">
            {totalPending} pending
          </span>
        )}
      </div>

      {totalPending === 0 && doneComments.length === 0 && doneContent.length === 0 && (
        <p className="text-slate-600 text-sm py-8 text-center">No reports yet — the community is well-behaved!</p>
      )}

      {/* Pending content reports */}
      {pendingContent.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{pendingContent.length}</span>
            Flagged Content — Needs Review
          </h2>
          <div className="space-y-3">
            {pendingContent.map((r) => <ContentReportRow key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Pending comment reports */}
      {pendingComments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] flex items-center justify-center font-bold">{pendingComments.length}</span>
            Flagged Comments — Needs Review
          </h2>
          <div className="space-y-3">
            {pendingComments.map((r) => <CommentReportRow key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Reviewed */}
      {(doneContent.length > 0 || doneComments.length > 0) && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Reviewed</h2>
          <div className="space-y-2">
            {doneContent.map((r) => <ContentReportRow key={r.id} r={r} />)}
            {doneComments.map((r) => <CommentReportRow key={r.id} r={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
