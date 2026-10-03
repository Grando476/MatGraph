from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["Health Check"])

@router.get("/health")
async def health_check():
    """
    Endpoint checking the availability of the service.
    Used for diagnostics on the frontend.
    """
    return {"status": "ok"}
