-- Step 1: First, let's see all users and their IDs
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at;

-- Step 2: See all hostels and their current user_id status
SELECT id, name, university, location, user_id 
FROM hostels 
ORDER BY id;

-- Step 3: Assign hostels to the correct users
-- Based on your screenshot, you have:
-- - 3 hostels from fahirotoluwakemi@gmail.com (Onovo, Lagos at UI, Lagos at Polytechnic)
-- - 1 hostel from gigidev070@gmail.com (Ibadan)

-- INSTRUCTIONS:
-- 1. Run Step 1 above to get the user IDs
-- 2. Copy the UUID for fahirotoluwakemi@gmail.com
-- 3. Copy the UUID for gigidev070@gmail.com
-- 4. Replace the UUIDs below with the actual values
-- 5. Adjust the WHERE conditions to match your actual hostel names/IDs

-- Example: Assign 3 hostels to fahirotoluwakemi@gmail.com
-- Replace 'FAHIROTOLUWAKEMI-USER-ID' with the actual UUID
UPDATE hostels 
SET user_id = 'FAHIROTOLUWAKEMI-USER-ID'
WHERE name IN ('Onovo', 'Lagos') 
   OR (name = 'Lagos' AND university LIKE '%Polytechnic%');

-- Example: Assign 1 hostel to gigidev070@gmail.com
-- Replace 'GIGIDEV-USER-ID' with the actual UUID
UPDATE hostels 
SET user_id = 'GIGIDEV-USER-ID'
WHERE name = 'Ibadan';

-- Step 4: Verify the assignments
SELECT 
    h.id,
    h.name,
    h.university,
    h.location,
    h.user_id,
    u.email as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.id;

-- Alternative: If you know the exact hostel IDs, use this instead:
-- UPDATE hostels SET user_id = 'FAHIROTOLUWAKEMI-USER-ID' WHERE id IN (1, 2, 3);
-- UPDATE hostels SET user_id = 'GIGIDEV-USER-ID' WHERE id = 4;
