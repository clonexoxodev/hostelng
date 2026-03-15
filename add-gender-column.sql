-- Add gender column to hostels table
ALTER TABLE public.hostels
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'not_specified';

-- Optional: add a check constraint to enforce valid values
ALTER TABLE public.hostels
ADD CONSTRAINT hostels_gender_check
CHECK (gender IN ('male_only', 'female_only', 'mixed', 'not_specified'));
