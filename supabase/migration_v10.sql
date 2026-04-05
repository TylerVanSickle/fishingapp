-- migration_v10: catch visibility (public / friends / private)

-- Add visibility column with check constraint
ALTER TABLE catches
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'friends', 'private'));

-- Backfill from is_private: private catches stay private, rest stay public
UPDATE catches SET visibility = 'private' WHERE is_private = true AND visibility = 'public';

-- Index for feed queries that filter by visibility
CREATE INDEX IF NOT EXISTS catches_visibility_idx ON catches(visibility);
