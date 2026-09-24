from fastapi import APIRouter
from services.exercise_service import ExerciseService

router = APIRouter(prefix="/api/v1/exercises", tags=["Exercises"])

@router.get("/{task_group_id}")
async def get_exercises(task_group_id: str):
    """
    Pulls exercises (tasks) for a specific task group.
    """
    try:
        return ExerciseService.get_exercises_for_group(task_group_id)
    except Exception as e:
        return {"error": str(e)}
