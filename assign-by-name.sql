-- ALTERNATIVE: Assign by hostel NAME instead of ID
-- This avoids any ID type issues completely

-- Step 1: Get user UUIDs
SELECT id, email FROM auth.users ORDER BY email;

-- Step 2: See your hostels
SELECT id, name, university, price FROM hostels ORDER BY price;

-- Step 3: Assign by NAME (safer than using ID)

-- Assign "Onovo" to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name = 'Onovo';

-- Assign "Lagos" hostels to fahirotoluwakemi@gmail.com
-- This will update ALL hostels named "Lagos"
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name = 'Lagos';

-- Assign "Ibadan" to gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE name = 'Ibadan';

-- Step 4: Verify
SELECT 
    h.name,
    h.university,
    h.price,
    u.email as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.price;

-- If you need more specific matching (e.g., Lagos at UI vs Lagos at Polytechnic):
-- UPDATE hostels 
-- SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
-- WHERE name = 'Lagos' AND university LIKE '%University of Ibadan%';

-- UPDATE hostels 
-- SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
-- WHERE name = 'Lagos' AND university LIKE '%Polytechnic%';
