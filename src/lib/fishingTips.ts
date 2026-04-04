/**
 * Fishing Tips Engine
 * Returns species-specific, water-type-aware, season-adjusted fishing intelligence.
 */

export type Season = "spring" | "summer" | "fall" | "winter";
export type WaterType = "lake" | "river" | "reservoir" | "pond" | "stream" | "creek" | "bay" | "ocean" | string;

export interface SpeciesTips {
  /** One-line technique summary */
  technique: string;
  /** Top 3 baits/lures */
  baits: string[];
  /** Where to find them */
  structure: string;
  /** Best window of the day */
  timing: string;
  /** Season-specific note */
  seasonNote: string;
  /** Water-type specific modifier */
  waterNote: string;
  /** Target depth range */
  depth: string;
  /** Water temperature sweet spot */
  tempRange: string;
}

// ── Season detection ─────────────────────────────────────────────────────────

export function getSeason(date: Date = new Date()): Season {
  const m = date.getMonth() + 1; // 1–12
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "fall";
  return "winter";
}

// ── Species normalization ─────────────────────────────────────────────────────

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, " ").trim();
}

function matchSpecies(name: string): string {
  const n = normalize(name);
  if (n.includes("largemouth") || (n.includes("bass") && !n.includes("small") && !n.includes("strip") && !n.includes("white") && !n.includes("spotted") && !n.includes("rock"))) return "largemouth_bass";
  if (n.includes("smallmouth")) return "smallmouth_bass";
  if (n.includes("striped bass") || n.includes("striper")) return "striped_bass";
  if (n.includes("spotted bass") || n.includes("spot")) return "spotted_bass";
  if (n.includes("white bass")) return "white_bass";
  if (n.includes("rainbow") || n.includes("steelhead")) return n.includes("steelhead") ? "steelhead" : "rainbow_trout";
  if (n.includes("brown trout")) return "brown_trout";
  if (n.includes("brook trout") || n.includes("brookie")) return "brook_trout";
  if (n.includes("lake trout") || n.includes("laker")) return "lake_trout";
  if (n.includes("cutthroat")) return "cutthroat_trout";
  if (n.includes("tiger trout")) return "tiger_trout";
  if (n.includes("trout")) return "rainbow_trout"; // generic trout → rainbow
  if (n.includes("walleye")) return "walleye";
  if (n.includes("sauger")) return "sauger";
  if (n.includes("northern pike") || n.includes("pike")) return "pike";
  if (n.includes("muskie") || n.includes("muskellunge")) return "muskie";
  if (n.includes("channel catfish")) return "channel_catfish";
  if (n.includes("blue catfish")) return "blue_catfish";
  if (n.includes("flathead")) return "flathead_catfish";
  if (n.includes("catfish")) return "channel_catfish";
  if (n.includes("black crappie") || n.includes("crappie")) return "crappie";
  if (n.includes("white crappie")) return "crappie";
  if (n.includes("bluegill") || n.includes("bream") || n.includes("sunfish")) return "bluegill";
  if (n.includes("yellow perch") || n.includes("perch")) return "yellow_perch";
  if (n.includes("carp") || n.includes("common carp")) return "carp";
  if (n.includes("chinook") || n.includes("king salmon")) return "chinook_salmon";
  if (n.includes("coho") || n.includes("silver salmon")) return "coho_salmon";
  if (n.includes("sockeye") || n.includes("red salmon")) return "sockeye_salmon";
  if (n.includes("atlantic salmon")) return "atlantic_salmon";
  if (n.includes("salmon")) return "chinook_salmon";
  if (n.includes("drum") || n.includes("freshwater drum")) return "freshwater_drum";
  if (n.includes("gar")) return "gar";
  if (n.includes("bowfin")) return "bowfin";
  if (n.includes("sturgeon")) return "sturgeon";
  if (n.includes("bass")) return "largemouth_bass"; // fallback for "bass"
  return "generic";
}

// ── Tips database ─────────────────────────────────────────────────────────────

type SeasonMap = Record<Season, { technique: string; baits: string[]; structure: string; timing: string; seasonNote: string; depth: string }>;

const TIPS: Record<string, SeasonMap & { tempRange: string; waterNotes: Partial<Record<string, string>> }> = {

  largemouth_bass: {
    tempRange: "60–78°F",
    waterNotes: {
      lake: "Target shallow weedlines and dock edges. Bass suspend over deeper structure mid-summer.",
      river: "Focus on eddies, back-channels, and slow-water pockets behind boulders and logs.",
      reservoir: "Points, submerged timber, and creek channel ledges are prime. Fish the thermocline in summer.",
      pond: "Bass often cruise the entire perimeter. Vegetation corners and shaded banks are best.",
      stream: "Look for deeper holes, undercut banks, and where current slows behind structure.",
    },
    spring: {
      technique: "Pre-spawn and spawn — fish are aggressive and shallow. Target staging areas near spawning flats.",
      baits: ["Jerkbait (slow-twitched)", "Swimbait", "Ned rig"],
      structure: "Shallow flats 2–6 ft, near hard bottom. Bass move shallower as temps rise above 55°F.",
      timing: "Mid-morning when shallow water warms. Afternoon on sunny days.",
      seasonNote: "Watch for bed activity when temps hit 62–68°F. Post-spawn females are lethargic — finesse baits excel.",
      depth: "2–10 ft",
    },
    summer: {
      technique: "Early/late topwater bite, mid-day drop shot or deep cranks on structure.",
      baits: ["Topwater popper", "Wacky-rigged Senko", "Deep diving crankbait"],
      structure: "Deep points, ledges, and timber 12–20 ft. Shaded docks mid-day.",
      timing: "Dawn and dusk for topwater. Mid-day fish push 15–25 ft deep.",
      seasonNote: "Oxygen and temp drive fish deep in summer. Find the thermocline at 12–18 ft on most lakes.",
      depth: "5–25 ft",
    },
    fall: {
      technique: "Reaction baits as bass chase shad into shallows. Aggressive feeding before winter.",
      baits: ["Lipless crankbait", "Swimbait", "Chatterbait"],
      structure: "Follow baitfish schools to flats and points. Bass will be anywhere shad are.",
      timing: "All-day bite especially on cloudy days. Peak activity in afternoons as temps drop.",
      seasonNote: "Best time of year for reaction baits. Cover water fast — aggressive bass will find you.",
      depth: "4–15 ft",
    },
    winter: {
      technique: "Slow finesse presentations. Bass are lethargic — you must put it right in their face.",
      baits: ["Ned rig (crawl it slowly)", "Jig (slow-roll)", "Blade bait"],
      structure: "Deepest available structure. South-facing banks warm fastest on sunny days.",
      timing: "Noon to 3pm on sunny days — warmest part of the day. Skip early morning.",
      seasonNote: "Patience is everything. Fish slower than you think necessary. A 2-minute dead-stick on a Ned rig is not uncommon.",
      depth: "15–30 ft",
    },
  },

  smallmouth_bass: {
    tempRange: "55–72°F",
    waterNotes: {
      river: "Current seams, rocky points, and tailwaters are prime. Smallmouth love current edges.",
      lake: "Rocky points, gravel bars, and mid-depth reefs 8–20 ft. Much more structure-oriented than largemouth.",
      reservoir: "Rocky banks, bluff walls, and chunk-rock points. Often deeper than largemouth in same body of water.",
      stream: "Riffles, rocky runs, and pool tail-outs. Smallmouth are the apex predator in most clear streams.",
    },
    spring: {
      technique: "Pre-spawn gravel staging. Fish slowly over rocky bottom with finesse rigs.",
      baits: ["Tube jig (drag-and-hop)", "Ned rig", "Jerkbait"],
      structure: "Gravel flats 4–10 ft, staging near spawning areas. Rocky points off main lake.",
      timing: "Morning bite best. Fish are active earlier than largemouth in spring.",
      seasonNote: "Smallmouth spawn later than largemouth. Beds are on gravel, not sand or mud.",
      depth: "4–12 ft",
    },
    summer: {
      technique: "Topwater in low light, hair jigs and tubes for suspended fish over structure.",
      baits: ["Topwater walk-the-dog", "Drop shot (goby imitation)", "Swimbait"],
      structure: "Rocky reefs, gravel bars 10–25 ft. Follow crayfish and goby patterns.",
      timing: "Dawn topwater until 9am. Then go deep to mid-lake structure.",
      seasonNote: "Smallmouth suspend over open water following baitfish in summer. Don't ignore mid-lake humps.",
      depth: "10–25 ft",
    },
    fall: {
      technique: "Fast reaction baits as smallmouth feed heavily before winter.",
      baits: ["Inline spinner", "Jerkbait", "Football jig"],
      structure: "Transition zones between deep and shallow. Gravel points and rocky banks.",
      timing: "All day — fall smallmouth are aggressive. Best windows at dawn and 4–6pm.",
      seasonNote: "Smallmouth enter rivers in fall in some regions. Check where they're moving.",
      depth: "5–18 ft",
    },
    winter: {
      technique: "Ultra-slow hair jig or blade bait worked right on bottom. Minimal movement.",
      baits: ["Blade bait (flutter-jigged)", "Finesse jig", "Drop shot — do nothing"],
      structure: "Deepest holes and river bends. South-facing rocky banks with sun exposure.",
      timing: "Midday only. Water temps are borderline — smallmouth barely feed below 45°F.",
      seasonNote: "Often grouped in large schools in deep holes. Find one, find many. Vertical presentation is key.",
      depth: "20–40 ft",
    },
  },

  rainbow_trout: {
    tempRange: "50–65°F",
    waterNotes: {
      river: "Fish seams between fast and slow water. Trout face into current and hold in feeding lanes.",
      stream: "Small pockets, pools below riffles, and undercut banks. Approach quietly — they spook easily.",
      lake: "Cruise along temperature breaks and inlet areas. Troll near surface early, go deeper as it warms.",
      reservoir: "Inlet tributaries are hotspots especially in spring. Fish the thermocline in summer.",
      pond: "Stock ponds — trout hold near aerators and feeders. Light line and small presentations.",
    },
    spring: {
      technique: "Aggressive feeding post-ice. Nymphs, streamers, and small spinners all produce.",
      baits: ["Wooly Bugger streamer", "PowerBait (stock ponds)", "Small inline spinner"],
      structure: "Shallow inlet areas and warming shallows. Follow the hatch if fly fishing.",
      timing: "Morning through mid-afternoon. Trout are active all day in cool spring temps.",
      seasonNote: "Best time of year for rainbows. Water temps are in the ideal range and fish are aggressive after winter.",
      depth: "2–10 ft",
    },
    summer: {
      technique: "Fish deeper or at night as water warms. Nymphing sub-surface produces when they won't surface feed.",
      baits: ["Copper John nymph", "Zebra midge", "Nightcrawler on bottom"],
      structure: "Shade, deep pools, and cold tributaries. Trout stress above 68°F — fish ethically.",
      timing: "Early morning and evening only in summer. Midday avoid warm-water fish entirely.",
      seasonNote: "If water temps exceed 68°F, stop fishing for trout. They are in thermal stress and catch-and-release mortality spikes.",
      depth: "8–20 ft",
    },
    fall: {
      technique: "Streamers and egg patterns as pre-spawn fish stage. Aggressive — larger profile lures work.",
      baits: ["Egg pattern (salmon/trout spawn)", "Wooly Bugger", "Rapala"],
      structure: "Near spawning tributaries and gravel redds. Fish staging areas, not active beds.",
      timing: "Morning through early afternoon. Fall bite is consistent throughout the day.",
      seasonNote: "Brown trout and steelhead run in fall — rainbows chase eggs below spawning browns. Excellent dry-fly fishing on warm fall days.",
      depth: "3–12 ft",
    },
    winter: {
      technique: "Slow midge and nymph presentations. Trout metabolism slows but they still feed.",
      baits: ["Midge larvae (size 20–24)", "Small Pheasant Tail nymph", "PowerBait (still water)"],
      structure: "Deep pools with slow current. Fish concentrate in the deepest available water.",
      timing: "Midday when water temps peak. Afternoons can be surprisingly productive.",
      seasonNote: "Winter midge hatches are underrated. A size 22 midge can out-fish everything else on a cold clear day.",
      depth: "5–15 ft",
    },
  },

  brown_trout: {
    tempRange: "50–68°F",
    waterNotes: {
      river: "More structure-oriented than rainbows. Under logs, in deep runs, and undercut banks.",
      stream: "Hold in the largest pools. Much more territorial and cautious than other trout.",
      lake: "Often much deeper than other trout. Troll with large streamers at 20–40 ft.",
      reservoir: "Forage-based fish. Schooled up in open water following baitfish in summer.",
    },
    spring: {
      technique: "Streamers in rising water. Browns respond to larger, more aggressive presentations.",
      baits: ["Woolhead Sculpin", "Articulated streamer", "Medium crankbait"],
      structure: "Banks, logjams, and boulders. Look for the deepest cover in any run.",
      timing: "Overcast days are prime. Browns feed more aggressively in low light.",
      seasonNote: "Spring runoff can turn rivers chocolate — fish edges and slower water. Browns still feed in dirty water.",
      depth: "4–15 ft",
    },
    summer: {
      technique: "Night fishing with large streamers or surface mice patterns. Browns go nocturnal in summer.",
      baits: ["Mouse pattern", "Large black Wooly Bugger", "Rapala #11 (night)"],
      structure: "Under overhanging banks, logjams, and deepest holes. Rarely in the open in daylight.",
      timing: "After dark. Large browns rarely make mistakes during the day in summer.",
      seasonNote: "The largest browns are almost exclusively caught at night in summer. Swinging streamers across pool tails after sunset.",
      depth: "6–20 ft (day) / 1–4 ft (night)",
    },
    fall: {
      technique: "Spawn run — browns become aggressive and territorial. Egg imitations and streamers.",
      baits: ["Glo-bug egg fly", "Wooly Bugger (orange/black)", "Berkley Gulp Egg"],
      structure: "Gravel redds in rivers. Fish upstream and downstream of active spawners.",
      timing: "All day during spawn. Peak usually Oct–Nov depending on latitude.",
      seasonNote: "Fall is the best time to catch a trophy brown. Spawning male Browns (bucks) are at their most aggressive.",
      depth: "2–8 ft",
    },
    winter: {
      technique: "Slow nymphing in deep pools. Browns barely feed but a perfect drift can trigger strikes.",
      baits: ["Stonefly nymph", "Large Hare's Ear nymph", "San Juan Worm"],
      structure: "Deepest pools in any given stretch. Zero current zones behind large boulders.",
      timing: "Midday only. Water temps drive everything — fish when it's above 38°F.",
      seasonNote: "Post-spawn browns are thin and recovering. Consider skipping winter brown trout fishing on catch-and-keep waters.",
      depth: "8–20 ft",
    },
  },

  brook_trout: {
    tempRange: "45–60°F",
    waterNotes: {
      stream: "Brookies love the coldest, most pristine water. High-elevation streams are their domain.",
      lake: "Remote mountain lakes. Fish near cold inlet streams and rocky points.",
      river: "Upper reaches only, where water stays coldest. Often small with brookies.",
    },
    spring: {
      technique: "Aggressive feeding in their prime temperature range. Small spinners and flies both work.",
      baits: ["Small Mepps spinner", "Elk Hair Caddis", "Live worm"],
      structure: "Plunge pools, pocket water, and anywhere cold oxygenated water enters.",
      timing: "All day — spring temperatures are ideal for brookies.",
      seasonNote: "Spring is the best time. Water is cold, brookies are active and feeding aggressively.",
      depth: "1–6 ft",
    },
    summer: {
      technique: "Fish higher elevation streams as valley streams overheat. Early morning only on warm days.",
      baits: ["Dry fly (attractor patterns)", "Small streamer", "Maggot/wax worm"],
      structure: "Springs, cold tributary mouths, and deepest available pools.",
      timing: "Dawn until 9am before heat builds. Evening rise is also productive.",
      seasonNote: "Brookies are the most heat-sensitive trout. Above 65°F they are in trouble. Find cold water.",
      depth: "2–8 ft",
    },
    fall: {
      technique: "Spawn run — brookies become brilliantly colored and actively feed near spawning areas.",
      baits: ["Small Wooly Bugger", "Egg pattern", "Inline spinner"],
      structure: "Gravel substrate in smaller streams. Males will chase anything aggressively.",
      timing: "All day. Brook trout are not as cagey as browns during spawn.",
      seasonNote: "October is the classic brook trout month. Males are at their most beautiful — orange bellies, red spots.",
      depth: "1–5 ft",
    },
    winter: {
      technique: "Very slow nymphing or bait fishing. Brookies barely feed but will take a dead-drifted fly.",
      baits: ["Small midge", "Scud pattern", "Small piece of worm"],
      structure: "Deepest pools available, completely out of any current.",
      timing: "Midday on warmer days. Don't bother when air temps are well below freezing.",
      seasonNote: "Brook trout are resident fish — they don't move far. They're there, just lethargic.",
      depth: "4–10 ft",
    },
  },

  walleye: {
    tempRange: "55–68°F",
    waterNotes: {
      lake: "Walleye are light-sensitive. Fish edges of weed lines and rocky points in low light.",
      river: "Tailwaters below dams are excellent. Fish current seams and rock piles.",
      reservoir: "Submerged points, old creek channels, and rocky humps. Structure is everything.",
    },
    spring: {
      technique: "Post-spawn walleye stage near spawning areas. Jig and minnow combos dominate.",
      baits: ["Jig tipped with minnow", "Rapala Original Floating", "Twister tail jig"],
      structure: "Rocky points, riprap, and shoreline structure near spawning beds.",
      timing: "Dusk through midnight. Walleye are the ultimate low-light feeders.",
      seasonNote: "Spawn occurs when water hits 42–50°F. Best fishing is right after the spawn when females feed aggressively.",
      depth: "3–12 ft",
    },
    summer: {
      technique: "Night fishing is essential. Deep structure in daytime, shallow flats after dark.",
      baits: ["Nightcrawler harness (trolled)", "Lindy rig with minnow", "Stick bait (night)"],
      structure: "Deep rock piles 15–25 ft in daytime. Sand flats and points after sunset.",
      timing: "30 minutes before sunset through 2am. Daytime walleye are very finicky.",
      seasonNote: "Summer walleye fishing is almost entirely a night game on most lakes. Invest in good navigation lights.",
      depth: "15–28 ft (day) / 4–10 ft (night)",
    },
    fall: {
      technique: "Fall walleye chase shad and perch — fast presentation, cover water.",
      baits: ["Lipless crankbait", "Jigging spoon", "Blade bait"],
      structure: "Points, saddles, and rocky structures where walleye intercept baitfish schools.",
      timing: "Evening and night still best, but fall daytime bite improves significantly.",
      seasonNote: "Walleye gain weight fast in fall to prepare for winter. Can be caught throughout the day.",
      depth: "8–20 ft",
    },
    winter: {
      technique: "Vertical jigging through ice or from boats in open water. Slow and precise.",
      baits: ["Jigging Rapala", "Swedish Pimple", "Live minnow under bobber"],
      structure: "Deep basin transitions and submerged points. Often suspended 3–5 ft off bottom.",
      timing: "Last hour of daylight is legendary for walleye bites. Also midnight to 2am.",
      seasonNote: "Walleye remain active all winter — they're one of the best species to target through ice.",
      depth: "20–40 ft",
    },
  },

  pike: {
    tempRange: "50–65°F",
    waterNotes: {
      lake: "Shallow weed edges in spring, deeper weed lines and open water in summer.",
      river: "Backwaters and slack current areas, tributary mouths, and oxbows.",
      reservoir: "Flooded timber and weed edges. Follow baitfish schools in summer.",
    },
    spring: {
      technique: "Post-ice pike are hungry and aggressive. Large, flashy lures right after ice-out.",
      baits: ["Large spinnerbait", "Sucker (live or dead bait)", "Large jerkbait"],
      structure: "Shallow bays that warm first (1–4 ft). South-facing weed beds.",
      timing: "All day — pike feed heavily post-spawn. Overcast days are especially good.",
      seasonNote: "Ice-out pike is one of the best bites of the year. Pike are coming off the spawn and starving.",
      depth: "2–8 ft",
    },
    summer: {
      technique: "Pike move deeper as weeds grow. Fish weed edges with larger presentations.",
      baits: ["Large swimbait", "Surface frog", "Large bucktail spinner"],
      structure: "Outside weed edges, submerged points, and open-water suspenders over 20+ ft.",
      timing: "Early morning and overcast days. Midday pike can be sluggish.",
      seasonNote: "Trophy pike are often caught in summer at depth. Don't ignore open water.",
      depth: "8–20 ft",
    },
    fall: {
      technique: "Aggressive fall bite as pike gorge. Fast and big presentations trigger instinct strikes.",
      baits: ["Large swimbait", "Large spinnerbait", "Live sucker"],
      structure: "Weed edges that still have green weeds. Rocky transition areas.",
      timing: "All day — fall pike are highly aggressive and will chase for long distances.",
      seasonNote: "Fall pike are at their heaviest. Best time of year for trophy fish.",
      depth: "5–15 ft",
    },
    winter: {
      technique: "Slow-worked large jigs and dead bait. Pike slow down but still need to eat.",
      baits: ["Dead sucker (tip-up)", "Large jigging spoon", "Live smelt"],
      structure: "Deep weed edges, 15–25 ft. Suspended off bottom near baitfish.",
      timing: "Mid-morning bite when light penetrates ice. Also active at dusk.",
      seasonNote: "Ice fishing with tip-ups and large dead bait is the classic winter pike approach.",
      depth: "12–25 ft",
    },
  },

  channel_catfish: {
    tempRange: "70–85°F",
    waterNotes: {
      river: "Current seams, deep holes, and below dams. Rivers are their home turf.",
      lake: "Deep holes, submerged channels, and rocky points. Fish bottom exclusively.",
      reservoir: "Old creek channels and the deepest available structure.",
      pond: "Ponds concentrate catfish in deep holes — they're easier to catch here.",
    },
    spring: {
      technique: "Catfish become active as water warms above 60°F. Cut bait and stink baits produce.",
      baits: ["Cut shad/bluegill", "Chicken liver", "Stink bait (dip bait)"],
      structure: "Deep river bends and holes. Rock ledges and submerged timber.",
      timing: "Night fishing starts producing as spring progresses.",
      seasonNote: "Pre-spawn catfish are feeding to build energy. Best of spring is just before the spawn.",
      depth: "8–20 ft",
    },
    summer: {
      technique: "Night fishing dominates. Catfish are most active from sunset to midnight in summer.",
      baits: ["Fresh cut shad", "Live bluegill (check regulations)", "Chicken liver"],
      structure: "Deep holes during day. Shallow flats and current seams after dark.",
      timing: "10pm to 3am. The classic summer catfish time.",
      seasonNote: "Summer is the prime catfish season. Warm water = active catfish. Night fishing is almost mandatory.",
      depth: "5–20 ft",
    },
    fall: {
      technique: "Catfish follow shad into shallower areas. Good all-day bite as water cools.",
      baits: ["Cut shad", "Live bait", "Prepared catfish dough bait"],
      structure: "Points and flats where baitfish school. Near dam tailwaters.",
      timing: "Afternoon and evening bite picks up as temps cool.",
      seasonNote: "Fall catfish are fattening up. Great time of year with less boat traffic and active fish.",
      depth: "6–15 ft",
    },
    winter: {
      technique: "Very slow and close to bottom. Catfish cluster in deep holes.",
      baits: ["Cut bait (soaked long)", "Skipjack herring", "Night crawlers"],
      structure: "Deepest holes in the system, often 25–40 ft in rivers.",
      timing: "Afternoon on warm winter days. Minimal activity otherwise.",
      seasonNote: "Winter catfish are catchable but require patience. They barely move — put bait right in front of them.",
      depth: "20–40 ft",
    },
  },

  crappie: {
    tempRange: "60–75°F",
    waterNotes: {
      lake: "Brush piles, submerged timber, and dock structure. Crappie love vertical cover.",
      river: "Backwater areas, tributary mouths, and flooded timber.",
      reservoir: "Timber, brush piles, and dock areas. Classic reservoir crappie habitat.",
      pond: "Any structure available — dock posts, fallen trees, overhanging vegetation.",
    },
    spring: {
      technique: "Best fishing of the year. Spawn draws crappie shallow and makes them easy to find.",
      baits: ["Small jig (1/32–1/8 oz)", "Live minnow", "Tube jig"],
      structure: "Shallow (2–6 ft) brush, dock pilings, and flooded timber.",
      timing: "All day during spawn. Before spawn, best in morning and evening.",
      seasonNote: "Spring crappie spawn is the most consistent fishing of the year. Find the brush, find the fish.",
      depth: "2–8 ft",
    },
    summer: {
      technique: "Crappie go deep in summer. Long-line trolling or drop vertically on structure.",
      baits: ["Curly tail jig (small)", "Minnow on light jig", "Small tube"],
      structure: "Deep brush piles and timber 10–20 ft. Find the thermocline edge.",
      timing: "Dusk and night fishing produces big summer crappie. Also early morning.",
      seasonNote: "Summer crappie are stacked deep. Once you find the right depth, it can be fast and furious.",
      depth: "12–20 ft",
    },
    fall: {
      technique: "Crappie follow shad schools. Fish suspended fish over open water and on structure edges.",
      baits: ["Blade bait", "Small swimbait", "Live minnow"],
      structure: "Points and drop-offs where baitfish concentrate. Active near surface in low light.",
      timing: "Morning and evening. Fall crappie can be found at multiple depths.",
      seasonNote: "Fall crappie fishing is underrated. Fish are aggressive and moving — cover water to find schools.",
      depth: "6–15 ft",
    },
    winter: {
      technique: "Find the deepest brush available. Slow-fish small jigs right in the brush.",
      baits: ["Tiny tube jig (1/64 oz)", "Gulp Minnow (small)", "Maggots on small hook"],
      structure: "Deepest brush and timber. Fish schools that are tightly packed.",
      timing: "Midday. Crappie are consistent but slow — find the school and work it.",
      seasonNote: "Winter crappie schools are large and stationary. Ice fishing or vertical fishing from boat are both excellent.",
      depth: "15–25 ft",
    },
  },

  bluegill: {
    tempRange: "65–80°F",
    waterNotes: {
      pond: "Bluegill thrive in ponds. Vegetation edges and dock areas are always productive.",
      lake: "Weed edges, dock pilings, and shallow structure. Easy to locate.",
      river: "Quiet backwater areas and eddies. Avoid strong current.",
    },
    spring: {
      technique: "Bluegill move shallow as temps rise. Easy to catch on small hooks and live bait.",
      baits: ["Wax worm/red worm", "Small bobber + cricket", "Tiny jig under float"],
      structure: "Weed edges and dock pilings. Spawning beds are easy to spot — circular depressions in sand.",
      timing: "All day during spawn. Morning and evening otherwise.",
      seasonNote: "Bluegill spawn in multiple waves through spring and early summer. One of the most reliable bites around.",
      depth: "1–5 ft",
    },
    summer: {
      technique: "Surface bugs, poppers, and dry flies produce excellent summer bluegill action.",
      baits: ["Small popper", "Dry fly", "Cricket under bobber"],
      structure: "Shallow weeds and dock shade. Spawn beds still productive in early summer.",
      timing: "Evening is exceptional. Bluegill rise to surface bugs in warm summer evenings.",
      seasonNote: "Summer bluegill on a fly rod with a small popper is one of the most fun things in fishing.",
      depth: "1–6 ft",
    },
    fall: {
      technique: "Bluegill school up tightly in fall. Find one, find hundreds.",
      baits: ["Worm", "Small inline spinner", "Tiny jig"],
      structure: "Transition areas and weed edges. Schools are often suspended.",
      timing: "Midday when water is warmest.",
      seasonNote: "Fall bluegill are fat and feeding before winter. Schools can be massive.",
      depth: "5–12 ft",
    },
    winter: {
      technique: "Very slow micro-presentations. Bluegill still bite through ice.",
      baits: ["Wax worm on tiny hook", "Maggot", "Small ice fishing jig"],
      structure: "Deep basin edges and weed edges at 10–15 ft.",
      timing: "Midday. Ice fishing for bluegill is highly productive.",
      seasonNote: "One of the best ice fishing species. Schools are large and stationary in winter.",
      depth: "10–18 ft",
    },
  },

  yellow_perch: {
    tempRange: "55–70°F",
    waterNotes: {
      lake: "Mid-depth rock and gravel structure. Perch school heavily — find the school.",
      reservoir: "Similar to lake — submerged points and hard bottom areas.",
    },
    spring: {
      technique: "Post-spawn perch school aggressively. Small jigs and live minnow work great.",
      baits: ["Small jig with minnow", "Worm on drop shot", "Small blade bait"],
      structure: "Rocky and gravel areas 6–15 ft. Shallow in early spring.",
      timing: "All day. Perch are consistent and not particularly light-sensitive.",
      seasonNote: "Perch spread out after spawn. Don't anchor — keep moving until you find the school.",
      depth: "6–15 ft",
    },
    summer: {
      technique: "Find the thermocline — perch suspend at the oxygen edge. Vertical jigging works.",
      baits: ["Perch rig (multi-hook)", "Small minnow on spinner", "Gulp! Minnow"],
      structure: "Rocky humps and offshore structure. Often 15–25 ft on warm lakes.",
      timing: "Morning and evening. Perch feed actively in moderate light.",
      seasonNote: "Summer perch fishing can be feast or famine. Electronics help find suspended schools.",
      depth: "12–25 ft",
    },
    fall: {
      technique: "Perch are feeding hard in fall. Small jigs and live bait both produce.",
      baits: ["Small jig", "Live minnow", "Small tube"],
      structure: "Rocky points and weed edges. Schools are mobile — follow them.",
      timing: "All day in fall. One of the most consistent fall targets.",
      seasonNote: "Fall perch are in top condition. Best time of year for large perch.",
      depth: "8–20 ft",
    },
    winter: {
      technique: "Ice fishing for perch is one of the classic winter activities. Tip-ups and small jigs.",
      baits: ["Maggot on ice jig", "Wax worm", "Small minnow on hook"],
      structure: "Deep basins, 20–40 ft on most lakes.",
      timing: "Morning until noon is typically best.",
      seasonNote: "Yellow perch are one of the premier ice fishing targets. Schools are large in winter.",
      depth: "18–35 ft",
    },
  },

  muskie: {
    tempRange: "60–75°F",
    waterNotes: {
      lake: "Large clear lakes. Weed edges in summer, open water in fall.",
      river: "Large rivers with moderate current. Below dams can be exceptional.",
    },
    spring: {
      technique: "Post-spawn muskie are recovering but will strike large, slow-moved baits.",
      baits: ["Large sucker (live)", "Jointed glide bait", "Large bucktail"],
      structure: "Shallow bays and weed flats. Recovering near spawning areas.",
      timing: "Afternoon when water warms. Muskies are cold-blooded — temps drive everything.",
      seasonNote: "Give muskies time to recover post-spawn. Focus on larger fish in recovery mode.",
      depth: "4–12 ft",
    },
    summer: {
      technique: "Classic figure-8 at boatside. Large bucktails and surface baits at dawn and dusk.",
      baits: ["Large bucktail spinner", "Bull Dawg", "Large glide bait"],
      structure: "Outside weed edges 8–18 ft. Point breaks and open water.",
      timing: "Dawn, dusk, and overcast days. Muskies follow a 'magic window' activity period.",
      seasonNote: "Figure-8 at the rod tip is mandatory — a huge percentage of muskie strikes happen boatside.",
      depth: "8–20 ft",
    },
    fall: {
      technique: "The season of giants. Muskies are at peak weight and aggression before winter.",
      baits: ["Large glide bait", "Sucker on quick-strike rig", "Large swimbait"],
      structure: "Rocky main-lake structure and weed edges that still have green weeds.",
      timing: "All day in fall. Water temps drive muskie into extended feeding sprees.",
      seasonNote: "Late October through November is considered the premier muskie time. Trophies are caught daily.",
      depth: "8–25 ft",
    },
    winter: {
      technique: "Extremely slow presentation. Muskies are lethargic but still catchable.",
      baits: ["Large dead sucker on tip-up", "Slow-rolled swimbait"],
      structure: "Deepest available structure. Basin edges and major points.",
      timing: "Midday only.",
      seasonNote: "Winter muskies require extreme patience. Most anglers take a break — but trophy fish are possible.",
      depth: "20–40 ft",
    },
  },

  chinook_salmon: {
    tempRange: "44–58°F",
    waterNotes: {
      river: "Staging below falls and dams. Current seams and deep pools.",
      lake: "Open water trolling in summer, nearshore in spring and fall.",
      ocean: "Offshore trolling following baitfish schools and temperature breaks.",
    },
    spring: {
      technique: "Trolling with spoons and flasher/fly combos in open water.",
      baits: ["Flasher and hoochie", "Trolling spoon", "Herring on a hook"],
      structure: "Temperature breaks and bait balls. Use electronics.",
      timing: "Early morning is best. Chinook are light-sensitive.",
      seasonNote: "Spring chinook are the most prized — fresh chrome fish with high fat content.",
      depth: "20–60 ft",
    },
    summer: {
      technique: "Deep trolling as fish go deep to find cold water. Downriggers essential.",
      baits: ["Large trolling spoon (on downrigger)", "Cut plug herring", "Anchovy on flasher"],
      structure: "Temperature breaks, often 40–80 ft down. Find the thermocline.",
      timing: "Dawn and dusk are prime. Midday fish push very deep.",
      seasonNote: "Summer chinook feed heavily before heading to rivers. Downriggers are necessary equipment.",
      depth: "40–100 ft",
    },
    fall: {
      technique: "River fishing — casting spoons and flies to staging and running fish.",
      baits: ["Kastmaster spoon", "Egg sac (roe)", "Salmon egg patterns"],
      structure: "Deep pools below spawning areas. Current breaks where fish rest.",
      timing: "Early morning is peak. Fish move during morning hours.",
      seasonNote: "Fall chinook run is the most accessible for shore anglers. Rivers are packed with fish.",
      depth: "4–15 ft",
    },
    winter: {
      technique: "Winter chinook in some Pacific rivers. Drift fishing with cured eggs.",
      baits: ["Cured roe in sand shrimp wrap", "Kwikfish", "Corky and yarn"],
      structure: "Deep river pools and back eddies. Fish are resting between moving.",
      timing: "Morning is best. Afternoon can also produce on mild days.",
      seasonNote: "Hatchery winter chinook are available in many rivers. Check regulations carefully.",
      depth: "8–20 ft",
    },
  },

  steelhead: {
    tempRange: "34–55°F",
    waterNotes: {
      river: "The premier steelhead habitat. Current seams, tailouts, and deep runs.",
      stream: "Smaller tributaries during rain events and high water.",
    },
    spring: {
      technique: "Spring steelhead run — fish are migrating. Float fishing and fly presentation.",
      baits: ["Roe (cured eggs)", "Jig under float", "Spoon"],
      structure: "Current seams, pool tailouts, and water 3–6 ft deep with moderate flow.",
      timing: "Morning through early afternoon. Fresh fish move in morning hours.",
      seasonNote: "Spring steelhead are chrome and hard-fighting. Often the best run of the year.",
      depth: "3–8 ft",
    },
    summer: {
      technique: "Summer steelhead (summer runs) are in rivers resting. Dry fly can work in low water.",
      baits: ["Dry fly (skated)", "Small streamer", "Natural egg imitation"],
      structure: "Shade, deep pools, and cold tributary inflows.",
      timing: "Early morning and evening. Avoid warm afternoon water.",
      seasonNote: "Summer steelhead will take a dry fly — one of the most exciting experiences in freshwater fishing.",
      depth: "3–10 ft",
    },
    fall: {
      technique: "Early run fish in fall. Swinging streamers and float fishing.",
      baits: ["Articulated streamer", "Egg pattern", "Large nymph"],
      structure: "Fresh fish in runs and tailouts. Focus on new arrivals.",
      timing: "Morning is prime. Rain events push fish upriver.",
      seasonNote: "Fall steelheading coincides with salmon runs — both fish in the same water. Target seams below spawning salmon.",
      depth: "3–10 ft",
    },
    winter: {
      technique: "Classic winter steelhead season — drift fishing, float fishing, and swinging.",
      baits: ["Cured roe", "Jig under float", "Spoon"],
      structure: "Slower water, deeper pools, and thermal refugia. Fish don't fight current unnecessarily.",
      timing: "Midday when water temps peak above 34°F.",
      seasonNote: "Winter steelheading is tough but deeply rewarding. High water after rain events moves fish.",
      depth: "4–12 ft",
    },
  },

  carp: {
    tempRange: "65–85°F",
    waterNotes: {
      lake: "Shallow flats and weed areas where carp root in mud.",
      river: "Slow eddies, weed beds, and warm backwaters.",
      pond: "Pond carp often concentrate in specific areas — watch for 'mudding' activity.",
    },
    spring: {
      technique: "Carp begin moving shallow as temps rise. Sight fishing opportunities.",
      baits: ["Corn (sweet)", "Boilies", "Bread ball"],
      structure: "Warming shallows and south-facing banks. Look for mudding carp.",
      timing: "Midday when shallows are warmest.",
      seasonNote: "Spring carp are beginning to feed after winter. Introduce bait (pre-baiting) to create a hotspot.",
      depth: "2–8 ft",
    },
    summer: {
      technique: "Surface fishing with floating bread is a summer specialty. Also bottom fishing with boilies.",
      baits: ["Floating bread crust", "Boilies (hair rig)", "Sweet corn"],
      structure: "Shade, lily pad edges, and areas where fish are actively feeding.",
      timing: "Early morning and evening. Midday surface fishing when fish are cruising.",
      seasonNote: "Summer carp respond to visual presentations — sight fishing in clear shallows is thrilling.",
      depth: "1–12 ft",
    },
    fall: {
      technique: "Carp feed heavily in fall before winter. Bottom fishing with boilies and corn is consistent.",
      baits: ["Boilies", "Tiger nuts (check regs)", "Corn"],
      structure: "Pre-baited areas and consistent spots. Carp return to feeding areas.",
      timing: "Dusk through midnight is excellent in fall.",
      seasonNote: "Fall carp are at their heaviest. Pre-baiting a location creates a reliable hotspot.",
      depth: "4–15 ft",
    },
    winter: {
      technique: "Very slow. Carp barely feed but are catchable in milder winters.",
      baits: ["Small boilies", "Maggots", "Corn"],
      structure: "Deepest areas of the lake or river.",
      timing: "Midday on mild days above 45°F.",
      seasonNote: "Winter carp fishing is a UK specialty. Use ultra-light bait and patient approach.",
      depth: "12–25 ft",
    },
  },

  flathead_catfish: {
    tempRange: "72–85°F",
    waterNotes: {
      river: "Large rivers with deep holes and heavy wood cover. Flatheads are structure addicts.",
      reservoir: "Old creek channels and submerged timber near current flow.",
    },
    spring: { technique: "Flatheads become active post-spawn. Live bait is almost mandatory.", baits: ["Live bluegill", "Live perch", "Large live creek chub"], structure: "Deep river bends with heavy wood cover.", timing: "Night only — flatheads are strictly nocturnal.", seasonNote: "Spring flatheads are recovering from spawn and hungry.", depth: "10–25 ft" },
    summer: { technique: "Night fishing under log jams and in deep wood-filled holes.", baits: ["Live bluegill (6–8 inch)", "Live perch", "Live suckers"], structure: "The biggest wood piles in the deepest holes. Trophy flatheads are always near wood.", timing: "Sunset to 2am. Flatheads rarely bite in daylight.", seasonNote: "Summer is prime flathead season. Biggest fish of the year are caught July–August.", depth: "8–25 ft" },
    fall: { technique: "Flatheads begin feeding more during daylight as temps drop.", baits: ["Live bait", "Cut bait (fresh)", "Large shiners"], structure: "Transition areas, but still near wood cover.", timing: "Evening and early night. Daylight fishing improves in late fall.", seasonNote: "Fall flatheads are fattening up. Good opportunity to catch fish during limited daylight hours.", depth: "6–20 ft" },
    winter: { technique: "Flatheads cluster in deep holes and are nearly dormant.", baits: ["Live bait if any"], structure: "Deepest holes in the entire river system.", timing: "Barely active.", seasonNote: "Flatheads enter near-dormancy in winter. Most anglers target other species.", depth: "20–40 ft" },
  },

  blue_catfish: {
    tempRange: "68–80°F",
    waterNotes: {
      river: "Large tailwaters and main river channels. Blue cats follow current and baitfish.",
      reservoir: "Main lake points and dam tailwaters.",
    },
    spring: { technique: "Drift fishing with cut shad in tailwaters and main channels.", baits: ["Fresh cut shad", "Cut skipjack", "Whole bluegill"], structure: "Below dams and in current breaks along main channel.", timing: "All day — blue cats are less nocturnal than flatheads.", seasonNote: "Blue cats spawn in late spring. Pre-spawn fish are actively feeding.", depth: "10–30 ft" },
    summer: { technique: "Anchor in current and use fresh-cut shad. Blue cats relate to current all summer.", baits: ["Fresh cut shad (head and belly)", "Cut skipjack herring", "Fresh gizzard shad"], structure: "Main channel ledges and current seams. Depth finder essential.", timing: "All day bite with peaks at dawn and dusk.", seasonNote: "Summer blue cats can be massive — 50+ lb fish are possible in top rivers.", depth: "15–40 ft" },
    fall: { technique: "Blue cats follow shad schools as water cools. Very active fall feeders.", baits: ["Fresh cut shad", "Live shad", "Cut herring"], structure: "Baitfish schools on flats and points.", timing: "All day with evening peak.", seasonNote: "Fall blue catfish migration can produce numbers and size simultaneously.", depth: "8–25 ft" },
    winter: { technique: "Slow drift fishing in deep current breaks.", baits: ["Cut shad", "Dead shad on bottom"], structure: "Deepest channel areas.", timing: "Midday on warm days.", seasonNote: "Blue cats feed through winter, especially in tailwaters below warm power plants.", depth: "20–40 ft" },
  },

  freshwater_drum: {
    tempRange: "60–78°F",
    waterNotes: {
      river: "Current seams and rocky bottoms. Drum are bottom-feeders in rivers.",
      lake: "Sandy and rocky bottoms in 10–20 ft of water.",
    },
    spring: { technique: "Drum move shallow to feed in spring. Jigs and live crawfish work.", baits: ["Live crawfish", "Nightcrawler", "Jig (bottom-hopped)"], structure: "Rocky and sandy bottoms 5–15 ft. Current edges.", timing: "Morning and evening.", seasonNote: "Spring drum are active and feeding — an underrated sport fish.", depth: "5–15 ft" },
    summer: { technique: "Bottom fishing with nightcrawlers or crawfish.", baits: ["Nightcrawler", "Crawfish imitation", "Shrimp"], structure: "Hard bottom areas 10–20 ft.", timing: "All day.", seasonNote: "Drum fight hard for their size — an overlooked but enjoyable target.", depth: "10–25 ft" },
    fall: { technique: "Similar to summer — bottom fishing on hard structure.", baits: ["Crawfish", "Shad cut bait", "Worm"], structure: "Rocky ledges and points.", timing: "Afternoon tends to produce well.", seasonNote: "Fall drum are fat and aggressive. Often caught while targeting walleye.", depth: "8–20 ft" },
    winter: { technique: "Deep and slow. Drum barely move in cold water.", baits: ["Jig tipped with minnow"], structure: "Deepest available bottom structure.", timing: "Midday.", seasonNote: "Not a primary winter target for most anglers.", depth: "15–30 ft" },
  },

  generic: {
    tempRange: "55–75°F",
    waterNotes: {},
    spring: { technique: "Fish are moving shallow and actively feeding after winter.", baits: ["Live bait", "Jig", "Small spinner"], structure: "Shallow warming areas and structure transitions.", timing: "Morning is typically best. Activity picks up as water warms through the day.", seasonNote: "Spring is the most active feeding period for most species. Fish shallower than you think.", depth: "4–12 ft" },
    summer: { technique: "Fish early and late. Midday heat pushes fish deep or into shade.", baits: ["Live bait", "Natural presentation", "Reaction lure at dawn"], structure: "Deep structure, shade, and current breaks in rivers.", timing: "Dawn and dusk are prime. Night fishing often outperforms midday.", seasonNote: "Summer fishing is about finding comfortable water temps. Focus on transitions between warm and cool.", depth: "8–20 ft" },
    fall: { technique: "Aggressive feeding pre-winter. Cover water and use reaction baits.", baits: ["Crankbait", "Swimbait", "Live bait"], structure: "Follow baitfish concentrations. Points and transition areas.", timing: "All day — fall is the most consistent bite of the year for most species.", seasonNote: "Fall is prime time. Fish are eating to fatten up and don't have the summer heat suppressing them.", depth: "5–15 ft" },
    winter: { technique: "Slow down everything. Fish are metabolically reduced but catchable.", baits: ["Small jig (slow-fished)", "Live bait", "Blade bait"], structure: "Deepest available water with stable temperatures.", timing: "Midday when water temperatures peak.", seasonNote: "Patience is the key to winter fishing. Slow presentation and premium spots matter most.", depth: "15–30 ft" },
  },
};

// ── Main export ───────────────────────────────────────────────────────────────

export function getSpeciesTips(
  speciesName: string,
  waterType: WaterType = "lake",
  date: Date = new Date()
): SpeciesTips {
  const slug = matchSpecies(speciesName);
  const entry = TIPS[slug] ?? TIPS.generic;
  const season = getSeason(date);
  const seasonal = entry[season];

  // Find best water note
  const wt = waterType.toLowerCase();
  const waterNote =
    entry.waterNotes[wt] ??
    entry.waterNotes[Object.keys(entry.waterNotes).find((k) => wt.includes(k)) ?? ""] ??
    `${speciesName} can be found across various water types. Adapt presentation to local conditions.`;

  return {
    technique: seasonal.technique,
    baits: seasonal.baits,
    structure: seasonal.structure,
    timing: seasonal.timing,
    seasonNote: seasonal.seasonNote,
    waterNote,
    depth: seasonal.depth,
    tempRange: entry.tempRange,
  };
}

export function getSeasonLabel(date: Date = new Date()): string {
  const labels: Record<Season, string> = {
    spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter",
  };
  return labels[getSeason(date)];
}
