"""Sliding-window rate limiter for sensitive endpoints.

Mitigates:
- Brute-force attacks against /api/auth/login
- Contact form flooding / spam
- Registration automation / DoS attacks
- Credential stuffing
"""

import time
from collections import defaultdict
from threading import Lock
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class InMemoryRateLimiter:
    """Thread-safe sliding window rate limiter."""

    def __init__(self):
        self.lock = Lock()
        # key -> list of timestamps
        self.history = defaultdict(list)

    def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> tuple[bool, int]:
        """Check if request is allowed under rate limit.
        
        Returns (allowed: bool, retry_after: int)
        """
        now = time.time()
        with self.lock:
            timestamps = self.history[key]
            # Prune timestamps outside window
            cutoff = now - window_seconds
            valid_timestamps = [t for t in timestamps if t > cutoff]
            self.history[key] = valid_timestamps

            if len(valid_timestamps) >= max_requests:
                earliest = valid_timestamps[0]
                retry_after = int(window_seconds - (now - earliest)) + 1
                return False, max(1, retry_after)

            valid_timestamps.append(now)
            return True, 0

    def cleanup(self):
        """Purge stale entries to prevent memory growth."""
        now = time.time()
        with self.lock:
            keys_to_delete = []
            for key, timestamps in self.history.items():
                valid = [t for t in timestamps if t > now - 3600]
                if not valid:
                    keys_to_delete.append(key)
                else:
                    self.history[key] = valid
            for k in keys_to_delete:
                del self.history[k]


limiter = InMemoryRateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Applies specific rate limits based on path."""

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        # Forwarded for proxy check
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        path = request.url.path
        method = request.method

        # 1. Login rate limit: 5 attempts per 5 minutes per IP
        if (path == "/api/auth/login" or path == "/api/admin/login") and method == "POST":
            allowed, retry_after = limiter.is_allowed(f"login:{client_ip}", max_requests=10, window_seconds=300)
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "message": f"Too many login attempts. Please try again in {retry_after} seconds.",
                        "retry_after": retry_after
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        # 2. Contact form rate limit: 10 per 10 minutes per IP
        elif path == "/api/contact" and method == "POST":
            allowed, retry_after = limiter.is_allowed(f"contact:{client_ip}", max_requests=10, window_seconds=600)
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "message": f"Too many messages submitted. Please try again in {retry_after} seconds.",
                        "retry_after": retry_after
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        # 3. Registration submission rate limit: 25 per 10 minutes per IP
        elif path == "/api/registrations" and method == "POST":
            allowed, retry_after = limiter.is_allowed(f"reg:{client_ip}", max_requests=30, window_seconds=600)
            if not allowed:
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "message": f"Registration rate limit exceeded. Please wait {retry_after} seconds.",
                        "retry_after": retry_after
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        # 4. General API limit: 400 requests per minute
        allowed, retry_after = limiter.is_allowed(f"gen:{client_ip}", max_requests=400, window_seconds=60)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "message": f"API rate limit exceeded. Please wait {retry_after} seconds.",
                    "retry_after": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )

        return await call_next(request)
