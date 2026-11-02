from pydantic import BaseModel
from typing import List

class NodePosition(BaseModel):
    id: str
    x: int
    y: int

class UpdatePositionsRequest(BaseModel):
    positions: List[NodePosition]

class ToggleVisibilityRequest(BaseModel):
    is_hidden: bool

class BlockNodeRequest(BaseModel):
    is_blocked: bool
