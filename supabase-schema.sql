-- Create hostels table (if it doesn't exist, otherwise alter it)
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

-- If table exists with user_id, add owner_id column (skip if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hostels' AND column_name = 'owner_id') THEN
        ALTER TABLE public.hostels ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create storage bucket for hostel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on hostels table
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all hostels
CREATE POLICY "Anyone can view hostels"
ON public.hostels FOR SELECT
USING (true);

-- Policy: Users can insert their own hostels
CREATE POLICY "Users can insert their own hostels"
ON public.hostels FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own hostels
CREATE POLICY "Users can update their own hostels"
ON public.hostels FOR UPDATE
USING (auth.uid() = owner_id);

-- Policy: Users can delete their own hostels
CREATE POLICY "Users can delete their own hostels"
ON public.hostels FOR DELETE
USING (auth.uid() = owner_id);

-- Policy: Super admin can do everything
CREATE POLICY "Super admin can do everything"
ON public.hostels
USING (
  auth.jwt() ->> 'email' = 'clonexoxo80@gmail.com'
);

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.hostels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS hostels_owner_id_idx ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS hostels_university_idx ON public.hostels(university);
CREATE INDEX IF NOT EXISTS hostels_location_idx ON public.hostels(location);
CREATE INDEX IF NOT EXISTS hostels_created_at_idx ON public.hostels(created_at DESC);
