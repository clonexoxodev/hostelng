# Hostel Owner Dashboard Setup Guide

## Overview
The dashboard allows hostel owners and agents to manage their hostel listings with full CRUD (Create, Read, Update, Delete) functionality.

## Features
- ✅ Add new hostels with images, details, and amenities
- ✅ Edit existing hostel information
- ✅ Delete hostels
- ✅ View all your hostels in one place
- ✅ Image upload and management
- ✅ Super admin access for clonexoxo80@gmail.com

## Setup Instructions

### 1. Database Setup (Supabase)

**Fresh Database Setup** (recommended - you've deleted everything):

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-complete-setup.sql`
4. Run the SQL script - it will create:
   - ✅ `hostels` table with all columns
   - ✅ `hostel-images` storage bucket (public)
   - ✅ Row Level Security (RLS) policies
   - ✅ Storage policies for images
   - ✅ Automatic timestamp updates
   - ✅ Performance indexes
   - ✅ Super admin access for clonexoxo80@gmail.com
5. Check the output at the bottom to verify everything was created successfully

### 2. Storage Bucket Setup

The SQL script automatically creates the storage bucket, but verify:

1. Go to Storage in Supabase dashboard
2. Confirm `hostel-images` bucket exists
3. Ensure it's set to public
4. Policies should allow:
   - Anyone to view images
   - Authenticated users to upload
   - Users to manage their own images

### 3. Super Admin Configuration

The super admin email `clonexoxo80@gmail.com` has been configured with:
- Access to view ALL hostels (not just their own)
- Full CRUD permissions on all hostels
- Special "Super Admin" badge in the dashboard

**Important**: You must first register `clonexoxo80@gmail.com` as an agent:
1. Go to `/register`
2. Use email: `clonexoxo80@gmail.com`
3. Select role: "Hostel Listing"
4. Complete registration
5. Sign in - you'll automatically have super admin privileges

### 4. User Roles

When users register, they select:
- **Student**: Can browse and search hostels
- **Agent/Hostel Lister**: Can access the dashboard to manage hostels

### 5. Routes Added

- `/dashboard` - Main dashboard (protected, requires authentication)
- `/dashboard/hostel/new` - Add new hostel
- `/dashboard/hostel/edit/:id` - Edit existing hostel
- `/signin` - Sign in page (redirects agents to dashboard)

## Usage

### For Hostel Owners/Agents:

1. **Register**: Go to `/register` and select "Hostel Listing" role
2. **Sign In**: Use `/signin` and select "Agent/Hostel Lister"
3. **Access Dashboard**: After login, you'll be redirected to `/dashboard`
4. **Add Hostel**: Click "Add New Hostel" button
5. **Fill Form**: Enter all required details:
   - Hostel name
   - Location and university
   - Price per year
   - Number of rooms available
   - Description
   - Amenities (comma-separated)
   - Contact information
   - Upload multiple images
6. **Submit**: Click "Create Hostel" to save
7. **Manage**: View, edit, or delete your hostels from the dashboard

### For Super Admin (clonexoxo80@gmail.com):

**First Time Setup:**
1. Register at `/register` with email `clonexoxo80@gmail.com`
2. Select "Hostel Listing" as role
3. Complete registration and verify email if required
4. Sign in at `/signin`

**After Setup:**
- Can see ALL hostels from all users
- Can edit or delete any hostel
- Has "Super Admin" badge displayed

## Database Schema

### hostels table
```sql
- id: UUID (primary key)
- owner_id: UUID (references auth.users)
- name: TEXT
- location: TEXT
- university: TEXT
- price: NUMERIC
- description: TEXT
- amenities: TEXT[]
- contact_phone: TEXT
- contact_email: TEXT
- rooms_available: INTEGER
- images: TEXT[]
- featured: BOOLEAN
- rating: NUMERIC
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Security

- Row Level Security (RLS) enabled
- Users can only manage their own hostels
- Super admin has override access
- Image uploads are scoped to user folders
- Authentication required for all dashboard operations

## Testing

1. Register as an agent: `/register`
2. Sign in: `/signin`
3. Add a test hostel with images
4. Edit the hostel details
5. Delete the hostel
6. Test super admin access with clonexoxo80@gmail.com

## Troubleshooting

### Images not uploading?
- Check storage bucket exists and is public
- Verify storage policies are correctly set
- Check browser console for errors

### Can't access dashboard?
- Ensure you're signed in
- Check you registered with "Agent/Hostel Lister" role
- Clear browser cache and try again

### Super admin not working?
- Verify email is exactly: clonexoxo80@gmail.com
- Check RLS policies in Supabase
- Ensure user is authenticated

## Next Steps

Consider adding:
- Booking management system
- Analytics and statistics
- Email notifications
- Payment integration
- Review management
- Bulk image upload
- Image optimization
