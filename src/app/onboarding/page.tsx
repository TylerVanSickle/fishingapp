import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If already onboarded, go to map
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, username")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_complete) redirect("/map");

  const { data: species } = await supabase
    .from("fish_species")
    .select("id, name")
    .order("name");

  return (
    <OnboardingWizard
      username={profile?.username ?? "Angler"}
      species={species ?? []}
    />
  );
}
