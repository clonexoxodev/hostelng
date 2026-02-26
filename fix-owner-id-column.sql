-- Fix the column name issue
-- Your table has 'owner_id' but we need to make sure it's set up correctly

-- Check current structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'hostels'
ORDER BY ordinal_position;

-- If owner_id exists and user_id doesn't, we're good!
-- Just need to update the RLS policies

-- Drop old policies that reference user_id
DROP POLICY IF EXISTS "Users can update own hostels" ON hostels;
DROP POLICY IF EXISTS "Users can delete own hostels" ON hostels;
DROP POLICY IF EXISTS "Authenticated users can insert hostels" ON hostels;

-- Create new policies with owner_id
CREATE POLICY "Authenticated users can insert hostels"
    ON hostels FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "Users can update own hostels"
    ON hostels FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own hostels"
    ON hostels FOR DELETE
    USING (auth.uid() = owner_id);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'hostels';
