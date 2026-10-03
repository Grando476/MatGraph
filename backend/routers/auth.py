import os
import json
import datetime
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from core.auth import get_current_user, SUPABASE_JWT_SECRET, ALGORITHM

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    role: Optional[str] = "student"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(body: LoginRequest):
    """
    Authenticate user via database and return a JWT access token.
    Compatible with Supabase JWT schema.
    """
    email = body.email.strip().lower()
    password = body.password

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            SELECT id, email, raw_user_meta_data
            FROM auth.users
            WHERE email = %s AND encrypted_password = crypt(%s, encrypted_password);
            """,
            (email, password)
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nieprawidłowy adres e-mail lub hasło."
            )

        user_id = str(user["id"])

        # Safely parse raw_user_meta_data
        raw_meta = user.get("raw_user_meta_data")
        if isinstance(raw_meta, str):
            try:
                raw_meta = json.loads(raw_meta)
            except Exception:
                raw_meta = {}
        elif not isinstance(raw_meta, dict):
            raw_meta = {}

        # Fetch profile information safely (in case public.profiles doesn't exist yet or is empty)
        first_name = ""
        last_name = ""
        role = ""
        try:
            cur.execute(
                "SELECT first_name, last_name, role FROM public.profiles WHERE id = %s;",
                (user_id,)
            )
            profile = cur.fetchone() or {}
            first_name = profile.get("first_name") or ""
            last_name = profile.get("last_name") or ""
            role = profile.get("role") or ""
        except Exception:
            conn.rollback()

        if not first_name:
            first_name = raw_meta.get("first_name", "")
        if not last_name:
            last_name = raw_meta.get("last_name", "")
        if not role:
            role = raw_meta.get("role", "student")

        payload = {
            "sub": user_id,
            "email": user["email"],
            "role": "authenticated",
            "aud": "authenticated",
            "app_metadata": {"provider": "email", "providers": ["email"]},
            "user_metadata": {
                "first_name": first_name,
                "last_name": last_name,
                "role": role
            },
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
            "iat": datetime.datetime.now(datetime.timezone.utc)
        }
        access_token = jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm=ALGORITHM)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user["email"],
                "first_name": first_name,
                "last_name": last_name,
                "role": role
            }
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd logowania: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    """
    Register a new user in the database (local dev auth mode).
    Automatically populates auth.users and public.profiles via trigger.
    """
    email = body.email.strip().lower()
    first_name = body.first_name.strip()
    last_name = body.last_name.strip()
    role = body.role if body.role in ("student", "admin") else "student"

    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hasło musi zawierać co najmniej 6 znaków."
        )

    if not first_name or not last_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imię i nazwisko są wymagane."
        )

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id FROM auth.users WHERE email = %s;", (email,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Użytkownik o podanym adresie e-mail już istnieje."
            )

        user_metadata = {
            "first_name": first_name,
            "last_name": last_name,
            "role": role
        }

        cur.execute(
            """
            INSERT INTO auth.users (
                id, instance_id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                is_super_admin, created_at, updated_at
            )
            VALUES (
                gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
                'authenticated', 'authenticated', %s, crypt(%s, gen_salt('bf', 10)),
                NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb,
                %s::jsonb, false, NOW(), NOW()
            )
            RETURNING id;
            """,
            (email, body.password, json.dumps(user_metadata))
        )
        new_user = cur.fetchone()
        conn.commit()

        return {
            "status": "success",
            "message": "Konto zostało pomyślnie utworzone.",
            "user_id": str(new_user["id"])
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd rejestracji: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Protected endpoint returning user_id and profile data for the authenticated user.
    Requires Bearer <JWT_TOKEN> in Authorization header.
    Works for both local FastAPI JWT tokens and Supabase Cloud JWT tokens.
    """
    return {
        "status": "authenticated",
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "first_name": current_user.get("first_name", ""),
        "last_name": current_user.get("last_name", ""),
        "role": current_user["role"],
        "user_metadata": current_user["user_metadata"]
    }
