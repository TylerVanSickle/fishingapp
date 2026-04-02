import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  TrendingUp,
  Scale,
  Ruler,
  MapPin,
  Fish,
  Users,
  Lock,
  Sparkles,
} from "lucide-react";
import FollowButton from "@/components/FollowButton";
import ClickablePhoto from "@/components/ClickablePhoto";
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

  // Get IDs of people the current user follows
  let followingIds: string[] = [];
  if (user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    followingIds = (follows ?? []).map((f) => f.following_id);
  }

  let query = supabase
    .from("catches")
    .select(
      "id, caught_at, weight_lbs, length_in, notes, photo_url, user_id, is_private, fish_species(name), spots(id, name), baits(name), profiles!user_id(id, username)",
    )
    .order("caught_at", { ascending: false })
    .limit(60);

  if (showFollowing && followingIds.length > 0) {
    query = query.in("user_id", followingIds);
  } else if (showFollowing && followingIds.length === 0) {
    // No one followed — return empty
    query = query.eq("user_id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: rawCatches, error: catchError } = await query;

  // eslint-disable-next-line no-console
  if (catchError)
    console.error("[feed] catches query error:", catchError.message);

  // Filter private catches in JS — also handles case where is_private column doesn't exist yet
  const catches = (rawCatches ?? [])
    .filter((c) => {
      const isPrivate = (c as Record<string, unknown>).is_private;
      return !isPrivate || c.user_id === user?.id;
    })
    .slice(0, 40);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <TrendingUp className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">
            Activity Feed
          </h1>
          <p className="text-slate-500 text-xs">
            Recent catches from the community
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
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
        <div className="text-center py-16 text-slate-600">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-1">You&apos;re not following anyone yet.</p>
          <p className="text-xs text-slate-700">
            Visit an angler&apos;s profile and hit Follow to see their catches
            here.
          </p>
        </div>
      ) : !catches || catches.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Fish size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No catches logged yet. Be the first!</p>
          {catchError && (
            <p className="text-xs text-red-400 mt-2 font-mono bg-red-500/10 px-3 py-2 rounded-lg">
              Query error: {catchError.message}
            </p>
          )}
          {/* {!catchError && rawCatches !== null && (
            <p className="text-xs text-slate-700 mt-1">
              (DB returned {rawCatches.length} rows, {catches.length} after filter)
            </p>
          )} */}
          <Link
            href="/log-catch"
            className="text-blue-500 hover:text-blue-400 text-sm mt-2 inline-block"
          >
            Log a catch →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {catches.map((c, catchIndex) => {
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
                <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden group relative">
                  {/* Photo */}
                  {c.photo_url && (
                    <ClickablePhoto
                      src={c.photo_url}
                      alt={fish?.name ?? "Catch photo"}
                      className="w-full max-h-64 object-contain bg-black/30"
                      thumbClassName="w-full"
                    />
                  )}

                  <div className="p-4 flex flex-col gap-2">
                    {/* Species + metrics row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Link
                        href={`/catches/${c.id}`}
                        className="font-bold text-slate-200 hover:text-blue-300 transition-colors"
                      >
                        {fish?.name ?? "Unknown Species"}
                      </Link>
                      <div className="flex items-center gap-3">
                        {c.weight_lbs != null && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Scale size={11} className="text-slate-500" />
                            {c.weight_lbs} lbs
                          </span>
                        )}
                        {c.length_in != null && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Ruler size={11} className="text-slate-500" />
                            {c.length_in}&quot;
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spot link + bait badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {spot && (
                        <Link
                          href={`/spots/${spot.id}`}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <MapPin size={10} />
                          {spot.name}
                        </Link>
                      )}
                      {bait && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                          {bait.name}
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {c.notes && (
                      <p className="text-sm text-slate-400 line-clamp-3">
                        {c.notes}
                      </p>
                    )}

                    {/* Footer: username + follow + time */}
                    <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {profile ? (
                          <Link
                            href={`/anglers/${profile.id}`}
                            className="text-xs text-slate-500 hover:text-blue-400 transition-colors font-medium"
                          >
                            @{profile.username}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-600">
                            @angler
                          </span>
                        )}
                        {/* Inline follow button — only for other users */}
                        {user && profile && profile.id !== user.id && (
                          <FollowButton
                            targetUserId={profile.id}
                            isFollowing={followingIds.includes(profile.id)}
                            compact
                          />
                        )}
                        {c.is_private && (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-500/70">
                            <Lock size={10} /> Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span>{timeAgo(c.caught_at)}</span>
                        <span>·</span>
                        <span>
                          {new Date(c.caught_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
