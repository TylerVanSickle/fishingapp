"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  await supabase.from("catches").delete().eq("id", catchId);
  revalidatePath("/admin/catches");
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { error } = await supabase
    .from("catches")
    .update(data)
    .eq("id", catchId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
  revalidatePath("/feed");
}
