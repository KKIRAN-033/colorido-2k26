"""Sponsors routes - public sponsor endpoints."""

from fastapi import APIRouter
from app.core.database import get_database

router = APIRouter(prefix="/api/sponsors", tags=["Sponsors"])


def serialize(item: dict) -> dict:
    if item is None:
        return None
    item["id"] = str(item.pop("_id"))
    return item


@router.get("")
async def get_sponsors():
    """Get all active sponsors sorted by tier and display order."""
    db = get_database()
    
    tier_order = {"title": 0, "platinum": 1, "gold": 2, "silver": 3, "partner": 4}
    
    sponsors = db.sponsors.find({"active": True}).sort([("display_order", 1)])
    result = [serialize(s) for s in sponsors]
    
    # Sort by tier priority
    result.sort(key=lambda s: tier_order.get(s.get("tier", "partner"), 99))
    
    return {"sponsors": result, "count": len(result)}
