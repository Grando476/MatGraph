from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from core.auth import get_optional_user, get_current_user
from services.node_service import NodeService
from schemas.node import UpdatePositionsRequest, BlockNodeRequest, ToggleVisibilityRequest

router = APIRouter(prefix="/api/v1/nodes", tags=["Nodes & Graph"])

@router.get("")
async def get_nodes(current_user: Optional[dict] = Depends(get_optional_user)):
    """
    Pulls all nodes and their connections from the PostgreSQL database,
    along with task groups progress if user is authenticated.
    Hides is_hidden=true nodes for regular users (students, guests).
    """
    try:
        user_id = current_user.get("user_id") if current_user else None
        role = current_user.get("role") if current_user else None
        return NodeService.get_all_nodes_and_edges(user_id=user_id, role=role)
    except Exception as e:
        return {"error": str(e)}

@router.post("/hide-without-pdf")
@router.post("/block-without-pdf")
async def hide_nodes_without_pdf(current_user: dict = Depends(get_current_user)):
    """
    Ukrywa wszystkie węzły (tematy), które nie mają pliku PDF w żadnej ze swoich lekcji.
    Dla zwykłych użytkowników te węzły przestają być widoczne.
    Dostępne tylko dla administratora.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Tylko administrator może zarządzać widocznością węzłów bez PDF.")
    try:
        return NodeService.hide_nodes_without_pdf()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unhide-all")
@router.post("/unblock-all")
async def unhide_all_nodes(current_user: dict = Depends(get_current_user)):
    """
    Przywraca widoczność wszystkich węzłów dla użytkowników.
    Dostępne tylko dla administratora.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Tylko administrator może zmieniać widoczność węzłów.")
    try:
        return NodeService.unhide_all_nodes()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{node_id}/visibility")
async def set_node_visibility(
    node_id: str,
    request: ToggleVisibilityRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Ręczne ukrycie lub odkrycie pojedynczego węzła przez administratora.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Tylko administrator może modyfikować widoczność węzła.")
    try:
        res = NodeService.set_node_visibility(node_id, request.is_hidden)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{node_id}/block")
async def set_node_blocked(
    node_id: str,
    request: BlockNodeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Alias wstecznej kompatybilności dla set_node_visibility."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Tylko administrator może modyfikować widoczność węzła.")
    try:
        res = NodeService.set_node_visibility(node_id, request.is_blocked)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{node_id}/lessons")
async def get_node_lessons(node_id: str):
    """
    Pulls all lessons (subtopics) associated with a specific node (topic).
    """
    try:
        return NodeService.get_lessons_for_node(node_id)
    except Exception as e:
        return {"error": str(e)}

@router.put("/positions")
async def update_node_positions(request: UpdatePositionsRequest):
    """
    Updates the physical X and Y coordinates for topic nodes.
    """
    try:
        return NodeService.update_node_positions(request.positions)
    except Exception as e:
        return {"error": str(e)}
