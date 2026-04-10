"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const MAX_WEIGHT_LBS = 1500;
const MAX_LENGTH_IN = 240;

function validateCatchMeasurements(weightLbs?: number | null, lengthIn?: number | null) {
  if (weightLbs != null) {
    if (weightLbs < 0) throw new Error("Weight cannot be negative");
    if (weightLbs > MAX_WEIGHT_LBS) throw new Error(`Weight cannot exceed ${MAX_WEIGHT_LBS} lbs`);
  }
  if (lengthIn != null) {
    if (lengthIn < 0) throw new Error("Length cannot be negative");
    if (lengthIn > MAX_LENGTH_IN) throw new Error(`Length cannot exceed ${MAX_LENGTH_IN} inches`);
  }
}

async function checkAndFlagSuspicious(
  supabase: Awaited<ReturnType<typeof createClient>>,
  catchId: string,
  userId: string,
  fishId: string,
  weightLbs?: number | null,
  lengthIn?: number | null
) {
  if (weightLbs == null && lengthIn == null) return;

  const { data: species } = await supabase
    .from("fish_species")
    .select("name, record_weight_lbs, record_length_in")
    .eq("id", fishId)
    .single();

  const rec = species as unknown as {
    name: string;
    record_weight_lbs: number | null;
    record_length_in: number | null;
  } | null;

  const reasons: string[] = [];

  if (rec?.record_weight_lbs && weightLbs != null && weightLbs > rec.record_weight_lbs) {
    reasons.push(`Weight ${weightLbs} lbs exceeds ${rec.name} world record of ${rec.record_weight_lbs} lbs`);
  }
  if (rec?.record_length_in && lengthIn != null && lengthIn > rec.record_length_in) {
    reasons.push(`Length ${lengthIn} in exceeds ${rec.name} world record of ${rec.record_length_in} in`);
  }

  // Fallback: if species has no records set, use generous absolute thresholds
  if (!rec?.record_weight_lbs && weightLbs != null && weightLbs > 200) {
    reasons.push(`Weight ${weightLbs} lbs is unusually high (no species record on file)`);
  }
  if (!rec?.record_length_in && lengthIn != null && lengthIn > 72) {
    reasons.push(`Length ${lengthIn} in is unusually high (no species record on file)`);
  }

  if (reasons.length > 0) {
    await supabase.from("content_reports").insert({
      reporter_id: userId,
      content_type: "catch",
      content_id: catchId,
      reason: `[Auto-flagged] ${reasons.join(". ")}`,
    });
  }
}

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden");
  return supabase;
}

export async function adminDeleteCatch(catchId: string) {
  const supabase = await assertAdmin();
  // Delete related comments and reactions first to avoid FK constraints
  await supabase.from("catch_reactions").delete().eq("catch_id", catchId);
  await supabase.from("catch_comments").delete().eq("catch_id", catchId);
  const { error } = await supabase.from("catches").delete().eq("id", catchId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/catches");
  revalidatePath("/feed");
  revalidatePath("/profile");
}

export async function deleteMyCatch(catchId: string, spotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { error } = await supabase.from("catches").delete().eq("id", catchId).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/spots/${spotId}`);
  revalidatePath("/profile");
  revalidatePath("/feed");
}

export async function updateMyCatch(catchId: string, data: {
  fish_id?: string;
  spot_id?: string;
  bait_id?: string | null;
  weight_lbs?: number | null;
  length_in?: number | null;
  caught_at?: string;
  notes?: string | null;
  is_private?: boolean;
}) {
  validateCatchMeasurements(data.weight_lbs, data.length_in);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { error } = await supabase
    .from("catches")
    .update(data)
    .eq("id", catchId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  // Look up fish_id from the catch if not in the update data
  let fishId = data.fish_id;
  if (!fishId) {
    const { data: existing } = await supabase.from("catches").select("fish_id").eq("id", catchId).single();
    fishId = (existing as unknown as { fish_id: string } | null)?.fish_id;
  }
  if (fishId) {
    await checkAndFlagSuspicious(supabase, catchId, user.id, fishId, data.weight_lbs, data.length_in);
  }

  revalidatePath("/profile");
  revalidatePath("/feed");
}
