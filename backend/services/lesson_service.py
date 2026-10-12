from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from services.storage_service import StorageService

class LessonService:
    @staticmethod
    def get_lesson_details(lesson_id: str):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id, topic_id, name as title, importance, sort_order, content_tex, pdf_path FROM public.subtopics WHERE id = %s;",
                (lesson_id,)
            )
            lesson = cur.fetchone()

            if not lesson:
                return {"error": "Lesson not found"}

            # Generate presigned URL for PDF if pdf_path is specified
            pdf_path = lesson.get("pdf_path")
            if pdf_path:
                storage_res = StorageService.generate_presigned_url(pdf_path)
                lesson["pdf_url"] = storage_res.get("url")
                if storage_res.get("error"):
                    lesson["pdf_error"] = storage_res.get("error")
            else:
                lesson["pdf_url"] = None

            cur.execute(
                "SELECT id, name FROM public.task_groups WHERE subtopic_id = %s ORDER BY created_at ASC;",
                (lesson_id,)
            )
            task_groups = cur.fetchall()
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
                "SELECT id, pdf_path FROM public.subtopics WHERE id = %s;",
                (lesson_id,)
            )
            lesson = cur.fetchone()
            if not lesson:
                return {"error": "Lesson not found"}

            pdf_path = lesson.get("pdf_path")
            if not pdf_path:
                return {"error": "No PDF associated with this lesson", "pdf_url": None}

            storage_res = StorageService.generate_presigned_url(pdf_path)
            return {
                "pdf_path": pdf_path,
                "pdf_url": storage_res.get("url"),
                "error": storage_res.get("error")
            }
        finally:
            cur.close()
            conn.close()

