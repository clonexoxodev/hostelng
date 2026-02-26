-- QUICK DIAGNOSTIC - Run this to see what's wrong
-- Copy all results and check each section

-- ========================================
-- SECTION 1: Check User Emails
-- ========================================
SELECT '=== ALL USERS ===' as section;
SELECT id, email, created_at FROM auth.users ORDER BY email;

-- ========================================
-- SECTION 2: Check All Hostels
-- ========================================
SELECT '=== ALL HOSTELS ===' as section;
SELECT 
    id,
    name,
    university,
    price,
    user_id,
    CASE 
        WHEN user_id IS NULL THEN '❌ NO OWNER'
        ELSE '✅ HAS OWNER'
    END as status
FROM hostels 
ORDER BY id;

-- ========================================
-- SECTION 3: Hostels with Owner Emails
-- ========================================
SELECT '=== HOSTELS WITH OWNERS ===' as section;
SELECT 
    h.id,
    h.name,
    h.university,
    h.price,
    COALESCE(u.email, '❌ NO OWNER') as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.id;

-- ========================================
-- SECTION 4: Count Hostels Per User
-- ========================================
SELECT '=== HOSTELS PER USER ===' as section;
SELECT 
    u.email,
    COUNT(h.id) as hostel_count,
    STRING_AGG(h.name, ', ') as hostel_names
FROM auth.users u
LEFT JOIN hostels h ON u.id = h.user_id
GROUP BY u.email
ORDER BY hostel_count DESC;

-- ========================================
-- SECTION 5: Check RLS Policies
-- ========================================
SELECT '=== RLS POLICIES ===' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'hostels';

-- ========================================
-- EXPECTED RESULTS:
-- ========================================
-- Section 4 should show:
-- fehintoluwaolu@gmail.com (or fahirotoluwakemi@gmail.com) | 3 | Onovo, Lagos, Lagos
-- gigidev070@gmail.com | 1 | Ibadan
-- clonexoxo80@gmail.com | 0 | 
--
-- If Section 4 shows 0 for fehintoluwaolu, the assignment didn't work!
