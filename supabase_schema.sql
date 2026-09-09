-- ==============================================================================
-- HR AssessPro: Candidate Assessments Schema for Supabase
-- Paste and run this SQL in your Supabase Dashboard > SQL Editor
-- ==============================================================================

-- 1. Create candidate_assessments table
CREATE TABLE IF NOT EXISTS public.candidate_assessments (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    target_position TEXT,
    overall_score INTEGER NOT NULL,
    overall_status TEXT NOT NULL,
    typing_data JSONB NOT NULL,
    navigation_data JSONB NOT NULL,
    data_entry_data JSONB NOT NULL,
    multitasking_data JSONB NOT NULL,
    troubleshooting_data JSONB NOT NULL,
    unfocus_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.candidate_assessments ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies to allow candidates to submit and HR to view via anon key
DROP POLICY IF EXISTS "Allow anonymous insert assessments" ON public.candidate_assessments;
CREATE POLICY "Allow anonymous insert assessments"
ON public.candidate_assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous read assessments" ON public.candidate_assessments;
CREATE POLICY "Allow anonymous read assessments"
ON public.candidate_assessments
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow anonymous update assessments" ON public.candidate_assessments;
CREATE POLICY "Allow anonymous update assessments"
ON public.candidate_assessments
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous delete assessments" ON public.candidate_assessments;
CREATE POLICY "Allow anonymous delete assessments"
ON public.candidate_assessments
FOR DELETE
TO anon, authenticated
USING (true);

-- 4. Enable Realtime (optional, allows HR dashboard to receive live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_assessments;
