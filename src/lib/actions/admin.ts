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

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const supabase = await assertAdmin();
  await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function markContactRead(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
  revalidatePath("/admin/contact");
}

export async function markAllContactRead() {
  const supabase = await assertAdmin();
  await supabase.from("contact_submissions").update({ read: true }).eq("read", false);
  revalidatePath("/admin/contact");
}
