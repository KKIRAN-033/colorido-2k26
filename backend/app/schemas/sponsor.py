from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SponsorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    logo_url: Optional[str] = None
    website: Optional[str] = None
    tier: str = Field(default="partner", description="title, platinum, gold, silver, partner")
    display_order: int = Field(default=0)
    active: bool = Field(default=True)


class SponsorCreate(SponsorBase):
    pass


class SponsorUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    tier: Optional[str] = None
    display_order: Optional[int] = None
    active: Optional[bool] = None


class SponsorResponse(SponsorBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
