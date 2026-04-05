"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { username?: string; bio?: string; home_state?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check username uniqueness if changing
  if (data.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", data.username)
      .neq("id", user.id)
      .single();
    if (existing) throw new Error("Username already taken");
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}
