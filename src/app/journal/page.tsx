import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, Sparkles, CloudSun, Thermometer, Droplets, Wind, ChevronRight } from "lucide-react";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/journal");

  const { data: profile } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
  const isPro = !!(profile as unknown as { is_pro?: boolean } | null)?.is_pro;

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, outing_date, title, body, weather, temp_f, water_clarity, mood, created_at")
    .eq("user_id", user.id)
    .order("outing_date", { ascending: false })
    .limit(50);

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={28} className="text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Fishing Journal</h1>
        <p className="text-slate-400 mb-2">Keep private outing notes — conditions, what worked, what didn&apos;t.</p>
        <p className="text-slate-600 text-sm mb-6">Track patterns over seasons. Be the angler who actually remembers why last April was so good.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          {[
            { icon: CloudSun, label: "Conditions log", desc: "Weather, wind, water clarity, temp" },
            { icon: BookOpen, label: "Free-form notes", desc: "What worked, what didn't, ideas to try" },
            { icon: Thermometer, label: "Seasonal patterns", desc: "Spot which months are your best" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-3 rounded-xl border border-white/8 bg-white/2">
              <Icon size={16} className="text-amber-400 mb-2" />
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <Link href="/pro" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors">
          <Sparkles size={15} /> Unlock Journal with Pro
        </Link>
        <p className="text-xs text-slate-600 mt-3">$15/mo or $150/yr · Cancel anytime</p>
      </div>
    );
  }

  const moodEmoji: Record<string, string> = {
    great: "🤩", good: "😊", okay: "😐", slow: "😴", skunked: "😤",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <BookOpen className="text-amber-400" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white leading-tight">Fishing Journal</h1>
          <p className="text-slate-500 text-xs">{entries?.length ?? 0} outings logged</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors"
        >
          <Plus size={15} /> New Entry
        </Link>
      </div>

      {!entries || entries.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-1">No entries yet.</p>
          <p className="text-xs text-slate-700 mb-4">Start logging your outings — you&apos;ll thank yourself next season.</p>
          <Link href="/journal/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors">
            <Plus size={13} /> Write first entry
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <Link
              key={e.id}
              href={`/journal/${e.id}`}
              className="group flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/12 transition-colors"
            >
              {/* Date block */}
              <div className="shrink-0 w-12 text-center">
                <p className="text-lg font-black text-white leading-none">
                  {new Date(e.outing_date + "T12:00:00").getDate()}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">
                  {new Date(e.outing_date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                </p>
                <p className="text-[10px] text-slate-700">
                  {new Date(e.outing_date + "T12:00:00").getFullYear()}
                </p>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {e.mood && <span className="text-base">{moodEmoji[e.mood] ?? ""}</span>}
                  <p className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                    {e.title || "Outing notes"}
                  </p>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{e.body}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-700 flex-wrap">
                  {e.weather && <span className="flex items-center gap-1"><CloudSun size={10} />{e.weather}</span>}
                  {e.temp_f != null && <span className="flex items-center gap-1"><Thermometer size={10} />{e.temp_f}°F</span>}
                  {e.water_clarity && <span className="flex items-center gap-1"><Droplets size={10} />{e.water_clarity}</span>}
                </div>
              </div>

              <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
