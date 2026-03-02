# Admin User List - Setup Guide

## Issue
Super admin dashboard was showing "User management coming soon" instead of displaying the actual list of registered users.

## Solution Implemented

### 1. Created user_profiles Table
- File: `create-user-profiles-table.sql`
- Stores additional user information linked to auth.users
- Includes: email, full_name, phone, role, created_at, updated_at
- Automatically populated via database trigger when users sign up

### 2. Updated Admin Dashboard
- File: `src/pages/AdminDashboard.tsx`
- Now fetches and displays user data from user_profiles table
- Shows: Email, Full Name, Role, Phone, Hostel Count, Join Date
- Fallback: If user_profiles doesn't exist, shows unique hostel owners

### 3. User Display Features
- Table view with all user information
- Role badges (Student/Agent)
- Hostel count per user
- Join date formatting
- Responsive table layout

## Setup Instructions

### Step 1: Create user_profiles Table
Run the SQL in `create-user-profiles-table.sql` in your Supabase SQL Editor:

```sql
-- This will create:
-- 1. user_profiles table
-- 2. RLS policies for security
-- 3. Automatic trigger to populate on signup
-- 4. Indexes for performance
```

### Step 2: Migrate Existing Users (Optional)
If you have existing users who registered before creating this table, run:

```sql
-- Insert existing users into user_profiles
INSERT INTO user_profiles (id, email, full_name, phone, role)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'phone' as phone,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);
```

### Step 3: Test the Feature
1. Login as super admin (clonexoxo80@gmail.com)
2. Navigate to Admin Dashboard (`/admin`)
3. Click on "Users" tab
4. You should see all registered users with their details

## What You'll See

### Users Tab Displays:
- **Email**: User's email address
- **Full Name**: User's full name from registration
- **Role**: Student or Agent badge
- **Phone**: Contact phone number
- **Hostels**: Number of hostels owned (for agents)
- **Joined**: Registration date

### Features:
- Sortable columns
- Role-based badges (color-coded)
- Hostel count for each agent
- Clean table layout
- Responsive design

## Database Trigger Explained

The trigger automatically creates a user_profiles entry when someone registers:

```sql
-- Trigger runs AFTER INSERT on auth.users
-- Copies user metadata to user_profiles table
-- Ensures data consistency
```

## Security (RLS Policies)

1. **Users can view own profile**: Users see only their own data
2. **Users can update own profile**: Users can edit their own info
3. **Super admin can view all**: Admin sees all user profiles
4. **Automatic profile creation**: Trigger creates profile on signup

## Troubleshooting

### Issue: Users tab shows "No users found"
**Solution**: Run the migration SQL to populate existing users

### Issue: New users not appearing
**Solution**: Check if trigger is created:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Issue: Permission denied
**Solution**: Verify RLS policies are created:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

## Files Modified/Created

### Created
- ✅ `create-user-profiles-table.sql` - Database schema and trigger

### Modified
- ✅ `src/pages/AdminDashboard.tsx` - User list display

## Testing Checklist
- [ ] Run create-user-profiles-table.sql
- [ ] Run migration for existing users (if any)
- [ ] Login as super admin
- [ ] Navigate to Admin Dashboard
- [ ] Click Users tab
- [ ] Verify all users are displayed
- [ ] Check user details are correct
- [ ] Register a new user
- [ ] Verify new user appears in list
- [ ] Check hostel count is accurate

## Next Steps (Optional Enhancements)

1. **User Search**: Add search/filter functionality
2. **User Actions**: Add ability to disable/enable users
3. **Export**: Add CSV export of user list
4. **User Details**: Add modal with full user details
5. **Activity Log**: Track user actions and logins
