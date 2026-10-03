from fastapi import APIRouter
from services.node_service import NodeService
from schemas.node import UpdatePositionsRequest

router = APIRouter(prefix="/api/v1/nodes", tags=["Nodes & Graph"])

@router.get("")
async def get_nodes():
    """
    Pulls all nodes and their connections from the PostgreSQL database.
    """
    try:
        return NodeService.get_all_nodes_and_edges()
    except Exception as e:
        return {"error": str(e)}

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
