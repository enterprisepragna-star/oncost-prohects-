"""Extract clean product photos from user's high-quality PAGE SCREENSHOTS.

Strategy:
1. For each page screenshot, use Tesseract OCR to locate every "SG NNN" text.
2. Determine column layout from x-positions of SG codes.
3. For each SG code, crop the region ABOVE the code text bounded by:
   - Column width (computed from neighbor SG x positions)
   - Top = bottom of code text above this one in same column, or top of page
   - Bottom = top of this SG code text (small gap of 6px)
4. Save as square, padded on white background.
"""
import os
import re
import json
from PIL import Image
import pytesseract
from collections import defaultdict

PAGES_DIR = "/app/backend/data/sg_pages"
OUT_DIR = "/app/backend/data/product_images"
os.makedirs(OUT_DIR, exist_ok=True)

products = json.load(open("/app/backend/data/products.json"))
by_page = defaultdict(list)
for p in products:
    by_page[p["page"]].append(p)

ROW_TOL = 25  # pixels for considering same row
SG_RE = re.compile(r"^SG\s*(\d+)$")

total_saved = 0
total_missing = []

for pno, prods in sorted(by_page.items()):
    fname = f"page_{pno:02d}.png"
    fpath = os.path.join(PAGES_DIR, fname)
    if not os.path.exists(fpath):
        print(f"[skip] {fname} missing")
        continue
    img = Image.open(fpath).convert("RGB")
    W, H = img.size

    # OCR with bounding boxes
    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
    # Build a list of (code_str, x, y, w, h) for any SG NNN tokens.
    # Tesseract may split "SG" and "521" into two tokens — merge adjacent ones.
    n = len(data["text"])
    tokens = []
    for i in range(n):
        t = (data["text"][i] or "").strip()
        if not t:
            continue
        tokens.append({
            "t": t,
            "x": data["left"][i],
            "y": data["top"][i],
            "w": data["width"][i],
            "h": data["height"][i],
            "line": (data["block_num"][i], data["par_num"][i], data["line_num"][i]),
        })

    sg_hits = []
    i = 0
    while i < len(tokens):
        tk = tokens[i]
        # Merge "SG" + "NNN"
        if tk["t"].upper() == "SG" and i + 1 < len(tokens):
            nxt = tokens[i + 1]
            if nxt["line"] == tk["line"] and re.match(r"^\d{2,4}$", nxt["t"]):
                code = f"SG {nxt['t']}"
                x = tk["x"]; y = tk["y"]
                x2 = nxt["x"] + nxt["w"]; y2 = max(tk["y"]+tk["h"], nxt["y"]+nxt["h"])
                sg_hits.append({"code": code, "x": x, "y": y, "x2": x2, "y2": y2})
                i += 2
                continue
        # Single token like "SG521"
        m = re.match(r"^SG(\d{2,4})$", tk["t"], re.I)
        if m:
            sg_hits.append({"code": f"SG {m.group(1)}", "x": tk["x"], "y": tk["y"], "x2": tk["x"]+tk["w"], "y2": tk["y"]+tk["h"]})
        i += 1

    # Dedupe by code (keep first occurrence)
    seen = set()
    deduped = []
    for h in sg_hits:
        if h["code"] in seen:
            continue
        seen.add(h["code"])
        deduped.append(h)
    sg_hits = deduped

    # Now for each product on this page, find the matching SG hit
    page_codes = {p["code"]: p for p in prods}

    # Compute column centers from all hits on this page
    centers = sorted([(h["x"] + h["x2"]) / 2 for h in sg_hits])

    saved_for_page = 0
    for h in sg_hits:
        code = h["code"]
        if code not in page_codes:
            continue
        cx = (h["x"] + h["x2"]) / 2
        ctop = h["y"]

        # Determine half-width: distance to nearest different-column neighbor on SAME page
        x_neighbors = [c for c in centers if abs(c - cx) > 60]
        if x_neighbors:
            nearest = min(x_neighbors, key=lambda c: abs(c - cx))
            half_w = max(80, abs(nearest - cx) / 2 - 8)
        else:
            half_w = W * 0.4

        # Find SG code above this in the same column (x within half_w)
        above_y = 0
        for other in sg_hits:
            if other["code"] == code:
                continue
            ocx = (other["x"] + other["x2"]) / 2
            if abs(ocx - cx) < half_w and other["y2"] < ctop:
                above_y = max(above_y, other["y2"])

        # Bounds for the photo
        photo_left = max(0, int(cx - half_w))
        photo_right = min(W, int(cx + half_w))
        # If we found an SG above, the description of THAT SG goes between above_y and ctop ABOVE description height ~ 75px
        # We want the photo to be BELOW the above's description ends. Approx: above_y + ~ 100 px (description height)
        if above_y > 0:
            photo_top = min(ctop - 30, above_y + 110)
        else:
            photo_top = max(0, ctop - 320)
        photo_bottom = max(photo_top + 50, ctop - 8)

        if photo_bottom - photo_top < 50 or photo_right - photo_left < 50:
            continue

        crop = img.crop((photo_left, photo_top, photo_right, photo_bottom))

        # Trim white margins
        from PIL import ImageChops
        bg = Image.new("RGB", crop.size, (255, 255, 255))
        diff = ImageChops.difference(crop, bg)
        bbox = diff.getbbox()
        if bbox:
            # pad a bit
            cw, ch = crop.size
            x0_ = max(0, bbox[0] - 6); y0_ = max(0, bbox[1] - 6)
            x1_ = min(cw, bbox[2] + 6); y1_ = min(ch, bbox[3] + 6)
            crop = crop.crop((x0_, y0_, x1_, y1_))

        # Pad to square on white background
        cw, ch = crop.size
        side = max(cw, ch)
        canvas = Image.new("RGB", (side, side), (255, 255, 255))
        canvas.paste(crop, ((side - cw) // 2, (side - ch) // 2))
        canvas.thumbnail((720, 720))

        out_path = os.path.join(OUT_DIR, f"{code.replace(' ', '_')}.jpg")
        canvas.save(out_path, "JPEG", quality=88)
        saved_for_page += 1
        total_saved += 1

    # Track products that weren't found via OCR on this page
    found_codes = {h["code"] for h in sg_hits}
    for p in prods:
        if p["code"] not in found_codes:
            total_missing.append((pno, p["code"]))
    print(f"page {pno}: saved {saved_for_page}/{len(prods)} (OCR hits: {len(sg_hits)})")

print(f"\nTotal saved: {total_saved}/{len(products)}")
print(f"Missing via OCR: {len(total_missing)}")
for m in total_missing:
    print("  ", m)
