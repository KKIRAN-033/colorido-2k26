from pydantic import BaseModel, Field, EmailStr, model_validator
from typing import Optional, List, Any, Dict, Union
from datetime import datetime


class TeamMember(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = None


class Participant(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None


class Team(BaseModel):
    name: str
    captain: Optional[Any] = None
    members: Optional[List[Any]] = None


class RegistrationCreate(BaseModel):
    event_id: str = Field(..., description="Event ID, slug, or MongoDB ObjectId")
    participant_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    registration_type: Optional[str] = None
    participant: Optional[Union[Dict[str, Any], Participant]] = None
    team: Optional[Union[Dict[str, Any], Team]] = None
    team_name: Optional[str] = None
    team_members: Optional[List[Any]] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, values):
        if not isinstance(values, dict):
            return values

        # Normalize participant object
        part = values.get("participant")
        if isinstance(part, dict):
            if not values.get("participant_name") and part.get("name"):
                values["participant_name"] = part["name"]
            if not values.get("email") and part.get("email"):
                values["email"] = part["email"]
            if not values.get("phone") and part.get("phone"):
                values["phone"] = part["phone"]
            if not values.get("college") and part.get("college"):
                values["college"] = part["college"]

        # Normalize team object
        tm = values.get("team")
        if isinstance(tm, dict):
            if not values.get("team_name") and tm.get("name"):
                values["team_name"] = tm["name"]
            captain = tm.get("captain")
            if isinstance(captain, dict):
                if not values.get("participant_name") and captain.get("name"):
                    values["participant_name"] = captain["name"]
                if not values.get("email") and captain.get("email"):
                    values["email"] = captain["email"]
                if not values.get("phone") and captain.get("phone"):
                    values["phone"] = captain["phone"]
            elif isinstance(captain, str) and not values.get("participant_name"):
                values["participant_name"] = captain
            if not values.get("team_members") and tm.get("members"):
                values["team_members"] = tm["members"]

        return values


class RegistrationUpdate(BaseModel):
    status: Optional[str] = Field(None, description="pending, confirmed, cancelled, attended")
    notes: Optional[str] = None


class RegistrationResponse(BaseModel):
    id: str
    registration_id: str
    event_id: str
    event_name: Optional[str] = None
    category: Optional[str] = None
    event_category: Optional[str] = None
    event_division: Optional[str] = None
    participant_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    team_name: Optional[str] = None
    team_members: Optional[List[Any]] = None
    participant: Optional[Dict[str, Any]] = None
    team: Optional[Dict[str, Any]] = None
    registration_type: Optional[str] = None
    participation_type: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RegistrationSearchParams(BaseModel):
    event_id: Optional[str] = None
    category: Optional[str] = None
    division: Optional[str] = None
    status: Optional[str] = None
    search: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
