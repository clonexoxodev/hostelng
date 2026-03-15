-- ============================================
-- REVIEWS & RATINGS - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,           -- null = anonymous
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL CHECK (char_length(review_text) <= 300),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
ON public.reviews FOR SELECT USING (true);

-- Anyone can submit a review (no auth required, keeps it fast)
CREATE POLICY "Anyone can submit reviews"
ON public.reviews FOR INSERT WITH CHECK (true);

-- Super admin can manage all reviews
CREATE POLICY "Super admin full access to reviews"
ON public.reviews FOR ALL
USING ((auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'clonexoxo80@gmail.com');

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_listing_id_idx ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS reviews_agent_id_idx ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- Grants
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;

SELECT 'Reviews table created successfully' as status;
