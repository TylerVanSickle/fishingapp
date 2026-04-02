-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fish species
create table public.fish_species (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  description text,
  image_url text
);
alter table public.fish_species enable row level security;
create policy "Fish species are public" on public.fish_species for select using (true);

-- Seed common Utah fish
insert into public.fish_species (name, description) values
  ('Rainbow Trout', 'Most common trout in Utah. Found in cold rivers, streams, and mountain lakes.'),
  ('Brown Trout', 'Wary and challenging. Prefer cold, clear streams and rivers.'),
  ('Cutthroat Trout', 'Utah native. Found in high elevation lakes and streams.'),
  ('Brook Trout', 'Actually a char. Found in cold, high-elevation waters.'),
  ('Lake Trout', 'Deep-water fish. Found in large, cold reservoirs.'),
  ('Tiger Muskie', 'Hybrid predator stocked in Utah reservoirs.'),
  ('Walleye', 'Popular sport fish in Utah reservoirs.'),
  ('Largemouth Bass', 'Warm-water species in lower-elevation Utah lakes.'),
  ('Smallmouth Bass', 'Found in rocky, clear Utah reservoirs.'),
  ('Channel Catfish', 'Common in warm Utah rivers and reservoirs.'),
  ('Carp', 'Widespread in Utah. Challenging fly fishing target.'),
  ('Perch', 'Schooling panfish found in Utah reservoirs.');

-- Baits
create table public.baits (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  type text check (type in ('lure', 'fly', 'live', 'powerBait', 'other')) not null,
  description text
);
alter table public.baits enable row level security;
create policy "Baits are public" on public.baits for select using (true);

-- Seed common baits
insert into public.baits (name, type) values
  ('PowerBait (Garlic Chartreuse)', 'powerBait'),
  ('PowerBait (Rainbow)', 'powerBait'),
  ('Rooster Tail (Silver)', 'lure'),
  ('Rooster Tail (Gold)', 'lure'),
  ('Rapala (Silver/Blue)', 'lure'),
  ('Kastmaster (Gold)', 'lure'),
  ('Kastmaster (Silver)', 'lure'),
  ('Thomas Buoyant (Gold)', 'lure'),
  ('Mepps Spinner #2', 'lure'),
  ('Woolly Bugger (Black)', 'fly'),
  ('Hare''s Ear Nymph', 'fly'),
  ('Adams Dry Fly', 'fly'),
  ('San Juan Worm', 'fly'),
  ('Elk Hair Caddis', 'fly'),
  ('Night Crawlers', 'live'),
  ('Wax Worms', 'live'),
  ('Salmon Eggs', 'live'),
  ('Meal Worms', 'live'),
  ('Gulp! Worm', 'other'),
  ('Berkley Trout Bait (Peach)', 'powerBait');

-- Spots
create table public.spots (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  water_type text check (water_type in ('lake', 'river', 'stream', 'reservoir', 'pond')) not null,
  access_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  approved boolean default false
);
alter table public.spots enable row level security;
create policy "Approved spots are public" on public.spots for select using (approved = true);
create policy "Users can insert spots" on public.spots for insert with check (auth.uid() = created_by);

-- Spot <-> Fish junction
create table public.spot_fish (
  spot_id uuid references public.spots(id) on delete cascade,
  fish_id uuid references public.fish_species(id) on delete cascade,
  primary key (spot_id, fish_id)
);
alter table public.spot_fish enable row level security;
create policy "Spot fish are public" on public.spot_fish for select using (true);
create policy "Spot creators can add fish" on public.spot_fish for insert with check (
  exists (select 1 from public.spots where id = spot_id and created_by = auth.uid())
);

-- Catches
create table public.catches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  spot_id uuid references public.spots(id) on delete cascade not null,
  fish_id uuid references public.fish_species(id) not null,
  bait_id uuid references public.baits(id),
  weight_lbs numeric(6, 2),
  length_in numeric(5, 1),
  caught_at timestamptz not null,
  notes text,
  photo_url text,
  created_at timestamptz default now()
);
alter table public.catches enable row level security;
create policy "Catches are public" on public.catches for select using (true);
create policy "Users can insert own catches" on public.catches for insert with check (auth.uid() = user_id);
create policy "Users can update own catches" on public.catches for update using (auth.uid() = user_id);

-- Seed a couple example Utah spots (approved so they show immediately)
insert into public.spots (name, description, latitude, longitude, water_type, access_notes, created_by, approved)
values
  ('Strawberry Reservoir', 'One of Utah''s premier trout fisheries. Excellent for rainbow and cutthroat trout year-round.', 40.1714, -111.1539, 'reservoir', 'Multiple access points. Boat ramps at Strawberry Bay and Renegade. Shore fishing available.', null, true),
  ('Provo River (Lower)', 'Blue ribbon trout fishery. Catch-and-release section below Deer Creek.', 40.3677, -111.6465, 'river', 'Access along US-189. Park at designated pullouts.', null, true),
  ('Flaming Gorge Reservoir', 'World-class trophy trout and kokanee salmon fishery.', 40.9161, -109.4196, 'reservoir', 'Dutch John and Cedar Springs boat ramps. Shore access at multiple points.', null, true),
  ('Fish Lake', 'High-altitude lake famous for mackinaw (lake trout) and splake.', 38.5412, -111.7214, 'lake', 'Resort and public campground access. Boat rentals available.', null, true),
  ('Jordanelle Reservoir', 'Good walleye and smallmouth bass fishery near Park City.', 40.6030, -111.4346, 'reservoir', 'Hailstone and Rock Cliff recreation areas. Day use fee required.', null, true);
