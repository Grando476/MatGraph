from psycopg2.extras import RealDictCursor
from db.session import get_db_connection

class LessonService:
    @staticmethod
    def get_lesson_details(lesson_id: str):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id, topic_id, name as title, importance, sort_order, video_url, content_tex FROM public.subtopics WHERE id = %s;",
                (lesson_id,)
            )
            lesson = cur.fetchone()

            if not lesson:
                return {"error": "Lesson not found"}

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
