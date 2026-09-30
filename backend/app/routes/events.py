"""Events routes - public and administrative event endpoints."""

from fastapi import APIRouter, HTTPException, status, Query, Depends
from typing import Optional
from app.core.database import get_database
from app.core.security import get_current_admin
from app.schemas.event import EventCreate, EventUpdate
from app.services.event_service import (
    get_all_events,
    get_event_by_id,
    create_event,
    update_event,
    delete_event,
)

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("")
async def list_events(
    category: Optional[str] = Query(None, description="Sports or Cultural"),
    division: Optional[str] = Query(None, description="Boys, Girls, Solo, Group"),
):
    """Get all events, optionally filtered by category and/or division."""
    db = get_database()
    events = get_all_events(db, category=category, division=division)
    return {"events": events, "count": len(events)}


@router.get("/category/cultural")
async def get_cultural_events():
    """Get all cultural events."""
    db = get_database()
    events = get_all_events(db, category="cultural")
    return {"events": events, "count": len(events)}


@router.get("/category/sports")
async def get_sports_events(division: Optional[str] = Query(None)):
    """Get all sports events, optionally filtered by division."""
    db = get_database()
    events = get_all_events(db, category="sports", division=division)
    return {"events": events, "count": len(events)}


@router.get("/{event_id}")
async def get_event(event_id: str):
    """Get a single event by event_id, slug, or MongoDB ObjectId."""
    db = get_database()
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found"
        )
    return event


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
async def create_new_event(data: EventCreate):
    """Create a new event (admin only)."""
    db = get_database()
    if db.events.find_one({"slug": data.slug}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event with this slug already exists"
        )
    if data.event_id and db.events.find_one({"event_id": data.event_id}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Event with this event_id already exists"
        )
    event = create_event(db, data.model_dump())
    return event


@router.put("/{event_id}", dependencies=[Depends(get_current_admin)])
async def update_existing_event(event_id: str, data: EventUpdate):
    """Update an existing event (admin only)."""
    db = get_database()
    update_data = data.model_dump(exclude_unset=True)
    event = update_event(db, event_id, update_data)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event


@router.delete("/{event_id}", dependencies=[Depends(get_current_admin)])
async def delete_existing_event(event_id: str):
    """Delete an event (admin only)."""
    db = get_database()
    if not delete_event(db, event_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return {"message": "Event deleted successfully"}
