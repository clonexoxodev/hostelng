# Profiles Table Update & Report Button Removal

## Changes Made

### 1. Removed Report Button from Hostel Detail Page
- **Removed**: "Report Listing" button at bottom of hostel detail page
- **Kept**: Flag icon on hostel cards (browse page)
- **Reason**: Flag icon on cards is more convenient and visible
- **File**: `src/pages/HostelDetail.tsx`

### 2. Updated Admin Dashboard to Use 'profiles' Table
- **Changed from**: `user_profiles` table
- **Changed to**: `profiles` table
- **Reason**: You already have a `profiles` table with 5 users
- **File**: `src/pages/AdminDashboard.tsx`

### 3. Created Trigger Update Script
- Updates database trigger to use `profiles` table
- Ensures new user registrations populate `profiles` table
- Adds necessary RLS policies
- **File**: `update-profiles-trigger.sql`

## Current State

### Database Tables:
- ✅ `profiles` - Active table with 5 users (USING THIS)
- ❌ `user_profiles` - Empty table (DELETED by you)

### Report Feature:
- ✅ Flag icon on hostel cards (browse page) - ACTIVE
- ❌ Report button on detail page - REMOVED

## Setup Instructions

### Step 1: Run Trigger Update (Important!)
Run the SQL in `update-profiles-trigger.sql` to ensure new user registrations work correctly:

```sql
-- This will:
-- 1. Drop old trigger that used user_profiles
-- 2. Create new trigger that uses profiles
-- 3. Add RLS policies for security
-- 4. Add indexes for performance
```

### Step 2: Verify Profiles Table Structure
Check that your `profiles` table has these columns:
- `id` (UUID, primary key, references auth.users)
- `email` (TEXT)
- `full_name` (TEXT)
- `phone` (TEXT)
- `role` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

If any columns are missing, uncomment and run the ALTER TABLE statements in the SQL file.

### Step 3: Test the Changes

#### Test Admin Dashboard:
1. Login as super admin (clonexoxo80@gmail.com)
2. Go to Admin Dashboard (`/admin`)
3. Click "Users" tab
4. Verify you see all 5 users from profiles table
5. Check that user details display correctly

#### Test Report Feature:
1. Go to Browse Hostels page (`/hostels`)
2. Hover over any hostel card
3. Verify flag icon appears in top-right corner
4. Click flag and submit a report
5. Go to hostel detail page
6. Verify NO report button appears at bottom

#### Test New User Registration:
1. Register a new user (student or agent)
2. Check that profile is created in `profiles` table
3. Verify user appears in admin dashboard

## Why This Change?

### Profiles Table:
- You already had a `profiles` table with real user data
- `user_profiles` was empty and unused
- Consolidating to one table simplifies the database
- Reduces confusion and maintenance

### Report Button Removal:
- Flag icon on cards is more discoverable
- Users can report without opening detail page
- Cleaner detail page layout
- Consistent reporting experience

## Files Modified/Created

### Modified:
- ✅ `src/pages/HostelDetail.tsx` - Removed report button
- ✅ `src/pages/AdminDashboard.tsx` - Changed to use profiles table

### Created:
- ✅ `update-profiles-trigger.sql` - Database trigger update

### Obsolete (Can be deleted):
- ❌ `create-user-profiles-table.sql` - No longer needed

## Database Cleanup (Optional)

If you want to clean up, you can delete the old function:

```sql
-- Remove old function if it still exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

The new function with the same name will be created by the update script.

## Profiles Table Schema (Reference)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('student', 'agent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## RLS Policies Applied

1. **Users can view own profile**: Users see only their data
2. **Users can update own profile**: Users can edit their info
3. **Users can insert own profile**: Auto-created on signup
4. **Super admin can view all**: Admin sees all profiles

## Testing Checklist

- [ ] Run update-profiles-trigger.sql
- [ ] Verify profiles table has correct columns
- [ ] Login as admin and check Users tab
- [ ] Verify all 5 users are displayed
- [ ] Check user details are correct
- [ ] Go to hostel detail page
- [ ] Verify NO report button at bottom
- [ ] Go to browse hostels page
- [ ] Hover over card and verify flag icon appears
- [ ] Click flag and submit test report
- [ ] Register a new test user
- [ ] Verify new user appears in profiles table
- [ ] Verify new user appears in admin dashboard

## Troubleshooting

### Issue: Users not appearing in admin dashboard
**Solution**: 
1. Check if profiles table exists: `SELECT * FROM profiles;`
2. Verify RLS policies allow admin access
3. Check console for errors

### Issue: New users not creating profiles
**Solution**:
1. Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Run update-profiles-trigger.sql
3. Test registration again

### Issue: Permission denied on profiles table
**Solution**:
1. Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'profiles';`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'profiles';`
3. Re-run the RLS policy section of the SQL script

## Summary

- Report button removed from detail page (flag icon on cards remains)
- Admin dashboard now uses `profiles` table (with your 5 existing users)
- Trigger updated to populate `profiles` on new registrations
- Database simplified to use one profiles table instead of two
