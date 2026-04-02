"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitFishingReport(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const spotId = formData.get("spot_id") as string;
  const activityLevel = formData.get("activity_level") as string;
  const waterClarity = formData.get("water_clarity") as string | null;
  const waterTempF = formData.get("water_temp_f") as string | null;
  const body = formData.get("body") as string;

  const { error } = await supabase.from("fishing_reports").insert({
    spot_id: spotId,
    user_id: user.id,
    activity_level: activityLevel,
    water_clarity: waterClarity || null,
    water_temp_f: waterTempF ? parseFloat(waterTempF) : null,
    body,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/spots/${spotId}`);
}

export async function deleteReport(reportId: string, spotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  await supabase.from("fishing_reports").delete()
    .eq("id", reportId).eq("user_id", user.id);
  revalidatePath(`/spots/${spotId}`);
}

export async function adminDeleteReport(reportId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden");
  await supabase.from("fishing_reports").delete().eq("id", reportId);
  revalidatePath("/admin");
}
