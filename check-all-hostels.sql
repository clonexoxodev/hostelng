-- Check all 4 hostels and their details
SELECT 
    id,
    name,
    university,
    location,
    price,
    user_id,
    created_at,
    CASE 
        WHEN price IS NULL THEN '❌ NO PRICE'
        WHEN price > 10000000 THEN '⚠️ PRICE TOO HIGH'
        ELSE '✅ OK'
    END as price_status
FROM hostels 
ORDER BY id;

-- Count total hostels
SELECT COUNT(*) as total_hostels FROM hostels;

-- Check if any hostel has NULL or very high price
SELECT 
    name,
    price,
    CASE 
        WHEN price IS NULL THEN 'NULL - will be filtered out'
        WHEN price > 10000000 THEN 'Too high - will be filtered out'
        ELSE 'OK'
    END as issue
FROM hostels
WHERE price IS NULL OR price > 10000000;
