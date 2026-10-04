CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET search_path = public, auth, extensions;

DO $$
DECLARE
    admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
    admin_email TEXT := 'admin@edumath.pl';
    admin_password TEXT := 'admin123';
    existing_id UUID;
BEGIN
    -- 1. Check if user already exists with this email
    SELECT id INTO existing_id FROM auth.users WHERE email = admin_email;

    IF existing_id IS NOT NULL THEN
        -- User exists: update password, metadata, and confirmation
        UPDATE auth.users
        SET encrypted_password = crypt(admin_password, gen_salt('bf', 10)),
            raw_user_meta_data = '{"first_name": "Admin", "last_name": "EduMath", "role": "admin"}'::jsonb,
            raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
            email_confirmed_at = COALESCE(email_confirmed_at, timezone('utc'::text, now())),
            updated_at = timezone('utc'::text, now())
        WHERE id = existing_id;

        admin_id := existing_id;
    ELSE
        -- Insert new admin user
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
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf', 10)),
            timezone('utc'::text, now()),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"first_name": "Admin", "last_name": "EduMath", "role": "admin"}'::jsonb,
            false,
            timezone('utc'::text, now()),
            timezone('utc'::text, now()),
            '', '', '', '', '', '', '', ''
        );
    END IF;

    -- 2. Link provider identity (so Supabase Auth signInWithPassword works)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'identities'
    ) THEN
        DELETE FROM auth.identities WHERE user_id = admin_id;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'provider_id'
        ) THEN
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                provider_id,
                last_sign_in_at,
                created_at,
                updated_at
            )
            VALUES (
                admin_id,
                admin_id,
                jsonb_build_object('sub', admin_id::text, 'email', admin_email),
                'email',
                admin_id::text,
                timezone('utc'::text, now()),
                timezone('utc'::text, now()),
                timezone('utc'::text, now())
            );
        ELSE
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                last_sign_in_at,
                created_at,
                updated_at
            )
            VALUES (
                admin_id,
                admin_id,
                jsonb_build_object('sub', admin_id::text, 'email', admin_email),
                'email',
                timezone('utc'::text, now()),
                timezone('utc'::text, now()),
                timezone('utc'::text, now())
            );
        END IF;
    END IF;

    -- 3. Upsert into public.profiles (primary key is id)
    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (
        admin_id,
        'Admin',
        'EduMath',
        'admin'
    )
    ON CONFLICT (id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;

END $$;
