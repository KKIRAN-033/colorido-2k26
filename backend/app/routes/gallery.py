"""Gallery routes - public gallery endpoints."""

from fastapi import APIRouter, Query
from typing import Optional
from app.core.database import get_database

router = APIRouter(prefix="/api/gallery", tags=["Gallery"])


def serialize(item: dict) -> dict:
    if item is None:
        return None
    item["id"] = str(item.pop("_id"))
    return item


@router.get("")
async def get_gallery(
    category: Optional[str] = Query(None),
    event_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
):
    """Get published gallery images with pagination and filters."""
    db = get_database()
    query = {"status": "published"}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if event_id:
        query["event_id"] = event_id
    
    skip = (page - 1) * limit
    total = db.gallery.count_documents(query)
    images = db.gallery.find(query).sort("created_at", -1).skip(skip).limit(limit)
    result = [serialize(img) for img in images]
    
    return {
        "images": result,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }
