-- ============================================================
-- Saved Listings — run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_listings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id  UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, hostel_id)   -- prevents duplicate saves
);

-- Enable Row Level Security
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if re-running
DROP POLICY IF EXISTS "Users manage own saved listings" ON saved_listings;

-- Users can only read and write their own rows
CREATE POLICY "Users manage own saved listings"
  ON saved_listings
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
