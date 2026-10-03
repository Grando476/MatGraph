-- Migration V4: Separate first_name and last_name, drop full_name, restrict roles to ('student', 'admin'), and seed default admin account

-- 1. Enable pgcrypto extension for bcrypt hashing (crypt / gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add columns to auth.users if running on local mock auth schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS aud character varying(255) DEFAULT 'authenticated';
        ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role character varying(255) DEFAULT 'authenticated';
    END IF;
END $$;

-- 3. Add first_name and last_name columns to public.profiles, drop redundant full_name
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- 4. Update role constraint to allow only 'student' and 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'admin'));

-- 5. Update trigger function to handle first_name, last_name and role
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
        COALESCE(new.raw_user_meta_data->>'role', 'student')
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$;

-- 6. Insert default admin account into auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    phone_change,
    phone_change_token,
    email_change_token_current,
    reauthentication_token
)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@edumath.pl',
    crypt('admin123', gen_salt('bf', 10)),
    timezone('utc'::text, now()),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Admin", "last_name": "EduMath", "role": "admin"}'::jsonb,
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
)
ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, timezone('utc'::text, now()));

-- 7. Ensure profile exists for the admin account
INSERT INTO public.profiles (id, first_name, last_name, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Admin',
    'EduMath',
    'admin'
)
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;
