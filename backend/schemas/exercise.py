from pydantic import BaseModel
from typing import Any, Dict, Optional

class VerifyExerciseRequest(BaseModel):
    task_id: Optional[str] = None
    answers: Dict[str, Any]
