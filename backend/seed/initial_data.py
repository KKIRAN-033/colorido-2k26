"""Seed official data for COLORIDO 2K26.

Run: python -m seed.initial_data

Seeds all 16 official COLORIDO events, preliminary schedules,
announcements, results, gallery, sponsors, and admin idempotently.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import datetime, timezone, timedelta
from app.core.database import get_database
from app.core.security import hash_password
from app.core.config import settings


def seed_admin(db):
    """Seed default admin user if not exists (idempotent)."""
    existing = db.admins.find_one({"email": settings.ADMIN_DEFAULT_EMAIL})
    if not existing:
        admin_data = {
            "email": settings.ADMIN_DEFAULT_EMAIL,
            "password_hash": hash_password(settings.ADMIN_DEFAULT_PASSWORD),
            "name": "Super Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        }
        db.admins.insert_one(admin_data)
        print(f"  [OK] Default admin created: {settings.ADMIN_DEFAULT_EMAIL}")
    else:
        print(f"  [INFO] Default admin already exists: {settings.ADMIN_DEFAULT_EMAIL}")


def seed_events(db):
    """Seed all 16 official COLORIDO events (idempotent upsert)."""
    now = datetime.now(timezone.utc)
    events = [
        # Cultural Events (10)
        {
            "event_id": "CLR26-FAR",
            "name": "Fine Arts",
            "slug": "fine-arts",
            "category": "cultural",
            "division": "solo",
            "sub_category": "Fine Arts",
            "description": "Showcase your artistic talent through painting, sketching, and creative expression.",
            "rules": "1. Time limit: 2 hours\n2. Materials will be provided\n3. Topic will be revealed on spot\n4. Individual participation only",
            "eligibility": "Open to all college students with valid ID.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 100,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Solar Mind Studio",
            "character": "Vision",
            "character_name": "Vision",
            "character_id": "avenger_vision",
            "character_asset": "/characters/vision/avatar.png",
            "character_theme": "Solar Mind Stone & Prismatic Artistry",
            "character_color": "#eab308",
            "character_intro": "What is art, if not beauty persevering? Channel pure consciousness onto the canvas.",
            "character_celebration": "An extraordinary synthesis of chromatic vision and flawless aesthetics.",
            "character_event_action": "mind_beam",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 1,
            "display_order": 1,
        },
        {
            "event_id": "CLR26-MSS",
            "name": "Music & Band — Solo",
            "slug": "music-band-solo",
            "category": "cultural",
            "division": "solo",
            "sub_category": "Music & Band",
            "description": "Solo musical performance — vocal or instrumental.",
            "rules": "1. Time limit: 5 minutes per performer\n2. Bring your own instruments\n3. Accompanists allowed\n4. No playback tracks for vocals",
            "eligibility": "Open to all college students.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 50,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Milano Sonic Stage",
            "character": "Star-Lord",
            "character_name": "Star-Lord",
            "character_id": "avenger_star_lord",
            "character_asset": "/characters/star-lord/avatar.png",
            "character_theme": "Cosmic Beats & Awesome Mix",
            "character_color": "#ec4899",
            "character_intro": "Drop the needle on the Awesome Mix! The galaxy wants to hear your solo!",
            "character_celebration": "That track just saved the entire universe, rockstar!",
            "character_event_action": "cassette_groove",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 2,
            "display_order": 2,
        },
        {
            "event_id": "CLR26-MSG",
            "name": "Music & Band — Group",
            "slug": "music-band-group",
            "category": "cultural",
            "division": "group",
            "sub_category": "Music & Band",
            "description": "Group musical/band performance.",
            "rules": "1. Team size: 3–8 members\n2. Time limit: 10 minutes\n3. Bring your own instruments\n4. Sound check time will be allotted",
            "eligibility": "Open to all college students.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 30,
            "min_team_size": 3,
            "max_team_size": 8,
            "venue": "Benatar Sonic Arena",
            "character": "Rocket",
            "character_name": "Rocket",
            "character_id": "avenger_rocket_groot",
            "character_asset": "/characters/rocket/avatar.png",
            "character_theme": "Heavy Blaster Bass & Awesome Rhythm",
            "character_color": "#84cc16",
            "character_intro": "Ain't nothing like us 'cept us! Crank that amplifier to eleven, group band!",
            "character_celebration": "The loudest, most devastating musical performance in the quadrant!",
            "character_event_action": "blaster_jam",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 3,
            "display_order": 3,
        },
        {
            "event_id": "CLR26-DNS",
            "name": "Dance — Solo",
            "slug": "dance-solo",
            "category": "cultural",
            "division": "solo",
            "sub_category": "Dance",
            "description": "Solo dance performance — any style welcome.",
            "rules": "1. Time limit: 4 minutes\n2. Any dance form\n3. Props allowed\n4. Pre-recorded music required on USB",
            "eligibility": "Open to all college students.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 50,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Red Room Starlight Stage",
            "character": "Black Widow",
            "character_name": "Black Widow",
            "character_id": "avenger_black_widow",
            "character_asset": "/characters/black-widow/avatar.png",
            "character_theme": "Stealth Martial Agility & Electro Stun",
            "character_color": "#f43f5e",
            "character_intro": "Precision, grace, and lethal timing. Own the stage with relentless agility.",
            "character_celebration": "Flawless choreography execution! Objective dominated with absolute elegance!",
            "character_event_action": "widow_sting",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 4,
            "display_order": 4,
        },
        {
            "event_id": "CLR26-DNG",
            "name": "Dance — Group",
            "slug": "dance-group",
            "category": "cultural",
            "division": "group",
            "sub_category": "Dance",
            "description": "Group dance performance.",
            "rules": "1. Team size: 4–15 members\n2. Time limit: 8 minutes\n3. Props allowed\n4. Music on USB drive",
            "eligibility": "Open to all college students.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 25,
            "min_team_size": 4,
            "max_team_size": 15,
            "venue": "Chaos Magic Ballroom",
            "character": "Scarlet Witch",
            "character_name": "Scarlet Witch",
            "character_id": "avenger_scarlet_witch",
            "character_asset": "/characters/scarlet-witch/avatar.png",
            "character_theme": "Chaos Magic & Synchronized Telekinesis",
            "character_color": "#ef4444",
            "character_intro": "Channel the chaos within. Bend the rhythm and synchronize your squad's power!",
            "character_celebration": "Reality rewrites around your squad's breathtaking synchronized energy!",
            "character_event_action": "chaos_hex",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 5,
            "display_order": 5,
        },
        {
            "event_id": "CLR26-CHR",
            "name": "Choreoday — Theme Based",
            "slug": "choreoday",
            "category": "cultural",
            "division": "theme",
            "sub_category": "Choreoday",
            "description": "Theme-based choreography performance combining dance, drama, and storytelling.",
            "rules": "1. Team size: 6–20 members\n2. Time limit: 12 minutes\n3. Theme will be announced prior to event\n4. Costumes and props allowed",
            "eligibility": "Open to all college students.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 15,
            "min_team_size": 6,
            "max_team_size": 20,
            "venue": "Mirror Dimension Amphitheater",
            "character": "Doctor Strange",
            "character_name": "Doctor Strange",
            "character_id": "avenger_doctor_strange",
            "character_asset": "/characters/doctor-strange/avatar.png",
            "character_theme": "Mirror Dimension & Mystic Choreography",
            "character_color": "#f59e0b",
            "character_intro": "Step through the portal! Bend space, time, and storytelling into pure spectacle.",
            "character_celebration": "By the Vishanti! A multidimensional theatrical masterwork!",
            "character_event_action": "mandala_spin",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 6,
            "display_order": 6,
        },
        {
            "event_id": "CLR26-DRM",
            "name": "Dramatics",
            "slug": "dramatics",
            "category": "cultural",
            "division": "group",
            "sub_category": "Dramatics",
            "description": "Theatrical performance — skit, play, or mime.",
            "rules": "1. Team size: 5–15 members\n2. Time limit: 15 minutes\n3. Props and costumes allowed\n4. Vulgarity strictly prohibited",
            "eligibility": "Open to all college students.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 20,
            "min_team_size": 5,
            "max_team_size": 15,
            "venue": "Mischief Playhouse",
            "character": "Loki",
            "character_name": "Loki",
            "character_id": "avenger_loki",
            "character_asset": "/characters/loki/avatar.png",
            "character_theme": "God of Mischief & Theatrical Illusions",
            "character_color": "#10b981",
            "character_intro": "I am burdened with glorious theatrical purpose! Command the stage with royal drama!",
            "character_celebration": "Truly magnificent drama! Even Odin himself would be enchanted!",
            "character_event_action": "illusion_mirror",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 7,
            "display_order": 7,
        },
        {
            "event_id": "CLR26-FSH",
            "name": "Fashion Show",
            "slug": "fashion-show",
            "category": "cultural",
            "division": "group",
            "sub_category": "Fashion Show",
            "description": "Walk the ramp with style and creativity.",
            "rules": "1. Team size: 6–12 members\n2. Time limit: 10 minutes\n3. Theme-based\n4. Costumes must be self-designed or sourced",
            "eligibility": "Open to all college students.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 15,
            "min_team_size": 6,
            "max_team_size": 12,
            "venue": "Wakandan Royal Catwalk",
            "character": "Black Panther",
            "character_name": "Black Panther",
            "character_id": "avenger_black_panther",
            "character_asset": "/characters/black-panther/avatar.png",
            "character_theme": "Wakandan Vibranium Haute Couture",
            "character_color": "#a855f7",
            "character_intro": "Wakanda sets the standard. Walk the runway with sovereign poise and vibranium brilliance.",
            "character_celebration": "Wakanda Forever! A collection of royalty, power, and peerless design!",
            "character_event_action": "vibranium_pulse",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 8,
            "display_order": 8,
        },
        {
            "event_id": "CLR26-TKR",
            "name": "Tekraft Events",
            "slug": "tekraft-events",
            "category": "cultural",
            "division": "solo",
            "sub_category": "Tekraft Events",
            "description": "Technical and creative craft events combining technology with artistry.",
            "rules": "1. Individual or team participation\n2. Materials will be specified per sub-event\n3. Time limits vary by sub-event",
            "eligibility": "Open to all college students.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 60,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Stark Industries Workshop",
            "character": "Iron Man",
            "character_name": "Iron Man",
            "character_id": "avenger_iron_man",
            "character_asset": "/characters/iron-man/avatar.png",
            "character_theme": "Arc Reactor Genius & Nanotech Engineering",
            "character_color": "#e11d48",
            "character_intro": "JARVIS, run diagnostics on this competition. Let's engineer something revolutionary!",
            "character_celebration": "Genius, billionaire, champion! Nanotech upgrade complete!",
            "character_event_action": "repulsor_blast",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 9,
            "display_order": 9,
        },
        {
            "event_id": "CLR26-LIT",
            "name": "Literary",
            "slug": "literary",
            "category": "cultural",
            "division": "solo",
            "sub_category": "Literary",
            "description": "Literary events including debate, elocution, poetry, and creative writing.",
            "rules": "1. Individual participation\n2. Topics will be given on spot or prior\n3. Language as specified per sub-event\n4. Time limits vary",
            "eligibility": "Open to all college students.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 50,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Captains Liberty Forum",
            "character": "Captain America",
            "character_name": "Captain America",
            "character_id": "avenger_captain_america",
            "character_asset": "/characters/captain-america/avatar.png",
            "character_theme": "First Avenger & Unyielding Integrity",
            "character_color": "#3b82f6",
            "character_intro": "Stand firm when the whole world tells you to move. Speak with honor and conviction.",
            "character_celebration": "I can do this all day! Outstanding rhetorical valor and truth!",
            "character_event_action": "shield_ricochet",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 10,
            "display_order": 10,
        },
        # Sports — Boys (3)
        {
            "event_id": "CLR26-BSK",
            "name": "Basketball (Boys)",
            "slug": "basketball-boys",
            "category": "sports",
            "division": "boys",
            "sub_category": "Basketball",
            "description": "Inter-college boys basketball tournament.",
            "rules": "1. Team size: 7–12 players\n2. Standard basketball rules apply\n3. College ID mandatory\n4. Tournament format: knockout",
            "eligibility": "Male college students with valid ID.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 16,
            "min_team_size": 7,
            "max_team_size": 12,
            "venue": "Gamma Smash Colosseum",
            "character": "Hulk",
            "character_name": "Hulk",
            "character_id": "avenger_hulk",
            "character_asset": "/characters/hulk/avatar.png",
            "character_theme": "Gamma Power & Skyward Slam",
            "character_color": "#22c55e",
            "character_intro": "HULK SMASH HOOP! Show them pure unbridled power in the paint!",
            "character_celebration": "HULK STRONGEST BASKETBALL CHAMPION THERE IS!",
            "character_event_action": "gamma_smash",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 11,
            "display_order": 11,
        },
        {
            "event_id": "CLR26-VLB",
            "name": "Volleyball (Boys)",
            "slug": "volleyball-boys",
            "category": "sports",
            "division": "boys",
            "sub_category": "Volleyball",
            "description": "Inter-college boys volleyball tournament.",
            "rules": "1. Team size: 6–10 players\n2. Standard volleyball rules\n3. College ID mandatory",
            "eligibility": "Male college students with valid ID.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 16,
            "min_team_size": 6,
            "max_team_size": 10,
            "venue": "Asgardian Thunder Court",
            "character": "Thor",
            "character_name": "Thor",
            "character_id": "avenger_thor",
            "character_asset": "/characters/thor/avatar.png",
            "character_theme": "God of Thunder & Aerial Mjolnir Spike",
            "character_color": "#38bdf8",
            "character_intro": "Bring the lightning! Rise above the net and strike with the fury of thunder!",
            "character_celebration": "By Odin's beard! A thunderous spike that shattered the court!",
            "character_event_action": "lightning_strike",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 12,
            "display_order": 12,
        },
        {
            "event_id": "CLR26-TTB",
            "name": "Table Tennis (Boys)",
            "slug": "table-tennis-boys",
            "category": "sports",
            "division": "boys",
            "sub_category": "Table Tennis",
            "description": "Inter-college boys table tennis singles.",
            "rules": "1. Singles format\n2. Best of 5 games\n3. Standard TT rules",
            "eligibility": "Male college students with valid ID.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 32,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Web-Spin Ping Pong Arena",
            "character": "Spider-Man",
            "character_name": "Spider-Man",
            "character_id": "avenger_spiderman",
            "character_asset": "/characters/spider-man/avatar.png",
            "character_theme": "Spider-Sense Reflexes & Web-Spin Counter",
            "character_color": "#ef4444",
            "character_intro": "My Spider-Sense is tingling! Fast paddle, rapid reflexes, spin the ball like a web!",
            "character_celebration": "Thwip! Game, set, and match! Friendly neighborhood table tennis ace!",
            "character_event_action": "web_sling",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 13,
            "display_order": 13,
        },
        # Sports — Girls (3)
        {
            "event_id": "CLR26-THR",
            "name": "Throwball (Girls)",
            "slug": "throwball-girls",
            "category": "sports",
            "division": "girls",
            "sub_category": "Throwball",
            "description": "Inter-college girls throwball tournament.",
            "rules": "1. Team size: 7–12 players\n2. Standard throwball rules\n3. College ID mandatory",
            "eligibility": "Female college students with valid ID.",
            "team_event": True,
            "participation_type": "team",
            "max_participants": 16,
            "min_team_size": 7,
            "max_team_size": 12,
            "venue": "Photon Orbital Arena",
            "character": "Captain Marvel",
            "character_name": "Captain Marvel",
            "character_id": "avenger_captain_marvel",
            "character_asset": "/characters/captain-marvel/avatar.png",
            "character_theme": "Higher, Further, Faster Photon Cannon",
            "character_color": "#facc15",
            "character_intro": "Higher, further, faster, baby! Launch that rocket throw across the net!",
            "character_celebration": "Cosmic power confirmed! You completely dominated the court!",
            "character_event_action": "photon_blast",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 14,
            "display_order": 14,
        },
        {
            "event_id": "CLR26-TNK",
            "name": "TenniKoit (Girls)",
            "slug": "tennikoit-girls",
            "category": "sports",
            "division": "girls",
            "sub_category": "TenniKoit",
            "description": "Inter-college girls TenniKoit tournament.",
            "rules": "1. Singles format\n2. Standard TenniKoit rules\n3. College ID mandatory",
            "eligibility": "Female college students with valid ID.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 32,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Bullseye Quiver Court",
            "character": "Hawkeye",
            "character_name": "Hawkeye",
            "character_id": "avenger_hawkeye",
            "character_asset": "/characters/hawkeye/avatar.png",
            "character_theme": "Bullseye Pinpoint Ring Volley",
            "character_color": "#8b5cf6",
            "character_intro": "I never miss. Time the release and land the ring right on the baseline.",
            "character_celebration": "Bullseye volley! Perfect precision under championship pressure!",
            "character_event_action": "arrow_release",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 15,
            "display_order": 15,
        },
        {
            "event_id": "CLR26-TTG",
            "name": "Table Tennis (Girls)",
            "slug": "table-tennis-girls",
            "category": "sports",
            "division": "girls",
            "sub_category": "Table Tennis",
            "description": "Inter-college girls table tennis singles.",
            "rules": "1. Singles format\n2. Best of 5 games\n3. Standard TT rules",
            "eligibility": "Female college students with valid ID.",
            "team_event": False,
            "participation_type": "solo",
            "max_participants": 32,
            "min_team_size": 1,
            "max_team_size": 1,
            "venue": "Quantum Realm Tables",
            "character": "Ant-Man",
            "character_name": "Ant-Man",
            "character_id": "avenger_ant_man",
            "character_asset": "/characters/ant-man/avatar.png",
            "character_theme": "Quantum Reflexes & Subatomic Spin",
            "character_color": "#ec4899",
            "character_intro": "Size doesn't matter when you've got quantum reflexes! Sting them with backspin!",
            "character_celebration": "Quantum victory achieved! Fast as lightning, unstoppable spin!",
            "character_event_action": "quantum_sting",
            "registration_open": True,
            "registration_deadline": "2026-10-10",
            "event_number": 16,
            "display_order": 16,
        },
    ]

    for event in events:
        event["updated_at"] = now
        db.events.update_one(
            {"slug": event["slug"]},
            {
                "$setOnInsert": {"created_at": now},
                "$set": {k: v for k, v in event.items() if k != "created_at"}
            },
            upsert=True
        )
    print(f"  [OK] Idempotently seeded {len(events)} events (10 Cultural, 6 Sports)")


def seed_schedules(db):
    """Seed preliminary schedule entries (idempotent upsert)."""
    events = list(db.events.find())
    base_date = datetime(2026, 10, 15)
    now = datetime.now(timezone.utc)
    
    for i, event in enumerate(events):
        day_offset = i // 4
        hour = 9 + (i % 4) * 2
        sched = {
            "event_id": str(event["_id"]),
            "event_name": event["name"],
            "category": event["category"],
            "division": event.get("division"),
            "date": (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d"),
            "start_time": f"{hour:02d}:00",
            "end_time": f"{hour + 2:02d}:00",
            "venue": event.get("venue", f"Venue {chr(65 + i % 5)}"),
            "status": "scheduled",
            "updated_at": now,
        }
        db.schedules.update_one(
            {"event_id": sched["event_id"]},
            {
                "$setOnInsert": {"created_at": now},
                "$set": sched
            },
            upsert=True
        )
    print(f"  [OK] Idempotently seeded schedule entries")


def seed_announcements(db):
    """Seed official announcements (idempotent upsert)."""
    now = datetime.now(timezone.utc)
    announcements = [
        {
            "title": "🎉 COLORIDO 2K26 Registrations Open!",
            "content": "Registrations for COLORIDO 2K26 are officially live! Register for cultural and sports events now.",
            "priority": "high",
            "status": "published",
            "published": True,
        },
        {
            "title": "📋 Event Schedule Released",
            "content": "The preliminary event schedule for COLORIDO 2K26 has been published. Check the Schedule tab for dates and venues.",
            "priority": "normal",
            "status": "published",
            "published": True,
        },
        {
            "title": "📍 Campus Venue Guidelines",
            "content": "All cultural events and sports tournaments will be held at official college arenas. Valid student ID is mandatory.",
            "priority": "normal",
            "status": "published",
            "published": True,
        },
    ]
    
    for ann in announcements:
        db.announcements.update_one(
            {"title": ann["title"]},
            {
                "$setOnInsert": {"created_at": now},
                "$set": {**ann, "updated_at": now}
            },
            upsert=True
        )
    print(f"  [OK] Idempotently seeded announcements")


def seed_results(db):
    """Seed initial sample result if empty (idempotent)."""
    now = datetime.now(timezone.utc)
    event = db.events.find_one({"slug": "fine-arts"})
    if event:
        db.results.update_one(
            {"event_id": event.get("event_id", "CLR26-FAR"), "position": "1st"},
            {
                "$setOnInsert": {
                    "event_id": event.get("event_id", "CLR26-FAR"),
                    "slug": event.get("slug"),
                    "event_name": event.get("name", "Fine Arts"),
                    "category": event.get("category", "cultural"),
                    "position": "1st",
                    "participant_name": "Visionary Artist",
                    "college": "National Arts Academy",
                    "score": "98/100",
                    "status": "published",
                    "published": True,
                    "created_at": now,
                }
            },
            upsert=True
        )
    print("  [OK] Idempotently seeded published results")


def seed_gallery(db):
    """Seed official gallery items (idempotent upsert)."""
    now = datetime.now(timezone.utc)
    gallery_items = [
        {
            "title": "Cultural Arena Opening",
            "image_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
            "thumbnail_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
            "category": "cultural",
            "status": "published",
        },
        {
            "title": "Sports Colosseum Action",
            "image_url": "https://images.unsplash.com/photo-1461896836934-bd45ba054009?w=800",
            "thumbnail_url": "https://images.unsplash.com/photo-1461896836934-bd45ba054009?w=400",
            "category": "sports",
            "status": "published",
        },
        {
            "title": "Choreoday Spectacle",
            "image_url": "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
            "thumbnail_url": "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400",
            "category": "cultural",
            "status": "published",
        },
        {
            "title": "Music & Band Soundstage",
            "image_url": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
            "thumbnail_url": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400",
            "category": "cultural",
            "status": "published",
        },
        {
            "title": "Basketball Tournament Highlights",
            "image_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
            "thumbnail_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
            "category": "sports",
            "status": "published",
        },
        {
            "title": "Behind the Scenes Organization",
            "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            "thumbnail_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
            "category": "general",
            "status": "published",
        },
    ]
    for item in gallery_items:
        db.gallery.update_one(
            {"title": item["title"]},
            {
                "$setOnInsert": {"created_at": now},
                "$set": {**item, "updated_at": now}
            },
            upsert=True
        )
    print(f"  [OK] Idempotently seeded gallery items")


def seed_sponsors(db):
    """Seed official event sponsors (idempotent upsert)."""
    now = datetime.now(timezone.utc)
    sponsors = [
        {
            "name": "Title Sponsor",
            "logo_url": "",
            "website": "https://colorido.in",
            "tier": "title",
            "display_order": 1,
            "active": True,
        },
        {
            "name": "Powered By Partner",
            "logo_url": "",
            "website": "https://colorido.in",
            "tier": "gold",
            "display_order": 2,
            "active": True,
        },
        {
            "name": "Associate Sponsor",
            "logo_url": "",
            "website": "https://colorido.in",
            "tier": "silver",
            "display_order": 3,
            "active": True,
        },
    ]
    for sp in sponsors:
        db.sponsors.update_one(
            {"name": sp["name"]},
            {
                "$setOnInsert": {"created_at": now},
                "$set": {**sp, "updated_at": now}
            },
            upsert=True
        )
    print(f"  [OK] Idempotently seeded sponsors")


def seed_all():
    """Run full idempotent seeding for COLORIDO 2K26."""
    print("\n--- Seeding COLORIDO 2K26 Database (Idempotent) ---")
    db = get_database()
    seed_admin(db)
    seed_events(db)
    seed_schedules(db)
    seed_announcements(db)
    seed_results(db)
    seed_gallery(db)
    seed_sponsors(db)
    print("--- Seeding Completed Successfully ---\n")


if __name__ == "__main__":
    seed_all()
