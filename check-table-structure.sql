-- Let's check the actual structure of your hostels table
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'hostels'
ORDER BY ordinal_position;

-- This will show us the exact data types of all columns
