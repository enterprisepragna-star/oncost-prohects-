"""Final, robust image extraction.

Strategy: Instead of trying to extract embedded image bboxes (which often include
text/multi-product regions on multi-product pages), use the product code TEXT
position on the rendered page to crop the photo ABOVE the code, with conservative
bounds. This works because in this catalog the product photo is always above the
SG code text.
"""
import fitz
import os
import json
from PIL import Image

PDF_PATH = "/app/backend/data/sg_catalog.pdf"
OUT = "/app/backend/data/product_images"
os.makedirs(OUT, exist_ok=True)

doc = fitz.open(PDF_PATH)
products = json.load(open("/app/backend/data/products.json"))

from collections import defaultdict
by_page = defaultdict(list)
for p in products:
    by_page[p["page"]].append(p)

DPI = 220
processed = 0

for pno, prods in by_page.items():
    page = doc.load_page(pno - 1)
    page_rect = page.rect
    pw, ph = page_rect.width, page_rect.height
    pix = page.get_pixmap(dpi=DPI)
    page_img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    sx = pix.width / pw
    sy = pix.height / ph

    # Build a list of code positions on this page using search_for
    code_positions = []  # (code, x_center_pdf, y_top_pdf, full_rect)
    for p in prods:
        rects = page.search_for(p["code"])
        if not rects:
            # try without space
            rects = page.search_for(p["code"].replace(" ", ""))
        if not rects:
            continue
        r = rects[0]  # use first hit
        code_positions.append((p, r))

    # For each product, infer photo region as area ABOVE the code text
    # Sort by y to handle vertical groups
    code_positions_sorted = sorted(code_positions, key=lambda x: (x[1].y0, x[1].x0))

    # Helper: find the previous product's code position above this one to limit upward expansion
    for idx, (p, r) in enumerate(code_positions):
        # x-center based on code text
        cx_pdf = (r.x0 + r.x1) / 2
        ctop_pdf = r.y0

        # Find vertical bounds — look at other code positions whose y is above this one
        # and whose x overlaps, to determine top of this product's photo
        candidates_above = []
        for q, qr in code_positions:
            if q["code"] == p["code"]:
                continue
            qcx = (qr.x0 + qr.x1) / 2
            # same column if x distance < pw/4
            if abs(qcx - cx_pdf) < pw * 0.18 and qr.y0 < ctop_pdf:
                candidates_above.append(qr.y1)  # bottom of code text above this
        photo_top_pdf = max(candidates_above) + 4 if candidates_above else max(0, ctop_pdf - 220)

        # Photo bottom = just above this code (small gap)
        photo_bottom_pdf = ctop_pdf - 2

        # Photo width: estimate column width based on layout (1, 2, or 3 columns)
        # Find horizontal neighbors (same y band) to compute column width
        x_neighbors = [((qr.x0 + qr.x1) / 2) for q, qr in code_positions
                       if q["code"] != p["code"] and abs(((qr.y0 + qr.y1) / 2) - ((r.y0 + r.y1) / 2)) < 20]
        if x_neighbors:
            # nearest neighbor x distance
            dists = [abs(x - cx_pdf) for x in x_neighbors]
            min_d = min(dists)
            half_w = max(40, min_d / 2 - 4)
        else:
            half_w = pw * 0.35  # fullish width if only one product on that row

        photo_left_pdf = max(2, cx_pdf - half_w)
        photo_right_pdf = min(pw - 2, cx_pdf + half_w)

        # Convert to pixel coords on rendered page
        x0 = int(photo_left_pdf * sx)
        x1 = int(photo_right_pdf * sx)
        y0 = int(photo_top_pdf * sy)
        y1 = int(photo_bottom_pdf * sy)
        if x1 - x0 < 50 or y1 - y0 < 50:
            continue
        crop = page_img.crop((x0, y0, x1, y1))

        # Add small inner margin (trim 2% all sides)
        cw, ch = crop.size
        crop = crop.crop((int(cw * 0.02), int(ch * 0.02), int(cw * 0.98), int(ch * 0.98)))

        # Pad to square on white
        cw, ch = crop.size
        side = max(cw, ch)
        canvas = Image.new("RGB", (side, side), (255, 255, 255))
        canvas.paste(crop, ((side - cw) // 2, (side - ch) // 2))
        canvas.thumbnail((720, 720))

        out_path = os.path.join(OUT, f"{p['code'].replace(' ', '_')}.jpg")
        canvas.save(out_path, "JPEG", quality=88)
        processed += 1

print(f"Processed {processed} / {len(products)} images via text-anchored crop.")
