from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from schemas.node import NodePosition
from typing import List

class NodeService:
    @staticmethod
    def get_all_nodes_and_edges():
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Fetch nodes (topics)
            cur.execute("""
                SELECT t.id, t.name, t.ui_x, t.ui_y, COUNT(s.id) as subtasks_count
                FROM public.topics t
                LEFT JOIN public.subtopics s ON t.id = s.topic_id
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
