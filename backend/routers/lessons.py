from fastapi import APIRouter
from services.lesson_service import LessonService

router = APIRouter(prefix="/api/v1/lessons", tags=["Lessons"])

@router.get("/{lesson_id}")
async def get_lesson_details(lesson_id: str):
    """
    Pulls details for a specific lesson (subtopic), including content_tex, task_groups, and presigned pdf_url.
    """
    try:
        return LessonService.get_lesson_details(lesson_id)
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

