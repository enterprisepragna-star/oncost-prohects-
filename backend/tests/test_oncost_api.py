"""End-to-end backend API tests for ONCOST Catalog & Quotation app."""
import os
import pytest
import requests

BASE_URL = os.environ.get("BACKEND_BASE_URL") or "https://catalog-markup.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

ADMIN_EMAIL = "admin@oncost.shop"
ADMIN_PASSWORD = "oncost@2026"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def token(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str)
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --- Auth ---
class TestAuth:
    def test_login_success_and_me(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data.get("role") == "admin"

    def test_login_invalid(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_no_auth(self, session):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401


# --- Products ---
class TestProducts:
    def test_list_products_count_and_pricing(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/products", headers=auth_headers)
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) == 92, f"Expected 92 products, got {len(products)}"
        # Check required fields
        sample = products[0]
        for f in ["id", "code", "set_type", "items", "sg_price", "moq", "oncost_price", "visible"]:
            assert f in sample, f"missing field {f}"
        # Validate oncost_price computation with default rule (1000/50/100)
        for p in products:
            if p.get("override_price"):
                continue
            sg = p["sg_price"]
            expected = sg + (50 if sg < 1000 else 100)
            assert p["oncost_price"] == expected, f"Product {p['code']}: sg={sg}, expected={expected}, got={p['oncost_price']}"

    def test_public_products_no_sg(self, session):
        r = requests.get(f"{BASE_URL}/api/public/products")
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) > 0
        for p in products:
            assert "sg_price" not in p, "Public must not expose sg_price"
            assert "override_price" not in p, "Public must not expose override_price"
            assert "oncost_price" in p

    def test_override_price_flow(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/products", headers=auth_headers)
        prods = r.json()
        target = prods[0]
        pid = target["id"]
        original_oncost = target["oncost_price"]
        # Set override
        r2 = session.put(f"{BASE_URL}/api/products/{pid}", headers=auth_headers, json={"override_price": 999})
        assert r2.status_code == 200, r2.text
        # Verify
        r3 = session.get(f"{BASE_URL}/api/products", headers=auth_headers)
        updated = next(p for p in r3.json() if p["id"] == pid)
        assert updated["oncost_price"] == 999, f"Expected override 999, got {updated['oncost_price']}"
        # Reset by setting override_price to 0 (since None gets filtered out by ProductPatch logic).
        # Workaround: backend filters out None in update so we update directly via mongo-style? No - we must set to falsy.
        # Test cleanup: set override back to 0 makes `prod.get("override_price") or compute(...)` return computed.
        r4 = session.put(f"{BASE_URL}/api/products/{pid}", headers=auth_headers, json={"override_price": 0})
        assert r4.status_code == 200
        r5 = session.get(f"{BASE_URL}/api/products", headers=auth_headers)
        cleaned = next(p for p in r5.json() if p["id"] == pid)
        assert cleaned["oncost_price"] == original_oncost, f"Override clear failed: got {cleaned['oncost_price']} vs orig {original_oncost}"

    def test_visibility_toggle(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/products", headers=auth_headers)
        prods = r.json()
        target = prods[1]
        pid = target["id"]
        code = target["code"]
        # Hide
        r2 = session.put(f"{BASE_URL}/api/products/{pid}", headers=auth_headers, json={"visible": False})
        assert r2.status_code == 200
        # public should not have it
        pub = requests.get(f"{BASE_URL}/api/public/products").json()
        assert not any(p["code"] == code for p in pub), f"Hidden product {code} still in public"
        # admin should
        adm = session.get(f"{BASE_URL}/api/products", headers=auth_headers).json()
        assert any(p["code"] == code for p in adm)
        # Restore
        r3 = session.put(f"{BASE_URL}/api/products/{pid}", headers=auth_headers, json={"visible": True})
        assert r3.status_code == 200


# --- Pricing rule ---
class TestPricingRule:
    def test_get_and_update_rule(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/pricing-rule", headers=auth_headers)
        assert r.status_code == 200
        rule = r.json()
        assert rule.get("threshold") == 1000
        assert rule.get("below_increment") == 50
        assert rule.get("at_or_above_increment") == 100
        # Update
        new_rule = {"threshold": 500, "below_increment": 25, "at_or_above_increment": 200, "rounding": 1}
        r2 = session.put(f"{BASE_URL}/api/pricing-rule", headers=auth_headers, json=new_rule)
        assert r2.status_code == 200
        # Fetch products and verify recompute
        prods = session.get(f"{BASE_URL}/api/products", headers=auth_headers).json()
        for p in prods:
            if p.get("override_price"):
                continue
            sg = p["sg_price"]
            expected = sg + (25 if sg < 500 else 200)
            assert p["oncost_price"] == expected, f"Rule recompute failed for {p['code']}: sg={sg} expected={expected} got={p['oncost_price']}"
        # Reset
        default = {"threshold": 1000, "below_increment": 50, "at_or_above_increment": 100, "rounding": 1}
        r3 = session.put(f"{BASE_URL}/api/pricing-rule", headers=auth_headers, json=default)
        assert r3.status_code == 200


# --- Quotations ---
class TestQuotations:
    quotation_ids = []
    share_tokens = []

    def test_create_quotation(self, session, auth_headers):
        prods = session.get(f"{BASE_URL}/api/products", headers=auth_headers).json()
        items = [
            {"product_id": prods[0]["id"], "quantity": 10},
            {"product_id": prods[1]["id"], "quantity": 5},
        ]
        payload = {"customer_name": "TEST_Acme Corp", "place": "Mumbai", "items": items, "notes": "test"}
        r = session.post(f"{BASE_URL}/api/quotations", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        q = r.json()
        assert q["customer_name"] == "TEST_Acme Corp"
        assert q["place"] == "Mumbai"
        import re
        assert re.match(r"^ONC-\d{6}-\d{4}$", q["quotation_id"]), f"Bad quote id format: {q['quotation_id']}"
        assert isinstance(q["share_token"], str) and len(q["share_token"]) > 5
        assert q["active"] is True
        expected_total = sum(it["unit_price"] * it["quantity"] for it in q["items"])
        assert q["total"] == expected_total
        TestQuotations.quotation_ids.append(q["id"])
        TestQuotations.share_tokens.append(q["share_token"])

    def test_public_share_and_pdf(self, session, auth_headers):
        token = TestQuotations.share_tokens[0]
        r = requests.get(f"{BASE_URL}/api/share/{token}")
        assert r.status_code == 200
        data = r.json()
        assert data["customer_name"] == "TEST_Acme Corp"
        # PDF
        rp = requests.get(f"{BASE_URL}/api/share/{token}/pdf")
        assert rp.status_code == 200
        assert rp.headers.get("content-type", "").startswith("application/pdf")
        assert rp.content[:4] == b"%PDF", "PDF magic bytes missing"

    def test_toggle_quotation(self, session, auth_headers):
        qid = TestQuotations.quotation_ids[0]
        token = TestQuotations.share_tokens[0]
        # Disable
        r = session.patch(f"{BASE_URL}/api/quotations/{qid}/toggle", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["active"] is False
        # Public should 404
        assert requests.get(f"{BASE_URL}/api/share/{token}").status_code == 404
        assert requests.get(f"{BASE_URL}/api/share/{token}/pdf").status_code == 404
        # Re-enable
        r2 = session.patch(f"{BASE_URL}/api/quotations/{qid}/toggle", headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json()["active"] is True
        assert requests.get(f"{BASE_URL}/api/share/{token}").status_code == 200

    def test_delete_quotation(self, session, auth_headers):
        # Create a fresh disposable one to delete
        prods = session.get(f"{BASE_URL}/api/products", headers=auth_headers).json()
        payload = {"customer_name": "TEST_DeleteMe", "place": "Delhi", "items": [{"product_id": prods[0]["id"], "quantity": 1}]}
        cr = session.post(f"{BASE_URL}/api/quotations", headers=auth_headers, json=payload)
        assert cr.status_code == 200
        q = cr.json()
        qid = q["id"]
        token = q["share_token"]
        # Delete
        dr = session.delete(f"{BASE_URL}/api/quotations/{qid}", headers=auth_headers)
        assert dr.status_code == 200
        # Public 404
        assert requests.get(f"{BASE_URL}/api/share/{token}").status_code == 404

    def test_cleanup_remaining_quotations(self, session, auth_headers):
        # Delete TEST_ quotations created
        all_q = session.get(f"{BASE_URL}/api/quotations", headers=auth_headers).json()
        for q in all_q:
            if q.get("customer_name", "").startswith("TEST_"):
                session.delete(f"{BASE_URL}/api/quotations/{q['id']}", headers=auth_headers)
        # Ensure default rule restored
        default = {"threshold": 1000, "below_increment": 50, "at_or_above_increment": 100, "rounding": 1}
        session.put(f"{BASE_URL}/api/pricing-rule", headers=auth_headers, json=default)
