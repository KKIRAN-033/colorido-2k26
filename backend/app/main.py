from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.core.config import settings
from app.core.database import get_database, close_database, is_connected, get_db_type
from app.core.security import hash_password
from app.routes import events, registrations, schedule, announcements, results, gallery, sponsors, contact, auth, admin

from app.core.security_middleware import SecurityHeadersMiddleware
from app.core.rate_limiter import RateLimitMiddleware

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize DB and seed admin on startup."""
    db = get_database()
    
    # Create default admin if DB is connected
    if is_connected():
        try:
            if not db.admins.find_one({"email": settings.ADMIN_DEFAULT_EMAIL}):
                db.admins.insert_one({
                    "email": settings.ADMIN_DEFAULT_EMAIL,
                    "password_hash": hash_password(settings.ADMIN_DEFAULT_PASSWORD),
                    "name": "Super Admin",
                    "role": "admin",
                    "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
                })
                print(f"[OK] Default admin created: {settings.ADMIN_DEFAULT_EMAIL}")
        except Exception as e:
            print(f"[WARN] Could not seed admin: {e}")
    
    print("[OK] COLORIDO 2K26 Backend is ready!")
    yield
    
    close_database()
    print("[OK] Database connection closed")


app = FastAPI(
    title="COLORIDO 2K26 API",
    description="National-Level Cultural & Sports Event Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# Exception handlers
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "Validation error") if errors else "Validation error"
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": f"Validation error: {msg}", "detail": errors}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An internal server error occurred"}
    )


# Security Headers & Smuggling Protection (Outer layer)
app.add_middleware(SecurityHeadersMiddleware)

# Rate Limiting (Middle layer)
app.add_middleware(RateLimitMiddleware)

# Production-Hardened CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Disposition", "Retry-After"],
    max_age=600,
)

# Register routers
app.include_router(events.router)
app.include_router(registrations.router)
app.include_router(schedule.router)
app.include_router(announcements.router)
app.include_router(results.router)
app.include_router(gallery.router)
app.include_router(sponsors.router)
app.include_router(contact.router)
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "name": "COLORIDO 2K26 API",
        "version": "1.0.0",
        "status": "running",
        "database": "connected" if is_connected() else "disconnected",
        "database_type": get_db_type(),
        "docs": "/docs"
    }


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    connected = is_connected()
    return {
        "status": "ok" if connected else "degraded",
        "database": "connected" if connected else "disconnected",
        "database_type": get_db_type(),
    }
