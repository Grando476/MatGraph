import os
import psycopg2

def get_db_connection():
    """
    Returns a connection instance to PostgreSQL.
    Reads DATABASE_URL from environment variables.
    """
    db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/edumath")
    return psycopg2.connect(db_url)
