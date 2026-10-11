-- Migration V7: Rename video_url to pdf_path in subtopics
-- We are deprecating video URLs in favor of Supabase Storage PDF paths (bucket: edu_pdfs)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subtopics' 
          AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.subtopics RENAME COLUMN video_url TO pdf_path;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subtopics' 
          AND column_name = 'pdf_path'
    ) THEN
        ALTER TABLE public.subtopics ADD COLUMN pdf_path TEXT;
    END IF;
END $$;

-- Clear previous YouTube video URLs so they don't linger as broken PDF paths
UPDATE public.subtopics
SET pdf_path = NULL
WHERE pdf_path LIKE '%youtube%' OR pdf_path LIKE '%youtu.be%';

-- Sample demonstration PDF for initial subtopic:
UPDATE public.subtopics
SET pdf_path = 'subtopics/a1111111-0000-0000-0000-000000000001/teoria_rownania_liniowe.pdf'
WHERE id = 'a1111111-0000-0000-0000-000000000001' AND (pdf_path IS NULL OR pdf_path = '');
