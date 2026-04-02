import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: spot } = await supabase
    .from("spots")
    .select("name, description, state, water_type, photo_url")
    .eq("id", id)
    .single();
  if (!spot) return { title: "Spot — HookLine" };
  const title = `${spot.name} — HookLine`;
  const description = spot.description ?? `A ${spot.water_type} fishing spot${spot.state ? ` in ${spot.state}` : ""} on HookLine.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(spot.photo_url ? { images: [{ url: spot.photo_url }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
import { MapPin, Fish, ArrowLeft, Waves, Navigation, Wind, ShieldCheck, Sparkles, Clock, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import CatchesList from "@/components/CatchesList";
import SaveSpotButton from "@/components/SaveSpotButton";
import FishingReportForm from "@/components/FishingReportForm";
import FishingReportsList from "@/components/FishingReportsList";
import WeatherWidget from "@/components/WeatherWidget";
import USGSGauge from "@/components/USGSGauge";
import SpotRating from "@/components/SpotRating";
import SpotComments from "@/components/SpotComments";
import SpotVerifyButton from "@/components/SpotVerifyButton";
import AddToTripButton from "@/components/AddToTripButton";
import ShareButton from "@/components/ShareButton";
import SolunarWidget from "@/components/SolunarWidget";
import SpotPhotoGallery from "@/components/SpotPhotoGallery";
import ProBadge from "@/components/ProBadge";

export default async function SpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: spot },
    { data: catches },
    { data: reports },
    { data: ratingsRaw },
    { data: commentsRaw },
    { data: verificationsRaw },
  ] = await Promise.all([
    supabase.from("spots")
      .select("*, spot_fish(fish_species(id, name, description))")
      .eq("id", id).single(),
    supabase.from("catches")
      .select("*, fish_species(name), baits(name, type), profiles!user_id(username)")
      .eq("spot_id", id)
      .order("caught_at", { ascending: false })
      .limit(20),
    supabase.from("fishing_reports")
      .select("id, activity_level, water_clarity, water_temp_f, body, created_at, profiles!user_id(username)")
      .eq("spot_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("spot_ratings")
      .select("rating, user_id")
      .eq("spot_id", id),
    supabase.from("spot_comments")
      .select("id, body, created_at, user_id, profiles!user_id(username)")
      .eq("spot_id", id)
      .order("created_at", { ascending: true })
      .limit(100),
    supabase.from("spot_verifications")
      .select("user_id")
      .eq("spot_id", id),
  ]);

  if (!spot) notFound();

  // Check pro status
  let isPro = false;
  if (user) {
    const { data: p } = await supabase.from("profiles").select("is_pro").eq("id", user.id).single();
    isPro = !!(p as unknown as { is_pro?: boolean } | null)?.is_pro;
  }

  // Check if user saved this spot + fetch trips
  let isSaved = false;
  let userTrips: { id: string; name: string }[] = [];
  let tripIdsWithSpot: string[] = [];
  if (user) {
    const [{ data: savedData }, { data: tripsData }, { data: tripSpotData }] = await Promise.all([
      supabase.from("saved_spots").select("spot_id").eq("user_id", user.id).eq("spot_id", id).single(),
      supabase.from("trips").select("id, name").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("trip_spots").select("trip_id").eq("spot_id", id),
    ]);
    isSaved = !!savedData;
    userTrips = tripsData ?? [];
    const userTripIds = new Set(userTrips.map((t) => t.id));
    tripIdsWithSpot = (tripSpotData ?? []).map((ts) => ts.trip_id).filter((tid) => userTripIds.has(tid));
  }

  // Tally top baits
  const baitCounts: Record<string, { name: string; count: number }> = {};
  catches?.forEach((c) => {
    if (c.baits) {
      const key = c.baits.name;
      baitCounts[key] = baitCounts[key] ?? { name: key, count: 0 };
      baitCounts[key].count++;
    }
  });
  const topBaits = Object.values(baitCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // ── Pro spot analytics ───────────────────────────────────────────────────
  const timeSlots = [0, 0, 0, 0]; // dawn, morning, afternoon, evening
  const monthSlots = Array(12).fill(0);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  let thisMonthCount = 0;
  let lastMonthCount = 0;

  catches?.forEach((c) => {
    const d = new Date((c as unknown as { caught_at: string }).caught_at);
    const h = d.getHours();
    if (h >= 4 && h < 8) timeSlots[0]++;
    else if (h >= 8 && h < 12) timeSlots[1]++;
    else if (h >= 12 && h < 17) timeSlots[2]++;
    else if (h >= 17 && h < 21) timeSlots[3]++;
    monthSlots[d.getMonth()]++;
    if (d >= thisMonthStart) thisMonthCount++;
    else if (d >= lastMonthStart) lastMonthCount++;
  });
  const timeLabels = ["Dawn (4–8am)", "Morning (8am–noon)", "Afternoon (noon–5pm)", "Evening (5–9pm)"];
  const maxTimeSlot = Math.max(...timeSlots, 1);
  const bestTimeIdx = timeSlots.indexOf(Math.max(...timeSlots));
  const catchTrend = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : null;
  const MONTH_ABBRS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const maxMonthSlot = Math.max(...monthSlots, 1);

  const fish = spot.spot_fish
    .map((sf: { fish_species: { id: string; name: string; description: string | null } | null }) => sf.fish_species)
    .filter(Boolean);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;

  // Most recent report for the activity badge
  const latestReport = reports?.[0] ?? null;
  const ACTIVITY_BADGE: Record<string, string> = {
    slow:     "text-slate-400  bg-slate-500/10  border-slate-500/20",
    moderate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    good:     "text-green-400  bg-green-500/10  border-green-500/20",
    hot:      "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  // Ratings
  const ratings = ratingsRaw ?? [];
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : null;
  const userRating = user ? (ratings.find((r) => r.user_id === user.id)?.rating ?? null) : null;

  // Comments
  type Comment = { id: string; body: string; created_at: string; user_id: string; profiles: { username: string } | null };
  const comments = (commentsRaw ?? []) as unknown as Comment[];

  // Verifications
  const verifications = verificationsRaw ?? [];
  const verificationCount = verifications.length;
  const userVerified = user ? verifications.some((v) => v.user_id === user.id) : false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/spots" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to spots
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-3xl font-bold text-white">{spot.name}</h1>
              {latestReport && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${ACTIVITY_BADGE[latestReport.activity_level] ?? ACTIVITY_BADGE.moderate} capitalize`}>
                  {latestReport.activity_level === "hot" ? "🔥 Hot" : latestReport.activity_level}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <span className="inline-flex items-center gap-1.5 capitalize">
                <Waves size={13} />{spot.water_type}
              </span>
              {spot.state && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} />{spot.state}
                  </span>
                </>
              )}
              <span className="text-slate-700">·</span>
              <span className="text-slate-600">
                {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
              </span>
            </div>

            {/* Rating */}
            <div className="mt-3">
              <SpotRating
                spotId={id}
                avgRating={avgRating}
                totalRatings={ratings.length}
                userRating={userRating}
                canRate={!!user}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {user && <SaveSpotButton spotId={id} initialSaved={isSaved} />}
            <ShareButton title={spot.name} text={`Check out ${spot.name} on HookLine`} />
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              <Navigation size={12} /> Directions
            </a>
          </div>
        </div>

        {/* Verification */}
        {user && (
          <div className="mt-3">
            <SpotVerifyButton
              spotId={id}
              isVerified={userVerified}
              verificationCount={verificationCount}
            />
          </div>
        )}
        {!user && verificationCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400/70">
            <ShieldCheck size={13} />
            Verified by {verificationCount} angler{verificationCount !== 1 ? "s" : ""}
          </div>
        )}

        {spot.description && (
          <p className="text-slate-400 leading-relaxed mt-3">{spot.description}</p>
        )}
        {spot.access_notes && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wide mb-1">Access Notes</p>
            <p className="text-sm text-slate-400">{spot.access_notes}</p>
          </div>
        )}
      </div>

      {spot.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={spot.photo_url} alt={spot.name} className="w-full h-56 object-cover rounded-2xl border border-white/8 mb-6" />
      )}

      {/* Community photo gallery */}
      <SpotPhotoGallery
        spotId={id}
        canUpload={!!user}
        currentUserId={user?.id ?? null}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {fish.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Fish size={13} className="text-blue-400" /> Fish Species
            </h2>
            <div className="flex flex-wrap gap-2">
              {fish.map((f: { id: string; name: string }) => (
                <Link
                  key={f.id}
                  href={`/fish/${f.id}`}
                  className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-200 border border-blue-500/20 text-sm hover:bg-blue-500/20 transition-colors"
                >
                  {f.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {topBaits.length > 0 && (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Top Baits</h2>
            <div className="space-y-2">
              {topBaits.map((bait, i) => (
                <div key={bait.name} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-blue-600 w-4">#{i + 1}</span>
                  <span className="text-sm text-slate-300 flex-1">{bait.name}</span>
                  <span className="text-xs text-slate-600">{bait.count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Pro Spot Intel ─────────────────────────────────────────── */}
      {catches && catches.length >= 3 && (
        <div className="mb-6 p-5 rounded-2xl border border-amber-500/15 bg-amber-500/4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-400/90 uppercase tracking-wide">Spot Intel</h2>
            <ProBadge className="ml-1" />
            {!isPro && (
              <Link href="/pro" className="ml-auto text-xs text-amber-400/70 hover:text-amber-300 underline">
                Unlock →
              </Link>
            )}
          </div>
          {isPro ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Best time of day */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                  <Clock size={10} /> Best time to fish here
                </p>
                <div className="space-y-1.5">
                  {timeLabels.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`text-[10px] w-28 shrink-0 ${i === bestTimeIdx ? "text-amber-400 font-semibold" : "text-slate-600"}`}>{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${i === bestTimeIdx ? "bg-amber-500/70" : "bg-white/15"}`}
                          style={{ width: `${(timeSlots[i] / maxTimeSlot) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-700 w-4 text-right">{timeSlots[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Monthly activity */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                  <TrendingUp size={10} /> Activity by month
                  {catchTrend !== null && (
                    <span className={`ml-1 ${catchTrend > 0 ? "text-green-400" : catchTrend < 0 ? "text-red-400" : "text-slate-500"}`}>
                      {catchTrend > 0 ? <TrendingUp size={9} className="inline" /> : <TrendingDown size={9} className="inline" />}
                      {" "}{Math.abs(catchTrend)}% this month
                    </span>
                  )}
                </p>
                <div className="flex gap-px items-end h-10">
                  {monthSlots.map((count, i) => (
                    <div key={i} title={`${MONTH_ABBRS[i]}: ${count}`} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-t min-h-px ${i === now.getMonth() ? "bg-amber-500/60" : "bg-white/20"}`}
                        style={{ height: `${Math.max((count / maxMonthSlot) * 36, count > 0 ? 3 : 1)}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-px mt-0.5">
                  {MONTH_ABBRS.map((m, i) => (
                    <div key={m} className={`flex-1 text-center text-[8px] ${i === now.getMonth() ? "text-amber-400" : "text-slate-700"}`}>{m[0]}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="blur-sm pointer-events-none select-none space-y-2">
                {timeLabels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 w-28">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500/40" style={{ width: `${[70, 40, 85, 55][i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <Sparkles size={13} className="text-amber-400" />
                <span className="text-sm text-white font-medium">Pro insight hidden</span>
                <Link href="/pro" className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors">
                  Unlock
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log catch CTA + trip */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {user ? (
          <>
            <Link
              href={`/log-catch?spot=${spot.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25"
            >
              <Fish size={15} /> Log a Catch Here
            </Link>
            <AddToTripButton spotId={id} trips={userTrips} tripIdsWithSpot={tripIdsWithSpot} />
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 text-sm transition-colors"
          >
            Sign in to log a catch or post conditions
          </Link>
        )}
      </div>

      {/* Weather + Solunar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <WeatherWidget lat={spot.latitude} lng={spot.longitude} spotName={spot.name} />
        <SolunarWidget lng={spot.longitude} />
      </div>

      {/* USGS stream gauge — only for rivers and streams */}
      {(spot.water_type === "river" || spot.water_type === "stream") && (
        <div className="mb-6">
          <USGSGauge lat={Number(spot.latitude)} lng={Number(spot.longitude)} />
        </div>
      )}

      {/* Fishing reports */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
          <Wind size={14} className="text-cyan-400" /> Conditions Reports
          {reports && reports.length > 0 && (
            <span className="text-slate-700 font-normal normal-case text-xs">({reports.length})</span>
          )}
        </h2>
        {user && <div className="mb-3"><FishingReportForm spotId={id} /></div>}
        <FishingReportsList reports={(reports ?? []) as unknown as Parameters<typeof FishingReportsList>[0]["reports"]} />
      </div>

      {/* Comments */}
      <div className="mb-8 p-5 rounded-2xl border border-white/8 bg-white/2">
        <SpotComments
          spotId={id}
          comments={comments}
          currentUserId={user?.id ?? null}
        />
      </div>

      <CatchesList catches={catches ?? []} />
    </div>
  );
}
