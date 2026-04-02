import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: follows }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", id).single(),
    supabase
      .from("follows")
      .select("follower_id, profiles!follows_follower_id_fkey(id, username, avatar_url, bio)")
      .eq("following_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  // Get who the current user is following, for FollowButton state
  let currentUserFollowing: Set<string> = new Set();
  if (currentUser) {
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUser.id);
    currentUserFollowing = new Set(myFollows?.map((f) => f.following_id) ?? []);
  }

  type Follower = { id: string; username: string; avatar_url: string | null; bio: string | null };
  const followers: Follower[] = (follows ?? [])
    .map((f) => f.profiles as unknown as Follower | null)
    .filter(Boolean) as Follower[];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href={`/anglers/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> @{profile.username}
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Users size={16} className="text-slate-400" />
        <h1 className="text-lg font-bold text-white">
          Followers
          <span className="ml-2 text-slate-500 font-normal text-base">{followers.length}</span>
        </h1>
      </div>

      {followers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/8 text-slate-600">
          <Users size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No followers yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {followers.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/2 hover:border-white/12 transition-colors"
            >
              <Link href={`/anglers/${f.id}`}>
                <Avatar url={f.avatar_url} username={f.username} size={40} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/anglers/${f.id}`} className="font-medium text-slate-200 hover:text-white transition-colors block">
                  @{f.username}
                </Link>
                {f.bio && (
                  <p className="text-xs text-slate-600 truncate mt-0.5">{f.bio}</p>
                )}
              </div>
              {currentUser && currentUser.id !== f.id && (
                <FollowButton
                  targetUserId={f.id}
                  isFollowing={currentUserFollowing.has(f.id)}
                  compact
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
