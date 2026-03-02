-- Add additional fields to reports table for more detailed reporting

-- Add phone number field
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reporter_phone TEXT;

-- Add additional details field
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS additional_details TEXT;

-- Add comments to explain the new columns
COMMENT ON COLUMN reports.reporter_phone IS 'Optional phone number of the person reporting';
COMMENT ON COLUMN reports.additional_details IS 'Additional information provided by reporter (e.g., dates visited, screenshots, etc.)';
