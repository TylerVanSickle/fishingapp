-- migration_v12: additional fish species
-- Run in Supabase SQL Editor

INSERT INTO public.fish_species
  (name, description, identification_tips, color_description, habitat, diet,
   best_seasons, legal_size_in, fun_fact, similar_species)
VALUES

('Spotted Bass',
 'The third member of the black bass family, sitting between Largemouth and Smallmouth in size and temperament. Hugely popular in the Southeast, Ozarks, and California reservoirs where they often outcompete Largemouth in clear, rocky waters.',
 'Most reliable ID: a rough patch of teeth on the tongue (Largemouth has none). Lateral line scale row is distinctly spotted (rows of black dots below the lateral line). Jaw does not extend past the eye (unlike Largemouth). Upper jaw reaches only to the rear edge of the eye.',
 'Olive-green to brownish-green back fading to lighter sides. A broken horizontal dark stripe runs along the midline. Rows of dark spots below the lateral line give the fish its name. White belly, similar to Largemouth but with more defined patterning.',
 'Clear, rocky reservoirs and rivers. Prefer cooler, deeper water than Largemouth. Thrive in highland impoundments (Ozarks, Appalachians, Sierra foothills). Often found deeper than Largemouth in the same body of water, relating to rocky points and bluffs.',
 'Crayfish, shad, small fish, and insects. More likely than Largemouth to suspend and chase baitfish in open water. Respond well to finesse techniques — drop shots, shaky heads, small swimbaits, and crankbaits worked along rocky structure.',
 ARRAY['spring', 'fall'],
 12,
 'Spotted Bass hold the record for the smallest black bass to exceed 10 pounds. California''s clear reservoirs (like Shasta and Oroville) routinely produce world-class Spots due to the abundant threadfin shad forage.',
 'Largemouth Bass (jaw extends past eye, no tooth patch on tongue, no spots below lateral line). Smallmouth Bass (bronze color, vertical bars, no tooth patch).'
),

('Redear Sunfish',
 'Known as the Shellcracker across the South for its specialized diet of snails, clams, and mussels, which it crushes with powerful molariform teeth in its throat. One of the largest and most sought-after panfish in America.',
 'Look for the distinctive red or orange edge on the ear flap (opercle tab) — the defining field mark. Body is deeper and more laterally compressed than Bluegill. Mouth is smaller and more pointed. Ear flap is shorter and more rounded than Bluegill''s.',
 'Olive-green to yellowish-green sides with faint spots or speckling. The ear flap has a bold red or orange-red border that is the easiest identification feature. Belly is yellow to white. Less distinct vertical bars than Bluegill.',
 'Clear, warm lakes, reservoirs, ponds, and slow rivers across the Southeast and Midwest. Strongly associated with shell beds, sandy bottoms, and rooted aquatic vegetation where mollusks are abundant. Spawn in colonies in 2–6 feet of water.',
 'Snails, clams, mussels, and other mollusks are the primary diet — hence "Shellcracker." Also eats worms, insects, and small crustaceans. Best fished on the bottom with live earthworms, red wigglers, or crickets on light tackle.',
 ARRAY['spring', 'summer'],
 8,
 'Redear Sunfish can grow to over 5 pounds — the world record is 5 lbs 12 oz from a Georgia reservoir. During the spring spawn they congregate in massive colonies that can number in the thousands.',
 'Bluegill (longer ear flap without red edge, more distinct vertical bars, smaller body). Pumpkinseed (red spot on ear flap but orange-spotted body, smaller). Warmouth (larger mouth, mottled pattern).'
),

('Rock Bass',
 'A rugged, adaptable sunfish with an almost comically large mouth for its size. Found across the eastern half of the US in clear rocky streams, rivers, and lakes. A willing biter that gives solid sport on light tackle.',
 'The most distinctive feature is the bright red eye — unmistakable at close range. Large bass-like mouth extends to below the eye. Six anal spines (most sunfish have 3). Body is mottled olive-brown with rows of dark spots.',
 'Olive-green to bronze-brown base color with a mottled pattern of darker blotches. Rows of dark spots along the sides. Bright red to orange-red iris is the signature field mark. Belly is pale yellow to white. Can rapidly change color intensity.',
 'Rocky streams, rivers, and clear lakes across the eastern and central US from the Great Lakes south to the Ozarks and Appalachians. Strongly associated with rocky substrate, cobble, and boulders. Often found in the same habitat as Smallmouth Bass.',
 'Crayfish, insects, small fish, and worms. An opportunistic and aggressive feeder for its size. Responds well to small jigs, spinners, live worms, and small crankbaits fished around rocky structure.',
 ARRAY['spring', 'summer', 'fall'],
 6,
 'Rock Bass can live up to 10–13 years — exceptionally long for a panfish. Their large mouths and aggressive temperament make them willing to strike lures nearly year-round, even in cold water when other panfish are inactive.',
 'Warmouth (similar large mouth but found in murkier, more vegetated water; lacks bold red eye). Smallmouth Bass (much larger, streamlined body, no mottled coloration).'
),

('Tarpon',
 'The Silver King — one of the most iconic saltwater gamefish in the world. Tarpon can exceed 200 pounds and are famous for spectacular leaping fights that can last hours. A bucket-list species for anglers worldwide.',
 'Unmistakable: massive silver scales the size of a hand, a deeply forked tail, and a large upturned mouth with a protruding lower jaw. A single elongated ray extends from the last dorsal fin ray. Can breathe air directly from the surface.',
 'Bright, mirror-like silver sides with a darker blue-green or gunmetal back. The enormous scales (some over 2 inches across) reflect light brilliantly, earning the species its "Silver King" nickname. Belly is white.',
 'Coastal waters from Virginia to Texas, with the best fishing in Florida, particularly Tampa Bay, Charlotte Harbor, Boca Grande Pass, and the Florida Keys. Also found throughout the Caribbean and Gulf of Mexico. Can tolerate brackish and even fresh water.',
 'Mullet, pinfish, crabs, and other forage fish and crustaceans. Tarpon are primarily ambush predators that feed aggressively at dawn and dusk. Best targeted with live crabs, live mullet, large swimbaits, and fly fishing with big streamers.',
 ARRAY['spring', 'summer'],
 NULL,
 'Tarpon have a specialized swim bladder that allows them to breathe atmospheric oxygen directly from the surface — an ancient adaptation that lets them survive in oxygen-poor waters. They can live over 50 years and females don''t reach sexual maturity until age 10.',
 'Ladyfish (much smaller, similar shape, leaps when hooked). Giant Trevally (similar size but Pacific species, different fin placement).'
),

('Black Drum',
 'A powerful inshore and nearshore species found along the Gulf and Atlantic coasts. Black Drum are especially popular in Texas, Louisiana, and Florida for their size and table quality. Large adults are called "bull drum" and can exceed 90 pounds.',
 'Stocky, deep-bodied fish with a high arched back. 4–6 pairs of chin barbels (whiskers) on the lower jaw for bottom feeding — distinguishes it from Red Drum. Young fish have 4–5 bold black vertical bars that fade with age. Large adults are uniformly dark gray.',
 'Juveniles are silvery to gray with 4–5 bold black vertical bars. As fish mature the bars fade; adults over 15 lbs are typically solid dark gray to charcoal with a pale belly. Fins are dark.',
 'Inshore bays, estuaries, grass flats, jetties, and nearshore structure along the Gulf Coast from Texas to Florida and up the Atlantic to New York. Large adults ("bull drum") often school near jetties and offshore reefs.',
 'Primarily shellfish — oysters, clams, mussels, and crabs, which they crush with powerful molariform throat teeth. Also eats shrimp and small fish. Best targeted with fresh shrimp, blue crabs, or cut mullet on the bottom near oyster reefs and structure.',
 ARRAY['spring', 'fall'],
 14,
 'Black Drum produce audible drumming sounds using specialized muscles that vibrate against their swim bladder — this is how the drum family got its name. Large spawning aggregations can be heard underwater by divers.',
 'Red Drum / Redfish (no chin barbels, black spot near tail, copper-bronze color). Sheepshead (black and white bars, human-like teeth, no barbels).'
),

('Flounder',
 'The master of camouflage — Flounder are flat, bottom-dwelling ambush predators found along both the Atlantic and Gulf coasts. Southern Flounder and Summer Flounder are the two main sport species. Excellent table fish and a favorite of inshore anglers.',
 'Impossible to misidentify: completely flattened body lying on its side, with both eyes migrated to the top (left) side of the body. The eyed side is mottled brown for camouflage; the blind side is white. Large mouth with sharp teeth. Lie buried in sand or mud.',
 'Eyed side is mottled olive-brown to dark brown with irregular lighter and darker blotches — nearly invisible against sandy or muddy bottoms. The blind (bottom) side is white. Color can change to match substrate.',
 'Shallow coastal bays, estuaries, tidal creeks, grass flats, and nearshore structure. Found buried in sand and mud near structure — channel edges, inlet jetties, bridge pilings, and drop-offs. Migrate offshore in winter.',
 'Ambush predator of small fish (mullet, menhaden, mud minnows), shrimp, and crabs. Lie motionless on the bottom and strike upward at passing prey. Best caught by drifting live mud minnows, finger mullet, or soft plastic jigs along the bottom near structure.',
 ARRAY['summer', 'fall'],
 12,
 'Flounder begin life as normally-shaped fish with one eye on each side. As juveniles they settle to the bottom and one eye migrates to the other side of the head — one of the most dramatic metamorphoses in any vertebrate.',
 'Stargazer (similar flat body but eyes on top of head, not migrated). Halibut (Pacific species, much larger, right-eyed rather than left-eyed).'
),

('Bowfin',
 'A living fossil — Bowfin are the sole surviving member of an ancient fish family that dates back 150 million years. Also called mudfish, dogfish, or grinnel, they are one of the most tenacious fighters in freshwater fishing and are experiencing a surge in popularity.',
 'Long, cylindrical body with a single very long dorsal fin that runs most of the length of the back. Round tail (not forked). Olive to dark brown mottled body. Males have a distinctive orange-ringed black spot at the base of the tail.',
 'Olive to dark green or brown with a mottled, reticulated pattern across the body and fins. Belly is white to pale green. Males have a bold black ocellus (eye-spot) with an orange or yellow ring at the tail base — absent or faint in females.',
 'Swamps, backwater lakes, sluggish rivers, and heavily vegetated shallows across the eastern half of the US from the Great Lakes south through the Mississippi drainage and along the Atlantic coast. Extremely tolerant of warm, oxygen-poor water.',
 'Highly aggressive apex predator that eats virtually anything — fish, frogs, crayfish, mice, ducklings, and snakes. Best targeted with large swimbaits, spinnerbaits, frogs, live bream, and large jigs near heavy vegetation and structure.',
 ARRAY['spring', 'summer'],
 NULL,
 'Bowfin can breathe air directly using a primitive lung-like swim bladder — they can survive in oxygen-depleted water and can even move short distances overland. They are the only surviving member of order Amiiformes, unchanged for 150 million years.',
 'Northern Snakehead (invasive species, similar body shape but pelvic fins are absent or tiny, no tail spot, different dorsal fin). Burbot (freshwater cod, found in colder northern waters).'
),

('Saugeye',
 'A hybrid cross between Walleye (female) and Sauger (male), widely stocked across the Midwest and Plains states. Saugeye combine the size potential of Walleye with the hardiness of Sauger and thrive in turbid rivers and reservoirs where pure Walleye struggle.',
 'Intermediate between the parents: body shape is more Walleye-like but with a distinctly mottled pattern resembling Sauger. Look for black blotches at the base of the spiny dorsal fin (like Sauger), a white tip on the lower tail lobe (like Walleye), and a less prominent white belly.',
 'Olive to gold-brown sides with a brassy sheen and dark mottled markings — more patterned than Walleye, less uniformly spotted than Sauger. White tip on lower tail lobe. The spiny dorsal fin has 2–3 rows of dark spots and black blotches at the base.',
 'Widely stocked in turbid rivers, flood-control reservoirs, and prairie impoundments across Ohio, Kansas, Oklahoma, Nebraska, and Colorado. More tolerant of warm, turbid water than pure Walleye. Stocked specifically in waters that are too warm or too turbid for Walleye to reproduce.',
 'Perch, shad, shiners, and other small fish. Fish the same methods as Walleye — jigs tipped with minnows, blade baits, crankbaits trolled along bottom structure, and live rigs on breaks and points.',
 ARRAY['spring', 'fall'],
 15,
 'Saugeye are sterile hybrids that grow faster than either parent species. Ohio pioneered large-scale Saugeye stocking in the 1980s and they are now the primary stocked gamefish in many Ohio and Oklahoma reservoirs.',
 'Walleye (less mottled, no dorsal blotches, larger more uniform gold color). Sauger (smaller, more distinctly spotted dorsal, no white tail tip, found in rivers).'
),

('Sheepshead',
 'Named for their uncanny human-like teeth used to crush barnacles and shellfish, Sheepshead are one of the most popular inshore targets along the Gulf and Atlantic coasts. Notoriously difficult to hook — giving rise to the saying "fish them just before they bite."',
 'Bold black and white vertical stripes on a deep, compressed body — resembles a freshwater Convict Cichlid. Human-like incisors and molars visible in the mouth are unmistakable. Strongly built with sharp dorsal spines.',
 'Silver-gray to white sides with 5–6 bold, distinct black vertical bars. The bars are wider and more defined than on juvenile Black Drum. Fins are grayish. The prominent teeth are the most memorable feature.',
 'Structure-oriented inshore species along the Gulf Coast from Texas to Florida and up the Atlantic to New York. Found on pilings, jetties, oyster reefs, docks, mangroves, and any hard bottom structure encrusted with barnacles and oysters.',
 'Barnacles, oysters, fiddler crabs, and other crustaceans crushed by powerful teeth. Best targeted with live or fresh fiddler crabs, sand fleas, fresh shrimp, and oyster pieces fished right against structure.',
 ARRAY['winter', 'spring'],
 14,
 'Sheepshead have some of the most human-like teeth of any fish — prominent incisors at the front and flat molars further back, perfectly designed for scraping barnacles off pilings and crushing oysters. They are notoriously light biters.',
 'Black Drum (no bold stripes on adults, chin barbels present, less compressed body). Spadefish (similar stripes but very different fins and no teeth).'
),

('Cobia',
 'A powerful, fast-growing pelagic species found in warm coastal waters worldwide. Cobia are highly sought-after for their explosive topwater strikes, bulldog fights, and outstanding table quality. They follow rays, sharks, and turtles, making them unique to target.',
 'Long, torpedo-shaped body with a depressed, broad head and a projecting lower jaw. First dorsal fin consists of 7–9 short, stout free spines. Brown to dark chocolate on back. A distinct lateral stripe runs from eye to tail.',
 'Dark chocolate-brown to olive-brown on back. A prominent broad white or pale stripe runs along the lateral line from snout to tail, bordered above by a darker stripe. Belly is white to cream. Juveniles have bold black and white stripes.',
 'Coastal waters, bays, and nearshore structure along the Gulf Coast and Atlantic Coast from Florida to Massachusetts. Highly migratory — follow warm water northward in spring. Often found near buoys, offshore platforms, and following large rays in shallow water.',
 'Crab, shrimp, squid, and small fish. Often seen following cownose rays and sharks in shallow water, picking up crabs and other creatures stirred up by the ray''s feeding. Best targeted with live eels, large jigs, and swimbaits pitched to visible fish near surface.',
 ARRAY['spring', 'summer'],
 33,
 'Cobia are one of the fastest-growing fish in the ocean — they can reach 50 pounds in just 3–4 years. They are remarkable for the behavior of following large rays and sharks, which anglers exploit by sight-fishing from elevated towers.',
 'Remora / Shark Sucker (similar body shape but has a suction disc on the head, much smaller). Lemon Shark (rounded snout, no stripe, gill slits).'
),

('Green Sunfish',
 'One of the most widespread and hardy sunfish in North America, found in nearly every drainage from coast to coast. Green Sunfish thrive in degraded water quality conditions that would kill most other species, making them often the dominant fish in marginal habitats.',
 'Large mouth for a sunfish — nearly as large as a Rock Bass. Long, relatively slender body compared to Bluegill or Pumpkinseed. Ear flap is short and black with a pale white or yellow border. Turquoise or blue-green wavy lines on the cheeks.',
 'Olive-green to dark green back and sides with a brassy or yellowish sheen. Blue-green iridescent wavy streaks on the cheeks and gill covers. Yellow to orange lower fins. Black ear flap with a pale (white/yellow) border. Belly is yellow to white.',
 'Extremely adaptable — found in streams, ponds, lakes, rivers, and ditches from coast to coast. Tolerates turbid water, low oxygen, high temperatures, and degraded habitat better than virtually any other sunfish. Often the first to colonize new or disturbed waters.',
 'Insects, small fish, crayfish, and worms. Highly aggressive and will strike nearly anything small enough to eat. Responds well to small spinners, poppers, worms, and small jigs.',
 ARRAY['spring', 'summer'],
 NULL,
 'Green Sunfish readily hybridize with virtually every other sunfish species — Bluegill, Pumpkinseed, Warmouth, and Longear Sunfish. Many "mystery" sunfish caught in the wild are Green Sunfish hybrids.',
 'Warmouth (very similar large mouth but more mottled, found in murkier water). Rock Bass (red eye, more distinctly spotted). Bluegill (smaller mouth, more rounded body, longer ear flap).'
),

('Pumpkinseed',
 'One of the most colorful freshwater fish in North America, the Pumpkinseed is a beloved panfish of northeastern lakes and ponds. Its vivid orange, blue, and green coloring rivals tropical fish. Readily caught on worms and small spinners.',
 'The ear flap (opercle) has a black base with a bold red or orange-red spot at the tip — the signature feature. Blue-green wavy stripes on the cheek. Body has irregular orange-red spots scattered across olive-green sides. More rounded than Bluegill.',
 'Brilliant olive-green back with iridescent blue-green sides. Orange and red spots scattered across the body. Blue wavy streaks on the cheeks. The ear flap is black with a bold red or orange spot at the tip. Bright orange belly on breeding males.',
 'Clear, vegetated lakes, ponds, and slow streams in the Northeast and Great Lakes region. Prefer cooler, clearer water than Bluegill. Strongly associated with submerged aquatic vegetation. Most abundant in the northern half of the US and southern Canada.',
 'Snails, insects, small crustaceans, and worms. Like Redear Sunfish, they can crush snails with molariform teeth. Best caught on small worms, crickets, and tiny spinners near weed edges.',
 ARRAY['spring', 'summer'],
 NULL,
 'Pumpkinseeds are one of the few freshwater fish known to clean and groom other fish, sometimes picking parasites off larger fish species in a behavior similar to cleaner wrasse on coral reefs.',
 'Bluegill (no red spot on ear flap, longer ear flap, less colorful). Redear Sunfish (larger, plain ear flap with red border, no orange spots on body).'
),

('Warmouth',
 'A bass-like sunfish of the South''s swamps, cypress sloughs, and murky backwaters. Often overlooked, Warmouth are surprisingly aggressive strikers and can grow to over a pound. Their tolerance for poor water quality makes them common throughout the Southeast.',
 'Large mouth — larger than Bluegill, nearly as large as Rock Bass. Three or four reddish-brown streaks radiate from the red eye across the cheek. Mottled olive-brown body without the distinct bars or spots of other sunfish. Short, stout body.',
 'Mottled olive to dark brown with irregular darker markings — good camouflage in murky, weedy water. 3–4 bold reddish-brown or purple streaks radiating from the red eye like war paint (hence the name). Belly is yellow to white. Fins are dark and mottled.',
 'Swamps, backwaters, oxbow lakes, cypress swamps, and sluggish rivers with murky water and abundant vegetation. Tolerates low oxygen and warm temperatures. Found from the Great Lakes south through the Mississippi Valley and across the Gulf Coast states.',
 'Crayfish, small fish, insects, and worms. Aggressive ambush predator. Best caught on small jigs, live worms, and small spinners near heavy cover.',
 ARRAY['spring', 'summer'],
 NULL,
 'Warmouth are sometimes called "goggle-eye" or "red-eye" in the South due to their distinctive red iris. They are often found in the same habitat as Largemouth Bass and are frequently caught by bass anglers fishing heavy cover.',
 'Rock Bass (similar large mouth but found in clearer, rockier water; more distinct spotted pattern; brighter red eye). Green Sunfish (very similar but slimmer, found in more varied habitats, different cheek markings).'
),

('Bull Trout',
 'A cold-water char native to the Pacific Northwest and Rocky Mountains, Bull Trout are an indicator species for pristine, ice-cold streams and rivers. They require some of the coldest, cleanest water of any North American salmonid and are a conservation priority species.',
 'No black spots (key ID — Brook Trout have black spots, Bull Trout do not). Pale yellow, orange, and red spots on an olive-green to dark brown body. Large head with a long, pointed snout (more pike-like than Brook Trout). No spots on dorsal fin.',
 'Olive-green to dark brown back and sides with pale yellow, orange, and red spots. The absence of black spots distinguishes it from Brook Trout. Belly can be white to yellowish-orange. Fins have white leading edges similar to Brook Trout.',
 'Ultra-cold, clear mountain streams, rivers, and deep lakes in Idaho, Montana, Washington, Oregon, and western Canada. Require water temperatures below 55°F. Strongly associated with old-growth forest watersheds with clean gravel. Often found with Westslope Cutthroat Trout.',
 'Fish, specifically whitefish, sculpin, and other trout and char. Highly piscivorous — large Bull Trout are almost entirely fish-eating. Best targeted with large streamers, spoons, and live or cut sucker meat near deep holes and confluences.',
 ARRAY['summer', 'fall'],
 NULL,
 'Bull Trout require some of the strictest habitat conditions of any North American fish — water must be below 55°F, have near-zero sedimentation, and have connected stream networks for spawning migrations of up to 100 miles. They are listed as threatened under the Endangered Species Act.',
 'Brook Trout (has black spots and vermiculations/worm-like markings on the back; stubbier snout). Dolly Varden (very similar — distinguished by scale counts and geography).'
),

('Longnose Gar',
 'An ancient fish unchanged for 100 million years, the Longnose Gar is found across much of the eastern US and is growing in popularity among dedicated anglers. Known for their armor-like ganoid scales, rope fishing, and acrobatic fights.',
 'Extremely long, slender beak (snout length is 15–20x the minimum beak width — much longer relative to width than other gars). Elongated, cylindrical body covered in hard, diamond-shaped ganoid scales. Single dorsal fin set far back near the tail.',
 'Olive-green to dark brown on the back and upper sides with a cream to white belly. Dark spots on the fins and along the sides, especially near the tail. The long, narrow beak is the unmistakable field mark.',
 'Widespread across the eastern half of the US from the Great Lakes south through the Mississippi Valley and along the Atlantic Coastal Plain. Found in rivers, lakes, reservoirs, and backwaters. Tolerates warm, oxygen-poor water by gulping air.',
 'Fish, predominantly. Ambush predator that lurks near the surface or in vegetation then strikes sideways with the long beak to impale prey. Caught on rope lures (frayed nylon), cut bait, live fish, and large swimbaits.',
 ARRAY['spring', 'summer'],
 NULL,
 'Gar eggs are highly toxic to birds and mammals — a defense mechanism that has made them largely predator-free for millions of years. Their eggs contain ichthyotoxin, a protein that causes illness if eaten. The flesh, however, is edible.',
 'Spotted Gar (shorter snout, spots on head and body including the snout). Shortnose Gar (much shorter beak, stockier body). Alligator Gar (much larger, two rows of teeth in upper jaw).'
),

('Spotted Gar',
 'The most widely distributed gar in North America and a common catch in southeastern waters. Smaller and more common than Alligator Gar, Spotted Gar are found in vegetated lakes, bayous, and slow rivers throughout the South and Midwest.',
 'Spots on both the body AND the top of the head and snout — this distinguishes it from Longnose Gar (no spots on snout). Snout is shorter and broader than Longnose Gar. Cylindrical, armored body with diamond-shaped ganoid scales.',
 'Olive-green to brownish body with dark brown or black round spots covering the body, fins, and distinctively the top of the head and snout. Pale belly. The spotted head/snout is the key field mark separating it from other gars.',
 'Vegetated lakes, bayous, oxbows, and slow-moving rivers in the Southeast and Midwest from Texas to Florida and north through the Ohio and Mississippi valleys. Strongly associated with shallow, weedy water. More common in still water than Longnose Gar.',
 'Small fish, frogs, and crayfish. Ambush predator. Caught on rope lures (frayed nylon rope), live small fish, and cut bait.',
 ARRAY['spring', 'summer'],
 NULL,
 'Like all gars, Spotted Gar can breathe air from the surface using a primitive lung-like swim bladder — an ancient adaptation that allows them to survive in oxygen-depleted backwaters that would suffocate most other fish.',
 'Longnose Gar (no spots on snout/head, much longer and narrower beak). Florida Gar (very similar, distinguished by scale counts and geography — found only in Florida and Georgia).'
),

('Striped Mullet',
 'One of the most important forage and target species in coastal waters, Striped Mullet are targeted by anglers on light tackle and fly tackle throughout the Gulf and Atlantic coasts. They are also critical bait for many inshore species.',
 'Elongated, torpedo-shaped body with a small, firm mouth and no teeth. Two separate dorsal fins. Adipose eyelid (transparent fatty tissue) covering most of the eye — visible in adults. Bold horizontal dark stripes along the upper sides.',
 'Blue-gray to olive back with silver sides. 6–7 dark horizontal stripes formed by dark scale edges running along the upper body. White belly. Tail is moderately forked.',
 'Coastal bays, estuaries, beaches, and river mouths from North Carolina to Texas and throughout Florida. Highly abundant near shorelines, grass flats, and tidal creeks. Migrate offshore in massive schools in fall for spawning.',
 'Detritus, algae, and organic matter filtered from mud and sediment. Mullet are primarily herbivores/detritivores — nearly impossible to catch on traditional lures. Best targeted with cast nets, small dough baits, or tiny fly patterns. Most commonly encountered as live bait.',
 ARRAY['fall', 'summer'],
 NULL,
 'Striped Mullet are famous for their spectacular jumping behavior — they leap repeatedly out of the water for reasons scientists still debate (possible parasite removal, oxygenation, or simply play). During fall migrations, massive schools of jumping mullet are a hallmark of inshore fishing season.',
 'White Mullet (smaller, less distinct stripes, found in similar habitat). Ladyfish (similar size but elongated jaw, much more aggressive, leaps when hooked).'
)

ON CONFLICT (name) DO NOTHING;
