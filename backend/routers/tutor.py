import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from core.auth import get_current_user

router = APIRouter(prefix="/api/v1/tutor", tags=["Tutor Panel"])

def generate_join_code(cur) -> str:
    """Generates an 8-character unique alphanumeric join code."""
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    for _ in range(15):
        code = "".join(random.choices(alphabet, k=8))
        cur.execute("SELECT 1 FROM public.classes WHERE join_code = %s;", (code,))
        if not cur.fetchone():
            return code
    # Fallback to DB function if defined
    cur.execute("SELECT public.generate_class_join_code() AS code;")
    row = cur.fetchone()
    return row["code"]

class CreateClassRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)

@router.get("/classes")
def get_tutor_classes(current_user: dict = Depends(get_current_user)):
    """
    Returns all classes created by the logged-in tutor, along with student count and members list.
    """
    if current_user.get("role") not in ("tutor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień. Dostęp tylko dla korepetytorów i administratorów."
        )

    tutor_id = current_user.get("user_id")
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            SELECT 
                c.id,
                c.name,
                c.description,
                c.join_code,
                c.created_at,
                COUNT(cm.id) AS members_count
            FROM public.classes c
            LEFT JOIN public.class_members cm ON c.id = cm.class_id
            WHERE c.tutor_id = %s
            GROUP BY c.id
            ORDER BY c.created_at DESC;
            """,
            (tutor_id,)
        )
        classes = cur.fetchall()

        result = []
        for cls in classes:
            class_id = cls["id"]
            # Fetch member details for each class
            cur.execute(
                """
                SELECT 
                    p.id,
                    p.first_name,
                    p.last_name,
                    u.email,
                    cm.joined_at
                FROM public.class_members cm
                JOIN public.profiles p ON cm.student_id = p.id
                LEFT JOIN auth.users u ON p.id = u.id
                WHERE cm.class_id = %s
                ORDER BY cm.joined_at DESC;
                """,
                (class_id,)
            )
            members = cur.fetchall()
            student_list = []
            for m in members:
                first = m.get("first_name") or ""
                last = m.get("last_name") or ""
                full_name = f"{first} {last}".strip() or m.get("email") or "Uczeń"
                student_list.append({
                    "id": str(m["id"]),
                    "name": full_name,
                    "email": m.get("email"),
                    "joined_at": m["joined_at"].isoformat() if m.get("joined_at") else None
                })

            result.append({
                "id": str(cls["id"]),
                "name": cls["name"],
                "description": cls.get("description"),
                "join_code": cls["join_code"],
                "created_at": cls["created_at"].isoformat() if cls.get("created_at") else None,
                "members_count": int(cls["members_count"]),
                "students": student_list
            })

        return {"classes": result, "total": len(result)}
    except Exception as e:
        if "relation \"public.classes\" does not exist" in str(e):
            return {"classes": [], "total": 0}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.post("/classes")
def create_tutor_class(body: CreateClassRequest, current_user: dict = Depends(get_current_user)):
    """
    Creates a new classroom with an auto-generated unique join code.
    """
    if current_user.get("role") not in ("tutor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień. Dostęp tylko dla korepetytorów i administratorów."
        )

    tutor_id = current_user.get("user_id")
    name = body.name.strip()
    description = body.description.strip() if body.description else None

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nazwa klasy nie może być pusta."
        )

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        join_code = generate_join_code(cur)

        cur.execute(
            """
            INSERT INTO public.classes (tutor_id, name, description, join_code)
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, description, join_code, created_at;
            """,
            (tutor_id, name, description, join_code)
        )
        new_class = cur.fetchone()
        conn.commit()

        return {
            "success": True,
            "message": "Klasa została pomyślnie utworzona!",
            "class": {
                "id": str(new_class["id"]),
                "name": new_class["name"],
                "description": new_class.get("description"),
                "join_code": new_class["join_code"],
                "created_at": new_class["created_at"].isoformat() if new_class.get("created_at") else None,
                "members_count": 0,
                "students": []
            }
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas tworzenia klasy: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()
