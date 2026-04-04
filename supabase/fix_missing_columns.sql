-- ─── Run this in Supabase SQL Editor to fix blank pages ─────────────────────
-- Safe to run multiple times — all statements use IF NOT EXISTS.

-- 0. Spots missing columns (fixes spot submission)
ALTER TABLE spots ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS state text;

-- 1. is_private on catches (fixes blank feed / leaderboard / explore)
ALTER TABLE catches ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- 2. Pro subscription fields on profiles (fixes Pro features + navbar)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_since timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_techniques text[] NOT NULL DEFAULT '{}';

-- 3. Catch comments
CREATE TABLE IF NOT EXISTS catch_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catch_id   uuid NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);
ALTER TABLE catch_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_comments' AND policyname = 'Anyone can read non-deleted comments') THEN
    CREATE POLICY "Anyone can read non-deleted comments" ON catch_comments FOR SELECT USING (is_deleted = false);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_comments' AND policyname = 'Authenticated users can insert comments') THEN
    CREATE POLICY "Authenticated users can insert comments" ON catch_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_comments' AND policyname = 'Users can delete own comments') THEN
    CREATE POLICY "Users can delete own comments" ON catch_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_comments' AND policyname = 'Users can soft-delete own comments') THEN
    CREATE POLICY "Users can soft-delete own comments" ON catch_comments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Catch reactions
CREATE TABLE IF NOT EXISTS catch_reactions (
  catch_id   uuid NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (catch_id, user_id)
);
ALTER TABLE catch_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_reactions' AND policyname = 'Anyone can read reactions') THEN
    CREATE POLICY "Anyone can read reactions" ON catch_reactions FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_reactions' AND policyname = 'Authenticated users can react') THEN
    CREATE POLICY "Authenticated users can react" ON catch_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_reactions' AND policyname = 'Users can update own reaction') THEN
    CREATE POLICY "Users can update own reaction" ON catch_reactions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catch_reactions' AND policyname = 'Users can remove own reaction') THEN
    CREATE POLICY "Users can remove own reaction" ON catch_reactions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Comment reports
CREATE TABLE IF NOT EXISTS comment_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  uuid NOT NULL REFERENCES catch_comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  reviewed    boolean NOT NULL DEFAULT false,
  UNIQUE (comment_id, reporter_id)
);
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_reports' AND policyname = 'Authenticated users can report comments') THEN
    CREATE POLICY "Authenticated users can report comments" ON comment_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_reports' AND policyname = 'Admins can read all reports') THEN
    CREATE POLICY "Admins can read all reports" ON comment_reports FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comment_reports' AND policyname = 'Admins can update reports') THEN
    CREATE POLICY "Admins can update reports" ON comment_reports FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- 6. Catches RLS policies (SELECT + DELETE)
-- Ensure the catches SELECT policy exists and allows all reads (privacy filtered in app code)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catches' AND policyname = 'Catches are public') THEN
    CREATE POLICY "Catches are public" ON catches FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catches' AND policyname = 'Users can insert own catches') THEN
    CREATE POLICY "Users can insert own catches" ON catches FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catches' AND policyname = 'Users can delete own catches') THEN
    CREATE POLICY "Users can delete own catches" ON catches FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Storage policies for photo uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('catch-photos', 'catch-photos', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('spot-photos',  'spot-photos',  true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars',      'avatars',      true) ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload catch photos') THEN
    CREATE POLICY "Authenticated users can upload catch photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'catch-photos' AND auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Anyone can view catch photos') THEN
    CREATE POLICY "Anyone can view catch photos" ON storage.objects FOR SELECT USING (bucket_id = 'catch-photos');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload spot photos') THEN
    CREATE POLICY "Authenticated users can upload spot photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'spot-photos' AND auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Anyone can view spot photos') THEN
    CREATE POLICY "Anyone can view spot photos" ON storage.objects FOR SELECT USING (bucket_id = 'spot-photos');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated users can upload avatars') THEN
    CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Anyone can view avatars') THEN
    CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- 8. Fishing journal (Pro feature)
CREATE TABLE IF NOT EXISTS journal_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outing_date date NOT NULL,
  title       text,
  body        text NOT NULL,
  weather     text,
  wind        text,
  temp_f      numeric(4,1),
  water_clarity text,
  water_temp_f  numeric(4,1),
  mood        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Users can manage own journal') THEN
    CREATE POLICY "Users can manage own journal" ON journal_entries USING (auth.uid() = user_id);
  END IF;
END $$;

-- 9. Gear / tackle setups (Pro feature)
CREATE TABLE IF NOT EXISTS gear_setups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  rod         text,
  reel        text,
  line        text,
  leader      text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE gear_setups ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gear_setups' AND policyname = 'Users can manage own gear') THEN
    CREATE POLICY "Users can manage own gear" ON gear_setups USING (auth.uid() = user_id);
  END IF;
END $$;

-- Link catches to gear setups
ALTER TABLE catches ADD COLUMN IF NOT EXISTS gear_setup_id uuid REFERENCES gear_setups(id) ON DELETE SET NULL;

-- 10. Spots RLS: allow submission + allow admins to see unapproved spots
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spots' AND policyname = 'Authenticated users can submit spots') THEN
    CREATE POLICY "Authenticated users can submit spots" ON spots FOR INSERT WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spots' AND policyname = 'Admins can see all spots') THEN
    CREATE POLICY "Admins can see all spots" ON spots FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spots' AND policyname = 'Admins can update spots') THEN
    CREATE POLICY "Admins can update spots" ON spots FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spots' AND policyname = 'Admins can delete spots') THEN
    CREATE POLICY "Admins can delete spots" ON spots FOR DELETE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- 11. Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can read own notifications') THEN
    CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can insert notifications') THEN
    CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 12. Content reports (catches, spots, profiles)
CREATE TABLE IF NOT EXISTS content_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('catch', 'spot', 'profile')),
  content_id   uuid NOT NULL,
  reason       text,
  reviewed     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, content_type, content_id)
);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_reports' AND policyname = 'Authenticated users can submit content reports') THEN
    CREATE POLICY "Authenticated users can submit content reports" ON content_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_reports' AND policyname = 'Admins can read content reports') THEN
    CREATE POLICY "Admins can read content reports" ON content_reports FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_reports' AND policyname = 'Admins can update content reports') THEN
    CREATE POLICY "Admins can update content reports" ON content_reports FOR UPDATE USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- 13. Enhanced trip planner columns
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS bait_plan text;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS gear_notes text;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '[]';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS target_species uuid[];

-- RLS: allow anyone to read public trips
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Public trips are readable by anyone') THEN
    CREATE POLICY "Public trips are readable by anyone" ON trips FOR SELECT USING (is_public = true OR auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Users can insert own trips') THEN
    CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Users can update own trips') THEN
    CREATE POLICY "Users can update own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trips' AND policyname = 'Users can delete own trips') THEN
    CREATE POLICY "Users can delete own trips" ON trips FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
-- trip_spots RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_spots' AND policyname = 'Trip spots follow trip visibility') THEN
    CREATE POLICY "Trip spots follow trip visibility" ON trip_spots FOR SELECT USING (
      EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND (is_public = true OR user_id = auth.uid()))
    );
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_spots' AND policyname = 'Users can manage own trip spots') THEN
    CREATE POLICY "Users can manage own trip spots" ON trip_spots FOR ALL USING (
      EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
    );
  END IF;
END $$;

-- Allow users to update their own catches (needed for edit catch page)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'catches' AND policyname = 'Users can update own catches') THEN
    CREATE POLICY "Users can update own catches" ON catches FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
