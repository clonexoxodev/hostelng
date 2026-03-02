-- ============================================
-- REPORTS/FLAGS FEATURE - DATABASE SCHEMA
-- ============================================

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
    reporter_email TEXT NOT NULL,
    reporter_name TEXT,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a report
CREATE POLICY "Anyone can submit reports"
ON public.reports FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
USING (reporter_email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'email' = 'clonexoxo80@gmail.com');

-- Policy: Super admin can view all reports
CREATE POLICY "Super admin can view all reports"
ON public.reports FOR SELECT
USING (auth.jwt() ->> 'email' = 'clonexoxo80@gmail.com');

-- Policy: Super admin can update reports
CREATE POLICY "Super admin can update reports"
ON public.reports FOR UPDATE
USING (auth.jwt() ->> 'email' = 'clonexoxo80@gmail.com');

-- Policy: Super admin can delete reports
CREATE POLICY "Super admin can delete reports"
ON public.reports FOR DELETE
USING (auth.jwt() ->> 'email' = 'clonexoxo80@gmail.com');

-- Create updated_at trigger
CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS reports_hostel_id_idx ON public.reports(hostel_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reporter_email_idx ON public.reports(reporter_email);

-- Add report_count to hostels table (optional - for tracking)
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Function to increment report count
CREATE OR REPLACE FUNCTION increment_hostel_report_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.hostels
    SET report_count = report_count + 1
    WHERE id = NEW.hostel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment report count
DROP TRIGGER IF EXISTS increment_report_count ON public.reports;
CREATE TRIGGER increment_report_count
    AFTER INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION increment_hostel_report_count();

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
SELECT 'Reports table created successfully' as status;
