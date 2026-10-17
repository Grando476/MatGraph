-- Migration V9: Classes and Class Members (Classrooms connecting tutors and students)

-- 1. Tabela klas (grup) stworzonych przez korepetytora
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    join_code VARCHAR(8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_classes_join_code UNIQUE (join_code),
    CONSTRAINT chk_classes_join_code_format CHECK (join_code ~ '^[A-Z0-9]{6,8}$')
);

-- Indeksy dla tabeli klas
CREATE INDEX IF NOT EXISTS idx_classes_tutor_id ON public.classes(tutor_id);
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON public.classes(join_code);

-- 2. Tabela łącząca: przynależność uczniów do klas
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_class_members_class_student UNIQUE (class_id, student_id)
);

-- Indeksy dla tabeli powiązań uczniów z klasami
CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON public.class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_student_id ON public.class_members(student_id);

-- 3. Funkcja pomocnicza do generowania unikalnego kodu dołączenia (np. "MATH89XY")
CREATE OR REPLACE FUNCTION public.generate_class_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- bez mylących znaków O, 0, I, 1
    result TEXT := '';
    i INT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;

        SELECT EXISTS(SELECT 1 FROM public.classes WHERE join_code = result) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;

    RETURN result;
END;
$$;
