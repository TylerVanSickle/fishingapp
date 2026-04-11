"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPushToUser } from "@/lib/push";

// ─── Admin ───────────────────────────────────────────────────────────────────

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden");
  return supabase;
}

export async function approveSpot(spotId: string) {
  const supabase = await assertAdmin();
  await supabase.from("spots").update({ approved: true }).eq("id", spotId);

  // Notify the spot creator that their spot was approved
  const { data: spot } = await supabase.from("spots")
    .select("created_by, name").eq("id", spotId).single();
  if (spot?.created_by) {
    await supabase.from("notifications").insert({
      user_id: spot.created_by,
      type: "spot_approved",
      entity_id: spotId,
    });
    void sendPushToUser(supabase, spot.created_by, {
      title: "Spot approved!",
      body: `Your spot "${spot.name}" is now live on the map`,
      url: `/spots/${spotId}`,
    });
  }

  revalidatePath("/admin/spots");
  revalidatePath("/map");
  revalidatePath("/spots");
}

export async function rejectSpot(spotId: string) {
  const supabase = await assertAdmin();

  // Notify the creator before deleting
  const { data: spot } = await supabase.from("spots")
    .select("created_by, name").eq("id", spotId).single();
  if (spot?.created_by) {
    await supabase.from("notifications").insert({
      user_id: spot.created_by,
      type: "spot_rejected",
      entity_id: spotId,
    });
    void sendPushToUser(supabase, spot.created_by, {
      title: "Spot not approved",
      body: `Your spot "${spot.name}" was not approved. Check our guidelines and try again.`,
      url: "/submit-spot",
    });
  }

  await supabase.from("spots").delete().eq("id", spotId);
  revalidatePath("/admin/spots");
}

export async function adminDeleteSpot(spotId: string) {
  const supabase = await assertAdmin();
  await supabase.from("spots").delete().eq("id", spotId);
  revalidatePath("/admin/spots");
  revalidatePath("/spots");
}

// ─── Saved spots ─────────────────────────────────────────────────────────────

export async function toggleSaveSpot(spotId: string, currentlySaved: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to save spots");

  if (currentlySaved) {
    await supabase.from("saved_spots")
      .delete()
      .eq("user_id", user.id)
      .eq("spot_id", spotId);
  } else {
    await supabase.from("saved_spots")
      .insert({ user_id: user.id, spot_id: spotId });
  }

  revalidatePath(`/spots/${spotId}`);
  revalidatePath("/profile");
}

export async function submitSpot(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const water_type = formData.get("water_type") as string;
  const state = formData.get("state") as string;
  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);
  const access_notes = formData.get("access_notes") as string;
  const photo_url = formData.get("photo_url") as string;

  const insertData: Record<string, unknown> = {
    name, description: description || null,
    water_type, state: state || null, latitude, longitude,
    access_notes: access_notes || null,
    created_by: user.id,
    approved: false,
  };
  if (photo_url) insertData.photo_url = photo_url;

  const { error } = await supabase.from("spots").insert(insertData);

  if (error) throw new Error(error.message);
  revalidatePath("/spots");
}
