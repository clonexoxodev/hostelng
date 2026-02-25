-- ============================================
-- COMPLETE HOSTELNG DATABASE SETUP
-- Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE HOSTELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hostels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    university TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    rooms_available INTEGER NOT NULL DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. CREATE STORAGE BUCKET FOR HOSTEL IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES FOR HOSTELS TABLE
-- ============================================

-- Policy: Anyone can view all hostels (public read access)
CREATE POLICY "Anyone can view hostels"
ON public.hostels FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own hostels
CREATE POLICY "Users can insert their own hostels"
ON public.hostels FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update only their own hostels
CREATE POLICY "Users can update their own hostels"
ON public.hostels FOR UPDATE
USING (auth.uid() = owner_id);

-- Policy: Users can delete only their own hostels
CREATE POLICY "Users can delete their own hostels"
ON public.hostels FOR DELETE
USING (auth.uid() = owner_id);

-- Policy: Super admin (clonexoxo80@gmail.com) can do everything
CREATE POLICY "Super admin full access"
ON public.hostels
FOR ALL
USING (
  (auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com'
);

-- ============================================
-- 5. CREATE STORAGE POLICIES FOR IMAGES
-- ============================================

-- Policy: Anyone can view hostel images (public read)
CREATE POLICY "Anyone can view hostel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hostel-images');

-- Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload hostel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hostel-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own hostel images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hostel-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own hostel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hostel-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 6. CREATE TRIGGER FOR UPDATED_AT
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function before update
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hostels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS hostels_owner_id_idx ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS hostels_university_idx ON public.hostels(university);
CREATE INDEX IF NOT EXISTS hostels_location_idx ON public.hostels(location);
CREATE INDEX IF NOT EXISTS hostels_featured_idx ON public.hostels(featured);
CREATE INDEX IF NOT EXISTS hostels_created_at_idx ON public.hostels(created_at DESC);
CREATE INDEX IF NOT EXISTS hostels_price_idx ON public.hostels(price);

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on hostels table
GRANT SELECT ON public.hostels TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hostels TO authenticated;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify the setup
SELECT 
    'Hostels table created' as status,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'hostels';

SELECT 
    'Storage bucket created' as status,
    COUNT(*) as bucket_count
FROM storage.buckets 
WHERE id = 'hostel-images';

SELECT 
    'RLS policies created' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'hostels';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Super admin email: clonexoxo80@gmail.com
-- 2. Storage bucket: hostel-images (public)
-- 3. All users can view hostels
-- 4. Only authenticated users can create/edit/delete their own hostels
-- 5. Super admin can manage all hostels
-- 6. Images are stored in user-specific folders
-- ============================================
