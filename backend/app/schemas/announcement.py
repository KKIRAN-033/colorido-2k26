from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AnnouncementBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    content: str = Field(..., min_length=1)
    priority: str = Field(default="normal", description="low, normal, high, urgent")
    status: str = Field(default="draft", description="draft, published, unpublished")


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class AnnouncementResponse(AnnouncementBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
