from psycopg2.extras import RealDictCursor
from db.session import get_db_connection

class ExerciseService:
    @staticmethod
    def get_exercises_for_group(task_group_id: str):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT name FROM public.task_groups WHERE id = %s;",
                (task_group_id,)
            )
            task_group = cur.fetchone()

            if not task_group:
                return {"error": "Task group not found"}

            cur.execute(
                "SELECT id, task_type, content, exemplary_solution FROM public.tasks WHERE task_group_id = %s ORDER BY created_at ASC;",
                (task_group_id,)
            )
            tasks = cur.fetchall()

            return {"task_group_name": task_group["name"], "tasks": tasks}
        finally:
            cur.close()
            conn.close()
