"""Extract products + images from SG catalog PDF.

Outputs:
  - /app/backend/data/products.json  (structured product list)
  - /app/backend/data/images/<product_code>.jpg  (one image per product, largest)
  - /app/backend/data/page_<n>.png  (high-res page render, used for visual review)
"""
import fitz  # PyMuPDF
import json
import os
import re
from PIL import Image
import io

PDF_PATH = "/app/backend/data/sg_catalog.pdf"
OUT_DIR = "/app/backend/data"
IMG_DIR = os.path.join(OUT_DIR, "images")
os.makedirs(IMG_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
print(f"Pages: {doc.page_count}")

# Render each page as PNG (for visual review only)
PAGES_DIR = os.path.join(OUT_DIR, "pages")
os.makedirs(PAGES_DIR, exist_ok=True)

products = []
all_text_dump = []

for pno in range(doc.page_count):
    page = doc.load_page(pno)
    # Render page
    pix = page.get_pixmap(dpi=150)
    pix.save(os.path.join(PAGES_DIR, f"page_{pno+1:02d}.png"))

    text = page.get_text("text")
    all_text_dump.append(f"=== PAGE {pno+1} ===\n{text}\n")

with open(os.path.join(OUT_DIR, "all_text.txt"), "w") as f:
    f.write("\n".join(all_text_dump))

print("Wrote pages and text dump.")
print(f"Total pages rendered: {doc.page_count}")
