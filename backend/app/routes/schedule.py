"""Schedule routes - public schedule endpoints."""

from fastapi import APIRouter, Query
from typing import Optional
from app.core.database import get_database
from bson import ObjectId

router = APIRouter(prefix="/api/schedule", tags=["Schedule"])


def serialize_schedule(item: dict) -> dict:
    if item is None:
        return None
    item["id"] = str(item.pop("_id"))
    return item


@router.get("")
async def get_schedule(
    category: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    venue: Optional[str] = Query(None),
):
    """Get the event schedule with optional filters."""
    db = get_database()
    query = {}
    if category:
        query["category"] = category
    if date:
        query["date"] = date
    if venue:
        query["venue"] = {"$regex": venue, "$options": "i"}
    
    schedules = db.schedules.find(query).sort([("date", 1), ("start_time", 1)])
    result = [serialize_schedule(s) for s in schedules]
    return {"schedule": result, "count": len(result)}
