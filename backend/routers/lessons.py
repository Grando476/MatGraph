from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from typing import Optional
from services.lesson_service import LessonService
from core.auth import get_optional_user

router = APIRouter(prefix="/api/v1/lessons", tags=["Lessons"])

@router.get("/{lesson_id}")
async def get_lesson_details(lesson_id: str, current_user: Optional[dict] = Depends(get_optional_user)):
    """
    Pulls details for a specific lesson (subtopic), including task_groups (with pass status), and presigned pdf_url.
    """
    try:
        user_id = current_user.get("user_id") if current_user else None
        return LessonService.get_lesson_details(lesson_id, user_id=user_id)
    except Exception as e:
        return {"error": str(e)}


@router.get("/{lesson_id}/pdf-url")
async def get_lesson_pdf_url(lesson_id: str):
    """
    Generates or refreshes a presigned URL specifically for the lesson's PDF document.
    """
    try:
        return LessonService.get_lesson_pdf_url(lesson_id)
    except Exception as e:
        return {"error": str(e)}


@router.get("/{lesson_id}/pdf")
async def download_lesson_pdf(lesson_id: str):
    """
    Directly redirects to the presigned download URL for the lesson's PDF.
    """
    try:
        res = LessonService.get_lesson_pdf_url(lesson_id)
        if res.get("pdf_url"):
            return RedirectResponse(url=res["pdf_url"])
        return res
    except Exception as e:
        return {"error": str(e)}


