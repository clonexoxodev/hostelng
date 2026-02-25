-- Update script for existing hostels table
-- Run this if your table already exists with owner_id column

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add contact_phone if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hostels' AND column_name = 'contact_phone') THEN
        ALTER TABLE public.hostels ADD COLUMN contact_phone TEXT;
    END IF;

    -- Add contact_email if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hostels' AND column_name = 'contact_email') THEN
        ALTER TABLE public.hostels ADD COLUMN contact_email TEXT;
    END IF;

    -- Add rooms_available if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hostels' AND column_name = 'rooms_available') THEN
        ALTER TABLE public.hostels ADD COLUMN rooms_available INTEGER DEFAULT 0;
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hostels' AND column_name = 'updated_at') THEN
        ALTER TABLE public.hostels ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Create storage bucket for hostel images (skip if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on hostels table
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view hostels" ON public.hostels;
DROP POLICY IF EXISTS "Users can insert their own hostels" ON public.hostels;
DROP POLICY IF EXISTS "Users can update their own hostels" ON public.hostels;
DROP POLICY IF EXISTS "Users can delete their own hostels" ON public.hostels;
DROP POLICY IF EXISTS "Super admin can do everything" ON public.hostels;

-- Create policies
CREATE POLICY "Anyone can view hostels"
ON public.hostels FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own hostels"
ON public.hostels FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own hostels"
ON public.hostels FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own hostels"
ON public.hostels FOR DELETE
USING (auth.uid() = owner_id);

CREATE POLICY "Super admin can do everything"
ON public.hostels
USING (
  auth.jwt() ->> 'email' = 'clonexoxo80@gmail.com'
);

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own hostel images" ON storage.objects;

-- Storage policies for hostel-images bucket
CREATE POLICY "Anyone can view hostel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hostel-images');

CREATE POLICY "Authenticated users can upload hostel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hostel-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own hostel images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hostel-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own hostel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hostel-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_updated_at ON public.hostels;

-- Create trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hostels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance (skip if exist)
CREATE INDEX IF NOT EXISTS hostels_owner_id_idx ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS hostels_university_idx ON public.hostels(university);
CREATE INDEX IF NOT EXISTS hostels_location_idx ON public.hostels(location);
CREATE INDEX IF NOT EXISTS hostels_created_at_idx ON public.hostels(created_at DESC);
