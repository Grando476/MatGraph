from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from services.storage_service import StorageService

class LessonService:
    @staticmethod
    def get_lesson_details(lesson_id: str, user_id: str | None = None):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id, topic_id, name as title, importance, sort_order FROM public.subtopics WHERE id = %s;",
                (lesson_id,)
            )
            lesson = cur.fetchone()

            if not lesson:
                return {"error": "Lesson not found"}

            # Predefined PDF path in object storage: subtopics/<subtopic_id>/basic.pdf
            pdf_path = StorageService.get_subtopic_pdf_path(lesson_id)
            storage_res = StorageService.generate_presigned_url(pdf_path)
            pdf_url = storage_res.get("url")
            lesson["pdf_url"] = pdf_url
            lesson["has_pdf"] = bool(pdf_url)
            lesson["pdf_path"] = pdf_path if pdf_url else None
            if storage_res.get("error"):
                lesson["pdf_error"] = storage_res.get("error")

            if user_id:
                cur.execute(
                    """
                    SELECT 
                        tg.id, 
                        tg.name,
                        COALESCE(bool_or(ta.passed), false) AS is_passed,
                        MAX(ta.score_percentage) AS best_score
                    FROM public.task_groups tg
                    LEFT JOIN public.task_group_test_attempts ta 
                        ON tg.id = ta.task_group_id AND ta.student_id = %s
                    WHERE tg.subtopic_id = %s
                    GROUP BY tg.id, tg.name, tg.created_at
                    ORDER BY tg.created_at ASC;
                    """,
                    (user_id, lesson_id)
                )
            else:
                cur.execute(
                    """
                    SELECT id, name, false AS is_passed, null AS best_score 
                    FROM public.task_groups 
                    WHERE subtopic_id = %s 
                    ORDER BY created_at ASC;
                    """,
                    (lesson_id,)
                )
            task_groups = cur.fetchall()
            for tg in task_groups:
                if tg.get("best_score") is not None:
                    tg["best_score"] = float(tg["best_score"])
            lesson["task_groups"] = task_groups

            return {"lesson": lesson}

        finally:
            cur.close()
            conn.close()

    @staticmethod
    def get_lesson_pdf_url(lesson_id: str):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id FROM public.subtopics WHERE id = %s;",
                (lesson_id,)
            )
            lesson = cur.fetchone()
            if not lesson:
                return {"error": "Lesson not found"}

            pdf_path = StorageService.get_subtopic_pdf_path(lesson_id)
            storage_res = StorageService.generate_presigned_url(pdf_path)
            return {
                "pdf_path": pdf_path,
                "pdf_url": storage_res.get("url"),
                "error": storage_res.get("error")
            }
        finally:
            cur.close()
            conn.close()

