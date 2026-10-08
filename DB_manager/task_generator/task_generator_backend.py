import os
import uuid
import json
from flask import Flask, jsonify, request, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client
from langchain_google_genai import ChatGoogleGenerativeAI
from pipeline import run_generation_pipeline

load_dotenv()
app = Flask(__name__)
CORS(app)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite", 
    google_api_key=os.getenv("GOOGLE_API_KEY"), 
    temperature=0.9
)

# ============================================================
# GENEROWANIE ZADAŃ (BATCH) - dla wielu task_groups naraz
# ============================================================

@app.route('/api/generate', methods=['POST'])
def generate_tasks_batch():
    """
    Masowe generowanie zadań dla wielu task_groups.
    Body JSON: {
        "task_group_ids": ["uuid1", "uuid2", ...],
        "task_type": "MCQ",
        "counts": {"Easy": 2, "Medium": 1, "Hard": 0, "Very Hard": 0}
    }
    Streamuje NDJSON – każda linia to gotowe zadanie zapisane już w staging_tasks.
    """
    data = request.json
    task_group_ids = data.get('task_group_ids', [])
    task_type = data.get('task_type', 'MCQ')
    counts = data.get('counts', {})
    batch_id = str(uuid.uuid4())

    if not task_group_ids:
        return jsonify({"error": "Brak task_group_ids"}), 400

    def generate():
        for tg_id in task_group_ids:
            # Pobieranie kontekstu edukacyjnego dla danej grupy zadaniowej
            try:
                context = _build_context(tg_id)
            except Exception as e:
                error_line = json.dumps({
                    "error": True, 
                    "task_group_id": tg_id, 
                    "message": f"Błąd pobierania kontekstu: {str(e)}"
                }, ensure_ascii=False) + "\n"
                yield error_line
                continue

            # Uruchomienie pipeline'a generującego
            for task_json_str in run_generation_pipeline(llm, context, counts, task_type):
                try:
                    task_data = json.loads(task_json_str)
                except json.JSONDecodeError:
                    continue
                
                # Natychmiastowy zapis do staging_tasks
                staging_record = {
                    "batch_id": batch_id,
                    "task_group_id": tg_id,
                    "task_type": task_type,
                    "difficulty_level": task_data.get("difficulty_level", "Easy"),
                    "content": task_data.get("content", {}),
                    "exemplary_solution": task_data.get("exemplary_solution", ""),
                    "validation": task_data.get("validation", {}),
                    "debug_info": task_data.get("debug_info", {}),
                    "inspiration": task_data.get("inspiration", ""),
                    "human_validated": False
                }
                
                try:
                    res = supabase.table("staging_tasks").insert(staging_record).execute()
                    saved_id = res.data[0]["id"] if res.data else None
                except Exception as e:
                    print(f"Błąd zapisu do staging: {e}")
                    saved_id = None

                # Dołączamy metadane do streamu
                task_data["staging_id"] = saved_id
                task_data["batch_id"] = batch_id
                task_data["task_group_id"] = tg_id
                task_data["task_type"] = task_type
                task_data["_context_path"] = f"{context['chapter']} > {context['topic']} > {context['subtopic']} > {context['group']}"

                yield json.dumps(task_data, ensure_ascii=False) + "\n"

    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')


# Stary endpoint (kompatybilność wsteczna z obecnym panelem)
@app.route('/api/generate/<tg_id>', methods=['POST'])
def generate_tasks_single(tg_id):
    req_data = request.json or {}
    if isinstance(req_data, dict) and 'counts' in req_data:
        counts = req_data.get('counts', {})
        task_type = req_data.get('task_type', request.args.get('task_type', 'MCQ'))
    else:
        counts = req_data
        task_type = request.args.get('task_type', 'MCQ')
    batch_id = str(uuid.uuid4())

    context = _build_context(tg_id)

    def generate():
        for task_json_str in run_generation_pipeline(llm, context, counts, task_type):
            try:
                task_data = json.loads(task_json_str)
            except json.JSONDecodeError:
                continue

            # Zapis do staging
            staging_record = {
                "batch_id": batch_id,
                "task_group_id": tg_id,
                "task_type": task_type,
                "difficulty_level": task_data.get("difficulty_level", "Easy"),
                "content": task_data.get("content", {}),
                "exemplary_solution": task_data.get("exemplary_solution", ""),
                "validation": task_data.get("validation", {}),
                "debug_info": task_data.get("debug_info", {}),
                "inspiration": task_data.get("inspiration", ""),
                "human_validated": False
            }
            try:
                res = supabase.table("staging_tasks").insert(staging_record).execute()
                saved_id = res.data[0]["id"] if res.data else None
            except Exception as e:
                print(f"Błąd zapisu do staging: {e}")
                saved_id = None

            task_data["staging_id"] = saved_id
            task_data["batch_id"] = batch_id
            task_data["task_group_id"] = tg_id

            yield json.dumps(task_data, ensure_ascii=False) + "\n"

    return Response(stream_with_context(generate()), mimetype='application/x-ndjson')


# ============================================================
# STAGING - Kolejka oczekujących zadań (bufor przed produkcją)
# ============================================================

@app.route('/api/staging', methods=['GET'])
def get_staging_tasks():
    """Pobiera wszystkie oczekujące zadania ze stagingu (opcjonalnie filtrowane po batch_id)."""
    batch_id = request.args.get('batch_id')
    
    query = supabase.table("staging_tasks").select(
        "*, task_groups(name, subtopics(name, topics(name, chapters(name))))"
    ).order("created_at", desc=True)
    
    if batch_id:
        query = query.eq("batch_id", batch_id)
    
    res = query.execute()
    return jsonify(res.data)


@app.route('/api/staging/<staging_id>', methods=['PATCH'])
def update_staging_task(staging_id):
    """Aktualizuje zadanie w stagingu (edycja treści, human_validated itp.)."""
    updates = request.json
    try:
        supabase.table("staging_tasks").update(updates).eq("id", staging_id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/staging/promote', methods=['POST'])
def promote_staging_tasks():
    """
    Przenosi zadania ze staging_tasks do bazy produkcyjnej (tasks),
    a następnie usuwa je ze stagingu.
    Body JSON: {"staging_ids": ["uuid1", "uuid2", ...]}
    """
    staging_ids = request.json.get("staging_ids", [])
    if not staging_ids:
        return jsonify({"error": "Brak staging_ids"}), 400

    success_count = 0
    errors = []

    for sid in staging_ids:
        try:
            # 1. Pobierz zadanie ze stagingu
            res = supabase.table("staging_tasks").select("*").eq("id", sid).single().execute()
            st = res.data
            if not st:
                continue

            # 2. Wstaw do produkcyjnej tabeli tasks
            task_payload = {
                "task_group_id": st["task_group_id"],
                "task_type": st.get("task_type", "MCQ"),
                "difficulty_level": st["difficulty_level"],
                "content": st["content"],
                "exemplary_solution": st.get("exemplary_solution", ""),
                "human_validated": st.get("human_validated", False)
            }
            supabase.table("tasks").insert(task_payload).execute()

            # 3. Usuń ze stagingu (zadanie przetransportowane na proda)
            supabase.table("staging_tasks").delete().eq("id", sid).execute()
            success_count += 1
        except Exception as e:
            errors.append({"staging_id": sid, "error": str(e)})

    return jsonify({
        "promoted": success_count, 
        "errors": errors,
        "total_requested": len(staging_ids)
    })


@app.route('/api/staging/delete', methods=['POST'])
def delete_staging_tasks():
    """Trwale usuwa zadania ze stagingu (odrzucenie / usunięcie z bufora). Body: {"staging_ids": [...]}"""
    staging_ids = request.json.get("staging_ids", [])
    if not staging_ids:
        return jsonify({"error": "Brak staging_ids"}), 400

    for sid in staging_ids:
        try:
            supabase.table("staging_tasks").delete().eq("id", sid).execute()
        except Exception as e:
            print(f"Błąd usuwania {sid}: {e}")

    return jsonify({"status": "success", "deleted": len(staging_ids)})


@app.route('/api/staging/batches', methods=['GET'])
def get_staging_batches():
    """Zwraca listę unikalnych batch_id z liczbą oczekujących zadań."""
    res = supabase.table("staging_tasks").select("batch_id, created_at").order("created_at", desc=True).execute()
    
    batches = {}
    for row in res.data:
        bid = row["batch_id"]
        if bid not in batches:
            batches[bid] = {"batch_id": bid, "created_at": row["created_at"], "count": 0}
        batches[bid]["count"] += 1

    return jsonify(list(batches.values()))


@app.route('/api/tree-data', methods=['GET'])
def get_tree_data():
    """Zwraca hierarchię grup oraz listę zadań do zliczenia zadań na produkcji."""
    try:
        chapters = supabase.table("chapters").select("id, name").order("created_at").execute().data or []
        topics = supabase.table("topics").select("id, name, chapter_id").order("created_at").execute().data or []
        subtopics = supabase.table("subtopics").select("id, name, topic_id").order("sort_order").execute().data or []
        task_groups = supabase.table("task_groups").select("id, name, subtopic_id").order("created_at").execute().data or []
        tasks = supabase.table("tasks").select("task_group_id").execute().data or []
        return jsonify({
            "chapters": chapters,
            "topics": topics,
            "subtopics": subtopics,
            "task_groups": task_groups,
            "tasks": tasks
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# POMOCNICZE
# ============================================================

def _build_context(tg_id):
    """Buduje kontekst edukacyjny dla danej grupy zadaniowej."""
    res = supabase.table("task_groups").select(
        "name, subtopics(id, name, content_tex, task_groups(name), topics(name, content_tex, chapters(name)))"
    ).eq("id", tg_id).single().execute()
    
    d = res.data
    subtopic_id = d['subtopics']['id']
    
    try:
        pk_res = supabase.rpc("get_prior_knowledge", {"p_subtopic_id": subtopic_id}).execute()
        prior_knowledge = pk_res.data or {}
    except Exception as e:
        print(f"Warning: Failed to fetch prior knowledge: {e}")
        prior_knowledge = {}

    known_topics_names = prior_knowledge.get("known_topics_names") or []
    known_subtopics_data = prior_knowledge.get("known_subtopics") or []
    unknown_topics_names = prior_knowledge.get("unknown_topics_names") or []
    
    known_subtopics_theories = []
    for st in known_subtopics_data:
        known_subtopics_theories.append(f"{st.get('name')}: {st.get('content_tex', '')}")

    sibling_task_groups = [tg['name'] for tg in d['subtopics'].get('task_groups', []) if tg['name'] != d['name']]

    return {
        "chapter": d['subtopics']['topics']['chapters']['name'],
        "topic": d['subtopics']['topics']['name'],
        "subtopic": d['subtopics']['name'],
        "group": d['name'],
        "topic_theory": d['subtopics']['topics'].get('content_tex', '') or "Brak",
        "subtopic_theory": d['subtopics'].get('content_tex', '') or "Brak",
        "known_topics_names": ", ".join(known_topics_names) if known_topics_names else "Brak",
        "known_subtopics_theories": " | ".join(known_subtopics_theories) if known_subtopics_theories else "Brak",
        "unknown_topics_names": ", ".join(unknown_topics_names) if unknown_topics_names else "Brak",
        "sibling_task_groups": ", ".join(sibling_task_groups) if sibling_task_groups else "Brak"
    }


if __name__ == '__main__':
    app.run(port=5001)