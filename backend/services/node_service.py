from psycopg2.extras import RealDictCursor
from db.session import get_db_connection
from schemas.node import NodePosition
from typing import List
from services.storage_service import StorageService

class NodeService:
    @staticmethod
    def ensure_is_hidden_column():
        """Ensures the is_hidden column exists on public.topics table."""
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                ALTER TABLE public.topics 
                ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE NOT NULL;
            """)
            conn.commit()
        except Exception:
            conn.rollback()
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def get_all_nodes_and_edges(user_id: str | None = None, role: str | None = None):
        NodeService.ensure_is_hidden_column()
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            if user_id:
                query = """
                    SELECT 
                        t.id, 
                        t.name, 
                        t.ui_x, 
                        t.ui_y, 
                        COALESCE(t.is_hidden, false) as is_hidden,
                        COALESCE(t.is_hidden, false) as is_blocked,
                        COUNT(DISTINCT s.id) as subtasks_count,
                        COUNT(DISTINCT tg.id) as total_task_groups,
                        COUNT(DISTINCT CASE WHEN ta.passed = true THEN tg.id END) as passed_task_groups
                    FROM public.topics t
                    LEFT JOIN public.subtopics s ON t.id = s.topic_id
                    LEFT JOIN public.task_groups tg ON s.id = tg.subtopic_id
                    LEFT JOIN public.task_group_test_attempts ta 
                        ON tg.id = ta.task_group_id AND ta.student_id = %s
                    GROUP BY t.id, t.name, t.ui_x, t.ui_y, t.is_hidden;
                """
                cur.execute(query, (user_id,))
            else:
                query = """
                    SELECT 
                        t.id, 
                        t.name, 
                        t.ui_x, 
                        t.ui_y, 
                        COALESCE(t.is_hidden, false) as is_hidden,
                        COALESCE(t.is_hidden, false) as is_blocked,
                        COUNT(DISTINCT s.id) as subtasks_count,
                        COUNT(DISTINCT tg.id) as total_task_groups,
                        0 as passed_task_groups
                    FROM public.topics t
                    LEFT JOIN public.subtopics s ON t.id = s.topic_id
                    LEFT JOIN public.task_groups tg ON s.id = tg.subtopic_id
                    GROUP BY t.id, t.name, t.ui_x, t.ui_y, t.is_hidden;
                """
                cur.execute(query)
            nodes = cur.fetchall()

            # Always fetch all edges for all users
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
                subtopic_id = str(lesson["id"])
                pdf_path = StorageService.get_subtopic_pdf_path(subtopic_id)
                storage_res = StorageService.generate_presigned_url(pdf_path)
                pdf_url = storage_res.get("url")
                if pdf_url:
                    lesson["pdf_path"] = pdf_path
                    lesson["pdf_url"] = pdf_url
                    lesson["has_pdf"] = True
                else:
                    lesson["pdf_path"] = None
                    lesson["pdf_url"] = None
                    lesson["has_pdf"] = False
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

    @staticmethod
    def hide_nodes_without_pdf():
        """
        Hides all nodes (topics) that do not have a PDF uploaded to at least one of their lessons (subtopics).
        Unhides nodes that do have at least one lesson with a PDF.
        Hidden nodes are not visible to regular users, but remain visible in admin mode.
        """
        NodeService.ensure_is_hidden_column()
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # 1. Fetch all topics with their subtopics
            cur.execute("""
                SELECT 
                    t.id as topic_id,
                    t.name as topic_name,
                    COALESCE(t.is_hidden, false) as is_hidden,
                    s.id as subtopic_id
                FROM public.topics t
                LEFT JOIN public.subtopics s ON t.id = s.topic_id
                ORDER BY t.name;
            """)
            rows = cur.fetchall()

            topics_map = {}
            for row in rows:
                t_id = str(row["topic_id"])
                if t_id not in topics_map:
                    topics_map[t_id] = {
                        "name": row["topic_name"],
                        "is_hidden": bool(row["is_hidden"]),
                        "subtopic_ids": []
                    }
                if row["subtopic_id"]:
                    topics_map[t_id]["subtopic_ids"].append(str(row["subtopic_id"]))

            # 2. Collect subtopics that have a PDF
            subtopics_with_pdf = StorageService.get_subtopics_with_pdf()

            # If storage bulk listing returned empty, verify subtopics individually via presigned url
            if not subtopics_with_pdf:
                for t_id, data in topics_map.items():
                    for s_id in data["subtopic_ids"]:
                        if StorageService.check_subtopic_has_pdf(s_id):
                            subtopics_with_pdf.add(s_id)
                            break

            # 3. Categorize topics
            topics_to_hide = []
            topics_to_show = []

            for t_id, data in topics_map.items():
                has_pdf = any(s_id in subtopics_with_pdf for s_id in data["subtopic_ids"])
                if not has_pdf:
                    topics_to_hide.append({"id": t_id, "name": data["name"]})
                else:
                    topics_to_show.append({"id": t_id, "name": data["name"]})

            # 4. Update topics in DB
            if topics_to_hide:
                hide_ids = [t["id"] for t in topics_to_hide]
                cur.execute(
                    "UPDATE public.topics SET is_hidden = true WHERE id = ANY(%s::uuid[]);",
                    (hide_ids,)
                )

            if topics_to_show:
                show_ids = [t["id"] for t in topics_to_show]
                cur.execute(
                    "UPDATE public.topics SET is_hidden = false WHERE id = ANY(%s::uuid[]);",
                    (show_ids,)
                )

            conn.commit()

            return {
                "status": "success",
                "message": f"Ukryto {len(topics_to_hide)} węzłów bez PDF. Widocznych dla uczniów: {len(topics_to_show)} węzłów.",
                "hidden_count": len(topics_to_hide),
                "visible_count": len(topics_to_show),
                "total_topics": len(topics_map),
                "hidden_topics": topics_to_hide,
                "visible_topics": topics_to_show
            }
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def unhide_all_nodes():
        """
        Unhides all nodes (topics), making all nodes visible to regular users.
        """
        NodeService.ensure_is_hidden_column()
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("UPDATE public.topics SET is_hidden = false;")
            conn.commit()
            return {"status": "success", "message": "Wszystkie węzły są teraz widoczne dla użytkowników."}
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def set_node_visibility(node_id: str, is_hidden: bool):
        """
        Manually sets is_hidden status for an individual node.
        """
        NodeService.ensure_is_hidden_column()
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                "UPDATE public.topics SET is_hidden = %s WHERE id = %s RETURNING id, name, is_hidden;",
                (is_hidden, node_id)
            )
            updated = cur.fetchone()
            conn.commit()
            if not updated:
                return {"error": "Nie znaleziono węzła"}
            return {"status": "success", "node": updated}
        finally:
            cur.close()
            conn.close()

    # Aliases for backwards compatibility
    @staticmethod
    def block_nodes_without_pdf():
        return NodeService.hide_nodes_without_pdf()

    @staticmethod
    def set_node_blocked(node_id: str, is_blocked: bool):
        return NodeService.set_node_visibility(node_id, is_blocked)
