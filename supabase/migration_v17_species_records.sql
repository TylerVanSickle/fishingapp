-- migration_v17: add world-record weight/length to fish_species for suspicious catch detection
-- Run in Supabase SQL Editor

-- Add columns
ALTER TABLE public.fish_species
  ADD COLUMN IF NOT EXISTS record_weight_lbs NUMERIC(7, 2),
  ADD COLUMN IF NOT EXISTS record_length_in NUMERIC(5, 1);

-- Populate with approximate IGFA / state world records (rounded up slightly for buffer)
-- These are used to auto-flag catches that exceed what's physically possible for the species

UPDATE public.fish_species SET record_weight_lbs = 22.5,  record_length_in = 29   WHERE name = 'Largemouth Bass';
UPDATE public.fish_species SET record_weight_lbs = 12,    record_length_in = 27   WHERE name = 'Smallmouth Bass';
UPDATE public.fish_species SET record_weight_lbs = 11,    record_length_in = 24   WHERE name = 'Spotted Bass';
UPDATE public.fish_species SET record_weight_lbs = 5,     record_length_in = 16   WHERE name = 'Bluegill';
UPDATE public.fish_species SET record_weight_lbs = 6,     record_length_in = 17   WHERE name = 'Redear Sunfish';
UPDATE public.fish_species SET record_weight_lbs = 3.5,   record_length_in = 14   WHERE name = 'Rock Bass';
UPDATE public.fish_species SET record_weight_lbs = 2.5,   record_length_in = 12   WHERE name = 'Green Sunfish';
UPDATE public.fish_species SET record_weight_lbs = 2,     record_length_in = 11   WHERE name = 'Pumpkinseed';
UPDATE public.fish_species SET record_weight_lbs = 2.5,   record_length_in = 12   WHERE name = 'Warmouth';
UPDATE public.fish_species SET record_weight_lbs = 6,     record_length_in = 19   WHERE name = 'Black Crappie';
UPDATE public.fish_species SET record_weight_lbs = 5.5,   record_length_in = 21   WHERE name = 'White Crappie';
UPDATE public.fish_species SET record_weight_lbs = 25,    record_length_in = 42   WHERE name = 'Walleye';
UPDATE public.fish_species SET record_weight_lbs = 9,     record_length_in = 30   WHERE name = 'Sauger';
UPDATE public.fish_species SET record_weight_lbs = 15,    record_length_in = 33   WHERE name = 'Saugeye';
UPDATE public.fish_species SET record_weight_lbs = 5,     record_length_in = 20   WHERE name = 'Perch';
UPDATE public.fish_species SET record_weight_lbs = 58,    record_length_in = 48   WHERE name = 'Channel Catfish';
UPDATE public.fish_species SET record_weight_lbs = 123,   record_length_in = 61   WHERE name = 'Flathead Catfish';
UPDATE public.fish_species SET record_weight_lbs = 143,   record_length_in = 65   WHERE name = 'Blue Catfish';
UPDATE public.fish_species SET record_weight_lbs = 46,    record_length_in = 52   WHERE name = 'Northern Pike';
UPDATE public.fish_species SET record_weight_lbs = 67,    record_length_in = 60   WHERE name = 'Muskellunge';
UPDATE public.fish_species SET record_weight_lbs = 52,    record_length_in = 51   WHERE name = 'Tiger Muskie';
UPDATE public.fish_species SET record_weight_lbs = 82,    record_length_in = 55   WHERE name = 'Striped Bass';
UPDATE public.fish_species SET record_weight_lbs = 7,     record_length_in = 21   WHERE name = 'White Bass';
UPDATE public.fish_species SET record_weight_lbs = 27,    record_length_in = 36   WHERE name = 'Hybrid Striped Bass';
UPDATE public.fish_species SET record_weight_lbs = 30,    record_length_in = 40   WHERE name = 'Wiper';
UPDATE public.fish_species SET record_weight_lbs = 48,    record_length_in = 43   WHERE name = 'Rainbow Trout';
UPDATE public.fish_species SET record_weight_lbs = 42,    record_length_in = 44   WHERE name = 'Brown Trout';
UPDATE public.fish_species SET record_weight_lbs = 41,    record_length_in = 40   WHERE name = 'Cutthroat Trout';
UPDATE public.fish_species SET record_weight_lbs = 15,    record_length_in = 29   WHERE name = 'Brook Trout';
UPDATE public.fish_species SET record_weight_lbs = 72,    record_length_in = 50   WHERE name = 'Lake Trout';
UPDATE public.fish_species SET record_weight_lbs = 42,    record_length_in = 44   WHERE name = 'Steelhead';
UPDATE public.fish_species SET record_weight_lbs = 21,    record_length_in = 33   WHERE name = 'Splake';
UPDATE public.fish_species SET record_weight_lbs = 32,    record_length_in = 38   WHERE name = 'Bull Trout';
UPDATE public.fish_species SET record_weight_lbs = 9,     record_length_in = 25   WHERE name = 'Kokanee Salmon';
UPDATE public.fish_species SET record_weight_lbs = 97,    record_length_in = 58   WHERE name = 'Chinook Salmon';
UPDATE public.fish_species SET record_weight_lbs = 33,    record_length_in = 39   WHERE name = 'Coho Salmon';
UPDATE public.fish_species SET record_weight_lbs = 16,    record_length_in = 34   WHERE name = 'Sockeye Salmon';
UPDATE public.fish_species SET record_weight_lbs = 79,    record_length_in = 52   WHERE name = 'Atlantic Salmon';
UPDATE public.fish_species SET record_weight_lbs = 75,    record_length_in = 60   WHERE name = 'Carp';
UPDATE public.fish_species SET record_weight_lbs = 286,   record_length_in = 120  WHERE name = 'Tarpon';
UPDATE public.fish_species SET record_weight_lbs = 54,    record_length_in = 45   WHERE name = 'Redfish';
UPDATE public.fish_species SET record_weight_lbs = 17.5,  record_length_in = 33   WHERE name = 'Spotted Seatrout';
UPDATE public.fish_species SET record_weight_lbs = 53,    record_length_in = 48   WHERE name = 'Snook';
UPDATE public.fish_species SET record_weight_lbs = 113,   record_length_in = 59   WHERE name = 'Black Drum';
UPDATE public.fish_species SET record_weight_lbs = 30,    record_length_in = 38   WHERE name = 'Flounder';
UPDATE public.fish_species SET record_weight_lbs = 22,    record_length_in = 32   WHERE name = 'Sheepshead';
UPDATE public.fish_species SET record_weight_lbs = 135,   record_length_in = 78   WHERE name = 'Cobia';
UPDATE public.fish_species SET record_weight_lbs = 327,   record_length_in = 120  WHERE name = 'Alligator Gar';
UPDATE public.fish_species SET record_weight_lbs = 50,    record_length_in = 72   WHERE name = 'Longnose Gar';
UPDATE public.fish_species SET record_weight_lbs = 18,    record_length_in = 44   WHERE name = 'Spotted Gar';
UPDATE public.fish_species SET record_weight_lbs = 21.5,  record_length_in = 34   WHERE name = 'Bowfin';
UPDATE public.fish_species SET record_weight_lbs = 55,    record_length_in = 37   WHERE name = 'Freshwater Drum';
UPDATE public.fish_species SET record_weight_lbs = 198,   record_length_in = 87   WHERE name = 'Paddlefish';
UPDATE public.fish_species SET record_weight_lbs = 6,     record_length_in = 16   WHERE name = 'White Perch';
UPDATE public.fish_species SET record_weight_lbs = 15,    record_length_in = 30   WHERE name = 'Striped Mullet';
