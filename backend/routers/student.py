from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from core.auth import get_current_user

router = APIRouter(prefix="/api/v1/student", tags=["Student Panel"])

class JoinClassRequest(BaseModel):
    code: str

@router.get("/classes")
def get_student_classes(current_user: dict = Depends(get_current_user)):
    """
    Pobiera listę klas, do których należy aktualnie zalogowany student.
    """
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wymagane uwierzytelnienie."
        )

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
                cm.joined_at,
                p.first_name AS tutor_first_name,
                p.last_name AS tutor_last_name,
                u.email AS tutor_email
            FROM public.class_members cm
            JOIN public.classes c ON cm.class_id = c.id
            JOIN public.profiles p ON c.tutor_id = p.id
            LEFT JOIN auth.users u ON p.id = u.id
            WHERE cm.student_id = %s
            ORDER BY cm.joined_at DESC;
            """,
            (user_id,)
        )
        rows = cur.fetchall()

        result = []
        for r in rows:
            tutor_first = r.get("tutor_first_name") or ""
            tutor_last = r.get("tutor_last_name") or ""
            tutor_name = f"{tutor_first} {tutor_last}".strip() or r.get("tutor_email") or "Korepetytor"

            result.append({
                "id": str(r["id"]),
                "name": r["name"],
                "description": r["description"],
                "join_code": r["join_code"],
                "joined_at": r["joined_at"].isoformat() if r.get("joined_at") else None,
                "tutor_name": tutor_name,
                "tutor_email": r.get("tutor_email")
            })

        return {"classes": result, "total": len(result)}
    except Exception as e:
        # Jeśli tabele jeszcze nie istnieją (np. przed uruchomieniem migracji)
        if "relation \"public.class_members\" does not exist" in str(e) or "classes" in str(e):
            return {"classes": [], "total": 0}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.post("/classes/join")
def join_class(body: JoinClassRequest, current_user: dict = Depends(get_current_user)):
    """
    Dołącza studenta do klasy na podstawie kodu dołączenia (np. MATH89XY).
    """
    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wymagane uwierzytelnienie."
        )

    code = body.code.strip().upper()
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wprowadź kod klasy."
        )

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # 1. Znajdź klasę po kodzie
        cur.execute(
            """
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.tutor_id,
                p.first_name AS tutor_first_name,
                p.last_name AS tutor_last_name
            FROM public.classes c
            JOIN public.profiles p ON c.tutor_id = p.id
            WHERE UPPER(c.join_code) = %s;
            """,
            (code,)
        )
        cls = cur.fetchone()
        if not cls:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nie znaleziono klasy o podanym kodzie. Upewnij się, że kod jest poprawny."
            )

        class_id = cls["id"]

        # Nie pozwól korepetytorowi dołączyć do własnej klasy jako uczeń (opcjonalne, ale zapobiega konfliktom)
        if str(cls["tutor_id"]) == str(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Jesteś nauczycielem/twórcą tej klasy."
            )

        # 2. Sprawdź, czy uczeń już jest w klasie
        cur.execute(
            """
            SELECT id FROM public.class_members 
            WHERE class_id = %s AND student_id = %s;
            """,
            (class_id, user_id)
        )
        existing = cur.fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Należysz już do tej klasy."
            )

        # 3. Dodaj ucznia do klasy
        cur.execute(
            """
            INSERT INTO public.class_members (class_id, student_id)
            VALUES (%s, %s)
            RETURNING id, joined_at;
            """,
            (class_id, user_id)
        )
        membership = cur.fetchone()
        conn.commit()

        tutor_first = cls.get("tutor_first_name") or ""
        tutor_last = cls.get("tutor_last_name") or ""
        tutor_name = f"{tutor_first} {tutor_last}".strip() or "Korepetytor"

        return {
            "success": True,
            "message": f"Pomyślnie dołączono do klasy '{cls['name']}'!",
            "class": {
                "id": str(cls["id"]),
                "name": cls["name"],
                "description": cls.get("description"),
                "tutor_name": tutor_name,
                "joined_at": membership["joined_at"].isoformat() if membership else None
            }
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        if "relation \"public.classes\" does not exist" in str(e):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Tabela klas nie została jeszcze zainicjalizowana w bazie danych. Wykonaj migrację V9."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas dołączania do klasy: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()
