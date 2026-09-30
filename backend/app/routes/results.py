"""Results routes - public results endpoints."""

from fastapi import APIRouter, Query
from typing import Optional
from bson import ObjectId
from app.core.database import get_database

router = APIRouter(prefix="/api/results", tags=["Results"])


def serialize(item: dict) -> dict:
    if item is None:
        return None
    item["id"] = str(item.pop("_id"))
    return item


@router.get("")
async def get_results(category: Optional[str] = Query(None)):
    """Get all published results, optionally filtered by category."""
    db = get_database()
    query = {"status": "published"}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    results = db.results.find(query).sort("created_at", -1)
    result_list = [serialize(r) for r in results]
    return {"results": result_list, "count": len(result_list)}


@router.get("/{event_id}")
async def get_results_by_event(event_id: str):
    """Get published results for a specific event (by event_id, slug, or ObjectId)."""
    db = get_database()
    match_conditions = [
        {"event_id": event_id},
        {"event_id": {"$regex": f"^{event_id}$", "$options": "i"}},
        {"slug": event_id},
        {"event_slug": event_id},
    ]
    if ObjectId.is_valid(event_id):
        match_conditions.append({"_id": ObjectId(event_id)})
        match_conditions.append({"event_object_id": ObjectId(event_id)})
    
    query = {
        "status": "published",
        "$or": match_conditions
    }
    results = db.results.find(query).sort("position", 1)
    result_list = [serialize(r) for r in results]
    return {"results": result_list, "count": len(result_list)}
