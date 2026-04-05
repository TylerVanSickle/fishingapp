import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Fish, MapPin, Scale, Ruler, ArrowLeft } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import Avatar from "@/components/Avatar";
import ShareButton from "@/components/ShareButton";
import ClickablePhoto from "@/components/ClickablePhoto";
import ProBadge from "@/components/ProBadge";
import ReportButton from "@/components/ReportButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, home_state, avatar_url")
    .eq("id", id)
    .single();
  if (!profile) return { title: "Angler — HookLine" };
  const title = `@${profile.username} — HookLine`;
  const description = profile.bio ?? `Angler${profile.home_state ? ` from ${profile.home_state}` : ""} on HookLine.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AnglerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: catches },
  ] = await Promise.all([
    supabase.from("profiles")
      .select("id, username, bio, home_state, avatar_url, created_at, is_pro")
      .eq("id", id)
      .single(),
    supabase.from("catches")
      .select("id, caught_at, weight_lbs, length_in, notes, photo_url, is_private, visibility, fish_species(name), spots(id, name), baits(name)")
      .eq("user_id", id)
      .order("caught_at", { ascending: false })
      .limit(60),
  ]);

  if (!profile) notFound();

  // Follow counts + is-following check + mutual follow check
  const [{ count: followerCount }, { count: followingCount }, followRow, followBackRow] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", id),
    currentUser
      ? supabase.from("follows").select("follower_id").eq("follower_id", currentUser.id).eq("following_id", id).maybeSingle()
      : Promise.resolve({ data: null }),
    currentUser
      ? supabase.from("follows").select("follower_id").eq("follower_id", id).eq("following_id", currentUser.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const isFollowing = !!(followRow as { data: unknown }).data;
  const isOwnProfile = currentUser?.id === id;
  const isMutualFollow = isFollowing && !!(followBackRow as { data: unknown }).data;

  // Filter catches by visibility
  const visibleCatches = (catches ?? []).filter((c) => {
    if (isOwnProfile) return true;
    const vis = (c as Record<string, unknown>).visibility as string | undefined;
    const effective = vis ?? ((c as Record<string, unknown>).is_private ? "private" : "public");
    if (effective === "public") return true;
    if (effective === "friends") return isMutualFollow;
    return false;
  }).slice(0, 30);
  const profileIsPro = !!(profile as unknown as { is_pro?: boolean }).is_pro;

  const totalCatches = visibleCatches.length;
  const uniqueSpecies = new Set(visibleCatches.map((c) => (c.fish_species as unknown as { name: string } | null)?.name).filter(Boolean)).size;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to feed
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-4 mb-8">
        <Avatar url={(profile as unknown as { avatar_url?: string }).avatar_url ?? null} username={profile.username ?? "?"} size={64} className="shrink-0 border-2 border-blue-500/20" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-bold text-white">@{profile.username}</h1>
              {profileIsPro && <ProBadge />}
            {!isOwnProfile && currentUser && (
              <FollowButton targetUserId={id} isFollowing={isFollowing} />
            )}
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="text-xs px-3 py-1 rounded-full border border-white/10 text-slate-400 hover:text-slate-200 transition-colors"
              >
                Edit profile
              </Link>
            )}
            <ShareButton title={`@${profile.username} on HookLine`} text={`Check out @${profile.username}'s catches on HookLine`} />
            {!isOwnProfile && <ReportButton contentType="profile" contentId={id} />}
          </div>
          {profile.home_state && (
            <p className="flex items-center gap-1 text-sm text-slate-500 mb-1">
              <MapPin size={12} /> {profile.home_state}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-slate-400 leading-relaxed mt-1">{profile.bio}</p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-5 mt-3 flex-wrap">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{totalCatches}</p>
              <p className="text-xs text-slate-500">Catches</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{uniqueSpecies}</p>
              <p className="text-xs text-slate-500">Species</p>
            </div>
            <Link href={`/anglers/${id}/followers`} className="text-center hover:opacity-70 transition-opacity">
              <p className="text-lg font-bold text-white">{followerCount ?? 0}</p>
              <p className="text-xs text-slate-500 underline underline-offset-2">Followers</p>
            </Link>
            <Link href={`/anglers/${id}/following`} className="text-center hover:opacity-70 transition-opacity">
              <p className="text-lg font-bold text-white">{followingCount ?? 0}</p>
              <p className="text-xs text-slate-500 underline underline-offset-2">Following</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Catches */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Fish size={13} className="text-blue-400" /> Recent Catches
      </h2>

      {visibleCatches.length === 0 ? (
        <p className="text-slate-600 text-sm">No catches logged yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleCatches.map((c) => {
            const fish = c.fish_species as unknown as { name: string } | null;
            const spot = c.spots as unknown as { id: string; name: string } | null;
            const bait = c.baits as unknown as { name: string } | null;

            return (
              <div key={c.id} className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden hover:border-white/14 transition-colors group">
                {c.photo_url && (
                  <ClickablePhoto
                    src={c.photo_url}
                    alt={fish?.name ?? "Catch"}
                    className="w-full max-h-48 object-contain bg-black/20"
                    thumbClassName="w-full"
                  />
                )}
                <Link href={`/catches/${c.id}`} className="block p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{fish?.name ?? "Unknown"}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {c.weight_lbs != null && (
                        <span className="flex items-center gap-1"><Scale size={10} /> {c.weight_lbs} lbs</span>
                      )}
                      {c.length_in != null && (
                        <span className="flex items-center gap-1"><Ruler size={10} /> {c.length_in}&quot;</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {spot && (
                      <span className="text-blue-400 flex items-center gap-0.5">
                        <MapPin size={10} />{spot.name}
                      </span>
                    )}
                    {bait && (
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">
                        {bait.name}
                      </span>
                    )}
                    <span className="text-slate-600 ml-auto">{timeAgo(c.caught_at)}</span>
                  </div>
                  {c.notes && <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{c.notes}</p>}
                  <p className="text-xs text-blue-500/60 group-hover:text-blue-400 transition-colors mt-1.5">View details →</p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
