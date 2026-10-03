from fastapi import APIRouter
from services.lesson_service import LessonService

router = APIRouter(prefix="/api/v1/lessons", tags=["Lessons"])

@router.get("/{lesson_id}")
async def get_lesson_details(lesson_id: str):
    """
    Pulls details for a specific lesson (subtopic), including content_tex and task_groups.
    """
    try:
        return LessonService.get_lesson_details(lesson_id)
    except Exception as e:
        return {"error": str(e)}
