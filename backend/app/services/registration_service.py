"""Registration service - business logic for registration management."""

import re
from datetime import datetime, timezone
from typing import Optional, Tuple, List
from bson import ObjectId
from pymongo.database import Database
from app.utils.registration_id import generate_registration_id


def serialize_registration(reg: dict) -> dict:
    """Convert MongoDB registration document to API response format."""
    if reg is None:
        return None
    reg["id"] = str(reg.pop("_id"))
    return reg


def get_next_sequence(db: Database, event_slug: str) -> int:
    """Get the next sequence number for registration IDs using an atomic counter."""
    result = db.counters.find_one_and_update(
        {"_id": f"reg_{event_slug}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return result["seq"]


def create_registration(db: Database, reg_data: dict, event: dict) -> dict:
    """Create a new registration after validation and persist in MongoDB."""
    now = datetime.now(timezone.utc)
    
    # Generate unique collision-safe registration ID
    seq = get_next_sequence(db, event["slug"])
    registration_id = generate_registration_id(event["slug"], seq)
    
    is_team = (event.get("participation_type") == "team" or event.get("team_event") is True)
    
    reg_data["registration_id"] = registration_id
    reg_data["event_id"] = event.get("event_id") or str(event.get("id"))
    reg_data["event_object_id"] = str(event.get("id"))
    reg_data["event_name"] = event["name"]
    reg_data["category"] = event.get("category", "")
    reg_data["event_category"] = event.get("category", "")
    reg_data["event_division"] = event.get("division", "")
    reg_data["event_slug"] = event["slug"]
    reg_data["registration_type"] = "team" if is_team else "solo"
    reg_data["participation_type"] = reg_data["registration_type"]
    
    # Normalize participant structure for Phase 5 compliance
    reg_data["participant"] = {
        "name": reg_data.get("participant_name"),
        "email": reg_data.get("email"),
        "phone": reg_data.get("phone"),
        "college": reg_data.get("college"),
    }
    
    # Normalize team structure if team event
    if is_team or reg_data.get("team_name"):
        reg_data["team"] = {
            "name": reg_data.get("team_name"),
            "captain": reg_data.get("participant_name"),
            "members": reg_data.get("team_members", [])
        }
    
    reg_data["status"] = reg_data.get("status") or "confirmed"
    reg_data["created_at"] = now
    reg_data["updated_at"] = now
    
    result = db.registrations.insert_one(reg_data)
    reg_data["id"] = str(result.inserted_id)
    reg_data.pop("_id", None)
    return reg_data


def check_duplicate_registration(
    db: Database,
    email: Optional[str],
    event: dict,
    team_name: Optional[str] = None
) -> bool:
    """Check if a participant or team has already registered for the same event."""
    event_ids = []
    if event.get("event_id"):
        event_ids.append(event["event_id"])
    if event.get("id"):
        event_ids.append(str(event["id"]))
    if event.get("slug"):
        event_ids.append(event["slug"])
    
    is_team = (event.get("participation_type") == "team" or event.get("team_event") is True)
    
    event_match = {"$or": [{"event_id": {"$in": event_ids}}, {"event_object_id": {"$in": event_ids}}]}
    
    if is_team and team_name:
        # Check team name duplication in this event
        safe_team = re.escape(team_name.strip())
        existing_team = db.registrations.find_one({
            "$and": [
                event_match,
                {"team_name": {"$regex": f"^{safe_team}$", "$options": "i"}},
                {"status": {"$ne": "cancelled"}}
            ]
        })
        if existing_team:
            return True

    # Check participant/captain email duplication in this event
    if email:
        safe_email = re.escape(email.strip())
        existing_email = db.registrations.find_one({
            "$and": [
                event_match,
                {"email": {"$regex": f"^{safe_email}$", "$options": "i"}},
                {"status": {"$ne": "cancelled"}}
            ]
        })
        if existing_email:
            return True
            
    return False


def get_registration_by_id(db: Database, registration_id: str) -> Optional[dict]:
    """Get a registration by its registration ID or ObjectId."""
    # Sanitize input: ensure it is a string and remove unsafe characters
    if not isinstance(registration_id, str):
        return None
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "", registration_id)
    query = {"registration_id": clean_id}
    reg = db.registrations.find_one(query)
    if not reg and ObjectId.is_valid(clean_id):
        try:
            reg = db.registrations.find_one({"_id": ObjectId(clean_id)})
        except Exception:
            pass
    return serialize_registration(reg) if reg else None


def get_registration_by_object_id(db: Database, object_id: str) -> Optional[dict]:
    """Get a registration by MongoDB ObjectId or registration_id."""
    return get_registration_by_id(db, object_id)


def search_registrations(db: Database, filters: dict) -> Tuple[List[dict], int]:
    """Search and filter registrations with pagination. Returns (registrations, total_count)."""
    query = {}
    
    if filters.get("event_id"):
        eid = str(filters["event_id"])
        query["$or"] = [{"event_id": eid}, {"event_object_id": eid}, {"event_slug": eid}]
    if filters.get("category"):
        safe_cat = re.escape(str(filters["category"]).strip())
        query["$or"] = [
            {"category": {"$regex": f"^{safe_cat}$", "$options": "i"}},
            {"event_category": {"$regex": f"^{safe_cat}$", "$options": "i"}},
        ]
    if filters.get("division"):
        safe_div = re.escape(str(filters["division"]).strip())
        query["event_division"] = {"$regex": f"^{safe_div}$", "$options": "i"}
    if filters.get("status"):
        safe_stat = re.escape(str(filters["status"]).strip())
        query["status"] = {"$regex": f"^{safe_stat}$", "$options": "i"}
    
    if filters.get("search"):
        search_term = re.escape(str(filters["search"]).strip())
        query["$or"] = [
            {"participant_name": {"$regex": search_term, "$options": "i"}},
            {"email": {"$regex": search_term, "$options": "i"}},
            {"phone": {"$regex": search_term, "$options": "i"}},
            {"registration_id": {"$regex": search_term, "$options": "i"}},
            {"college": {"$regex": search_term, "$options": "i"}},
            {"team_name": {"$regex": search_term, "$options": "i"}},
        ]
    
    if filters.get("date_from") or filters.get("date_to"):
        date_query = {}
        if filters.get("date_from"):
            try:
                date_query["$gte"] = datetime.fromisoformat(filters["date_from"])
            except Exception:
                pass
        if filters.get("date_to"):
            try:
                date_query["$lte"] = datetime.fromisoformat(filters["date_to"])
            except Exception:
                pass
        if date_query:
            query["created_at"] = date_query
    
    page = filters.get("page", 1)
    limit = filters.get("limit", 20)
    skip = (page - 1) * limit
    
    total = db.registrations.count_documents(query)
    registrations = (
        db.registrations.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    return [serialize_registration(r) for r in registrations], total


def update_registration(db: Database, reg_id: str, update_data: dict) -> Optional[dict]:
    """Update a registration's status, notes, or details."""
    try:
        update_data = {k: v for k, v in update_data.items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc)
        filter_query = {}
        if ObjectId.is_valid(reg_id):
            filter_query = {"_id": ObjectId(reg_id)}
        else:
            filter_query = {"registration_id": reg_id}
        result = db.registrations.find_one_and_update(
            filter_query,
            {"$set": update_data},
            return_document=True
        )
        return serialize_registration(result) if result else None
    except Exception:
        return None


def delete_registration(db: Database, reg_id: str) -> bool:
    """Delete a registration."""
    try:
        filter_query = {}
        if ObjectId.is_valid(reg_id):
            filter_query = {"_id": ObjectId(reg_id)}
        else:
            filter_query = {"registration_id": reg_id}
        result = db.registrations.delete_one(filter_query)
        return result.deleted_count > 0
    except Exception:
        return False


def get_all_registrations_for_export(db: Database, filters: dict) -> list:
    """Get all registrations matching filters (no pagination) for export."""
    query = {}
    if filters.get("event_id"):
        eid = filters["event_id"]
        query["$or"] = [{"event_id": eid}, {"event_object_id": eid}, {"event_slug": eid}]
    if filters.get("category"):
        query["$or"] = [
            {"category": {"$regex": f"^{filters['category']}$", "$options": "i"}},
            {"event_category": {"$regex": f"^{filters['category']}$", "$options": "i"}},
        ]
    if filters.get("division"):
        query["event_division"] = {"$regex": f"^{filters['division']}$", "$options": "i"}
    if filters.get("status"):
        query["status"] = {"$regex": f"^{filters['status']}$", "$options": "i"}
    
    registrations = db.registrations.find(query).sort("created_at", -1)
    return [serialize_registration(r) for r in registrations]
