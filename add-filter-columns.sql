-- ============================================
-- FILTER COLUMNS FOR HOSTELS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS area   TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'not_specified';

-- Indexes for fast filter queries
CREATE INDEX IF NOT EXISTS hostels_area_idx   ON public.hostels(area);
CREATE INDEX IF NOT EXISTS hostels_gender_idx ON public.hostels(gender);
CREATE INDEX IF NOT EXISTS hostels_price_idx  ON public.hostels(price);

SELECT 'Filter columns ready' AS status;
