# Troubleshoot - User Not Seeing Hostels in Dashboard

## Problem
fehintoluwaolu@gmail.com (or fahirotoluwakemi@gmail.com) is not seeing their 3 hostels in the dashboard.

---

## 🔍 Step 1: Verify the Assignment in Database

Run this in Supabase SQL Editor:

```sql
-- Check all hostels with their owners
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
```

**What to look for:**
- Do the 3 hostels show `fehintoluwaolu@gmail.com` or `fahirotoluwakemi@gmail.com` as owner_email?
- Or do they show `NULL` in owner_email?

### If owner_email is NULL:
❌ The assignment didn't work. Go to **Step 2**.

### If owner_email shows the correct email:
✅ Assignment worked. Go to **Step 3**.

---

## 🔧 Step 2: Assign Hostels (If Not Assigned)

### Option A: Get the correct email first
```sql
-- Check the exact email in your database
SELECT id, email FROM auth.users ORDER BY email;
```

Is it `fehintoluwaolu@gmail.com` or `fahirotoluwakemi@gmail.com`?

### Option B: Assign by name (safest method)
```sql
-- Get the user ID for fehintoluwaolu or fahirotoluwakemi
SELECT id, email FROM auth.users WHERE email LIKE '%fehinto%';

-- Copy the UUID, then assign hostels
UPDATE hostels SET user_id = 'PASTE-USER-UUID-HERE' WHERE name = 'Onovo';
UPDATE hostels SET user_id = 'PASTE-USER-UUID-HERE' WHERE name = 'Lagos';
```

### Option C: Assign ALL hostels to this user (for testing)
```sql
-- Get user ID
SELECT id, email FROM auth.users WHERE email LIKE '%fehinto%';

-- Assign all hostels to this user
UPDATE hostels SET user_id = 'PASTE-USER-UUID-HERE';
```

Then verify:
```sql
SELECT h.name, u.email FROM hostels h LEFT JOIN auth.users u ON h.user_id = u.id;
```

---

## 🔍 Step 3: Check Browser Console

1. Login as fehintoluwaolu@gmail.com
2. Go to `/dashboard`
3. Press **F12** to open DevTools
4. Go to **Console** tab
5. Look for these logs:

**What you should see:**
```
Loading hostels for user: abc123-uuid-here
Loaded hostels for user: [array with 3 items]
```

**If you see:**
```
Loading hostels for user: abc123-uuid-here
Loaded hostels for user: []
```
❌ The user_id doesn't match. Go to **Step 4**.

**If you see errors:**
```
Error loading hostels: ...
```
❌ There's a database/permission issue. Go to **Step 5**.

---

## 🔧 Step 4: Verify User ID Matches

The user_id in the hostels table must match the logged-in user's ID.

### Check logged-in user ID:
1. In browser console (F12), look for the log: `Loading hostels for user: abc123...`
2. Copy that UUID

### Check if hostels have that user_id:
```sql
-- Replace with the UUID from browser console
SELECT * FROM hostels WHERE user_id = 'PASTE-UUID-FROM-CONSOLE';
```

**If this returns 0 rows:**
❌ The hostels are assigned to a different user_id. Fix it:

```sql
-- Get the correct user ID
SELECT id, email FROM auth.users WHERE email LIKE '%fehinto%';

-- Update hostels with the correct user_id
UPDATE hostels 
SET user_id = 'CORRECT-USER-UUID-HERE'
WHERE name IN ('Onovo', 'Lagos');
```

---

## 🔧 Step 5: Check RLS Policies

Row Level Security might be blocking the query.

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'hostels';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'hostels';
```

**If no policies exist or RLS is blocking:**

```sql
-- Temporarily disable RLS for testing
ALTER TABLE hostels DISABLE ROW LEVEL SECURITY;

-- Try the dashboard again
-- If it works, re-enable RLS and fix policies:

ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;

-- Create proper policies
DROP POLICY IF EXISTS "Anyone can view hostels" ON hostels;
DROP POLICY IF EXISTS "Users can view own hostels" ON hostels;

CREATE POLICY "Anyone can view hostels"
    ON hostels FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own hostels"
    ON hostels FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hostels"
    ON hostels FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hostels"
    ON hostels FOR DELETE
    USING (auth.uid() = user_id);
```

---

## 🔧 Step 6: Check Dashboard Code

The Dashboard component should be filtering by user_id. Let's verify:

Open browser console and check the network tab:
1. Press F12 → Network tab
2. Refresh the dashboard page
3. Look for a request to Supabase (usually shows as a POST to your-project.supabase.co)
4. Check the request payload

**Should see something like:**
```json
{
  "query": "SELECT * FROM hostels WHERE user_id = 'abc123...'",
  ...
}
```

---

## 🎯 Quick Test: Assign All Hostels to Current User

If you're still stuck, try this quick test:

```sql
-- 1. Get the logged-in user's ID from browser console
-- Look for: "Loading hostels for user: abc123..."

-- 2. Assign ALL hostels to that user
UPDATE hostels SET user_id = 'PASTE-USER-ID-FROM-CONSOLE';

-- 3. Refresh dashboard
-- Should now see all hostels
```

If this works, it means the assignment was the issue. Then properly reassign:

```sql
-- Get all user IDs
SELECT id, email FROM auth.users;

-- Assign correctly
UPDATE hostels SET user_id = 'FEHINTOLUWAOLU-UUID' WHERE name IN ('Onovo', 'Lagos');
UPDATE hostels SET user_id = 'GIGIDEV-UUID' WHERE name = 'Ibadan';
```

---

## ✅ Final Verification Checklist

Run these queries to verify everything:

```sql
-- 1. All hostels should have a user_id
SELECT id, name, user_id FROM hostels;
-- ✅ No NULL user_ids

-- 2. Count per user
SELECT u.email, COUNT(h.id) as count
FROM auth.users u
LEFT JOIN hostels h ON u.id = h.user_id
GROUP BY u.email;
-- ✅ fehintoluwaolu: 3, gigidev: 1

-- 3. Check specific user
SELECT h.* FROM hostels h
JOIN auth.users u ON h.user_id = u.id
WHERE u.email LIKE '%fehinto%';
-- ✅ Should return 3 rows
```

---

## 🆘 Still Not Working?

Share these results:

1. **Database check:**
```sql
SELECT h.name, u.email FROM hostels h LEFT JOIN auth.users u ON h.user_id = u.id;
```

2. **Browser console logs** (F12 → Console)

3. **Network request** (F12 → Network → Look for Supabase request)

This will help identify the exact issue!
