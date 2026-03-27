-- Run this in your Supabase SQL Editor
-- Adds the "Name or Business Name" field to the hostels table

ALTER TABLE hostels
  ADD COLUMN IF NOT EXISTS contact_name TEXT;
