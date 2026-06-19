"""Tests for POST /api/products/{pid}/image endpoint."""
import io
import os
import pytest
import requests

BASE_URL = (os.environ.get("BACKEND_BASE_URL") or "https://catalog-markup.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@oncost.shop"
ADMIN_PASSWORD = "oncost@2026"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def sg501(auth_headers):
    """Find SG 501 product and return its id + original image."""
    r = requests.get(f"{BASE_URL}/api/products", headers=auth_headers)
    assert r.status_code == 200
    items = r.json()
    target = next((p for p in items if p["code"] == "SG 501"), None)
    assert target, "SG 501 not found"
    return target


def _make_jpg(color=(255, 0, 0), size=(200, 200)) -> bytes:
    from PIL import Image
    img = Image.new("RGB", size, color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


class TestProductImageUpload:
    def test_upload_no_auth_returns_401(self, sg501):
        files = {"file": ("test.jpg", _make_jpg(), "image/jpeg")}
        r = requests.post(f"{BASE_URL}/api/products/{sg501['id']}/image", files=files)
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    def test_upload_non_image_returns_400(self, sg501, auth_headers):
        files = {"file": ("bad.txt", b"hello world", "text/plain")}
        r = requests.post(
            f"{BASE_URL}/api/products/{sg501['id']}/image",
            headers=auth_headers,
            files=files,
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"

    def test_upload_valid_jpg_updates_product(self, sg501, auth_headers):
        original_image = sg501.get("image")
        files = {"file": ("red.jpg", _make_jpg(color=(220, 30, 30)), "image/jpeg")}
        r = requests.post(
            f"{BASE_URL}/api/products/{sg501['id']}/image",
            headers=auth_headers,
            files=files,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text}"
        body = r.json()
        assert "image" in body
        new_name = body["image"]
        assert new_name.endswith(".jpg")
        assert new_name.startswith("SG_501_")
        assert new_name != original_image

        # Verify GET /api/products reflects new filename
        r2 = requests.get(f"{BASE_URL}/api/products", headers=auth_headers)
        assert r2.status_code == 200
        updated = next(p for p in r2.json() if p["id"] == sg501["id"])
        assert updated["image"] == new_name

        # Verify image is served publicly
        r3 = requests.get(f"{BASE_URL}/api/images/{new_name}")
        assert r3.status_code == 200
        assert r3.headers.get("content-type", "").startswith("image/")

        # Cleanup: restore original image so catalog still works
        r4 = requests.put(
            f"{BASE_URL}/api/products/{sg501['id']}",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"image": "SG_501.jpg"},
        )
        assert r4.status_code == 200
        assert r4.json()["image"] == "SG_501.jpg"

    def test_upload_png_works(self, sg501, auth_headers):
        from PIL import Image
        img = Image.new("RGB", (150, 150), (0, 100, 200))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        files = {"file": ("blue.png", buf.getvalue(), "image/png")}
        r = requests.post(
            f"{BASE_URL}/api/products/{sg501['id']}/image",
            headers=auth_headers,
            files=files,
        )
        assert r.status_code == 200, r.text
        # Cleanup again
        requests.put(
            f"{BASE_URL}/api/products/{sg501['id']}",
            headers={**auth_headers, "Content-Type": "application/json"},
            json={"image": "SG_501.jpg"},
        )
