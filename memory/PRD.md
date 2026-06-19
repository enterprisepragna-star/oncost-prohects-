# ONCOST Catalog & Quotation App — PRD

## Problem statement (verbatim from user)
> "I have a business catalog PDF, I want the price of each item to be incremented by 50 if the price is below 1000 rs, above 1000 rs it has to be incremented by 100. Can you edit the PDF and share me the updated pdf to download and send to a customer. I have each image to use as a similar digital catalogue. I am fine if not pdf, a .html view is also ok with updated values of price. Should be able to share the quotation as part of ONCOST, and they should see my updated prices, not the list I used."

User clarifications:
1. Prices not static — need control to update
2. Both PDF and HTML output
3. Shareable HTML link under admin control
4. SG is wholesaler, ONCOST is reseller brand
5. Fields: customer name, order/quotation ID, place of order, MOQ

## Personas
- **Admin (ONCOST owner)** — manages catalog, sets margins, creates customer quotations
- **Customer (corporate buyer)** — receives shareable link, views quotation, downloads PDF

## Core requirements
- Admin authentication (JWT)
- Product catalog seeded from SG PDF (92 products with images)
- Configurable pricing rules (threshold + below/above increments)
- Per-item price override
- Visibility toggle per product
- Quotation creation with line items, MOQ awareness
- Shareable public link per quotation (toggle active/inactive)
- Public quotation page (web view, print-friendly)
- Public catalog page
- PDF generation for quotations (downloadable from admin or public link)
- All customer-facing pages use ONCOST branding (no SG reference, no SG cost exposed)

## Implemented (Feb 2026)
- ✅ Backend FastAPI with MongoDB, bcrypt + JWT auth, admin seed
- ✅ Products extracted from PDF (92 items + product photos)
- ✅ Pricing rule engine (configurable)
- ✅ Products CRUD (admin) with override, visibility
- ✅ Quotation create/list/detail/toggle/delete + auto ID (ONC-YYYYMM-NNNN)
- ✅ Public share endpoints (HTML + PDF via /share/{token}/...)
- ✅ Public catalog browse
- ✅ React frontend: Login, Admin dashboard (Products, Pricing Rules, Quotations, New Quotation, Detail), Public Catalog, Public Quotation viewer
- ✅ Print-friendly public quotation view
- ✅ Swiss high-contrast design (Outfit + IBM Plex Sans, International Klein Blue)

## Backlog (P1)
- Email/WhatsApp share button on quotation detail
- Bulk price update tool
- Customer-side acceptance/comment

## Backlog (P2)
- Customer database / repeat-customer dropdown
- Tax / GST calculation toggle
- Logo upload (replace ONCOST text mark)
- Multi-currency

## Auth credentials
- Admin: admin@oncost.shop / oncost@2026
