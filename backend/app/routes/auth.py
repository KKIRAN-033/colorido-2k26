"""Auth routes - admin login and profile endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import get_database
from app.core.security import verify_password_timing_safe, create_access_token, get_current_admin
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(tags=["Auth"])


def perform_login(data: LoginRequest) -> LoginResponse:
    db = get_database()
    admin = db.admins.find_one({"email": data.email})
    password_hash = admin["password_hash"] if admin else None
    
    if not verify_password_timing_safe(data.password, password_hash) or not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token({"sub": admin["email"]})
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        email=admin["email"]
    )


# 1. Standard /api/auth endpoints (Phase 6 requirement)
@router.post("/api/auth/login", response_model=LoginResponse)
async def auth_login(data: LoginRequest):
    """Authenticate admin and return JWT access token."""
    return perform_login(data)


@router.get("/api/auth/me")
async def auth_me(current_admin: dict = Depends(get_current_admin)):
    """Get the currently authenticated admin profile."""
    return {
        "email": current_admin.get("email"),
        "name": current_admin.get("name", "Admin"),
        "role": current_admin.get("role", "admin"),
        "id": str(current_admin.get("_id", ""))
    }


# 2. Backward compatibility endpoints for existing frontend
@router.post("/api/admin/login", response_model=LoginResponse)
async def admin_login_legacy(data: LoginRequest):
    """Legacy alias for admin login."""
    return perform_login(data)


@router.get("/api/admin/me")
async def admin_me_legacy(current_admin: dict = Depends(get_current_admin)):
    """Legacy alias for admin profile."""
    return await auth_me(current_admin)
