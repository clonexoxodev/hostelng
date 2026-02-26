-- Check which user owns which hostel
SELECT 
    h.id,
    h.name,
    h.user_id,
    u.email as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.id;

-- Check gigidev070's user ID
SELECT id, email FROM auth.users WHERE email LIKE '%gigidev%';

-- Check if gigidev070 owns any hostels
SELECT 
    h.name,
    h.user_id,
    u.email
FROM hostels h
JOIN auth.users u ON h.user_id = u.id
WHERE u.email LIKE '%gigidev%';
