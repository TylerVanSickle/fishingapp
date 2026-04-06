import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowLeft, Pencil, CloudSun, Thermometer, Droplets, Wind } from "lucide-react";

const moodEmoji: Record<string, string> = {
  great: "🤩", good: "😊", okay: "😐", slow: "😴", skunked: "😤",
};
const moodLabel: Record<string, string> = {
  great: "Great", good: "Good", okay: "Okay", slow: "Slow", skunked: "Skunked",
};

export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry) notFound();

  type Entry = {
    id: string; title: string | null; outing_date: string; mood: string | null;
    weather: string | null; wind: string | null; temp_f: number | null;
    water_temp_f: number | null; water_clarity: string | null;
    body: string | null; created_at: string;
  };
  const e = entry as unknown as Entry;
  const outingDate = new Date(e.outing_date + "T12:00:00");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/journal" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
        <ArrowLeft size={12} /> All Entries
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {e.mood && <span className="text-xl">{moodEmoji[e.mood as string] ?? ""}</span>}
            <h1 className="text-xl font-bold text-white">
              {(e.title as string) || "Outing Notes"}
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            {outingDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {e.mood && <span className="ml-2 text-slate-600">· {moodLabel[e.mood as string]}</span>}
          </p>
        </div>
        <Link href={`/journal/${id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/3 text-slate-400 hover:text-slate-200 text-xs transition-colors shrink-0">
          <Pencil size={12} /> Edit
        </Link>
      </div>

      {/* Conditions card */}
      {!!(e.weather || e.wind || e.temp_f != null || e.water_temp_f != null || e.water_clarity) && (
        <div className="mb-6 p-4 rounded-2xl border border-white/8 bg-white/2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Conditions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {e.weather && (
              <div className="flex items-center gap-2">
                <CloudSun size={14} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-600">Weather</p>
                  <p className="text-sm text-slate-200">{e.weather as string}</p>
                </div>
              </div>
            )}
            {e.wind && (
              <div className="flex items-center gap-2">
                <Wind size={14} className="text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-600">Wind</p>
                  <p className="text-sm text-slate-200">{e.wind as string}</p>
                </div>
              </div>
            )}
            {e.temp_f != null && (
              <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-600">Air Temp</p>
                  <p className="text-sm text-slate-200">{e.temp_f as number}°F</p>
                </div>
              </div>
            )}
            {e.water_temp_f != null && (
              <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-cyan-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-600">Water Temp</p>
                  <p className="text-sm text-slate-200">{e.water_temp_f as number}°F</p>
                </div>
              </div>
            )}
            {e.water_clarity && (
              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-teal-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-600">Water Clarity</p>
                  <p className="text-sm text-slate-200">{e.water_clarity as string}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes body */}
      <div className="prose prose-invert prose-sm max-w-none">
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Notes</p>
          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{e.body as string}</p>
        </div>
      </div>

      <p className="text-xs text-slate-700 mt-4 text-right">
        Saved {new Date(e.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
