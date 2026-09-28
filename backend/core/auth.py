import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.session import get_db_connection
from psycopg2.extras import RealDictCursor

# Supabase JWT Secret for HS256 verification
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "your-supabase-jwt-secret-key-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    FastAPI dependency to verify Supabase Bearer JWT token (HS256)
    and return authenticated user details and profile.
    """
    token = credentials.credentials
    try:
        # Decode and verify JWT
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False}  # Supabase tokens use aud="authenticated"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing user ID (sub)",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Fetch profile information from public.profiles
        profile = None
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT first_name, last_name, role, created_at FROM public.profiles WHERE id = %s;",
                (user_id,)
            )
            profile = cur.fetchone()
        except Exception as db_err:
            print("Profile fetch warning:", db_err)
        finally:
            cur.close()
            conn.close()

        first_name = profile.get("first_name") if profile else payload.get("user_metadata", {}).get("first_name", "")
        last_name = profile.get("last_name") if profile else payload.get("user_metadata", {}).get("last_name", "")
        role = profile.get("role") if profile else payload.get("user_metadata", {}).get("role", "student")

        return {
            "user_id": user_id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "user_metadata": payload.get("user_metadata", {}),
            "token": token
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
