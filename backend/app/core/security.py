from datetime import datetime, timedelta, timezone
import bcrypt
if not hasattr(bcrypt, "__about__"):
    type("About", (), {"__version__": getattr(bcrypt, "__version__", "4.0.0")})
    class _BcryptAbout:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = _BcryptAbout()
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer(auto_error=True)

# Pre-computed dummy hash to prevent user enumeration via timing attacks
DUMMY_HASH = pwd_context.hash("dummy_auth_timing_protection_value")


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with salt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash in constant time."""
    return pwd_context.verify(plain_password, hashed_password)


def verify_password_timing_safe(plain_password: str, hashed_password: str | None) -> bool:
    """Timing-safe verification that takes constant time even when user is not found."""
    if not hashed_password:
        pwd_context.verify(plain_password, DUMMY_HASH)
        return False
    return pwd_context.verify(plain_password, hashed_password)


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password complexity for admin accounts."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter."
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit."
    return True, ""


def create_access_token(data: dict) -> str:
    """Create a secure JWT access token with expiration and issue time."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({
        "iat": now,
        "exp": expire,
        "iss": "colorido-2k26-auth",
    })
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and strictly validate a JWT access token."""
    try:
        # Strictly enforce allowed algorithm to prevent algorithm confusion/downgrade attacks
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True, "verify_iss": False}
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """Dependency that validates the JWT and returns the admin payload."""
    payload = decode_access_token(credentials.credentials)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return {"email": email, "payload": payload}
