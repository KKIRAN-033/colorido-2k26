from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ScheduleBase(BaseModel):
    event_id: str
    event_name: str
    category: str
    division: Optional[str] = None
    date: str = Field(..., description="YYYY-MM-DD")
    start_time: str = Field(..., description="HH:MM")
    end_time: str = Field(..., description="HH:MM")
    venue: str = Field(default="TBA")
    status: str = Field(default="scheduled", description="scheduled, ongoing, completed, postponed, cancelled")


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    category: Optional[str] = None
    division: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    status: Optional[str] = None


class ScheduleResponse(ScheduleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
