"""Security middleware for COLORIDO 2K26.

Implements defenses against:
1. Cross-Site Scripting (XSS) via CSP, X-Content-Type-Options, X-XSS-Protection
2. Clickjacking via X-Frame-Options: DENY and CSP frame-ancestors: none
3. HTTP Request Smuggling via Transfer-Encoding / Content-Length conflict checks
4. Information Disclosure via Server header suppression
5. Web Cache Poisoning & Deception via strict Cache-Control for dynamic endpoints
6. HTTP Host Header Attacks via host validation
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
import re
from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds essential production security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        # 1. HTTP Request Smuggling check
        headers = request.headers
        has_cl = "content-length" in headers
        has_te = "transfer-encoding" in headers
        if has_cl and has_te:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Invalid request: Conflicting Content-Length and Transfer-Encoding headers."}
            )

        # 2. Host Header validation (Host Header Attack mitigation)
        host = headers.get("host", "").split(":")[0].lower()
        allowed_hosts = [
            "localhost",
            "127.0.0.1",
            "testserver",
            "0.0.0.0",
        ]
        # Include domains parsed from CORS_ORIGINS
        for origin in settings.CORS_ORIGINS:
            cleaned = origin.replace("http://", "").replace("https://", "").split(":")[0].lower()
            if cleaned and cleaned not in allowed_hosts:
                allowed_hosts.append(cleaned)

        is_allowed_host = (
            not host
            or host in allowed_hosts
            or host.endswith(".colorido.in")
            or host.endswith(".onrender.com")
            or host.endswith(".render.com")
            or host.endswith(".vercel.app")
            or "*" in allowed_hosts
            or "*" in settings.CORS_ORIGINS
        )

        if not is_allowed_host:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Invalid Host header."}
            )

        response: Response = await call_next(request)

        # 3. Security Headers
        # Clickjacking defense
        response.headers["X-Frame-Options"] = "DENY"
        # MIME type sniffing defense
        response.headers["X-Content-Type-Options"] = "nosniff"
        # XSS Protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions Policy
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"
        # Strict Transport Security (HSTS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Content Security Policy (CSP)
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https: res.cloudinary.com blob:; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:* https:; "
            "frame-ancestors 'none'; "
            "object-src 'none'; "
            "base-uri 'self';"
        )
        response.headers["Content-Security-Policy"] = csp

        # 4. Cache Control for sensitive/dynamic endpoints (Web Cache Poisoning & Deception defense)
        path = request.url.path
        if (
            path.startswith("/api/admin")
            or path.startswith("/api/auth")
            or path.startswith("/api/registrations")
            or path.startswith("/api/contact")
        ):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        # 5. Information Disclosure: Hide/normalize server identification
        response.headers["Server"] = "COLORIDO-Platform"
        if "X-Powered-By" in response.headers:
            del response.headers["X-Powered-By"]

        return response
