# Fix Database - Step by Step

## ⚠️ The Error You Got

```
Error: Failed to run sql query: ERROR: 42703: column "user_id" does not exist
```

This means your `hostels` table doesn't have a `user_id` column yet. The new migration will add it.

## 🔍 Step 1: Check Your Current Structure (Optional but Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `check-current-structure.sql`
3. Click Run
4. This will show you what columns you currently have

You'll see something like:
```
column_name       | data_type | is_nullable | column_default
------------------|-----------|-------------|---------------
id                | integer   | NO          | ...
name              | text      | YES         | NULL
university        | text      | YES         | NULL
location          | text      | YES         | NULL
price             | numeric   | YES         | NULL
description       | text      | YES         | NULL
amenities         | text[]    | YES         | NULL
contact_phone     | text      | YES         | NULL
contact_email     | text      | YES         | NULL
rooms_available   | integer   | YES         | NULL
```

Notice: NO `user_id`, NO `featured`, NO `rating`, NO `images`, NO timestamps

## ✅ Step 2: Run the Fixed Migration

1. Stay in Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Open the file `supabase-migrations-fixed.sql` from this project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)

### Expected Output:
You should see messages like:
```
NOTICE: Added user_id column
NOTICE: Added featured column
NOTICE: Added rating column
NOTICE: Added images column
NOTICE: Added created_at column
NOTICE: Added updated_at column
NOTICE: ✅ Migration completed successfully!
```

## 🎯 Step 3: Verify the Migration

Run this query to confirm all columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'hostels'
ORDER BY ordinal_position;
```

You should now see:
- ✅ id
- ✅ name
- ✅ university
- ✅ location
- ✅ price
- ✅ description
- ✅ amenities
- ✅ contact_phone
- ✅ contact_email
- ✅ rooms_available
- ✅ **user_id** ← NEW
- ✅ **featured** ← NEW
- ✅ **rating** ← NEW
- ✅ **images** ← NEW
- ✅ **created_at** ← NEW
- ✅ **updated_at** ← NEW

## 📊 Step 4: Check Your Data

```sql
SELECT id, name, university, featured, rating, user_id, created_at 
FROM hostels 
ORDER BY id;
```

You should see all 4 hostels with:
- `featured` = false (default)
- `rating` = 0 (default)
- `user_id` = NULL (we'll fix this next)
- `created_at` = current timestamp

## 🔧 Step 5: Link Existing Hostels to Users (IMPORTANT)

Your existing 4 hostels don't have a `user_id` yet. We need to assign them to the users who created them.

### Option A: Assign All to One User (Quick Fix)

If you want to assign all hostels to one user (e.g., yourself):

```sql
-- First, get your user ID
SELECT id, email FROM auth.users;

-- Copy your user ID, then update hostels
-- Replace 'YOUR-USER-ID-HERE' with your actual UUID
UPDATE hostels 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;
```

### Option B: Assign to Specific Users (Based on Email)

Based on your screenshot, you have:
- 3 hostels from fahirotoluwakemi@gmail.com
- 1 hostel from gigidev070@gmail.com

```sql
-- Get user IDs
SELECT id, email FROM auth.users;

-- Assign hostels to fahirotoluwakemi@gmail.com
-- Replace 'USER-ID-1' with the actual UUID for fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'USER-ID-1'
WHERE name IN ('Onovo', 'Lagos', 'Lagos'); -- Adjust names as needed

-- Assign hostel to gigidev070@gmail.com
-- Replace 'USER-ID-2' with the actual UUID for gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'USER-ID-2'
WHERE name = 'Ibadan'; -- Adjust name as needed
```

### Option C: Manual Assignment (Most Accurate)

```sql
-- Update each hostel individually
UPDATE hostels SET user_id = 'user-id-here' WHERE id = 1;
UPDATE hostels SET user_id = 'user-id-here' WHERE id = 2;
UPDATE hostels SET user_id = 'user-id-here' WHERE id = 3;
UPDATE hostels SET user_id = 'user-id-here' WHERE id = 4;
```

## 🎨 Step 6: Mark Some Hostels as Featured (Optional)

```sql
-- Mark the first hostel as featured
UPDATE hostels SET featured = true WHERE id = 1;

-- Or mark by name
UPDATE hostels SET featured = true WHERE name = 'Onovo';
```

## 🚀 Step 7: Restart Your App

```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
# or
pnpm dev
```

## ✨ Step 8: Test Everything

1. **Homepage** - Should show all 4 hostels
2. **Hostels Page** - Should show all 4 hostels
3. **Login as user** - Dashboard should show only their hostels
4. **Login as superadmin** (clonexoxo80@gmail.com) - Admin dashboard shows all hostels

## 🐛 If You Still Get Errors

### Error: "relation 'profiles' already exists"
This is fine - it means the table was already created. The migration will skip it.

### Error: "policy already exists"
This is fine - the migration drops and recreates policies.

### Error: "function already exists"
This is fine - we use `CREATE OR REPLACE` to update functions.

### Hostels still not showing
1. Check browser console (F12) for errors
2. Look for "Loaded hostels:" log - should show array with 4 items
3. Verify data in Supabase:
   ```sql
   SELECT * FROM hostels;
   ```

### Can't add new hostels
Make sure you're logged in and the `user_id` gets set automatically:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'hostels';
```

## 📝 Quick Verification Checklist

After completing all steps:

- [ ] Migration ran without errors
- [ ] All new columns exist in hostels table
- [ ] Profiles table exists
- [ ] All 4 hostels have a user_id assigned
- [ ] Homepage shows all 4 hostels
- [ ] Hostels page shows all 4 hostels
- [ ] Can add new hostels
- [ ] Dashboard shows correct hostels per user
- [ ] Admin dashboard shows all hostels

## 🎯 Final Test Query

Run this to see everything is working:

```sql
-- Should show all 4 hostels with complete data
SELECT 
    h.id,
    h.name,
    h.university,
    h.price,
    h.featured,
    h.rating,
    h.rooms_available,
    h.user_id,
    p.email as owner_email,
    h.created_at
FROM hostels h
LEFT JOIN profiles p ON h.user_id = p.id
ORDER BY h.created_at DESC;
```

This should show all 4 hostels with their owner's email!
