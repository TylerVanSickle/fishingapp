-- ─── Pro subscription fields ────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_since timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_techniques text[] NOT NULL DEFAULT '{}';

-- ─── Catch comments ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catch_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catch_id   uuid NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);

ALTER TABLE catch_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-deleted comments"
  ON catch_comments FOR SELECT USING (is_deleted = false);

CREATE POLICY "Authenticated users can insert comments"
  ON catch_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON catch_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete own comments"
  ON catch_comments FOR UPDATE USING (auth.uid() = user_id);

-- ─── Catch reactions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catch_reactions (
  catch_id   uuid NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (catch_id, user_id)
);

ALTER TABLE catch_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions"
  ON catch_reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react"
  ON catch_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reaction"
  ON catch_reactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can remove own reaction"
  ON catch_reactions FOR DELETE USING (auth.uid() = user_id);

-- ─── Comment reports ─────────────────────────────────────────────────────────
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

CREATE POLICY "Authenticated users can report comments"
  ON comment_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can read all reports"
  ON comment_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update reports"
  ON comment_reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
