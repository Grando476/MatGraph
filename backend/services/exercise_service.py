import json
from typing import Optional
from psycopg2.extras import RealDictCursor
from db.session import get_db_connection

class ExerciseService:
    @staticmethod
    def get_exercises_for_group(task_group_id: str, user_id: Optional[str] = None):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id, name FROM public.task_groups WHERE id = %s;",
                (task_group_id,)
            )
            task_group = cur.fetchone()

            if not task_group:
                return {"error": "Task group not found"}

            cur.execute(
                """
                SELECT id, task_type, content, difficulty_level, exemplary_solution 
                FROM public.tasks 
                WHERE task_group_id = %s 
                ORDER BY created_at ASC;
                """,
                (task_group_id,)
            )
            tasks = cur.fetchall()

            # Sanitize tasks for client to prevent exposing true answers before submission
            for t in tasks:
                t["difficulty_level"] = str(t.get("difficulty_level") or "Medium")
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

            # Fetch attempt statistics and history if user is authenticated
            attempts_stats = {
                "attempts_count": 0,
                "failed_attempts_count": 0,
                "is_passed": False,
                "best_score": None,
                "history": []
            }

            if user_id:
                cur.execute(
                    """
                    SELECT 
                        COUNT(*) as total_attempts,
                        COUNT(*) FILTER (WHERE NOT passed) as failed_attempts,
                        COALESCE(BOOL_OR(passed), false) as is_passed,
                        MAX(score_percentage) as best_score
                    FROM public.task_group_test_attempts
                    WHERE student_id = %s AND task_group_id = %s;
                    """,
                    (user_id, task_group_id)
                )
                stats_row = cur.fetchone()
                if stats_row:
                    attempts_stats["attempts_count"] = stats_row["total_attempts"] or 0
                    attempts_stats["failed_attempts_count"] = stats_row["failed_attempts"] or 0
                    attempts_stats["is_passed"] = bool(stats_row["is_passed"])
                    attempts_stats["best_score"] = float(stats_row["best_score"]) if stats_row["best_score"] is not None else None

                cur.execute(
                    """
                    SELECT id, score_percentage, correct_count, total_count, passed, completed_at
                    FROM public.task_group_test_attempts
                    WHERE student_id = %s AND task_group_id = %s
                    ORDER BY completed_at DESC
                    LIMIT 20;
                    """,
                    (user_id, task_group_id)
                )
                history_rows = cur.fetchall()
                attempts_stats["history"] = [
                    {
                        "id": str(h["id"]),
                        "score_percentage": float(h["score_percentage"]),
                        "correct_count": h["correct_count"],
                        "total_count": h["total_count"],
                        "passed": h["passed"],
                        "completed_at": h["completed_at"].isoformat() if h.get("completed_at") else None
                    }
                    for h in history_rows
                ]

            return {
                "task_group_id": str(task_group["id"]),
                "task_group_name": task_group["name"],
                "tasks": tasks,
                "total_tasks": len(tasks),
                **attempts_stats
            }
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def verify_exercise(task_id: str, answers: any):
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

                answers_dict = answers if isinstance(answers, dict) else {}

                for stmt in statements:
                    stmt_id = stmt.get("id")
                    user_val = answers_dict.get(str(stmt_id))
                    if user_val is None:
                        user_val = answers_dict.get(stmt_id)

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
                user_opt = answers.get("selected_option") if isinstance(answers, dict) else answers
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
                user_ans = str(answers.get("user_answer", "") if isinstance(answers, dict) else answers).strip()
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

    @staticmethod
    def submit_test(task_group_id: str, user_id: str, answers: dict):
        """
        Weryfikuje zestaw odpowiedzi z egzaminu dla grupy zadań,
        wylicza procent i zapisuje podejście do public.task_group_test_attempts.
        """
        if not answers:
            return {"error": "Brak odpowiedzi do sprawdzenia"}

        task_results = {}
        correct_count = 0
        total_count = len(answers)

        for task_id, ans in answers.items():
            result = ExerciseService.verify_exercise(task_id, ans)
            is_corr = bool(result.get("is_correct"))
            if is_corr:
                correct_count += 1
            task_results[task_id] = result

        score_percentage = round((correct_count / total_count) * 100, 2) if total_count > 0 else 0.0
        passed = (score_percentage >= 80.0)

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                """
                INSERT INTO public.task_group_test_attempts 
                    (student_id, task_group_id, score_percentage, correct_count, total_count, passed)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, completed_at;
                """,
                (user_id, task_group_id, score_percentage, correct_count, total_count, passed)
            )
            attempt_row = cur.fetchone()
            conn.commit()

            # Pobierz zaktualizowane statystyki
            cur.execute(
                """
                SELECT 
                    COUNT(*) as total_attempts,
                    COUNT(*) FILTER (WHERE NOT passed) as failed_attempts,
                    COALESCE(BOOL_OR(passed), false) as is_passed,
                    MAX(score_percentage) as best_score
                FROM public.task_group_test_attempts
                WHERE student_id = %s AND task_group_id = %s;
                """,
                (user_id, task_group_id)
            )
            stats_row = cur.fetchone()

            return {
                "attempt_id": str(attempt_row["id"]),
                "completed_at": attempt_row["completed_at"].isoformat() if attempt_row.get("completed_at") else None,
                "passed": passed,
                "score_percentage": score_percentage,
                "correct_count": correct_count,
                "total_count": total_count,
                "attempts_count": stats_row["total_attempts"] or 0,
                "failed_attempts_count": stats_row["failed_attempts"] or 0,
                "is_passed": bool(stats_row["is_passed"]),
                "best_score": float(stats_row["best_score"]) if stats_row["best_score"] is not None else score_percentage,
                "task_results": task_results
            }
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()

