-- Migration V14: Remove pdf_path from subtopics
-- PDFs now follow the predefined convention: subtopics/<subtopic_id>/basic.pdf in object storage (bucket: edu_pdfs)
-- The path is not stored in the database.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subtopics' 
          AND column_name = 'pdf_path'
    ) THEN
        ALTER TABLE public.subtopics DROP COLUMN pdf_path;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subtopics' 
          AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.subtopics DROP COLUMN video_url;
    END IF;
END $$;
