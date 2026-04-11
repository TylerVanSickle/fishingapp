"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { filterCheck } from "@/lib/contentFilter";
import { sendPushToUser } from "@/lib/push";

// ─── Block / Unblock ─────────────────────────────────────────────────────────

export async function blockUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");
  if (user.id === targetUserId) throw new Error("Cannot block yourself");

  // Block the user
  await supabase.from("user_blocks").upsert(
    { blocker_id: user.id, blocked_id: targetUserId },
    { onConflict: "blocker_id,blocked_id" }
  );

  // Also unfollow in both directions
  await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
  await supabase.from("follows").delete().eq("follower_id", targetUserId).eq("following_id", user.id);

  revalidatePath(`/anglers/${targetUserId}`);
  revalidatePath("/feed");
}

export async function unblockUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("user_blocks").delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  revalidatePath(`/anglers/${targetUserId}`);
}

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
    const { data: actor } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    void sendPushToUser(supabase, targetUserId, {
      title: "New follower",
      body: `@${actor?.username ?? "Someone"} started following you`,
      url: `/anglers/${user.id}`,
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

  const { data: existing } = await supabase.from("spot_ratings")
    .select("id").eq("spot_id", spotId).eq("user_id", user.id).single();

  await supabase.from("spot_ratings").upsert(
    { spot_id: spotId, user_id: user.id, rating },
    { onConflict: "spot_id,user_id" }
  );

  // Notify spot owner on first rating (not on update)
  if (!existing) {
    const { data: spotRow } = await supabase.from("spots").select("user_id").eq("id", spotId).single();
    if (spotRow && spotRow.user_id && spotRow.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: spotRow.user_id,
        type: "spot_rating",
        actor_id: user.id,
        entity_id: spotId,
      });
      const { data: actor } = await supabase.from("profiles").select("username").eq("id", user.id).single();
      void sendPushToUser(supabase, spotRow.user_id, {
        title: "New spot rating",
        body: `@${actor?.username ?? "Someone"} rated your spot`,
        url: `/spots/${spotId}`,
      });
    }
  }

  revalidatePath(`/spots/${spotId}`);
}

// ─── Spot comments ────────────────────────────────────────────────────────────

export async function addSpotComment(spotId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1000) throw new Error("Invalid comment");

  const filterErr = filterCheck(trimmed);
  if (filterErr) throw new Error(filterErr);

  const { data: inserted } = await supabase.from("spot_comments").insert({
    spot_id: spotId,
    user_id: user.id,
    body: trimmed,
  }).select("id").single();

  // Notify spot owner (skip if commenting on own spot)
  const { data: spotRow } = await supabase.from("spots").select("user_id").eq("id", spotId).single();
  if (spotRow && spotRow.user_id && spotRow.user_id !== user.id) {
    await supabase.from("notifications").insert({
      user_id: spotRow.user_id,
      type: "spot_comment",
      actor_id: user.id,
      entity_id: spotId,
    });
    const { data: actor } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    void sendPushToUser(supabase, spotRow.user_id, {
      title: "New comment on your spot",
      body: `@${actor?.username ?? "Someone"}: ${trimmed.slice(0, 80)}`,
      url: `/spots/${spotId}`,
    });
  }

  void inserted;
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

  const filterErr = filterCheck(trimmed);
  if (filterErr) throw new Error(filterErr);

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
    const { data: actor } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    void sendPushToUser(supabase, catchRow.user_id, {
      title: "New comment on your catch",
      body: `@${actor?.username ?? "Someone"}: ${trimmed.slice(0, 80)}`,
      url: `/catches/${catchId}`,
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

// ─── Notify followers of new catch ────────────────────────────────────────────

export async function notifyFollowersOfCatch(catchId: string, spotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get all followers
  const { data: followers } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", user.id);

  if (!followers || followers.length === 0) return;

  const { data: actor } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  const { data: spot } = await supabase.from("spots").select("name").eq("id", spotId).single();
  const spotName = (spot as unknown as { name: string } | null)?.name;

  // Create notifications for each follower (batch insert)
  const notifs = followers.map((f) => ({
    user_id: f.follower_id,
    type: "follow_catch",
    actor_id: user.id,
    entity_id: catchId,
  }));
  await supabase.from("notifications").insert(notifs);

  // Send push to each follower
  for (const f of followers) {
    void sendPushToUser(supabase, f.follower_id, {
      title: "New catch!",
      body: `@${actor?.username ?? "Someone"} logged a catch${spotName ? ` at ${spotName}` : ""}`,
      url: `/catches/${catchId}`,
    });
  }
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
        const { data: actor } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        void sendPushToUser(supabase, catchRow.user_id, {
          title: `${emoji} reaction on your catch`,
          body: `@${actor?.username ?? "Someone"} reacted to your catch`,
          url: `/catches/${catchId}`,
        });
      }
    }
  }

  revalidatePath(`/catches/${catchId}`);
}
