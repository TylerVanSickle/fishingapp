-- migration_v6: trip planner + spot verification

-- ─── Trips ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description  text,
  planned_date date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_spots (
  trip_id   uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  spot_id   uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  sort_order smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (trip_id, spot_id)
);

-- ─── Spot verification ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spot_verifications (
  spot_id    uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (spot_id, user_id)
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE trips             ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_spots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_verifications ENABLE ROW LEVEL SECURITY;

-- Trips: owner manages, public reads
CREATE POLICY "owner_manage_trips" ON trips
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read_trips" ON trips
  FOR SELECT USING (true);

-- Trip spots: owner of the trip manages
CREATE POLICY "owner_manage_trip_spots" ON trip_spots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
  );
CREATE POLICY "public_read_trip_spots" ON trip_spots
  FOR SELECT USING (true);

-- Spot verifications: users manage their own
CREATE POLICY "owner_manage_verifications" ON spot_verifications
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read_verifications" ON spot_verifications
  FOR SELECT USING (true);
