from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GalleryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    image_url: str
    thumbnail_url: Optional[str] = None
    category: str = Field(default="general", description="cultural, sports, general, behind-the-scenes")
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    status: str = Field(default="published", description="draft, published")


class GalleryCreate(GalleryBase):
    pass


class GalleryResponse(GalleryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
