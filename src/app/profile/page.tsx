import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Fish, MapPin, Trophy, Bookmark, Calendar, Scale, Ruler, Pencil, BarChart3, Download, Lock, Sparkles, Clock, Target, Flame, BookOpen, Route, Package, ExternalLink } from "lucide-react";
import ProBadge from "@/components/ProBadge";
import ClickablePhoto from "@/components/ClickablePhoto";
import CatchActions from "@/components/CatchActions";
import Avatar from "@/components/Avatar";
import ShareButton from "@/components/ShareButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profile");

  const [
    { data: profile },
    { data: allCatches },
    { data: savedSpots },
    { count: followerCount },
    { count: followingCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("catches")
      .select("id, fish_id, spot_id, bait_id, weight_lbs, length_in, caught_at, notes, photo_url, is_private, fish_species(id, name), spots(id, name), baits(name)")
      .eq("user_id", user.id)
      .order("caught_at", { ascending: false }),
    supabase.from("saved_spots")
      .select("spots(id, name, water_type)")
      .eq("user_id", user.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
  ]);

  const isPro = !!(profile as unknown as { is_pro?: boolean } | null)?.is_pro;

  const catches = allCatches ?? [];

  // Stats
  const totalCatches = catches.length;
  const uniqueSpecies = new Set(catches.map((c) => (c.fish_species as unknown as { id: string } | null)?.id).filter(Boolean)).size;
  const uniqueSpots = new Set(catches.map((c) => (c.spots as unknown as { id: string } | null)?.id).filter(Boolean)).size;

  // Total weight
  const totalWeight = catches.reduce((sum, c) => sum + (c.weight_lbs ?? 0), 0);

  // Fishing streak (consecutive days with at least 1 catch, going back from today)
  const catchDaySet = new Set(catches.map((c) => new Date(c.caught_at).toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (catchDaySet.has(d.toISOString().slice(0, 10))) {
      streak++;
    } else if (i > 0) {
      break; // streak broken
    }
  }

  // Trips count
  const { count: tripsCount } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // ── Catches by month (last 12) ────────────────────────────────────────────
  const now = new Date();
  const months: { label: string; key: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      count: 0,
    });
  }
  catches.forEach((c) => {
    const d = new Date(c.caught_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const m = months.find((x) => x.key === key);
    if (m) m.count++;
  });
  const maxMonthCount = Math.max(...months.map((m) => m.count), 1);

  // ── Fishing calendar (365-day heatmap) ───────────────────────────────────
  const calendarDays: { date: string; count: number }[] = [];
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const catchByDay = new Map<string, number>();
  catches.forEach((c) => {
    const key = new Date(c.caught_at).toISOString().slice(0, 10);
    catchByDay.set(key, (catchByDay.get(key) ?? 0) + 1);
  });
  for (let d = new Date(yearAgo); d.getTime() <= now.getTime(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    calendarDays.push({ date: key, count: catchByDay.get(key) ?? 0 });
  }
  const maxDayCount = Math.max(...calendarDays.map((d) => d.count), 1);

  // ── Catch patterns ───────────────────────────────────────────────────────
  const hourBuckets = [0, 0, 0, 0]; // dawn(4-8), morning(8-12), afternoon(12-17), evening(17-21)
  const dayBuckets = Array(7).fill(0); // Sun–Sat
  catches.forEach((c) => {
    const d = new Date(c.caught_at);
    const h = d.getHours();
    dayBuckets[d.getDay()]++;
    if (h >= 4 && h < 8)   hourBuckets[0]++;
    else if (h >= 8 && h < 12) hourBuckets[1]++;
    else if (h >= 12 && h < 17) hourBuckets[2]++;
    else if (h >= 17 && h < 21) hourBuckets[3]++;
  });
  const timeLabels = ["Dawn (4-8am)", "Morning (8am-noon)", "Afternoon (noon-5pm)", "Evening (5-9pm)"];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxHour = Math.max(...hourBuckets, 1);
  const maxDay = Math.max(...dayBuckets, 1);

  // Top bait by species
  const baitSpeciesMap: Record<string, Record<string, number>> = {};
  catches.forEach((c) => {
    const fish = c.fish_species as unknown as { id: string; name: string } | null;
    const bait = c.baits as unknown as { name: string } | null;
    if (!fish || !bait) return;
    baitSpeciesMap[fish.name] = baitSpeciesMap[fish.name] ?? {};
    baitSpeciesMap[fish.name][bait.name] = (baitSpeciesMap[fish.name][bait.name] ?? 0) + 1;
  });
  const topBaitBySpecies = Object.entries(baitSpeciesMap).map(([species, baits]) => ({
    species,
    bait: Object.entries(baits).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
  })).slice(0, 5);

  // ── Species breakdown ─────────────────────────────────────────────────────
  const speciesCount: Record<string, { name: string; count: number }> = {};
  catches.forEach((c) => {
    const f = c.fish_species as unknown as { id: string; name: string } | null;
    if (!f) return;
    speciesCount[f.id] = speciesCount[f.id] ?? { name: f.name, count: 0 };
    speciesCount[f.id].count++;
  });
  const topSpecies = Object.values(speciesCount).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxSpeciesCount = Math.max(...topSpecies.map((s) => s.count), 1);

  // ── Personal bests ────────────────────────────────────────────────────────
  const pbMap: Record<string, { name: string; weight: number; length: number | null; date: string; spotName: string | null }> = {};
  catches.forEach((c) => {
    const fish = c.fish_species as unknown as { id: string; name: string } | null;
    if (!fish || !c.weight_lbs) return;
    if (!pbMap[fish.id] || c.weight_lbs > pbMap[fish.id].weight) {
      pbMap[fish.id] = {
        name: fish.name,
        weight: c.weight_lbs,
        length: c.length_in,
        date: c.caught_at,
        spotName: (c.spots as unknown as { name: string } | null)?.name ?? null,
      };
    }
  });
  const personalBests = Object.values(pbMap).sort((a, b) => b.weight - a.weight);

  type SavedSpot = { id: string; name: string; water_type: string };
  const saved = (savedSpots ?? [])
    .map((s) => (s.spots as unknown as SavedSpot | null))
    .filter(Boolean) as SavedSpot[];

  // ── Badges ────────────────────────────────────────────────────────────────
  type Badge = { id: string; label: string; desc: string; earned: boolean; color: string };
  const BADGE_DEFS = [
    { id: "first_catch",  label: "First Cast",     desc: "Logged your first catch",          color: "text-blue-400 bg-blue-500/10 border-blue-500/25",       threshold: (c: typeof catches) => c.length >= 1 },
    { id: "five_catches", label: "Getting Hooked", desc: "Logged 5 catches",                 color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",       threshold: (c: typeof catches) => c.length >= 5 },
    { id: "25_catches",   label: "Reel Deal",      desc: "Logged 25 catches",                color: "text-violet-400 bg-violet-500/10 border-violet-500/25", threshold: (c: typeof catches) => c.length >= 25 },
    { id: "species_3",    label: "Species Hunter", desc: "Caught 3 different species",       color: "text-green-400 bg-green-500/10 border-green-500/25",    threshold: (c: typeof catches) => new Set(c.map(x => (x.fish_species as unknown as {id:string}|null)?.id).filter(Boolean)).size >= 3 },
    { id: "species_5",    label: "Taxonomist",     desc: "Caught 5 different species",       color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", threshold: (c: typeof catches) => new Set(c.map(x => (x.fish_species as unknown as {id:string}|null)?.id).filter(Boolean)).size >= 5 },
    { id: "big_fish",     label: "Trophy Hunter",  desc: "Caught a fish over 5 lbs",        color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", threshold: (c: typeof catches) => c.some(x => (x.weight_lbs ?? 0) >= 5) },
    { id: "lunker",       label: "Lunker",         desc: "Caught a fish over 10 lbs",       color: "text-orange-400 bg-orange-500/10 border-orange-500/25", threshold: (c: typeof catches) => c.some(x => (x.weight_lbs ?? 0) >= 10) },
    { id: "explorer",     label: "Explorer",       desc: "Fished at 3 different spots",      color: "text-sky-400 bg-sky-500/10 border-sky-500/25",          threshold: (c: typeof catches) => new Set(c.map(x => (x.spots as unknown as {id:string}|null)?.id).filter(Boolean)).size >= 3 },
    { id: "saver",        label: "Bookmarker",     desc: "Saved 3 spots",                   color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", threshold: () => saved.length >= 3 },
  ];
  const earnedBadges: Badge[] = BADGE_DEFS.map(b => ({ id: b.id, label: b.label, desc: b.desc, color: b.color, earned: b.threshold(catches) }));
  const hasAnyBadge = earnedBadges.some(b => b.earned);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-10 space-y-5">

      {/* ── Profile header ─────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl border border-white/8 bg-white/2 flex items-start gap-5">
        <Avatar
          url={profile?.avatar_url ?? null}
          username={profile?.username ?? "?"}
          size={72}
          className="shrink-0 border-2 border-blue-500/20"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{profile?.username}</h1>
            {isPro && <ProBadge />}
          </div>
          {profile?.bio && <p className="text-slate-400 text-sm mt-1 leading-relaxed">{profile.bio}</p>}
          {profile?.home_state && (
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
              <MapPin size={11} /> {profile.home_state}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
            <Calendar size={11} />
            Member since {new Date(profile?.created_at ?? "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>

          {/* Follow counts */}
          <div className="flex items-center gap-4 mt-3">
            <Link href={`/anglers/${user.id}/followers`} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              <span className="font-semibold text-white">{followerCount ?? 0}</span> followers
            </Link>
            <Link href={`/anglers/${user.id}/following`} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              <span className="font-semibold text-white">{followingCount ?? 0}</span> following
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Link href="/profile/edit" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors">
              <Pencil size={11} /> Edit Profile
            </Link>
            <Link href={`/anglers/${user.id}`} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors">
              <ExternalLink size={11} /> Public Profile
            </Link>
            <ShareButton title={`@${profile?.username} on HookLine`} text={`Check out my fishing profile on HookLine`} />
            <a href="/api/export/catches" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors">
              <Download size={11} /> Export CSV
            </a>
            {profile?.is_admin && (
              <Link href="/admin" className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 hover:text-violet-300 transition-colors">
                Admin Dashboard →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Catches", value: totalCatches, icon: Fish, color: "text-blue-400", bg: "bg-blue-600/10" },
          { label: "Species", value: uniqueSpecies, icon: Trophy, color: "text-violet-400", bg: "bg-violet-600/10" },
          { label: "Spots Fished", value: uniqueSpots, icon: MapPin, color: "text-cyan-400", bg: "bg-cyan-600/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-4 rounded-2xl border border-white/8 bg-white/2 text-center">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Secondary stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 text-center">
          <div className="w-9 h-9 rounded-xl bg-orange-600/10 flex items-center justify-center mx-auto mb-2">
            <Flame size={16} className="text-orange-400" />
          </div>
          <div className="text-xl font-bold text-white">{streak}</div>
          <div className="text-xs text-slate-500">Day Streak</div>
        </div>
        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 text-center">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/10 flex items-center justify-center mx-auto mb-2">
            <Scale size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{totalWeight > 0 ? `${totalWeight.toFixed(1)}` : "—"}</div>
          <div className="text-xs text-slate-500">Total lbs</div>
        </div>
        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 text-center">
          <div className="w-9 h-9 rounded-xl bg-sky-600/10 flex items-center justify-center mx-auto mb-2">
            <Route size={16} className="text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">{tripsCount ?? 0}</div>
          <div className="text-xs text-slate-500">Trips</div>
        </div>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/profile/logbook", label: "My Logbook",  icon: BookOpen,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40" },
          { href: "/trips",           label: "My Trips",    icon: Route,     color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20 hover:border-sky-500/40" },
          { href: "/profile/records", label: "Records",     icon: Trophy,    color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40" },
          { href: "/gear",            label: "Gear Tracker",icon: Package,   color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40" },
        ].map(({ href, label, icon: Icon, color, bg }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${bg}`}>
            <Icon size={18} className={color} />
            <span className="text-sm font-medium text-slate-200">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Pro subscription ──────────────────────────────────────── */}
      {isPro && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-white">HookLine Pro</p>
              <p className="text-xs text-slate-500">Active subscription</p>
            </div>
          </div>
          <Link href="/pro/manage" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors">
            <ExternalLink size={11} /> Manage
          </Link>
        </div>
      )}

      {/* ── Catches by month chart ─────────────────────────────────── */}
      {totalCatches > 0 && (
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-5">
            <BarChart3 size={14} className="text-blue-400" /> Catches — Last 12 Months
          </h2>
          <div className="flex items-end gap-1.5 h-24">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full rounded-t bg-blue-600/60 group-hover:bg-blue-500/80 transition-colors min-h-0.5"
                  style={{ height: `${Math.max((m.count / maxMonthCount) * 88, m.count > 0 ? 6 : 2)}px` }}
                  title={`${m.count} catch${m.count !== 1 ? "es" : ""}`}
                />
                <span className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fishing Calendar ─────────────────────────────────────────── */}
      {totalCatches > 0 && (
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            <Calendar size={14} className="text-violet-400" /> Fishing Calendar — Past Year
            {!isPro && <span className="ml-auto"><ProBadge /></span>}
          </h2>
          {isPro ? (
            <div className="overflow-x-auto">
              <div className="flex gap-px" style={{ minWidth: "min-content" }}>
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-px">
                    {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((day) => {
                      const intensity = day.count === 0 ? 0 : Math.ceil((day.count / maxDayCount) * 4);
                      const bg = ["bg-white/4", "bg-blue-900/60", "bg-blue-700/70", "bg-blue-500/80", "bg-blue-400"][intensity];
                      return (
                        <div
                          key={day.date}
                          title={`${day.date}: ${day.count} catch${day.count !== 1 ? "es" : ""}`}
                          className={`w-3 h-3 rounded-sm ${bg} cursor-default`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-2">
                {calendarDays.filter((d) => d.count > 0).length} active fishing days in the past year
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="blur-sm pointer-events-none overflow-x-auto select-none">
                <div className="flex gap-px" style={{ minWidth: "min-content" }}>
                  {Array.from({ length: 52 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-px">
                      {[0.9, 0.85, 0.7, 0.8, 0.75, 0.85, 0.9].map((_, d) => (
                        <div key={d} className={`w-3 h-3 rounded-sm ${(weekIdx + d) % 5 === 0 ? "bg-blue-500/60" : "bg-white/4"}`} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <p className="text-sm text-white font-medium">Pro feature</p>
                <Link href="/pro" className="text-xs text-amber-400 hover:text-amber-300 underline">Upgrade to unlock</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Catch Pattern Analysis (Pro) ──────────────────────────────── */}
      {totalCatches >= 5 && (
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            <Target size={14} className="text-cyan-400" /> Catch Patterns
            {!isPro && <span className="ml-auto"><ProBadge /></span>}
          </h2>
          {isPro ? (
            <div className="space-y-5">
              {/* Time of day */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5"><Clock size={11} /> Best time of day</p>
                <div className="space-y-1.5">
                  {timeLabels.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-linear-to-r from-cyan-600 to-blue-500" style={{ width: `${(hourBuckets[i] / maxHour) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-600 w-6 text-right">{hourBuckets[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Day of week */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5"><Calendar size={11} /> Best day of week</p>
                <div className="flex gap-1.5 items-end h-12">
                  {dayBuckets.map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-violet-600/60 min-h-0.5 transition-all"
                        style={{ height: `${Math.max((count / maxDay) * 40, count > 0 ? 4 : 2)}px` }}
                      />
                      <span className="text-[9px] text-slate-600">{dayLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Best bait by species */}
              {topBaitBySpecies.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5"><Fish size={11} /> Best bait per species</p>
                  <div className="space-y-1.5">
                    {topBaitBySpecies.map(({ species, bait }) => (
                      <div key={species} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300">{species}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-500">{bait}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative min-h-32">
              <div className="blur-sm pointer-events-none select-none space-y-3">
                {timeLabels.map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-36">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-600/60" style={{ width: `${Math.random() * 80 + 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <p className="text-sm text-white font-medium">Pro feature</p>
                <Link href="/pro" className="text-xs text-amber-400 hover:text-amber-300 underline">Upgrade to unlock</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Species breakdown ──────────────────────────────────────── */}
      {topSpecies.length > 0 && (
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            <Fish size={14} className="text-cyan-400" /> Top Species
          </h2>
          <div className="space-y-3">
            {topSpecies.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-sm text-slate-300 w-28 shrink-0 truncate">{s.name}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-600 to-cyan-500 transition-all"
                    style={{ width: `${(s.count / maxSpeciesCount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements ───────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          <Trophy size={14} className="text-yellow-400" /> Achievements
        </h2>
        <div className="flex flex-wrap gap-2">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-opacity ${
                badge.earned ? badge.color : "text-slate-600 bg-white/3 border-white/8 opacity-50"
              }`}
              title={badge.earned ? badge.desc : `Locked: ${badge.desc}`}
            >
              <span className="text-base">{badge.earned ? "🏅" : "🔒"}</span>
              <div>
                <div className="font-semibold">{badge.label}</div>
                <div className="opacity-70 font-normal">{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
        {!hasAnyBadge && (
          <p className="text-xs text-slate-600 mt-2">Start logging catches to unlock badges.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal bests */}
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            <Trophy size={14} className="text-yellow-400" /> Personal Bests
          </h2>
          {personalBests.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 text-slate-600 text-sm">
              Log catches with weight to track personal bests.
            </div>
          ) : (
            <div className="space-y-2">
              {personalBests.map((pb) => (
                <div key={pb.name} className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-200">{pb.name}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {pb.spotName && <span>{pb.spotName} · </span>}
                      {new Date(pb.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <Scale size={12} className="text-blue-400" /> {pb.weight} lbs
                    </div>
                    {pb.length && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 justify-end mt-0.5">
                        <Ruler size={10} /> {pb.length}&quot;
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved spots */}
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            <Bookmark size={14} className="text-blue-400" /> Saved Spots
          </h2>
          {saved.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 text-slate-600 text-sm">
              Save spots to access them quickly.
              <br />
              <Link href="/map" className="text-blue-500 hover:text-blue-400 mt-1 inline-block">Browse the map →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {saved.map((s) => (
                <Link
                  key={s.id}
                  href={`/spots/${s.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-blue-500/30 transition-all group"
                >
                  <MapPin size={14} className="text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{s.name}</div>
                    <div className="text-xs text-slate-600 capitalize">{s.water_type}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent catches */}
      {catches.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            <Fish size={14} className="text-blue-400" /> Recent Catches
          </h2>
          <div className="space-y-2">
            {catches.slice(0, 10).map((c) => {
              const fish = c.fish_species as unknown as { id: string; name: string } | null;
              const spot = c.spots as unknown as { id: string; name: string } | null;
              const bait = c.baits as unknown as { name: string } | null;
              return (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/2">
                  {c.photo_url && (
                    <ClickablePhoto
                      src={c.photo_url}
                      alt={`${(c.fish_species as unknown as { name: string } | null)?.name ?? "catch"} photo`}
                      className="w-12 h-12 object-cover rounded-lg border border-white/10"
                      thumbClassName="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-200">{fish?.name ?? "Unknown"}</span>
                      {bait && <span className="text-xs text-slate-600">on {bait.name}</span>}
                      {c.is_private && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/70 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <Lock size={9} /> Private
                        </span>
                      )}
                    </div>
                    {spot && (
                      <Link href={`/spots/${spot.id}`} className="text-xs text-blue-500 hover:text-blue-400 mt-0.5 block">
                        {spot.name}
                      </Link>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    {c.weight_lbs && <div className="text-sm text-slate-300">{c.weight_lbs} lbs</div>}
                    {c.length_in && <div className="text-xs text-slate-600">{c.length_in}&quot;</div>}
                    <div className="text-xs text-slate-700">
                      {new Date(c.caught_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <CatchActions
                    catchId={c.id}
                    spotId={spot?.id ?? ""}
                    isPrivate={!!(c as unknown as { is_private?: boolean }).is_private}
                    catchData={{
                      id: c.id,
                      caught_at: c.caught_at,
                      weight_lbs: c.weight_lbs,
                      length_in: c.length_in,
                      notes: c.notes,
                      fish_id: c.fish_id ?? fish?.id ?? "",
                      spot_id: c.spot_id ?? spot?.id ?? "",
                      bait_id: c.bait_id ?? null,
                    }}
                    fishName={fish?.name ?? "Unknown"}
                    spotName={spot?.name ?? ""}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
