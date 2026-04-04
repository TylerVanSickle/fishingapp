"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California", CO:"Colorado",
  CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho",
  IL:"Illinois", IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky", LA:"Louisiana",
  ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi",
  MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey",
  NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma",
  OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina", SD:"South Dakota",
  TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont", VA:"Virginia", WA:"Washington",
  WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming",
};

export default function StateSelector({ current, tag }: { current: string; tag: string }) {
  const router = useRouter();
  const entries = Object.entries(STATE_NAMES).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => router.push(`/regulations?state=${e.target.value}&tag=${tag}`)}
        className="pl-4 pr-9 py-2.5 rounded-xl bg-[#0c1a2e] border border-white/12 text-slate-100 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer text-sm font-medium transition-colors scheme-dark"
      >
        {entries.map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}
