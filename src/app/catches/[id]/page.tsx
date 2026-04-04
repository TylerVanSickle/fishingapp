import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Fish, MapPin, Scale, Ruler, Calendar, Utensils, Pencil } from "lucide-react";
import ClickablePhoto from "@/components/ClickablePhoto";
import Avatar from "@/components/Avatar";
import ShareButton from "@/components/ShareButton";
import CatchReactions from "@/components/CatchReactions";
import CatchComments from "@/components/CatchComments";
import ReportButton from "@/components/ReportButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: c } = await supabase
    .from("catches")
    .select("photo_url, weight_lbs, fish_species(name), spots(name), profiles!user_id(username)")
    .eq("id", id)
    .single();
  if (!c) return { title: "Catch — HookLine" };
  const fish = c.fish_species as unknown as { name: string } | null;
  const spot = c.spots as unknown as { name: string } | null;
  const angler = c.profiles as unknown as { username: string } | null;
  const title = `${fish?.name ?? "Catch"}${c.weight_lbs ? ` · ${c.weight_lbs} lbs` : ""}${spot ? ` at ${spot.name}` : ""} — HookLine`;
  const description = `${angler ? `@${angler.username} caught` : "Catch logged"} a ${fish?.name ?? "fish"}${c.weight_lbs ? ` weighing ${c.weight_lbs} lbs` : ""}${spot ? ` at ${spot.name}` : ""} on HookLine.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(c.photo_url ? { images: [{ url: c.photo_url }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [
    { data: c },
    { data: rawReactions },
    { data: rawComments },
  ] = await Promise.all([
    supabase
      .from("catches")
      .select("*, fish_species(id, name), spots(id, name, water_type, state), baits(name, type), profiles!user_id(id, username, avatar_url)")
      .eq("id", id)
      .single(),
    supabase
      .from("catch_reactions")
      .select("emoji, user_id")
      .eq("catch_id", id),
    supabase
      .from("catch_comments")
      .select("id, content, created_at, user_id, profiles!user_id(id, username, avatar_url)")
      .eq("catch_id", id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true }),
  ]);

  if (!c) notFound();

  // Aggregate reactions
  const emojiCounts = new Map<string, number>();
  (rawReactions ?? []).forEach((r) => {
    emojiCounts.set(r.emoji, (emojiCounts.get(r.emoji) ?? 0) + 1);
  });
  const reactions = Array.from(emojiCounts.entries()).map(([emoji, count]) => ({
    emoji,
    count,
    reacted: rawReactions?.some((r) => r.emoji === emoji && r.user_id === currentUser?.id) ?? false,
  }));
  const currentUserReaction = rawReactions?.find((r) => r.user_id === currentUser?.id)?.emoji ?? null;

  type CommentRow = {
    id: string; content: string; created_at: string; user_id: string;
    profiles: { id: string; username: string; avatar_url: string | null } | null;
  };
  const comments = (rawComments ?? []) as unknown as CommentRow[];

  const fish    = c.fish_species as unknown as { id: string; name: string } | null;
  const spot    = c.spots        as unknown as { id: string; name: string; water_type: string; state: string | null } | null;
  const bait    = c.baits        as unknown as { name: string; type: string } | null;
  const angler  = c.profiles     as unknown as { id: string; username: string; avatar_url: string | null } | null;

  const caughtDate = new Date(c.caught_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const caughtTime = new Date(c.caught_at).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link
        href={spot ? `/spots/${spot.id}` : "/feed"}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> {spot ? spot.name : "Feed"}
      </Link>

      {/* Photo */}
      {c.photo_url && (
        <ClickablePhoto
          src={c.photo_url}
          alt={fish?.name ?? "Catch"}
          className="w-full rounded-2xl object-contain bg-black/20 max-h-105 border border-white/8"
          thumbClassName="w-full rounded-2xl overflow-hidden border border-white/8 mb-6"
        />
      )}

      {/* Main card */}
      <div className="p-6 rounded-2xl border border-white/8 bg-white/2 mb-4">
        {/* Species */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {fish?.name ?? "Unknown Species"}
            </h1>
            {spot && (
              <Link
                href={`/spots/${spot.id}`}
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <MapPin size={12} />
                {spot.name}
                {spot.state && <span className="text-slate-600 ml-1">· {spot.state}</span>}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentUser?.id === angler?.id && (
              <Link
                href={`/catches/${id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 border border-white/8 transition-colors"
              >
                <Pencil size={13} /> Edit
              </Link>
            )}
            <ShareButton
              title={`${fish?.name ?? "Catch"} — HookLine`}
              text={`Check out this ${fish?.name ?? "catch"} on HookLine${spot ? ` at ${spot.name}` : ""}`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {c.weight_lbs != null && (
            <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center gap-2.5">
              <Scale size={16} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Weight</p>
                <p className="text-lg font-bold text-white">{c.weight_lbs} <span className="text-sm font-normal text-slate-400">lbs</span></p>
              </div>
            </div>
          )}
          {c.length_in != null && (
            <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center gap-2.5">
              <Ruler size={16} className="text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Length</p>
                <p className="text-lg font-bold text-white">{c.length_in}<span className="text-sm font-normal text-slate-400">&quot;</span></p>
              </div>
            </div>
          )}
          {bait && (
            <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center gap-2.5">
              <Utensils size={16} className="text-green-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Bait</p>
                <p className="text-sm font-semibold text-white">{bait.name}</p>
              </div>
            </div>
          )}
          <div className="p-3.5 rounded-xl bg-white/4 border border-white/8 flex items-center gap-2.5">
            <Calendar size={16} className="text-violet-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Caught</p>
              <p className="text-sm font-semibold text-white">{caughtDate}</p>
              <p className="text-xs text-slate-600">{caughtTime}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {c.notes && (
          <div className="p-4 rounded-xl bg-white/3 border border-white/8">
            <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-semibold">Notes</p>
            <p className="text-sm text-slate-300 leading-relaxed">{c.notes}</p>
          </div>
        )}
      </div>

      {/* Angler footer */}
      {angler && (
        <Link
          href={`/anglers/${angler.id}`}
          className="flex items-center gap-3 p-4 rounded-2xl border border-white/6 bg-white/2 hover:bg-white/4 transition-colors group"
        >
          <Avatar url={angler.avatar_url} username={angler.username} size={40} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">@{angler.username}</p>
            <p className="text-xs text-slate-600">View profile & catches</p>
          </div>
          <Fish size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
        </Link>
      )}

      {/* Report */}
      <div className="mt-2 flex justify-end">
        <ReportButton contentType="catch" contentId={id} isOwn={currentUser?.id === angler?.id} />
      </div>

      {/* Species link */}
      {fish && (
        <Link
          href={`/fish/${fish.id}`}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/8 text-sm text-slate-400 hover:text-slate-200 hover:border-white/15 transition-colors"
        >
          <Fish size={14} className="text-blue-400" /> Learn about {fish.name}
        </Link>
      )}

      {/* Reactions */}
      <div className="mt-4 p-4 rounded-2xl border border-white/8 bg-white/2">
        <CatchReactions
          catchId={id}
          reactions={reactions}
          currentUserReaction={currentUserReaction}
          isLoggedIn={!!currentUser}
        />
      </div>

      {/* Comments */}
      <div className="mt-4 p-4 rounded-2xl border border-white/8 bg-white/2">
        <CatchComments
          catchId={id}
          initialComments={comments}
          currentUserId={currentUser?.id ?? null}
        />
      </div>
    </div>
  );
}
