-- Add preferred_techniques to profiles for onboarding step 3
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_techniques text[] DEFAULT '{}';
