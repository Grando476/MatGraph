import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Supabase Storage Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
DEFAULT_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "edu_pdfs")

_supabase_client = None

def get_supabase_client():
    """
    Returns an initialized Supabase client singleton, or None if credentials are missing.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


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

        target_bucket = bucket or DEFAULT_BUCKET

        # Check for Supabase credentials
        client = get_supabase_client()
        if not client:
            warning_msg = (
                "Brak konfiguracji Supabase Storage w backendzie (wymagane SUPABASE_URL i SUPABASE_KEY w .env)."
            )
            logger.warning(warning_msg)
            return {"url": None, "error": warning_msg}

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
