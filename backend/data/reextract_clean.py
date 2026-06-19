"""Re-extract product images cleanly:
- Use image bboxes from PDF
- Crop the BOTTOM 12% to remove any text/banner bleed
- Add a small horizontal inset (3%) to remove side artifacts
- Output square images on a white canvas (avoid awkward aspect ratios)
"""
import fitz
import os
import json
from PIL import Image, ImageOps

PDF_PATH = "/app/backend/data/sg_catalog.pdf"
OUT = "/app/backend/data/product_images"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF_PATH)
products = json.load(open("/app/backend/data/products.json"))

# Group by page
from collections import defaultdict
by_page = defaultdict(list)
for p in products:
    by_page[p["page"]].append(p)

DPI = 220
for pno, prods in by_page.items():
    page = doc.load_page(pno - 1)
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
        if w / max(h, 1) > 3 or h / max(w, 1) > 3:
            continue
        images.append(bbox)
    if len(images) > len(prods):
        images.sort(key=lambda b: -((b[2]-b[0])*(b[3]-b[1])))
        images = images[:len(prods)]
    images.sort(key=lambda b: (round(b[1] / 50), b[0]))
    if not images:
        continue

    page_rect = page.rect
    pix = page.get_pixmap(dpi=DPI)
    page_img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    sx = pix.width / page_rect.width
    sy = pix.height / page_rect.height

    for prod, bbox in zip(prods, images):
        x0 = int(bbox[0] * sx)
        y0 = int(bbox[1] * sy)
        x1 = int(bbox[2] * sx)
        y1 = int(bbox[3] * sy)
        # Inset crop: trim bottom 14% to remove text bleed, top 2%, sides 3%
        w = x1 - x0
        h = y1 - y0
        x0 += int(w * 0.03)
        x1 -= int(w * 0.03)
        y0 += int(h * 0.02)
        y1 -= int(h * 0.14)
        crop = page_img.crop((x0, y0, x1, y1))

        # Pad to square on white background for consistent grid
        cw, ch = crop.size
        side = max(cw, ch)
        canvas = Image.new("RGB", (side, side), (255, 255, 255))
        canvas.paste(crop, ((side - cw) // 2, (side - ch) // 2))
        canvas.thumbnail((720, 720))

        out_path = os.path.join(OUT, f"{prod['code'].replace(' ', '_')}.jpg")
        canvas.save(out_path, "JPEG", quality=87)

print("Re-extracted", len(products), "images")
