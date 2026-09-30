from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EventBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., description="cultural or sports")
    event_id: Optional[str] = Field(None, description="e.g. CLR26-BSK")
    division: Optional[str] = Field(None, description="e.g., boys, girls, solo, group")
    sub_category: Optional[str] = Field(None, description="e.g., Music & Band, Dance")
    description: str = Field(default="Details coming soon.")
    rules: str = Field(default="Rules will be announced soon.")
    eligibility: str = Field(default="Open to all eligible participants.")
    team_event: bool = Field(default=False)
    participation_type: str = Field(default="solo", description="solo or team")
    max_participants: Optional[int] = Field(None, ge=1)
    max_team_size: Optional[int] = Field(None, ge=1)
    min_team_size: Optional[int] = Field(None, ge=1)
    venue: str = Field(default="TBA")
    character: Optional[str] = Field(None, description="e.g. Hulk, Vision")
    character_name: Optional[str] = None
    character_id: Optional[str] = None
    character_asset: Optional[str] = None
    registration_open: bool = Field(default=True)
    registration_deadline: Optional[str] = None
    event_image: Optional[str] = None
    event_number: Optional[int] = None
    display_order: int = Field(default=0)


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    name: Optional[str] = None
    event_id: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    division: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    eligibility: Optional[str] = None
    team_event: Optional[bool] = None
    participation_type: Optional[str] = None
    max_participants: Optional[int] = None
    max_team_size: Optional[int] = None
    min_team_size: Optional[int] = None
    venue: Optional[str] = None
    character: Optional[str] = None
    character_name: Optional[str] = None
    character_id: Optional[str] = None
    character_asset: Optional[str] = None
    event_image: Optional[str] = None
    registration_open: Optional[bool] = None
    registration_deadline: Optional[str] = None
    event_number: Optional[int] = None
    display_order: Optional[int] = None


class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

