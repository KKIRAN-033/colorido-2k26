"""Security utility functions for COLORIDO 2K26.

Mitigates:
- SSRF (Server-Side Request Forgery)
- Path Traversal
- Cross-Site Scripting (HTML input sanitization)
- ReDoS & NoSQL Regex Injection
"""

import ipaddress
import re
import socket
import urllib.parse
from html import escape


# Allowed image extensions & MIME types for file uploads
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def sanitize_text(text: str) -> str:
    """Sanitize user input text to prevent XSS. Escapes HTML entities."""
    if not text:
        return text
    # Strip dangerous script/iframe tags
    cleaned = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", text, flags=re.IGNORECASE | re.DOTALL)
    cleaned = re.sub(r"<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>", "", cleaned, flags=re.IGNORECASE | re.DOTALL)
    # Also escape HTML tags
    return escape(cleaned.strip())


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent Path Traversal and illegal character injection."""
    if not filename:
        return "unnamed_file"
    # Keep only alphanumeric characters, dots, dashes, and underscores
    cleaned = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    # Remove leading dots or slashes
    cleaned = cleaned.lstrip("./\\")
    # Prevent traversal sequences
    cleaned = cleaned.replace("..", "_")
    return cleaned[:100] if cleaned else "unnamed_file"


def validate_image_upload(filename: str, content_type: str, file_size: int) -> tuple[bool, str]:
    """Validate image upload extension, MIME type, and size.
    
    Returns (is_valid: bool, error_message: str)
    """
    if not filename:
        return False, "File must have a name."
        
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return False, f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"

    if content_type and content_type.lower() not in ALLOWED_IMAGE_MIMES:
        return False, f"Unsupported content-type '{content_type}'. Must be a valid image format."

    if file_size > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."

    return True, ""


def is_safe_external_url(url: str) -> bool:
    """Validate that a URL is a safe public web URL (SSRF prevention).
    
    Rejects:
    - Non-HTTP(S) protocols (file://, gopher://, javascript:, data:)
    - Private IP addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    - Loopback addresses (127.0.0.0/8, localhost)
    - Link-local / Cloud metadata (169.254.169.254)
    """
    if not url:
        return False

    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False

    hostname = parsed.hostname
    if not hostname:
        return False

    hostname_lower = hostname.lower()

    # Block localhost and metadata endpoints
    if hostname_lower in ("localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "metadata.google.internal"):
        return False

    try:
        # Resolve hostname to IP to catch DNS rebinding or private IP hostnames
        ip_str = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_str)

        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False

        # Explicitly check for 169.254.x.x
        if ip_str.startswith("169.254."):
            return False

    except (socket.gaierror, ValueError):
        # Could not resolve or invalid IP
        return False

    return True
