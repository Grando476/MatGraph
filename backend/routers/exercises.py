from fastapi import APIRouter, HTTPException
from typing import Optional
from services.exercise_service import ExerciseService
from schemas.exercise import VerifyExerciseRequest

router = APIRouter(prefix="/api/v1/exercises", tags=["Exercises"])

@router.get("/{task_group_id}")
async def get_exercises(task_group_id: str):
    """
    Pulls exercises (tasks) for a specific task group.
    """
    try:
        res = ExerciseService.get_exercises_for_group(task_group_id)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
@router.post("/{task_id}/verify")
async def verify_exercise(payload: VerifyExerciseRequest, task_id: Optional[str] = None):
    """
    Verifies user answers for a task (e.g. TRUE_FALSE, MCQ, OPEN).
    """
    try:
        target_task_id = task_id or payload.task_id
        if not target_task_id:
            raise HTTPException(status_code=400, detail="task_id is required")

        res = ExerciseService.verify_exercise(target_task_id, payload.answers)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
