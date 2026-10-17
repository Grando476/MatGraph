-- Migration V11: Class Assignments (Task groups assigned to classes)

-- 1. Tabela przypisań grup zadań do klas przez korepetytorów
CREATE TABLE IF NOT EXISTS public.class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    task_group_id UUID NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_class_task_group UNIQUE (class_id, task_group_id)
);

CREATE INDEX IF NOT EXISTS idx_class_assignments_class_id ON public.class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_task_group_id ON public.class_assignments(task_group_id);

-- 2. Tabela ukończenia zadania przez ucznia (opcjonalny status)
CREATE TABLE IF NOT EXISTS public.assignment_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.class_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_assignment_student_completion UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_completions_student ON public.assignment_completions(student_id);
