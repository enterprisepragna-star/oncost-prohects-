import fitz
import os
import subprocess
import json
import re

doc = fitz.open('notebooks-diaries-notepads.pdf')
os.makedirs('assets/catalog', exist_ok=True)

catalog = []

for page_num in range(1, len(doc)): # skip page 0 (cover)
    page = doc[page_num]
    pix = page.get_pixmap(dpi=300)
    img_path = f"assets/catalog/page_{page_num}.png"
    pix.save(img_path)
        
    # Run OCR
    # result = subprocess.run(["./ocr", img_path], capture_output=True, text=True)
    # text = result.stdout.strip()
    
    # code = f"PAGE_{page_num}"
    # name = "Catalog Product"
    # lines = text.split('\n')
    # if lines:
    #     name = lines[0].strip()
        
    # for line in lines:
    #     if 'Code' in line:
    #         parts = line.split(':')
    #         if len(parts) > 1:
    #             code = parts[1].strip()
    #             break
                
    # catalog.append({
    #     "id": f"p_{page_num}",
    #     "code": code,
    #     "name": name,
    #     "desc": text.replace('\n', ' | ')[:150], 
    #     "moq": 50,
    #     "cost": 1000,
    #     "price": 1280,
    #     "image": img_path
    # })
    # print(f"Extracted {code} on page {page_num}")

# with open('catalog.json', 'w') as f:
#     json.dump(catalog, f, indent=2)
# print("Saved 83 items to catalog.json")
