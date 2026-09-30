"""Contact routes - public contact form endpoint."""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
from app.core.database import get_database
from app.schemas.auth import ContactCreate
from app.utils.security import sanitize_text

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_contact(data: ContactCreate):
    """Submit a contact form message with input sanitization."""
    db = get_database()
    
    message = data.model_dump()
    # Sanitize user inputs to protect against Stored XSS
    message["name"] = sanitize_text(message.get("name", ""))
    message["subject"] = sanitize_text(message.get("subject", ""))
    message["message"] = sanitize_text(message.get("message", ""))
    if message.get("phone"):
        message["phone"] = sanitize_text(message.get("phone", ""))
        
    message["created_at"] = datetime.now(timezone.utc)
    message["read"] = False
    
    db.contact_messages.insert_one(message)
    
    return {"message": "Your message has been sent successfully. We'll get back to you soon!"}
