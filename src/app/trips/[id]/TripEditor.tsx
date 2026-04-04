"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, Utensils, Wrench, CheckSquare, Fish, X, Plus, Globe, Lock,
  Check, Share2, Copy, Waves, Zap, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { updateTrip, addSpotToTrip, removeSpotFromTrip } from "@/lib/actions/trips";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toaster";
import { computeFishingScore, scoreLabel } from "@/lib/fishingScore";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { ProLockSection } from "@/components/ProGate";
import TripIntelligence from "@/components/TripIntelligence";

type Species = { id: string; name: string };
type Spot = { id: string; name: string; water_type: string; state: string | null; longitude: number | null };
type ChecklistItem = { text: string; done: boolean };
type Trip = {
  id: string;
  name: string;
  description: string | null;
  planned_date: string | null;
  bait_plan: string | null;
  gear_notes: string | null;
  checklist: ChecklistItem[];
  target_species: string[] | null;
  is_public: boolean;
  user_id: string;
};

const DEFAULT_CHECKLIST = [
  "Fishing license",
  "Rods & reels",
  "Tackle box",
  "Bait",
  "Sunscreen",
  "Snacks & water",
  "First aid kit",
  "Net",
];

function fmtHour(h: number) {
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = Math.floor(h) % 12 || 12;
  const min = (h % 1) * 60;
  return min ? `${h12}:${String(min).padStart(2, "0")} ${ap}` : `${h12} ${ap}`;
}

function getSolunarWindows(lng: number, dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  const peaks: { hour: number; score: number }[] = [];
  for (let h = 4; h <= 22; h += 0.5) {
    const t = new Date(date);
    t.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
    const s = computeFishingScore(lng, t);
    if (s >= 3) peaks.push({ hour: h, score: s });
  }
  peaks.sort((a, b) => b.score - a.score);
  const result: typeof peaks = [];
  for (const p of peaks) {
    if (result.every((r) => Math.abs(r.hour - p.hour) > 1)) {
      result.push(p);
      if (result.length === 3) break;
    }
  }
  return result.sort((a, b) => a.hour - b.hour);
}

interface Props {
  trip: Trip;
  tripSpots: Spot[];
  allSpecies: Species[];
  isPro: boolean;
}

export default function TripEditor({ trip, tripSpots, allSpecies, isPro }: Props) {
  const { toast } = useToast();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  // Editable fields
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description ?? "");
  const [plannedDate, setPlannedDate] = useState(trip.planned_date ?? "");
  const [baitPlan, setBaitPlan] = useState(trip.bait_plan ?? "");
  const [gearNotes, setGearNotes] = useState(trip.gear_notes ?? "");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    trip.checklist?.length ? trip.checklist : DEFAULT_CHECKLIST.map((t) => ({ text: t, done: false }))
  );
  const [targetSpecies, setTargetSpecies] = useState<string[]>(trip.target_species ?? []);
  const [isPublic, setIsPublic] = useState(trip.is_public);
  const [copied, setCopied] = useState(false);

  // All available spots (loaded once)
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [spots, setSpots] = useState<Spot[]>(tripSpots);
  const [spotPickerId, setSpotPickerId] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");

  // Load all approved spots on mount
  useEffect(() => {
    supabase
      .from("spots")
      .select("id, name, water_type, state, longitude")
      .eq("approved", true)
      .order("name")
      .then(({ data }) => { if (data) setAllSpots(data as Spot[]); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback((patch: Parameters<typeof updateTrip>[1]) => {
    startTransition(async () => {
      try {
        await updateTrip(trip.id, patch);
      } catch {
        toast("Failed to save", "error");
      }
    });
  }, [trip.id, toast]);

  // Spot picker options — exclude already-added spots
  const spotOptions = allSpots
    .filter((s) => !spots.find((sp) => sp.id === s.id))
    .map((s) => ({
      id: s.id,
      label: s.name,
      sub: [s.water_type, s.state].filter(Boolean).join(" · "),
    }));

  async function addSpot(spotId: string) {
    if (!spotId) return;
    const spot = allSpots.find((s) => s.id === spotId);
    if (!spot) return;
    setSpots((prev) => [...prev, spot]);
    setSpotPickerId("");
    await addSpotToTrip(trip.id, spot.id);
  }

  async function removeSpot(spotId: string) {
    setSpots((prev) => prev.filter((s) => s.id !== spotId));
    await removeSpotFromTrip(trip.id, spotId);
  }

  function toggleSpecies(id: string) {
    const next = targetSpecies.includes(id)
      ? targetSpecies.filter((s) => s !== id)
      : [...targetSpecies, id];
    setTargetSpecies(next);
    save({ target_species: next });
  }

  function toggleCheck(i: number) {
    const next = checklist.map((c, idx) => idx === i ? { ...c, done: !c.done } : c);
    setChecklist(next);
    save({ checklist: next });
  }

  function addCheckItem() {
    const text = newCheckItem.trim();
    if (!text) return;
    const next = [...checklist, { text, done: false }];
    setChecklist(next);
    setNewCheckItem("");
    save({ checklist: next });
  }

  function removeCheckItem(i: number) {
    const next = checklist.filter((_, idx) => idx !== i);
    setChecklist(next);
    save({ checklist: next });
  }

  function togglePublic() {
    const next = !isPublic;
    setIsPublic(next);
    save({ is_public: next });
    if (next) toast("Trip is now public — anyone with the link can view it", "success");
    else toast("Trip set to private", "info");
  }

  function copyLink() {
    const url = `${window.location.origin}/trips/share/${trip.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Solunar for first spot with coords on planned date
  const firstSpotWithCoords = spots.find((s) => s.longitude != null);
  const solunarWindows = firstSpotWithCoords?.longitude && plannedDate
    ? getSolunarWindows(firstSpotWithCoords.longitude, plannedDate)
    : [];

  const targetSpeciesNames = allSpecies.filter((s) => targetSpecies.includes(s.id)).map((s) => s.name);
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="flex flex-col gap-5">

      {/* Trip header card */}
      <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => save({ name: name.trim() || trip.name })}
            className="text-2xl font-bold text-white bg-transparent border-none outline-none focus:bg-white/4 rounded-lg px-1 -mx-1 transition-colors w-full"
            placeholder="Trip name"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Trip Date</label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                onBlur={() => save({ planned_date: plannedDate || null })}
                className="w-full px-3 py-2 rounded-lg bg-white/4 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors scheme-dark"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Notes</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => save({ description: description || null })}
                placeholder="Quick trip notes..."
                className="w-full px-3 py-2 rounded-lg bg-white/4 border border-white/10 text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Share toggle */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/6">
          {isPro ? (
            <>
              <button
                onClick={togglePublic}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  isPublic
                    ? "bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                {isPublic ? <Globe size={13} /> : <Lock size={13} />}
                {isPublic ? "Public" : "Private"}
              </button>
              {isPublic && (
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              )}
              {isPublic && (
                <Link
                  href={`/trips/share/${trip.id}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                >
                  <Share2 size={13} /> Preview
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/pro"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-amber-500/25 bg-amber-500/8 text-amber-400 hover:bg-amber-500/15 transition-colors"
            >
              <Globe size={13} /> Share trip <span className="text-[10px] font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-full ml-0.5">PRO</span>
            </Link>
          )}
          <span className="text-xs text-slate-600 ml-auto">
            {isPending ? "Saving..." : "Auto-saved"}
          </span>
        </div>
      </div>

      {/* Solunar intel (Pro) */}
      {isPro && solunarWindows.length > 0 && (
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <h3 className="text-xs font-semibold text-blue-400/80 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Zap size={11} /> Solunar Forecast · {new Date(plannedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </h3>
          <div className="flex flex-col gap-2">
            {solunarWindows.map((w, i) => {
              const sl = scoreLabel(w.score);
              return (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-medium">{fmtHour(w.hour)}</span>
                  <div className="flex items-center gap-2 flex-1 mx-4">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w.score * 10}%`, background: sl.color }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold w-16 text-right" style={{ color: sl.color }}>{sl.label} · {w.score}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-2">Based on coords from {firstSpotWithCoords!.name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Target Species */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Fish size={11} /> Target Species
          </h3>
          {targetSpeciesNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {targetSpeciesNames.map((n, i) => (
                <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300">
                  {n}
                  <button onClick={() => toggleSpecies(allSpecies.find((s) => s.name === n)!.id)} className="text-blue-400/60 hover:text-blue-300 ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <SpeciesDropdown allSpecies={allSpecies} selected={targetSpecies} onToggle={toggleSpecies} />
          {targetSpeciesNames.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/6 flex flex-wrap gap-1.5">
              {targetSpeciesNames.map((n) => (
                <Link
                  key={n}
                  href={`/target/${allSpecies.find((s) => s.name === n)?.id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  → {n} intel
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Spots */}
        <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <MapPin size={11} /> Spots ({spots.length})
          </h3>
          {spots.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {spots.map((spot, i) => (
                <div key={spot.id} className="flex items-center gap-2 group">
                  <span className="text-xs text-slate-700 w-4">{i + 1}</span>
                  <Link href={`/spots/${spot.id}`} className="flex-1 text-sm text-slate-300 hover:text-white transition-colors truncate">
                    {spot.name}
                    <span className="text-slate-600 ml-1.5 capitalize text-xs">{spot.water_type}</span>
                  </Link>
                  <button
                    onClick={() => removeSpot(spot.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {spotOptions.length > 0 ? (
            <SearchableSelect
              options={spotOptions}
              value={spotPickerId}
              onChange={(id) => { setSpotPickerId(id); if (id) addSpot(id); }}
              placeholder="Search lakes, rivers, ponds..."
              addNewHref="/spots/submit"
              addNewLabel="Submit a new spot"
            />
          ) : allSpots.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/4 border border-white/10">
              <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-600">Loading spots...</span>
            </div>
          ) : (
            <p className="text-xs text-slate-600 py-2">All available spots added</p>
          )}
          {spots.length > 0 && (
            <Link href="/spots" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2 block">
              → Browse all spots on map
            </Link>
          )}
        </div>

        {/* Bait Plan */}
        {isPro ? (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Utensils size={11} /> Bait Plan
            </h3>
            <textarea
              value={baitPlan}
              onChange={(e) => setBaitPlan(e.target.value)}
              onBlur={() => save({ bait_plan: baitPlan || null })}
              placeholder={"What baits & lures are you bringing?\n\nExample:\n• Senkos (green pumpkin, watermelon)\n• Ned rigs\n• Topwater frogs\n• Crankbaits for deeper structure"}
              rows={6}
              className="w-full bg-transparent text-sm text-slate-300 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed"
            />
          </div>
        ) : (
          <ProLockSection label="Bait Plan">
            <div className="p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Utensils size={11} /> Bait Plan
              </h3>
              <div className="h-24 rounded-lg bg-white/4 border border-white/10" />
            </div>
          </ProLockSection>
        )}

        {/* Gear Notes */}
        {isPro ? (
          <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Wrench size={11} /> Gear & Setup
            </h3>
            <textarea
              value={gearNotes}
              onChange={(e) => setGearNotes(e.target.value)}
              onBlur={() => save({ gear_notes: gearNotes || null })}
              placeholder={"Rod/reel combos, line, leader setups...\n\nExample:\n• 7' medium heavy spinning — 15lb braid + 10lb fluoro leader\n• Finesse rod — 8lb fluoro, drop shot\n• Baitcaster — 50lb braid, frog setup"}
              rows={6}
              className="w-full bg-transparent text-sm text-slate-300 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed"
            />
            <Link href="/gear" className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2 block">
              → View saved gear setups
            </Link>
          </div>
        ) : (
          <ProLockSection label="Gear & Setup Notes">
            <div className="p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Wrench size={11} /> Gear & Setup
              </h3>
              <div className="h-24 rounded-lg bg-white/4 border border-white/10" />
            </div>
          </ProLockSection>
        )}
      </div>

      {/* Trip Intelligence — Pro only */}
      {isPro && (
        <TripIntelligence
          spots={spots}
          targetSpeciesIds={targetSpecies}
          allSpecies={allSpecies}
          plannedDate={plannedDate}
        />
      )}

      {/* Packing Checklist */}
      {!isPro ? (
        <ProLockSection label="Packing Checklist">
          <div className="p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <CheckSquare size={11} /> Packing Checklist
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_CHECKLIST.slice(0, 4).map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/20" />
                  <span className="text-sm text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ProLockSection>
      ) : null}
      {isPro && <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5">
            <CheckSquare size={11} /> Packing Checklist
          </span>
          <span className="text-slate-600 font-normal normal-case text-xs">{doneCount}/{checklist.length} packed</span>
        </h3>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-white/6 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: checklist.length ? `${(doneCount / checklist.length) * 100}%` : "0%" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <button
                onClick={() => toggleCheck(i)}
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                  item.done
                    ? "bg-green-500 border-green-500"
                    : "bg-transparent border-white/20 hover:border-green-500/50"
                }`}
              >
                {item.done && <Check size={10} className="text-white" />}
              </button>
              <span className={`text-sm flex-1 transition-colors ${item.done ? "line-through text-slate-600" : "text-slate-300"}`}>
                {item.text}
              </span>
              <button
                onClick={() => removeCheckItem(i)}
                className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newCheckItem}
            onChange={(e) => setNewCheckItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCheckItem(); } }}
            placeholder="Add item..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/4 border border-white/10 text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={addCheckItem}
            className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-slate-300 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>}
    </div>
  );
}

function SpeciesDropdown({ allSpecies, selected, onToggle }: {
  allSpecies: Species[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = allSpecies.filter((s) =>
    !q || s.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
      >
        <Plus size={11} /> Add species {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-white/12 bg-[#0b1628] shadow-xl z-10 overflow-hidden">
          <div className="p-2 border-b border-white/8">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search species..."
              className="w-full px-2 py-1.5 bg-white/5 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => { onToggle(s.id); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/6 transition-colors flex items-center gap-2"
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selected.includes(s.id) ? "bg-blue-500 border-blue-500" : "border-white/20"}`}>
                  {selected.includes(s.id) && <Check size={9} className="text-white" />}
                </div>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
