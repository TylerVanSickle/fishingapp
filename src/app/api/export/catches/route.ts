import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: catches, error } = await supabase
    .from("catches")
    .select("caught_at, weight_lbs, length_in, notes, photo_url, is_private, fish_species(name), spots(name, state, water_type), baits(name)")
    .eq("user_id", user.id)
    .order("caught_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = [
    ["Date", "Time", "Species", "Spot", "State", "Water Type", "Weight (lbs)", "Length (in)", "Bait", "Notes", "Private", "Photo URL"],
    ...(catches ?? []).map((c) => {
      const fish = c.fish_species as unknown as { name: string } | null;
      const spot = c.spots as unknown as { name: string; state: string | null; water_type: string } | null;
      const bait = c.baits as unknown as { name: string } | null;
      const d = new Date(c.caught_at);
      return [
        d.toLocaleDateString("en-US"),
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        fish?.name ?? "",
        spot?.name ?? "",
        spot?.state ?? "",
        spot?.water_type ?? "",
        c.weight_lbs ?? "",
        c.length_in ?? "",
        bait?.name ?? "",
        (c.notes ?? "").replace(/"/g, '""'),
        c.is_private ? "Yes" : "No",
        c.photo_url ?? "",
      ];
    }),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="hookline-catches-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
