"""Announcements routes - public announcement endpoints."""

from fastapi import APIRouter
from app.core.database import get_database

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])


def serialize(item: dict) -> dict:
    if item is None:
        return None
    item["id"] = str(item.pop("_id"))
    return item


@router.get("")
async def get_announcements():
    """Get all published announcements."""
    db = get_database()
    announcements = db.announcements.find(
        {"$or": [{"status": "published"}, {"published": True}]}
    ).sort("created_at", -1)
    result = [serialize(a) for a in announcements]
    return {"announcements": result, "count": len(result)}
