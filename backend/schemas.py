from pydantic import BaseModel
from typing import List, Optional


class CourseBase(BaseModel):
    code: str
    name: str
    credits: int = 3
    description: str = ""


class CourseCreate(CourseBase):
    pass


class CourseUpdate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: int
    completed: bool

    model_config = {"from_attributes": True}


class PrerequisiteRequest(BaseModel):
    prerequisite_id: int


class GraphNode(BaseModel):
    id: int
    code: str
    name: str
    credits: int
    completed: bool


class GraphEdge(BaseModel):
    source: int
    target: int


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
