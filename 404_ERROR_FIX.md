# 404 Error Fix Guide

## Error Details
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cpt1::jzn2t-1772098851 157-5c694582795a
```

This error format indicates a **Supabase API error**, not a routing error.

## Root Cause
The error occurs when the app tries to connect to Supabase but encounters an issue with:
1. Invalid or expired Supabase credentials
2. Supabase project not accessible
3. Network/CORS issues

## Quick Fixes

### Fix 1: Verify Supabase Credentials (Most Common)

1. **Check your `.env.local` file:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

2. **Get fresh credentials from Supabase:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_ANON_KEY`

3. **Update `.env.local` with new credentials**

4. **Restart dev server:**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Fix 2: Check Supabase Project Status

1. Go to your Supabase Dashboard
2. Check if your project is:
   - ✅ Active (green status)
   - ❌ Paused (needs to be resumed)
   - ❌ Deleted (need to create new project)

3. If paused, click **Resume Project**

### Fix 3: Verify Database Setup

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this to check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

3. If `hostels` table is missing, run `supabase-complete-setup.sql` again

### Fix 4: Clear Browser Cache

1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select **Empty Cache and Hard Reload**
4. Or use: Ctrl+Shift+Delete → Clear cache

### Fix 5: Check Console for Detailed Errors

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages like:
   - "Invalid API key"
   - "Project not found"
   - "CORS error"
4. Share the exact error message for specific help

## Testing Steps

### Step 1: Test Supabase Connection
Open browser console and run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
```

### Step 2: Test Auth
Try to access `/register` page:
- If it loads → Supabase is working
- If 404 error → Supabase connection issue

### Step 3: Test Without Auth
The `/list-hostel` page now has better error handling and should load even if Supabase has issues.

## Common Issues & Solutions

### Issue: "Invalid API key"
**Solution:** 
- Regenerate anon key in Supabase Dashboard
- Update `.env.local`
- Restart dev server

### Issue: "Project not found"
**Solution:**
- Verify project URL is correct
- Check project is not deleted
- Create new project if needed

### Issue: CORS Error
**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:8080/**`
   - `http://localhost:8080`
3. Set **Site URL**: `http://localhost:8080`

### Issue: Page loads but shows blank
**Solution:**
- Check browser console for JavaScript errors
- Verify all imports are correct
- Clear cache and reload

## Environment Variables Checklist

✅ **Verify these are set:**
```bash
# In your terminal
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

✅ **File location:** `.env.local` in project root

✅ **Format:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **No quotes needed** around values

✅ **No spaces** before or after `=`

## If Still Not Working

### Option 1: Temporary Bypass (Testing Only)
Comment out Supabase checks temporarily to test routing:

In `src/pages/ListHostel.tsx`, comment out the useEffect:
```typescript
// useEffect(() => {
//   ... auth check code ...
// }, [navigate]);
```

### Option 2: Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Set up new project
4. Run `supabase-complete-setup.sql`
5. Update `.env.local` with new credentials

### Option 3: Check Network Tab
1. Open Developer Tools → **Network** tab
2. Reload the page
3. Look for failed requests (red)
4. Click on failed request
5. Check **Response** tab for error details

## Success Indicators

When fixed, you should see:
- ✅ Page loads without 404 error
- ✅ Console shows: "✅ Supabase configured: { url: ... }"
- ✅ No red errors in console
- ✅ Can navigate to `/list-hostel` successfully

## Need More Help?

Share these details:
1. Full error message from browser console
2. Network tab screenshot showing failed request
3. Your Supabase project status (active/paused)
4. Output of: `echo $VITE_SUPABASE_URL`
5. Whether other pages (like `/register`) work

## Quick Test Command

Run this to verify everything:
```bash
# Check env vars
cat .env.local

# Restart dev server
npm run dev
```

Then visit: http://localhost:8080/list-hostel
