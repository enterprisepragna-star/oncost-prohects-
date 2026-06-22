# ONCOST — Catalog & Quotation Platform
## Complete Build Specification & Handoff Document

**Version:** 1.0
**Owner:** ONCOST (Pragna Enterprises)
**Audience:** Internal Dev Team (framework / infrastructure agnostic)
**Purpose:** A single-source spec that captures **what the app does, why it exists, the data it stores, every API/UI surface, and the business rules** — so the team can rebuild the same product on any stack (Django/Flask/Node/Laravel/.NET, MySQL/Postgres/Mongo, AWS/GCP/Azure/Vercel/Render, etc.) without referring to the existing codebase.

---

## 1. Product Summary (Why this app exists)

ONCOST resells corporate / customized gifting products sourced from one or more **vendor catalogs** (e.g., "SG Price List PDF"). The business:

1. Takes a **supplier price list (PDF)** with item code, image, description, MOQ, supplier price.
2. Applies a **markup rule** to compute the **ONCOST selling price**:
   - If supplier price `< ₹1000` → add **₹50**
   - If supplier price `≥ ₹1000` → add **₹100**
   - (Both thresholds and increments must be configurable by an admin.)
3. Lets sales/admin staff:
   - Curate products (hide/show, edit price/description/MOQ, replace images).
   - Build **quotations** for customers with quantities, shipping, GST, subject, valid-until, payment terms.
   - Generate a **professional PDF quotation** with company letterhead.
   - Share quotations via a **public link (HTML view + PDF download)** — customers see only the ONCOST price, never the supplier cost.
   - **Accept a quotation → convert it to a Sale**, optionally with a different "approved budget" than the quoted total, and capture a note.
   - **Import additional supplier PDFs** to add new vendor catalogs over time.

> **Key business invariant:** The supplier/SG price is *never* exposed publicly. Only logged-in admin users can see it. Public catalog and shared quotation views display **only the ONCOST price**.

---

## 2. Personas & Roles

| Role | Who | Capabilities |
|---|---|---|
| **Admin** | Internal ONCOST staff (single role, multi-user allowed) | Full CRUD on products, pricing rule, vendors, quotations, sales, image uploads, PDF import. |
| **Customer (public, no login)** | Recipient of a quotation link | Read-only view of public catalog (selling prices) and a specific quotation via a shared token URL. |

Authentication is required **only** for admin endpoints. Public endpoints are unauthenticated but only expose non-sensitive fields.

---

## 3. Core Business Rules (must be enforced server-side)

1. **Pricing rule** is a single document (singleton) with four fields:
   - `threshold` (default 1000)
   - `below_increment` (default 50) — added when `sg_price < threshold`
   - `at_or_above_increment` (default 100) — added when `sg_price >= threshold`
   - `rounding` (default 1, i.e., no rounding) — round nearest ₹N (optional future use)
2. **`oncost_price` is computed**, never stored, EXCEPT when an admin manually sets an `override_price` on a product (then override wins).
3. **Public APIs MUST strip** `sg_price` and `override_price` before returning products / quotations.
4. **Quotation items are snapshots** — store unit price, description, image filename, MOQ at the moment the quote was created. Later product edits must not retroactively change historical quotes.
5. **Quotation totals**:
   - `subtotal = Σ(unit_price × quantity)`
   - `gst_amount = round((subtotal + shipping) × gst_percent / 100, 2)`
   - `total = subtotal + shipping + gst_amount`
6. **Quotation ID format**: `ONC-YYYYMM-####` (4-digit zero-padded monotonic sequence). Use a separate counter collection/table.
7. **Share token**: A random URL-safe string (≥10 bytes of entropy). Required to view a quotation publicly. Inactive quotations must 404.
8. **Accept-to-Sale**:
   - Acceptance requires a non-empty `note`.
   - Optional `approved_budget` (float). If less than `total`, surface as an "amended" sale.
   - On accept: mark quotation `status="accepted"`, `active=false`, and insert into `sales` collection.
9. **Image uploads**:
   - Accept JPG/PNG/WEBP up to 8 MB.
   - Auto-orient via EXIF, convert to RGB JPEG, fit to max 720×720 square (white padding), quality ~88.
   - Filename pattern: `<code-with-underscores>_<8hexchars>.jpg`.
10. **Image storage must be persistent** across redeploys. Local container disk is ephemeral on most PaaS environments — use S3 / Cloud Storage / equivalent object store. Always keep a local fallback for dev.
11. **PDF generation must render the ₹ (Rupee) glyph correctly** — bundle DejaVu Sans (or any Unicode-capable font) instead of relying on default Helvetica.

---

## 4. Data Model

> Use any DB you like. Field names below are the canonical contract. The reference impl uses MongoDB.

### 4.1 `users`
| Field | Type | Notes |
|---|---|---|
| id | string (PK) | |
| email | string (unique, lowercase) | |
| password_hash | string | bcrypt |
| name | string | |
| role | string | `"admin"` (only role today) |
| created_at | ISO datetime | UTC |

Seeded on startup from env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### 4.2 `pricing_rule` (singleton)
| Field | Type | Default |
|---|---|---|
| threshold | int | 1000 |
| below_increment | int | 50 |
| at_or_above_increment | int | 100 |
| rounding | int | 1 |

### 4.3 `vendors`
| Field | Type | Notes |
|---|---|---|
| id | string (PK) | |
| name | string (unique) | e.g., "SG" |
| code_prefix | string | e.g., "OC" — used to rewrite vendor codes on import |
| created_at | ISO datetime | |

### 4.4 `products`
| Field | Type | Notes |
|---|---|---|
| id | string (PK) | |
| code | string (unique) | e.g., `SG 547` |
| set_type | string | e.g., `5in1`, `Single` |
| items | string | Free-text description of what's in the set |
| sg_price | int | Supplier price in ₹ (whole rupees) — **private** |
| moq | int | Minimum Order Quantity, default 50 |
| image | string \| null | filename, served by `/api/images/{filename}` |
| override_price | int \| null | When set, this is the ONCOST price (skips rule) — **private** |
| visible | bool | Default `true`; admin can hide from public |
| vendor_id | string \| null | FK to `vendors` |
| vendor_code | string \| null | Original code from supplier (kept for traceability) |
| created_at | ISO datetime | |

> Derived (not stored): `oncost_price` = `override_price` if present, else `compute(sg_price, pricing_rule)`.

### 4.5 `quotations`
| Field | Type | Notes |
|---|---|---|
| id | string (PK) | internal |
| quotation_id | string (unique) | `ONC-YYYYMM-####` |
| customer_name | string | required |
| customer_email | string | optional |
| customer_phone | string | optional |
| customer_company | string | optional |
| place | string | e.g., "Bengaluru" |
| subject | string | default "Quotation for Corporate Gifting Requirements" |
| notes | string | free-form |
| delivery_timeline | string | default from env |
| payment_terms | string | default from env |
| inclusions | string | `;`-separated bullets |
| items | array of QuotationItem (see below) | snapshot |
| subtotal | number | computed |
| shipping_charges | number | input |
| gst_percent | number | input |
| gst_amount | number | computed |
| total | number | computed grand total |
| valid_until | string (ISO date) \| null | |
| share_token | string (unique) | URL-safe random |
| active | bool | toggle visibility of share link |
| status | string | `"draft"` \| `"accepted"` |
| accepted_at | ISO datetime \| null | |
| acceptance_note | string | required when accepted |
| approved_budget | number \| null | optional, may differ from `total` |
| created_at | ISO datetime | |

**QuotationItem (embedded):**
```
{ product_id, code, set_type, items, image, moq, unit_price, quantity, line_total }
```

### 4.6 `sales`
Created when a quotation is accepted. Mirrors the quotation fields plus:
| Field | Type | Notes |
|---|---|---|
| quotation_id | string | the human ID |
| quotation_ref | string | FK to quotation |
| accepted_at | ISO datetime | |
| accepted_by | string | user email |
| note | string | required |
| approved_budget | number \| null | |

### 4.7 `counters` (for ID generation)
`{ _id: "quotation", seq: <int> }` — atomic increment.

### 4.8 Indexes
- `users.email` unique
- `products.code` unique
- `quotations.share_token` unique
- `vendors.name` unique

---

## 5. API Contract

> All admin endpoints require auth. Auth = JWT in an `HttpOnly`, `Secure`, `SameSite=None` cookie (`access_token`) **or** `Authorization: Bearer <jwt>` header. JWT payload: `{ sub, email, exp, type:"access" }`, 7-day lifetime.

> **All routes MUST be prefixed with `/api/`** (required for the current ingress; keep this convention for parity).

### 5.1 Auth
| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/login` | no | `{email, password}` | `{user, access_token}` + sets cookie |
| POST | `/api/auth/logout` | yes | — | `{ok:true}` (clears cookie) |
| GET  | `/api/auth/me` | yes | — | current user |

### 5.2 Pricing Rule
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET  | `/api/pricing-rule` | yes | full rule |
| PUT  | `/api/pricing-rule` | yes | upsert rule |
| GET  | `/api/public/pricing-rule` | no | for transparency on the public site |

### 5.3 Products
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET  | `/api/products` | yes | All products (admin view, includes `sg_price`, `override_price`) |
| GET  | `/api/public/products` | no | `visible: true` only, strips `sg_price`/`override_price` |
| POST | `/api/products` | yes | create |
| PUT  | `/api/products/{id}` | yes | partial update; passing `override_price: null` clears the override |
| DELETE | `/api/products/{id}` | yes | delete |
| POST | `/api/products/{id}/image` | yes | multipart upload (`file`); processes & stores image; returns `{image: filename}` |

### 5.4 Quotations
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/quotations` | yes | create with items + customer + shipping/gst |
| GET  | `/api/quotations` | yes | list (newest first) |
| GET  | `/api/quotations/{id}` | yes | detail (internal id) |
| PATCH| `/api/quotations/{id}/toggle` | yes | flip `active` |
| DELETE | `/api/quotations/{id}` | yes | delete |
| GET  | `/api/quotations/{id}/pdf` | yes | streams PDF |
| POST | `/api/quotations/{id}/accept` | yes | `{note, approved_budget?}` → creates a Sale |
| GET  | `/api/share/{token}` | no | public JSON view of a quotation |
| GET  | `/api/share/{token}/pdf` | no | public PDF download |

### 5.5 Vendors
| Method | Path | Auth |
|---|---|---|
| GET  | `/api/vendors` | yes |
| POST | `/api/vendors` | yes |
| DELETE | `/api/vendors/{id}` | yes (unsets `vendor_id` on its products, does not delete products) |

### 5.6 Sales
| Method | Path | Auth |
|---|---|---|
| GET  | `/api/sales` | yes |
| GET  | `/api/sales/{id}` | yes |

### 5.7 Images
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET  | `/api/images/{filename}` | no | streams image. Implementation: try object storage first → fallback to local disk. Set `Cache-Control: public, max-age=86400`. |

### 5.8 PDF Import (Vendor Catalog Ingestion)
Two-step "extract then commit" flow so the admin can review before saving.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/import/pdf/extract` | yes | multipart `file`; returns `{count, products: [{code,set_type,items,sg_price,moq,page,image}]}`. Images are extracted, padded square, saved with random filenames. |
| POST | `/api/import/pdf/commit` | yes | `{vendor_id, code_prefix, use_custom_rule, threshold, below_increment, at_or_above_increment, products:[...]}`; inserts new products under that vendor; **skips duplicates by `code`**. If `use_custom_rule`, an `override_price` is computed and stored. |

---

## 6. Extraction Rules (Vendor PDF → Product list)

The supplier PDFs are visually-formatted brochures, not structured data. Use a PDF parser (PyMuPDF / pdfplumber / pdf.js equivalents in your stack) and these heuristics:

- **Item code regex:** `\b([A-Z]{1,4}[ \-]?\d{2,5})\b` (e.g., `SG 547`, `OC-123`).
- **Price regex:** `(?:Rs[.,]?|₹)\s*([0-9]{2,6})`.
- **MOQ regex:** `MOQ[, :]*([0-9]+)`.
- **Set type regex:** `(\d+\s*in\s*1)`.
- Split page text into segments at each detected code; everything until the next code/MOQ/price line is the description.
- **Image matching:** list all embedded images on the page, filter to those `>100×100`, sort top-to-bottom then left-to-right (snap rows by `round(y/30)`), zip with detected products in reading order. Inset crops slightly (3% sides, 14% bottom) to avoid baked-in price banners.

> ⚠️ **Known limitation:** When the supplier bakes prices/text into the product images themselves, automated cropping is unreliable. Provide a **manual image replacement UI** for admins (already in the reference app's Products page).

---

## 7. PDF Quotation Layout (must replicate)

Use any PDF library that supports custom Unicode fonts (ReportLab, WeasyPrint, Puppeteer→PDF, wkhtmltopdf, iText, etc.).

**Page size:** A4, margins ~12–14 mm.
**Fonts:** DejaVu Sans (or any font containing ₹ U+20B9). Fallback Helvetica.
**Brand colors:**
- Navy `#0F172A`
- Gold accent `#B8860B`
- Ink `#09090B`, Muted `#52525B`, Line `#D4D4D8`

**Structure (top to bottom):**
1. **Letterhead** — Left: large "ONCOST" wordmark + tagline. Right: legal name (`PRAGNA ENTERPRISES`), address, phone, email, website, GSTIN.
2. Gold horizontal rule.
3. **Title bar:** "CORPORATE GIFTING QUOTATION" (centered, navy, bold).
4. **Meta strip** (4 cells, gray bg): Quotation No · Date · Valid Until · Place.
5. **"To,"** block — customer name, company, phone · email, place.
6. **Subject** line + 1-line greeting paragraph.
7. **"PRODUCT DETAILS"** section header.
8. **Items table** (navy header row, white text) columns:
   `S.NO | IMAGE (13mm thumbnail) | CODE | DESCRIPTION (set_type bold + items muted) | MOQ | QTY | UNIT (₹) | AMOUNT (₹)`.
9. **Totals block** (right-aligned): Subtotal, Shipping, `GST (x%)`, then a **GRAND TOTAL** row on a navy filled band.
10. **Three-column info box**: INCLUSIONS (checkmark bullets) · DELIVERY TIMELINE · PAYMENT TERMS.
11. Optional **ADDITIONAL NOTES** section.
12. **Closing block**: Thank-you paragraph, "Warm Regards", legal name, signatory line ("Corporate Gifting Division", "Authorized Signatory"). Right column: Bank/Payment.
13. Gold accent footer line + small footer string (`website · WhatsApp phone · GSTIN · quotation id`).

> The reference implementation function `_build_pdf(q)` in `server.py` lines 549–846 is the canonical source.

**Filename of download:** `ONCOST-<quotation_id>.pdf`.

---

## 8. Frontend Surface (pages & flows)

> Use any UI framework (React/Vue/Svelte/Next/Nuxt). Below is the minimum page list with behavior.

### 8.1 Public (no login)
- `/` → marketing/homepage (optional) or redirect to `/catalog`.
- `/catalog` — grid of products (image, code, set_type, items, MOQ, **ONCOST price**, "Request Quote" link/CTA). Sort by price asc/desc. Search by code/items.
- `/q/{share_token}` — Public quotation view: letterhead, items table, totals, "Download PDF" button (calls `/api/share/{token}/pdf`). If the token is invalid or quotation `active=false`, show "Quotation not available".

### 8.2 Admin (login required)
- `/login` — email + password form. On success, redirect to `/admin/products`.
- `/admin/products` — table/grid with all products. Columns: image, code, set_type, items, MOQ, SG price, ONCOST price (derived), Visible toggle, Actions (Edit, Upload Image, Delete). Filters: search, sort by price, vendor. Bulk actions are nice-to-have.
- `/admin/pricing-rule` — form for `threshold / below_increment / at_or_above_increment`. Live preview of price changes.
- `/admin/quotations` — list of quotations (qid, customer, total, status, created_at). Actions: Open, Share (copy link), Toggle Active, Download PDF, Accept.
- `/admin/quotations/new` — wizard:
  1. Customer details (name, company, email, phone, place).
  2. Subject, valid-until, shipping, GST%.
  3. Add items from catalog (search → add → set quantity).
  4. Delivery timeline / payment terms / inclusions (prefilled defaults, editable).
  5. Review totals → Save.
- `/admin/quotations/{id}` — detail view with Edit, Share link, Accept (with note + optional approved budget), Download PDF.
- `/admin/sales` — list of accepted sales with note, approved_budget vs total comparison.
- `/admin/vendors` — list/create/delete vendors.
- `/admin/import-pdf` — modal/page that:
  1. Uploads supplier PDF → calls `/api/import/pdf/extract`.
  2. Shows editable table of detected products (code, description, sg_price, moq, image preview, vendor prefix).
  3. Lets admin pick vendor, prefix, and an optional override pricing rule.
  4. On "Commit" → calls `/api/import/pdf/commit`.

### 8.3 Visual / UX guidelines
- Brand wordmark: **ONCOST** (navy `#0F172A`).
- Accent: gold `#B8860B`.
- Card grid w/ rounded 12–16px corners, soft shadow, generous whitespace.
- Mobile-first; minimum tap target 44px.
- Toaster for action confirmations.
- All interactive elements should have stable identifiers for QA automation.

---

## 9. Environment & Configuration

Use environment variables for everything. No hard-coded credentials. Example `.env` keys:

### Backend
```
MONGO_URL=...              # or DATABASE_URL for SQL
DB_NAME=oncost
JWT_SECRET=<random 32+ bytes>
ADMIN_EMAIL=admin@oncost.shop
ADMIN_PASSWORD=<set on first deploy, rotate later>
CORS_ORIGINS=https://oncost.shop,https://www.oncost.shop

# Company letterhead (used in PDF)
COMPANY_LEGAL_NAME=PRAGNA ENTERPRISES
COMPANY_TRADE_NAME=ONCOST
COMPANY_TAGLINE=Premium Corporate & Customized Gifting Solutions
COMPANY_ADDRESS=Bengaluru, Karnataka, India
COMPANY_PHONE=+91 ...
COMPANY_EMAIL=hello@oncost.shop
COMPANY_WEBSITE=www.oncost.shop
COMPANY_GSTIN=...
COMPANY_BANK_DETAILS=Available on order confirmation
COMPANY_AUTHORIZED_SIGNATORY=Corporate Gifting Division
DEFAULT_DELIVERY=7-10 business days from order confirmation
DEFAULT_PAYMENT_TERMS=50% advance on confirmation, 50% before dispatch. Bank Transfer / UPI / Online.
DEFAULT_INCLUSIONS=Premium packaging; Logo branding (where applicable); Quality assurance; Secure dispatch

# Object storage (S3-compatible recommended)
OBJECT_STORAGE_BUCKET=oncost-images
OBJECT_STORAGE_REGION=ap-south-1
OBJECT_STORAGE_ACCESS_KEY=...
OBJECT_STORAGE_SECRET=...
OBJECT_STORAGE_ENDPOINT=...    # for non-AWS providers
```

### Frontend
```
REACT_APP_BACKEND_URL=https://api.oncost.shop   # or VITE_API_URL, NEXT_PUBLIC_API_URL, etc.
```

---

## 10. Infrastructure / Deployment Options

The reference impl runs as FastAPI + React + MongoDB on a managed Kubernetes container with a single ingress (`/api` → backend, everything else → frontend). The team is free to choose any stack — recommended modern options:

### Option A — Serverless / Managed (lowest ops)
- **Backend:** Vercel/Railway/Render/Fly.io (Node.js/Express, Django/DRF, or NestJS).
- **DB:** MongoDB Atlas / Supabase (Postgres) / PlanetScale (MySQL).
- **Images:** AWS S3 / Cloudflare R2 / Supabase Storage / Vercel Blob.
- **Frontend:** Vercel (Next.js) or Netlify (React/Vite). CDN included.
- **DNS:** Cloudflare (turn off "proxied" if WebSockets aren't needed; or proxy for DDoS).
- **Email (optional):** Resend / SendGrid for quotation send-via-email.

### Option B — Classic VPS / Docker Compose
- **Backend:** Node/Python container behind Nginx.
- **DB:** Postgres or MongoDB container with a managed volume.
- **Images:** S3 / Backblaze B2.
- **TLS:** Caddy / Nginx + Let's Encrypt.

### Option C — AWS native
- **Backend:** ECS Fargate or AWS Lambda + API Gateway.
- **DB:** DocumentDB / DynamoDB / RDS Postgres.
- **Images:** S3 + CloudFront.
- **Frontend:** S3 + CloudFront, or Amplify.

### Hard requirements regardless of stack
- HTTPS everywhere.
- Persistent **object storage** for product images (do NOT depend on container disk).
- **Backups**: nightly DB dump + lifecycle rules on S3.
- **/api** prefix on backend routes (matches existing frontend code).
- Cookies for JWT must be `Secure; HttpOnly; SameSite=None` when frontend & backend are on different domains.

---

## 11. Security Checklist

- [ ] Bcrypt for password hashing (cost ≥ 12).
- [ ] JWT signed with HS256 (≥ 32-byte secret) **or** RS256 with rotating keys.
- [ ] Rate-limit `/api/auth/login` (e.g., 10/min per IP).
- [ ] Strict CORS allowlist (no `*` in production).
- [ ] Validate & re-encode all uploaded images (Pillow / sharp / ImageMagick) to strip EXIF and prevent SVG/HTML smuggling.
- [ ] Public endpoints **must** strip `sg_price`, `override_price`, and any internal fields.
- [ ] Share token must be ≥ 80 bits of entropy (`secrets.token_urlsafe(10)` or longer).
- [ ] HTTP security headers: HSTS, CSP, X-Content-Type-Options, Referrer-Policy.
- [ ] Audit log (optional but recommended) for: login, product edits, quotation accept, deletes.

---

## 12. Acceptance / Test Scenarios (must pass)

1. **Pricing math:** Set rule `(1000, +50, +100)`. Add product `sg_price=999` → public shows `1049`. Edit to `sg_price=1000` → shows `1100`. Set `override_price=1234` → shows `1234`.
2. **Public price hiding:** As an unauthenticated user, fetch `/api/public/products` — no field should contain the supplier price.
3. **Quotation flow:** Create a quote with 3 items, shipping ₹500, GST 18%. Verify `subtotal`, `gst_amount`, and `total` math precisely. Share link opens public view. PDF downloads with ₹ symbol rendering correctly.
4. **Accept flow:** Accept a quotation with `approved_budget < total` and a note. A `sales` row appears; the quotation becomes `status="accepted"` and `active=false`. Acceptance without a note must 400.
5. **Image persistence:** Upload an image, redeploy the backend (simulating ephemeral disk wipe), reload the catalog — image MUST still load (object storage path).
6. **PDF import:** Upload a supplier PDF → extract preview lists products with code, price, MOQ, image previews; commit under a vendor with prefix `OC` → existing-code products are skipped, new ones inserted with rewritten codes.
7. **Auth:** Wrong password → 401. Expired token → 401 with `"Token expired"`. Logout clears the cookie.
8. **Toggle visibility:** Hide a product → it disappears from `/api/public/products` but stays in `/api/products`.

---

## 13. Edge Cases & Gotchas We Already Hit

1. **₹ symbol missing in PDF** — Default ReportLab/Helvetica fonts don't have U+20B9. Bundle DejaVu (or use WeasyPrint with system fonts).
2. **Ephemeral container disk** — Images uploaded locally vanish on redeploy. Always use S3-style object storage; keep `disk` as fallback only.
3. **Baked-in text in supplier images** — Auto-crop captures price banners. Provide a manual image upload UI; do not rely solely on auto-extraction for image cleanliness.
4. **PDF parser ordering** — `get_image_info` order ≠ visual order. Sort by `(round(y/30), x)` to match reading order on multi-row layouts.
5. **`override_price = null` semantics** — A PATCH that explicitly sends `null` must *clear* the override, not be ignored. Don't blanket-skip nulls in update logic.
6. **Cookie `SameSite=None` requires `Secure=true`** — set both, otherwise the browser silently drops the cookie when frontend and API are on different domains.
7. **Quotation ID race conditions** — Use an atomic counter (Mongo `findOneAndUpdate $inc` / SQL `SELECT … FOR UPDATE` / Redis INCR). Don't `count + 1`.
8. **Duplicate product codes on import** — Always check `products.code` uniqueness; skip + report.
9. **Cloudflare 1001 on custom domain** — Almost always a stale CNAME at the DNS registrar pointing to a deleted host. Not a code bug.

---

## 14. Future / Backlog (not yet built)

- **Amended Quotation alert** — when accepted with `approved_budget < total`, auto-generate an "amended" PDF/email to the customer for sign-off.
- **Email-send-on-share** (Resend/SendGrid integration) — Send quotation link + PDF to `customer_email` directly from the UI.
- **WhatsApp share** with prefilled message (deep link `https://wa.me/...?text=`).
- **Multi-vendor pricing rules** — Per-vendor override of the global threshold/increments.
- **Bulk image upload** — Drag a folder of images named `<code>.jpg`; auto-match to products.
- **Audit log + role expansion** — `viewer`, `editor`, `admin`.
- **Currency / multi-region** — Today everything is INR; abstract currency code on products + quotations.
- **Inventory & stock** — Today catalog has no stock count; if needed, add `stock`, `reserved`, `available` and decrement on sale acceptance.
- **Customer portal** — Customers log in to see all their past quotations and sales.

---

## 15. Reference File Map (current implementation, FYI only)

```
/app/
├── backend/
│   ├── server.py           ← all routes, models, PDF builder, startup seed
│   ├── storage.py          ← object-storage put/get wrappers (replaceable with S3)
│   ├── data/
│   │   ├── products.json   ← initial seed (92 products)
│   │   └── product_images/ ← local image fallback
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── lib/
│   │   │   ├── api.js      ← fetch wrappers
│   │   │   └── auth.jsx    ← React auth context
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── ImportPdfModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── PublicCatalogPage.jsx
│   │       ├── PublicQuotationPage.jsx
│   │       └── admin/
│   │           ├── ProductsPage.jsx
│   │           ├── PricingRulePage.jsx
│   │           ├── NewQuotationPage.jsx
│   │           ├── QuotationsListPage.jsx
│   │           ├── QuotationDetailPage.jsx
│   │           └── SalesPage.jsx
│   ├── package.json
│   └── .env (REACT_APP_BACKEND_URL)
└── memory/
    ├── PRD.md
    ├── test_credentials.md  ← admin@oncost.shop / oncost@2026
    └── PROJECT_BLUEPRINT.md ← this file
```

---

## 16. Glossary

- **SG Price** — Supplier price from the source vendor (private).
- **ONCOST Price** — Public selling price (SG + markup or override).
- **MOQ** — Minimum Order Quantity.
- **Quotation** — Draft proposal to a customer. Has a public share link + PDF.
- **Sale** — An accepted quotation, with optional approved budget that may differ from the quote total.
- **Pricing Rule** — Single record controlling markup math.
- **Vendor** — Source supplier; products may be tagged with a vendor for traceability.
- **Share Token** — Random opaque string in the public quotation URL.

---

## 17. Open Questions for the New Dev Team

1. **Stack of choice?** (Node/TS + Postgres + Next.js? Or stick with Python/Mongo?)
2. **Hosting / domain plan** — Stay on Cloudflare DNS or move to Route53?
3. **Email provider** — Resend, SendGrid, AWS SES?
4. **Image storage** — AWS S3, Cloudflare R2, or stay with current provider?
5. **Multi-user admin** — Do we need roles or is a single admin login enough for v1?
6. **Customer-facing checkout?** — Today only quotation; do we want self-serve order placement?
7. **GST invoice generation** post-acceptance — required compliance feature in India.
8. **Data migration** — Need to export current Mongo data (products, quotations, sales) for import into new DB? (Reference impl can dump JSON on request.)

---

*End of document. Treat this as the contract; everything else is implementation detail.*
