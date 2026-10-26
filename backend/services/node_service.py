from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from schemas.node import NodePosition
from typing import List
from services.storage_service import StorageService

class NodeService:
    @staticmethod
    def get_all_nodes_and_edges(user_id: str | None = None):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Fetch nodes (topics) with task groups progress
            if user_id:
                cur.execute("""
                    SELECT 
                        t.id, 
                        t.name, 
                        t.ui_x, 
                        t.ui_y, 
                        COUNT(DISTINCT s.id) as subtasks_count,
                        COUNT(DISTINCT tg.id) as total_task_groups,
                        COUNT(DISTINCT CASE WHEN ta.passed = true THEN tg.id END) as passed_task_groups
                    FROM public.topics t
                    LEFT JOIN public.subtopics s ON t.id = s.topic_id
                    LEFT JOIN public.task_groups tg ON s.id = tg.subtopic_id
                    LEFT JOIN public.task_group_test_attempts ta 
                        ON tg.id = ta.task_group_id AND ta.student_id = %s
                    GROUP BY t.id, t.name, t.ui_x, t.ui_y;
                """, (user_id,))
            else:
                cur.execute("""
                    SELECT 
                        t.id, 
                        t.name, 
                        t.ui_x, 
                        t.ui_y, 
                        COUNT(DISTINCT s.id) as subtasks_count,
                        COUNT(DISTINCT tg.id) as total_task_groups,
                        0 as passed_task_groups
                    FROM public.topics t
                    LEFT JOIN public.subtopics s ON t.id = s.topic_id
                    LEFT JOIN public.task_groups tg ON s.id = tg.subtopic_id
                    GROUP BY t.id, t.name, t.ui_x, t.ui_y;
                """)
            nodes = cur.fetchall()

            # Fetch edges (topic_edges)
            cur.execute("SELECT parent_id as source, child_id as target FROM public.topic_edges;")
            edges = cur.fetchall()

            return {"nodes": nodes, "edges": edges}
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def get_lessons_for_node(node_id: str):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "SELECT id, name as title, importance FROM public.subtopics WHERE topic_id = %s ORDER BY created_at ASC;",
                (node_id,)
            )
            lessons = cur.fetchall()
            for lesson in lessons:
                lesson["pdf_path"] = StorageService.get_subtopic_pdf_path(str(lesson["id"]))
            return {"lessons": lessons}
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def update_node_positions(positions: List[NodePosition]):
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            for pos in positions:
                cur.execute(
                    "UPDATE public.topics SET ui_x = %s, ui_y = %s WHERE id = %s",
                    (pos.x, pos.y, pos.id)
                )
            conn.commit()
            return {"status": "success"}
        finally:
            cur.close()
            conn.close()
