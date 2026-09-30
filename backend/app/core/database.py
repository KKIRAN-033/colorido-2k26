from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from app.core.config import settings

_client: MongoClient | None = None
_db: Database | None = None
_connected: bool = False
_db_type: str = "disconnected"


def get_database() -> Database:
    """Get the MongoDB database instance, creating the connection if needed.
    Falls back gracefully to an in-memory mongomock database with auto-seed
    if real MongoDB is not reachable.
    """
    global _client, _db, _connected, _db_type
    if _db is None:
        try:
            print(f"[INFO] Connecting to MongoDB: {settings.MONGODB_URI[:30]}...")
            _client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
            )
            _client.admin.command("ping")
            _db = _client[settings.DATABASE_NAME]
            _connected = True
            _db_type = "mongodb_atlas"
            _create_indexes(_db)
            print("[OK] MongoDB connected successfully to real MongoDB instance (MongoDB Atlas)")
        except (ServerSelectionTimeoutError, ConnectionFailure, Exception) as e:
            print(f"[WARN] Real MongoDB not available: {e}")
            print("[INFO] Initializing In-Memory Mock MongoDB with full COLORIDO 2K26 dataset...")
            try:
                import mongomock
                _client = mongomock.MongoClient()
                _db = _client[settings.DATABASE_NAME]
                _connected = True
                _db_type = "in_memory_mock"
                _create_indexes(_db)
                # Auto-seed the database
                try:
                    from seed.initial_data import (
                        seed_admin, seed_events, seed_schedules,
                        seed_announcements, seed_results, seed_gallery,
                        seed_sponsors
                    )
                    seed_admin(_db)
                    seed_events(_db)
                    seed_schedules(_db)
                    seed_announcements(_db)
                    seed_results(_db)
                    seed_gallery(_db)
                    seed_sponsors(_db)
                    _db.registrations.delete_many({})
                    _db.counters.delete_many({})
                    print("[OK] In-Memory Mock MongoDB successfully initialized with 16 events, schedules, announcements, gallery & admin (0 demo registrations)!")
                except Exception as seed_err:
                    print(f"[WARN] Auto-seeding mock DB warning: {seed_err}")
            except Exception as mock_err:
                _connected = False
                _db_type = "error"
                print(f"[ERROR] Failed to initialize mongomock: {mock_err}")
    return _db


def is_connected() -> bool:
    """Check if we have an active DB connection."""
    return _connected


def get_db_type() -> str:
    """Return 'mongodb_atlas' or 'in_memory_mock'."""
    return _db_type


def close_database():
    """Close the MongoDB connection."""
    global _client, _db, _connected
    if _client:
        _client.close()
        _client = None
        _db = None
        _connected = False


def _create_indexes(db: Database):
    """Create database indexes for query performance."""
    try:
        # Events
        db.events.create_index([("slug", ASCENDING)], unique=True)
        db.events.create_index([("event_id", ASCENDING)], unique=True, sparse=True)
        db.events.create_index([("category", ASCENDING)])
        db.events.create_index([("division", ASCENDING)])

        # Registrations
        db.registrations.create_index([("registration_id", ASCENDING)], unique=True)
        db.registrations.create_index([("event_id", ASCENDING)])
        db.registrations.create_index([("email", ASCENDING)])
        db.registrations.create_index([("phone", ASCENDING)])
        db.registrations.create_index([("created_at", DESCENDING)])
        db.registrations.create_index([("status", ASCENDING)])

        # Schedules
        db.schedules.create_index([("event_id", ASCENDING)])
        db.schedules.create_index([("date", ASCENDING)])

        # Announcements
        db.announcements.create_index([("created_at", DESCENDING)])
        db.announcements.create_index([("status", ASCENDING)])
        db.announcements.create_index([("priority", DESCENDING)])

        # Results
        db.results.create_index([("event_id", ASCENDING)])
        db.results.create_index([("status", ASCENDING)])

        # Gallery
        db.gallery.create_index([("category", ASCENDING)])
        db.gallery.create_index([("event_id", ASCENDING)])
        db.gallery.create_index([("created_at", DESCENDING)])

        # Sponsors
        db.sponsors.create_index([("tier", ASCENDING)])
        db.sponsors.create_index([("display_order", ASCENDING)])

        # Contact messages
        db.contact_messages.create_index([("created_at", DESCENDING)])

        # Admins
        db.admins.create_index([("email", ASCENDING)], unique=True)

        print("[OK] Database indexes created")
    except Exception as e:
        print(f"[WARN] Index creation failed: {e}")
