import os
import sys
import io
import csv
import json
import time
import requests

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

BASE_URL = "http://127.0.0.1:8000"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

test_results = {}
passed_count = 0
failed_count = 0


def log_test(num: int, name: str, passed: bool, detail: str = ""):
    global passed_count, failed_count
    status_str = "PASS" if passed else "FAIL"
    if passed:
        passed_count += 1
    else:
        failed_count += 1
    test_results[num] = (name, passed, detail)
    mark = "[OK]" if passed else "[FAIL]"
    print(f"[{status_str}] Test {num:02d}: {name} {mark} {detail}")


def run_all_tests():
    print("============================================================")
    print("STARTING COLORIDO 2K26 PHASE 23 BACKEND VERIFICATION SUITE")
    print("============================================================\n")

    # 1. Server startup
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        passed = (r.status_code == 200 and "version" in r.json())
        log_test(1, "Server startup", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(1, "Server startup", False, str(e))

    # 2. MongoDB connection
    try:
        r = requests.get(f"{BASE_URL}/", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and data.get("database") == "connected")
        log_test(2, "MongoDB connection", passed, f"database={data.get('database')}")
    except Exception as e:
        log_test(2, "MongoDB connection", False, str(e))

    # 3. Health endpoint
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and data.get("status") == "ok" and data.get("database") == "connected")
        log_test(3, "Health endpoint", passed, f"status={data.get('status')}, database={data.get('database')}")
    except Exception as e:
        log_test(3, "Health endpoint", False, str(e))

    # 4. Event seeding
    try:
        r = requests.get(f"{BASE_URL}/api/events", timeout=5)
        events = r.json().get("events", [])
        passed = (len(events) == 16)
        log_test(4, "Event seeding", passed, f"Total events in DB: {len(events)}")
    except Exception as e:
        log_test(4, "Event seeding", False, str(e))

    # 5. GET all events
    try:
        r = requests.get(f"{BASE_URL}/api/events", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and "events" in data and len(data["events"]) == 16)
        log_test(5, "GET all events", passed, f"Count: {data.get('count')}")
    except Exception as e:
        log_test(5, "GET all events", False, str(e))

    # 6. GET cultural events
    try:
        r = requests.get(f"{BASE_URL}/api/events/category/cultural", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and len(data.get("events", [])) == 10)
        log_test(6, "GET cultural events", passed, f"Cultural count: {len(data.get('events', []))}")
    except Exception as e:
        log_test(6, "GET cultural events", False, str(e))

    # 7. GET sports events
    try:
        r = requests.get(f"{BASE_URL}/api/events/category/sports", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and len(data.get("events", [])) == 6)
        log_test(7, "GET sports events", passed, f"Sports count: {len(data.get('events', []))}")
    except Exception as e:
        log_test(7, "GET sports events", False, str(e))

    # 8. GET Boys sports events
    try:
        r = requests.get(f"{BASE_URL}/api/events?category=Sports&division=Boys", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and len(data.get("events", [])) == 3)
        log_test(8, "GET Boys sports events", passed, f"Boys sports count: {len(data.get('events', []))}")
    except Exception as e:
        log_test(8, "GET Boys sports events", False, str(e))

    # 9. GET Girls sports events
    try:
        r = requests.get(f"{BASE_URL}/api/events?category=Sports&division=Girls", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and len(data.get("events", [])) == 3)
        log_test(9, "GET Girls sports events", passed, f"Girls sports count: {len(data.get('events', []))}")
    except Exception as e:
        log_test(9, "GET Girls sports events", False, str(e))

    # 10. GET individual event (by slug and event_id)
    try:
        r1 = requests.get(f"{BASE_URL}/api/events/fine-arts", timeout=5)
        r2 = requests.get(f"{BASE_URL}/api/events/CLR26-BSK", timeout=5)
        passed = (r1.status_code == 200 and r2.status_code == 200 and r1.json().get("name") == "Fine Arts")
        log_test(10, "GET individual event", passed, f"fine-arts: {r1.status_code}, CLR26-BSK: {r2.status_code}")
    except Exception as e:
        log_test(10, "GET individual event", False, str(e))

    # 11. Admin login
    admin_token = None
    try:
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": settings.ADMIN_DEFAULT_EMAIL,
            "password": settings.ADMIN_DEFAULT_PASSWORD
        }, timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and "access_token" in data)
        if passed:
            admin_token = data["access_token"]
        log_test(11, "Admin login", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(11, "Admin login", False, str(e))

    admin_headers = {"Authorization": f"Bearer {admin_token}"} if admin_token else {}

    # 12. Invalid admin login
    try:
        r = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": settings.ADMIN_DEFAULT_EMAIL,
            "password": "wrongpassword"
        }, timeout=5)
        passed = (r.status_code == 401)
        log_test(12, "Invalid admin login", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(12, "Invalid admin login", False, str(e))

    # 13. Registration validation
    try:
        r = requests.post(f"{BASE_URL}/api/registrations", json={
            "event_id": "CLR26-FAR",
            "email": "invalid-email-address",
            "phone": "123",
            "college": ""
        }, timeout=5)
        passed = (r.status_code in [400, 422])
        log_test(13, "Registration validation", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(13, "Registration validation", False, str(e))

    # 14. Valid solo registration
    solo_reg_id = None
    test_ts = int(time.time())
    solo_email = f"peter.parker.{test_ts}@testcollege.edu"
    try:
        payload = {
            "event_id": "CLR26-FAR",
            "participant_name": "Peter Parker",
            "email": solo_email,
            "phone": "9876543210",
            "college": "Empire State University",
            "department": "Biophysics",
            "year": "3rd"
        }
        r = requests.post(f"{BASE_URL}/api/registrations", json=payload, timeout=5)
        data = r.json()
        passed = (r.status_code == 201 and data.get("registration", {}).get("registration_id", "").startswith("CLR26-"))
        if passed:
            solo_reg_id = data["registration"]["registration_id"]
        log_test(14, "Valid solo registration", passed, f"ID: {solo_reg_id}")
    except Exception as e:
        log_test(14, "Valid solo registration", False, str(e))

    # 15. Valid team registration
    team_reg_id = None
    team_email = f"bruce.banner.{test_ts}@testcollege.edu"
    team_name = f"Titan Hoopers {test_ts}"
    try:
        payload = {
            "event_id": "CLR26-BSK",
            "team_name": team_name,
            "participant_name": "Bruce Banner",
            "email": team_email,
            "phone": "9123456780",
            "college": "Culver Institute of Tech",
            "team_members": [
                {"name": "Player Two", "email": "p2@test.com", "phone": "9000000001"},
                {"name": "Player Three", "email": "p3@test.com", "phone": "9000000002"},
                {"name": "Player Four", "email": "p4@test.com", "phone": "9000000003"},
                {"name": "Player Five", "email": "p5@test.com", "phone": "9000000004"},
                {"name": "Player Six", "email": "p6@test.com", "phone": "9000000005"},
                {"name": "Player Seven", "email": "p7@test.com", "phone": "9000000006"},
            ]
        }
        r = requests.post(f"{BASE_URL}/api/registrations", json=payload, timeout=5)
        data = r.json()
        passed = (r.status_code == 201 and data.get("registration", {}).get("registration_id", "").startswith("CLR26-"))
        if passed:
            team_reg_id = data["registration"]["registration_id"]
        log_test(15, "Valid team registration", passed, f"ID: {team_reg_id}")
    except Exception as e:
        log_test(15, "Valid team registration", False, str(e))

    # 16. Duplicate registration (returns 409)
    try:
        payload = {
            "event_id": "CLR26-FAR",
            "participant_name": "Peter Parker Duplicate",
            "email": solo_email,
            "phone": "9876543210",
            "college": "Empire State University"
        }
        r = requests.post(f"{BASE_URL}/api/registrations", json=payload, timeout=5)
        passed = (r.status_code == 409)
        log_test(16, "Duplicate registration (HTTP 409)", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(16, "Duplicate registration (HTTP 409)", False, str(e))

    # 17. Invalid event registration
    try:
        payload = {
            "event_id": "NON_EXISTENT_EVENT_123",
            "participant_name": "Nobody",
            "email": "nobody@test.com",
            "phone": "9999999999",
            "college": "Ghost College"
        }
        r = requests.post(f"{BASE_URL}/api/registrations", json=payload, timeout=5)
        passed = (r.status_code == 404)
        log_test(17, "Invalid event registration (HTTP 404)", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(17, "Invalid event registration (HTTP 404)", False, str(e))

    # 18. Closed-registration event
    try:
        # Create a temporary closed event via admin
        r_create = requests.post(f"{BASE_URL}/api/admin/events", json={
            "name": "Closed Championship",
            "slug": "closed-championship-test",
            "category": "cultural",
            "registration_open": False
        }, headers=admin_headers, timeout=5)
        temp_event = r_create.json()
        
        # Try registering for closed event
        r_reg = requests.post(f"{BASE_URL}/api/registrations", json={
            "event_id": "closed-championship-test",
            "participant_name": "Eager Participant",
            "email": "eager@test.com",
            "phone": "9999999998",
            "college": "Test College"
        }, timeout=5)
        passed = (r_reg.status_code == 400 and "closed" in r_reg.text.lower())
        
        # Clean up temporary event
        if "id" in temp_event:
            requests.delete(f"{BASE_URL}/api/admin/events/{temp_event['id']}", headers=admin_headers, timeout=5)
            
        log_test(18, "Closed-registration event (HTTP 400)", passed, f"HTTP {r_reg.status_code}")
    except Exception as e:
        log_test(18, "Closed-registration event (HTTP 400)", False, str(e))

    # 19. Registration ID generation format
    try:
        import re
        reg_pattern = re.compile(r"^CLR26-[A-Z0-9]+-\d{5}$")
        passed = bool(solo_reg_id and reg_pattern.match(solo_reg_id))
        log_test(19, "Registration ID generation format", passed, f"{solo_reg_id}")
    except Exception as e:
        log_test(19, "Registration ID generation format", False, str(e))

    # 20. MongoDB insertion check
    try:
        r = requests.get(f"{BASE_URL}/api/registrations/{solo_reg_id}", timeout=5)
        passed = (r.status_code == 200 and r.json().get("email") == solo_email)
        log_test(20, "MongoDB insertion", passed, f"Record retrieved: {r.json().get('registration_id')}")
    except Exception as e:
        log_test(20, "MongoDB insertion", False, str(e))

    # 21. Get registration by ID
    try:
        r = requests.get(f"{BASE_URL}/api/registrations/{solo_reg_id}", timeout=5)
        passed = (r.status_code == 200 and r.json().get("participant_name") == "Peter Parker")
        log_test(21, "Get registration by ID", passed, f"HTTP {r.status_code}")
    except Exception as e:
        log_test(21, "Get registration by ID", False, str(e))

    # 22. Admin registration list
    try:
        r = requests.get(f"{BASE_URL}/api/admin/registrations", headers=admin_headers, timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and len(data.get("registrations", [])) >= 2)
        log_test(22, "Admin registration list", passed, f"Count: {data.get('total')}")
    except Exception as e:
        log_test(22, "Admin registration list", False, str(e))

    # 23. Admin search
    try:
        r = requests.get(f"{BASE_URL}/api/admin/registrations?search=Parker", headers=admin_headers, timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and any("Parker" in reg.get("participant_name", "") for reg in data.get("registrations", [])))
        log_test(23, "Admin search", passed, f"Matches: {data.get('total')}")
    except Exception as e:
        log_test(23, "Admin search", False, str(e))

    # 24. Admin filtering
    try:
        r = requests.get(f"{BASE_URL}/api/admin/registrations?category=sports", headers=admin_headers, timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and all(reg.get("event_category") == "sports" or reg.get("category") == "sports" for reg in data.get("registrations", [])))
        log_test(24, "Admin filtering", passed, f"Filtered sports: {data.get('total')}")
    except Exception as e:
        log_test(24, "Admin filtering", False, str(e))

    # 25. Admin update
    try:
        r = requests.put(f"{BASE_URL}/api/admin/registrations/{solo_reg_id}", json={
            "status": "attended",
            "notes": "Verified at venue desk"
        }, headers=admin_headers, timeout=5)
        passed = (r.status_code == 200 and r.json().get("status") == "attended")
        log_test(25, "Admin update", passed, f"New status: {r.json().get('status')}")
    except Exception as e:
        log_test(25, "Admin update", False, str(e))

    # 26. Admin authorization protection
    try:
        r = requests.get(f"{BASE_URL}/api/admin/registrations", timeout=5)
        passed = (r.status_code in [401, 403])
        log_test(26, "Admin authorization protection", passed, f"Unauthenticated HTTP: {r.status_code}")
    except Exception as e:
        log_test(26, "Admin authorization protection", False, str(e))

    # 27. Schedule CRUD
    try:
        r_get = requests.get(f"{BASE_URL}/api/schedule", timeout=5)
        r_post = requests.post(f"{BASE_URL}/api/admin/schedule", json={
            "event_id": "test-sched-evt",
            "event_name": "Test Event",
            "category": "sports",
            "date": "2026-10-20",
            "start_time": "10:00",
            "end_time": "12:00",
            "venue": "Test Arena"
        }, headers=admin_headers, timeout=5)
        sched_id = r_post.json().get("id")
        
        r_put = requests.put(f"{BASE_URL}/api/admin/schedule/{sched_id}", json={"venue": "Updated Arena"}, headers=admin_headers, timeout=5)
        r_del = requests.delete(f"{BASE_URL}/api/admin/schedule/{sched_id}", headers=admin_headers, timeout=5)
        passed = (r_get.status_code == 200 and r_post.status_code == 201 and r_put.status_code == 200 and r_del.status_code == 200)
        log_test(27, "Schedule CRUD", passed, "GET, POST, PUT, DELETE succeeded")
    except Exception as e:
        log_test(27, "Schedule CRUD", False, str(e))

    # 28. Announcement CRUD
    try:
        r_get = requests.get(f"{BASE_URL}/api/announcements", timeout=5)
        r_post = requests.post(f"{BASE_URL}/api/admin/announcements", json={
            "title": "CRUD Test Announcement",
            "content": "This is a test announcement",
            "priority": "normal",
            "status": "published"
        }, headers=admin_headers, timeout=5)
        ann_id = r_post.json().get("id")
        r_put = requests.put(f"{BASE_URL}/api/admin/announcements/{ann_id}", json={"content": "Updated content"}, headers=admin_headers, timeout=5)
        r_del = requests.delete(f"{BASE_URL}/api/admin/announcements/{ann_id}", headers=admin_headers, timeout=5)
        passed = (r_get.status_code == 200 and r_post.status_code == 201 and r_put.status_code == 200 and r_del.status_code == 200)
        log_test(28, "Announcement CRUD", passed, "GET, POST, PUT, DELETE succeeded")
    except Exception as e:
        log_test(28, "Announcement CRUD", False, str(e))

    # 29. Results CRUD
    try:
        r_get = requests.get(f"{BASE_URL}/api/results", timeout=5)
        r_post = requests.post(f"{BASE_URL}/api/admin/results", json={
            "event_id": "CLR26-FAR",
            "event_name": "Fine Arts",
            "category": "cultural",
            "position": "1st",
            "participant_name": "Star Painter",
            "college": "Art College",
            "status": "published"
        }, headers=admin_headers, timeout=5)
        res_id = r_post.json().get("id")
        r_evt = requests.get(f"{BASE_URL}/api/results/CLR26-FAR", timeout=5)
        r_put = requests.put(f"{BASE_URL}/api/admin/results/{res_id}", json={"position": "Grand Champion"}, headers=admin_headers, timeout=5)
        r_del = requests.delete(f"{BASE_URL}/api/admin/results/{res_id}", headers=admin_headers, timeout=5)
        passed = (r_get.status_code == 200 and r_post.status_code == 201 and r_evt.status_code == 200 and r_put.status_code == 200 and r_del.status_code == 200)
        log_test(29, "Results CRUD & Event lookup", passed, "GET, GET by event_id, POST, PUT, DELETE succeeded")
    except Exception as e:
        log_test(29, "Results CRUD & Event lookup", False, str(e))

    # 30. Gallery API
    try:
        r_get = requests.get(f"{BASE_URL}/api/gallery", timeout=5)
        r_post = requests.post(f"{BASE_URL}/api/admin/gallery", data={
            "title": "Live Championship Photo",
            "category": "sports",
            "image_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800"
        }, headers=admin_headers, timeout=5)
        gal_id = r_post.json().get("id")
        r_del = requests.delete(f"{BASE_URL}/api/admin/gallery/{gal_id}", headers=admin_headers, timeout=5)
        passed = (r_get.status_code == 200 and r_post.status_code == 201 and r_del.status_code == 200)
        log_test(30, "Gallery API", passed, "GET, POST, DELETE succeeded")
    except Exception as e:
        log_test(30, "Gallery API", False, str(e))

    # 31. Sponsor CRUD
    try:
        r_get = requests.get(f"{BASE_URL}/api/sponsors", timeout=5)
        r_post = requests.post(f"{BASE_URL}/api/admin/sponsors", json={
            "name": "Quantum Industries",
            "tier": "platinum",
            "display_order": 1,
            "active": True
        }, headers=admin_headers, timeout=5)
        sp_id = r_post.json().get("id")
        r_put = requests.put(f"{BASE_URL}/api/admin/sponsors/{sp_id}", json={"tier": "title"}, headers=admin_headers, timeout=5)
        r_del = requests.delete(f"{BASE_URL}/api/admin/sponsors/{sp_id}", headers=admin_headers, timeout=5)
        passed = (r_get.status_code == 200 and r_post.status_code == 201 and r_put.status_code == 200 and r_del.status_code == 200)
        log_test(31, "Sponsor CRUD", passed, "GET, POST, PUT, DELETE succeeded")
    except Exception as e:
        log_test(31, "Sponsor CRUD", False, str(e))

    # 32. Contact submission & Admin management
    try:
        r_post = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "Tony Stark",
            "email": "tony@stark.com",
            "phone": "9876543210",
            "subject": "Sponsorship Inquiry",
            "message": "Interested in premier sponsorship for COLORIDO 2K26"
        }, timeout=5)
        r_list = requests.get(f"{BASE_URL}/api/admin/contact", headers=admin_headers, timeout=5)
        msgs = r_list.json().get("messages", [])
        last_msg = msgs[0] if msgs else {}
        r_put = requests.put(f"{BASE_URL}/api/admin/contact/{last_msg.get('id')}", json={"status": "read"}, headers=admin_headers, timeout=5) if last_msg else None
        passed = (r_post.status_code == 201 and r_list.status_code == 200 and (r_put and r_put.status_code == 200))
        log_test(32, "Contact submission & Admin management", passed, "POST /api/contact, GET /api/admin/contact, PUT succeeded")
    except Exception as e:
        log_test(32, "Contact submission & Admin management", False, str(e))

    # 33. Dashboard statistics (real database-derived numbers)
    try:
        r = requests.get(f"{BASE_URL}/api/admin/dashboard/stats", headers=admin_headers, timeout=5)
        stats = r.json()
        passed = (
            r.status_code == 200 and
            stats.get("total_registrations", 0) >= 2 and
            stats.get("total_events", 0) == 16 and
            stats.get("cultural_registrations", 0) >= 1 and
            stats.get("sports_registrations", 0) >= 1
        )
        log_test(33, "Dashboard statistics", passed, f"Regs: {stats.get('total_registrations')}, Events: {stats.get('total_events')}")
    except Exception as e:
        log_test(33, "Dashboard statistics", False, str(e))

    # 34. CSV export
    try:
        r = requests.get(f"{BASE_URL}/api/admin/registrations/export/csv", headers=admin_headers, timeout=5)
        content = r.text
        reader = list(csv.reader(io.StringIO(content)))
        passed = (r.status_code == 200 and len(reader) >= 3 and "Registration ID" in reader[0])
        log_test(34, "CSV export", passed, f"HTTP {r.status_code}, Rows: {len(reader)}")
    except Exception as e:
        log_test(34, "CSV export", False, str(e))

    # 35. XLSX export
    try:
        r = requests.get(f"{BASE_URL}/api/admin/registrations/export/xlsx", headers=admin_headers, timeout=5)
        passed = (r.status_code == 200 and r.content[:4] == b"PK\x03\x04")  # Zip signature of xlsx
        log_test(35, "XLSX export", passed, f"HTTP {r.status_code}, Bytes: {len(r.content)}")
    except Exception as e:
        log_test(35, "XLSX export", False, str(e))

    # 36. PDF export (single pass and bulk report)
    try:
        r_single = requests.get(f"{BASE_URL}/api/admin/registrations/{solo_reg_id}/pdf", headers=admin_headers, timeout=5)
        r_bulk = requests.post(f"{BASE_URL}/api/admin/registrations/export/pdf", json={}, headers=admin_headers, timeout=5)
        passed = (
            r_single.status_code == 200 and r_single.content[:4] == b"%PDF" and
            r_bulk.status_code == 200 and r_bulk.content[:4] == b"%PDF"
        )
        log_test(36, "PDF export (Single Pass & Bulk)", passed, f"Single: {len(r_single.content)}b, Bulk: {len(r_bulk.content)}b")
    except Exception as e:
        log_test(36, "PDF export (Single Pass & Bulk)", False, str(e))

    # 37. CORS configuration
    try:
        r = requests.options(f"{BASE_URL}/api/events", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }, timeout=5)
        allow_origin = r.headers.get("access-control-allow-origin")
        passed = (allow_origin in ["http://localhost:5173", "*"])
        log_test(37, "CORS configuration", passed, f"Allow-Origin: {allow_origin}")
    except Exception as e:
        log_test(37, "CORS configuration", False, str(e))

    # 38. Health endpoint with DB connection verification
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        data = r.json()
        passed = (r.status_code == 200 and data.get("database") == "connected")
        log_test(38, "Health endpoint with DB connection", passed, f"Status: {data}")
    except Exception as e:
        log_test(38, "Health endpoint with DB connection", False, str(e))

    print("\n============================================================")
    print(f"VERIFICATION COMPLETED: {passed_count}/38 PASSED, {failed_count}/38 FAILED")
    print("============================================================\n")

    return failed_count == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
