-- Migration V5: Staging table for AI-generated tasks (buffer before production)

-- 1. Buffer table for AI-generated tasks
CREATE TABLE IF NOT EXISTS public.staging_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID NOT NULL,                       -- Generation session identifier (one batch per run)
    task_group_id UUID NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL DEFAULT 'MCQ',
    difficulty_level task_difficulty DEFAULT 'Easy' NOT NULL,
    content JSONB NOT NULL,                       -- {question, options, correct_index}
    exemplary_solution TEXT,
    validation JSONB,                             -- {is_perfect, feedback}
    debug_info JSONB,                             -- Full input/output prompt logs for debugging
    inspiration TEXT,                             -- Visionary inspiration used for generation
    human_validated BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_staging_tasks_batch ON public.staging_tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_staging_tasks_group ON public.staging_tasks(task_group_id);
