-- ============================================
-- ADMIN MONITORING SYSTEM - SQL PATCHES
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure student_inquiries table exists with correct structure
CREATE TABLE IF NOT EXISTS public.student_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    move_in_date DATE,
    message TEXT,
    hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
    hostel_title TEXT NOT NULL,
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'closed')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.student_inquiries ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they exist, then recreate cleanly
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.student_inquiries;
DROP POLICY IF EXISTS "Agents can view their own inquiries" ON public.student_inquiries;
DROP POLICY IF EXISTS "Agents can update their own inquiries" ON public.student_inquiries;
DROP POLICY IF EXISTS "Super admin full access to inquiries" ON public.student_inquiries;

-- Anyone can submit
CREATE POLICY "Anyone can submit inquiries"
ON public.student_inquiries FOR INSERT
WITH CHECK (true);

-- Agents see their own
CREATE POLICY "Agents can view their own inquiries"
ON public.student_inquiries FOR SELECT
USING (auth.uid() = agent_id);

-- Agents update their own
CREATE POLICY "Agents can update their own inquiries"
ON public.student_inquiries FOR UPDATE
USING (auth.uid() = agent_id);

-- Super admin sees ALL inquiries
CREATE POLICY "Super admin full access to inquiries"
ON public.student_inquiries FOR ALL
USING ((auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com');

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS inquiries_hostel_id_idx    ON public.student_inquiries(hostel_id);
CREATE INDEX IF NOT EXISTS inquiries_agent_id_idx     ON public.student_inquiries(agent_id);
CREATE INDEX IF NOT EXISTS inquiries_status_idx       ON public.student_inquiries(status);
CREATE INDEX IF NOT EXISTS inquiries_submitted_at_idx ON public.student_inquiries(submitted_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_email_hostel_idx ON public.student_inquiries(student_email, hostel_id);

-- 5. Grants
GRANT SELECT, INSERT ON public.student_inquiries TO anon, authenticated;
GRANT UPDATE ON public.student_inquiries TO authenticated;

-- 6. Ensure reports table has super admin access
DROP POLICY IF EXISTS "Super admin full access to reports" ON public.reports;
CREATE POLICY "Super admin full access to reports"
ON public.reports FOR ALL
USING ((auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com');

SELECT 'Admin monitoring schema ready' AS status;
