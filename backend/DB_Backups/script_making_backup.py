import os
import json
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Look for .env in current directory, parent dirs or root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing Supabase keys (SUPABASE_URL, SUPABASE_KEY) in .env file!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

DEFAULT_TABLES = [
    "chapters", "topics", "topic_edges", "subtopics",
    "task_groups", "tasks", "profiles", "staging_tasks",
    "classes", "class_members", "class_assignments",
    "task_group_test_attempts", "assignment_completions"
]

def create_dynamic_backup():
    print("Fetching list of tables from database...")
    
    tables = []
    try:
        rpc_response = supabase.rpc("get_public_tables").execute()
        tables = [row['table_name'] for row in rpc_response.data if row.get('table_name')]
        print(f"Found {len(tables)} tables via RPC: {', '.join(tables)}")
    except Exception as e:
        print(f"Note: Could not fetch tables via RPC ({e}). Using default table list.")
        tables = DEFAULT_TABLES

    backup_data = {}
    total_records = 0
    PAGE_SIZE = 1000
    
    print("\nStarting paginated data download (no row limits)...")
    for table in tables:
        print(f"Downloading table: {table}...")
        table_rows = []
        start = 0
        try:
            while True:
                # Range pagination [start, start + PAGE_SIZE - 1] inclusive
                res = supabase.table(table).select("*").range(start, start + PAGE_SIZE - 1).execute()
                rows = res.data or []
                table_rows.extend(rows)
                
                # If returned less than PAGE_SIZE, we have reached the end
                if len(rows) < PAGE_SIZE:
                    break
                start += PAGE_SIZE
                print(f"    ... fetched {len(table_rows)} rows so far")

            backup_data[table] = table_rows
            count = len(table_rows)
            total_records += count
            print(f"    -> Total downloaded for {table}: {count}")
        except Exception as e:
            print(f"    Error downloading {table}: {e}")

    date_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_name = f"backup_matgraph_db_{date_str}.json"
    out_path = os.path.join(os.path.dirname(__file__), file_name)
    
    with open(out_path, "w", encoding="utf-8") as file:
        json.dump(backup_data, file, ensure_ascii=False, indent=4)
        
    print("-" * 40)
    print(f"Done! Saved a total of {total_records} records across {len(tables)} tables.")
    print(f"Backup file saved to: {out_path}")

if __name__ == "__main__":
    create_dynamic_backup()