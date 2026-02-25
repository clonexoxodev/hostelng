# Registration Button Not Working - Debug Guide

## Steps to Debug

### 1. Check Browser Console
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Try to register again
4. Look for these messages:

**Expected messages:**
```
✅ Supabase configured: { url: "https://..." }
Form submitted with: { email: "...", fullName: "...", phone: "...", role: "..." }
Attempting to sign up...
Signup response: { data: {...}, error: null }
Signup successful!
```

**If you see errors:**
- Note the exact error message
- Check what step failed

### 2. Common Issues & Solutions

#### Issue: "Invalid API key" or "Project not found"
**Solution:** Check your Supabase credentials
1. Go to Supabase Dashboard → Settings → API
2. Copy the **Project URL** and **anon public** key
3. Update `.env.local`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
4. Restart dev server: `npm run dev`

#### Issue: "Email confirmations are required"
**Solution:** Disable email confirmation (for testing)
1. Go to Supabase Dashboard → Authentication → Providers
2. Click on **Email** provider
3. Toggle OFF "Confirm email"
4. Save changes
5. Try registering again

#### Issue: Button does nothing, no console logs
**Solution:** Check if JavaScript is running
1. Open Console
2. Type: `console.log('test')`
3. If nothing appears, refresh the page
4. Clear browser cache (Ctrl+Shift+Delete)

#### Issue: "Password should be at least 6 characters"
**Solution:** Use a longer password
- Minimum 6 characters required
- Try: `password123`

#### Issue: Phone number validation error
**Solution:** Use correct format
- Must be 10-15 digits
- Example: `08012345678`
- No spaces or special characters

#### Issue: Role not selected
**Solution:** Click one of the radio buttons
- Select either "Student" or "Hostel Listing"
- The button won't work without selecting a role

### 3. Test Registration Step by Step

Try this test registration:
1. **Role**: Select "Hostel Listing"
2. **Full Name**: `Test User`
3. **Phone**: `08012345678`
4. **Email**: `test@example.com`
5. **Password**: `password123`
6. **Confirm Password**: `password123`
7. Click "Create account"

### 4. Check Network Tab

1. Open Developer Tools → **Network** tab
2. Try to register
3. Look for a request to `supabase.co`
4. Click on it to see:
   - **Status**: Should be 200 (success) or 400 (error)
   - **Response**: Shows the error message if failed

### 5. Verify Supabase Setup

Check if your database is set up:
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query:
```sql
SELECT * FROM auth.users LIMIT 1;
```
3. Should return empty result (no error)

Check if storage bucket exists:
1. Go to **Storage** in Supabase
2. Look for `hostel-images` bucket
3. Should be marked as **Public**

### 6. Test Supabase Connection

Add this to your Register page temporarily (after imports):
```typescript
// Test connection on page load
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Supabase connection test:', { 
    connected: !error, 
    error: error?.message 
  });
});
```

### 7. Check for JavaScript Errors

Look in Console for any red error messages:
- `Uncaught TypeError...`
- `Cannot read property...`
- `Module not found...`

If you see any, share the full error message.

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# Stop the dev server (Ctrl+C)
# Clear node modules cache
npm run dev
```

### Fix 2: Check Environment Variables
```bash
# In your terminal
echo $VITE_SUPABASE_URL
# Should show your Supabase URL
```

### Fix 3: Disable Email Confirmation
In Supabase Dashboard:
1. Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle OFF
4. Save

### Fix 4: Check Supabase Auth Settings
1. Go to Authentication → URL Configuration
2. **Site URL**: `http://localhost:8080`
3. **Redirect URLs**: Add `http://localhost:8080/**`

## What to Share for Help

If still not working, share:
1. ✅ Console error messages (screenshot)
2. ✅ Network tab response (screenshot)
3. ✅ Supabase project URL (from .env.local)
4. ✅ What happens when you click the button (nothing? loading? error?)

## Expected Behavior

When working correctly:
1. Click "Create account"
2. Button shows "Creating…"
3. After 1-2 seconds:
   - Success: Green message "Registration successful. Check your email..."
   - Error: Red message with specific error

## Test with Super Admin Email

Try registering with:
- **Email**: `clonexoxo80@gmail.com`
- **Role**: "Hostel Listing"
- Fill other fields
- This should work and give you super admin access
