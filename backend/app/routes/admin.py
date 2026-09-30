"""Admin routes - all protected admin CRUD endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from app.core.database import get_database
from app.core.security import get_current_admin
from app.schemas.event import EventCreate, EventUpdate
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate
from app.schemas.result import ResultCreate, ResultUpdate
from app.schemas.sponsor import SponsorCreate, SponsorUpdate
from app.schemas.gallery import GalleryCreate
from app.services.event_service import create_event, update_event, delete_event, get_all_events
from app.services.registration_service import (
    search_registrations,
    get_registration_by_object_id,
    update_registration,
    delete_registration,
    get_all_registrations_for_export,
)
from app.services.export_service import (
    generate_csv,
    generate_excel,
    generate_registration_pdf,
    generate_bulk_pdf,
)
from app.services.upload_service import upload_image
from app.utils.security import (
    validate_image_upload,
    is_safe_external_url,
    sanitize_filename,
    sanitize_text,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def serialize(item: dict) -> dict:
    """Convert MongoDB doc to JSON-safe dict."""
    if item is None:
        return None
    item["id"] = str(item.pop("_id"))
    return item


# ── Dashboard ─────────────────────────────────────────────

@router.get("/dashboard/stats", dependencies=[Depends(get_current_admin)])
async def get_dashboard_stats():
    """Get standalone dashboard statistics as required by Phase 13."""
    db = get_database()
    
    total_registrations = db.registrations.count_documents({})
    cultural_registrations = db.registrations.count_documents({
        "$or": [
            {"event_category": {"$regex": "^cultural$", "$options": "i"}},
            {"category": {"$regex": "^cultural$", "$options": "i"}}
        ]
    })
    sports_registrations = db.registrations.count_documents({
        "$or": [
            {"event_category": {"$regex": "^sports$", "$options": "i"}},
            {"category": {"$regex": "^sports$", "$options": "i"}}
        ]
    })
    total_events = db.events.count_documents({})
    upcoming_events = db.schedules.count_documents({"status": {"$in": ["scheduled", "ongoing"]}})
    if upcoming_events == 0:
        upcoming_events = total_events
    pending_contacts = db.contact_messages.count_documents({
        "$or": [{"read": False}, {"status": "pending"}]
    })
    published_results = db.results.count_documents({"status": "published"})

    return {
        "total_registrations": total_registrations,
        "cultural_registrations": cultural_registrations,
        "sports_registrations": sports_registrations,
        "total_events": total_events,
        "upcoming_events": upcoming_events,
        "pending_contacts": pending_contacts,
        "published_results": published_results,
    }


@router.get("/dashboard", dependencies=[Depends(get_current_admin)])
async def get_dashboard():
    """Get dashboard statistics and recent activity."""
    db = get_database()
    stats = await get_dashboard_stats()
    
    # Extended metrics
    stats["confirmed_registrations"] = db.registrations.count_documents({"status": "confirmed"})
    stats["pending_registrations"] = db.registrations.count_documents({"status": "pending"})
    stats["total_announcements"] = db.announcements.count_documents({})
    stats["published_announcements"] = db.announcements.count_documents({"status": "published"})
    stats["total_results"] = db.results.count_documents({})
    stats["total_gallery"] = db.gallery.count_documents({})
    stats["total_sponsors"] = db.sponsors.count_documents({"active": True})
    stats["total_messages"] = db.contact_messages.count_documents({})
    stats["unread_messages"] = stats["pending_contacts"]
    
    # Recent registrations
    recent_regs = db.registrations.find().sort("created_at", -1).limit(5)
    recent = [serialize(r) for r in recent_regs]
    
    return {
        "stats": stats,
        "recent_registrations": recent
    }


# ── Events ────────────────────────────────────────────────

@router.post("/events", dependencies=[Depends(get_current_admin)], status_code=status.HTTP_201_CREATED)
async def admin_create_event(data: EventCreate):
    """Create a new event."""
    db = get_database()
    # Check slug uniqueness
    if db.events.find_one({"slug": data.slug}):
        raise HTTPException(status_code=409, detail="Event with this slug already exists")
    event = create_event(db, data.model_dump())
    return event


@router.put("/events/{event_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_event(event_id: str, data: EventUpdate):
    """Update an event."""
    db = get_database()
    update_data = data.model_dump(exclude_unset=True)
    event = update_event(db, event_id, update_data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/events/{event_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_event(event_id: str):
    """Delete an event."""
    db = get_database()
    if not delete_event(db, event_id):
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}


# ── Registrations ─────────────────────────────────────────

@router.get("/registrations", dependencies=[Depends(get_current_admin)])
async def admin_list_registrations(
    event_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    division: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """List registrations with filters and pagination."""
    db = get_database()
    filters = {
        "event_id": event_id,
        "category": category,
        "division": division,
        "status": status_filter,
        "search": search,
        "date_from": date_from,
        "date_to": date_to,
        "page": page,
        "limit": limit,
    }
    registrations, total = search_registrations(db, filters)
    return {
        "registrations": registrations,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total > 0 else 0
    }


@router.get("/registrations/{reg_id}", dependencies=[Depends(get_current_admin)])
async def admin_get_registration(reg_id: str):
    """Get a single registration by ObjectId."""
    db = get_database()
    reg = get_registration_by_object_id(db, reg_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    return reg


@router.put("/registrations/{reg_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_registration(reg_id: str, data: dict):
    """Update a registration (status, notes)."""
    db = get_database()
    reg = update_registration(db, reg_id, data)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    return reg


@router.delete("/registrations/{reg_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_registration(reg_id: str):
    """Delete a registration."""
    db = get_database()
    if not delete_registration(db, reg_id):
        raise HTTPException(status_code=404, detail="Registration not found")
    return {"message": "Registration deleted successfully"}


# ── Export (Phase 14 & 15) ─────────────────────────────────

@router.get("/registrations/export/csv", dependencies=[Depends(get_current_admin)])
async def admin_export_registrations_csv(
    event_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    division: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """Export registrations as CSV."""
    db = get_database()
    filters = {"event_id": event_id, "category": category, "division": division, "status": status_filter}
    registrations = get_all_registrations_for_export(db, filters)
    output = generate_csv(registrations)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=COLORIDO_Registrations.csv"}
    )


@router.get("/registrations/export/xlsx", dependencies=[Depends(get_current_admin)])
async def admin_export_registrations_xlsx(
    event_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    division: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """Export registrations as Excel XLSX."""
    db = get_database()
    filters = {"event_id": event_id, "category": category, "division": division, "status": status_filter}
    registrations = get_all_registrations_for_export(db, filters)
    output = generate_excel(registrations)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=COLORIDO_Registrations.xlsx"}
    )


@router.get("/registrations/{registration_id}/pdf", dependencies=[Depends(get_current_admin)])
async def admin_export_registration_pdf(registration_id: str):
    """Export a single registration pass as PDF."""
    db = get_database()
    reg = get_registration_by_object_id(db, registration_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    output = generate_registration_pdf(reg)
    filename = f"COLORIDO_{reg.get('registration_id', 'REG')}.pdf"
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/registrations/export/pdf", dependencies=[Depends(get_current_admin)])
async def admin_export_bulk_pdf_post(data: Optional[dict] = None):
    """Bulk export selected registrations or all registrations as PDF."""
    db = get_database()
    registrations = []
    if data and "registration_ids" in data:
        for rid in data["registration_ids"]:
            r = get_registration_by_object_id(db, rid)
            if r:
                registrations.append(r)
    else:
        registrations = get_all_registrations_for_export(db, {})
    output = generate_bulk_pdf(registrations)
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=COLORIDO_Registrations.pdf"}
    )


# Legacy export URLs for frontend compatibility
@router.get("/export/registrations", dependencies=[Depends(get_current_admin)])
async def admin_export_registrations(
    format: str = Query("csv", description="csv, xlsx, or pdf"),
    event_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    division: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """Export registrations as CSV, Excel, or PDF."""
    db = get_database()
    filters = {
        "event_id": event_id,
        "category": category,
        "division": division,
        "status": status_filter,
    }
    registrations = get_all_registrations_for_export(db, filters)
    
    if format == "csv":
        output = generate_csv(registrations)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=COLORIDO_Registrations.csv"}
        )
    elif format == "xlsx":
        output = generate_excel(registrations)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=COLORIDO_Registrations.xlsx"}
        )
    elif format == "pdf":
        output = generate_bulk_pdf(registrations)
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=COLORIDO_Registrations.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use csv, xlsx, or pdf.")


@router.get("/export/registration/{reg_id}/pdf", dependencies=[Depends(get_current_admin)])
async def admin_export_single_registration_pdf(reg_id: str):
    """Export a single registration as PDF (legacy URL)."""
    return await admin_export_registration_pdf(reg_id)



# ── Schedule ──────────────────────────────────────────────

@router.post("/schedule", dependencies=[Depends(get_current_admin)], status_code=status.HTTP_201_CREATED)
async def admin_create_schedule(data: ScheduleCreate):
    """Create a schedule entry."""
    db = get_database()
    schedule_data = data.model_dump()
    schedule_data["created_at"] = datetime.now(timezone.utc)
    result = db.schedules.insert_one(schedule_data)
    schedule_data["id"] = str(result.inserted_id)
    schedule_data.pop("_id", None)
    return schedule_data


@router.put("/schedule/{schedule_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_schedule(schedule_id: str, data: ScheduleUpdate):
    """Update a schedule entry."""
    db = get_database()
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    try:
        result = db.schedules.find_one_and_update(
            {"_id": ObjectId(schedule_id)},
            {"$set": update_data},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Schedule not found")
        return serialize(result)
    except Exception:
        raise HTTPException(status_code=404, detail="Schedule not found")


@router.delete("/schedule/{schedule_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_schedule(schedule_id: str):
    """Delete a schedule entry."""
    db = get_database()
    try:
        result = db.schedules.delete_one({"_id": ObjectId(schedule_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Schedule not found")
        return {"message": "Schedule deleted"}
    except Exception:
        raise HTTPException(status_code=404, detail="Schedule not found")


# ── Announcements ─────────────────────────────────────────

@router.get("/announcements", dependencies=[Depends(get_current_admin)])
async def admin_list_announcements():
    """Get all announcements (including drafts)."""
    db = get_database()
    announcements = db.announcements.find().sort("created_at", -1)
    return {"announcements": [serialize(a) for a in announcements]}


@router.post("/announcements", dependencies=[Depends(get_current_admin)], status_code=status.HTTP_201_CREATED)
async def admin_create_announcement(data: AnnouncementCreate):
    """Create a new announcement."""
    db = get_database()
    ann_data = data.model_dump()
    now = datetime.now(timezone.utc)
    ann_data["created_at"] = now
    ann_data["updated_at"] = now
    result = db.announcements.insert_one(ann_data)
    ann_data["id"] = str(result.inserted_id)
    ann_data.pop("_id", None)
    return ann_data


@router.put("/announcements/{ann_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_announcement(ann_id: str, data: AnnouncementUpdate):
    """Update an announcement."""
    db = get_database()
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    try:
        result = db.announcements.find_one_and_update(
            {"_id": ObjectId(ann_id)},
            {"$set": update_data},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return serialize(result)
    except Exception:
        raise HTTPException(status_code=404, detail="Announcement not found")


@router.delete("/announcements/{ann_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_announcement(ann_id: str):
    """Delete an announcement."""
    db = get_database()
    try:
        result = db.announcements.delete_one({"_id": ObjectId(ann_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return {"message": "Announcement deleted"}
    except Exception:
        raise HTTPException(status_code=404, detail="Announcement not found")


# ── Results ───────────────────────────────────────────────

@router.get("/results", dependencies=[Depends(get_current_admin)])
async def admin_list_results():
    """Get all results (including drafts)."""
    db = get_database()
    results = db.results.find().sort("created_at", -1)
    return {"results": [serialize(r) for r in results]}


@router.post("/results", dependencies=[Depends(get_current_admin)], status_code=status.HTTP_201_CREATED)
async def admin_create_result(data: ResultCreate):
    """Create a new result."""
    db = get_database()
    result_data = data.model_dump()
    result_data["created_at"] = datetime.now(timezone.utc)
    result = db.results.insert_one(result_data)
    result_data["id"] = str(result.inserted_id)
    result_data.pop("_id", None)
    return result_data


@router.put("/results/{result_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_result(result_id: str, data: ResultUpdate):
    """Update a result."""
    db = get_database()
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    try:
        result = db.results.find_one_and_update(
            {"_id": ObjectId(result_id)},
            {"$set": update_data},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        return serialize(result)
    except Exception:
        raise HTTPException(status_code=404, detail="Result not found")


@router.delete("/results/{result_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_result(result_id: str):
    """Delete a result."""
    db = get_database()
    try:
        result = db.results.delete_one({"_id": ObjectId(result_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Result not found")
        return {"message": "Result deleted"}
    except Exception:
        raise HTTPException(status_code=404, detail="Result not found")


# ── Gallery ───────────────────────────────────────────────

@router.get("/gallery", dependencies=[Depends(get_current_admin)])
async def admin_list_gallery():
    """Get all gallery images."""
    db = get_database()
    images = db.gallery.find().sort("created_at", -1)
    return {"images": [serialize(img) for img in images]}


@router.post("/gallery", dependencies=[Depends(get_current_admin)], status_code=status.HTTP_201_CREATED)
async def admin_create_gallery(
    title: str = Form(...),
    category: str = Form("general"),
    event_id: Optional[str] = Form(None),
    event_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
):
    """Upload an image to gallery with strict security validation."""
    db = get_database()
    upload_file = file or image
    
    # 1. Sanitize text fields
    title = sanitize_text(title)
    if event_name:
        event_name = sanitize_text(event_name)

    final_url = ""
    thumbnail_url = ""
    
    # 2. Secure file upload handling
    if upload_file and upload_file.filename:
        # Read file contents into memory to validate size
        file_bytes = await upload_file.read()
        file_size = len(file_bytes)
        
        is_valid, err_msg = validate_image_upload(upload_file.filename, upload_file.content_type, file_size)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=err_msg
            )
            
        safe_filename = sanitize_filename(upload_file.filename)
        # Rewind file buffer for Cloudinary or processor
        upload_file.file.seek(0)
        
        try:
            result = upload_image(upload_file.file)
            final_url = result["url"]
            thumbnail_url = result["thumbnail_url"]
        except Exception as e:
            if image_url and is_safe_external_url(image_url):
                final_url = image_url
                thumbnail_url = image_url
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Image upload service failed: {str(e)}."
                )
    elif image_url:
        # 3. SSRF Defense: validate external URL
        if not is_safe_external_url(image_url):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or prohibited image URL. Must be a safe, public HTTP/HTTPS URL."
            )
        final_url = image_url
        thumbnail_url = image_url
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either an image file or a valid image_url must be provided."
        )
    
    gallery_data = {
        "title": title,
        "image_url": final_url,
        "thumbnail_url": thumbnail_url,
        "category": category,
        "event_id": event_id,
        "event_name": event_name,
        "status": "published",
        "created_at": datetime.now(timezone.utc),
    }
    
    result = db.gallery.insert_one(gallery_data)
    gallery_data["id"] = str(result.inserted_id)
    gallery_data.pop("_id", None)
    return gallery_data


@router.delete("/gallery/{image_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_gallery(image_id: str):
    """Delete a gallery image."""
    db = get_database()
    try:
        result = db.gallery.delete_one({"_id": ObjectId(image_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        return {"message": "Image deleted"}
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")


# ── Sponsors ──────────────────────────────────────────────

@router.get("/sponsors", dependencies=[Depends(get_current_admin)])
async def admin_list_sponsors():
    """Get all sponsors."""
    db = get_database()
    sponsors = db.sponsors.find().sort("display_order", 1)
    return {"sponsors": [serialize(s) for s in sponsors]}


@router.post("/sponsors", dependencies=[Depends(get_current_admin)], status_code=status.HTTP_201_CREATED)
async def admin_create_sponsor(data: SponsorCreate):
    """Create a new sponsor."""
    db = get_database()
    sponsor_data = data.model_dump()
    sponsor_data["created_at"] = datetime.now(timezone.utc)
    result = db.sponsors.insert_one(sponsor_data)
    sponsor_data["id"] = str(result.inserted_id)
    sponsor_data.pop("_id", None)
    return sponsor_data


@router.put("/sponsors/{sponsor_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_sponsor(sponsor_id: str, data: SponsorUpdate):
    """Update a sponsor."""
    db = get_database()
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    try:
        result = db.sponsors.find_one_and_update(
            {"_id": ObjectId(sponsor_id)},
            {"$set": update_data},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail="Sponsor not found")
        return serialize(result)
    except Exception:
        raise HTTPException(status_code=404, detail="Sponsor not found")


@router.delete("/sponsors/{sponsor_id}", dependencies=[Depends(get_current_admin)])
async def admin_delete_sponsor(sponsor_id: str):
    """Delete a sponsor."""
    db = get_database()
    try:
        result = db.sponsors.delete_one({"_id": ObjectId(sponsor_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Sponsor not found")
        return {"message": "Sponsor deleted"}
    except Exception:
        raise HTTPException(status_code=404, detail="Sponsor not found")


# ── Contact Messages (Phase 12) ───────────────────────────

@router.get("/contact", dependencies=[Depends(get_current_admin)])
async def admin_list_contact():
    """Get all contact messages (Phase 12)."""
    db = get_database()
    messages = db.contact_messages.find().sort("created_at", -1)
    return {"messages": [serialize(m) for m in messages]}


@router.put("/contact/{contact_id}", dependencies=[Depends(get_current_admin)])
async def admin_update_contact(contact_id: str, data: dict):
    """Update contact message status or notes (Phase 12)."""
    db = get_database()
    update_data = {k: v for k, v in data.items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    if update_data.get("status") in ["read", "replied", "closed"]:
        update_data["read"] = True
    elif update_data.get("status") == "pending":
        update_data["read"] = False
        
    filter_query = {}
    if ObjectId.is_valid(contact_id):
        filter_query = {"_id": ObjectId(contact_id)}
    else:
        filter_query = {"id": contact_id}
        
    result = db.contact_messages.find_one_and_update(
        filter_query,
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Contact message not found")
    return serialize(result)


@router.get("/messages", dependencies=[Depends(get_current_admin)])
async def admin_list_messages():
    """Get all contact messages (legacy alias)."""
    return await admin_list_contact()


# ── Generic Image Upload (Cloudinary) ─────────────────────

@router.post("/upload", dependencies=[Depends(get_current_admin)])
async def admin_upload_media(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """Upload an image to Cloudinary (for sponsors, events, etc.)."""
    upload_file = file or image
    if not upload_file or not upload_file.filename:
        raise HTTPException(status_code=400, detail="No image file provided")
        
    file_bytes = await upload_file.read()
    file_size = len(file_bytes)
    is_valid, err_msg = validate_image_upload(upload_file.filename, upload_file.content_type, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)
        
    upload_file.file.seek(0)
    try:
        result = upload_image(upload_file.file)
        return {
            "success": True,
            "url": result["url"],
            "thumbnail_url": result["thumbnail_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

