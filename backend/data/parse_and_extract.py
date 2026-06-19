"""Parse products from text dump + match each product to its image bbox on the page.
For each product, crop the rendered page (at high DPI) at the image bbox to get a clean photo.
"""
import fitz
import os
import re
import json
from PIL import Image

PDF_PATH = "/app/backend/data/sg_catalog.pdf"
OUT_IMG = "/app/backend/data/product_images"
os.makedirs(OUT_IMG, exist_ok=True)

doc = fitz.open(PDF_PATH)

# ----- Parse products from text -----
products = []  # list of dicts {code, items_text, price, moq, page}

def parse_page_products(text, page_no):
    # Split by product code markers "SG NNN"
    parts = re.split(r"(?=SG\s*\d+)", text)
    for part in parts:
        m = re.match(r"SG\s*(\d+)", part)
        if not m:
            continue
        code = f"SG {m.group(1).strip()}"
        # Extract price
        pm = re.search(r"(?:Price\s*)?(?:Rs[.,]?)\s*([0-9]{2,5})", part, re.I)
        if not pm:
            pm = re.search(r"Price\s*([0-9]{2,5})", part, re.I)
        price = int(pm.group(1)) if pm else None
        # MOQ
        mm = re.search(r"MOQ[, ]*([0-9]+)", part, re.I)
        moq = int(mm.group(1)) if mm else None
        # Set type
        sm = re.search(r"(\d+\s*in\s*1)", part, re.I)
        set_type = sm.group(1).replace(" ", "") if sm else None
        # Items: everything between heading and Price line
        lines = [ln.strip(" ,") for ln in part.splitlines() if ln.strip()]
        # remove the code line + n in 1 line + price line
        items = []
        for ln in lines[1:]:
            if re.match(r"^SG\s*\d+", ln):
                continue
            if re.match(r"\d+\s*in\s*1", ln, re.I):
                continue
            if "Price" in ln or "Rs" in ln or "MOQ" in ln:
                continue
            items.append(ln.strip(" ,&"))
        items_text = ", ".join([x for x in items if x])
        items_text = re.sub(r",\s*,", ",", items_text)
        items_text = re.sub(r"\s+", " ", items_text).strip(" ,")
        products.append({
            "code": code,
            "page": page_no,
            "set_type": set_type or "",
            "items": items_text,
            "sg_price": price,
            "moq": moq or 50,
        })

# Read text dump
with open("/app/backend/data/all_text.txt") as f:
    txt = f.read()

# Split per page
page_chunks = re.split(r"=== PAGE (\d+) ===", txt)
# page_chunks[0] is empty/before; then [num, content, num, content, ...]
for i in range(1, len(page_chunks), 2):
    page_no = int(page_chunks[i])
    content = page_chunks[i + 1]
    parse_page_products(content, page_no)

print(f"Total products parsed: {len(products)}")

# ----- Match images to products -----
# For each page, get image bboxes (filtered by size), sort top-to-bottom, left-to-right
# Group products by page
from collections import defaultdict
by_page = defaultdict(list)
for p in products:
    by_page[p["page"]].append(p)

for pno, prods in by_page.items():
    page = doc.load_page(pno - 1)
    page_rect = page.rect
    info = page.get_image_info(xrefs=True)
    images = []
    for im in info:
        bbox = im.get("bbox")
        if not bbox:
            continue
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        if w < 100 or h < 100:
            continue
        # Filter very wide/short (likely banners): aspect ratio
        if w / max(h, 1) > 3 or h / max(w, 1) > 3:
            continue
        images.append(bbox)
    # Keep top N largest (by area) if more than products count
    if len(images) > len(prods):
        images.sort(key=lambda b: -((b[2]-b[0])*(b[3]-b[1])))
        images = images[:len(prods)]
    # Sort by reading order (rows then cols). Use a row tolerance.
    if not images:
        continue
    images.sort(key=lambda b: (round(b[1] / 50), b[0]))
    # Render page at high DPI
    DPI = 200
    pix = page.get_pixmap(dpi=DPI)
    page_img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    scale_x = pix.width / page_rect.width
    scale_y = pix.height / page_rect.height
    for prod, bbox in zip(prods, images):
        x0 = int(bbox[0] * scale_x)
        y0 = int(bbox[1] * scale_y)
        x1 = int(bbox[2] * scale_x)
        y1 = int(bbox[3] * scale_y)
        crop = page_img.crop((x0, y0, x1, y1))
        # Resize to max 700px
        crop.thumbnail((700, 700))
        out_path = os.path.join(OUT_IMG, f"{prod['code'].replace(' ', '_')}.jpg")
        crop.save(out_path, "JPEG", quality=85)
        prod["image"] = f"{prod['code'].replace(' ', '_')}.jpg"

# Save products json
with open("/app/backend/data/products.json", "w") as f:
    json.dump(products, f, indent=2)

print(f"Saved {len([p for p in products if p.get('image')])} product images")
print("Sample:", json.dumps(products[:3], indent=2))
