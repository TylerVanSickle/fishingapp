"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContact(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !category || !message) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (message.length > 2000) {
    return { ok: false, error: "Message must be under 2000 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name, email, category, message,
  });

  if (error) {
    console.error("Contact submit error:", error);
    return { ok: false, error: "Failed to send message. Please try again." };
  }

  return { ok: true };
}
