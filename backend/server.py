"""ONCOST Catalog & Quotation backend.

FastAPI + MongoDB. Implements admin auth, product catalog, pricing rules,
quotation management with shareable links, PDF generation.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import io
import json
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from starlette.middleware.cors import CORSMiddleware

# PDF/HTML
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak,
)
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"].lower()
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

DATA_DIR = ROOT_DIR / "data"
IMAGES_DIR = DATA_DIR / "product_images"
PRODUCTS_JSON = DATA_DIR / "products.json"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logger = logging.getLogger("oncost")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

# ---------- Helpers ----------

def now_utc():
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": now_utc() + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def serialize_doc(d: dict) -> dict:
    """Convert ObjectId to str, drop password_hash, keep id as string."""
    if not d:
        return d
    out = dict(d)
    if "_id" in out:
        out["id"] = str(out.pop("_id"))
    out.pop("password_hash", None)
    return out


def compute_oncost_price(sg_price: int, rule: dict) -> int:
    """rule: {threshold, below_increment, at_or_above_increment, rounding}"""
    threshold = rule.get("threshold", 1000)
    below = rule.get("below_increment", 50)
    above = rule.get("at_or_above_increment", 100)
    if sg_price < threshold:
        return int(sg_price + below)
    return int(sg_price + above)


# ---------- Auth dependency ----------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return serialize_doc(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- App ----------
app = FastAPI(title="ONCOST Catalog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")

# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class PricingRule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    threshold: int = 1000
    below_increment: int = 50
    at_or_above_increment: int = 100
    rounding: int = 1  # round to nearest n rupees (1 = exact)


class ProductIn(BaseModel):
    code: str
    set_type: str = ""
    items: str = ""
    sg_price: int
    moq: int = 50
    image: Optional[str] = None
    override_price: Optional[int] = None
    visible: bool = True


class ProductPatch(BaseModel):
    code: Optional[str] = None
    set_type: Optional[str] = None
    items: Optional[str] = None
    sg_price: Optional[int] = None
    moq: Optional[int] = None
    image: Optional[str] = None
    override_price: Optional[int] = None
    visible: Optional[bool] = None


class QuotationItemIn(BaseModel):
    product_id: str
    quantity: int


class QuotationIn(BaseModel):
    customer_name: str
    place: str = ""
    notes: str = ""
    items: List[QuotationItemIn]
    valid_until: Optional[str] = None


# ---------- Auth endpoints ----------
@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(
        key="access_token", value=token,
        httponly=True, secure=True, samesite="none",
        max_age=7 * 24 * 3600, path="/",
    )
    return {"user": serialize_doc(user), "access_token": token}


@api.post("/auth/logout")
async def logout(response: Response, _user=Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---------- Pricing rule ----------
@api.get("/pricing-rule")
async def get_rule(_user=Depends(get_current_user)):
    rule = await db.pricing_rule.find_one({"_id": "default"})
    if not rule:
        rule = {"_id": "default", "threshold": 1000, "below_increment": 50, "at_or_above_increment": 100, "rounding": 1}
        await db.pricing_rule.insert_one(rule)
    rule.pop("_id", None)
    return rule


@api.put("/pricing-rule")
async def put_rule(rule: PricingRule, _user=Depends(get_current_user)):
    doc = rule.model_dump()
    await db.pricing_rule.update_one({"_id": "default"}, {"$set": doc}, upsert=True)
    return doc


@api.get("/public/pricing-rule")
async def public_rule():
    rule = await db.pricing_rule.find_one({"_id": "default"})
    if not rule:
        return {"threshold": 1000, "below_increment": 50, "at_or_above_increment": 100}
    rule.pop("_id", None)
    return rule


# ---------- Products ----------
async def _list_products(visible_only: bool = False) -> list:
    q = {"visible": True} if visible_only else {}
    cur = db.products.find(q).sort("code", 1)
    items = await cur.to_list(length=1000)
    rule = await db.pricing_rule.find_one({"_id": "default"}) or {
        "threshold": 1000, "below_increment": 50, "at_or_above_increment": 100,
    }
    for it in items:
        it["id"] = str(it.pop("_id"))
        sg = it.get("sg_price", 0)
        ov = it.get("override_price")
        oncost = int(ov) if ov is not None else compute_oncost_price(sg, rule)
        it["oncost_price"] = oncost
    return items


@api.get("/products")
async def get_products(_user=Depends(get_current_user)):
    return await _list_products()


@api.get("/public/products")
async def public_products():
    items = await _list_products(visible_only=True)
    # Strip sg_price from public view
    for it in items:
        it.pop("sg_price", None)
        it.pop("override_price", None)
    return items


@api.post("/products")
async def create_product(p: ProductIn, _user=Depends(get_current_user)):
    doc = p.model_dump()
    doc["created_at"] = iso(now_utc())
    res = await db.products.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc


@api.put("/products/{pid}")
async def update_product(pid: str, p: ProductPatch, _user=Depends(get_current_user)):
    # Allow override_price=None explicitly (to clear override). For other fields, skip None.
    raw = p.model_dump(exclude_unset=True)
    update = {}
    for k, v in raw.items():
        if k == "override_price":
            update[k] = v  # may be None to clear
        elif v is not None:
            update[k] = v
    if not update:
        raise HTTPException(400, "No fields to update")
    res = await db.products.update_one({"_id": ObjectId(pid)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    doc = await db.products.find_one({"_id": ObjectId(pid)})
    doc["id"] = str(doc.pop("_id"))
    return doc


@api.delete("/products/{pid}")
async def delete_product(pid: str, _user=Depends(get_current_user)):
    res = await db.products.delete_one({"_id": ObjectId(pid)})
    if res.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


# ---------- Quotations ----------
async def _build_quotation_doc(q: QuotationIn) -> dict:
    rule = await db.pricing_rule.find_one({"_id": "default"}) or {}
    items_out = []
    total = 0
    for qi in q.items:
        prod = await db.products.find_one({"_id": ObjectId(qi.product_id)})
        if not prod:
            raise HTTPException(400, f"Product {qi.product_id} not found")
        sg = prod.get("sg_price", 0)
        ov = prod.get("override_price")
        oncost = int(ov) if ov is not None else compute_oncost_price(sg, rule)
        line_total = oncost * qi.quantity
        total += line_total
        items_out.append({
            "product_id": str(prod["_id"]),
            "code": prod["code"],
            "set_type": prod.get("set_type", ""),
            "items": prod.get("items", ""),
            "image": prod.get("image"),
            "moq": prod.get("moq", 50),
            "unit_price": oncost,
            "quantity": qi.quantity,
            "line_total": line_total,
        })
    # Quotation ID like ONC-202602-0001
    seq_doc = await db.counters.find_one_and_update(
        {"_id": "quotation"},
        {"$inc": {"seq": 1}},
        upsert=True, return_document=True,
    )
    seq = seq_doc["seq"] if seq_doc else 1
    qid = f"ONC-{datetime.now().strftime('%Y%m')}-{seq:04d}"
    token = secrets.token_urlsafe(10)
    doc = {
        "quotation_id": qid,
        "customer_name": q.customer_name,
        "place": q.place,
        "notes": q.notes,
        "items": items_out,
        "total": total,
        "valid_until": q.valid_until,
        "share_token": token,
        "active": True,
        "created_at": iso(now_utc()),
    }
    return doc


@api.post("/quotations")
async def create_quotation(q: QuotationIn, _user=Depends(get_current_user)):
    doc = await _build_quotation_doc(q)
    res = await db.quotations.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc


@api.get("/quotations")
async def list_quotations(_user=Depends(get_current_user)):
    cur = db.quotations.find({}).sort("created_at", -1)
    out = []
    for d in await cur.to_list(length=500):
        d["id"] = str(d.pop("_id"))
        out.append(d)
    return out


@api.get("/quotations/{qid}")
async def get_quotation(qid: str, _user=Depends(get_current_user)):
    d = await db.quotations.find_one({"_id": ObjectId(qid)})
    if not d:
        raise HTTPException(404, "Not found")
    d["id"] = str(d.pop("_id"))
    return d


@api.patch("/quotations/{qid}/toggle")
async def toggle_quotation(qid: str, _user=Depends(get_current_user)):
    d = await db.quotations.find_one({"_id": ObjectId(qid)})
    if not d:
        raise HTTPException(404, "Not found")
    new_active = not d.get("active", True)
    await db.quotations.update_one({"_id": ObjectId(qid)}, {"$set": {"active": new_active}})
    return {"active": new_active}


@api.delete("/quotations/{qid}")
async def delete_quotation(qid: str, _user=Depends(get_current_user)):
    res = await db.quotations.delete_one({"_id": ObjectId(qid)})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---------- Public share ----------
@api.get("/share/{token}")
async def public_quotation(token: str):
    d = await db.quotations.find_one({"share_token": token})
    if not d or not d.get("active", True):
        raise HTTPException(404, "Quotation not available")
    d["id"] = str(d.pop("_id"))
    # Strip any internal-only fields (no SG cost stored on quotation snapshots already)
    return d


# ---------- PDF generation ----------
def _build_pdf(q: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title=f"ONCOST Quotation {q['quotation_id']}",
    )
    styles = getSampleStyleSheet()
    h_title = ParagraphStyle("h_title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, textColor=colors.HexColor("#002FA7"), alignment=TA_LEFT, leading=28, spaceAfter=4)
    h_meta = ParagraphStyle("h_meta", parent=styles["Normal"], fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#52525B"))
    h_label = ParagraphStyle("h_label", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=7, textColor=colors.HexColor("#A1A1AA"), leading=9, spaceAfter=2)
    h_value = ParagraphStyle("h_value", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11, textColor=colors.HexColor("#09090B"), leading=14)
    h_section = ParagraphStyle("h_section", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#A1A1AA"), leading=10, spaceAfter=6)
    h_total = ParagraphStyle("h_total", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=14, textColor=colors.HexColor("#09090B"), alignment=TA_RIGHT)
    h_footer = ParagraphStyle("h_footer", parent=styles["Normal"], fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#A1A1AA"), alignment=TA_CENTER)

    story = []

    # Header
    header_data = [[
        Paragraph("ONCOST", h_title),
        Paragraph(f"<b>QUOTATION</b><br/>{q['quotation_id']}", ParagraphStyle('hr', parent=styles['Normal'], fontName='Helvetica', fontSize=10, alignment=TA_RIGHT, textColor=colors.HexColor('#09090B'), leading=14)),
    ]]
    htbl = Table(header_data, colWidths=[100*mm, 70*mm])
    htbl.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP")]))
    story.append(htbl)
    story.append(Spacer(1, 4*mm))
    # Divider
    line_tbl = Table([[""]], colWidths=[174*mm], rowHeights=[1])
    line_tbl.setStyle(TableStyle([("LINEABOVE", (0,0), (-1,-1), 1, colors.HexColor("#E4E4E7"))]))
    story.append(line_tbl)
    story.append(Spacer(1, 6*mm))

    # Meta block (customer, place, date, validity)
    created = q.get("created_at", "")
    try:
        created_dt = datetime.fromisoformat(created)
        created_str = created_dt.strftime("%d %b %Y")
    except Exception:
        created_str = created[:10]
    meta = [
        [Paragraph("CUSTOMER", h_label), Paragraph("PLACE OF ORDER", h_label), Paragraph("DATE", h_label), Paragraph("VALID UNTIL", h_label)],
        [Paragraph(q.get("customer_name") or "—", h_value), Paragraph(q.get("place") or "—", h_value), Paragraph(created_str, h_value), Paragraph(q.get("valid_until") or "—", h_value)],
    ]
    mtbl = Table(meta, colWidths=[55*mm, 50*mm, 35*mm, 34*mm])
    mtbl.setStyle(TableStyle([
        ("BOTTOMPADDING", (0,0), (-1,0), 2),
        ("BOTTOMPADDING", (0,1), (-1,1), 8),
    ]))
    story.append(mtbl)
    story.append(Spacer(1, 4*mm))

    # Section title
    story.append(Paragraph("LINE ITEMS", h_section))

    # Items table
    rows = [[
        Paragraph("<b>CODE</b>", h_label),
        Paragraph("<b>PRODUCT</b>", h_label),
        Paragraph("<b>MOQ</b>", h_label),
        Paragraph("<b>QTY</b>", h_label),
        Paragraph("<b>UNIT (₹)</b>", h_label),
        Paragraph("<b>TOTAL (₹)</b>", h_label),
    ]]
    item_value = ParagraphStyle("iv", parent=styles["Normal"], fontName="Helvetica", fontSize=9, leading=12, textColor=colors.HexColor("#09090B"))
    item_value_b = ParagraphStyle("ivb", parent=item_value, fontName="Helvetica-Bold")
    for it in q["items"]:
        desc = f"<b>{it.get('set_type','')}</b><br/><font color='#52525B'>{it.get('items','')}</font>"
        rows.append([
            Paragraph(it["code"], item_value_b),
            Paragraph(desc, item_value),
            Paragraph(str(it.get("moq", "")), item_value),
            Paragraph(str(it.get("quantity", "")), item_value),
            Paragraph(f"{it['unit_price']:,}", item_value),
            Paragraph(f"{it['line_total']:,}", item_value_b),
        ])
    itbl = Table(rows, colWidths=[20*mm, 80*mm, 14*mm, 14*mm, 20*mm, 26*mm], repeatRows=1)
    itbl.setStyle(TableStyle([
        ("LINEBELOW", (0,0), (-1,0), 1, colors.HexColor("#09090B")),
        ("LINEBELOW", (0,1), (-1,-1), 0.5, colors.HexColor("#E4E4E7")),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(itbl)
    story.append(Spacer(1, 6*mm))

    # Total
    total_tbl = Table([[
        Paragraph(f"<font color='#A1A1AA' size='8'><b>GRAND TOTAL</b></font>", h_meta),
        Paragraph(f"₹ {q['total']:,}", h_total),
    ]], colWidths=[100*mm, 74*mm])
    total_tbl.setStyle(TableStyle([
        ("LINEABOVE", (0,0), (-1,-1), 1, colors.HexColor("#09090B")),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(total_tbl)

    if q.get("notes"):
        story.append(Spacer(1, 8*mm))
        story.append(Paragraph("NOTES", h_section))
        story.append(Paragraph(q["notes"], h_meta))

    story.append(Spacer(1, 14*mm))
    story.append(Paragraph("This is a system-generated quotation by ONCOST. Prices in INR (₹), exclusive of taxes & freight unless mentioned.", h_footer))

    doc.build(story)
    return buf.getvalue()


@api.get("/share/{token}/pdf")
async def share_pdf(token: str):
    d = await db.quotations.find_one({"share_token": token})
    if not d or not d.get("active", True):
        raise HTTPException(404, "Quotation not available")
    d["id"] = str(d.pop("_id"))
    pdf_bytes = _build_pdf(d)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="ONCOST-{d["quotation_id"]}.pdf"'},
    )


@api.get("/quotations/{qid}/pdf")
async def admin_quotation_pdf(qid: str, _user=Depends(get_current_user)):
    d = await db.quotations.find_one({"_id": ObjectId(qid)})
    if not d:
        raise HTTPException(404, "Not found")
    d["id"] = str(d.pop("_id"))
    pdf_bytes = _build_pdf(d)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="ONCOST-{d["quotation_id"]}.pdf"'},
    )


# ---------- Images (public, static) ----------
@api.get("/images/{filename}")
async def get_image(filename: str):
    # basic safety
    if "/" in filename or ".." in filename:
        raise HTTPException(400, "bad name")
    fp = IMAGES_DIR / filename
    if not fp.exists():
        raise HTTPException(404, "not found")
    return FileResponse(str(fp), media_type="image/jpeg")


# ---------- Startup: seed admin + products + indexes ----------
@app.on_event("startup")
async def startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.quotations.create_index("share_token", unique=True)
    await db.products.create_index("code", unique=True)

    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "ONCOST Admin",
            "role": "admin",
            "created_at": iso(now_utc()),
        })
        logger.info(f"Admin user seeded: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info("Admin password updated from env")

    # Seed pricing rule
    if not await db.pricing_rule.find_one({"_id": "default"}):
        await db.pricing_rule.insert_one({
            "_id": "default",
            "threshold": 1000,
            "below_increment": 50,
            "at_or_above_increment": 100,
            "rounding": 1,
        })

    # Seed products from products.json if collection empty
    count = await db.products.count_documents({})
    if count == 0 and PRODUCTS_JSON.exists():
        items = json.loads(PRODUCTS_JSON.read_text())
        docs = []
        for it in items:
            docs.append({
                "code": it["code"],
                "set_type": it.get("set_type", ""),
                "items": it.get("items", ""),
                "sg_price": int(it.get("sg_price", 0)),
                "moq": int(it.get("moq", 50)),
                "image": it.get("image"),
                "override_price": None,
                "visible": True,
                "created_at": iso(now_utc()),
            })
        if docs:
            await db.products.insert_many(docs)
            logger.info(f"Seeded {len(docs)} products")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)


@app.get("/")
async def root():
    return {"app": "ONCOST Catalog API", "ok": True}
