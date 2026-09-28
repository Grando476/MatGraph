from fastapi import APIRouter, Depends
from core.auth import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Protected endpoint returning user_id and profile data for the authenticated user.
    Requires Bearer <JWT_TOKEN> in Authorization header.
    """
    return {
        "status": "authenticated",
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "user_metadata": current_user["user_metadata"]
    }
