-- Run this FIRST to see what columns you currently have
-- This will help us understand your table structure

-- Check hostels table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'hostels'
ORDER BY ordinal_position;

-- Check if profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'profiles'
) as profiles_table_exists;

-- Count your hostels
SELECT COUNT(*) as total_hostels FROM hostels;

-- Show all hostels with their current columns
SELECT * FROM hostels LIMIT 5;
