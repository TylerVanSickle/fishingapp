import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Scale, Ruler, MapPin, Fish, Users, Lock, Sparkles, Zap } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import ClickablePhoto from "@/components/ClickablePhoto";
import ReportButton from "@/components/ReportButton";
import CatchReactions from "@/components/CatchReactions";
import FeedComments from "@/components/FeedComments";
import GuestFeedGate from "@/components/GuestFeedGate";
import Avatar from "@/components/Avatar";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showFollowing = filter === "following";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  // Solunar score for feed teaser (using a central US longitude as default)
  const feedSolunarScore = computeFishingScore(-98.5);
  const feedSolunarLabel = scoreLabel(feedSolunarScore);

  // Get follow relationships + blocked users
  let followingIds: string[] = [];
  let mutualFollowIds: Set<string> = new Set();
  let blockedIds: Set<string> = new Set();
  if (user) {
    const [{ data: following }, { data: followers }, { data: blocks }] = await Promise.all([
      supabase.from("follows").select("following_id").eq("follower_id", user.id),
      supabase.from("follows").select("follower_id").eq("following_id", user.id),
      supabase.from("user_blocks").select("blocked_id").eq("blocker_id", user.id),
    ]);
    followingIds = (following ?? []).map((f) => f.following_id);
    const followerIds = new Set((followers ?? []).map((f) => f.follower_id));
    mutualFollowIds = new Set(followingIds.filter((id) => followerIds.has(id)));
    blockedIds = new Set((blocks ?? []).map((b) => b.blocked_id));
  }

  let query = supabase
    .from("catches")
    .select(
      "id, caught_at, weight_lbs, length_in, notes, photo_url, user_id, is_private, visibility, fish_species(name), spots(id, name), baits(name), profiles!user_id(id, username)",
    )
    .order("caught_at", { ascending: false })
    .limit(60);

  if (showFollowing && followingIds.length > 0) {
    query = query.in("user_id", followingIds);
  } else if (showFollowing && followingIds.length === 0) {
    // No one followed — return empty
    query = query.eq("user_id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: rawCatches } = await query;

  // Filter by visibility + blocked users
  const catches = (rawCatches ?? [])
    .filter((c) => {
      // Hide blocked users
      if (blockedIds.has(c.user_id)) return false;
      const vis = (c as Record<string, unknown>).visibility as string | undefined;
      const isPrivate = (c as Record<string, unknown>).is_private;
      // Own catches: always show
      if (c.user_id === user?.id) return true;
      // Derive effective visibility (fallback to is_private for old rows)
      const effective = vis ?? (isPrivate ? "private" : "public");
      if (effective === "public") return true;
      if (effective === "friends") return mutualFollowIds.has(c.user_id);
      return false; // private
    })
    .slice(0, 40);

  // Guest gate — limit to 4 posts for logged-out users
  const visibleCatches = user ? catches : catches.slice(0, 4);

  // Bulk-fetch reactions for all visible catches
  const catchIds = visibleCatches.map((c) => c.id);
  const { data: allReactions } = catchIds.length > 0
    ? await supabase.from("catch_reactions").select("catch_id, emoji, user_id").in("catch_id", catchIds)
    : { data: [] };

  // Bulk-fetch comments for all visible catches
  const { data: allComments } = catchIds.length > 0
    ? await supabase
        .from("catch_comments")
        .select("id, catch_id, content, created_at, profiles!user_id(id, username)")
        .in("catch_id", catchIds)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(300)
    : { data: [] };

  type FeedComment = { id: string; catch_id: string; content: string; created_at: string; profiles: { id: string; username: string } | null };
  const commentsByCatch = new Map<string, FeedComment[]>();
  (allComments ?? []).forEach((c) => {
    const arr = commentsByCatch.get((c as unknown as FeedComment).catch_id) ?? [];
    arr.push(c as unknown as FeedComment);
    commentsByCatch.set((c as unknown as FeedComment).catch_id, arr);
  });

  // Build per-catch reaction maps
  const reactionsByCatch = new Map<string, { emoji: string; count: number; reacted: boolean }[]>();
  const userReactionByCatch = new Map<string, string | null>();
  const EMOJIS = ["🎣", "💪", "🏆", "🔥", "❄️"];
  catchIds.forEach((id) => {
    const rows = (allReactions ?? []).filter((r) => r.catch_id === id);
    const counts = new Map<string, number>();
    rows.forEach((r) => counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1));
    reactionsByCatch.set(id, EMOJIS.map((e) => ({ emoji: e, count: counts.get(e) ?? 0, reacted: rows.some((r) => r.emoji === e && r.user_id === user?.id) })));
    userReactionByCatch.set(id, rows.find((r) => r.user_id === user?.id)?.emoji ?? null);
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Conditions banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/8 bg-white/2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
          <Zap size={14} className="text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">Conditions right now</p>
          <p className="text-sm font-semibold" style={{ color: feedSolunarLabel.color }}>
            {feedSolunarLabel.label} — solunar {feedSolunarScore}/10
          </p>
        </div>
        <Link href="/forecast" className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0">
          Full forecast →
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        <Link
          href="/feed"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !showFollowing
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/8"
          }`}
        >
          Everyone
        </Link>
        {user && (
          <Link
            href="/feed?filter=following"
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              showFollowing
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-slate-400 hover:text-slate-200 border border-white/8"
            }`}
          >
            <Users size={13} /> Following
          </Link>
        )}
      </div>

      {showFollowing && followingIds.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-slate-600" />
          </div>
          <p className="text-base font-medium text-slate-400 mb-1">No one followed yet</p>
          <p className="text-sm text-slate-600 mb-4">Follow other anglers to see their catches here.</p>
          <Link href="/explore" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
            Discover anglers →
          </Link>
        </div>
      ) : !catches || catches.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
            <Fish size={28} className="text-slate-600" />
          </div>
          <p className="text-base font-medium text-slate-400 mb-1">No catches yet</p>
          <p className="text-sm text-slate-600 mb-4">Be the first to log a catch and show up in the feed.</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Link href="/log-catch" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
              Log a catch
            </Link>
            <Link href="/map" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Find a spot
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleCatches.map((c, catchIndex) => {
            const showProTeaser = !isPro && catchIndex === 5;
            const fish = c.fish_species as unknown as { name: string } | null;
            const spot = c.spots as unknown as {
              id: string;
              name: string;
            } | null;
            const bait = c.baits as unknown as { name: string } | null;
            const profile = c.profiles as unknown as {
              id: string;
              username: string;
            } | null;

            return (
              <div key={c.id + "-wrap"}>
                {showProTeaser && (
                  <div
                    key="pro-teaser"
                    className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                        <Sparkles size={16} className="text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white mb-0.5">
                          Fishing conditions today:{" "}
                          <span style={{ color: feedSolunarLabel.color }}>
                            {feedSolunarLabel.label}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          HookLine Pro shows you the best spots to fish right
                          now — ranked by solunar timing, community activity,
                          and your technique.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ background: feedSolunarLabel.color }}
                            />
                            Solunar score:{" "}
                            <strong className="text-white ml-0.5">
                              {feedSolunarScore}/10
                            </strong>
                          </div>
                        </div>
                        <Link
                          href="/pro"
                          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                        >
                          <Sparkles size={11} /> See where to fish today
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
                  {/* Photo */}
                  {c.photo_url && (
                    <ClickablePhoto
                      src={c.photo_url}
                      alt={fish?.name ?? "Catch photo"}
                      className="w-full h-72 object-contain bg-black/40"
                      thumbClassName="w-full"
                    />
                  )}

                  <div className="p-4 flex flex-col gap-3">
                    {/* Top row: avatar + name + time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {profile && (
                          <Link href={`/anglers/${profile.id}`}>
                            <Avatar url={null} username={profile.username} size={30} />
                          </Link>
                        )}
                        <div>
                          {profile ? (
                            <Link href={`/anglers/${profile.id}`} className="text-sm font-semibold text-slate-200 hover:text-blue-300 transition-colors">
                              @{profile.username}
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-600">@angler</span>
                          )}
                          <p className="text-[10px] text-slate-600">{timeAgo(c.caught_at)}</p>
                        </div>
                        {user && profile && profile.id !== user.id && (
                          <FollowButton targetUserId={profile.id} isFollowing={followingIds.includes(profile.id)} compact />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const vis = (c as Record<string, unknown>).visibility as string | undefined;
                          const effective = vis ?? (c.is_private ? "private" : "public");
                          if (effective === "private") return <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/70"><Lock size={9} /> Private</span>;
                          if (effective === "friends") return <span className="inline-flex items-center gap-1 text-[10px] text-green-500/70"><Users size={9} /> Friends</span>;
                          return null;
                        })()}
                        {user && c.user_id !== user.id && <ReportButton contentType="catch" contentId={c.id} />}
                      </div>
                    </div>

                    {/* Species + metrics */}
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/catches/${c.id}`} className="font-bold text-white hover:text-blue-300 transition-colors text-lg leading-tight">
                        {fish?.name ?? "Unknown Species"}
                      </Link>
                      <div className="flex items-center gap-3 shrink-0">
                        {c.weight_lbs != null && (
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-300">
                            <Scale size={12} className="text-slate-500" />{c.weight_lbs} lbs
                          </span>
                        )}
                        {c.length_in != null && (
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-300">
                            <Ruler size={12} className="text-slate-500" />{c.length_in}&quot;
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spot + bait */}
                    {(spot || bait) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {spot && (
                          <Link href={`/spots/${spot.id}`} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            <MapPin size={10} />{spot.name}
                          </Link>
                        )}
                        {bait && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">
                            {bait.name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {c.notes && (
                      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{c.notes}</p>
                    )}

                    {/* Reactions */}
                    <CatchReactions
                      catchId={c.id}
                      reactions={reactionsByCatch.get(c.id) ?? EMOJIS.map((e) => ({ emoji: e, count: 0, reacted: false }))}
                      currentUserReaction={userReactionByCatch.get(c.id) ?? null}
                      isLoggedIn={!!user}
                    />

                    {/* Comments */}
                    <FeedComments
                      catchId={c.id}
                      initialComments={commentsByCatch.get(c.id) ?? []}
                      isLoggedIn={!!user}
                      currentUserId={user?.id}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {!user && catches.length > 4 && <GuestFeedGate />}
        </div>
      )}
    </div>
  );
}
