-- Migration V12: Task Group Test Attempts (Rejestracja każdego podejścia do egzaminu/testu)

CREATE TABLE IF NOT EXISTS public.task_group_test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_group_id UUID NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
    score_percentage NUMERIC(5, 2) NOT NULL,
    correct_count INTEGER NOT NULL,
    total_count INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tg_attempts_student_group 
    ON public.task_group_test_attempts(student_id, task_group_id);

CREATE INDEX IF NOT EXISTS idx_tg_attempts_completed_at 
    ON public.task_group_test_attempts(completed_at DESC);
