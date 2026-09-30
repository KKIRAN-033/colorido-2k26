"""Event service - business logic for event management."""

from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from pymongo.database import Database


def serialize_event(event: dict) -> dict:
    """Convert MongoDB event document to API response format."""
    if event is None:
        return None
    event["id"] = str(event.pop("_id"))
    return event


def get_all_events(
    db: Database,
    category: Optional[str] = None,
    division: Optional[str] = None
) -> list:
    """Get all events, optionally filtered by category and division."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if division:
        query["division"] = {"$regex": f"^{division}$", "$options": "i"}
    events = db.events.find(query).sort("display_order", 1)
    return [serialize_event(e) for e in events]


def get_event_by_slug(db: Database, slug: str) -> Optional[dict]:
    """Get a single event by its slug."""
    event = db.events.find_one({"slug": slug})
    return serialize_event(event) if event else None


def get_event_by_id(db: Database, event_id: str) -> Optional[dict]:
    """Get a single event by its ObjectId, slug, event_id, or string id."""
    if not event_id:
        return None
    try:
        if ObjectId.is_valid(event_id):
            event = db.events.find_one({"_id": ObjectId(event_id)})
            if event:
                return serialize_event(event)
    except Exception:
        pass
    event = db.events.find_one({
        "$or": [
            {"slug": event_id},
            {"event_id": event_id},
            {"id": event_id},
            {"event_id": {"$regex": f"^{event_id}$", "$options": "i"}},
            {"slug": {"$regex": f"^{event_id}$", "$options": "i"}},
        ]
    })
    return serialize_event(event) if event else None


def create_event(db: Database, event_data: dict) -> dict:
    """Create a new event."""
    now = datetime.now(timezone.utc)
    event_data["created_at"] = now
    event_data["updated_at"] = now
    result = db.events.insert_one(event_data)
    event_data["id"] = str(result.inserted_id)
    event_data.pop("_id", None)
    return event_data


def update_event(db: Database, event_id: str, update_data: dict) -> Optional[dict]:
    """Update an existing event."""
    try:
        update_data["updated_at"] = datetime.now(timezone.utc)
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        filter_query = {}
        if ObjectId.is_valid(event_id):
            filter_query = {"_id": ObjectId(event_id)}
        else:
            filter_query = {"$or": [{"event_id": event_id}, {"slug": event_id}]}
        result = db.events.find_one_and_update(
            filter_query,
            {"$set": update_data},
            return_document=True
        )
        return serialize_event(result) if result else None
    except Exception:
        return None


def delete_event(db: Database, event_id: str) -> bool:
    """Delete an event."""
    try:
        filter_query = {}
        if ObjectId.is_valid(event_id):
            filter_query = {"_id": ObjectId(event_id)}
        else:
            filter_query = {"$or": [{"event_id": event_id}, {"slug": event_id}]}
        result = db.events.delete_one(filter_query)
        return result.deleted_count > 0
    except Exception:
        return False

