-- First, let's check what columns actually exist and add missing ones
-- This migration is safe to run multiple times

-- Add user_id column if it doesn't exist (to track who created the hostel)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hostels' AND column_name='user_id') THEN
        ALTER TABLE hostels ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column';
    END IF;
END $$;

-- Add featured column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hostels' AND column_name='featured') THEN
        ALTER TABLE hostels ADD COLUMN featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added featured column';
    END IF;
END $$;

-- Add rating column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hostels' AND column_name='rating') THEN
        ALTER TABLE hostels ADD COLUMN rating NUMERIC(2,1) DEFAULT 0;
        RAISE NOTICE 'Added rating column';
    END IF;
END $$;

-- Add images column if it doesn't exist (for storing image URLs)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hostels' AND column_name='images') THEN
        ALTER TABLE hostels ADD COLUMN images TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added images column';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hostels' AND column_name='created_at') THEN
        ALTER TABLE hostels ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hostels' AND column_name='updated_at') THEN
        ALTER TABLE hostels ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'agent', 'admin'
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Enable RLS on hostels table
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;

-- Drop existing hostel policies if they exist
DROP POLICY IF EXISTS "Anyone can view hostels" ON hostels;
DROP POLICY IF EXISTS "Users can insert own hostels" ON hostels;
DROP POLICY IF EXISTS "Users can update own hostels" ON hostels;
DROP POLICY IF EXISTS "Users can delete own hostels" ON hostels;

-- Create policies for hostels
CREATE POLICY "Anyone can view hostels"
    ON hostels FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert hostels"
    ON hostels FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own hostels"
    ON hostels FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hostels"
    ON hostels FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to hostels table
DROP TRIGGER IF EXISTS update_hostels_updated_at ON hostels;
CREATE TRIGGER update_hostels_updated_at
    BEFORE UPDATE ON hostels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hostels_user_id ON hostels(user_id);
CREATE INDEX IF NOT EXISTS idx_hostels_featured ON hostels(featured);
CREATE INDEX IF NOT EXISTS idx_hostels_created_at ON hostels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update existing hostels to have default values
UPDATE hostels SET featured = false WHERE featured IS NULL;
UPDATE hostels SET rating = 0 WHERE rating IS NULL;
UPDATE hostels SET created_at = NOW() WHERE created_at IS NULL;
UPDATE hostels SET updated_at = NOW() WHERE updated_at IS NULL;

-- Create profiles for existing auth users
INSERT INTO profiles (id, email, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Add comments
COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE hostels IS 'Student hostel listings';
COMMENT ON COLUMN hostels.user_id IS 'ID of the user who created this hostel listing';
COMMENT ON COLUMN hostels.featured IS 'Whether this hostel is featured on the homepage';
COMMENT ON COLUMN hostels.rating IS 'Average rating of the hostel (0-5)';
COMMENT ON COLUMN hostels.images IS 'Array of image URLs for the hostel';

-- Show success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Run this query to verify: SELECT column_name FROM information_schema.columns WHERE table_name = ''hostels'';';
END $$;
