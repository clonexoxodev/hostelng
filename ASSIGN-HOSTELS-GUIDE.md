# Assign Hostels to Users - Complete Guide

## The Problem
After running the migration, all hostels have `user_id = NULL`. This means:
- Users can't see their hostels in their dashboard
- fahirotoluwakemi@gmail.com should see 3 hostels but sees 0
- gigidev070@gmail.com should see 1 hostel but sees 0

## The Solution
We need to assign each hostel to its correct owner.

---

## 🎯 Step-by-Step Instructions

### Step 1: Run the Migration First
If you haven't already, run `supabase-migrations-fixed.sql` in Supabase SQL Editor.

### Step 2: Get User IDs

In Supabase SQL Editor, run:

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at;
```

**Copy the results!** You'll see something like:

```
id                                   | email                        | created_at
-------------------------------------|------------------------------|------------
abc123-uuid-here                     | clonexoxo80@gmail.com        | 2024-01-01
def456-uuid-here                     | fahirotoluwakemi@gmail.com   | 2024-01-02
ghi789-uuid-here                     | gigidev070@gmail.com         | 2024-01-03
jkl012-uuid-here                     | another@email.com            | 2024-01-04
```

**Write down:**
- fahirotoluwakemi@gmail.com ID: `_________________`
- gigidev070@gmail.com ID: `_________________`

### Step 3: Check Current Hostels

```sql
SELECT id, name, university, location, price, user_id 
FROM hostels 
ORDER BY id;
```

You'll see your 4 hostels with `user_id = NULL`:

```
id | name   | university              | location | price    | user_id
---|--------|-------------------------|----------|----------|--------
1  | Onovo  | University of Ibadan    | ...      | 200000   | NULL
2  | Lagos  | University of Ibadan    | ...      | 1500000  | NULL
3  | Lagos  | Polytechnic Ibadan      | ...      | 2800000  | NULL
4  | Ibadan | Polytechnic Ibadan      | ...      | 2800000  | NULL
```

### Step 4: Assign Hostels to Owners

Now we'll assign each hostel to its correct owner.

#### Method A: By Hostel ID (Recommended - Most Accurate)

```sql
-- Replace these UUIDs with the actual user IDs from Step 2

-- Assign hostels 1, 2, 3 to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE id IN (1, 2, 3);

-- Assign hostel 4 to gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE id = 4;
```

#### Method B: By Hostel Name (If IDs are different)

```sql
-- Assign Onovo to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name = 'Onovo';

-- Assign Lagos hostels to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name = 'Lagos';

-- Assign Ibadan to gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE name = 'Ibadan';
```

#### Method C: By Price (If names are duplicates)

Based on your screenshot:
- 200000 → fahirotoluwakemi@gmail.com
- 1500000 → fahirotoluwakemi@gmail.com
- 2800000 (UI) → fahirotoluwakemi@gmail.com
- 2800000 (Polytechnic) → gigidev070@gmail.com

```sql
-- Assign by price
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE price IN (200000, 1500000);

-- For the 2800000 ones, be more specific
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE price = 2800000 AND university LIKE '%University of Ibadan%';

UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE price = 2800000 AND university LIKE '%Polytechnic%';
```

### Step 5: Verify the Assignment

```sql
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

**Expected Result:**
```
id | name   | university           | price    | user_id      | owner_email
---|--------|---------------------|----------|--------------|-------------------------
1  | Onovo  | University of Ibadan | 200000   | def456...    | fahirotoluwakemi@gmail.com
2  | Lagos  | University of Ibadan | 1500000  | def456...    | fahirotoluwakemi@gmail.com
3  | Lagos  | Polytechnic Ibadan   | 2800000  | def456...    | fahirotoluwakemi@gmail.com
4  | Ibadan | Polytechnic Ibadan   | 2800000  | ghi789...    | gigidev070@gmail.com
```

✅ All hostels should now have an owner_email!

### Step 6: Test in Your App

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Login as fahirotoluwakemi@gmail.com:**
   - Go to `/dashboard`
   - Should see 3 hostels
   - Check browser console for: "Loaded hostels for user: [array with 3 items]"

3. **Login as gigidev070@gmail.com:**
   - Go to `/dashboard`
   - Should see 1 hostel
   - Check browser console for: "Loaded hostels for user: [array with 1 item]"

4. **Login as clonexoxo80@gmail.com (superadmin):**
   - Should redirect to `/admin`
   - Should see all 4 hostels

---

## 🐛 Troubleshooting

### Problem: User still sees 0 hostels in dashboard

**Check 1: Verify user_id is set**
```sql
SELECT id, name, user_id FROM hostels;
```
All should have a user_id (not NULL).

**Check 2: Verify user is logged in**
Open browser console (F12) and look for:
```
Loading hostels for user: abc123-uuid-here
Loaded hostels for user: [array]
```

**Check 3: Verify the user_id matches**
```sql
-- Get the logged-in user's ID from the console log
-- Then check if any hostels have that user_id
SELECT * FROM hostels WHERE user_id = 'user-id-from-console';
```

**Check 4: Check RLS policies**
```sql
SELECT * FROM pg_policies WHERE tablename = 'hostels';
```
Should see policies allowing users to view their own hostels.

### Problem: Can't update hostels

**Solution: Make sure RLS policies are set**
```sql
-- Allow users to update their own hostels
CREATE POLICY "Users can update own hostels"
    ON hostels FOR UPDATE
    USING (auth.uid() = user_id);
```

### Problem: New hostels don't get user_id automatically

**Check the ListHostel form** - it should set user_id when creating:
```typescript
const hostelData = {
  // ... other fields
  user_id: user.id,  // ← This line is important
};
```

---

## 📋 Quick Reference

### Get all users
```sql
SELECT id, email FROM auth.users;
```

### Get all hostels with owners
```sql
SELECT h.*, u.email 
FROM hostels h 
LEFT JOIN auth.users u ON h.user_id = u.id;
```

### Assign all hostels to one user (for testing)
```sql
UPDATE hostels SET user_id = 'your-user-id-here';
```

### Count hostels per user
```sql
SELECT 
    u.email,
    COUNT(h.id) as hostel_count
FROM auth.users u
LEFT JOIN hostels h ON u.id = h.user_id
GROUP BY u.email
ORDER BY hostel_count DESC;
```

Expected result:
```
email                        | hostel_count
----------------------------|-------------
fahirotoluwakemi@gmail.com  | 3
gigidev070@gmail.com        | 1
clonexoxo80@gmail.com       | 0
other@email.com             | 0
```

---

## ✅ Success Checklist

After completing all steps:

- [ ] Migration ran successfully
- [ ] All hostels have a user_id (not NULL)
- [ ] fahirotoluwakemi@gmail.com sees 3 hostels in dashboard
- [ ] gigidev070@gmail.com sees 1 hostel in dashboard
- [ ] Superadmin sees all 4 hostels in admin dashboard
- [ ] Homepage shows all 4 hostels
- [ ] Can add new hostels and they appear immediately
- [ ] Each user can only edit/delete their own hostels

---

## 🎯 Final Verification Query

Run this to confirm everything is correct:

```sql
SELECT 
    u.email as user_email,
    COUNT(h.id) as total_hostels,
    STRING_AGG(h.name, ', ') as hostel_names
FROM auth.users u
LEFT JOIN hostels h ON u.id = h.user_id
GROUP BY u.email
ORDER BY total_hostels DESC;
```

Should show:
```
user_email                  | total_hostels | hostel_names
----------------------------|---------------|------------------
fahirotoluwakemi@gmail.com  | 3             | Onovo, Lagos, Lagos
gigidev070@gmail.com        | 1             | Ibadan
clonexoxo80@gmail.com       | 0             | 
other@email.com             | 0             | 
```

Perfect! 🎉
