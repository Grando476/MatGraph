import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
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
    cur.execute("SELECT public.generate_class_join_code() AS code;")
    row = cur.fetchone()
    return row["code"]

class CreateClassRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    schedule: Optional[str] = Field(None, max_length=255) # np. "Wtorki i Czwartki 17:00 - 18:30"
    meet_link: Optional[str] = Field(None, max_length=500) # np. "https://meet.google.com/abc-defg-hij"

class UpdateClassRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    schedule: Optional[str] = Field(None, max_length=255)
    meet_link: Optional[str] = Field(None, max_length=500)

class AssignTaskGroupRequest(BaseModel):
    task_group_id: str
    due_date: Optional[str] = None
    note: Optional[str] = None

@router.get("/classes")
def get_tutor_classes(current_user: dict = Depends(get_current_user)):
    """
    Returns all classes created by the logged-in tutor, along with schedule, meet_link, student count, members list, and assigned task groups.
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
                c.schedule,
                c.meet_link,
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
            
            # Fetch members
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

            # Fetch assignments for this class
            cur.execute(
                """
                SELECT 
                    ca.id,
                    ca.task_group_id,
                    tg.name AS task_group_name,
                    s.name AS subtopic_name,
                    t.name AS topic_name,
                    c_chap.name AS chapter_name,
                    ca.due_date,
                    ca.note,
                    ca.created_at,
                    (SELECT COUNT(*) FROM public.tasks WHERE task_group_id = tg.id) AS task_count
                FROM public.class_assignments ca
                JOIN public.task_groups tg ON ca.task_group_id = tg.id
                JOIN public.subtopics s ON tg.subtopic_id = s.id
                JOIN public.topics t ON s.topic_id = t.id
                JOIN public.chapters c_chap ON t.chapter_id = c_chap.id
                WHERE ca.class_id = %s
                ORDER BY ca.created_at DESC;
                """,
                (class_id,)
            )
            assignments_rows = cur.fetchall()

            # Fetch test attempts stats for all assignments in this class
            cur.execute(
                """
                SELECT 
                    ca.id AS assignment_id,
                    ta.student_id,
                    COUNT(ta.id) AS total_attempts,
                    COUNT(ta.id) FILTER (WHERE ta.passed) AS success_count,
                    COUNT(ta.id) FILTER (WHERE NOT ta.passed) AS failed_count,
                    COALESCE(BOOL_OR(ta.passed), false) AS is_completed,
                    MIN(ta.completed_at) FILTER (WHERE ta.passed) AS completed_at,
                    MAX(ta.score_percentage) AS best_score
                FROM public.class_assignments ca
                JOIN public.task_group_test_attempts ta ON ca.task_group_id = ta.task_group_id
                JOIN public.class_members cm ON ca.class_id = cm.class_id AND cm.student_id = ta.student_id
                WHERE ca.class_id = %s
                GROUP BY ca.id, ta.student_id;
                """,
                (class_id,)
            )
            attempts_rows = cur.fetchall()
            attempts_map = {
                (str(c["student_id"]), str(c["assignment_id"])): {
                    "attempts_count": int(c["total_attempts"] or 0),
                    "success_count": int(c["success_count"] or 0),
                    "failed_count": int(c["failed_count"] or 0),
                    "is_completed": bool(c["is_completed"]),
                    "completed_at": c["completed_at"].isoformat() if c.get("completed_at") else None,
                    "best_score": float(c["best_score"]) if c.get("best_score") is not None else None,
                }
                for c in attempts_rows
            }

            assignment_list = []
            for a in assignments_rows:
                a_id = str(a["id"])
                comp_count = sum(
                    1 for m in members 
                    if attempts_map.get((str(m["id"]), a_id), {}).get("is_completed", False)
                )
                assignment_list.append({
                    "id": a_id,
                    "task_group_id": str(a["task_group_id"]),
                    "task_group_name": a["task_group_name"],
                    "subtopic_name": a["subtopic_name"],
                    "topic_name": a["topic_name"],
                    "chapter_name": a["chapter_name"],
                    "task_count": a["task_count"],
                    "due_date": a["due_date"].isoformat() if a.get("due_date") else None,
                    "note": a.get("note"),
                    "created_at": a["created_at"].isoformat() if a.get("created_at") else None,
                    "completed_count": comp_count,
                    "total_students": len(members),
                })

            student_list = []
            for m in members:
                first = m.get("first_name") or ""
                last = m.get("last_name") or ""
                full_name = f"{first} {last}".strip() or m.get("email") or "Uczeń"
                s_id = str(m["id"])

                # Check each assignment's completion status for this student
                student_assignments = []
                for a in assignment_list:
                    stats = attempts_map.get((s_id, a["id"]), {
                        "attempts_count": 0,
                        "success_count": 0,
                        "failed_count": 0,
                        "is_completed": False,
                        "completed_at": None,
                        "best_score": None,
                    })
                    student_assignments.append({
                        "assignment_id": a["id"],
                        "task_group_id": a["task_group_id"],
                        "task_group_name": a["task_group_name"],
                        "topic_name": a.get("topic_name"),
                        "subtopic_name": a.get("subtopic_name"),
                        "due_date": a.get("due_date"),
                        "is_completed": stats["is_completed"],
                        "completed_at": stats["completed_at"],
                        "attempts_count": stats["attempts_count"],
                        "success_count": stats["success_count"],
                        "failed_count": stats["failed_count"],
                        "best_score": stats["best_score"],
                    })

                completed_count = sum(1 for sa in student_assignments if sa["is_completed"])
                student_list.append({
                    "id": s_id,
                    "name": full_name,
                    "email": m.get("email"),
                    "joined_at": m["joined_at"].isoformat() if m.get("joined_at") else None,
                    "completed_assignments_count": completed_count,
                    "total_assignments_count": len(assignment_list),
                    "assignments_status": student_assignments
                })

            result.append({
                "id": str(cls["id"]),
                "name": cls["name"],
                "description": cls.get("description"),
                "schedule": cls.get("schedule"),
                "meet_link": cls.get("meet_link"),
                "join_code": cls["join_code"],
                "created_at": cls["created_at"].isoformat() if cls.get("created_at") else None,
                "members_count": int(cls["members_count"]),
                "students": student_list,
                "assignments": assignment_list
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
    Creates a new classroom with schedule, meet_link, and an auto-generated unique join code.
    """
    if current_user.get("role") not in ("tutor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień. Dostęp tylko dla korepetytorów i administratorów."
        )

    tutor_id = current_user.get("user_id")
    name = body.name.strip()
    description = body.description.strip() if body.description else None
    schedule = body.schedule.strip() if body.schedule else None
    meet_link = body.meet_link.strip() if body.meet_link else None

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
            INSERT INTO public.classes (tutor_id, name, description, schedule, meet_link, join_code)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, name, description, schedule, meet_link, join_code, created_at;
            """,
            (tutor_id, name, description, schedule, meet_link, join_code)
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
                "schedule": new_class.get("schedule"),
                "meet_link": new_class.get("meet_link"),
                "join_code": new_class["join_code"],
                "created_at": new_class["created_at"].isoformat() if new_class.get("created_at") else None,
                "members_count": 0,
                "students": [],
                "assignments": []
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

@router.put("/classes/{class_id}")
def update_tutor_class(class_id: str, body: UpdateClassRequest, current_user: dict = Depends(get_current_user)):
    """
    Updates classroom details (name, description, schedule, meet_link).
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
        cur.execute("SELECT id FROM public.classes WHERE id = %s AND tutor_id = %s;", (class_id, tutor_id))
        cls = cur.fetchone()
        if not cls:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Klasa nie istnieje lub brak uprawnień.")

        updates = []
        params = []
        if body.name is not None:
            name_val = body.name.strip()
            if not name_val:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nazwa klasy nie może być pusta.")
            updates.append("name = %s")
            params.append(name_val)

        if body.description is not None:
            updates.append("description = %s")
            params.append(body.description.strip() or None)

        if body.schedule is not None:
            updates.append("schedule = %s")
            params.append(body.schedule.strip() or None)

        if body.meet_link is not None:
            updates.append("meet_link = %s")
            params.append(body.meet_link.strip() or None)

        if not updates:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brak pól do zaktualizowania.")

        updates.append("updated_at = timezone('utc'::text, now())")
        query = f"UPDATE public.classes SET {', '.join(updates)} WHERE id = %s RETURNING id, name, description, schedule, meet_link, join_code, created_at;"
        params.append(class_id)

        cur.execute(query, tuple(params))
        updated_class = cur.fetchone()
        conn.commit()

        return {
            "success": True,
            "message": "Klasa została pomyślnie zaktualizowana!",
            "class": {
                "id": str(updated_class["id"]),
                "name": updated_class["name"],
                "description": updated_class.get("description"),
                "schedule": updated_class.get("schedule"),
                "meet_link": updated_class.get("meet_link"),
                "join_code": updated_class["join_code"],
                "created_at": updated_class["created_at"].isoformat() if updated_class.get("created_at") else None,
            }
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Błąd podczas aktualizacji klasy: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()

@router.get("/task-groups")
@router.get("/available-task-groups")
def get_available_task_groups(current_user: dict = Depends(get_current_user)):
    """
    Returns all task groups grouped with chapter, topic and subtopic context for assigning.
    """
    if current_user.get("role") not in ("tutor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień."
        )

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            SELECT 
                tg.id,
                tg.name AS name,
                s.id AS subtopic_id,
                s.name AS subtopic_name,
                t.id AS topic_id,
                t.name AS topic_name,
                c.id AS chapter_id,
                c.name AS chapter_name,
                (SELECT COUNT(*) FROM public.tasks WHERE task_group_id = tg.id) AS task_count
            FROM public.task_groups tg
            JOIN public.subtopics s ON tg.subtopic_id = s.id
            JOIN public.topics t ON s.topic_id = t.id
            JOIN public.chapters c ON t.chapter_id = c.id
            ORDER BY c.name, t.name, s.sort_order, tg.name;
            """
        )
        rows = cur.fetchall()
        result = [
            {
                "id": str(r["id"]),
                "name": r["name"],
                "subtopic_id": str(r["subtopic_id"]),
                "subtopic_name": r["subtopic_name"],
                "topic_id": str(r["topic_id"]),
                "topic_name": r["topic_name"],
                "chapter_id": str(r["chapter_id"]),
                "chapter_name": r["chapter_name"],
                "task_count": r["task_count"]
            }
            for r in rows
        ]
        return {"task_groups": result, "total": len(result)}
    finally:
        cur.close()
        conn.close()

@router.post("/classes/{class_id}/assignments")
def assign_task_group_to_class(class_id: str, body: AssignTaskGroupRequest, current_user: dict = Depends(get_current_user)):
    """
    Assigns a task group to an entire class.
    """
    if current_user.get("role") not in ("tutor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień. Dostęp tylko dla korepetytorów i administratorów."
        )

    tutor_id = current_user.get("user_id")
    task_group_id = body.task_group_id.strip()
    note = body.note.strip() if body.note else None
    due_date = body.due_date.strip() if body.due_date else None

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Check that class belongs to tutor
        cur.execute("SELECT id, name FROM public.classes WHERE id = %s AND tutor_id = %s;", (class_id, tutor_id))
        cls = cur.fetchone()
        if not cls:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Klasa nie istnieje lub brak uprawnień.")

        # Check task group exists
        cur.execute("SELECT id, name FROM public.task_groups WHERE id = %s;", (task_group_id,))
        tg = cur.fetchone()
        if not tg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono grupy zadań.")

        # Check if already assigned
        cur.execute("SELECT id FROM public.class_assignments WHERE class_id = %s AND task_group_id = %s;", (class_id, task_group_id))
        if cur.fetchone():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ta grupa zadań jest już przypisana do tej klasy.")

        cur.execute(
            """
            INSERT INTO public.class_assignments (class_id, task_group_id, due_date, note)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at;
            """,
            (class_id, task_group_id, due_date, note)
        )
        new_assignment = cur.fetchone()
        conn.commit()

        return {
            "success": True,
            "message": f"Pomyślnie przypisano grupę zadań '{tg['name']}' do klasy '{cls['name']}'!",
            "assignment": {
                "id": str(new_assignment["id"]),
                "class_id": class_id,
                "task_group_id": task_group_id,
                "task_group_name": tg["name"],
                "due_date": due_date,
                "note": note,
                "created_at": new_assignment["created_at"].isoformat() if new_assignment.get("created_at") else None
            }
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: str, current_user: dict = Depends(get_current_user)):
    """
    Deletes an assigned task group from a class.
    """
    if current_user.get("role") not in ("tutor", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Brak uprawnień."
        )

    tutor_id = current_user.get("user_id")
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            SELECT ca.id 
            FROM public.class_assignments ca
            JOIN public.classes c ON ca.class_id = c.id
            WHERE ca.id = %s AND c.tutor_id = %s;
            """,
            (assignment_id, tutor_id)
        )
        if not cur.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Przypisanie nie istnieje lub brak uprawnień.")

        cur.execute("DELETE FROM public.class_assignments WHERE id = %s;", (assignment_id,))
        conn.commit()
        return {"success": True, "message": "Pomyślnie usunięto zadanie z klasy."}
    finally:
        cur.close()
        conn.close()
