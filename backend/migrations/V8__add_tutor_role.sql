-- Migration V8: Allow 'tutor' as a valid role in public.profiles and update trigger logic

-- 1. Update check constraint on public.profiles to include 'tutor'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'tutor', 'admin'));

-- 2. Update trigger function public.handle_new_user() to support 'tutor' safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        CASE 
            WHEN new.raw_user_meta_data->>'role' IN ('student', 'tutor', 'admin') 
            THEN new.raw_user_meta_data->>'role'
            ELSE 'student'
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$;
