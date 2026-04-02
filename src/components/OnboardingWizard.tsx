"use client";

import { useState, useTransition } from "react";
import { Fish, MapPin, ChevronRight, Check, Waves, ArrowLeft, Sparkles } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

interface Props {
  username: string;
  species: { id: string; name: string }[];
}

export default function OnboardingWizard({ username, species }: Props) {
  const [step, setStep] = useState(0);
  const [homeState, setHomeState] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const TOTAL_STEPS = 2; // steps 1 & 2 (step 0 is welcome)

  function toggleSpecies(id: string) {
    setSelectedSpecies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      const fd = new FormData();
      if (homeState) fd.append("home_state", homeState);
      selectedSpecies.forEach((id) => fd.append("species_ids", id));
      await completeOnboarding(fd);
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Fish className="text-blue-400" size={14} />
          </div>
          <span className="font-bold text-white text-sm">HookLine</span>
        </div>

        {step > 0 && (
          <div className="flex items-center gap-2">
            {[1, 2].map((i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? "bg-blue-500 w-10" : "bg-white/10 w-5"}`} />
            ))}
            <span className="text-xs text-slate-600 ml-1">{step}/{TOTAL_STEPS}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* ── Step 0: Welcome ─────────────────────────────── */}
          {step === 0 && (
            <div className="text-center">
              {/* Animated icon cluster */}
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-blue-600/15 animate-pulse" />
                <div className="absolute inset-3 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Fish className="text-blue-400" size={48} />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-base">🎣</div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-base">🏆</div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-3">
                Welcome, {username}!
              </h1>
              <p className="text-slate-400 mb-2 text-lg leading-relaxed">
                You&apos;re now part of the HookLine community.
              </p>
              <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto">
                Let&apos;s personalize your experience in two quick steps so we can show you the right spots and catches.
              </p>

              {/* What you'll unlock */}
              <div className="grid grid-cols-3 gap-3 mb-10 text-center">
                {[
                  { emoji: "🗺️", label: "Nearby spots" },
                  { emoji: "📊", label: "Catch tracking" },
                  { emoji: "👥", label: "Community" },
                ].map(({ emoji, label }) => (
                  <div key={label} className="p-3 rounded-xl bg-white/4 border border-white/8">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base transition-all hover:shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Let&apos;s set up your profile <ChevronRight size={18} />
              </button>
              <p className="text-slate-600 text-xs mt-3">Takes about 30 seconds · Can be changed anytime</p>
            </div>
          )}

          {/* ── Step 1: Home state ──────────────────────────── */}
          {step === 1 && (
            <div>
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <MapPin className="text-blue-400" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Where do you fish?</h2>
                  <p className="text-slate-500 text-sm">Your home state</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-6 pl-13">
                We&apos;ll highlight spots, regulations, and anglers in your area.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6 max-h-72 overflow-y-auto pr-1">
                {US_STATES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHomeState(s === homeState ? "" : s)}
                    className={`px-3 py-2.5 rounded-xl text-sm text-left font-medium transition-all border ${
                      homeState === s
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-white/4 border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/15"
                    }`}
                  >
                    {homeState === s && <Check size={12} className="inline mr-1.5 mb-0.5" />}
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                {homeState ? `Continue with ${homeState}` : "Skip for now"} <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: Favorite species ────────────────────── */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                  <Waves className="text-cyan-400" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">What do you target?</h2>
                  <p className="text-slate-500 text-sm">Pick your favorites</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-6 pl-13">
                We&apos;ll highlight these species on the map and personalize your feed.
                {selectedSpecies.size > 0 && (
                  <span className="ml-1 text-blue-400 font-medium">{selectedSpecies.size} selected</span>
                )}
              </p>

              <div className="flex flex-wrap gap-2 mb-6 max-h-64 overflow-y-auto">
                {species.map((s) => {
                  const sel = selectedSpecies.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSpecies(s.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                        sel
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                          : "bg-white/4 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
                      }`}
                    >
                      {sel && <Check size={12} />}
                      {s.name}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-xl hover:shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  "Setting up your profile…"
                ) : (
                  <>
                    <Sparkles size={16} />
                    {selectedSpecies.size > 0 ? `Finish setup` : "Skip & finish"}
                  </>
                )}
              </button>

              {!isPending && (
                <p className="text-center text-slate-600 text-xs mt-3">
                  You can always update these in your profile settings.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
