-- migration_v11: nationwide expansion — fish species + spots across 48 contiguous states
-- Run in Supabase SQL Editor

-- ─── 1. ADDITIONAL FISH SPECIES ──────────────────────────────────────────────

INSERT INTO public.fish_species
  (name, description, identification_tips, color_description, habitat, diet,
   best_seasons, legal_size_in, fun_fact, similar_species)
VALUES

('Striped Bass',
 'One of the most prized gamefish in America, found in rivers, reservoirs, and coastal waters coast-to-coast. Known for explosive surface strikes and runs that test heavy tackle.',
 'Elongated silver body with 7–8 distinct horizontal black stripes running from gill to tail. Large mouth, two separate dorsal fins, and a deeply forked tail.',
 'Bright silver sides with a white belly. Seven or eight sharp black horizontal stripes along the flanks, darkening toward the back which shades to blue-green or dark gray.',
 'Anadromous in coastal rivers; landlocked populations thrive in large reservoirs (Striper Belt across the South and West). Prefer cool, oxygenated water near structure, points, and open water.',
 'Highly aggressive predator of shad, herring, menhaden, and other baitfish. Best targeted with live bait, large swimbaits, topwater plugs, and umbrella rigs at dawn and dusk.',
 ARRAY['spring', 'fall'],
 18,
 'Striped Bass were successfully stocked into Santee-Cooper Reservoir in South Carolina in 1941 — the first landlocked striper population. They now thrive in reservoirs from coast to coast and have been recorded over 80 pounds.',
 'Hybrid Striped Bass (broader stripes, broken or interrupted; stockier body). White Bass (much smaller, stripes less distinct, no teeth on tongue).'
),

('White Bass',
 'A smaller cousin of the Striped Bass found throughout the Midwest and South. Famous for explosive spring spawning runs up rivers, where anglers can catch fish on nearly every cast.',
 'Compact, silvery-white body with 5–7 faintly broken horizontal dark stripes. Single tooth patch on tongue (key ID feature). Two dorsal fins, with a gap between them.',
 'Silvery-white flanks with a white belly. Stripes are narrower and less distinct than Striped Bass, often broken or faded. Back is pale olive to gray-green.',
 'Open-water schools in large lakes and rivers. Prefer mid-depth water near points, dam tailwaters, and river channels. Highly migratory — follows shad schools.',
 'Shad, shiners, crappie minnows, and invertebrates. Extremely aggressive during spawning runs. Respond well to white jigs, small crankbaits, and live shad.',
 ARRAY['spring', 'summer'],
 10,
 'White Bass are known for "schooling" on the surface, often boiling in massive feeding frenzies that are visible from a distance. During these blitzes, anglers can catch fish on nearly every cast.',
 'Striped Bass (much larger, 7–8 clear unbroken stripes). Hybrid Striped Bass (bigger, broken stripes, no tooth patch on tongue). Yellow Bass (horizontal stripes offset at lateral line).'
),

('Hybrid Striped Bass',
 'A cross between Striped Bass (female) and White Bass (male), combining the power of a striper with the hardiness of white bass. Widely stocked in reservoirs nationwide.',
 'Deep-bodied, silver fish with 7–8 broken or wavy horizontal stripes. Stockier than a pure Striped Bass. Teeth on both tongue patches (key ID). Belly is white.',
 'Bright silver with broken, irregular horizontal dark stripes along the flanks. Body is noticeably deeper (taller) than a pure striper. White belly, grayish-green back.',
 'Stocked in reservoirs nationwide. Prefers open water near structure, main lake points, and dam tailwaters. Tolerates warmer water than pure Striped Bass.',
 'Voracious predator of shad and other baitfish. Excellent on large swimbaits, topwater lures, live shad under a float, and umbrella rigs.',
 ARRAY['spring', 'fall'],
 15,
 'Hybrid Striped Bass (also called "wipers" or "whiterock bass") are sterile crosses that grow faster than either parent and are extremely aggressive. They have been stocked in all 48 contiguous states.',
 'Striped Bass (longer body, unbroken clean stripes, smaller at same age). White Bass (much smaller, fewer stripes, only one tongue tooth patch).'
),

('Flathead Catfish',
 'The second-largest North American catfish and a formidable predator. Unlike Channel Catfish, Flatheads prefer live prey and lurk near heavy cover in large rivers.',
 'Massively wide, flat head with a protruding lower jaw. Yellow-olive to brown mottled body. Squared-off or slightly notched tail (not deeply forked like Blue or Channel Cat). Small eyes set far back on the head.',
 'Mottled yellow, olive, and brown — excellent camouflage against a muddy river bottom. Pale yellow belly. Fins are darker brown to black at the edges.',
 'Large rivers and reservoirs across the central and eastern US. Strongly tied to heavy woody cover — fallen logs, root wads, and deep holes. Mostly nocturnal.',
 'Almost exclusively live fish — prefer sunfish, carp, goldfish, and other large baitfish. Rarely take dead bait. Best fished on heavy tackle with large live or freshly cut bait near structure.',
 ARRAY['summer', 'spring'],
 15,
 'Flathead Catfish can live over 20 years and exceed 100 pounds. The world record, caught on the Elk City Reservoir in Kansas, weighed 123 pounds 9 ounces.',
 'Blue Catfish (forked tail, slate-blue color, straight edge on anal fin). Channel Catfish (forked tail, spots on juveniles, rounded anal fin).'
),

('Blue Catfish',
 'The largest North American catfish species, capable of exceeding 100 pounds. Found in major river systems across the US and widely stocked in reservoirs for trophy fisheries.',
 'Large, smooth-skinned fish with a deeply forked tail (more forked than Channel Cat). Straight-edged flat-bottomed anal fin (25–30 rays, straight not rounded). Slate-blue to gray color, white belly.',
 'Uniform slate-blue to pale gray on back and sides, with a stark white belly. No spots (unlike juvenile Channel Cats). The anal fin has a distinctive straight, flat bottom edge.',
 'Major river systems (Mississippi, Missouri, Ohio, and their tributaries) and large reservoirs. Found in deep river channels, tailwaters below dams, and open reservoir basins.',
 'Generalist predator — shad, crayfish, mussels, cut bait, and live fish. Bottom feeder with an excellent sense of smell. Responds well to fresh cut shad or skipjack herring.',
 ARRAY['summer', 'fall'],
 12,
 'Blue Catfish have been rapidly expanding their range due to stocking, particularly in Virginia tidal rivers where they have become an invasive species threatening striped bass populations.',
 'Channel Catfish (rounded anal fin, spots on juveniles, less forked tail). Flathead Catfish (flat head, lower jaw protrudes, squared tail).'
),

('Black Crappie',
 'One of the two crappie species, found coast to coast in clear, vegetated waters. Known as "speckled perch" in the South, crappie are among the most popular panfish in America.',
 'Deeper, more rounded body than White Crappie. 7–8 spines in the dorsal fin (White Crappie has 5–6). Black spots are irregularly scattered without forming distinct vertical bars.',
 'Silvery-green to olive body covered in irregular black and dark green spots. No vertical bars — spots are random. Belly is white to silvery. Fins are spotted and mottled.',
 'Clear lakes, ponds, and slow rivers with abundant aquatic vegetation and submerged wood. Prefer cooler, more acidic water than White Crappie. Often in tighter schools.',
 'Small fish, insects, zooplankton, and small crustaceans. Aggressive at night near structure. Respond to small jigs under floats, live minnows, and small crankbaits.',
 ARRAY['spring', 'fall'],
 9,
 'Crappie build nests in colonies in shallow water, often in the same spots year after year. During the spring spawn they aggressively strike nearly any small lure or bait near their nesting area.',
 'White Crappie (longer body, 5–6 dorsal spines, distinct vertical bars). Flier (similar spots but solid dorsal fin, found only in southeastern US).'
),

('White Crappie',
 'The other crappie species — slightly larger on average and more tolerant of turbid water. Widely distributed across the eastern and central US, including reservoirs and slow rivers.',
 'More elongated body than Black Crappie. 5–6 spines in dorsal fin (Black Crappie has 7–8). Irregular dark spots arranged in roughly vertical bars along the sides.',
 'Pale silver to olive with darker mottling forming faint vertical bars. Belly is white to silver. Back is olive-green. Spots may form 7–9 irregular vertical bands on the sides.',
 'Turbid to slightly murky waters in reservoirs, large rivers, and lakes. More tolerant of low visibility than Black Crappie. Found near submerged brush piles, bridge pilings, and standing timber.',
 'Small fish, invertebrates, and insects. Best targeted with small jigs, live minnows under a cork, or small spinnerbaits near structure.',
 ARRAY['spring', 'fall'],
 9,
 'White Crappie and Black Crappie readily hybridize where they coexist, producing offspring with intermediate characteristics that can confuse identification.',
 'Black Crappie (rounder body, 7–8 dorsal spines, irregular spots without bars). Rock Bass (red eyes, larger mouth, different fin structure).'
),

('Northern Pike',
 'The apex ambush predator of northern lakes and rivers. Known for explosive strikes and acrobatic fights, pike are a top target from Maine to Montana.',
 'Long, torpedo-shaped body with a broad, duckbill-shaped snout. Olive-green to brown body with pale, bean-shaped spots arranged in rows. Single dorsal fin set far back near the tail.',
 'Dark olive-green to brown on the back, fading to lighter olive on the sides with rows of pale cream to yellow oval spots. White belly. Fins are dark with orange-red spots.',
 'Shallow, vegetated bays in northern lakes, rivers, and ponds. Prefer water temperatures below 65°F. Often found lurking at the edge of weed beds waiting to ambush prey.',
 'Aggressive generalist predator of fish, frogs, mice, and waterfowl. Best targeted with large spoons, spinnerbaits, swimbaits, and live suckers in the 6–12 inch range.',
 ARRAY['spring', 'fall', 'winter'],
 24,
 'Northern Pike can swim in short bursts exceeding 10 mph. They are known to swallow prey up to half their own body length and have been documented eating ducks, muskrats, and even small beavers.',
 'Muskellunge (no spots, or spots form irregular blotches on dark background; 6+ pores on lower jaw half). Tiger Muskie (hybrid; irregular vertical bars or reticulated pattern).'
),

('Muskellunge',
 'The "fish of ten thousand casts" — the ultimate freshwater trophy. Muskie are the largest member of the pike family and the most sought-after trophy in freshwater fishing.',
 'Extremely large pike-like fish with a broad flat snout. Lower jaw has 6+ sensory pores on each side (pike has 5). Body markings are spots, bars, or clear — never the bean-shaped rows of Northern Pike.',
 'Green to silver to brownish body with dark spots, vertical bars, or sometimes a clear pattern. Belly is cream to white. Fins are often spotted or blotched with rust-orange.',
 'Large, clear lakes and rivers in the Upper Midwest and Northeast. Prefer weedy bays, saddles between islands, and rocky points. Trophy muskie water includes Lac Courte Oreilles (WI), St. Lawrence River, and Lake St. Clair.',
 'Apex predator — large suckers, pike, bass, perch, and ducks. Best targeted with large bucktail spinners, large crankbaits, glide baits, and live or dead sucker presentations.',
 ARRAY['fall', 'spring'],
 36,
 'The world record Muskie weighed 67 pounds 8 ounces and was caught on the Chippewa Flowage in Wisconsin in 1949. Muskie fishing is considered the most demanding freshwater fishing in North America.',
 'Northern Pike (bean-shaped spots in rows on lighter background, 5 pores on lower jaw). Tiger Muskie (hybrid between the two — irregular bars and reticulation).'
),

('Sauger',
 'A smaller cousin of the Walleye, found in larger rivers and reservoirs of the central US. Highly prized as table fare and excellent winter ice fishing targets.',
 'Similar to Walleye but with distinct dark saddle-shaped blotches on the body and a spotted (not clear) first dorsal fin. No white tip on the lower tail fin (key difference from Walleye).',
 'Brass to olive-brown sides with distinct dark saddle-shaped blotches and small dark spots scattered between them. Spotted dorsal fin. No white-tipped lower tail lobe.',
 'Large rivers and their reservoirs across the Midwest and upper South — Mississippi, Missouri, Ohio, and Tennessee river systems. Prefer turbid water and strong current.',
 'Small fish and invertebrates near the bottom. Best targeted with jigs, blade baits, and jigging spoons in deep river holes and tailwater areas below dams.',
 ARRAY['fall', 'winter', 'spring'],
 12,
 'Sauger regularly hybridize with Walleye to produce "Saugeye" — a popular stocked fish that combines the Walleye''s size with the Sauger''s tolerance for turbid water.',
 'Walleye (no dorsal spot, white tip on lower tail, less mottled body). Saugeye (hybrid with intermediate features, partial white tail tip).'
),

('Chinook Salmon',
 'The largest Pacific salmon species — also called King Salmon. Found in West Coast rivers from California to Alaska and also stocked throughout the Great Lakes.',
 'Largest of the Pacific salmon. Black gum line (key ID — no other salmon has this). Black spots on both lobes of the tail and body. During spawning, body turns dark red to almost black.',
 'Ocean fish are bright silver with a greenish-blue back and black spots on the upper body and both tail lobes. Spawning fish range from dark red to brick-red to near-black.',
 'Pacific Coast rivers (Sacramento, Klamath, Columbia) and all Great Lakes (major stocking program). Prefer cold, fast rivers with large gravel. In lakes, found in deep, cold thermoclines.',
 'Ocean: herring, smelt, squid, and anchovies. In rivers: strike out of aggression and instinct near spawning — spoons, spinners, beads, and egg patterns most effective.',
 ARRAY['fall', 'spring'],
 24,
 'Chinook Salmon are the most valuable sport fish by revenue in the Pacific Northwest. A single Chinook can weigh over 100 pounds — the record is 126 pounds from the Kenai River in Alaska.',
 'Coho Salmon (silver, spots only on upper tail lobe, white gums). Steelhead (doesn''t die after spawning, less spotting, returns to sea or lake).'
),

('Coho Salmon',
 'Silver Salmon — one of the most acrobatic Pacific salmon. Stocked extensively in the Great Lakes and found in West Coast rivers. Famous for spectacular aerial jumps.',
 'Bright silver body during ocean/lake phase. Spots only on the upper lobe of the tail (not both lobes — key difference from Chinook). White gums (not black like Chinook). Teeth on lower jaw in distinct rows.',
 'Ocean/lake fish are brilliant silver with a steel-blue back. Minimal spotting compared to Chinook. Spawning fish turn dark red on the sides with a green head.',
 'Great Lakes (stocked throughout) and Pacific Coast rivers from California to Alaska. Prefer open cold water and target rivers in fall for their spawning runs.',
 'Herring, smelt, alewives in open water. In rivers: spoons, spinners, plug-cut herring, and egg clusters. In the Great Lakes: trolling with dodger/fly combos at the thermocline.',
 ARRAY['fall'],
 24,
 'Coho Salmon were first stocked in Lake Michigan in 1966 by Michigan DNR. Within two years they were attracting hundreds of thousands of anglers and transformed Great Lakes fishing.',
 'Chinook Salmon (larger, spots on both tail lobes, black gum line). Atlantic Salmon (can return to spawn multiple times, longer body, different spotting).'
),

('Steelhead',
 'The sea-run or lake-run form of Rainbow Trout — the ultimate river trophy. Steelhead in the Great Lakes and Pacific Coast rivers are among the most prized sport fish in North America.',
 'A Rainbow Trout that has spent time in the ocean or Great Lakes. Silver ocean phase has faint pink lateral stripe and fine black spots. When spawning, develops vivid pink-red sides like a rainbow trout.',
 'Bright chrome-silver in ocean/lake phase — far more silver than a resident Rainbow. Returns to river colors for spawning: pink to red lateral band, dark olive back, white belly.',
 'Pacific Coast rivers (Columbia, Deschutes, Rogue, Clearwater) and all Great Lakes tributaries. Found in fast, deep runs and pocket water behind large boulders.',
 'Feed aggressively in open water (alewives, smelt). In rivers, strike eggs, nymphs, streamers, and sand shrimp — especially in cold, clear water below 45°F.',
 ARRAY['fall', 'winter', 'spring'],
 15,
 'Steelhead, unlike Pacific salmon, do not die after spawning — they return to the ocean or Great Lakes and can make multiple spawning runs over their lifetime (up to 7 years).',
 'Chinook/Coho Salmon (die after spawning). Resident Rainbow Trout (no silver phase, stays in the river year-round, smaller). Atlantic Salmon (different distribution, larger spots).'
),

('Sockeye Salmon',
 'The ocean form of the Kokanee — brilliant silver in open water, turning spectacular scarlet red with a green head during spawning. Found on the Pacific Coast and in some landlocked lakes.',
 'Slim, torpedo-shaped Pacific salmon. No spots on the back or tail (key ID vs. Chinook and Coho). Large eyes. Spawning males develop a bright red body, green head, and hooked jaw.',
 'Ocean fish are bright silver with a greenish-blue back and no visible spots. Spawning fish turn unmistakable crimson red with a bright green head. One of the most visually striking salmon.',
 'Pacific Ocean and rivers from California to Alaska (Kenai, Fraser, Columbia). Limited to areas with accessible spawning lakes. Not stocked in Great Lakes.',
 'Primarily zooplankton in the ocean. In rivers, strike out of aggression — small flies, beads, spinners, and spoons near spawning time.',
 ARRAY['fall'],
 20,
 'The largest Sockeye run in the world occurs on the Fraser River in British Columbia. In peak years, over 30 million fish return to spawn. Sockeye are considered the best-tasting Pacific salmon.',
 'Pink Salmon (humped back on males, smaller). Chum Salmon (calico spawning pattern). Chinook (much larger, black gum line, spots on tail).'
),

('Atlantic Salmon',
 'The original sport fish of the Northeast — unlike Pacific salmon, Atlantics survive spawning and can return multiple times. Found in a few wild rivers in Maine and widely stocked in the Northeast.',
 'Spotted salmon without the wrist (caudal peduncle) spots common on Pacific salmon. X-shaped or + shaped black spots on body and head. More elongated body. Adipose fin present.',
 'Silver in ocean phase with distinct black X or + shaped spots on the upper body. Spawning fish turn brownish-red with red and orange spots. Fins are dark.',
 'Wild fish in Maine rivers (Penobscot, Kennebec, Narraguagus) and stocked in lakes across the Northeast. Hatchery-raised in Connecticut, New Hampshire, Vermont, and New York.',
 'Primarily insects and small fish in rivers. Fly fishing with traditional Atlantic salmon patterns (Bombers, Rusty Rats, Green Machines) is the classic method.',
 ARRAY['fall', 'summer'],
 15,
 'Atlantic Salmon were once so abundant in New England rivers that colonial-era laws restricted how often landowners could feed salmon to their servants. Pollution and dams eliminated most runs by 1900.',
 'Brown Trout (can look similar in spawning colors — check spot shape; Brown Trout have orange/red halos around spots). Pacific Salmon (die after spawning, different distribution).'
),

('Redfish',
 'Red Drum — the premier inshore saltwater target of the Gulf Coast and East Coast. Also called "redfish" and famous for "tailing" in shallow marshes.',
 'Copper-bronze to reddish body with a characteristic black spot (or spots) at the base of the tail. Blunt snout, subterminal mouth (slight overbite). Scales are large and deeply ridged.',
 'Brilliant copper to bronze to reddish-orange on the sides. White belly. One to several black spots at the tail base — the number varies but at least one is almost always present.',
 'Gulf Coast and East Coast inshore — tidal marshes, oyster reefs, grass flats, and beach surf. Found from Texas to Massachusetts. Spawn offshore but spend most of their lives inshore.',
 'Crab, shrimp, mullet, menhaden, and other baitfish. Best targeted on shallow flats with gold spoons, redfish flies, soft plastics on jig heads, and live mullet in the surf.',
 ARRAY['fall', 'spring'],
 18,
 'Large Redfish are called "Bull Reds" and migrate offshore to spawn in massive aggregations in the fall. During this event in Texas and Louisiana, you can sometimes see thousands of fish rolling on the surface.',
 'Black Drum (deeper body, chin barbels, more black than red, larger at same age). Sheepshead (vertical bars, totally different appearance).'
),

('Spotted Seatrout',
 'One of the most popular inshore fish in the Gulf and South Atlantic. Also called "speckled trout," these beautiful fish are table fare royalty across the Gulf Coast.',
 'Elongated, silver body with numerous round black spots on the upper back and sides. Two prominent canine teeth at the front of the upper jaw (visible when mouth is open). Soft mouth — handle carefully.',
 'Silver sides fading to a white belly. Upper body is grayish-blue with scattered round black spots covering the back, upper sides, and dorsal fins. No lateral line visible.',
 'Coastal estuaries, seagrass beds, and tidal rivers from Texas to Virginia. Prefer sandy or muddy bottoms near grass. More sensitive to cold than Redfish.',
 'Shrimp, mullet, croakers, and other small fish. Best targeted with soft plastic shrimp on jig heads, topwater lures at dawn/dusk, and live shrimp under a popping cork.',
 ARRAY['spring', 'fall'],
 15,
 'Spotted Seatrout produce a distinctive drumming or croaking sound by vibrating their swim bladder. This is most audible during the summer spawning season.',
 'Weakfish (more silver, spots less distinct, found further north). Gray Trout (paler, fewer spots, mid-Atlantic). Redfish (copper color, spot at tail base only).'
),

('Snook',
 'One of Florida''s premier inshore game fish. Snook are renowned for their speed, acrobatic jumps, and the difficulty of landing them in mangroves and bridge pilings.',
 'Distinctive black lateral line running from the gill cover to the tail — dark and unmistakable. Sloping forehead, protruding lower jaw, large mouth. Yellow-olive coloring.',
 'Yellow-olive to brownish on the back, silver on the sides. Bold black lateral line is the defining feature. Yellow tint on the lower fins during spawning season.',
 'Florida coasts, both Gulf and Atlantic sides, and also in Central America and Caribbean. Found in mangrove creeks, around bridges, inlets, and beach passes. Very cold-sensitive.',
 'Mullet, pinfish, shrimp, and crabs. Top lures include live mullet on the surface, DOA shrimp, topwater walk-the-dog plugs at dawn, and large flies for fly fishing.',
 ARRAY['spring', 'summer', 'fall'],
 28,
 'Snook are sequential hermaphrodites — they start life as males and some switch to female as they grow larger. This means most trophy snook are female.',
 'Tarpon (much larger, scales visible, silver color). Ladyfish (similar shape but smaller, no black stripe, jumps more). No other inshore fish has the bold black lateral stripe.'
),

('Alligator Gar',
 'The largest freshwater fish in North America, capable of exceeding 300 pounds. Ancient species unchanged for 100 million years. Found in large rivers and reservoirs of the South.',
 'Enormous gar with a distinctive broad, alligator-like snout (nearly twice as wide as other gar species). Double row of large teeth. Armored in diamond-shaped ganoid scales.',
 'Dark olive-brown to grayish-green on the back. Sides are lighter olive with irregular dark spots scattered on the posterior body. Belly is white to cream-colored.',
 'Large rivers and reservoirs in the South — Trinity, Rio Grande, Mississippi, and their tributaries. Found in slow, deep backwaters, oxbows, and reservoir creek arms.',
 'Large fish (carp, buffalo, mullet), waterfowl, and even small mammals. Best targeted with large live or dead bait (carp, mullet) on heavy tackle, often at night.',
 ARRAY['summer', 'spring'],
 NULL,
 'Alligator Gar are living fossils — their species has remained virtually unchanged for over 100 million years. Fossil gar from the Cretaceous period are nearly identical to modern specimens.',
 'Longnose Gar (much narrower snout, smaller body). Shortnose Gar (smaller, blunter snout than Longnose). No other freshwater fish matches the double tooth row and alligator snout.'
),

('Freshwater Drum',
 'Also called Sheepshead in freshwater, the Drum is the only North American freshwater fish that produces drumming sounds. Found coast to coast in large rivers and lakes.',
 'Deep, hump-backed body profile. Blunt snout with subterminal mouth. Lateral line arches up high and continues through the tail fin (unique). Gray to silver color with no spots.',
 'Gray to silvery on the sides with a white belly. Back is medium to dark gray. Scales have a rough, ctenoid texture. Fins are gray to dark gray.',
 'Large rivers and lakes from the Gulf Coast up to Canada. Found in sandy or gravelly areas with moderate current. Very common in the Mississippi and Great Lakes watersheds.',
 'Bottom feeder — mussels, snails, crayfish, and small fish. Best caught on nightcrawlers, crayfish tails, and cut bait near the bottom. Underrated as a sport fish.',
 ARRAY['spring', 'summer'],
 12,
 'Freshwater Drum produce their distinctive drumming sound using special muscles that vibrate against the swim bladder. Historically, the pharyngeal teeth (throat teeth) of drum were used as good luck charms by Native Americans.',
 'Carp (different fin structure, barbels, more uniform color). Buffalo (much deeper body). White Bass (stripes, no hump).'
),

('Paddlefish',
 'One of the most unusual fish in North America — related to sharks and sturgeon. Their long paddle-shaped rostrum (snout) is a sensory organ for detecting zooplankton.',
 'Unmistakable: the paddle-shaped snout (rostrum) can be up to 1/3 of total body length. Scaleless, shark-like body. Large gaping mouth. Deeply forked, heterocercal tail.',
 'Uniform gray to blue-gray with a lighter belly. The skin is smooth and scaleless except on the tail. Young fish may have a slight pinkish blush on the belly.',
 'Large rivers of the Mississippi basin — Missouri, Ohio, Mississippi, Arkansas, and their major tributaries. Once also found in the Great Lakes. Prefer slow, deep pools.',
 'Filter feeder — uses its paddle as an electroreceptor to locate dense plankton. Cannot be caught on traditional bait. Best targeted by snagging during spring aggregations below dams.',
 ARRAY['spring'],
 18,
 'Paddlefish are among the oldest fish species in North America, dating back over 300 million years. Despite being over 5 feet long, they feed entirely on microscopic zooplankton — filter feeding like a whale shark.',
 'Shovelnose Sturgeon (smaller, bony plates on body, different snout shape). Lake Sturgeon (no paddle, bony scutes on body, different habitat).'
),

('White Perch',
 'A smaller member of the bass family found across the Northeast and Mid-Atlantic. White Perch thrive in brackish estuaries, reservoirs, and freshwater lakes.',
 'Compact, deep-bodied silver fish. No lateral stripes (unlike White Bass). Continuous dorsal fin (the two portions are connected). Usually 8–10 inches. Strongly compressed body.',
 'Silver to pale gray-green on the back, fading to white on the belly. No distinct stripes or spots. The back may have a slight greenish or olive tinge.',
 'Brackish and freshwater rivers, estuaries, and lakes from New Brunswick to South Carolina. Thrives in the Chesapeake Bay and its tributaries. Can become extremely abundant in reservoirs.',
 'Small fish, invertebrates, insects, and shrimp. Best caught on small jigs, live minnows, and nightcrawlers near structure at night.',
 ARRAY['spring', 'summer'],
 7,
 'White Perch were inadvertently introduced into the Great Lakes and have become an invasive species that competes with Yellow Perch and walleye for food resources.',
 'White Bass (stripes on body, larger, gap between dorsal fins). Silver Bass (similar but western distribution). Yellow Perch (bold black vertical bars, yellow color).'
)
ON CONFLICT (name) DO NOTHING;

-- ─── 2. NATIONWIDE FISHING SPOTS ─────────────────────────────────────────────

INSERT INTO public.spots (name, description, latitude, longitude, water_type, state, approved) VALUES

-- ── ALABAMA ──────────────────────────────────────────────────────────────────
('Lake Guntersville', 'The largemouth bass capital of the South. Guntersville Reservoir on the Tennessee River covers 69,000 acres and holds some of the largest bass in the country. World-class crappie and striped bass fishing as well.', 34.3800, -86.2800, 'reservoir', 'Alabama', true),
('Wheeler Lake', 'Alabama''s second largest TVA reservoir at 68,000 acres. Excellent bass, crappie, catfish, and sauger fishing. Known for exceptional winter striper fishing below Wheeler Dam.', 34.7000, -87.1500, 'reservoir', 'Alabama', true),
('Weiss Lake', 'Known as the Crappie Capital of the World. This shallow Coosa River impoundment produces massive slabs every spring. Also excellent largemouth bass fishing in the flooded timber.', 34.1200, -85.8200, 'reservoir', 'Alabama', true),
('Pickwick Lake', 'Tennessee River tailwater reservoir on the AL/TN/MS border. Known for trophy smallmouth bass, largemouth, catfish, and excellent crappie fishing around the many bays.', 34.9200, -88.0000, 'reservoir', 'Alabama', true),
('Tallapoosa River', 'A free-flowing stretch below Thurlow Dam produces excellent spotted bass, redeye bass, and smallmouth fishing. Clear water and rocky structure makes for technical, rewarding fishing.', 32.7000, -85.8500, 'river', 'Alabama', true),

-- ── ARIZONA ──────────────────────────────────────────────────────────────────
('Lake Havasu', 'Colorado River reservoir on the AZ/CA border. World-class striped bass fishery with fish commonly exceeding 30 pounds. Also largemouth bass, channel catfish, and smallmouth.', 34.5000, -114.3200, 'reservoir', 'Arizona', true),
('Roosevelt Lake', 'Arizona''s largest lake and the oldest reservoir in the state. Excellent largemouth and smallmouth bass, crappie, catfish, and yellow bass in a stunning Sonoran Desert setting.', 33.6600, -111.1500, 'reservoir', 'Arizona', true),
('Lake Pleasant', 'Phoenix metro reservoir with excellent striped bass, largemouth bass, and catfish. One of Arizona''s most popular fishing destinations due to easy access from the city.', 33.8800, -112.2700, 'reservoir', 'Arizona', true),
('Canyon Lake', 'Scenic Salt River Chain reservoir east of Phoenix. Excellent largemouth bass, channel catfish, and the unique yellow bass. Surrounded by towering canyon walls.', 33.5300, -111.4200, 'reservoir', 'Arizona', true),
('Alamo Lake', 'Remote western Arizona reservoir with outstanding bass and catfish fishing. Far from the crowds, Alamo offers quality largemouth bass, channel catfish, and carp fishing.', 34.2300, -113.5700, 'reservoir', 'Arizona', true),

-- ── ARKANSAS ─────────────────────────────────────────────────────────────────
('Bull Shoals Lake', 'Clear Ozarks reservoir spanning AR and MO. World-famous walleye and bass fishery with excellent water clarity. Also produces large smallmouth, striper, and crappie.', 36.4000, -92.5800, 'reservoir', 'Arkansas', true),
('White River (Below Bull Shoals)', 'One of the finest trout fisheries in the US — consistently producing large rainbow and brown trout from the cold tailwater below Bull Shoals Dam. World-record brown trout caught here.', 36.3600, -92.5500, 'river', 'Arkansas', true),
('Lake Ouachita', 'Arkansas''s largest lake and one of the clearest in the nation. Excellent striped bass, largemouth bass, and spotted bass. Known for trophy stripers exceeding 40 pounds.', 34.6000, -93.1600, 'reservoir', 'Arkansas', true),
('Beaver Lake', 'Crystal-clear Ozarks reservoir with excellent smallmouth, largemouth, and striped bass. Also top walleye water with consistent catches year-round.', 36.3500, -93.9000, 'reservoir', 'Arkansas', true),
('Arkansas River', 'The navigable Arkansas River holds excellent channel and blue catfish, largemouth bass, sauger, and freshwater drum below its many lock and dam structures.', 34.7400, -92.1400, 'river', 'Arkansas', true),

-- ── CALIFORNIA ───────────────────────────────────────────────────────────────
('Shasta Lake', 'California''s largest reservoir. Outstanding spotted bass, smallmouth, largemouth, and rainbow trout. The dramatic scenery of flooded canyon arms makes every trip memorable.', 40.7200, -122.4100, 'reservoir', 'California', true),
('Clear Lake', 'The oldest lake in North America and the biggest lake entirely within California. Consistently ranks as one of the top largemouth bass fisheries in the nation.', 39.0400, -122.8100, 'lake', 'California', true),
('Delta (Sacramento-San Joaquin)', 'The California Delta is arguably the most complex bass fishery in the world. Over 1,100 miles of waterways hold world-class largemouth bass in tules, channels, and sloughs.', 38.0500, -121.7500, 'river', 'California', true),
('Millerton Lake', 'Central California reservoir on the San Joaquin River. Excellent striped bass, largemouth, and spotted bass. The striper trolling here rivals anything in the state.', 37.0100, -119.6900, 'reservoir', 'California', true),
('Trinity Lake', 'Remote Northern California reservoir with outstanding smallmouth bass, rainbow trout, and kokanee salmon. Less pressure than other NorCal lakes makes for quality fishing.', 40.7800, -122.8000, 'reservoir', 'California', true),
('San Luis Reservoir', 'Central Valley reservoir with a healthy striped bass population and excellent bass fishing. One of the most reliable striper lakes in the state.', 37.0700, -121.0800, 'reservoir', 'California', true),
('Sacramento River', 'One of the best Chinook salmon and steelhead runs on the West Coast. The Sacramento below Red Bluff produces salmon from September through December and steelhead all winter.', 39.7300, -122.0400, 'river', 'California', true),

-- ── COLORADO ─────────────────────────────────────────────────────────────────
('Blue Mesa Reservoir', 'Colorado''s largest body of water. World-class kokanee salmon trolling and excellent lake trout. Rainbow and brown trout also abundant. Stunning high-altitude scenery.', 38.4600, -107.3400, 'reservoir', 'Colorado', true),
('Eleven Mile Reservoir', 'South Platte River impoundment in South Park. Excellent rainbow and brown trout, northern pike, and kokanee. A top trophy trout destination.', 38.9100, -105.5500, 'reservoir', 'Colorado', true),
('South Platte River (Eleven Mile Canyon)', 'Blue-ribbon trout stream below Eleven Mile Reservoir. Large rainbow and brown trout in clear, technical water. One of Colorado''s finest fly fishing destinations.', 38.8200, -105.4900, 'river', 'Colorado', true),
('Chatfield Reservoir', 'Front Range reservoir near Denver with excellent bass, walleye, channel catfish, and tiger muskie. Convenient access and high fish populations make it popular.', 39.5400, -105.0700, 'reservoir', 'Colorado', true),
('Lake Granby', 'Large Grand County reservoir with excellent lake trout, rainbow trout, and kokanee salmon. Part of the Colorado-Big Thompson Project on the west side of Rocky Mountain National Park.', 40.1900, -105.8700, 'lake', 'Colorado', true),

-- ── CONNECTICUT ──────────────────────────────────────────────────────────────
('Lake Candlewood', 'Connecticut''s largest lake. Excellent largemouth bass, chain pickerel, and panfish. The numerous coves and channels hold fish year-round.', 41.5000, -73.4300, 'lake', 'Connecticut', true),
('Connecticut River', 'New England''s largest river flows through CT and holds American shad, striped bass, Atlantic salmon (stocked), and brown trout. The spring shad run is a CT tradition.', 41.6200, -72.6500, 'river', 'Connecticut', true),
('Bantam Lake', 'Connecticut''s largest natural lake with excellent largemouth bass, chain pickerel, yellow perch, and crappie. Public boat launch and beautiful scenic setting.', 41.7000, -73.2200, 'lake', 'Connecticut', true),

-- ── DELAWARE ─────────────────────────────────────────────────────────────────
('Delaware River (Lower)', 'The tidal Delaware holds striped bass, American shad, channel catfish, and carp. Spring shad runs are spectacular. Delaware City to Wilmington is prime striper water.', 39.5800, -75.5900, 'river', 'Delaware', true),
('Trap Pond', 'Delaware''s largest natural pond set in a bald cypress swamp. Excellent largemouth bass, chain pickerel, and panfish in an unusual and beautiful setting.', 38.5300, -75.4600, 'pond', 'Delaware', true),
('Noxontown Pond', 'Small but productive central Delaware lake with largemouth bass, crappie, and bluegill. Public access and consistent fishing make it a local favorite.', 39.4800, -75.7400, 'pond', 'Delaware', true),

-- ── FLORIDA ──────────────────────────────────────────────────────────────────
('Lake Okeechobee', 'The "Big O" — America''s bass fishing Mecca. This shallow 730-square-mile lake holds massive largemouth bass in its endless miles of hydrilla, cattail, and lily pads.', 26.9500, -80.8300, 'lake', 'Florida', true),
('Lake Tohopekaliga (Toho)', 'Part of the Kissimmee Chain in Central Florida. Considered one of the top largemouth bass lakes in the world with regular 10-pound-plus fish.', 28.2500, -81.4200, 'lake', 'Florida', true),
('St. Johns River', 'Florida''s longest river runs north from Orlando to Jacksonville. World-class largemouth bass, crappie, and redfish near its tidal lower reaches.', 29.1200, -81.6400, 'river', 'Florida', true),
('Stick Marsh / Farm 13', 'Flooded agricultural fields in Indian River County that have become legendary for trophy largemouth bass. Some of Florida''s largest bass come from this shallow, weedy impoundment.', 27.8400, -80.6700, 'reservoir', 'Florida', true),
('Lake Kissimmee', 'Central Florida chain lake with excellent bass and one of the most productive largemouth fisheries in the state. Great for both boat and bank anglers.', 27.8900, -81.3200, 'lake', 'Florida', true),
('Rodman Reservoir (Ocklawaha)', 'Controversial but undeniably productive — Rodman holds some of the densest bass populations in Florida. Submerged timber, hydrilla, and lily pads make exceptional habitat.', 29.5200, -81.7700, 'reservoir', 'Florida', true),
('Everglades WMA', 'The Florida Everglades hold trophy largemouth bass, peacock bass (world''s largest wild peacock bass), crappie, and unique species found nowhere else in the US.', 26.1000, -80.7700, 'river', 'Florida', true),

-- ── GEORGIA ──────────────────────────────────────────────────────────────────
('Lake Lanier', 'One of the most visited reservoirs in the Southeast. Excellent spotted bass, largemouth, striped bass, and the occasional trophy hybrid striper in this Corps of Engineers impoundment.', 34.2000, -84.0000, 'reservoir', 'Georgia', true),
('Lake Hartwell', 'Borders GA and SC on the Savannah River system. Excellent largemouth and spotted bass, with consistent crappie and catfish. Popular tournament destination.', 34.3500, -82.9000, 'reservoir', 'Georgia', true),
('West Point Lake', 'Chattahoochee River impoundment on the GA/AL border. Excellent white bass during spring spawning runs, plus largemouth, striped bass, and crappie year-round.', 32.9000, -85.2000, 'reservoir', 'Georgia', true),
('Lake Allatoona', 'Metro Atlanta''s main fishing lake. Good spotted and largemouth bass, striped bass, crappie, and catfish. Convenient access makes it extremely popular.', 34.2100, -84.7100, 'reservoir', 'Georgia', true),
('Chattooga River', 'Wild and scenic river on the GA/SC border. One of the finest small-mouth and rainbow trout streams in the Southeast. Best above the Ga. 28 bridge for quality fishing.', 34.8900, -83.3700, 'river', 'Georgia', true),

-- ── IDAHO ────────────────────────────────────────────────────────────────────
('Henry''s Fork of the Snake River', 'One of the most famous trout streams in America. The Box Canyon and Railroad Ranch sections offer world-class rainbow trout fishing, particularly for large fish on dry flies.', 44.3000, -111.4900, 'river', 'Idaho', true),
('Lake Pend Oreille', 'Idaho''s largest lake and one of the deepest in the US. Holds trophy bull trout, lake trout, rainbow trout, largemouth bass, and the unique giant Kamloops rainbow trout.', 48.1200, -116.4500, 'lake', 'Idaho', true),
('Coeur d''Alene Lake', 'Scenic northern Idaho lake. Excellent rainbow trout, lake trout, kokanee, largemouth bass, and northern pike. The lake''s clarity is legendary.', 47.6000, -116.7700, 'lake', 'Idaho', true),
('Dworshak Reservoir', 'Remote clearwater reservoir known for exceptional smallmouth bass fishing. Steep canyon walls and cold, clear water hold large smallmouth bass rarely found elsewhere in Idaho.', 46.5200, -116.0800, 'reservoir', 'Idaho', true),
('South Fork Snake River', 'Blue-ribbon cutthroat and rainbow trout fishery between Palisades and Swan Valley. Large, strong fish in beautiful canyon scenery. One of the best dry-fly rivers in the West.', 43.3700, -111.2500, 'river', 'Idaho', true),

-- ── ILLINOIS ─────────────────────────────────────────────────────────────────
('Carlyle Lake', 'Illinois'' largest man-made lake at 26,000 acres. Excellent white bass, largemouth, crappie, channel catfish, and walleye. Famous spring white bass runs below the dam.', 38.6100, -89.3700, 'reservoir', 'Illinois', true),
('Lake Shelbyville', 'East-central Illinois reservoir known for excellent crappie, largemouth bass, white bass, and channel catfish. Spring white bass runs up the Kaskaskia River are spectacular.', 39.5500, -88.7600, 'reservoir', 'Illinois', true),
('Rend Lake', 'Shallow, fertile southern Illinois reservoir with some of the best crappie and bass fishing in the state. Flooded timber provides ideal structure for trophy crappie.', 38.0500, -88.9600, 'reservoir', 'Illinois', true),
('Illinois River', 'Major Mississippi tributary with excellent channel and blue catfish, largemouth bass, walleye, and sauger. Backwater lakes along the river hold trophy crappie and bass.', 41.3000, -89.0000, 'river', 'Illinois', true),
('Fox Chain O''Lakes', 'Northern Illinois chain of interconnected lakes near the Wisconsin border. Good northern pike, largemouth bass, walleye, and panfish in natural lake system.', 42.3800, -88.2000, 'lake', 'Illinois', true),

-- ── INDIANA ──────────────────────────────────────────────────────────────────
('Monroe Lake', 'Indiana''s largest lake with excellent largemouth and smallmouth bass, crappie, channel catfish, and walleye. The 10,750-acre impoundment has diverse fishing habitat.', 39.0100, -86.5000, 'reservoir', 'Indiana', true),
('Brookville Lake', 'Southeastern Indiana reservoir known for excellent hybrid striped bass and also good for largemouth, white bass, and crappie. Deep, clear water near the dam holds stripers.', 39.5200, -85.0300, 'reservoir', 'Indiana', true),
('Tippecanoe River', 'One of Indiana''s best smallmouth bass rivers, with additional populations of channel catfish, rock bass, and walleye in the lower reaches.', 41.1500, -86.5000, 'river', 'Indiana', true),
('Patoka Lake', 'Southern Indiana reservoir with excellent bass, crappie, and channel catfish. The diverse habitat includes rocky points, creek arms, and shallow flats.', 38.4400, -86.7000, 'reservoir', 'Indiana', true),

-- ── IOWA ─────────────────────────────────────────────────────────────────────
('Clear Lake', 'Iowa''s largest natural lake and home to some of the best walleye fishing in the state. Also excellent yellow perch, northern pike, and largemouth bass.', 43.1400, -93.4000, 'lake', 'Iowa', true),
('Red Rock Lake', 'Des Moines River impoundment with excellent white bass during spring runs, plus walleye, largemouth bass, channel catfish, and crappie year-round.', 41.3700, -92.9600, 'reservoir', 'Iowa', true),
('Lake MacBride', 'Clear eastern Iowa reservoir with excellent smallmouth bass and northern pike. Also good for largemouth bass, channel catfish, and walleye.', 41.8200, -91.5500, 'reservoir', 'Iowa', true),
('Mississippi River (Iowa)', 'The Upper Mississippi holds some of the best walleye and sauger fishing in the Midwest. Excellent catfish, bass, and crappie in the backwater sloughs and main channel.', 42.5000, -90.5000, 'river', 'Iowa', true),

-- ── KANSAS ───────────────────────────────────────────────────────────────────
('Milford Lake', 'Kansas''s largest reservoir and a top walleye destination. Excellent white bass, largemouth bass, channel catfish, and wiper (hybrid striper). 15,700 acres.', 39.0900, -96.9200, 'reservoir', 'Kansas', true),
('Cheney Reservoir', 'Wichita area reservoir with consistently good walleye, white bass, and channel catfish. One of the most productive fishing lakes in central Kansas.', 37.8000, -97.8800, 'reservoir', 'Kansas', true),
('Tuttle Creek Lake', 'Flint Hills area reservoir with excellent largemouth bass, walleye, channel catfish, and white crappie in its many flooded tributaries.', 39.3500, -96.6000, 'reservoir', 'Kansas', true),
('Kanopolis Lake', 'Smoky Hill River impoundment in central Kansas. Outstanding largemouth bass fishing in the cedar-lined coves. Also excellent catfish and walleye.', 38.6600, -98.1700, 'reservoir', 'Kansas', true),

-- ── KENTUCKY ─────────────────────────────────────────────────────────────────
('Lake Cumberland', 'One of the largest reservoirs east of the Mississippi. Excellent striped bass, largemouth, smallmouth, spotted bass, walleye, and crappie in 63,000 acres of deep, clear water.', 36.8700, -85.1200, 'reservoir', 'Kentucky', true),
('Dale Hollow Lake', 'KY/TN border reservoir known for some of the clearest water in the state. World record smallmouth bass caught here in 1955. Excellent trophy smallmouth, walleye, and crappie.', 36.5500, -85.4800, 'reservoir', 'Kentucky', true),
('Kentucky Lake', 'One of the largest man-made lakes in the US at 160,000 acres including Kentucky Lake and Lake Barkley combined. World-class crappie, bass, catfish, and walleye.', 36.8000, -88.2600, 'reservoir', 'Kentucky', true),
('Green River Lake', 'Central Kentucky reservoir on the upper Green River. Outstanding smallmouth bass fishing, plus good largemouth, crappie, and catfish.', 37.2600, -85.3500, 'reservoir', 'Kentucky', true),
('Cumberland River (Below Wolf Creek Dam)', 'Tailwater below Wolf Creek Dam produces world-class rainbow and brown trout — rare in Kentucky. Cold, clear water holds large fish year-round.', 36.8800, -85.1300, 'river', 'Kentucky', true),

-- ── LOUISIANA ────────────────────────────────────────────────────────────────
('Toledo Bend Reservoir', 'On the LA/TX border — the fifth largest man-made lake in the US and one of the top bass lakes in the country. Excellent largemouth bass up to tournament weight.', 31.5000, -93.5500, 'reservoir', 'Louisiana', true),
('Calcasieu Lake', 'Western Louisiana saltwater/brackish lake known as the "Cal-Lac." Premier redfish and speckled trout destination. One of the most consistent inshore fisheries on the Gulf Coast.', 29.8900, -93.3200, 'lake', 'Louisiana', true),
('Atchafalaya Basin', 'America''s largest river swamp. Exceptional catfish, crappie, largemouth bass, and sac-a-lait (white crappie). Fishing the basin backwaters is a true Louisiana experience.', 29.9700, -91.7700, 'river', 'Louisiana', true),
('Caney Creek Reservoir', 'Northwestern Louisiana reservoir with excellent largemouth bass, crappie, and channel catfish. Well-maintained lake with consistent fishing quality.', 32.2500, -93.0800, 'reservoir', 'Louisiana', true),
('Sabine River', 'The Sabine forms the TX/LA border and holds excellent alligator gar, largemouth bass, spotted bass, and channel catfish in its slow, tea-colored lower reaches.', 31.1000, -93.7000, 'river', 'Louisiana', true),

-- ── MAINE ────────────────────────────────────────────────────────────────────
('Moosehead Lake', 'Maine''s largest lake and one of the finest landlocked Atlantic salmon and lake trout fisheries in the eastern US. Also excellent brook trout and smallmouth bass.', 45.6500, -69.7500, 'lake', 'Maine', true),
('Sebago Lake', 'Home of the Sebago strain of landlocked Atlantic salmon — the gold standard for Atlantic salmon genetics. Also excellent lake trout and smallmouth bass.', 43.9000, -70.5800, 'lake', 'Maine', true),
('Penobscot River', 'Maine''s largest river and the site of one of the most ambitious Atlantic salmon restoration projects in the US. Also excellent smallmouth bass and brook trout.', 44.9000, -68.8000, 'river', 'Maine', true),
('Grand Lake Stream', 'Famous for its wild brook trout and landlocked Atlantic salmon. Grand Lake Stream village has been a fishing destination since the 1800s. Classic Maine wilderness fishing.', 45.2000, -67.8000, 'stream', 'Maine', true),

-- ── MARYLAND ─────────────────────────────────────────────────────────────────
('Potomac River', 'The tidal Potomac is arguably the best smallmouth bass river in the US. Consistent catches of large smallmouth from DC to Cumberland. Also excellent channel catfish and largemouth.', 38.9600, -77.0900, 'river', 'Maryland', true),
('Deep Creek Lake', 'Maryland''s largest lake in the Appalachian Mountains. Excellent walleye, lake trout, rainbow trout, and smallmouth bass in clear, cold water.', 39.5500, -79.3200, 'lake', 'Maryland', true),
('Susquehanna River', 'The lower Susquehanna near Conowingo Dam is one of the best smallmouth bass rivers in the state. Also excellent channel catfish below the dam.', 39.6500, -76.1800, 'river', 'Maryland', true),
('Triadelphia Reservoir', 'Montgomery County reservoir with excellent largemouth bass, channel catfish, and crappie. Well-managed by WSSC and less pressure than many Maryland lakes.', 39.1700, -77.0600, 'reservoir', 'Maryland', true),

-- ── MASSACHUSETTS ────────────────────────────────────────────────────────────
('Quabbin Reservoir', 'Massachusetts'' largest reservoir and primary water supply. Exceptional lake trout and rainbow trout fishing. Access controlled but well worth the effort.', 42.3300, -72.3200, 'reservoir', 'Massachusetts', true),
('Merrimack River', 'Northern Massachusetts river with excellent striped bass, channel catfish, and smallmouth bass. Spring alewife runs draw large stripers into the lower river.', 42.7500, -71.4800, 'river', 'Massachusetts', true),
('Cape Cod Kettle Ponds', 'Dozens of crystal-clear glacial kettlehole ponds on Cape Cod hold excellent largemouth bass, chain pickerel, yellow perch, and rainbow trout.', 41.7000, -70.1800, 'pond', 'Massachusetts', true),
('Connecticut River (MA)', 'The Connecticut River through Massachusetts holds American shad (spectacular spring runs), striped bass, largemouth bass, and channel catfish.', 42.1200, -72.6300, 'river', 'Massachusetts', true),

-- ── MICHIGAN ─────────────────────────────────────────────────────────────────
('AuSable River', 'Michigan''s most celebrated trout stream. The Holy Waters between Grayling and Mio hold some of the best wild brown and rainbow trout fishing in the eastern US.', 44.5500, -84.6700, 'river', 'Michigan', true),
('Pere Marquette River', 'The premier steelhead and Pacific salmon river in Michigan. Nationally recognized as a world-class trout stream with wild steelhead runs from September through May.', 43.8700, -85.7900, 'river', 'Michigan', true),
('St. Clair River', 'Connecting Lake Huron to Lake St. Clair, this current-filled channel holds world-class walleye, steelhead, Pacific salmon, and lake trout near the Canadian border.', 42.8500, -82.6500, 'river', 'Michigan', true),
('Lake St. Clair', 'The shallow lake between Michigan and Ontario is the premier smallmouth bass fishery in North America. Consistent fish exceeding 5 pounds are common.', 42.4500, -82.7000, 'lake', 'Michigan', true),
('Muskegon Lake', 'Muskegon River outlet lake and Muskegon River itself produce excellent steelhead, Pacific salmon, brown trout, and bass. One of Michigan''s most productive fisheries.', 43.2400, -86.2500, 'lake', 'Michigan', true),
('Lake Michigan (Offshore)', 'Open water trolling on Lake Michigan produces spectacular Chinook salmon, coho salmon, rainbow trout, and lake trout. The June and July salmon fishing is among the best in the world.', 44.0000, -86.5000, 'lake', 'Michigan', true),

-- ── MINNESOTA ────────────────────────────────────────────────────────────────
('Lake Mille Lacs', 'One of the most famous walleye lakes in the world. This 132,000-acre shallow lake produces trophy walleye consistently. Also excellent perch, bass, and muskie.', 46.2200, -93.6800, 'lake', 'Minnesota', true),
('Leech Lake', 'Cass County gem known for outstanding walleye, northern pike, muskie, and perch. One of Minnesota''s largest lakes with diverse habitat and consistent fishing.', 47.1500, -94.3500, 'lake', 'Minnesota', true),
('Lake Vermilion', 'Northeast Minnesota walleye and smallmouth bass paradise near the Boundary Waters. Exceptional water clarity and classic Canadian Shield lake structure.', 47.8500, -92.3000, 'lake', 'Minnesota', true),
('Minnesota River', 'Western Minnesota river with excellent walleye, sauger, channel catfish, and flathead catfish below river junctions and wing dams on the Mississippi system.', 44.5000, -93.9000, 'river', 'Minnesota', true),
('Lake of the Woods', 'Remote northern Minnesota border lake spanning into Canada. World-class walleye and muskie fishing in 950,000 acres of wilderness fishing.', 49.0000, -94.8000, 'lake', 'Minnesota', true),
('Chippewa Flowage (Turtle Flambeau)', 'The Turtle Flambeau Flowage and nearby waters in the Chippewa National Forest system hold excellent muskie, walleye, bass, and northern pike.', 47.3000, -93.4500, 'reservoir', 'Minnesota', true),

-- ── MISSISSIPPI ──────────────────────────────────────────────────────────────
('Ross Barnett Reservoir', 'The Pearl River impoundment near Jackson is Mississippi''s most popular fishing lake. Excellent largemouth bass, crappie, and channel catfish in 33,000 acres.', 32.4400, -90.0900, 'reservoir', 'Mississippi', true),
('Grenada Lake', 'Mississippi Delta reservoir famous for tournament-winning largemouth bass and superb white crappie fishing in the flooded timber.', 33.8100, -89.8200, 'reservoir', 'Mississippi', true),
('Sardis Lake', 'Large northern Mississippi reservoir with excellent largemouth bass, crappie, and catfish. Part of the Yazoo River basin flood control system.', 34.4800, -89.7500, 'reservoir', 'Mississippi', true),
('Pickwick Lake (MS side)', 'Tennessee River impoundment on the MS/TN/AL border. Trophy smallmouth bass water with also excellent largemouth, catfish, and crappie.', 34.9200, -88.3000, 'reservoir', 'Mississippi', true),

-- ── MISSOURI ─────────────────────────────────────────────────────────────────
('Lake of the Ozarks', 'Missouri''s largest reservoir at over 54,000 acres. Excellent largemouth and smallmouth bass, striped bass, crappie, catfish, and white bass. 1,150 miles of shoreline.', 38.2000, -92.7000, 'reservoir', 'Missouri', true),
('Table Rock Lake', 'Crystal-clear Ozarks reservoir on the MO/AR border. Premier spotted bass fishery in Missouri. Also excellent smallmouth, largemouth, striped bass, and rainbow trout below the dam.', 36.6000, -93.3800, 'reservoir', 'Missouri', true),
('Lake Taneycomo', 'Cold-water tailrace below Table Rock Dam. One of the best rainbow and brown trout lakes in the Midwest — fish over 20 inches are common in this accessible fishery.', 36.5800, -93.1900, 'lake', 'Missouri', true),
('Truman Lake', 'Osage River impoundment known for excellent crappie, largemouth bass, white bass, and channel catfish. Countless creek arms provide ideal structure.', 38.2700, -93.4000, 'reservoir', 'Missouri', true),
('Mississippi River (Missouri)', 'Below Lock and Dam 25, the river holds world-class catfish, sauger, walleye, and freshwater drum. The tailwater below any lock holds outstanding fishing.', 38.5000, -90.6500, 'river', 'Missouri', true),

-- ── MONTANA ──────────────────────────────────────────────────────────────────
('Missouri River (Below Holter Dam)', 'One of the most famous trout fisheries in the world. The Missouri below Holter Dam through the Craig area produces legendary rainbow and brown trout on a consistent basis.', 47.0100, -111.7200, 'river', 'Montana', true),
('Madison River', 'Classic Rocky Mountain trout stream known worldwide. Flowing from Yellowstone through Ennis and Three Forks, the Madison produces large rainbow and brown trout year-round.', 45.6500, -111.7800, 'river', 'Montana', true),
('Flathead Lake', 'The largest freshwater lake in the western US outside Alaska. Excellent lake trout, cutthroat trout, bull trout, and bass in dramatic Rocky Mountain scenery.', 47.8800, -114.0200, 'lake', 'Montana', true),
('Yellowstone River', 'One of the last wild river systems in the Lower 48. Excellent cutthroat, rainbow, and brown trout in the Paradise Valley section below Yellowstone National Park.', 45.6000, -110.5500, 'river', 'Montana', true),
('Fort Peck Reservoir', 'Montana''s largest lake on the Missouri River. Excellent walleye, northern pike, sauger, and lake trout in this remote eastern Montana reservoir.', 47.6500, -106.5000, 'reservoir', 'Montana', true),

-- ── NEBRASKA ─────────────────────────────────────────────────────────────────
('Lake McConaughy', '"Big Mac" — Nebraska''s largest reservoir. World-class striped bass, walleye, white bass, channel catfish, and rainbow trout below Kingsley Dam.', 41.2400, -101.7400, 'reservoir', 'Nebraska', true),
('Harlan County Reservoir', 'South-central Nebraska reservoir on the Republican River. Excellent walleye, white bass, largemouth bass, and channel catfish.', 40.0500, -99.2000, 'reservoir', 'Nebraska', true),
('North Platte River', 'Western Nebraska river with quality brown trout near Lewellen and Oshkosh. Upper reaches in Wyoming produce excellent trout fishing as it flows through ranch country.', 41.2500, -101.9000, 'river', 'Nebraska', true),
('Branched Oak Lake', 'Large metro-area reservoir near Lincoln with excellent walleye, largemouth bass, white bass, and channel catfish. Popular and well-stocked.', 40.9700, -96.8900, 'reservoir', 'Nebraska', true),

-- ── NEVADA ───────────────────────────────────────────────────────────────────
('Lake Mead', 'The largest reservoir in the US by volume. Excellent largemouth bass, striped bass, channel catfish, and carp in Mojave Desert scenery. World-class striper fishing.', 36.1200, -114.6400, 'reservoir', 'Nevada', true),
('Lake Tahoe (NV side)', 'Ultra-clear mountain lake on the NV/CA border. Excellent mackinaw (lake trout) and rainbow trout fishing. The clarity is unmatched — fish in 100+ feet of water.', 39.1000, -119.9700, 'lake', 'Nevada', true),
('Pyramid Lake', 'Ancient desert lake north of Reno holds the largest Lahontan cutthroat trout in the world. Special permit required but produces fish exceeding 20 pounds.', 40.0000, -119.5700, 'lake', 'Nevada', true),
('Lake Mohave', 'Colorado River reservoir between Hoover and Davis Dams. Outstanding largemouth and striped bass, plus excellent rainbow trout below Hoover Dam.', 35.4700, -114.6800, 'reservoir', 'Nevada', true),

-- ── NEW HAMPSHIRE ────────────────────────────────────────────────────────────
('Lake Winnipesaukee', 'New Hampshire''s largest lake. Excellent landlocked Atlantic salmon, lake trout, smallmouth bass, and yellow perch. Beautiful White Mountains scenery.', 43.6100, -71.4800, 'lake', 'New Hampshire', true),
('Connecticut River (NH)', 'The Connecticut River along the VT/NH border provides excellent smallmouth bass and walleye fishing. Also brown trout in the upper reaches near the headwaters.', 44.4000, -71.8000, 'river', 'New Hampshire', true),
('Squam Lake', 'Made famous by "On Golden Pond." Excellent landlocked salmon, lake trout, rainbow trout, and smallmouth bass in a pristine, scenic setting.', 43.7700, -71.5200, 'lake', 'New Hampshire', true),

-- ── NEW JERSEY ───────────────────────────────────────────────────────────────
('Lake Hopatcong', 'New Jersey''s largest lake. Excellent largemouth and smallmouth bass, pickerel, catfish, perch, and crappie. Multiple public access points.', 40.9600, -74.6200, 'lake', 'New Jersey', true),
('Round Valley Reservoir', 'Deep, cold reservoir with excellent trophy rainbow and brown trout. One of the few places in NJ to catch lake trout. Strict regulations protect the quality fishery.', 40.6200, -74.8700, 'reservoir', 'New Jersey', true),
('Delaware River (NJ)', 'Upper Delaware produces excellent shad, walleye, smallmouth bass, and American eel. Shad run in spring is a major event drawing thousands of anglers.', 40.9500, -74.9500, 'river', 'New Jersey', true),
('Spruce Run Reservoir', 'Central NJ reservoir with excellent bass, walleye, muskellunge (Tiger Muskie), and panfish. One of the most consistent muskie lakes in the state.', 40.6700, -74.8700, 'reservoir', 'New Jersey', true),

-- ── NEW MEXICO ───────────────────────────────────────────────────────────────
('Elephant Butte Reservoir', 'New Mexico''s largest lake. Excellent largemouth and smallmouth bass, striped bass, walleye, and catfish in the Rio Grande impoundment.', 33.1600, -107.2200, 'reservoir', 'New Mexico', true),
('Navajo Lake', 'San Juan River impoundment in the Four Corners area. Excellent kokanee salmon, rainbow trout, smallmouth bass, and largemouth bass in dramatic canyon scenery.', 36.8000, -107.6300, 'reservoir', 'New Mexico', true),
('San Juan River (Below Navajo Dam)', 'One of the finest tailwater trout fisheries in the US. Consistent large rainbow trout — fish over 20 inches are common in the Quality Waters section.', 36.7600, -107.6100, 'river', 'New Mexico', true),
('Eagle Nest Lake', 'High-altitude (8,300 ft) mountain lake with excellent rainbow trout, kokanee salmon, and lake trout. Stunning Sangre de Cristo Mountain scenery.', 36.5400, -105.2600, 'lake', 'New Mexico', true),

-- ── NEW YORK ─────────────────────────────────────────────────────────────────
('St. Lawrence River', 'One of the premier muskellunge rivers in the world. The Thousand Islands area holds trophy muskie, smallmouth bass, walleye, and northern pike.', 44.5000, -75.8000, 'river', 'New York', true),
('Oneida Lake', 'New York''s largest inland lake at 51,000 acres. World-famous walleye fishery with consistent trophy catches. Also excellent yellow perch and smallmouth bass.', 43.2000, -75.9000, 'lake', 'New York', true),
('Finger Lakes (Seneca)', 'The deepest Finger Lake at 618 feet. Excellent lake trout, rainbow trout, Atlantic salmon, and brown trout in one of the most scenic lake systems in the US.', 42.6600, -76.9200, 'lake', 'New York', true),
('Delaware River (NY)', 'Upper Delaware Wild and Scenic River holds wild brown and rainbow trout. Cold, clear water and scenic Delaware Water Gap make this a premier eastern trout stream.', 41.7000, -74.9000, 'river', 'New York', true),
('Niagara River', 'Below Niagara Falls, this powerful river holds world-class steelhead, brown trout, and Chinook salmon runs. Trophy fish approaching 20 pounds are regularly caught.', 43.1500, -79.0400, 'river', 'New York', true),
('Adirondack Ponds (Saranac Lakes)', 'The Saranac Lake chain and surrounding Adirondack ponds hold excellent landlocked Atlantic salmon, lake trout, brook trout, and smallmouth bass.', 44.3300, -74.1300, 'lake', 'New York', true),

-- ── NORTH CAROLINA ───────────────────────────────────────────────────────────
('Lake Norman', 'Charlotte area''s premier fishing lake. Excellent largemouth bass, striped bass, crappie, catfish, and walleye in the Catawba River''s largest impoundment.', 35.5800, -80.9000, 'reservoir', 'North Carolina', true),
('Lake Gaston', 'Roanoke River impoundment on the NC/VA border. Top striped bass lake in the Southeast — fish regularly exceed 30 pounds. Also excellent bass and crappie.', 36.5000, -77.9000, 'reservoir', 'North Carolina', true),
('New River (NC)', 'One of the oldest rivers in North America. Excellent smallmouth bass fishing in the New River Gorge area and throughout the Blue Ridge section.', 36.2100, -81.6500, 'river', 'North Carolina', true),
('Nantahala River', 'Cold tailwater river in western North Carolina. Excellent rainbow and brown trout fishing, particularly in the stocked section from the dam to the Nantahala Outdoor Center.', 35.3200, -83.7500, 'river', 'North Carolina', true),
('Falls Lake', 'Wake County reservoir near Raleigh. Excellent largemouth bass, crappie, catfish, and the occasional striped bass. Most accessible metro-area fishing destination.', 36.0200, -78.7600, 'reservoir', 'North Carolina', true),

-- ── NORTH DAKOTA ─────────────────────────────────────────────────────────────
('Lake Sakakawea', 'One of the largest reservoirs in the US at 368,000 acres. Exceptional walleye and northern pike with chinook salmon stocking. Remote and wild feeling.', 47.6000, -101.8500, 'reservoir', 'North Dakota', true),
('Devils Lake', 'Landlocked lake in northeastern ND with outstanding walleye, yellow perch, and northern pike. The lake has been rising for decades, expanding fishing opportunities.', 47.9200, -99.0300, 'lake', 'North Dakota', true),
('Missouri River (ND)', 'Below Garrison Dam, the Missouri holds excellent walleye, sauger, catfish, and northern pike. Tailwater fishing below the dam can be spectacular.', 47.3500, -101.0000, 'river', 'North Dakota', true),
('Lake Oahe (ND)', 'Bismarck area portion of the massive Missouri River reservoir. Excellent walleye fishing, particularly in spring and fall near rocky points and main lake structure.', 46.7800, -100.5600, 'reservoir', 'North Dakota', true),

-- ── OHIO ─────────────────────────────────────────────────────────────────────
('Lake Erie (OH)', 'The walleye capital of the world. Ohio''s Lake Erie shoreline produces massive walleye catches, plus excellent yellow perch, steelhead, and smallmouth bass.', 41.8000, -82.5000, 'lake', 'Ohio', true),
('Ohio River', 'Below major dams, the Ohio holds world-class flathead and blue catfish, sauger, walleye, and freshwater drum. The river is heavily underutilized by anglers.', 39.1000, -84.4000, 'river', 'Ohio', true),
('Caesar Creek Lake', 'Warren County reservoir with excellent smallmouth bass, largemouth bass, white bass, and crappie. Spring white bass runs up Caesar Creek are exceptional.', 39.5000, -84.0000, 'reservoir', 'Ohio', true),
('Grand River (OH)', 'Northeast Ohio tributary to Lake Erie. One of Ohio''s top steelhead rivers with good runs from October through April. Brown and rainbow trout stocked throughout.', 41.7700, -81.2400, 'river', 'Ohio', true),
('Alum Creek Lake', 'Columbus area reservoir with excellent crappie, largemouth bass, and channel catfish. One of the most-visited lakes in central Ohio.', 40.2300, -82.9600, 'reservoir', 'Ohio', true),

-- ── OKLAHOMA ─────────────────────────────────────────────────────────────────
('Lake Texoma', 'Spanning OK and TX on the Red River, Lake Texoma is a world-class striped bass fishery. Also excellent largemouth, white bass, crappie, and catfish in 89,000 acres.', 33.8300, -96.7700, 'reservoir', 'Oklahoma', true),
('Grand Lake O''The Cherokees', 'Northeastern Oklahoma reservoir with excellent largemouth and smallmouth bass, crappie, and catfish. One of the most visited lakes in the state.', 36.4300, -95.0000, 'reservoir', 'Oklahoma', true),
('Lake Eufaula', 'Oklahoma''s largest lake at 102,000 acres. Excellent largemouth bass, crappie, white bass, and catfish. Considered one of the top largemouth lakes in the South.', 35.3000, -95.4000, 'reservoir', 'Oklahoma', true),
('Tenkiller Lake', 'Crystal-clear eastern Oklahoma reservoir with excellent spotted bass, largemouth, smallmouth, hybrid striper, and walleye. Beautiful lake in the Cookson Hills.', 35.6000, -95.0500, 'reservoir', 'Oklahoma', true),
('Arkansas River (OK)', 'Oklahoma stretch of the Arkansas holds excellent catfish, sauger, walleye, and white bass — especially below lock and dam structures.', 35.5000, -96.0000, 'river', 'Oklahoma', true),

-- ── OREGON ───────────────────────────────────────────────────────────────────
('Columbia River (Lower)', 'World-famous Chinook salmon and steelhead river. The Lower Columbia from Bonneville Dam to the ocean holds massive fall Chinook runs and excellent year-round steelhead.', 45.6500, -121.9400, 'river', 'Oregon', true),
('Deschutes River', 'Oregon''s premier steelhead and trout river. The lower canyon below Maupin is famous for half-pounder steelhead in fall and excellent redside rainbow trout year-round.', 44.9000, -121.0500, 'river', 'Oregon', true),
('Rogue River', 'Classic Southern Oregon river famous for fall Chinook salmon, winter steelhead, and half-pounder steelhead. Trophy trout fishing in the upper river near Crater Lake.', 42.5000, -123.4000, 'river', 'Oregon', true),
('Owyhee Reservoir', 'Remote eastern Oregon reservoir with excellent smallmouth bass, largemouth bass, and crappie. Dramatic canyon scenery and minimal fishing pressure.', 43.5300, -117.2300, 'reservoir', 'Oregon', true),
('Lake Billy Chinook', 'Three-river reservoir in central Oregon. Outstanding smallmouth bass and bull trout fishing in Deschutes River arm. Also kokanee and rainbow trout.', 44.5600, -121.3700, 'reservoir', 'Oregon', true),

-- ── PENNSYLVANIA ─────────────────────────────────────────────────────────────
('Raystown Lake', 'Pennsylvania''s largest lake. Excellent largemouth and smallmouth bass, walleye, tiger muskie, striped bass, and channel catfish in 8,300 acres of deep water.', 40.3800, -78.0400, 'reservoir', 'Pennsylvania', true),
('Delaware River (PA)', 'Upper Delaware Wild and Scenic River holds excellent smallmouth bass, American shad (spring run), and brown trout in the northern sections.', 41.3800, -74.8500, 'river', 'Pennsylvania', true),
('Susquehanna River (PA)', 'North Branch Susquehanna through the Wyoming Valley and West Branch are excellent smallmouth bass rivers. Also outstanding in the lower reaches near Harrisburg.', 41.0000, -76.4500, 'river', 'Pennsylvania', true),
('Pymatuning Reservoir', 'Lake Erie drainage reservoir on the PA/OH border. Excellent walleye, muskellunge, crappie, largemouth bass, and channel catfish.', 41.5700, -80.4500, 'reservoir', 'Pennsylvania', true),
('Pennsylvania Dutch Country Trout Streams (Letort)', 'The Letort Spring Run near Carlisle is the birthplace of American trout fishing. Legendary brown trout in crystal-clear limestone springs.', 40.1900, -77.1200, 'stream', 'Pennsylvania', true),

-- ── RHODE ISLAND ─────────────────────────────────────────────────────────────
('Scituate Reservoir', 'Rhode Island''s largest reservoir and primary water supply. Excellent largemouth bass, chain pickerel, yellow perch, and catfish in the Bristol County watershed.', 41.7500, -71.6100, 'reservoir', 'Rhode Island', true),
('Wood River', 'Rhode Island''s premier wild trout stream. Cold, clear spring-fed river holds excellent wild brown trout and stocked rainbow trout.', 41.5700, -71.7000, 'river', 'Rhode Island', true),
('Worden Pond', 'Rhode Island''s largest natural pond with excellent largemouth bass, chain pickerel, yellow perch, and bluegill. Public access and beautiful rural setting.', 41.4400, -71.6400, 'pond', 'Rhode Island', true),

-- ── SOUTH CAROLINA ───────────────────────────────────────────────────────────
('Lake Murray', 'Columbia metro reservoir with excellent largemouth bass, hybrid striped bass, white bass, and crappie. One of the most-visited lakes in South Carolina.', 34.0800, -81.3600, 'reservoir', 'South Carolina', true),
('Santee-Cooper Lakes (Marion & Moultrie)', 'The birthplace of landlocked striped bass. Lake Marion and Lake Moultrie hold massive striped bass, catfish, crappie, and the famous "Santee" striper.', 33.4000, -80.0000, 'reservoir', 'South Carolina', true),
('Lake Hartwell (SC side)', 'Savannah River impoundment on the SC/GA border. Excellent largemouth and spotted bass, with consistent striped bass catches.', 34.3500, -82.9000, 'reservoir', 'South Carolina', true),
('Edisto River', 'The longest free-flowing blackwater river in North America. Excellent largemouth bass, redbreast sunfish, catfish, and gar in dark, tannic water.', 33.5000, -80.8800, 'river', 'South Carolina', true),

-- ── SOUTH DAKOTA ─────────────────────────────────────────────────────────────
('Lake Oahe (SD)', 'Part of the Missouri River mainstem reservoir system. World-class walleye and northern pike. The walleye fishing here is among the best in the Midwest.', 44.5000, -100.4000, 'reservoir', 'South Dakota', true),
('Lewis and Clark Lake', 'Gavins Point Dam impoundment at the SD/NE border. Outstanding walleye, sauger, channel catfish, and white bass below the dam.', 42.8800, -97.5200, 'reservoir', 'South Dakota', true),
('Lake Sharpe (Big Bend)', 'Middle Missouri River reservoir with excellent walleye, northern pike, and smallmouth bass. Less pressure than Oahe but equally productive.', 44.0000, -99.8000, 'reservoir', 'South Dakota', true),
('Big Stone Lake', 'Border lake between SD and MN at the head of the Minnesota River. Excellent walleye, northern pike, and perch. Historic spawning ground for many species.', 45.4000, -96.4500, 'lake', 'South Dakota', true),

-- ── TENNESSEE ────────────────────────────────────────────────────────────────
('Dale Hollow Lake (TN side)', 'TN/KY border reservoir holding the world record smallmouth bass (11 lb 15 oz, 1955). Trophy smallmouth, walleye, crappie, and trout below the dam.', 36.5500, -85.4800, 'reservoir', 'Tennessee', true),
('Norris Lake', 'TVA''s first reservoir. Excellent spotted and largemouth bass, walleye, and striped bass in clear water. One of the cleanest Tennessee reservoirs.', 36.3100, -84.0800, 'reservoir', 'Tennessee', true),
('Chickamauga Lake', 'Tennessee River impoundment near Chattanooga with excellent largemouth and smallmouth bass, catfish, and crappie. Popular tournament destination.', 35.2200, -85.2200, 'reservoir', 'Tennessee', true),
('Hiwassee River', 'Premier tailwater trout fishery in eastern Tennessee below Apalachia Dam. Wild and stocked rainbow and brown trout in a beautiful Appalachian setting.', 35.0800, -84.7500, 'river', 'Tennessee', true),
('Reelfoot Lake', 'Created by the 1811 New Madrid earthquake. This shallow cypress swamp lake is one of the finest crappie, largemouth bass, and bluegill fisheries in America.', 36.4000, -89.3300, 'lake', 'Tennessee', true),
('Watauga River', 'Stocked and wild trout stream in northeastern Tennessee, with a quality section below Wilbur Dam producing brown and rainbow trout year-round.', 36.4000, -82.2500, 'river', 'Tennessee', true),

-- ── TEXAS ────────────────────────────────────────────────────────────────────
('Lake Fork', 'The largemouth bass record machine of Texas. More 13-pound-plus bass have been caught here than anywhere else in the world. A must-fish destination for trophy bass anglers.', 32.8700, -95.6400, 'reservoir', 'Texas', true),
('Sam Rayburn Reservoir', 'East Texas powerhouse. At 113,000 acres, it''s one of the largest reservoirs in Texas. Consistently produces tournament-winning largemouth bass.', 31.0800, -94.1500, 'reservoir', 'Texas', true),
('Lake Amistad', 'Texas/Mexico border reservoir with exceptional largemouth and smallmouth bass, striped bass, and catfish in stark desert canyon scenery.', 29.5000, -101.0700, 'reservoir', 'Texas', true),
('Falcon Lake', 'Rio Grande reservoir with world-class largemouth bass, striped bass, and catfish. During high-water years produces some of the largest bass in Texas.', 26.5600, -99.1500, 'reservoir', 'Texas', true),
('Toledo Bend (TX side)', 'The Texas side of Toledo Bend is equally productive for tournament-quality largemouth bass. 181,000 combined acres makes it the fifth largest US man-made lake.', 31.5000, -93.5500, 'reservoir', 'Texas', true),
('Livingston Lake', 'Sam Houston National Forest impoundment. Trophy flathead catfish — some exceeding 50 pounds — plus largemouth bass and crappie.', 30.8500, -95.0600, 'reservoir', 'Texas', true),
('Guadalupe River', 'Texas Hill Country river with a world-class Guadalupe bass (Texas state fish) fishery. Also excellent rainbow and brown trout stocking below Canyon Lake.', 29.8000, -98.1500, 'river', 'Texas', true),
('Rio Grande', 'The Rio Grande below Amistad Dam and in Big Bend National Park holds Guadalupe bass, catfish, and carp in dramatic desert canyon scenery.', 29.1000, -103.1000, 'river', 'Texas', true),

-- ── VERMONT ──────────────────────────────────────────────────────────────────
('Lake Champlain', 'One of the finest natural lakes in the eastern US. Excellent smallmouth and largemouth bass, northern pike, walleye, lake trout, and landlocked Atlantic salmon.', 44.5000, -73.3000, 'lake', 'Vermont', true),
('Connecticut River (VT)', 'Forms the VT/NH border. Excellent smallmouth bass, walleye, and shad. Spring shad runs and consistent bass fishing make it a top Vermont river.', 44.0000, -72.3500, 'river', 'Vermont', true),
('Harriman Reservoir (Whitingham Lake)', 'Deerfield River impoundment in southern Vermont. Excellent rainbow and brown trout, smallmouth bass, and yellow perch.', 42.7900, -72.8700, 'reservoir', 'Vermont', true),

-- ── VIRGINIA ─────────────────────────────────────────────────────────────────
('Smith Mountain Lake', 'Roanoke River impoundment with excellent striped bass, largemouth and smallmouth bass, crappie, and walleye. One of Virginia''s most popular lakes.', 37.0000, -79.6500, 'reservoir', 'Virginia', true),
('Kerr Reservoir (Buggs Island)', 'VA/NC border reservoir at 50,000 acres. World-class striped bass fishery with fish regularly exceeding 40 pounds. Also excellent largemouth and crappie.', 36.6000, -78.3000, 'reservoir', 'Virginia', true),
('Shenandoah River (South Fork)', 'Premier smallmouth bass river in the East. The South Fork from Port Republic to Front Royal is considered one of the best smallmouth streams in the country.', 38.7000, -78.6500, 'river', 'Virginia', true),
('James River', 'Virginia''s longest river holds excellent smallmouth bass in the Richmond area and upper reaches. Also good for catfish, stripers in the tidal section.', 37.5300, -77.4300, 'river', 'Virginia', true),

-- ── WASHINGTON ───────────────────────────────────────────────────────────────
('Columbia River (WA)', 'Below McNary and John Day dams, the Columbia produces world-class Chinook salmon, steelhead, walleye, and sturgeon. One of the most important salmon rivers on earth.', 46.2000, -119.1300, 'river', 'Washington', true),
('Banks Lake', 'Grand Coulee irrigation reservoir with excellent walleye, largemouth and smallmouth bass, rainbow trout, and perch in stark basalt canyon scenery.', 47.8800, -119.2400, 'reservoir', 'Washington', true),
('Lake Chelan', 'Deep glacial lake in the Cascade Mountains. Excellent lake trout, rainbow trout, and kokanee. The deepest lake in the US at 1,486 feet.', 47.8400, -120.1600, 'lake', 'Washington', true),
('Yakima River', 'Central Washington trout stream with excellent dry-fly fishing for rainbow and brown trout. Canyon section near Ellensburg is the most productive.', 46.9000, -120.5000, 'river', 'Washington', true),
('Green River (WA)', 'Excellent winter steelhead and salmon river south of Seattle. Hatchery returns make it one of the most consistent fishing rivers in the Puget Sound watershed.', 47.3100, -122.1300, 'river', 'Washington', true),

-- ── WEST VIRGINIA ────────────────────────────────────────────────────────────
('New River (WV)', 'One of the oldest rivers in the world with exceptional smallmouth bass fishing in the New River Gorge. Trophy bass in fast, clear water near Hinton and Fayetteville.', 37.9500, -81.1300, 'river', 'West Virginia', true),
('Summersville Lake', 'Crystal-clear Gauley River impoundment with excellent smallmouth bass and walleye. One of the clearest and most scenic reservoirs in the Appalachians.', 38.2800, -80.8700, 'reservoir', 'West Virginia', true),
('Elk River', 'Central WV smallmouth bass river with excellent catches of 3–4 pound fish in its rocky pools and riffles. Also good for channel catfish in lower sections.', 38.7600, -80.7700, 'river', 'West Virginia', true),
('Tygart Lake', 'Small impoundment in north-central WV. Excellent walleye, bass, crappie, and channel catfish. Beautiful mountain scenery in the Tygart River valley.', 39.3200, -79.8700, 'reservoir', 'West Virginia', true),

-- ── WISCONSIN ────────────────────────────────────────────────────────────────
('Chippewa Flowage', 'The Muskie capital of the world. This 15,000-acre wild rice lake in northwestern Wisconsin has produced more record muskellunge than any other body of water. Also excellent walleye and northern pike.', 45.9200, -91.2500, 'reservoir', 'Wisconsin', true),
('Lake Winnebago', 'Wisconsin''s largest inland lake at 137,700 acres. Famous for ice fishing for yellow perch and walleye. Also excellent white bass, catfish, and largemouth bass.', 43.9500, -88.3500, 'lake', 'Wisconsin', true),
('Wisconsin River', 'One of the longest rivers in the state with excellent walleye, smallmouth bass, channel catfish, and northern pike. The lower river near its mouth is exceptional.', 43.3700, -89.7700, 'river', 'Wisconsin', true),
('Green Bay (WI)', 'The western arm of Lake Michigan. World-class walleye, yellow perch, and smallmouth bass. The mouth of the Fox River below De Pere Dam is legendary.', 44.5000, -87.9500, 'lake', 'Wisconsin', true),
('Trout Creek (Driftless Area)', 'The Wisconsin Driftless Area holds dozens of class-A wild brown trout streams. Spring-fed, gin-clear streams with large, wary fish — technical fly fishing at its best.', 43.3000, -90.9000, 'stream', 'Wisconsin', true),

-- ── WYOMING ──────────────────────────────────────────────────────────────────
('Yellowstone Lake', 'The largest high-altitude lake in North America at 7,733 feet. Excellent cutthroat trout fishing in wild, remote backcountry setting. Special regulations protect native cutthroat.', 44.4200, -110.3600, 'lake', 'Wyoming', true),
('North Platte River (WY)', 'Below Gray Reef Dam near Casper, the North Platte is a world-class tailwater trout fishery. Large rainbow and brown trout in a series of productive pools and riffles.', 42.6800, -106.4700, 'river', 'Wyoming', true),
('Jackson Lake', 'Grand Teton National Park glacier lake with excellent lake trout and native Snake River cutthroat trout. Remote float fishing on the Snake below Jackson Lake Dam is world-class.', 43.9100, -110.6800, 'lake', 'Wyoming', true),
('Boysen Reservoir', 'Central Wyoming Wind River impoundment with excellent walleye, brown trout, rainbow trout, and channel catfish. Less crowded than many Wyoming waters.', 43.3900, -108.1900, 'reservoir', 'Wyoming', true),
('Bighorn River (Below Thermopolis)', 'Trophy brown and rainbow trout tailwater below Boysen Dam and continuing to Worland. One of Wyoming''s best kept trout fishing secrets.', 43.6800, -108.2000, 'river', 'Wyoming', true)

ON CONFLICT DO NOTHING;

-- ─── 3. LINK FISH TO NATIONWIDE SPOTS ────────────────────────────────────────

DO $$
DECLARE
  pair text[];
  v_spot_id uuid;
  v_fish_id uuid;
BEGIN
  FOR pair IN SELECT ARRAY[s,f] FROM (VALUES
    -- Bass spots
    ('Lake Guntersville', 'Largemouth Bass'),
    ('Lake Guntersville', 'Striped Bass'),
    ('Lake Guntersville', 'Smallmouth Bass'),
    ('Clear Lake', 'Largemouth Bass'),
    ('Lake Fork', 'Largemouth Bass'),
    ('Sam Rayburn Reservoir', 'Largemouth Bass'),
    ('Lake Texoma', 'Striped Bass'),
    ('Lake Texoma', 'Largemouth Bass'),
    ('Lake Mead', 'Striped Bass'),
    ('Lake Mead', 'Largemouth Bass'),
    ('Lake Havasu', 'Striped Bass'),
    ('Lake Havasu', 'Largemouth Bass'),
    ('Lake Havasu', 'Smallmouth Bass'),
    ('Kerr Reservoir (Buggs Island)', 'Striped Bass'),
    ('Kerr Reservoir (Buggs Island)', 'Largemouth Bass'),
    ('Lake Gaston', 'Striped Bass'),
    ('Lake Gaston', 'Largemouth Bass'),
    ('Santee-Cooper Lakes (Marion & Moultrie)', 'Striped Bass'),
    ('Santee-Cooper Lakes (Marion & Moultrie)', 'Largemouth Bass'),
    ('Santee-Cooper Lakes (Marion & Moultrie)', 'Channel Catfish'),
    ('Lake Okeechobee', 'Largemouth Bass'),
    ('Lake Tohopekaliga (Toho)', 'Largemouth Bass'),
    ('Toledo Bend Reservoir', 'Largemouth Bass'),
    ('Toledo Bend (TX side)', 'Largemouth Bass'),
    ('Weiss Lake', 'Largemouth Bass'),
    ('Lake Eufaula', 'Largemouth Bass'),
    ('Grand Lake O''The Cherokees', 'Largemouth Bass'),
    ('Lake Norman', 'Largemouth Bass'),
    ('Lake Murray', 'Largemouth Bass'),
    ('Lake of the Ozarks', 'Largemouth Bass'),
    ('Table Rock Lake', 'Smallmouth Bass'),
    ('Table Rock Lake', 'Largemouth Bass'),
    ('Shasta Lake', 'Largemouth Bass'),
    ('Shasta Lake', 'Smallmouth Bass'),
    ('Delta (Sacramento-San Joaquin)', 'Largemouth Bass'),
    ('Roosevelt Lake', 'Largemouth Bass'),
    ('Roosevelt Lake', 'Smallmouth Bass'),
    ('Banks Lake', 'Largemouth Bass'),
    ('Banks Lake', 'Smallmouth Bass'),
    ('Owyhee Reservoir', 'Smallmouth Bass'),
    ('Owyhee Reservoir', 'Largemouth Bass'),
    ('Raystown Lake', 'Largemouth Bass'),
    ('Raystown Lake', 'Smallmouth Bass'),
    ('New River (WV)', 'Smallmouth Bass'),
    ('Summersville Lake', 'Smallmouth Bass'),
    ('Shenandoah River (South Fork)', 'Smallmouth Bass'),
    ('Potomac River', 'Smallmouth Bass'),
    ('James River', 'Smallmouth Bass'),
    ('Lake St. Clair', 'Smallmouth Bass'),
    ('St. Lawrence River', 'Smallmouth Bass'),
    ('Dale Hollow Lake', 'Smallmouth Bass'),
    ('Dale Hollow Lake (TN side)', 'Smallmouth Bass'),
    ('Tenkiller Lake', 'Smallmouth Bass'),
    ('Lake Champlain', 'Largemouth Bass'),
    ('Lake Champlain', 'Smallmouth Bass'),
    ('Lake Champlain', 'Northern Pike'),
    ('Lake Champlain', 'Walleye'),
    -- Walleye spots
    ('Lake Mille Lacs', 'Walleye'),
    ('Leech Lake', 'Walleye'),
    ('Leech Lake', 'Northern Pike'),
    ('Lake Vermilion', 'Walleye'),
    ('Lake of the Woods', 'Walleye'),
    ('Lake Erie (OH)', 'Walleye'),
    ('Lake Erie (OH)', 'Yellow Perch'),
    ('Lake Sakakawea', 'Walleye'),
    ('Lake Sakakawea', 'Northern Pike'),
    ('Lake Oahe (SD)', 'Walleye'),
    ('Lake Oahe (SD)', 'Northern Pike'),
    ('Lake Oahe (ND)', 'Walleye'),
    ('Devils Lake', 'Walleye'),
    ('Devils Lake', 'Yellow Perch'),
    ('Devils Lake', 'Northern Pike'),
    ('Milford Lake', 'Walleye'),
    ('Milford Lake', 'White Bass'),
    ('Bull Shoals Lake', 'Walleye'),
    ('Oneida Lake', 'Walleye'),
    ('Oneida Lake', 'Yellow Perch'),
    ('Pymatuning Reservoir', 'Walleye'),
    ('Pymatuning Reservoir', 'Muskellunge'),
    ('Deep Creek Lake', 'Walleye'),
    ('Fort Peck Reservoir', 'Walleye'),
    ('Fort Peck Reservoir', 'Northern Pike'),
    ('Lake McConaughy', 'Walleye'),
    ('Lake McConaughy', 'White Bass'),
    ('Lake McConaughy', 'Striped Bass'),
    ('Elephant Butte Reservoir', 'Walleye'),
    ('Elephant Butte Reservoir', 'Largemouth Bass'),
    ('Monroe Lake', 'Walleye'),
    ('Raystown Lake', 'Walleye'),
    -- Muskie spots
    ('Chippewa Flowage', 'Muskellunge'),
    ('Chippewa Flowage', 'Walleye'),
    ('Chippewa Flowage', 'Northern Pike'),
    ('St. Lawrence River', 'Muskellunge'),
    ('St. Lawrence River', 'Northern Pike'),
    ('Lake Vermilion', 'Muskellunge'),
    ('Leech Lake', 'Muskellunge'),
    ('Lake of the Woods', 'Muskellunge'),
    ('Spruce Run Reservoir', 'Muskellunge'),
    -- Crappie spots
    ('Weiss Lake', 'Black Crappie'),
    ('Weiss Lake', 'White Crappie'),
    ('Reelfoot Lake', 'Black Crappie'),
    ('Grenada Lake', 'Black Crappie'),
    ('Grenada Lake', 'White Crappie'),
    ('Grenada Lake', 'Largemouth Bass'),
    ('Ross Barnett Reservoir', 'White Crappie'),
    ('Atchafalaya Basin', 'Black Crappie'),
    ('Atchafalaya Basin', 'White Crappie'),
    ('Atchafalaya Basin', 'Channel Catfish'),
    ('Atchafalaya Basin', 'Largemouth Bass'),
    ('Lake Winnebago', 'Yellow Perch'),
    ('Lake Winnebago', 'Walleye'),
    -- Catfish spots
    ('Lake Texoma', 'Channel Catfish'),
    ('Livingston Lake', 'Flathead Catfish'),
    ('Livingston Lake', 'Channel Catfish'),
    ('Sabine River', 'Alligator Gar'),
    ('Sabine River', 'Channel Catfish'),
    ('Sabine River', 'Largemouth Bass'),
    ('Rio Grande', 'Channel Catfish'),
    ('Arkansas River (OK)', 'Channel Catfish'),
    ('Mississippi River (Iowa)', 'Channel Catfish'),
    ('Missouri River (ND)', 'Channel Catfish'),
    ('Missouri River (ND)', 'Walleye'),
    ('Missouri River (ND)', 'Sauger'),
    ('Ohio River', 'Flathead Catfish'),
    ('Ohio River', 'Channel Catfish'),
    ('Ohio River', 'Sauger'),
    ('Illinois River', 'Channel Catfish'),
    ('Illinois River', 'Largemouth Bass'),
    ('Illinois River', 'Walleye'),
    ('Mississippi River (Missouri)', 'Channel Catfish'),
    ('Mississippi River (Missouri)', 'Walleye'),
    ('Mississippi River (Missouri)', 'Sauger'),
    -- Trout spots
    ('Missouri River (Below Holter Dam)', 'Rainbow Trout'),
    ('Missouri River (Below Holter Dam)', 'Brown Trout'),
    ('Madison River', 'Rainbow Trout'),
    ('Madison River', 'Brown Trout'),
    ('Yellowstone River', 'Cutthroat Trout'),
    ('Yellowstone River', 'Rainbow Trout'),
    ('Yellowstone Lake', 'Cutthroat Trout'),
    ('Henry''s Fork of the Snake River', 'Rainbow Trout'),
    ('South Fork Snake River', 'Cutthroat Trout'),
    ('AuSable River', 'Brown Trout'),
    ('AuSable River', 'Rainbow Trout'),
    ('Pere Marquette River', 'Steelhead'),
    ('Pere Marquette River', 'Brown Trout'),
    ('Niagara River', 'Steelhead'),
    ('Niagara River', 'Brown Trout'),
    ('Lake Champlain', 'Lake Trout'),
    ('Flathead Lake', 'Lake Trout'),
    ('Flathead Lake', 'Cutthroat Trout'),
    ('Lake Pend Oreille', 'Rainbow Trout'),
    ('Lake Pend Oreille', 'Lake Trout'),
    ('Coeur d''Alene Lake', 'Rainbow Trout'),
    ('Coeur d''Alene Lake', 'Kokanee Salmon'),
    ('Deschutes River', 'Steelhead'),
    ('Deschutes River', 'Rainbow Trout'),
    ('Rogue River', 'Steelhead'),
    ('Rogue River', 'Chinook Salmon'),
    ('Columbia River (Lower)', 'Chinook Salmon'),
    ('Columbia River (Lower)', 'Steelhead'),
    ('Columbia River (WA)', 'Chinook Salmon'),
    ('Columbia River (WA)', 'Steelhead'),
    ('Columbia River (WA)', 'Walleye'),
    ('Sacramento River', 'Chinook Salmon'),
    ('Sacramento River', 'Steelhead'),
    ('North Platte River (WY)', 'Rainbow Trout'),
    ('North Platte River (WY)', 'Brown Trout'),
    ('San Juan River (Below Navajo Dam)', 'Rainbow Trout'),
    ('San Juan River (Below Navajo Dam)', 'Brown Trout'),
    ('Bighorn River (Below Thermopolis)', 'Brown Trout'),
    ('Bighorn River (Below Thermopolis)', 'Rainbow Trout'),
    ('White River (Below Bull Shoals)', 'Rainbow Trout'),
    ('White River (Below Bull Shoals)', 'Brown Trout'),
    ('Cumberland River (Below Wolf Creek Dam)', 'Rainbow Trout'),
    ('Cumberland River (Below Wolf Creek Dam)', 'Brown Trout'),
    ('Lake Taneycomo', 'Rainbow Trout'),
    ('Lake Taneycomo', 'Brown Trout'),
    ('Table Rock Lake', 'Rainbow Trout'),
    ('Hiwassee River', 'Rainbow Trout'),
    ('Hiwassee River', 'Brown Trout'),
    ('Watauga River', 'Rainbow Trout'),
    ('Watauga River', 'Brown Trout'),
    ('Nantahala River', 'Rainbow Trout'),
    ('Nantahala River', 'Brown Trout'),
    ('Finger Lakes (Seneca)', 'Lake Trout'),
    ('Finger Lakes (Seneca)', 'Rainbow Trout'),
    ('Moosehead Lake', 'Brook Trout'),
    ('Moosehead Lake', 'Lake Trout'),
    ('Sebago Lake', 'Lake Trout'),
    ('Grand Lake Stream', 'Brook Trout'),
    ('Cape Cod Kettle Ponds', 'Rainbow Trout'),
    ('Lake Winnipesaukee', 'Lake Trout'),
    ('Squam Lake', 'Lake Trout'),
    ('Squam Lake', 'Rainbow Trout'),
    ('Quabbin Reservoir', 'Lake Trout'),
    ('Quabbin Reservoir', 'Rainbow Trout'),
    ('Round Valley Reservoir', 'Rainbow Trout'),
    ('Round Valley Reservoir', 'Brown Trout'),
    ('Pennsylvania Dutch Country Trout Streams (Letort)', 'Brown Trout'),
    ('Blue Mesa Reservoir', 'Kokanee Salmon'),
    ('Blue Mesa Reservoir', 'Lake Trout'),
    ('Blue Mesa Reservoir', 'Rainbow Trout'),
    ('Navajo Lake', 'Kokanee Salmon'),
    ('Navajo Lake', 'Rainbow Trout'),
    ('Lake Granby', 'Lake Trout'),
    ('Lake Granby', 'Kokanee Salmon'),
    ('Eleven Mile Reservoir', 'Rainbow Trout'),
    ('Eleven Mile Reservoir', 'Brown Trout'),
    ('South Platte River (Eleven Mile Canyon)', 'Rainbow Trout'),
    ('South Platte River (Eleven Mile Canyon)', 'Brown Trout'),
    ('Eagle Nest Lake', 'Rainbow Trout'),
    ('Eagle Nest Lake', 'Kokanee Salmon'),
    ('Lake Chelan', 'Lake Trout'),
    ('Lake Chelan', 'Kokanee Salmon'),
    ('Lake Billy Chinook', 'Kokanee Salmon'),
    ('Lake Billy Chinook', 'Rainbow Trout'),
    ('Pyramid Lake', 'Cutthroat Trout'),
    ('Lake Tahoe (NV side)', 'Lake Trout'),
    ('Lake Tahoe (NV side)', 'Rainbow Trout'),
    ('Trinity Lake', 'Rainbow Trout'),
    ('Trinity Lake', 'Kokanee Salmon'),
    ('Deep Creek Lake', 'Lake Trout'),
    ('Deep Creek Lake', 'Rainbow Trout'),
    -- Salmon spots
    ('Lake Michigan (Offshore)', 'Chinook Salmon'),
    ('Lake Michigan (Offshore)', 'Coho Salmon'),
    ('Lake Michigan (Offshore)', 'Lake Trout'),
    ('Pere Marquette River', 'Chinook Salmon'),
    ('Pere Marquette River', 'Coho Salmon'),
    ('Muskegon Lake', 'Chinook Salmon'),
    ('Muskegon Lake', 'Steelhead'),
    ('St. Clair River', 'Steelhead'),
    ('Green River (WA)', 'Chinook Salmon'),
    ('Green River (WA)', 'Steelhead'),
    ('Yakima River', 'Steelhead'),
    ('Yakima River', 'Rainbow Trout'),
    ('Penobscot River', 'Atlantic Salmon'),
    ('Moosehead Lake', 'Atlantic Salmon'),
    ('Sebago Lake', 'Atlantic Salmon'),
    ('Lake Winnipesaukee', 'Atlantic Salmon'),
    ('Adirondack Ponds (Saranac Lakes)', 'Atlantic Salmon'),
    ('Adirondack Ponds (Saranac Lakes)', 'Lake Trout'),
    ('Adirondack Ponds (Saranac Lakes)', 'Brook Trout'),
    -- Bluegill/panfish
    ('Reelfoot Lake', 'Bluegill'),
    ('Lake Okeechobee', 'Bluegill'),
    ('Ross Barnett Reservoir', 'Black Crappie'),
    ('Ross Barnett Reservoir', 'Channel Catfish'),
    -- Redfish/Seatrout (Florida/Gulf)
    ('Calcasieu Lake', 'Redfish'),
    ('Calcasieu Lake', 'Spotted Seatrout'),
    ('Everglades WMA', 'Redfish'),
    ('Everglades WMA', 'Snook'),
    ('Everglades WMA', 'Largemouth Bass'),
    ('St. Johns River', 'Redfish'),
    ('St. Johns River', 'Largemouth Bass'),
    ('Rodman Reservoir (Ocklawaha)', 'Largemouth Bass')
  ) AS t(s,f)
LOOP
    SELECT id INTO v_spot_id FROM public.spots WHERE name = pair[1] LIMIT 1;
    SELECT id INTO v_fish_id FROM public.fish_species WHERE name = pair[2] LIMIT 1;
    IF v_spot_id IS NOT NULL AND v_fish_id IS NOT NULL THEN
      INSERT INTO public.spot_fish (spot_id, fish_id) VALUES (v_spot_id, v_fish_id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
