-- FIXED VERSION - For INTEGER IDs
-- This error means your hostel id column is INTEGER, not UUID

-- Step 1: Get all users and their UUIDs
SELECT id, email FROM auth.users ORDER BY email;

-- Step 2: Check your hostels (note: id is INTEGER)
SELECT id, name, university, location, price, user_id FROM hostels ORDER BY id;

-- Step 3: Assign hostels to users
-- IMPORTANT: Replace the UUIDs below with actual values from Step 1

-- Assign hostels with INTEGER IDs 1, 2, 3 to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = '332546a5-4f9c-4e8e-a03d-c3c279ca9147'::uuid
WHERE id = 1 OR id = 2 OR id = 3;

-- OR use this simpler version:
UPDATE hostels 
SET user_id = '332546a5-4f9c-4e8e-a03d-c3c279ca9147'::uuid
WHERE id IN (1, 2, 3);

-- Assign hostel with INTEGER ID 4 to gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'caea4de6-07f7-4b27-b6bb-efed14f133c8'::uuid
WHERE id = 4;

-- Step 4: Verify it worked
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

-- Alternative: If you know the exact row numbers from your screenshot
-- Row 1 (Onovo, 200000) → fahirotoluwakemi
-- Row 2 (Lagos, 1500000) → fahirotoluwakemi  
-- Row 3 (Lagos, 2800000) → fahirotoluwakemi
-- Row 4 (Ibadan, 2800000) → gigidev070

-- You can also assign by name if IDs don't match:
-- UPDATE hostels 
-- SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'::uuid
-- WHERE name = 'Onovo';

-- UPDATE hostels 
-- SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'::uuid
-- WHERE name = 'Lagos';

-- UPDATE hostels 
-- SET user_id = 'PASTE-GIGIDEV-UUID-HERE'::uuid
-- WHERE name = 'Ibadan';
