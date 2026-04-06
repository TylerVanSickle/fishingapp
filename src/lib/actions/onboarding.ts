"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const home_state = formData.get("home_state") as string | null;
  const speciesIds = formData.getAll("species_ids") as string[];
  const techniques = formData.getAll("techniques") as string[];

  // Update profile
  await supabase.from("profiles").update({
    home_state: home_state || null,
    onboarding_complete: true,
    ...(techniques.length > 0 ? { preferred_techniques: techniques } : {}),
  }).eq("id", user.id);

  // Upsert favorite species
  if (speciesIds.length > 0) {
    await supabase.from("user_favorite_species").delete().eq("user_id", user.id);
    await supabase.from("user_favorite_species").insert(
      speciesIds.map((species_id) => ({ user_id: user.id, species_id }))
    );
  }

  redirect("/map");
}
