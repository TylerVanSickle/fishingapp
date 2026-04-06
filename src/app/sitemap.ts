import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://hooklineapp.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: spots }, { data: fish }] = await Promise.all([
    supabase.from("spots").select("id, updated_at").eq("approved", true).limit(500),
    supabase.from("fish_species").select("id").limit(200),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pro`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/spots`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/fish`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/leaderboard`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/explore`, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE}/forecast`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const spotPages: MetadataRoute.Sitemap = (spots ?? []).map((s) => ({
    url: `${BASE}/spots/${s.id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const fishPages: MetadataRoute.Sitemap = (fish ?? []).map((f) => ({
    url: `${BASE}/fish/${f.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...spotPages, ...fishPages];
}
