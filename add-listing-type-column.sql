-- Add listing_type column to hostels table
-- This allows hostels to be listed as either "semester" or "session" type

ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'semester' CHECK (listing_type IN ('semester', 'session'));

-- Update existing hostels to have a default listing type
UPDATE hostels 
SET listing_type = 'semester' 
WHERE listing_type IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN hostels.listing_type IS 'Type of hostel listing: semester (4-6 months) or session (9-12 months)';
