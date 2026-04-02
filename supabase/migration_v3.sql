-- ============================================================
-- migration_v3.sql
-- Utah Fishing App — New Species, More Spots, Spot-Fish Links
-- Self-contained: includes all v2 schema changes too.
-- Safe to run even if migration_v2.sql was already run.
-- ============================================================


-- ============================================================
-- A. Add columns from migration_v2 (idempotent — IF NOT EXISTS)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

ALTER TABLE public.fish_species
  ADD COLUMN IF NOT EXISTS identification_tips text,
  ADD COLUMN IF NOT EXISTS color_description    text,
  ADD COLUMN IF NOT EXISTS habitat              text,
  ADD COLUMN IF NOT EXISTS diet                 text,
  ADD COLUMN IF NOT EXISTS best_seasons         text[],
  ADD COLUMN IF NOT EXISTS legal_size_in        numeric,
  ADD COLUMN IF NOT EXISTS fun_fact             text,
  ADD COLUMN IF NOT EXISTS similar_species      text;

CREATE TABLE IF NOT EXISTS public.saved_spots (
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  spot_id    uuid        NOT NULL REFERENCES public.spots(id)    ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);
ALTER TABLE public.saved_spots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_spots' AND policyname = 'saved_spots_select_own') THEN
    CREATE POLICY saved_spots_select_own ON public.saved_spots FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_spots' AND policyname = 'saved_spots_insert_own') THEN
    CREATE POLICY saved_spots_insert_own ON public.saved_spots FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_spots' AND policyname = 'saved_spots_delete_own') THEN
    CREATE POLICY saved_spots_delete_own ON public.saved_spots FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.fishing_reports (
  id             uuid         NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  spot_id        uuid         NOT NULL REFERENCES public.spots(id)    ON DELETE CASCADE,
  user_id        uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_level text         NOT NULL CHECK (activity_level IN ('slow', 'moderate', 'good', 'hot')),
  water_clarity  text                  CHECK (water_clarity  IN ('clear', 'slightly_stained', 'stained', 'muddy')),
  water_temp_f   numeric(4,1),
  body           text         NOT NULL,
  created_at     timestamptz  NOT NULL DEFAULT now()
);
ALTER TABLE public.fishing_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fishing_reports' AND policyname = 'fishing_reports_select_public') THEN
    CREATE POLICY fishing_reports_select_public ON public.fishing_reports FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fishing_reports' AND policyname = 'fishing_reports_insert_own') THEN
    CREATE POLICY fishing_reports_insert_own ON public.fishing_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fishing_reports' AND policyname = 'fishing_reports_delete_own') THEN
    CREATE POLICY fishing_reports_delete_own ON public.fishing_reports FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- B. Apply v2 rich data to original 12 species
-- ============================================================

UPDATE public.fish_species SET
  identification_tips = 'Look for the broad pink-to-red lateral stripe running from gill to tail. Black spots scattered across the entire body, dorsal fin, and tail. No red spots (unlike Brown Trout). Forked tail is only slightly indented.',
  color_description   = 'Olive-green to blue-green back, silvery sides with a vivid pink or red lateral band, white belly. Small black spots densely cover the body and fins.',
  habitat             = 'Cold, clear rivers, streams, and lakes. Prefers water temperatures between 55–65°F. Thrives in highly oxygenated tailwaters below dams and in high-elevation lakes. One of the most widely stocked fish in Utah.',
  diet                = 'Opportunistic omnivore — aquatic insects (mayflies, caddisflies, midges), terrestrial insects, small fish, crustaceans, and fish eggs.',
  best_seasons        = ARRAY['spring', 'fall'],
  legal_size_in       = 15,
  fun_fact            = 'Rainbow Trout are the most stocked fish in Utah. The state releases millions each year into hundreds of waters, making them accessible to anglers nearly everywhere.',
  similar_species     = 'Brown Trout (has red spots with halos, more golden body, no pink stripe). Cutthroat Trout (has red slash marks under jaw). Brook Trout (has worm-like markings on back).'
WHERE name = 'Rainbow Trout';

UPDATE public.fish_species SET
  identification_tips = 'The definitive feature is red or orange spots surrounded by pale blue or white halos on the sides. Black spots also present but fewer. Adipose fin often has an orange edge. No red slash under jaw.',
  color_description   = 'Golden-brown to olive-brown back and sides. Creamy or yellowish belly. Distinctive red/orange spots with light halos scattered across the flanks. Black spots above the lateral line.',
  habitat             = 'Cold, clear rivers and streams with deep pools and undercut banks. More tolerant of slightly warmer water than other trout. Prefers large rivers with structure — boulders, logs, and deep runs.',
  diet                = 'Highly piscivorous compared to other trout. Also consumes large insects, crayfish, frogs, and even small mammals. Trophy fish are almost exclusively caught on large streamers or live bait.',
  best_seasons        = ARRAY['spring', 'fall', 'winter'],
  legal_size_in       = 15,
  fun_fact            = 'Brown Trout are considered the most challenging trout to catch in Utah. They are nocturnal feeders, highly wary, and the largest individuals rarely move during daylight hours.',
  similar_species     = 'Rainbow Trout (pink lateral stripe, no red-haloed spots). Cutthroat Trout (red jaw slash, spots clustered toward tail). Brook Trout (vermiculations on back, much smaller).'
WHERE name = 'Brown Trout';

UPDATE public.fish_species SET
  identification_tips = 'The name-defining feature: red, orange, or pink slash marks on both sides beneath the lower jaw. Black spots tend to be larger and clustered toward the tail and posterior body. No pink lateral stripe like Rainbow Trout.',
  color_description   = 'Bonneville Cutthroat are olive-yellow to golden with black spots clustered toward the tail. The vivid red-orange slash marks under the jaw are present on all subspecies.',
  habitat             = 'Native to Utah''s cold mountain streams, rivers, and high-elevation lakes. Found in the Green River, Bear River drainage, and many mountain reservoirs.',
  diet                = 'Aquatic and terrestrial insects, small fish, crayfish, and worms. Less selective than Brown Trout and more willing to strike a variety of presentations.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = 15,
  fun_fact            = 'The Bonneville Cutthroat Trout is the official state fish of Utah. It is native to the ancient Lake Bonneville basin and is a conservation priority species.',
  similar_species     = 'Rainbow Trout (pink lateral stripe, no jaw slash). Brown Trout (red-haloed spots, no jaw slash). Brook Trout (vermiculations, different fin coloring).'
WHERE name = 'Cutthroat Trout';

UPDATE public.fish_species SET
  identification_tips = 'The most distinctive feature is the worm-like yellowish vermiculations (wavy markings) on the back and dorsal fin — unique among Utah trout. Red spots with bright blue halos on sides. Lower fins are orange with a crisp white-then-black leading edge.',
  color_description   = 'Dark olive-green to blackish back covered in cream or yellow vermiculations. Sides have red spots circled in blue halos. Belly turns vivid orange-red on spawning males. Lower fins are brilliantly orange with white and black edges.',
  habitat             = 'Requires the coldest, cleanest water of any trout in Utah. Found in high-elevation streams and alpine lakes above 8,000 feet. Prefers small, heavily shaded mountain streams with cold spring seeps.',
  diet                = 'Insects (both aquatic and terrestrial), worms, small fish, and crustaceans. Less selective than Brown Trout — often the easiest trout to catch on basic presentations.',
  best_seasons        = ARRAY['summer', 'fall'],
  legal_size_in       = 8,
  fun_fact            = 'Despite being called a trout, Brook Trout are actually a char — more closely related to Lake Trout and Arctic Char than to Rainbow or Brown Trout.',
  similar_species     = 'Rainbow Trout (no vermiculations, pink stripe). Brown Trout (no vermiculations, red-haloed spots). Lake Trout (deeply forked tail, much larger, pale spots on dark body).'
WHERE name = 'Brook Trout';

UPDATE public.fish_species SET
  identification_tips = 'The deeply forked tail is the single most reliable identification feature — much more deeply forked than any other Utah trout. Pale cream or gray spots on a dark gray or greenish body.',
  color_description   = 'Dark gray, greenish-gray, or charcoal body covered in irregular pale cream or light gray spots. No red, orange, or pink coloration. The deeply forked tail is diagnostic.',
  habitat             = 'Deep, cold, well-oxygenated lakes. Spends most of its life at depths of 50–200 feet in water below 55°F. Primary Utah waters: Fish Lake and Flaming Gorge Reservoir.',
  diet                = 'Apex predator. Adults feed almost exclusively on fish — Utah Chub, Kokanee Salmon, and other trout. Trolling deep with large lures or jigging is most effective.',
  best_seasons        = ARRAY['spring', 'fall', 'winter'],
  legal_size_in       = 15,
  fun_fact            = 'Lake Trout, locally called "Mackinaw," can live over 60 years and reach weights exceeding 100 lbs in their native range. Fish Lake holds a self-sustaining population — a rarity for Utah.',
  similar_species     = 'Brook Trout (much smaller, vermiculations, shallow forked tail). Brown Trout (red-haloed spots, less forked tail).'
WHERE name = 'Lake Trout';

UPDATE public.fish_species SET
  identification_tips = 'Distinctive tiger stripe pattern: dark vertical bars on a lighter background (not spots). Long, flattened duck-bill snout packed with sharp teeth. Elongated torpedo body. Can reach 40+ inches in Utah.',
  color_description   = 'Light green, gold, or cream background with dark olive to black vertical bars — giving the classic "tiger" appearance. Belly is white to cream. Fins are rounded and spotted or barred.',
  habitat             = 'Warm to cool reservoirs and lakes with open water. Stocked in select Utah waters including Pineview Reservoir, Starvation Reservoir, and Yuba Reservoir.',
  diet                = 'Aggressive apex predator. Feeds almost exclusively on fish. Best targeted with large swimbaits, bucktails, and topwater lures.',
  best_seasons        = ARRAY['spring', 'fall'],
  legal_size_in       = 36,
  fun_fact            = 'Tiger Muskie are a sterile hybrid cross between Northern Pike (female) and Muskellunge (male). Utah stocks them intentionally to control overpopulated Utah Chub and other rough fish.',
  similar_species     = 'Northern Pike (spots forming chain-like pattern, not vertical bars). Muskellunge (spotted or clear-sided, not barred).'
WHERE name = 'Tiger Muskie';

UPDATE public.fish_species SET
  identification_tips = 'The glassy, opaque, marble-like eyes are the definitive identifying feature. White tip on the lower lobe of the tail fin. First dorsal fin has sharp spines with a black blotch at the rear base.',
  color_description   = 'Olive-gold to brassy back and sides. Creamy white belly. Eyes appear milky white, silver, or glassy. The bright white tip on the bottom tail lobe is highly visible.',
  habitat             = 'Prefers large, clear to slightly turbid lakes and reservoirs with moderate depth. Highly light-sensitive. Utah''s best Walleye waters: Starvation Reservoir, Jordanelle, and Willard Bay.',
  diet                = 'Primarily fish supplemented by crayfish and large insects. Most active at dawn, dusk, and night when their superior low-light vision gives them an advantage.',
  best_seasons        = ARRAY['spring', 'fall', 'winter'],
  legal_size_in       = 15,
  fun_fact            = 'Walleye are widely considered the best-tasting freshwater fish in North America. Their light-sensitive eyes make them prime targets for night fishing.',
  similar_species     = 'Sauger (smaller, spotted dorsal fin without black blotch, no white tail tip). Yellow Perch (much smaller, two separate dorsal fins, vertical bars).'
WHERE name = 'Walleye';

UPDATE public.fish_species SET
  identification_tips = 'The upper jaw extends clearly PAST the rear edge of the eye when the mouth is closed — the key difference from Smallmouth Bass. A dark, irregular horizontal stripe runs the full length of the body.',
  color_description   = 'Dark olive-green to black-green back and upper sides. Sides are lighter olive-green with a prominent dark horizontal blotch stripe. Belly is white to pale yellow.',
  habitat             = 'Warm, shallow water with abundant vegetation. Prefers temperatures of 65–80°F. Common in Utah reservoirs, ponds, and warmer portions of rivers. Key waters: Lake Powell, Sand Hollow, and Quail Creek.',
  diet                = 'Ambush predator. Eats fish, crayfish, frogs, lizards, mice, ducklings — essentially anything that fits in its large mouth.',
  best_seasons        = ARRAY['spring', 'summer'],
  legal_size_in       = 12,
  fun_fact            = 'Spring bass fishing at Sand Hollow Reservoir is considered some of the best in Utah. Largemouth move shallow during the spawn and aggressively defend nests, making them easy to sight-fish.',
  similar_species     = 'Smallmouth Bass (jaw stops at eye, vertical bars, bronze/brown color, red eyes). Spotted Bass (smaller mouth, spots below lateral line).'
WHERE name = 'Largemouth Bass';

UPDATE public.fish_species SET
  identification_tips = 'The upper jaw ends at or before the rear edge of the eye — never extending past it (unlike Largemouth). Vertical brown or olive bars on the sides. Eyes are often distinctly red or orange.',
  color_description   = 'Bronze to brown or olive-brown overall. Sides show 8–15 faint to distinct vertical dark brown bars. Belly is white to pale yellow. Eyes frequently have a reddish or orange-red iris.',
  habitat             = 'Cool to warm, clear reservoirs and rivers with rocky bottoms, gravel bars, and points. Prefers slightly cooler water than Largemouth (60–75°F). Utah''s top Smallmouth waters: Lake Powell, Flaming Gorge, and Jordanelle.',
  diet                = 'Crayfish are the primary food source, supplemented by fish, hellgrammites, and large insects. Tube jigs and crayfish-imitating crankbaits are highly effective.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = 12,
  fun_fact            = 'Smallmouth Bass are pound-for-pound regarded as the hardest-fighting freshwater fish in Utah. A 3-lb Smallmouth will out-jump and outfight a 5-lb Largemouth.',
  similar_species     = 'Largemouth Bass (jaw past eye, horizontal stripe, darker green). Spotted Bass (smaller, spots below lateral line).'
WHERE name = 'Smallmouth Bass';

UPDATE public.fish_species SET
  identification_tips = 'Eight barbels (whiskers) around the mouth. Deeply forked tail distinguishes it from Bullhead Catfish (which have rounded or slightly notched tails). Smooth, scaleless skin.',
  color_description   = 'Blue-gray to olive-gray on the back and sides, fading to a white or pale yellow belly. Juvenile fish often have scattered dark spots that fade with age.',
  habitat             = 'Warm rivers, reservoirs, and ponds with soft or sandy bottoms. Major Utah Catfish waters: Utah Lake, the Green River, and Willard Bay.',
  diet                = 'Opportunistic bottom feeder and active predator. Eats fish, crayfish, insects, worms, clams, and carrion.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = 12,
  fun_fact            = 'Channel Catfish have taste buds covering their entire body — not just their mouths. A 6-inch Catfish has roughly 250,000 taste buds, more than any other vertebrate.',
  similar_species     = 'Blue Catfish (straight anal fin edge, no spots). Bullhead Catfish (rounded tail, smaller and stubbier). Flathead Catfish (flat broad head, squared tail).'
WHERE name = 'Channel Catfish';


-- ============================================================
-- 0. Fix name mismatch from schema.sql seed vs migration_v2
--    (schema seeded "Carp" and "Perch"; v2 tried to UPDATE
--     "Common Carp" and "Yellow Perch" which silently missed)
-- ============================================================

UPDATE public.fish_species SET name = 'Common Carp'  WHERE name = 'Carp';
UPDATE public.fish_species SET name = 'Yellow Perch' WHERE name = 'Perch';

-- Re-apply the v2 rich-data updates that missed due to the name mismatch
UPDATE public.fish_species SET
  identification_tips = 'Large, heavy scales covering the body. Four barbels near the mouth — two short ones on the snout tip and two longer ones at the corners of the mouth. Long dorsal fin with a serrated front spine. Deeply sub-terminal (downward-pointing) mouth designed for bottom feeding. Often visible "tailing" or "mudding" in shallow water.',
  color_description   = 'Olive-gold to brassy-yellow or brownish-gold scales, often with a slightly darker back. Belly is pale yellow to white. Fins are darker — olive to reddish-brown. Mirror Carp (a variant) have large, irregular scales in patches.',
  habitat             = 'Extremely adaptable. Found in warm lakes, slow rivers, reservoirs, and ponds throughout Utah. Tolerates low oxygen, warm temperatures, and turbid water. Utah Lake hosts one of the densest Carp populations in the western U.S.',
  diet                = 'Bottom feeder. Roots through mud and vegetation for aquatic insects, worms, crustaceans, plant material, and seeds. Can be targeted with corn, boilies, dough baits, or dry flies during feeding activity.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = NULL,
  fun_fact            = 'Common Carp are increasingly pursued by fly anglers as the "golden bonefish." Sight-fishing for tailing Carp in the shallows of Utah Lake with a fly rod is a genuine technical challenge.',
  similar_species     = 'Bigmouth Buffalo (no barbels, smaller scales). Goldfish (much smaller, no barbels in most forms). Grass Carp (elongated, silver-green, no snout barbels).'
WHERE name = 'Common Carp';

UPDATE public.fish_species SET
  identification_tips = 'Six to eight dark vertical bars on a golden-yellow body are unmistakable. Two completely separate dorsal fins — the first spiny, the second soft — with a clear gap between them. Lower fins (pelvic and anal) are often vivid orange or orange-red, especially on males.',
  color_description   = 'Bright golden-yellow to olive-yellow body with 6–8 dark olive to black vertical bars. Belly is pale white to yellowish. Lower fins are orange to orange-red.',
  habitat             = 'Clear, cool to moderately warm lakes and reservoirs. Highly schooling fish that roam open water and weed edges. One of Utah''s premier ice fishing targets. Key waters: Scofield Reservoir, Strawberry Reservoir, and Fish Lake.',
  diet                = 'Small fish, aquatic insects, worms, small crayfish, and zooplankton. Very responsive to small jigs tipped with wax worms, especially through the ice.',
  best_seasons        = ARRAY['winter', 'spring', 'fall'],
  legal_size_in       = 9,
  fun_fact            = 'Yellow Perch are Utah''s top ice fishing target. Scofield Reservoir draws thousands of ice anglers each winter specifically for its dense Perch population.',
  similar_species     = 'Walleye (much larger, glassy eyes, white tail tip). Smallmouth Bass (much larger, different fin structure). Iowa Darter (tiny, bottom dweller).'
WHERE name = 'Yellow Perch';


-- ============================================================
-- 1. ADD NEW SPECIES
-- ============================================================

INSERT INTO public.fish_species
  (name, description, identification_tips, color_description, habitat, diet,
   best_seasons, legal_size_in, fun_fact, similar_species)
VALUES

-- Kokanee Salmon
(
  'Kokanee Salmon',
  'Landlocked Sockeye Salmon. One of Utah''s most popular sport fish — famous for acrobatic fights and excellent table fare.',
  'Slender, torpedo-shaped body with a forked tail. During most of the year, silvery with black spots on the back only (no spots on body sides — key difference from trout). Spawning fish turn vivid red with green heads; males develop a hooked jaw (kype). Adipose fin present.',
  'Non-spawning fish are brilliant silver on the sides with a blue-green back and white belly. In fall, spawning fish transform dramatically to brick-red or crimson on the sides with a distinctly green head. Males develop a pronounced hooked jaw and humped back.',
  'Cold, deep, well-oxygenated lakes and reservoirs. Spend most of the year in open water at depths of 30–80 feet, following schools of zooplankton. Utah''s best Kokanee waters: Flaming Gorge Reservoir (world-class), Strawberry Reservoir, Pineview Reservoir, and Causey Reservoir.',
  'Filter feeder and active predator of zooplankton (Daphnia, copepods) and small insects. During spawning runs they stop feeding. Best caught trolling with small dodgers + wedding ring spinners at the right depth.',
  ARRAY['summer', 'fall'],
  15,
  'Kokanee Salmon die after spawning — unlike steelhead or other trout. This makes fall fishing in tributaries like the Sheep Creek arm of Flaming Gorge a brief but spectacular event, with fish stacking up in massive numbers.',
  'Rainbow Trout (spots cover the whole body, pink lateral stripe). Cutthroat Trout (red jaw slash, spots everywhere). Sockeye Salmon (nearly identical — Kokanee IS a landlocked Sockeye).'
),

-- Bluegill
(
  'Bluegill',
  'Most abundant sunfish in Utah. A classic beginner fish and excellent table fare that can be found in warm ponds, lakes, and slow rivers.',
  'Round, highly compressed (tall and flat) body — noticeably taller than it is wide. A distinctive dark blue-black "ear flap" (opercular flap) with no red or orange edge (unlike other sunfish). The name-giving blue-purple iridescence on the lower jaw and cheeks. Dark vertical bars on the sides.',
  'Olive to dark green on the back, shading to golden-yellow or orange on the belly — especially vivid on breeding males. The ear flap is solid dark blue-black. Sides show 7–8 faint dark vertical bars. Breeding males develop an intense orange-red chest.',
  'Warm, shallow water with vegetation. Ponds, reservoirs, and the slow backwaters of rivers. Builds nests in gravel shallows in colonies. Common throughout Utah''s lower-elevation waters. Found at Willard Bay, Utah Lake, Sand Hollow, and most warm-water ponds.',
  'Aquatic insects, small crustaceans, worms, small fish, and zooplankton. Extremely susceptible to small jigs, wax worms, crickets, and any small natural bait. One of the easiest Utah fish to catch on a fly or light spinning setup.',
  ARRAY['spring', 'summer'],
  7,
  'Bluegill are the most caught fish in North America. A single colony nest bed can contain dozens of spawning pairs and thousands of eggs. Males aggressively guard nests and will strike at nearly anything — making them perfect for introducing kids to fishing.',
  'Green Sunfish (larger mouth, more elongated, blue-green streaks on face). Pumpkinseed Sunfish (orange-red spot on ear flap). Redear Sunfish (red or orange border on ear flap). Warmouth (larger mouth, mottled pattern).'
),

-- Black Crappie
(
  'Black Crappie',
  'Premium panfish prized for large size and excellent flavor. Schools heavily and can be caught in large numbers when found.',
  'Roughly circular, highly compressed body. Both dorsal fins are connected — 7 or 8 spines in the first section (White Crappie has 5–6 spines — the easiest way to tell them apart). Mottled black and silver pattern with no clearly defined vertical bars. Large upturned mouth for a panfish.',
  'Silver to olive-gray with irregular black, dark green, or olive mottling covering the entire body. No consistent vertical bars like White Crappie. The dark mottling is denser and less organized. Fins are translucent with dark spotting.',
  'Clear, moderately vegetated lakes and reservoirs. Prefers slightly cooler and clearer water than White Crappie. Schools around submerged structure — brush piles, docks, and timber. Utah Crappie waters: Willard Bay, Pelican Lake, and selected southern Utah reservoirs.',
  'Fish, large aquatic insects, crustaceans, and zooplankton. Highly responsive to small tube jigs, crappie jigs, small swimbaits, and live minnows. Best targeted vertically over deep structure in winter and spring.',
  ARRAY['spring', 'fall', 'winter'],
  9,
  'Black Crappie are most active at night during summer, moving into shallow water to feed. A good crappie spot can hold fish for years — experienced anglers guard their brush pile locations like secrets.',
  'White Crappie (5–6 dorsal spines, defined vertical bars, slightly more elongated). Bluegill (smaller mouth, ear flap, no mottled pattern). Rock Bass (red eyes, more round body, less mottling).'
),

-- Splake
(
  'Splake',
  'A hybrid cross between Lake Trout (female) and Brook Trout (male). Stocked in select Utah high-elevation lakes including Fish Lake.',
  'Intermediate features between parent species. Has the vermiculations (worm-like markings) of Brook Trout on the back, but the pale spots on a darker body and forked tail of Lake Trout. Tail is moderately forked — not as deeply forked as Lake Trout, not as square as Brook Trout.',
  'Dark olive to gray-green back with cream or yellow vermiculations (less distinct than Brook Trout). Pale spots on sides. Red spots with blue halos may be faint to absent. Lower fins show partial Brook Trout coloring with a white leading edge. Belly is lighter.',
  'Cold, deep mountain lakes. Fish Lake in central Utah is the premier Splake destination in the state. Like Lake Trout, they prefer deep, cold water in summer but move shallower in fall and winter. Often taken on the same techniques as Lake Trout.',
  'Fish, large aquatic invertebrates, and crustaceans. Less selective than pure Lake Trout — more willing to strike a variety of lures at varied depths. Jigging with tube jigs or spoons near the bottom is highly effective.',
  ARRAY['fall', 'winter', 'spring'],
  15,
  'Splake are fertile — unlike most fish hybrids. Fish Lake''s Splake population is partly self-sustaining due to successful natural reproduction, which is rare for a hybrid fish.',
  'Lake Trout (deeply forked tail, no vermiculations, uniformly pale spots). Brook Trout (squarer tail, brighter colors, more vivid vermiculations and spots). Tiger Trout (another hybrid — brown spots on cream background, very different pattern).'
),

-- Wiper
(
  'Wiper',
  'Hybrid cross between White Bass (female) and Striped Bass (male). A powerhouse sport fish stocked in Utah — famous for explosive surface strikes. Willard Bay is Utah''s top Wiper destination.',
  'Chunky, powerful body with multiple horizontal black stripes on silver sides — stripes are broken and irregular (unlike the cleaner stripes of Striped Bass). Lower jaw slightly protrudes. Two connected dorsal fins with stiff spines. A tooth patch on the tongue (check carefully — use a rag).',
  'Bright silver sides with 4–7 broken horizontal black stripes. Back is dark olive-gray to blue-black. Belly is white. The striping pattern is less clean than Striped Bass — stripes often break or are discontinuous on the lower body. Overall a very silver, streamlined fish.',
  'Large, open reservoirs with a healthy shad population. Willard Bay Reservoir is the jewel of Utah Wiper fishing. Also stocked at Yuba Reservoir, East Canyon Reservoir, and Rockport Reservoir. Schools chase shad to the surface in violent boils — a spectacular sight.',
  'Almost entirely a fish-eater. In Utah, primarily prey on Gizzard Shad. Surface boils (schools of Wipers chasing shad to the surface) are a summer phenomenon. Best caught with topwater lures, swimbaits, and white spinnerbaits during feeding activity. Also caught jigging deep in winter.',
  ARRAY['spring', 'summer', 'fall'],
  12,
  'Wiper boils at Willard Bay are legendary among Utah anglers. Schools of Wipers trap Gizzard Shad against the surface and explode in feeding frenzies that can involve hundreds of fish — any lure thrown into the boil will get hit.',
  'Striped Bass (cleaner, unbroken horizontal stripes, larger, not stocked in Utah). White Bass (much smaller, fewer stripes, deeper body). Yellow Bass (vertical bars, smaller).'
),

-- Striped Bass
(
  'Striped Bass',
  'One of the largest sport fish available in Utah. Lake Powell holds a substantial Striped Bass population and produces trophy fish exceeding 30 lbs.',
  'Long, streamlined, powerful body with 7–8 distinct, continuous horizontal black stripes running the full length of the body on silver sides. Two separate dorsal fins. Lower jaw projects slightly beyond upper jaw. Tooth patch on tongue. Much larger and more elongated than the similar Wiper.',
  'Bright silver-white sides with 7–8 bold, unbroken horizontal black stripes — these are cleaner and more continuous than a Wiper''s. Back is dark green to blue-black. Belly is pure white.',
  'Large, warm reservoirs with abundant open-water forage. Lake Powell is Utah''s primary Striped Bass water — the fish moved upstream from Lake Mead via the Colorado River and established a thriving population. Also found in Navajo Reservoir. Prefer open water, often at depth during summer.',
  'Shad and other baitfish are the primary prey. Follow shad schools through the water column. Surface boils occur when chasing shad into shallow bays or coves. Best caught trolling large plugs, throwing topwater lures into surface feeds, or jigging with large swimbaits.',
  ARRAY['spring', 'fall', 'winter'],
  18,
  'Striped Bass in Lake Powell are not stocked by Utah — they naturally colonized from the Colorado River system via Lake Mead. Trophy fish exceeding 30–40 lbs are caught each year, and the population has no signs of declining.',
  'Wiper (broken/irregular stripes, chunkier body, sterile hybrid). White Bass (much smaller, fewer stripes, found in calmer water). Largemouth Bass (completely different body shape, no stripes).'
),

-- Northern Pike
(
  'Northern Pike',
  'A large, aggressive predator with a distinctive chain-link spot pattern. Stocked in select northern Utah waters, primarily Pineview Reservoir and Red Fleet Reservoir.',
  'Long, torpedo-shaped body with a flat, duck-bill-like snout packed with sharp teeth. Dorsal and anal fins are set far back on the body, near the tail. The definitive ID feature: cream or yellow bean-shaped spots arranged in rows on olive-green or dark sides — forming a chain-link pattern.',
  'Dark olive-green to brown-green body with cream or pale yellow oval spots arranged in horizontal rows — the iconic "chain" pattern. Belly is white to cream. Fins are spotted or barred. Very large mouth with rows of sharp teeth visible.',
  'Cool to warm lakes, reservoirs, and slow rivers with abundant vegetation and structure. Pineview Reservoir in northern Utah is the most accessible Pike water. Red Fleet Reservoir in the Uinta Basin also has Pike. Lurks in weed edges, points, and shallow cover, ambushing prey.',
  'Aggressive apex predator. Eats fish almost exclusively — no forage fish is too big to attempt. Also takes ducklings, frogs, and small mammals. Best targeted with large bucktail spinners, spoons, and large swimbaits or topwater lures worked along weed edges.',
  ARRAY['spring', 'fall', 'winter'],
  24,
  'Northern Pike in Utah are stocked by the Utah DWR in specific waters to provide a trophy predator fishery. Pineview Reservoir receives annual stockings and has produced Pike exceeding 20 lbs. Pike are most active in cold water — winter and early spring fishing can be exceptional.',
  'Tiger Muskie (vertical dark bars on lighter background, rounder tail fin). Muskellunge (no or few spots, different spotting pattern). Chain Pickerel (much smaller, very similar chain pattern — check size and location).'
)
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- 2. ADD MORE UTAH SPOTS
-- ============================================================

INSERT INTO public.spots
  (name, description, latitude, longitude, water_type, access_notes, created_by, approved)
VALUES
  (
    'Scofield Reservoir',
    'Utah''s premier perch and trout fishery. World-class ice fishing destination in winter with massive Yellow Perch populations and quality Rainbow Trout.',
    39.8265, -111.1403, 'reservoir',
    'Located on SR-96 near the town of Scofield. Developed boat ramps and camping at both ends of the reservoir. Day use fee in season. Road can be snowy and icy in winter — 4WD recommended.',
    NULL, TRUE
  ),
  (
    'Utah Lake',
    'Utah''s largest natural freshwater lake and a top destination for catfish, carp, walleye, and bass. Excellent carp fly fishing in the shallows.',
    40.1988, -111.7952, 'lake',
    'Multiple access points around the lake. Provo Boat Harbor is the most popular launch. Lincoln Beach and Saratoga Springs areas offer good shore access. Free public access from many points.',
    NULL, TRUE
  ),
  (
    'Pineview Reservoir',
    'Northern Utah reservoir famous for Tiger Muskie, Kokanee Salmon, and Rainbow Trout. One of the only reliable muskie fisheries in the state.',
    41.2720, -111.8340, 'reservoir',
    'Located east of Ogden near Huntsville on SR-39. Anderson Cove and Pineview boat ramp provide access. Day use fee required at recreation areas. Muskie anglers should have 100+ lb leader.',
    NULL, TRUE
  ),
  (
    'Willard Bay Reservoir',
    'Utah''s #1 Wiper fishery and top Catfish destination. Famous for spectacular surface boils when Wipers chase Gizzard Shad to the surface.',
    41.3917, -112.0997, 'reservoir',
    'Located just off I-15 north of Ogden. North and South Marinas with boat ramps and amenities. Day use fee required. Wiper boils typically occur May–October on calm mornings.',
    NULL, TRUE
  ),
  (
    'Sand Hollow Reservoir',
    'Premier warm-water fishery in southern Utah (St. George area). Top Largemouth Bass and Wiper destination with some of the warmest water in the state.',
    37.1271, -113.3810, 'reservoir',
    'Located near Hurricane, UT off SR-9 in Sand Hollow State Park. Full-service marina with boat rentals. Day use and camping fees apply. Water warms quickly — bass spawn earlier here than anywhere else in Utah.',
    NULL, TRUE
  ),
  (
    'Deer Creek Reservoir',
    'Mid-sized reservoir near Provo with excellent Rainbow Trout and a developing walleye population. Popular with both boat and shore anglers.',
    40.4069, -111.5315, 'reservoir',
    'Located on US-189 in Provo Canyon. Boat ramp at the south end near Wallsburg. Shore access along the highway. Strong afternoon winds are common — morning fishing recommended.',
    NULL, TRUE
  ),
  (
    'Causey Reservoir',
    'Small, quiet reservoir in northern Utah''s Ogden Valley. Excellent Kokanee Salmon fishery with consistent catches. Less crowded than nearby Pineview.',
    41.3020, -111.6130, 'reservoir',
    'Located on Forest Road 058 above Huntsville. Narrow road — not recommended for large trailers. Small boat ramp and primitive camping. No fee. Road closes in winter.',
    NULL, TRUE
  ),
  (
    'Rockport Reservoir',
    'Summit County reservoir stocked heavily with Rainbow Trout and Smallmouth Bass. Good ice fishing in winter and pleasant summer boating.',
    40.7684, -111.3926, 'reservoir',
    'Located on US-189/SR-32 east of Wanship. Developed boat ramp and camping at Rockport State Park. Day use fee required.',
    NULL, TRUE
  ),
  (
    'Bear Lake',
    'Utah''s "Caribbean of the Rockies" — a stunning turquoise lake on the Utah-Idaho border. Home to several endemic species and quality Bear Lake Cisco fishery.',
    41.9531, -111.3307, 'lake',
    'Located in Garden City, UT on US-89. Full-service marina and state park facilities. Deep lake — Mackinaw and Cisco fishing requires downriggers or deep jigging. Cisco (cisco) run in January creates unique dip-net fishery.',
    NULL, TRUE
  ),
  (
    'Green River (Below Flaming Gorge)',
    'World-class tailwater trout fishery below Flaming Gorge Dam. The A-section (Little Hole to Browns Park) is catch-and-release only and holds massive Brown and Rainbow Trout.',
    40.9094, -109.4197, 'river',
    'Access via Dutch John, UT. Float trips from the dam to Little Hole (7 miles) or Little Hole to Browns Park (9 miles) are the most popular. Walk-in access at Little Hole Day Use Area. Rafts and drift boats recommended. No wading in A-section during high releases.',
    NULL, TRUE
  );

-- Remove duplicate spots that may have been inserted by a previous run
DELETE FROM public.spots a
  USING public.spots b
  WHERE a.id > b.id
    AND a.name = b.name
    AND a.created_by IS NULL;


-- ============================================================
-- 3. SPOT-FISH ASSOCIATIONS
--    Using name lookups so UUIDs don''t need to be hardcoded
-- ============================================================

-- Helper: insert spot_fish by name, ignore if already exists
-- Format: (spot_name, fish_name)

DO $$
DECLARE
  spot_species TEXT[][] := ARRAY[
    -- Strawberry Reservoir
    ARRAY['Strawberry Reservoir', 'Rainbow Trout'],
    ARRAY['Strawberry Reservoir', 'Cutthroat Trout'],
    ARRAY['Strawberry Reservoir', 'Kokanee Salmon'],
    ARRAY['Strawberry Reservoir', 'Yellow Perch'],
    ARRAY['Strawberry Reservoir', 'Brown Trout'],

    -- Provo River (Lower)
    ARRAY['Provo River (Lower)', 'Rainbow Trout'],
    ARRAY['Provo River (Lower)', 'Brown Trout'],
    ARRAY['Provo River (Lower)', 'Cutthroat Trout'],
    ARRAY['Provo River (Lower)', 'Brook Trout'],

    -- Flaming Gorge Reservoir
    ARRAY['Flaming Gorge Reservoir', 'Lake Trout'],
    ARRAY['Flaming Gorge Reservoir', 'Kokanee Salmon'],
    ARRAY['Flaming Gorge Reservoir', 'Smallmouth Bass'],
    ARRAY['Flaming Gorge Reservoir', 'Rainbow Trout'],
    ARRAY['Flaming Gorge Reservoir', 'Brown Trout'],
    ARRAY['Flaming Gorge Reservoir', 'Yellow Perch'],

    -- Fish Lake
    ARRAY['Fish Lake', 'Lake Trout'],
    ARRAY['Fish Lake', 'Splake'],
    ARRAY['Fish Lake', 'Rainbow Trout'],
    ARRAY['Fish Lake', 'Brown Trout'],
    ARRAY['Fish Lake', 'Yellow Perch'],

    -- Jordanelle Reservoir
    ARRAY['Jordanelle Reservoir', 'Walleye'],
    ARRAY['Jordanelle Reservoir', 'Smallmouth Bass'],
    ARRAY['Jordanelle Reservoir', 'Rainbow Trout'],
    ARRAY['Jordanelle Reservoir', 'Yellow Perch'],
    ARRAY['Jordanelle Reservoir', 'Brown Trout'],

    -- Scofield Reservoir
    ARRAY['Scofield Reservoir', 'Yellow Perch'],
    ARRAY['Scofield Reservoir', 'Rainbow Trout'],
    ARRAY['Scofield Reservoir', 'Brown Trout'],
    ARRAY['Scofield Reservoir', 'Cutthroat Trout'],

    -- Utah Lake
    ARRAY['Utah Lake', 'Channel Catfish'],
    ARRAY['Utah Lake', 'Common Carp'],
    ARRAY['Utah Lake', 'Walleye'],
    ARRAY['Utah Lake', 'Largemouth Bass'],
    ARRAY['Utah Lake', 'White Bass'],
    ARRAY['Utah Lake', 'Yellow Perch'],
    ARRAY['Utah Lake', 'Black Crappie'],

    -- Pineview Reservoir
    ARRAY['Pineview Reservoir', 'Tiger Muskie'],
    ARRAY['Pineview Reservoir', 'Kokanee Salmon'],
    ARRAY['Pineview Reservoir', 'Rainbow Trout'],
    ARRAY['Pineview Reservoir', 'Yellow Perch'],
    ARRAY['Pineview Reservoir', 'Brown Trout'],
    ARRAY['Pineview Reservoir', 'Northern Pike'],

    -- Willard Bay Reservoir
    ARRAY['Willard Bay Reservoir', 'Wiper'],
    ARRAY['Willard Bay Reservoir', 'Channel Catfish'],
    ARRAY['Willard Bay Reservoir', 'Walleye'],
    ARRAY['Willard Bay Reservoir', 'Black Crappie'],
    ARRAY['Willard Bay Reservoir', 'Bluegill'],
    ARRAY['Willard Bay Reservoir', 'Largemouth Bass'],
    ARRAY['Willard Bay Reservoir', 'Smallmouth Bass'],

    -- Sand Hollow Reservoir
    ARRAY['Sand Hollow Reservoir', 'Largemouth Bass'],
    ARRAY['Sand Hollow Reservoir', 'Smallmouth Bass'],
    ARRAY['Sand Hollow Reservoir', 'Wiper'],
    ARRAY['Sand Hollow Reservoir', 'Rainbow Trout'],
    ARRAY['Sand Hollow Reservoir', 'Bluegill'],
    ARRAY['Sand Hollow Reservoir', 'Channel Catfish'],

    -- Deer Creek Reservoir
    ARRAY['Deer Creek Reservoir', 'Rainbow Trout'],
    ARRAY['Deer Creek Reservoir', 'Brown Trout'],
    ARRAY['Deer Creek Reservoir', 'Walleye'],
    ARRAY['Deer Creek Reservoir', 'Yellow Perch'],

    -- Causey Reservoir
    ARRAY['Causey Reservoir', 'Kokanee Salmon'],
    ARRAY['Causey Reservoir', 'Rainbow Trout'],
    ARRAY['Causey Reservoir', 'Brown Trout'],

    -- Rockport Reservoir
    ARRAY['Rockport Reservoir', 'Rainbow Trout'],
    ARRAY['Rockport Reservoir', 'Smallmouth Bass'],
    ARRAY['Rockport Reservoir', 'Brown Trout'],
    ARRAY['Rockport Reservoir', 'Yellow Perch'],

    -- Bear Lake
    ARRAY['Bear Lake', 'Lake Trout'],
    ARRAY['Bear Lake', 'Rainbow Trout'],
    ARRAY['Bear Lake', 'Cutthroat Trout'],
    ARRAY['Bear Lake', 'Yellow Perch'],

    -- Green River (Below Flaming Gorge)
    ARRAY['Green River (Below Flaming Gorge)', 'Rainbow Trout'],
    ARRAY['Green River (Below Flaming Gorge)', 'Brown Trout'],
    ARRAY['Green River (Below Flaming Gorge)', 'Cutthroat Trout']
  ];
  pair TEXT[];
  v_spot_id UUID;
  v_fish_id UUID;
BEGIN
  FOREACH pair SLICE 1 IN ARRAY spot_species LOOP
    SELECT id INTO v_spot_id FROM public.spots WHERE name = pair[1];
    SELECT id INTO v_fish_id FROM public.fish_species WHERE name = pair[2];
    IF v_spot_id IS NOT NULL AND v_fish_id IS NOT NULL THEN
      INSERT INTO public.spot_fish (spot_id, fish_id)
      VALUES (v_spot_id, v_fish_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;


-- ============================================================
-- DONE
-- Run this entire file in the Supabase SQL editor.
-- ============================================================
