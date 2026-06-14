# 🚀 Phase 1 Setup — Foundation (5 minutes)

This phase adds: Supabase Storage image upload, product shipping/GST fields, enhanced order detail view, status workflow, and the complaint cell.

---

## Step 1 · Run the SQL migration

Open **Supabase → SQL Editor → New query → paste contents of `migration_phase1.sql` → Run**.

It will:
- Add `weight_grams`, `length_cm`, `breadth_cm`, `height_cm`, `hsn_code`, `gst_percent` to `products`
- Add `awb_number`, `tracking_url`, `status_history`, `confirmed_at/packed_at/shipped_at/delivered_at`, `internal_notes` to `orders`
- Create `complaints` table with auto-numbered tickets (CMP-2026-001000)
- Create `product-images` **Supabase Storage bucket** (public, free up to 1GB)
- Set RLS policies for all of the above

> If you see "already exists" warnings, that's normal — the migration is idempotent.

---

## Step 2 · Test image upload

1. Go to **Admin → Products → Edit any product → Media tab**
2. Drag a JPG/PNG into the dropzone (or click and pick a file)
3. It should upload directly to your Supabase Storage in ~2 seconds
4. The image URL will look like `https://YOUR-PROJECT.supabase.co/storage/v1/object/public/product-images/...`

No imgbb key needed. (You can still configure imgbb as a fallback in Site Settings if you prefer, but it's not required.)

---

## Step 3 · Fill in product shipping details

For each product you sell:
1. **Edit Product → "Shipping & Tax" tab**
2. Fill in:
   - **Weight (grams)** ← required for shipping calculation in Phase 2
   - **Length, Breadth, Height (cm)** ← used for volumetric pricing
   - **HSN Code** ← required on GST invoices (lookup at services.gst.gov.in)
   - **GST %** ← 0 / 5 / 12 / 18 / 28

You can also bulk-import via CSV — these new columns are supported:
- `WEIGHT_G` (or `WEIGHT`)
- `LENGTH`, `BREADTH`, `HEIGHT`
- `HSN` (or `HSN CODE`)
- `GST` (or `GST %`)

---

## Step 4 · Try the new Order Detail view

Click any order in **Admin → Orders → 👁 (eye) icon**. You'll now see:
- **Status timeline** at the top (Pending → Confirmed → Packed → Shipped → Delivered) with dates
- **Action buttons** for the next step ("Mark as Packed", "Mark as Shipped" etc.)
- **Customer card** with name/email/phone
- **Payment card** with order ID, tracking ID, invoice number
- **Ship-to address** card
- **Logistics card** — courier partner, AWB (populated in Phase 2), total weight
- **Items table** with product image, SKU, HSN, qty, prices
- **Status history** log (every status change is timestamped + author-tagged)
- **Internal notes** field for admin-only annotations

---

## Step 5 · Test the customer complaint flow

1. Open `https://www.oncost.shop/support.html` (or click "File a Complaint" in the site footer)
2. Fill in the form (name, email, category, subject, description, photos)
3. Submit → you'll get a ticket number like `CMP-2026-001000`
4. In Admin → **Complaints** (new sidebar item with red badge for open tickets) → click the eye icon to view, respond, set priority/status, save resolution

**Categories**: Damaged / Wrong Item / Missing Item / Not Delivered / Quality / Refund / Payment / Other.

**Statuses**: Open → In Progress → Resolved → Closed.

**Priority**: Low / Normal / High / Urgent (urgent shows in red).

---

## What's queued for Phase 2 (when you give me the Delhivery API token)

- Dynamic shipping cost calculation based on weight + dimensions + pincode (server endpoint)
- Auto AWB generation on payment success (Delhivery API call)
- Shipping label PDF download for delivery boys
- Tracking URL automatically populated per order
- "Schedule Pickup" button

## What's queued for Phase 3 (when you sign up at resend.com)

- PDF tax invoice generation (auto on payment success)
- Email order confirmation (with invoice PDF attached)
- Status emails: Packed / Shipped / Out for Delivery / Delivered
- Testimonial reminder email 2 days after delivery (Vercel cron)

---

## 🆘 If something breaks

| Symptom | Likely cause | Fix |
|---|---|---|
| Image upload says "Run migration_phase1.sql" | Bucket doesn't exist yet | Run the migration |
| "Storage permission denied" | Not logged in as admin | Re-login to admin console |
| Product save fails with `weight_grams` error | Migration not yet run | Run the migration |
| Status workflow says "Run migration" | Same | Run the migration |
| Complaints tab is empty + button missing | Migration not yet run | Run the migration |
| Image uploads but shows `403 Forbidden` when displayed | Bucket not set to public | Re-run migration (UPSERT will fix it) |

Anything else? Paste the exact error and I'll fix it on the spot.
