from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from services.exercise_service import ExerciseService
from schemas.exercise import VerifyExerciseRequest, SubmitTestRequest
from core.auth import get_optional_user, get_current_user

router = APIRouter(prefix="/api/v1/exercises", tags=["Exercises"])

@router.get("/{task_group_id}")
async def get_exercises(
    task_group_id: str, 
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Pulls exercises (tasks) for a specific task group along with user's test history if authenticated.
    """
    try:
        user_id = current_user.get("user_id") if current_user else None
        res = ExerciseService.get_exercises_for_group(task_group_id, user_id=user_id)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{task_group_id}/submit-test")
async def submit_test(
    task_group_id: str,
    payload: SubmitTestRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submits and verifies an exam test (10 questions or dynamic pool) for a task group.
    Records the test attempt in public.task_group_test_attempts with pass/fail status (>=80%).
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Wymagane logowanie do zapisu wyniku testu.")

        res = ExerciseService.submit_test(task_group_id, user_id, payload.answers)
        if "error" in res:
            raise HTTPException(status_code=400, detail=res["error"])
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
