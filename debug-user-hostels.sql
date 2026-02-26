-- DEBUG: Check if hostels are assigned correctly

-- Step 1: Find the user ID for fehintoluwaolu@gmail.com
SELECT id, email FROM auth.users WHERE email LIKE '%fehintoluwaolu%';

-- Step 2: Check all hostels and their user_id
SELECT 
    id,
    name,
    university,
    price,
    user_id,
    CASE 
        WHEN user_id IS NULL THEN '❌ NOT ASSIGNED'
        ELSE '✅ ASSIGNED'
    END as status
FROM hostels 
ORDER BY id;

-- Step 3: Check which hostels belong to fehintoluwaolu
-- Replace 'USER-ID-HERE' with the actual UUID from Step 1
SELECT 
    h.id,
    h.name,
    h.university,
    h.price,
    h.user_id
FROM hostels h
WHERE h.user_id = 'PASTE-FEHINTOLUWAOLU-USER-ID-HERE';

-- Step 4: See all hostels with their owners
SELECT 
    h.id,
    h.name,
    h.university,
    h.price,
    h.user_id,
    u.email as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.id;

-- Step 5: Count hostels per user
SELECT 
    u.email,
    COUNT(h.id) as hostel_count,
    STRING_AGG(h.name, ', ') as hostel_names
FROM auth.users u
LEFT JOIN hostels h ON u.id = h.user_id
GROUP BY u.email
ORDER BY hostel_count DESC;
