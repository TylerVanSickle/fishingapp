-- ============================================================
-- migration_v4.sql
-- HookLine — Nationalize: add state column to spots
-- ============================================================

-- Add state column
ALTER TABLE public.spots
  ADD COLUMN IF NOT EXISTS state text;

-- Set all existing spots to Utah (they're all Utah water bodies)
UPDATE public.spots SET state = 'Utah' WHERE state IS NULL;

-- ============================================================
-- DONE
-- ============================================================
