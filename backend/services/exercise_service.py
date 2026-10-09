import json
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

            # Sanitize tasks for client to prevent exposing true answers before submission
            for t in tasks:
                content = t.get("content")
                if isinstance(content, str):
                    content = json.loads(content)
                    t["content"] = content

                if t.get("task_type") == "TRUE_FALSE" and isinstance(content, dict):
                    stmts = content.get("statements", [])
                    content["statements"] = [
                        {"id": s.get("id"), "text": s.get("text")}
                        for s in stmts
                    ]

            return {"task_group_name": task_group["name"], "tasks": tasks}
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def verify_exercise(task_id: str, answers: dict):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id, task_type, content, exemplary_solution FROM public.tasks WHERE id = %s;",
                (task_id,)
            )
            task = cur.fetchone()

            if not task:
                return {"error": "Task not found"}

            task_type = task["task_type"]
            content = task["content"]
            if isinstance(content, str):
                content = json.loads(content)

            if task_type == "TRUE_FALSE":
                statements = content.get("statements", [])
                statement_results = []
                all_correct = True

                for stmt in statements:
                    stmt_id = stmt.get("id")
                    user_val = answers.get(str(stmt_id))
                    if user_val is None:
                        user_val = answers.get(stmt_id)

                    expected_val = bool(stmt.get("correct"))
                    is_statement_correct = (user_val is not None) and (bool(user_val) == expected_val)

                    if not is_statement_correct:
                        all_correct = False

                    statement_results.append({
                        "id": stmt_id,
                        "text": stmt.get("text"),
                        "user_answer": user_val,
                        "correct_answer": expected_val,
                        "is_correct": is_statement_correct
                    })

                return {
                    "task_id": task_id,
                    "task_type": "TRUE_FALSE",
                    "is_correct": all_correct,
                    "statement_results": statement_results,
                    "exemplary_solution": task["exemplary_solution"]
                }

            elif task_type in ("MCQ", "single_choice"):
                correct_idx = content.get("correct_index")
                user_opt = answers.get("selected_option")
                is_correct = (user_opt == correct_idx)
                return {
                    "task_id": task_id,
                    "task_type": task_type,
                    "is_correct": is_correct,
                    "correct_option": correct_idx,
                    "exemplary_solution": task["exemplary_solution"]
                }

            elif task_type == "OPEN":
                correct_ans = str(content.get("correct_answer", "")).strip()
                user_ans = str(answers.get("user_answer", "")).strip()
                is_correct = (user_ans.lower() == correct_ans.lower())
                return {
                    "task_id": task_id,
                    "task_type": "OPEN",
                    "is_correct": is_correct,
                    "correct_answer": correct_ans,
                    "exemplary_solution": task["exemplary_solution"]
                }

            return {"error": f"Unsupported task type: {task_type}"}
        finally:
            cur.close()
            conn.close()
