# Database Setup Instructions

## Run the Migration in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `supabase-migrations.sql`
6. Paste it into the SQL editor
7. Click "Run" button

## What This Migration Does

### Adds Missing Columns to `hostels` Table:
- `featured` (boolean) - To mark hostels as featured on homepage
- `rating` (numeric) - To store hostel ratings (0-5)
- `images` (text array) - To store multiple image URLs
- `created_at` (timestamp) - When the hostel was created
- `updated_at` (timestamp) - When the hostel was last updated

### Creates `profiles` Table:
- Stores user profile information
- Links to auth.users via user ID
- Includes: email, full_name, phone, role, avatar_url
- Automatically creates a profile when a user signs up

### Sets Up Security:
- Row Level Security (RLS) policies
- Public can view profiles
- Users can only update their own profile

### Performance Optimizations:
- Indexes on frequently queried columns
- Automatic timestamp updates

## After Running the Migration

Your database will have:
1. A complete `hostels` table with all necessary columns
2. A `profiles` table for user information
3. Proper security policies
4. Automatic profile creation on user signup

## Verify the Migration

Run this query to check your tables:

```sql
-- Check hostels table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'hostels'
ORDER BY ordinal_position;

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check all hostels
SELECT id, name, university, featured, rating, created_at
FROM hostels
ORDER BY created_at DESC;

-- Check all profiles
SELECT id, email, full_name, role, created_at
FROM profiles;
```

## Troubleshooting

If you see errors about existing columns or tables, that's okay - the migration is designed to skip existing items.

If you need to reset everything:
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS profiles CASCADE;
-- Then run the migration again
```
