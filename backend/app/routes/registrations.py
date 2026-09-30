import re
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from app.core.database import get_database
from app.schemas.registration import RegistrationCreate
from app.utils.security import sanitize_text, sanitize_filename
from app.services.registration_service import (
    create_registration,
    check_duplicate_registration,
    get_registration_by_id,
)
from app.services.event_service import get_event_by_id
from app.services.export_service import generate_registration_pdf

router = APIRouter(prefix="/api/registrations", tags=["Registrations"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@router.post("", status_code=status.HTTP_201_CREATED)
async def register(data: RegistrationCreate):
    """Create a new registration for an event."""
    db = get_database()
    
    # 1. Validate event exists
    event = get_event_by_id(db, data.event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # 2. Check registration is open
    if not event.get("registration_open", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is closed for this event"
        )
    
    # 3. Check registration deadline if specified
    deadline_str = event.get("registration_deadline")
    if deadline_str:
        try:
            # support YYYY-MM-DD
            deadline_date = datetime.fromisoformat(deadline_str).replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > deadline_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Registration deadline ({deadline_str}) has passed"
                )
        except (ValueError, TypeError):
            pass

    # 4. Required fields validation
    if not data.email or not EMAIL_REGEX.match(data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid email address is required"
        )
    
    if not data.phone or len(re.sub(r"\D", "", data.phone)) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid phone number with at least 10 digits is required"
        )
        
    if not data.college or not data.college.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College name is required"
        )
        
    is_team = (event.get("participation_type") == "team" or event.get("team_event") is True)
    
    if is_team:
        if not data.team_name or not data.team_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name is required for team events"
            )
    else:
        if not data.participant_name or not data.participant_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Participant name is required"
            )

    # 5. Check duplicate registration (returns 409)
    if check_duplicate_registration(db, data.email, event, team_name=data.team_name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate registration: A registration already exists for this event with this email or team name"
        )
    
    # 6. Validate team size for team events
    if is_team:
        min_size = event.get("min_team_size", 2)
        max_size = event.get("max_team_size", 15)
        
        member_count = 1  # Captain counts as 1
        if data.team_members:
            # filter non-empty member entries
            valid_members = [
                m for m in data.team_members 
                if (isinstance(m, dict) and m.get("name") and m.get("name").strip()) 
                or (hasattr(m, "name") and m.name and m.name.strip())
            ]
            member_count += len(valid_members)
            
        if member_count < min_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team must have at least {min_size} members (including captain). Current: {member_count}"
            )
        if member_count > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team cannot exceed {max_size} members. Current: {member_count}"
            )
    
    # 7. Check max participants if set
    if event.get("max_participants"):
        current_count = db.registrations.count_documents({
            "$or": [
                {"event_id": event.get("event_id")},
                {"event_object_id": str(event.get("id"))},
                {"event_slug": event.get("slug")}
            ],
            "status": {"$ne": "cancelled"}
        })
        if current_count >= event["max_participants"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum registrations reached for this event"
            )
    
    # 8. Sanitize text fields to protect against XSS
    reg_data = data.model_dump(exclude_unset=True)
    if reg_data.get("participant_name"):
        reg_data["participant_name"] = sanitize_text(reg_data["participant_name"])
    if reg_data.get("college"):
        reg_data["college"] = sanitize_text(reg_data["college"])
    if reg_data.get("team_name"):
        reg_data["team_name"] = sanitize_text(reg_data["team_name"])
    if reg_data.get("team_members"):
        for m in reg_data["team_members"]:
            if isinstance(m, dict) and m.get("name"):
                m["name"] = sanitize_text(m["name"])

    # 9. Create registration in MongoDB
    registration = create_registration(db, reg_data, event)
    
    return {
        "success": True,
        "message": "Registration successful!",
        "registration": registration
    }


@router.get("/{registration_id}/pdf")
async def download_registration_pdf(registration_id: str):
    """Download official certified PDF registration pass for participant."""
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "", registration_id)
    db = get_database()
    reg = get_registration_by_id(db, clean_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration '{clean_id}' not found"
        )
    output = generate_registration_pdf(reg)
    raw_filename = f"COLORIDO_{reg.get('registration_id', 'PASS')}_OfficialPass.pdf"
    safe_filename = sanitize_filename(raw_filename)
    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.get("/{registration_id}")
async def get_registration(registration_id: str):
    """Get registration details by registration ID (e.g., CLR26-BSK-00001)."""
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "", registration_id)
    db = get_database()
    reg = get_registration_by_id(db, clean_id)
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration '{clean_id}' not found"
        )
    return reg
