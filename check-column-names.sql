-- Check the actual column names in your hostels table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'hostels'
ORDER BY ordinal_position;

-- This will show if you have 'user_id' or 'owner_id' or both
