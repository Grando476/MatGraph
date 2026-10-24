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
                c.schedule,
                c.meet_link,
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
                "schedule": r.get("schedule"),
                "meet_link": r.get("meet_link"),
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

@router.get("/assignments")
def get_student_assignments(current_user: dict = Depends(get_current_user)):
    """
    Pobiera listę grup zadań zadanych klasom, do których należy uczeń.
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
                ca.id,
                ca.class_id,
                c.name AS class_name,
                ca.task_group_id,
                tg.name AS task_group_name,
                s.name AS subtopic_name,
                t.name AS topic_name,
                ch.name AS chapter_name,
                ca.due_date,
                ca.note,
                ca.created_at,
                p.first_name AS tutor_first_name,
                p.last_name AS tutor_last_name,
                u.email AS tutor_email,
                (SELECT COUNT(*) FROM public.tasks WHERE task_group_id = tg.id) AS task_count,
                COALESCE(BOOL_OR(ta.passed), false) AS is_completed,
                COUNT(ta.id) AS attempts_count,
                COUNT(ta.id) FILTER (WHERE ta.passed) AS success_count,
                COUNT(ta.id) FILTER (WHERE NOT ta.passed) AS failed_count,
                MAX(ta.score_percentage) AS best_score,
                MIN(ta.completed_at) FILTER (WHERE ta.passed) AS completed_at
            FROM public.class_assignments ca
            JOIN public.classes c ON ca.class_id = c.id
            JOIN public.class_members cm ON c.id = cm.class_id
            JOIN public.task_groups tg ON ca.task_group_id = tg.id
            JOIN public.subtopics s ON tg.subtopic_id = s.id
            JOIN public.topics t ON s.topic_id = t.id
            JOIN public.chapters ch ON t.chapter_id = ch.id
            JOIN public.profiles p ON c.tutor_id = p.id
            LEFT JOIN auth.users u ON p.id = u.id
            LEFT JOIN public.task_group_test_attempts ta 
                ON ta.task_group_id = ca.task_group_id AND ta.student_id = cm.student_id
            WHERE cm.student_id = %s
            GROUP BY 
                ca.id, ca.class_id, c.name, ca.task_group_id, tg.name, s.name, t.name, ch.name,
                ca.due_date, ca.note, ca.created_at, p.first_name, p.last_name, u.email, tg.id
            ORDER BY ca.created_at DESC;
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
                "class_id": str(r["class_id"]),
                "class_name": r["class_name"],
                "task_group_id": str(r["task_group_id"]),
                "task_group_name": r["task_group_name"],
                "subtopic_name": r["subtopic_name"],
                "topic_name": r["topic_name"],
                "chapter_name": r["chapter_name"],
                "task_count": r["task_count"],
                "due_date": r["due_date"].isoformat() if r.get("due_date") else None,
                "note": r.get("note"),
                "tutor_name": tutor_name,
                "is_completed": bool(r.get("is_completed")),
                "completed_at": r["completed_at"].isoformat() if r.get("completed_at") else None,
                "attempts_count": int(r.get("attempts_count") or 0),
                "success_count": int(r.get("success_count") or 0),
                "failed_count": int(r.get("failed_count") or 0),
                "best_score": float(r["best_score"]) if r.get("best_score") is not None else None,
                "created_at": r["created_at"].isoformat() if r.get("created_at") else None,
            })

        return {"assignments": result, "total": len(result)}
    except Exception as e:
        if "relation \"public.class_assignments\" does not exist" in str(e):
            return {"assignments": [], "total": 0}
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.post("/assignments/{assignment_id}/toggle-complete")
def toggle_assignment_completion(assignment_id: str, current_user: dict = Depends(get_current_user)):
    """
    Zwraca aktualny stan zaliczenia zadania (zaliczenie następuje automatycznie po zdaniu testu).
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
            SELECT COALESCE(BOOL_OR(ta.passed), false) AS is_completed
            FROM public.class_assignments ca
            LEFT JOIN public.task_group_test_attempts ta 
                ON ta.task_group_id = ca.task_group_id AND ta.student_id = %s
            WHERE ca.id = %s;
            """,
            (user_id, assignment_id)
        )
        row = cur.fetchone()
        is_completed = bool(row["is_completed"]) if row else False
        return {
            "is_completed": is_completed,
            "message": "Zadanie jest zaliczane automatycznie po zdaniu testu grupy (min. 80%)."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

