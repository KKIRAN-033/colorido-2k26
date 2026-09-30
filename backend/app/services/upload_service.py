"""Upload service for Cloudinary image uploads."""

import cloudinary
import cloudinary.uploader
from app.core.config import settings


def configure_cloudinary():
    """Configure Cloudinary with credentials from environment."""
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


def upload_image(file, folder: str = "colorido-2k26") -> dict:
    """Upload an image to Cloudinary.
    
    Returns dict with 'url' and 'thumbnail_url'.
    """
    configure_cloudinary()
    
    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        resource_type="image",
        transformation=[
            {"quality": "auto:good", "fetch_format": "auto"}
        ]
    )
    
    # Generate thumbnail
    thumbnail_url = cloudinary.utils.cloudinary_url(
        result["public_id"],
        width=400,
        height=300,
        crop="fill",
        quality="auto:low",
        fetch_format="auto"
    )[0]
    
    return {
        "url": result["secure_url"],
        "thumbnail_url": thumbnail_url,
        "public_id": result["public_id"]
    }
