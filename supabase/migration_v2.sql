-- ============================================================
-- migration_v2.sql
-- Utah Fishing App - Supabase Migration (v2)
-- ============================================================
-- STORAGE: Create a public bucket called 'catch-photos' in
--   Supabase Dashboard > Storage.
--   Set it to Public, and allow image file types:
--   jpeg, png, webp, heic
-- ============================================================


-- ============================================================
-- 1. ALTER profiles — add is_admin
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;


-- ============================================================
-- 2. ALTER fish_species — add rich data columns
-- ============================================================

ALTER TABLE public.fish_species
  ADD COLUMN IF NOT EXISTS identification_tips text,
  ADD COLUMN IF NOT EXISTS color_description    text,
  ADD COLUMN IF NOT EXISTS habitat              text,
  ADD COLUMN IF NOT EXISTS diet                 text,
  ADD COLUMN IF NOT EXISTS best_seasons         text[],
  ADD COLUMN IF NOT EXISTS legal_size_in        numeric,
  ADD COLUMN IF NOT EXISTS fun_fact             text,
  ADD COLUMN IF NOT EXISTS similar_species      text;


-- ============================================================
-- 3. UPDATE fish_species with rich, accurate Utah fish data
-- ============================================================

-- Rainbow Trout
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

-- Brown Trout
UPDATE public.fish_species SET
  identification_tips = 'The definitive feature is red or orange spots surrounded by pale blue or white halos on the sides. Black spots also present but fewer. Adipose fin often has an orange edge. No red slash under jaw.',
  color_description   = 'Golden-brown to olive-brown back and sides. Creamy or yellowish belly. Distinctive red/orange spots with light halos scattered across the flanks. Black spots above the lateral line.',
  habitat             = 'Cold, clear rivers and streams with deep pools and undercut banks. More tolerant of slightly warmer water than other trout. Prefers large rivers with structure — boulders, logs, and deep runs.',
  diet                = 'Highly piscivorous (fish-eating) compared to other trout. Also consumes large insects, crayfish, frogs, and even small mammals. Trophy fish are almost exclusively caught on large streamers or live bait.',
  best_seasons        = ARRAY['spring', 'fall', 'winter'],
  legal_size_in       = 15,
  fun_fact            = 'Brown Trout are considered the most challenging trout to catch in Utah. They are nocturnal feeders, highly wary, and the largest individuals rarely move during daylight hours.',
  similar_species     = 'Rainbow Trout (pink lateral stripe, no red-haloed spots). Cutthroat Trout (red jaw slash, spots clustered toward tail). Brook Trout (vermiculations on back, much smaller).'
WHERE name = 'Brown Trout';

-- Cutthroat Trout
UPDATE public.fish_species SET
  identification_tips = 'The name-defining feature: red, orange, or pink slash marks on both sides beneath the lower jaw. Black spots tend to be larger and clustered toward the tail and posterior body. No pink lateral stripe like Rainbow Trout.',
  color_description   = 'Coloration varies by subspecies. Bonneville Cutthroat (Utah state fish) are olive-yellow to golden with black spots clustered toward the tail. The vivid red-orange slash marks under the jaw are present on all subspecies.',
  habitat             = 'Native to Utah''s cold mountain streams, rivers, and high-elevation lakes. Bonneville Cutthroat historically occupied the Bonneville Basin. Found in the Green River, Bear River drainage, and many mountain reservoirs.',
  diet                = 'Aquatic and terrestrial insects, small fish, crayfish, and worms. Less selective than Brown Trout and more willing to strike a variety of presentations.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = 15,
  fun_fact            = 'The Bonneville Cutthroat Trout is the official state fish of Utah. It is native to the ancient Lake Bonneville basin and is a conservation priority species.',
  similar_species     = 'Rainbow Trout (pink lateral stripe, no jaw slash). Brown Trout (red-haloed spots, no jaw slash). Brook Trout (vermiculations, different fin coloring).'
WHERE name = 'Cutthroat Trout';

-- Brook Trout
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

-- Lake Trout
UPDATE public.fish_species SET
  identification_tips = 'The deeply forked tail is the single most reliable identification feature — much more deeply forked than any other Utah trout. Pale cream or gray spots on a dark gray or greenish body. Irregular pale spots extend onto dorsal and tail fins.',
  color_description   = 'Dark gray, greenish-gray, or charcoal body covered in irregular pale cream or light gray spots. No red, orange, or pink coloration. Belly is lighter gray to white. The deeply forked tail is diagnostic.',
  habitat             = 'Deep, cold, well-oxygenated lakes. Spends most of its life at depths of 50–200 feet in water below 55°F. Primary Utah waters: Fish Lake and Flaming Gorge Reservoir. Avoids warm, shallow bays.',
  diet                = 'Apex predator. Adults feed almost exclusively on fish — Utah Chub, Kokanee Salmon, and other trout. Also consumes crayfish and aquatic invertebrates. Trolling deep with large lures or jigging is most effective.',
  best_seasons        = ARRAY['spring', 'fall', 'winter'],
  legal_size_in       = 15,
  fun_fact            = 'Lake Trout, locally called "Mackinaw," can live over 60 years and reach weights exceeding 100 lbs in their native range. Fish Lake in Utah holds a self-sustaining population — a rarity for Utah.',
  similar_species     = 'Brook Trout (much smaller, vermiculations, shallow forked tail). Brown Trout (red-haloed spots, less forked tail). Burbot (eel-like, very different body shape).'
WHERE name = 'Lake Trout';

-- Tiger Muskie
UPDATE public.fish_species SET
  identification_tips = 'Distinctive tiger stripe pattern: dark vertical bars on a lighter background (not spots like true Muskies or Pike). Long, flattened duck-bill snout packed with sharp teeth. Elongated torpedo body. Can reach 40+ inches in Utah.',
  color_description   = 'Light green, gold, or cream background with dark olive to black vertical bars — giving the classic "tiger" appearance. Belly is white to cream. Fins are rounded and spotted or barred.',
  habitat             = 'Warm to cool reservoirs and lakes with open water. Stocked in select Utah waters including Pineview Reservoir, Starvation Reservoir, and Yuba Reservoir. Lurks near weed edges, points, and drop-offs.',
  diet                = 'Aggressive apex predator. Feeds almost exclusively on fish. Also takes frogs, ducklings, and small mammals. Best targeted with large swimbaits, bucktails, and topwater lures.',
  best_seasons        = ARRAY['spring', 'fall'],
  legal_size_in       = 36,
  fun_fact            = 'Tiger Muskie are a sterile hybrid cross between Northern Pike (female) and Muskellunge (male). Utah stocks them intentionally in certain waters to control overpopulated Utah Chub and other rough fish.',
  similar_species     = 'Northern Pike (spots forming chain-like pattern, not vertical bars). Muskellunge (spotted or clear-sided, not barred). Pickerel (much smaller, similar pattern).'
WHERE name = 'Tiger Muskie';

-- Walleye
UPDATE public.fish_species SET
  identification_tips = 'The glassy, opaque, marble-like eyes are the definitive identifying feature — caused by a reflective layer (tapetum lucidum) that makes them shine in light. White tip on the lower lobe of the tail fin. First dorsal fin has sharp spines with a black blotch at the rear base.',
  color_description   = 'Olive-gold to brassy back and sides with a mottled or brassy pattern. Creamy white belly. Eyes appear milky white, silver, or glassy. The bright white tip on the bottom tail lobe is highly visible in the water.',
  habitat             = 'Prefers large, clear to slightly turbid lakes and reservoirs with moderate depth. Highly light-sensitive — retreats to deep water or shaded structure during bright daylight. Utah''s best Walleye waters include Starvation Reservoir, Jordanelle, and Willard Bay.',
  diet                = 'Primarily fish (perch, shad, chubs), supplemented by crayfish and large insects. Most active feeders at dawn, dusk, and night when their superior low-light vision gives them an advantage over prey.',
  best_seasons        = ARRAY['spring', 'fall', 'winter'],
  legal_size_in       = 15,
  fun_fact            = 'Walleye are widely considered the best-tasting freshwater fish in North America. Their light-sensitive eyes make them prime targets for night fishing with lighted bobbers or glow jigs.',
  similar_species     = 'Sauger (smaller, spotted dorsal fin without black blotch, no white tail tip). Yellow Perch (much smaller, two separate dorsal fins, vertical bars). Largemouth Bass (completely different body shape).'
WHERE name = 'Walleye';

-- Largemouth Bass
UPDATE public.fish_species SET
  identification_tips = 'The upper jaw extends clearly PAST the rear edge of the eye when the mouth is closed — the key difference from Smallmouth Bass. A dark, irregular horizontal stripe runs the full length of the body. Dorsal fin has a deep notch nearly separating the spiny and soft sections.',
  color_description   = 'Dark olive-green to black-green back and upper sides. Sides are lighter olive-green with a prominent dark horizontal blotch stripe. Belly is white to pale yellow. Fins are darker olive-green to gray.',
  habitat             = 'Warm, shallow water with abundant vegetation — lily pads, submerged weeds, cattails, and docks. Prefers temperatures of 65–80°F. Common in Utah reservoirs, ponds, and the warmer portions of rivers. Key waters: Lake Powell, Sand Hollow, and Quail Creek.',
  diet                = 'Ambush predator. Eats fish, crayfish, frogs, lizards, mice, ducklings — essentially anything that fits in its large mouth. Explosive surface strikes on topwater lures are a hallmark.',
  best_seasons        = ARRAY['spring', 'summer'],
  legal_size_in       = 12,
  fun_fact            = 'Spring bass fishing at Sand Hollow Reservoir is considered some of the best in Utah. Largemouth move shallow during the spawn (water temps 60–70°F) and aggressively defend nests, making them easy to sight-fish.',
  similar_species     = 'Smallmouth Bass (jaw stops at eye, vertical bars, bronze/brown color, red eyes). Spotted Bass (smaller mouth, spots below lateral line). Guadalupe Bass (only in Texas).'
WHERE name = 'Largemouth Bass';

-- Smallmouth Bass
UPDATE public.fish_species SET
  identification_tips = 'The upper jaw ends at or before the rear edge of the eye — never extending past it (unlike Largemouth). Vertical brown or olive bars on the sides (Largemouth has a horizontal stripe). Eyes are often distinctly red or orange. More streamlined body than Largemouth.',
  color_description   = 'Bronze to brown or olive-brown overall. Sides show 8–15 faint to distinct vertical dark brown bars. Belly is white to pale yellow. Eyes frequently have a reddish or orange-red iris — a subtle but useful ID clue.',
  habitat             = 'Cool to warm, clear reservoirs and rivers with rocky bottoms, gravel bars, and points. Prefers slightly cooler water than Largemouth (60–75°F). Utah''s top Smallmouth waters: Lake Powell (arguably the best in the western U.S.), Flaming Gorge, and Jordanelle.',
  diet                = 'Crayfish are the primary food source, supplemented by fish, hellgrammites, and large insects. Tube jigs and crayfish-imitating crankbaits are highly effective.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = 12,
  fun_fact            = 'Smallmouth Bass are pound-for-pound regarded as the hardest-fighting freshwater fish in Utah. A 3-lb Smallmouth will out-jump and outfight a 5-lb Largemouth. Lake Powell Smallmouth regularly exceed 5 lbs.',
  similar_species     = 'Largemouth Bass (jaw past eye, horizontal stripe, darker green). Spotted Bass (smaller, spots below lateral line, jaw reaches eye). Rock Bass (smaller, more rounded, prominent red eye).'
WHERE name = 'Smallmouth Bass';

-- Channel Catfish
UPDATE public.fish_species SET
  identification_tips = 'Eight barbels (whiskers) around the mouth — 4 under the chin, 2 at corners of the mouth, 2 on the snout. Deeply forked tail distinguishes it from Bullhead Catfish (which have rounded or slightly notched tails). Smooth, scaleless skin. Young fish often have dark spots that fade with age.',
  color_description   = 'Blue-gray to olive-gray on the back and sides, fading to a white or pale yellow belly. Juvenile and smaller fish often have scattered dark spots on the sides. Older, larger fish are typically uniformly gray-blue with no spots.',
  habitat             = 'Warm rivers, reservoirs, and ponds with soft or sandy bottoms. Prefers deeper holes, channel edges, and areas near structure at night. Major Utah Catfish waters include Utah Lake, the Green River, and Willard Bay.',
  diet                = 'Opportunistic bottom feeder and active predator. Eats fish, crayfish, insects, worms, clams, and carrion. Taste buds are distributed across their entire body surface, helping them locate food in complete darkness.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = 12,
  fun_fact            = 'Channel Catfish have taste buds covering their entire body — not just their mouths. A 6-inch Catfish has roughly 250,000 taste buds, more than any other vertebrate, making them extraordinary scent and taste trackers.',
  similar_species     = 'Blue Catfish (straight edge on anal fin, no spots at any age, very large). Bullhead Catfish (rounded or notched tail, not deeply forked, smaller and stubbier). Flathead Catfish (flat broad head, squared tail, lower jaw longer than upper).'
WHERE name = 'Channel Catfish';

-- Yellow Perch
UPDATE public.fish_species SET
  identification_tips = 'Six to eight dark vertical bars on a golden-yellow body are unmistakable. Two completely separate dorsal fins — the first spiny, the second soft — with a clear gap between them. Lower fins (pelvic and anal) are often vivid orange or orange-red, especially on males.',
  color_description   = 'Bright golden-yellow to olive-yellow body with 6–8 dark olive to black vertical bars. Belly is pale white to yellowish. Lower fins are orange to orange-red. The overall color combination is distinctive and hard to confuse.',
  habitat             = 'Clear, cool to moderately warm lakes and reservoirs. Highly schooling fish that roam open water and weed edges. One of Utah''s premier ice fishing targets. Key waters: Scofield Reservoir, Strawberry Reservoir, and Fish Lake.',
  diet                = 'Small fish, aquatic insects, worms, small crayfish, and zooplankton. Schools actively hunt during daylight. Very responsive to small jigs tipped with wax worms, especially through the ice.',
  best_seasons        = ARRAY['winter', 'spring', 'fall'],
  legal_size_in       = 9,
  fun_fact            = 'Yellow Perch are Utah''s top ice fishing target. Scofield Reservoir draws thousands of ice anglers each winter specifically for its dense Perch population. Perch are also considered excellent table fare.',
  similar_species     = 'Walleye (much larger, glassy eyes, white tail tip, one connected dorsal fin). Smallmouth Bass (much larger, jaw structure, connected dorsal fin). Iowa Darter (tiny, more colorful, bottom dweller).'
WHERE name = 'Yellow Perch';

-- Common Carp
UPDATE public.fish_species SET
  identification_tips = 'Large, heavy scales covering the body. Four barbels near the mouth — two short ones on the snout tip and two longer ones at the corners of the mouth. Long dorsal fin with a serrated front spine. Deeply sub-terminal (downward-pointing) mouth designed for bottom feeding. Often visible "tailing" or "mudding" in shallow water.',
  color_description   = 'Olive-gold to brassy-yellow or brownish-gold scales, often with a slightly darker back. Belly is pale yellow to white. Fins are darker — olive to reddish-brown. Mirror Carp (a variant) have large, irregular scales in patches.',
  habitat             = 'Extremely adaptable. Found in warm lakes, slow rivers, reservoirs, and ponds throughout Utah. Tolerates low oxygen, warm temperatures, and turbid water that other fish cannot survive. Utah Lake hosts one of the densest Carp populations in the western U.S.',
  diet                = 'Bottom feeder. Roots through mud and vegetation for aquatic insects, worms, crustaceans, plant material, and seeds. Can be targeted with corn, boilies, dough baits, or even dry flies during feeding activity.',
  best_seasons        = ARRAY['spring', 'summer', 'fall'],
  legal_size_in       = NULL,
  fun_fact            = 'Common Carp are increasingly pursued by fly anglers as the "golden bonefish." Sight-fishing for tailing Carp in the shallows of Utah Lake with a fly rod is a genuine technical challenge — Carp are notoriously spooky and selective.',
  similar_species     = 'Bigmouth Buffalo (no barbels, smaller scales, more compressed body). Goldfish (much smaller, no barbels in most forms). Grass Carp (elongated, no barbels on snout, silver-green).'
WHERE name = 'Common Carp';


-- ============================================================
-- 4. CREATE TABLE saved_spots
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saved_spots (
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  spot_id    uuid        NOT NULL REFERENCES public.spots(id)    ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);

-- RLS for saved_spots
ALTER TABLE public.saved_spots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'saved_spots' AND policyname = 'saved_spots_select_own'
  ) THEN
    CREATE POLICY saved_spots_select_own
      ON public.saved_spots
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'saved_spots' AND policyname = 'saved_spots_insert_own'
  ) THEN
    CREATE POLICY saved_spots_insert_own
      ON public.saved_spots
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'saved_spots' AND policyname = 'saved_spots_delete_own'
  ) THEN
    CREATE POLICY saved_spots_delete_own
      ON public.saved_spots
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- 5. CREATE TABLE fishing_reports
-- ============================================================

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

-- RLS for fishing_reports
ALTER TABLE public.fishing_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fishing_reports' AND policyname = 'fishing_reports_select_public'
  ) THEN
    CREATE POLICY fishing_reports_select_public
      ON public.fishing_reports
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fishing_reports' AND policyname = 'fishing_reports_insert_own'
  ) THEN
    CREATE POLICY fishing_reports_insert_own
      ON public.fishing_reports
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fishing_reports' AND policyname = 'fishing_reports_delete_own'
  ) THEN
    CREATE POLICY fishing_reports_delete_own
      ON public.fishing_reports
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================================================
-- DONE
-- ============================================================
-- To grant yourself admin access, run:
--
--   UPDATE public.profiles SET is_admin = true WHERE username = 'your_username';
--
-- ============================================================
