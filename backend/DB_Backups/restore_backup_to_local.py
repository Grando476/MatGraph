import os
import glob
import json
import psycopg2
from psycopg2.extras import Json, execute_batch
from dotenv import load_dotenv

# Load env variables (DATABASE_URL if defined, otherwise default local docker postgres)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv()

DB_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/edumath")

TABLE_ORDER = [
    "chapters",
    "topics",
    "topic_edges",
    "subtopics",
    "task_groups",
    "tasks",
    "profiles",
    "classes",
    "class_members",
    "class_assignments",
    "task_group_test_attempts",
    "assignment_completions",
    "staging_tasks",
]

def find_latest_backup():
    backups_dir = os.path.dirname(__file__)
    pattern = os.path.join(backups_dir, "backup_matgraph_db_*.json")
    files = glob.glob(pattern)
    if not files:
        # Also check root directory in case user ran backup from root
        root_dir = os.path.abspath(os.path.join(backups_dir, "..", ".."))
        files = glob.glob(os.path.join(root_dir, "backup_matgraph_db_*.json"))
        if not files:
            return None
            
    # ISO dates in filename (YYYY-MM-DD_HH-MM-SS) sort alphabetically to the latest
    files.sort(key=lambda f: os.path.basename(f), reverse=True)
    return files[0]

def restore_backup(json_file_path=None):
    if not json_file_path:
        json_file_path = find_latest_backup()

    if not json_file_path or not os.path.exists(json_file_path):
        print(f"[ERROR] Nie znaleziono pliku backupu: {json_file_path}")
        return

    print("=" * 60)
    print(f"[INFO] Wybrany plik backupu: {os.path.basename(json_file_path)}")
    print(f"[INFO] Pelna sciezka: {json_file_path}")
    print("=" * 60)

    with open(json_file_path, "r", encoding="utf-8") as f:
        backup_data = json.load(f)

    print(f"\nLaczenie z lokalna baza: {DB_URL} ...")
    try:
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
    except Exception as e:
        print(f"[ERROR] Nie udalo sie polaczyc z lokalna baza: {e}")
        print("Upewnij sie, ze kontener 'backend-db-1' jest wlaczony (port 5432).")
        return

    cur = conn.cursor()

    try:
        # Disable triggers & FK constraints during bulk restore
        print("Wylaczanie wiezow integralnosci (session_replication_role = 'replica')...")
        try:
            cur.execute("SET session_replication_role = 'replica';")
        except Exception as e:
            print(f"  [Uwaga] Nie mozna ustawic roli replica: {e}")

        # Determine table order
        tables_to_restore = [t for t in TABLE_ORDER if t in backup_data]
        for t in backup_data.keys():
            if t not in tables_to_restore:
                tables_to_restore.append(t)

        # Clear tables first in reverse order
        print("\nCzyszczenie istniejacych tabel w bazie lokalnej...")
        for table in reversed(tables_to_restore):
            try:
                cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
                print(f"  Wyczyszczono: {table}")
            except Exception as e:
                print(f"  [Pominieto TRUNCATE] {table}: {e}")

        # Insert records table by table
        print("\nWgrywanie danych do tabel...")
        total_inserted = 0

        for table in tables_to_restore:
            rows = backup_data.get(table, [])
            if not rows:
                print(f"  - {table}: 0 rekordow w backupie (pominieto)")
                continue

            # Query the actual existing columns in local database for this table
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = %s;
            """, (table,))
            existing_cols = {r[0] for r in cur.fetchall()}

            if not existing_cols:
                print(f"  [Pominieto] Tabela '{table}' nie istnieje w lokalnej bazie.")
                continue

            # Match only columns that exist both in backup JSON and in the target table
            available_cols = [c for c in rows[0].keys() if c in existing_cols]
            if not available_cols:
                print(f"  [Pominieto] Brak pasujacych kolumn dla tabeli '{table}'.")
                continue

            col_names = ", ".join([f'"{c}"' for c in available_cols])
            placeholders = ", ".join(["%s"] * len(available_cols))
            insert_query = f'INSERT INTO "{table}" ({col_names}) VALUES ({placeholders})'

            # Prepare batch values
            batch_values = []
            for row in rows:
                row_vals = []
                for c in available_cols:
                    val = row.get(c)
                    if isinstance(val, (dict, list)):
                        row_vals.append(Json(val))
                    else:
                        row_vals.append(val)
                batch_values.append(row_vals)

            # Fast batch insert
            try:
                execute_batch(cur, insert_query, batch_values, page_size=500)
                inserted_count = len(batch_values)
                total_inserted += inserted_count
                print(f"  + {table}: wgrano {inserted_count}/{len(rows)} rekordow")
            except Exception as batch_err:
                print(f"  [Uwaga] Wstawianie wsadowe dla {table} nie powiodlo sie ({batch_err}). Proba wiersz po wierszu...")
                inserted_count = 0
                for row_vals in batch_values:
                    try:
                        cur.execute(insert_query, row_vals)
                        inserted_count += 1
                    except Exception as single_err:
                        print(f"    [Blad wiersza w {table}] {single_err}")
                total_inserted += inserted_count
                print(f"  + {table}: wgrano {inserted_count}/{len(rows)} rekordow (wiersz po wierszu)")

        # Re-enable triggers & FK constraints
        try:
            cur.execute("SET session_replication_role = 'origin';")
        except Exception:
            pass

        print("\n" + "=" * 60)
        print(f"SUKCES! Wgrano lacznie {total_inserted} rekordow do lokalnego PostgreSQL.")
        print("=" * 60)

    except Exception as e:
        print(f"[BLAD KRYTYCZNY] Przywracanie nie powiodlo sie: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    import sys
    target_file = sys.argv[1] if len(sys.argv) > 1 else None
    restore_backup(target_file)
