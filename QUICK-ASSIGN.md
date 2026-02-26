# Quick Assign - Copy & Paste Solution

## 1️⃣ Get User IDs (Run in Supabase SQL Editor)

```sql
SELECT id, email FROM auth.users ORDER BY email;
```

**Copy the UUIDs for:**
- fahirotoluwakemi@gmail.com: `_______________________`
- gigidev070@gmail.com: `_______________________`

---

## 2️⃣ Assign Hostels (Replace UUIDs below)

```sql
-- Assign 3 hostels to fahirotoluwakemi@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE id IN (1, 2, 3);

-- Assign 1 hostel to gigidev070@gmail.com
UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE id = 4;
```

**OR if IDs are different, use names:**

```sql
-- Assign by name
UPDATE hostels 
SET user_id = 'PASTE-FAHIROTOLUWAKEMI-UUID-HERE'
WHERE name IN ('Onovo', 'Lagos');

UPDATE hostels 
SET user_id = 'PASTE-GIGIDEV-UUID-HERE'
WHERE name = 'Ibadan';
```

---

## 3️⃣ Verify It Worked

```sql
SELECT 
    h.name,
    h.university,
    u.email as owner
FROM hostels h
LEFT JOIN auth.users u ON h.user_id = u.id
ORDER BY h.id;
```

**Should show:**
- Onovo → fahirotoluwakemi@gmail.com
- Lagos → fahirotoluwakemi@gmail.com
- Lagos → fahirotoluwakemi@gmail.com
- Ibadan → gigidev070@gmail.com

---

## 4️⃣ Restart App & Test

```bash
npm run dev
```

**Login as fahirotoluwakemi@gmail.com:**
- Dashboard should show 3 hostels ✅

**Login as gigidev070@gmail.com:**
- Dashboard should show 1 hostel ✅

---

## Done! 🎉

Each user now sees only their own hostels in their dashboard.

For detailed troubleshooting, see `ASSIGN-HOSTELS-GUIDE.md`
