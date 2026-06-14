import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

app = Flask(__name__)
CORS(app)

def fetch_all_records(table_name, select_query="*", order_col=None):
    all_data = []
    page_size = 1000
    start = 0
    while True:
        query = supabase.table(table_name).select(select_query)
        if order_col:
            query = query.order(order_col)
        query = query.range(start, start + page_size - 1)
        res = query.execute()
        
        if not res.data:
            break
            
        all_data.extend(res.data)
        
        if len(res.data) < page_size:
            break
            
        start += page_size
    return all_data

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        return jsonify({
            "chapters": fetch_all_records("chapters", "*", "created_at"),
            "topics": fetch_all_records("topics", "*, chapters(name)", "created_at"),
            "subtopics": fetch_all_records("subtopics", "*, topics(name)", "sort_order"),
            "task_groups": fetch_all_records("task_groups", "*, subtopics(name)", "created_at"),
            "tasks": fetch_all_records("tasks", "*, task_groups(name)", "created_at"),
            "topic_edges": fetch_all_records("topic_edges", "*")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update/<table>/<id>', methods=['POST'])
def update_data(table, id):
    try:
        new_data = request.json
        supabase.table(table).update(new_data).eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create/<table>', methods=['POST'])
def create_data(table):
    try:
        new_data = request.json
        if "id" in new_data: del new_data["id"]
        res = supabase.table(table).insert(new_data).execute()
        return jsonify({"status": "success", "data": res.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete/<table>/<id>', methods=['DELETE'])
def delete_data(table, id):
    try:
        supabase.table(table).delete().eq("id", id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete_edge/<parent_id>/<child_id>', methods=['DELETE'])
def delete_edge(parent_id, child_id):
    try:
        supabase.table("topic_edges").delete().eq("parent_id", parent_id).eq("child_id", child_id).execute()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schema', methods=['GET'])
def get_schema():
    try:
        tables = ["chapters", "topics", "subtopics", "task_groups", "tasks"]
        res = supabase.rpc("get_schema_info", {"tables": tables}).execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)