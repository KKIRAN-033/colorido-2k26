import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://kirankatakam45_db_user:Kiran123@cluster0.huo4afk.mongodb.net/?appName=Cluster0"
    )
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "colorido_2k26")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "").strip()
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "").strip()
    CORS_ORIGINS: list = [
        origin.strip() 
        for origin in os.getenv(
            "CORS_ORIGINS",
            "*,http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,https://colorido-2k26.vercel.app"
        ).split(",") 
        if origin.strip()
    ]
    ADMIN_DEFAULT_EMAIL: str = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@colorido.in")
    ADMIN_DEFAULT_PASSWORD: str = os.getenv("ADMIN_DEFAULT_PASSWORD", "changeme123")


settings = Settings()
