-- v7: private catches + spot photos gallery
-- NOTE: You must also create these Storage buckets in the Supabase dashboard (Storage → New bucket):
--   • catch-photos  (public)
--   • spot-photos   (public)
--   • avatars       (public)
-- Then add these storage policies (or they'll already be set if created as public).

-- Add is_private flag to catches
ALTER TABLE catches ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- Spot photos table for community gallery
CREATE TABLE IF NOT EXISTS spot_photos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id     uuid NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url   text NOT NULL,
  caption     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spot_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spot photos"
  ON spot_photos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload spot photos"
  ON spot_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spot photos"
  ON spot_photos FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS spot_photos_spot_id_idx ON spot_photos(spot_id);
CREATE INDEX IF NOT EXISTS spot_photos_created_at_idx ON spot_photos(created_at DESC);
