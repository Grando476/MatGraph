-- Migration V16: Add is_hidden to topics table
-- Used to hide topic nodes that do not contain PDF materials in any of their lessons

ALTER TABLE public.topics 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX IF NOT EXISTS idx_topics_is_hidden ON public.topics(is_hidden);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'topics' AND column_name = 'is_blocked'
    ) THEN
        UPDATE public.topics SET is_hidden = is_blocked WHERE is_blocked = true;
        ALTER TABLE public.topics DROP COLUMN is_blocked;
    END IF;
END $$;
