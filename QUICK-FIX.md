# 🚀 QUICK FIX - 3 Steps Only

## The Problem
Only 1 hostel showing instead of 4. Missing database columns.

## The Solution

### Step 1: Run the Fixed Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy ALL code from `supabase-migrations-fixed.sql`
3. Paste and click "Run"
4. Should see: "✅ Migration completed successfully!"

### Step 2: Assign Hostels to Users
```sql
-- Get all user IDs
SELECT id, email FROM auth.users;

-- Assign all hostels to one user (replace YOUR-USER-ID)
UPDATE hostels 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;
```

### Step 3: Restart App
```bash
npm run dev
```

## Done! 
All 4 hostels should now appear on homepage.

---

## Detailed Steps
See `FIX-DATABASE-STEPS.md` for complete instructions.

## Files to Use
1. `check-current-structure.sql` - Check what you have now (optional)
2. `supabase-migrations-fixed.sql` - Run this to fix everything
3. `FIX-DATABASE-STEPS.md` - Detailed guide

## Verify It Worked
```sql
SELECT id, name, university, user_id, featured, rating 
FROM hostels;
```

Should show all 4 hostels with:
- user_id filled in
- featured = true or false
- rating = 0
