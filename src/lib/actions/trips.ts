"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTrip(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const name = (formData.get("name") as string).trim();
  const description = formData.get("description") as string;
  const planned_date = formData.get("planned_date") as string;

  const { data, error } = await supabase.from("trips").insert({
    user_id: user.id,
    name,
    description: description || null,
    planned_date: planned_date || null,
  }).select("id").single();

  if (error) throw new Error(error.message);
  revalidatePath("/trips");
  redirect(`/trips/${data.id}`);
}

export async function updateTrip(tripId: string, updates: {
  name?: string;
  description?: string | null;
  planned_date?: string | null;
  bait_plan?: string | null;
  gear_notes?: string | null;
  checklist?: { text: string; done: boolean }[];
  target_species?: string[];
  is_public?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const { error } = await supabase.from("trips")
    .update(updates)
    .eq("id", tripId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/trips");
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("trips").delete().eq("id", tripId).eq("user_id", user.id);
  revalidatePath("/trips");
  redirect("/trips");
}

export async function addSpotToTrip(tripId: string, spotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("trip_spots").upsert(
    { trip_id: tripId, spot_id: spotId },
    { onConflict: "trip_id,spot_id" }
  );
  revalidatePath(`/trips/${tripId}`);
}

export async function removeSpotFromTrip(tripId: string, spotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  await supabase.from("trip_spots")
    .delete()
    .eq("trip_id", tripId)
    .eq("spot_id", spotId);
  revalidatePath(`/trips/${tripId}`);
}

export async function verifySpot(spotId: string, currentlyVerified: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  if (currentlyVerified) {
    await supabase.from("spot_verifications")
      .delete()
      .eq("spot_id", spotId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("spot_verifications")
      .insert({ spot_id: spotId, user_id: user.id });
  }

  revalidatePath(`/spots/${spotId}`);
}
