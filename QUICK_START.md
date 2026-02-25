# HostelNG Dashboard - Quick Start Guide

## 🚀 Complete Setup in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Open your Supabase project: https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase-complete-setup.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. ✅ Wait for "Success" message
8. Verify at the bottom you see:
   - "Hostels table created"
   - "Storage bucket created"
   - "RLS policies created"

### Step 2: Verify Storage Bucket (30 seconds)

1. Go to **Storage** in Supabase sidebar
2. You should see `hostel-images` bucket
3. Click on it - it should be marked as **Public**
4. ✅ If you see it, you're good!

### Step 3: Register Super Admin (1 minute)

1. Start your app: `npm run dev`
2. Go to: http://localhost:8080/register
3. Fill in the form:
   - **Email**: `clonexoxo80@gmail.com`
   - **Role**: Select "Hostel Listing"
   - Fill other required fields
4. Click **Create account**
5. Check your email and verify if required
6. ✅ Super admin account created!

### Step 4: Sign In & Access Dashboard (30 seconds)

1. Go to: http://localhost:8080/signin
2. Enter:
   - **Email**: `clonexoxo80@gmail.com`
   - **Password**: (your password)
   - **Role**: Select "Agent/Hostel Lister"
3. Click **Sign in**
4. You'll be redirected to `/dashboard`
5. ✅ You should see "Super Admin" badge!

### Step 5: Add Your First Hostel (1 minute)

1. Click **Add New Hostel** button
2. Fill in the form:
   - Hostel Name: e.g., "Sunshine Hostel"
   - Location: e.g., "Bodija, Ibadan"
   - University: e.g., "University of Ibadan"
   - Price: e.g., "150000"
   - Rooms Available: e.g., "20"
   - Description: Brief description
   - Amenities: e.g., "WiFi, Security, Water Supply"
   - Contact Phone: Your phone
   - Contact Email: Your email
3. Upload 2-3 images
4. Click **Create Hostel**
5. ✅ Your first hostel is live!

## 🎉 You're Done!

You now have:
- ✅ Complete database with all tables and policies
- ✅ Super admin account with full access
- ✅ Working dashboard to manage hostels
- ✅ Image upload functionality
- ✅ Full CRUD operations

## 📋 What You Can Do Now

### As Super Admin (clonexoxo80@gmail.com):
- View ALL hostels from all users
- Edit any hostel
- Delete any hostel
- Add new hostels

### Dashboard Features:
- `/dashboard` - View all hostels
- `/dashboard/hostel/new` - Add new hostel
- `/dashboard/hostel/edit/:id` - Edit hostel
- Click trash icon to delete

### Public Pages:
- `/` - Homepage with featured hostels
- `/hostels` - Browse all hostels
- `/hostels/:id` - View hostel details
- `/contact` - Contact page

## 🔧 Troubleshooting

### Can't sign in?
- Make sure you registered with the exact email: `clonexoxo80@gmail.com`
- Check you selected "Hostel Listing" role during registration
- Verify your email if Supabase sent a confirmation

### Images not uploading?
- Check Storage bucket exists in Supabase
- Verify bucket is set to Public
- Check browser console for errors

### Not seeing "Super Admin" badge?
- Sign out and sign in again
- Clear browser cache
- Verify email is exactly: `clonexoxo80@gmail.com`

### SQL script errors?
- Make sure you deleted all old tables first
- Run the script in Supabase SQL Editor (not in your code)
- Check for any error messages in the output

## 📞 Need Help?

Check these files for more details:
- `DASHBOARD_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - Technical overview
- `supabase-complete-setup.sql` - Database schema

## 🎯 Next Steps

1. Add more hostels to test the system
2. Test editing and deleting
3. Upload multiple images per hostel
4. Create additional agent accounts to test user isolation
5. Customize the dashboard to your needs

Happy hosting! 🏠
