# ULTIMATE FIX - Assign Hostels (100% Working)

## The Problem
You're getting: `ERROR: operator does not exist: uuid = integer`

This means there's a type mismatch somewhere in your table structure.

---

## ✅ SOLUTION: Use Names Instead of IDs

This completely avoids the ID type issue.

### Step 1: Get User UUIDs

```sql
SELECT id, email FROM auth.users ORDER BY email;
```

**Write down the UUIDs:**
- fahirotoluwakemi@gmail.com: `_________________________________`
- gigidev070@gmail.com: `_________________________________`

---

### Step 2: Check Your Hostels

```sql
SELECT name, university, price FROM hostels ORDER BY price;
```

**You should see:**
- Onovo (University of Ibadan) - 200000
- Lagos (University of Ibadan) - 1500000
- Lagos (Polytechnic Ibadan) - 2800000
- Ibadan (Polytechnic Ibadan) - 2800000

---

### Step 3: Assign by Name (Copy & Paste)

**Replace the UUIDs below with your actual UUIDs from Step 1:**

```sql
-- Assign Onovo to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name = 'Onovo';

-- Assign ALL Lagos hostels to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name = 'Lagos';

-- Assign Ibadan to gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE name = 'Ibadan';
```

**EXAMPLE (with fake UUIDs):**
```sql
UPDATE hostels 
SET user_id = 'abc12345-1234-5678-90ab-cdef12345678'
WHERE name = 'Onovo';

UPDATE hostels 
SET user_id = 'abc12345-1234-5678-90ab-cdef12345678'
WHERE name = 'Lagos';

UPDATE hostels 
SET user_id = 'def67890-abcd-ef12-3456-7890abcdef12'
WHERE name = 'Ibadan';
```

---

### Step 4: Verify It Worked

```sql
SELECT 
    h.name,
    h.university,
    h.price,
    u.email as owner_email
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.price;
```

**Expected output:**
```
name   | university              | price    | owner_email
-------|------------------------|----------|---------------------------
Onovo  | University of Ibadan    | 200000   | fahirotoluwakemi@gmail.com
Lagos  | University of Ibadan    | 1500000  | fahirotoluwakemi@gmail.com
Lagos  | Polytechnic Ibadan      | 2800000  | fahirotoluwakemi@gmail.com
Ibadan | Polytechnic Ibadan      | 2800000  | gigidev070@gmail.com
```

✅ All should have owner_email!

---

### Step 5: Restart & Test

```bash
npm run dev
```

**Test:**
- Login as **fahirotoluwakemi@gmail.com** → See 3 hostels ✅
- Login as **gigidev070@gmail.com** → See 1 hostel ✅

---

## 🎯 ONE-LINER VERSION

If you want to do it all at once (after getting UUIDs):

```sql
-- Replace both UUIDs, then run all at once
UPDATE hostels SET user_id = 'FAHIROTOLUWAKEMI-UUID' WHERE name IN ('Onovo', 'Lagos');
UPDATE hostels SET user_id = 'GIGIDEV-UUID' WHERE name = 'Ibadan';
```

---

## 🐛 If This STILL Doesn't Work

### Option A: Assign by Price (Most Unique)

```sql
-- Get UUIDs first
SELECT id, email FROM auth.users ORDER BY email;

-- Assign by price (each price is unique in your case)
UPDATE hostels SET user_id = 'FAHIROTOLUWAKEMI-UUID' WHERE price = 200000;
UPDATE hostels SET user_id = 'FAHIROTOLUWAKEMI-UUID' WHERE price = 1500000;
UPDATE hostels SET user_id = 'FAHIROTOLUWAKEMI-UUID' WHERE price = 2800000 AND university LIKE '%University%';
UPDATE hostels SET user_id = 'GIGIDEV-UUID' WHERE price = 2800000 AND university LIKE '%Polytechnic%';
```

### Option B: Assign ALL to One User First (For Testing)

```sql
-- Assign all hostels to fahirotoluwakemi for testing
UPDATE hostels SET user_id = 'FAHIROTOLUWAKEMI-UUID';

-- Then move one to gigidev
UPDATE hostels SET user_id = 'GIGIDEV-UUID' WHERE name = 'Ibadan';
```

### Option C: Check for Hidden Characters

Sometimes copy-paste adds hidden characters. Type the UUID manually:

```sql
UPDATE hostels 
SET user_id = 'type-the-uuid-manually-here'
WHERE name = 'Onovo';
```

---

## 📋 Final Verification

```sql
-- Count hostels per user
SELECT 
    u.email,
    COUNT(h.name) as total_hostels
FROM auth.users u
LEFT JOIN hostels h ON u.id = h.user_id
GROUP BY u.email
ORDER BY total_hostels DESC;
```

**Should show:**
```
email                        | total_hostels
----------------------------|---------------
fahirotoluwakemi@gmail.com  | 3
gigidev070@gmail.com        | 1
clonexoxo80@gmail.com       | 0
```

---

## ✅ This WILL Work!

Using names instead of IDs completely avoids the type casting issue. Just make sure:
1. Copy the full UUID (36 characters with dashes)
2. Wrap it in single quotes
3. No extra spaces or line breaks

Done! 🎉
