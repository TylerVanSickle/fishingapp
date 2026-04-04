import Link from "next/link";
import { Shield, ExternalLink, Fish, AlertTriangle, Calendar, Scale, Hash } from "lucide-react";
import StateSelector from "@/components/StateSelector";

// ─── State agency data ────────────────────────────────────────────────────────
const STATE_AGENCIES: Record<string, { name: string; url: string }> = {
  AL: { name: "Alabama DCNR", url: "https://www.outdooralabama.com/fishing" },
  AK: { name: "Alaska ADF&G", url: "https://www.adfg.alaska.gov/index.cfm?adfg=fishing.main" },
  AZ: { name: "Arizona Game & Fish", url: "https://www.azgfd.com/fishing/" },
  AR: { name: "Arkansas Game & Fish", url: "https://www.agfc.com/en/fishing/" },
  CA: { name: "California DFW", url: "https://wildlife.ca.gov/Fishing" },
  CO: { name: "Colorado Parks & Wildlife", url: "https://cpw.state.co.us/thingstodo/Pages/Fishing.aspx" },
  CT: { name: "Connecticut DEEP", url: "https://portal.ct.gov/DEEP/Fishing/Freshwater-Fishing" },
  DE: { name: "Delaware DFW", url: "https://dnrec.delaware.gov/fish-wildlife/fishing/" },
  FL: { name: "Florida FWC", url: "https://myfwc.com/fishing/" },
  GA: { name: "Georgia DNR", url: "https://gadnr.org/fishing" },
  HI: { name: "Hawaii DLNR", url: "https://dlnr.hawaii.gov/dar/fishing/" },
  ID: { name: "Idaho Fish & Game", url: "https://idfg.idaho.gov/fish" },
  IL: { name: "Illinois DNR", url: "https://www2.illinois.gov/dnr/fishing" },
  IN: { name: "Indiana DNR", url: "https://www.in.gov/dnr/fish-and-wildlife/fishing/" },
  IA: { name: "Iowa DNR", url: "https://www.iowadnr.gov/fishing" },
  KS: { name: "Kansas Wildlife & Parks", url: "https://ksoutdoors.com/Fishing" },
  KY: { name: "Kentucky Fish & Wildlife", url: "https://fw.ky.gov/Fish/Pages/default.aspx" },
  LA: { name: "Louisiana WLF", url: "https://www.wlf.louisiana.gov/page/fishing" },
  ME: { name: "Maine IF&W", url: "https://www.maine.gov/ifw/fishing/index.html" },
  MD: { name: "Maryland DNR", url: "https://dnr.maryland.gov/fisheries/Pages/freshwater/index.aspx" },
  MA: { name: "Massachusetts DFW", url: "https://www.mass.gov/orgs/division-of-fisheries-and-wildlife" },
  MI: { name: "Michigan DNR", url: "https://www.michigan.gov/dnr/managing-resources/fisheries" },
  MN: { name: "Minnesota DNR", url: "https://www.dnr.state.mn.us/fishing/index.html" },
  MS: { name: "Mississippi MDWFP", url: "https://www.mdwfp.com/fishing/" },
  MO: { name: "Missouri Conservation", url: "https://mdc.mo.gov/fishing" },
  MT: { name: "Montana FWP", url: "https://fwp.mt.gov/fish/" },
  NE: { name: "Nebraska Game & Parks", url: "https://outdoornebraska.gov/fishing/" },
  NV: { name: "Nevada NDOW", url: "https://www.ndow.org/fish/" },
  NH: { name: "New Hampshire Fish & Game", url: "https://www.wildlife.nh.gov/fishing/index.html" },
  NJ: { name: "New Jersey DEP", url: "https://www.nj.gov/dep/fgw/fishing.htm" },
  NM: { name: "New Mexico DGF", url: "https://www.wildlife.state.nm.us/fishing/" },
  NY: { name: "New York DEC", url: "https://www.dec.ny.gov/outdoor/fishing.html" },
  NC: { name: "North Carolina WRC", url: "https://www.ncwildlife.org/fishing" },
  ND: { name: "North Dakota GF", url: "https://gf.nd.gov/fishing" },
  OH: { name: "Ohio DNR", url: "https://ohiodnr.gov/go-and-do/fish-hunt-trap/fishing" },
  OK: { name: "Oklahoma Wildlife", url: "https://www.wildlifedepartment.com/fishing" },
  OR: { name: "Oregon DFW", url: "https://myodfw.com/fishing" },
  PA: { name: "Pennsylvania Fish & Boat", url: "https://www.fishandboat.com/Fishing/Pages/Fishing.aspx" },
  RI: { name: "Rhode Island DEM", url: "https://dem.ri.gov/programs/fish-wildlife/freshwater-fisheries" },
  SC: { name: "South Carolina DNR", url: "https://www.dnr.sc.gov/fishing.html" },
  SD: { name: "South Dakota GF&P", url: "https://gfp.sd.gov/fishing/" },
  TN: { name: "Tennessee TWRA", url: "https://www.tn.gov/twra/fishing.html" },
  TX: { name: "Texas Parks & Wildlife", url: "https://tpwd.texas.gov/fishboat/fish/" },
  UT: { name: "Utah DWR", url: "https://wildlife.utah.gov/fishing/regulations.html" },
  VT: { name: "Vermont Fish & Wildlife", url: "https://vtfishandwildlife.com/fish" },
  VA: { name: "Virginia DWR", url: "https://dwr.virginia.gov/fishing/" },
  WA: { name: "Washington DFW", url: "https://wdfw.wa.gov/fishing" },
  WV: { name: "West Virginia DNR", url: "https://wvdnr.gov/fishing/" },
  WI: { name: "Wisconsin DNR", url: "https://dnr.wisconsin.gov/topic/fishing" },
  WY: { name: "Wyoming G&F", url: "https://wgfd.wyo.gov/fishing" },
};

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

// ─── Utah detailed regulations ────────────────────────────────────────────────
const UTAH_REGS = [
  {
    species: "Rainbow Trout",
    minSize: 7, bagLimit: 4,
    seasons: ["spring", "summer", "fall", "winter"],
    notes: "4 fish combined trout limit on most waters, 7\" min. Artificial lure-only and trophy sections exist on the Provo, Weber, and Logan rivers.",
    specialWaters: [
      { water: "Provo River (upper)", rule: "15\" min, artificial only" },
      { water: "Strawberry Reservoir", rule: "7\" min, 8 fish limit" },
    ],
    tags: ["trout"],
  },
  {
    species: "Brown Trout",
    minSize: 15, bagLimit: 2,
    seasons: ["fall", "winter", "spring"],
    notes: "15\" minimum on most quality streams. Oct–Nov spawn sections may go C&R. Check per-water rules.",
    specialWaters: [
      { water: "Provo River", rule: "15\" min, 2 fish, flies & lures only" },
      { water: "Green River (below Flaming Gorge)", rule: "13\" min, 3 fish OR 1 over 20\"" },
    ],
    tags: ["trout"],
  },
  {
    species: "Cutthroat Trout",
    minSize: 15, bagLimit: 2,
    seasons: ["spring", "summer", "fall"],
    notes: "State fish. Most native cutthroat waters are C&R or highly restricted — verify alpine lake rules before fishing.",
    specialWaters: [
      { water: "High Uinta alpine lakes", rule: "Varies — many C&R" },
      { water: "Bear Lake", rule: "15\" min, 2 fish (Bonneville cutthroat)" },
    ],
    tags: ["trout", "native"],
  },
  {
    species: "Lake Trout (Mackinaw)",
    minSize: null, bagLimit: 3,
    seasons: ["winter", "spring", "fall"],
    notes: "No size minimum statewide. Flaming Gorge slot limits may apply — always check.",
    specialWaters: [{ water: "Flaming Gorge", rule: "3 fish, slot limit may apply" }],
    tags: ["trout"],
  },
  {
    species: "Largemouth Bass",
    minSize: 12, bagLimit: 6,
    seasons: ["spring", "summer", "fall"],
    notes: "12\" minimum. Best during spawn (May–June) in warm coves. Utah Lake and Powell are top destinations.",
    specialWaters: [{ water: "Lake Powell", rule: "12\" min, 6 fish" }],
    tags: ["bass", "warmwater"],
  },
  {
    species: "Smallmouth Bass",
    minSize: 12, bagLimit: 6,
    seasons: ["spring", "summer", "fall"],
    notes: "12\" minimum. Flaming Gorge and Green River offer exceptional smallmouth fishing.",
    specialWaters: [{ water: "Flaming Gorge / Green River", rule: "12\" min, 6 fish" }],
    tags: ["bass", "warmwater"],
  },
  {
    species: "Walleye",
    minSize: 15, bagLimit: 6,
    seasons: ["spring", "winter", "fall"],
    notes: "15\" minimum on most waters. Ice fishing popular at Willard Bay and Starvation.",
    specialWaters: [
      { water: "Utah Lake", rule: "15\" min, 6 fish" },
      { water: "Willard Bay", rule: "15\" min, 6 fish" },
    ],
    tags: ["walleye", "warmwater"],
  },
  {
    species: "Yellow Perch",
    minSize: null, bagLimit: 50,
    seasons: ["winter", "spring", "fall"],
    notes: "No size minimum. Great ice fishing species. Utah Lake and Willard Bay are prime spots.",
    specialWaters: [],
    tags: ["panfish", "warmwater"],
  },
  {
    species: "Channel Catfish",
    minSize: null, bagLimit: 24,
    seasons: ["summer", "spring"],
    notes: "No minimum size. June–August peak. Utah Lake, Willard Bay, and Jordan River.",
    specialWaters: [],
    tags: ["catfish", "warmwater"],
  },
  {
    species: "Tiger Muskie",
    minSize: 36, bagLimit: 1,
    seasons: ["summer", "fall"],
    notes: "36\" minimum, 1 fish/day. Stocked at Pineview, Rockport, and Pelican Lake.",
    specialWaters: [
      { water: "Pineview Reservoir", rule: "36\" min, 1 fish" },
      { water: "Rockport Reservoir", rule: "36\" min, 1 fish" },
    ],
    tags: ["warmwater"],
  },
  {
    species: "Carp",
    minSize: null, bagLimit: 0,
    seasons: ["spring", "summer", "fall"],
    notes: "No limit or size restriction. Cannot be returned alive — invasive species management. Bowfishing popular.",
    specialWaters: [],
    tags: ["invasive", "warmwater"],
  },
];

// ─── General freshwater rules for non-Utah states ─────────────────────────────
const GENERAL_REGS = [
  { species: "Largemouth / Smallmouth Bass", minSize: 12, bagLimit: 5, seasons: ["spring","summer","fall"], notes: "Typical statewide minimums vary 10–14\". Spring spawning closures common in many states.", tags: ["bass"] },
  { species: "Trout (Rainbow, Brown, Brook)", minSize: 7, bagLimit: 5, seasons: ["spring","summer","fall","winter"], notes: "Limits typically 5 fish/day. Stocked and wild trout often have separate rules. Always check per-river regulations.", tags: ["trout"] },
  { species: "Walleye / Sauger", minSize: 15, bagLimit: 6, seasons: ["spring","fall","winter"], notes: "15\" common minimum. Spawning season closures common April–May on many waters.", tags: ["walleye"] },
  { species: "Northern Pike", minSize: 24, bagLimit: 5, seasons: ["spring","summer","fall"], notes: "Regulations vary widely by state. Trophy waters often have higher minimums.", tags: ["warmwater"] },
  { species: "Catfish (Channel, Blue, Flathead)", minSize: null, bagLimit: 10, seasons: ["spring","summer"], notes: "Generally 10–20 fish limit. No minimum size on most waters. Night fishing often produces best results.", tags: ["catfish"] },
  { species: "Crappie / Bluegill / Perch", minSize: null, bagLimit: 25, seasons: ["spring","summer"], notes: "Panfish limits commonly 25–50/day. No minimum size on most waters. Excellent for beginners.", tags: ["panfish"] },
  { species: "Muskie / Tiger Muskie", minSize: 36, bagLimit: 1, seasons: ["summer","fall"], notes: "One of the most regulated species. Many trophy waters are C&R only. Always verify.", tags: ["warmwater"] },
];

const SEASON_COLORS: Record<string, string> = {
  spring: "text-green-400 bg-green-500/10 border-green-500/20",
  summer: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  fall:   "text-orange-400 bg-orange-500/10 border-orange-500/20",
  winter: "text-sky-400 bg-sky-500/10 border-sky-500/20",
};
const TAG_COLORS: Record<string, string> = {
  trout:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
  bass:     "text-green-400 bg-green-500/10 border-green-500/20",
  walleye:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
  catfish:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
  panfish:  "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  warmwater:"text-orange-400 bg-orange-500/10 border-orange-500/20",
  native:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  invasive: "text-red-400 bg-red-500/10 border-red-500/20",
};
const TAGS = ["all", "trout", "bass", "walleye", "catfish", "panfish", "warmwater", "native"];

type Reg = { species: string; minSize: number | null; bagLimit: number; seasons: string[]; notes: string; specialWaters?: { water: string; rule: string }[]; tags: string[] };

function RegCard({ r }: { r: Reg }) {
  return (
    <div className="p-5 rounded-2xl border border-white/8 bg-white/2">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Fish size={15} className="text-blue-400 shrink-0" />
            {r.species}
          </h3>
          {r.tags.slice(0, 2).map((t) => (
            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium ${TAG_COLORS[t] ?? "text-slate-400 bg-white/5 border-white/10"}`}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <Scale size={10} className="text-blue-400" />
            {r.minSize != null ? `${r.minSize}" min` : "No min"}
          </span>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            <Hash size={10} className="text-green-400" />
            {r.bagLimit === 0 ? "No limit" : `${r.bagLimit}/day`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <Calendar size={11} className="text-slate-600 shrink-0" />
        {r.seasons.map((s) => (
          <span key={s} className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium ${SEASON_COLORS[s]}`}>{s}</span>
        ))}
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-3">{r.notes}</p>
      {r.specialWaters && r.specialWaters.length > 0 && (
        <div className="mt-2 pt-3 border-t border-white/6">
          <p className="text-[10px] text-slate-600 uppercase tracking-wide font-semibold mb-2">Special Water Rules</p>
          <div className="flex flex-col gap-1.5">
            {r.specialWaters.map((sw) => (
              <div key={sw.water} className="flex items-start gap-2 text-xs">
                <span className="text-blue-400 shrink-0 mt-0.5">·</span>
                <span>
                  <span className="text-slate-300 font-medium">{sw.water}</span>
                  <span className="text-slate-500"> — {sw.rule}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function RegulationsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; tag?: string; q?: string }>;
}) {
  const { state = "UT", tag = "all", q = "" } = await searchParams;
  const stateCode = state.toUpperCase();
  const query = q.toLowerCase().trim();
  const agency = STATE_AGENCIES[stateCode];
  const stateName = STATE_NAMES[stateCode] ?? stateCode;
  const isUtah = stateCode === "UT";

  const regs: Reg[] = isUtah ? UTAH_REGS : GENERAL_REGS;
  const filtered = regs.filter((r) => {
    const matchesTag = tag === "all" || r.tags.includes(tag);
    const matchesQuery = !query || r.species.toLowerCase().includes(query) || r.notes.toLowerCase().includes(query);
    return matchesTag && matchesQuery;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Shield className="text-blue-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">Fishing Regulations</h1>
          <p className="text-slate-500 text-xs">General guide — always verify with your state agency</p>
        </div>
      </div>

      {/* State selector */}
      <div className="mb-5 flex items-center gap-3 flex-wrap">
        <StateSelector current={stateCode} tag={tag} />
        {agency && (
          <a
            href={agency.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          >
            {agency.name} <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mb-5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-300 text-sm leading-relaxed">
          {isUtah
            ? "Utah-specific rules shown. Regulations change annually and vary by water body — always confirm at wildlife.utah.gov."
            : `General freshwater guidelines shown for ${stateName}. Rules vary by water, county, and season. Always verify with ${agency?.name ?? "your state agency"} before fishing.`
          }
        </p>
      </div>

      {/* Tag filters */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {TAGS.map((t) => (
          <Link
            key={t}
            href={`/regulations?state=${stateCode}&tag=${t}${q ? `&q=${q}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              tag === t ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {t === "all" ? "All Species" : t}
          </Link>
        ))}
      </div>

      {/* Non-Utah note */}
      {!isUtah && (
        <div className="mb-5 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-sm text-slate-400">
          <span className="text-blue-400 font-semibold">Detailed rules for {stateName} coming soon.</span> The general guidelines below apply to most freshwater species.{" "}
          {agency && (
            <a href={agency.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              See official {stateName} regulations →
            </a>
          )}
        </div>
      )}

      {/* Species cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-600 py-12">No species match your filter.</p>
        )}
        {filtered.map((r) => <RegCard key={r.species} r={r} />)}
      </div>

      {/* Footer */}
      {agency && (
        <div className="mt-8 p-4 rounded-xl border border-white/6 bg-white/1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-slate-300">Official {stateName} rulebook</p>
            <p className="text-xs text-slate-600 mt-0.5">Full closures, stocking schedules, and per-water rules.</p>
          </div>
          <a
            href={agency.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shrink-0"
          >
            {agency.name} <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
