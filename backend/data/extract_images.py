"""Extract embedded product images from each PDF page.
For each page, we list embedded images with their positions, then match products in reading order (top-to-bottom, left-to-right).
"""
import fitz
import os
import json
from PIL import Image
import io

PDF_PATH = "/app/backend/data/sg_catalog.pdf"
IMG_DIR = "/app/backend/data/images"
os.makedirs(IMG_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)

page_images = {}  # page_num -> list of {bbox, xref}

for pno in range(doc.page_count):
    page = doc.load_page(pno)
    # Get image info with positions
    info = page.get_image_info(xrefs=True)
    # Filter: only sizable images (avoid icons/backgrounds)
    images = []
    for im in info:
        bbox = im.get("bbox")
        xref = im.get("xref")
        if not xref or not bbox:
            continue
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        if w < 80 or h < 80:
            continue
        images.append({"bbox": bbox, "xref": xref, "w": w, "h": h})
    # Sort by y (top), then x
    images.sort(key=lambda i: (round(i["bbox"][1] / 30), i["bbox"][0]))
    page_images[pno + 1] = images
    print(f"Page {pno+1}: {len(images)} images")

# Save a debug summary
with open("/app/backend/data/page_images.json", "w") as f:
    json.dump(page_images, f, indent=2, default=str)

# Extract each image
for pno, imgs in page_images.items():
    for idx, im in enumerate(imgs):
        try:
            pix = fitz.Pixmap(doc, im["xref"])
            if pix.colorspace and pix.colorspace.name == "DeviceCMYK":
                pix = fitz.Pixmap(fitz.csRGB, pix)
            elif pix.n - pix.alpha > 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            out_path = os.path.join(IMG_DIR, f"page{pno:02d}_img{idx:02d}.png")
            pix.save(out_path)
            # Compress to JPEG
            jpg_path = out_path.replace(".png", ".jpg")
            img = Image.open(out_path).convert("RGB")
            # Resize if too big
            max_dim = 800
            if max(img.size) > max_dim:
                img.thumbnail((max_dim, max_dim))
            img.save(jpg_path, "JPEG", quality=85)
            os.remove(out_path)
        except Exception as e:
            print(f"Failed page{pno} img{idx}: {e}")

print("Done extracting images.")
