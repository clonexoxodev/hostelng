-- SIMPLEST VERSION - This should work regardless of data types
-- Run each UPDATE statement ONE AT A TIME

-- First, get the user UUIDs
SELECT id, email FROM auth.users ORDER BY email;

-- Copy the UUIDs, then run the updates below ONE BY ONE

-- Update hostel with id = 1
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE id = 1;

-- Update hostel with id = 2
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE id = 2;

-- Update hostel with id = 3
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE id = 3;

-- Update hostel with id = 4
UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE id = 4;

-- Verify it worked
SELECT 
    h.id,
    h.name,
    h.user_id,
    u.email as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.id;
