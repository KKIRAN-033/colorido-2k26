from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ResultBase(BaseModel):
    event_id: str
    event_name: str
    category: str
    division: Optional[str] = None
    position: str = Field(..., description="1st, 2nd, 3rd, etc.")
    participant_name: str
    team_name: Optional[str] = None
    college: Optional[str] = None
    score: Optional[str] = None
    remarks: Optional[str] = None
    status: str = Field(default="draft", description="draft, published")


class ResultCreate(ResultBase):
    pass


class ResultUpdate(BaseModel):
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    category: Optional[str] = None
    division: Optional[str] = None
    position: Optional[str] = None
    participant_name: Optional[str] = None
    team_name: Optional[str] = None
    college: Optional[str] = None
    score: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = None


class ResultResponse(ResultBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
