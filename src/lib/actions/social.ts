"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Follow ──────────────────────────────────────────────────────────────────

export async function toggleFollow(targetUserId: string, currentlyFollowing: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  if (currentlyFollowing) {
    await supabase.from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
  } else {
    await supabase.from("follows")
      .insert({ follower_id: user.id, following_id: targetUserId });

    // Create notification for the followed user
    await supabase.from("notifications").insert({
      user_id: targetUserId,
      type: "new_follower",
      actor_id: user.id,
    });
  }

  revalidatePath(`/anglers/${targetUserId}`);
  revalidatePath("/feed");
}

// ─── Spot rating ─────────────────────────────────────────────────────────────

export async function rateSpot(spotId: string, rating: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("spot_ratings").upsert(
    { spot_id: spotId, user_id: user.id, rating },
    { onConflict: "spot_id,user_id" }
  );

  revalidatePath(`/spots/${spotId}`);
}

// ─── Spot comments ────────────────────────────────────────────────────────────

export async function addSpotComment(spotId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1000) throw new Error("Invalid comment");

  await supabase.from("spot_comments").insert({
    spot_id: spotId,
    user_id: user.id,
    body: trimmed,
  });

  revalidatePath(`/spots/${spotId}`);
}

export async function deleteSpotComment(commentId: string, spotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("spot_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id); // RLS also enforces this

  revalidatePath(`/spots/${spotId}`);
}

// ─── Catch comments ───────────────────────────────────────────────────────────

export async function addCatchComment(catchId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 500) throw new Error("Comment must be 1–500 characters");

  await supabase.from("catch_comments").insert({
    catch_id: catchId,
    user_id: user.id,
    content: trimmed,
  });

  // Notify the catch owner (skip if they're commenting on their own catch)
  const { data: catchRow } = await supabase.from("catches").select("user_id").eq("id", catchId).single();
  if (catchRow && catchRow.user_id !== user.id) {
    await supabase.from("notifications").insert({
      user_id: catchRow.user_id,
      type: "catch_comment",
      actor_id: user.id,
      entity_id: catchId,
    });
  }

  revalidatePath(`/catches/${catchId}`);
}

export async function deleteCatchComment(commentId: string, catchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("catch_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/catches/${catchId}`);
}

export async function reportCatchComment(commentId: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("comment_reports").upsert(
    { comment_id: commentId, reporter_id: user.id, reason: reason ?? null },
    { onConflict: "comment_id,reporter_id" }
  );
}

// ─── Catch reactions ──────────────────────────────────────────────────────────

export async function setCatchReaction(catchId: string, emoji: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  if (emoji === null) {
    await supabase.from("catch_reactions")
      .delete()
      .eq("catch_id", catchId)
      .eq("user_id", user.id);
  } else {
    const { data: existing } = await supabase.from("catch_reactions")
      .select("emoji").eq("catch_id", catchId).eq("user_id", user.id).single();
    await supabase.from("catch_reactions").upsert(
      { catch_id: catchId, user_id: user.id, emoji },
      { onConflict: "catch_id,user_id" }
    );
    // Only notify on new reaction (not emoji change), skip own catches
    if (!existing) {
      const { data: catchRow } = await supabase.from("catches").select("user_id").eq("id", catchId).single();
      if (catchRow && catchRow.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: catchRow.user_id,
          type: "catch_reaction",
          actor_id: user.id,
          entity_id: catchId,
        });
      }
    }
  }

  revalidatePath(`/catches/${catchId}`);
}
