-- migration_v5: onboarding fields, follows, spot ratings, comments, notifications

-- ─── Profiles: onboarding fields ───────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS home_state text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- ─── User favorite species ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_favorite_species (
  user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  species_id uuid NOT NULL REFERENCES fish_species(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, species_id)
);

-- ─── Follows ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ─── Spot ratings ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spot_ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id    uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (spot_id, user_id)
);

-- ─── Spot comments ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spot_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id    uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL, -- 'new_follower' | 'catch_comment' | 'spot_comment'
  actor_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  entity_id  uuid,          -- catch_id, spot_id, etc.
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE user_favorite_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows                ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;

-- user_favorite_species: owner can manage, anyone can read
CREATE POLICY "owner_manage_favorites" ON user_favorite_species
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read_favorites" ON user_favorite_species
  FOR SELECT USING (true);

-- follows: followers manage their own rows, public can read
CREATE POLICY "owner_manage_follows" ON follows
  FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "public_read_follows" ON follows
  FOR SELECT USING (true);

-- spot_ratings: users manage their own rating, public read
CREATE POLICY "owner_manage_rating" ON spot_ratings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read_ratings" ON spot_ratings
  FOR SELECT USING (true);

-- spot_comments: users manage their own, public read
CREATE POLICY "owner_manage_comment" ON spot_comments
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public_read_comments" ON spot_comments
  FOR SELECT USING (true);

-- notifications: private to owner
CREATE POLICY "owner_read_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_update_notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
