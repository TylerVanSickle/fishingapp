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
  return { supabase, adminId: user.id };
}

async function logAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminId: string,
  targetUserId: string,
  action: string,
  reason?: string,
  details?: Record<string, unknown>
) {
  await supabase.from("admin_actions").insert({
    admin_id: adminId,
    target_user_id: targetUserId,
    action,
    reason: reason ?? null,
    details: details ?? null,
  });
}

// ─── User Admin Toggle ────────────────────────────────────────────────────────

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const { supabase, adminId } = await assertAdmin();
  await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId);
  await logAction(supabase, adminId, userId, isAdmin ? "grant_admin" : "revoke_admin");
  revalidatePath("/admin/users");
}

// ─── Ban / Unban ──────────────────────────────────────────────────────────────

export async function banUser(userId: string, reason: string) {
  const { supabase, adminId } = await assertAdmin();
  await supabase.from("profiles").update({ is_banned: true, ban_reason: reason }).eq("id", userId);
  await logAction(supabase, adminId, userId, "ban", reason);
  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string) {
  const { supabase, adminId } = await assertAdmin();
  await supabase.from("profiles").update({ is_banned: false, ban_reason: null }).eq("id", userId);
  await logAction(supabase, adminId, userId, "unban");
  revalidatePath("/admin/users");
}

// ─── Suspend / Unsuspend ──────────────────────────────────────────────────────

export async function suspendUser(userId: string, days: number, reason: string) {
  const { supabase, adminId } = await assertAdmin();
  const until = new Date();
  until.setDate(until.getDate() + days);
  await supabase.from("profiles").update({
    is_suspended: true,
    suspended_until: until.toISOString(),
    ban_reason: reason,
  }).eq("id", userId);
  await logAction(supabase, adminId, userId, "suspend", reason, { days });
  revalidatePath("/admin/users");
}

export async function unsuspendUser(userId: string) {
  const { supabase, adminId } = await assertAdmin();
  await supabase.from("profiles").update({
    is_suspended: false,
    suspended_until: null,
    ban_reason: null,
  }).eq("id", userId);
  await logAction(supabase, adminId, userId, "unsuspend");
  revalidatePath("/admin/users");
}

// ─── Warn ─────────────────────────────────────────────────────────────────────

export async function warnUser(userId: string, reason: string) {
  const { supabase, adminId } = await assertAdmin();
  // Increment warn count
  const { data: profile } = await supabase.from("profiles").select("warn_count").eq("id", userId).single();
  const newCount = ((profile as unknown as { warn_count?: number })?.warn_count ?? 0) + 1;
  await supabase.from("profiles").update({ warn_count: newCount }).eq("id", userId);
  await logAction(supabase, adminId, userId, "warn", reason, { warn_count: newCount });
  revalidatePath("/admin/users");
}

// ─── Delete All User Content ──────────────────────────────────────────────────

export async function deleteUserContent(userId: string) {
  const { supabase, adminId } = await assertAdmin();
  await Promise.all([
    supabase.from("catches").delete().eq("user_id", userId),
    supabase.from("catch_comments").delete().eq("user_id", userId),
    supabase.from("spot_comments").delete().eq("user_id", userId),
  ]);
  await logAction(supabase, adminId, userId, "delete_content");
  revalidatePath("/admin/users");
}

// ─── Contact Submissions ──────────────────────────────────────────────────────

export async function markContactRead(id: string) {
  const { supabase } = await assertAdmin();
  await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
  revalidatePath("/admin/contact");
}

export async function markAllContactRead() {
  const { supabase } = await assertAdmin();
  await supabase.from("contact_submissions").update({ read: true }).eq("read", false);
  revalidatePath("/admin/contact");
}
