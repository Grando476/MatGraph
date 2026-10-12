import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Supabase Storage Configuration
DEFAULT_BUCKET = "edu_pdfs"
_supabase_client = None

def get_supabase_client():
    """
    Returns (client, error_message).
    Initializes Supabase client singleton, or returns detailed error message if initialization fails.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client, None

    # Load .env if present (useful for local development)
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        pass

    url = (
        os.getenv("SUPABASE_URL")
        or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        or os.getenv("SUPABASE_PROJECT_URL")
        or ""
    ).strip().strip('"').strip("'")

    key = (
        os.getenv("SUPABASE_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        or ""
    ).strip().strip('"').strip("'")

    if not url and not key:
        return None, "Brak zmiennych SUPABASE_URL i SUPABASE_KEY w środowisku backendu."
    if not url:
        return None, "Brak zmiennej SUPABASE_URL w środowisku backendu."
    if not key:
        return None, "Brak zmiennej SUPABASE_KEY (lub SUPABASE_ANON_KEY) w środowisku backendu."

    try:
        from supabase import create_client
        _supabase_client = create_client(url, key)
        return _supabase_client, None
    except Exception as e:
        err_msg = f"Błąd inicjalizacji klienta Supabase: {str(e)}"
        logger.error(err_msg)
        return None, err_msg


class StorageService:
    @staticmethod
    def generate_presigned_url(
        file_path: Optional[str],
        bucket: Optional[str] = None,
        expires_in: int = 3600
    ) -> Dict[str, Any]:
        """
        Generates a secure presigned URL for a given file path in Supabase Storage.
        Returns:
            {"url": str | None, "error": str | None}
        """
        if not file_path:
            return {"url": None, "error": None}

        # If already an absolute HTTP/HTTPS URL, return as is
        if file_path.startswith("http://") or file_path.startswith("https://"):
            return {"url": file_path, "error": None}

        configured_bucket = (os.getenv("SUPABASE_STORAGE_BUCKET") or DEFAULT_BUCKET).strip().strip('"').strip("'")
        target_bucket = bucket or configured_bucket

        # Check for Supabase credentials
        client, init_error = get_supabase_client()
        if not client:
            logger.warning(init_error)
            return {"url": None, "error": init_error}

        try:
            # Clean file path (strip leading slashes or bucket name if mistakenly prefixed)
            clean_path = file_path.strip("/")
            if clean_path.startswith(f"{target_bucket}/"):
                clean_path = clean_path[len(target_bucket) + 1:]

            res = client.storage.from_(target_bucket).create_signed_url(clean_path, expires_in)
            
            # The client returns {"signedURL": "...", "signedUrl": "..."}
            signed_url = None
            if isinstance(res, dict):
                signed_url = res.get("signedURL") or res.get("signedUrl")
            elif hasattr(res, "get"):
                signed_url = res.get("signedURL") or res.get("signedUrl")

            if not signed_url:
                return {"url": None, "error": "Nie udało się wygenerować presigned URL dla podanej ścieżki"}

            return {"url": signed_url, "error": None}

        except Exception as e:
            error_msg = f"Błąd generowania presigned URL: {str(e)}"
            logger.error(f"StorageService error for path '{file_path}': {e}")
            return {"url": None, "error": error_msg}
