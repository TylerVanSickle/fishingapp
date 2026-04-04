import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import ProGate from "@/components/ProGate";
import TripPlannerClient from "./TripPlannerClient";

export default async function TripPlannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/trips/planner");

  const { data: profile } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
  const isPro = !!(profile as unknown as { is_pro?: boolean } | null)?.is_pro;

  if (!isPro) {
    return (
      <ProGate
        title="Trip Intel"
        description="Pick any spot and get real-time weather, solunar feeding windows, community catch data, top baits, best times of day, and trip tips — all in one place."
        icon={Zap}
        iconColor="text-yellow-400"
        features={[
          "Live weather & conditions",
          "Solunar feeding windows",
          "Top species at the spot",
          "Community-proven baits",
          "Best hours of the day",
          "Auto-generated trip tips",
        ]}
      />
    );
  }

  return <TripPlannerClient />;
}
