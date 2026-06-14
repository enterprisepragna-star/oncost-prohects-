# Phase 3 — PDF Invoicing + Testimonial Cron (Setup)

## 1. Run the SQL migration
Open Supabase → SQL Editor → paste & run **`/app/migration_phase3_invoice_reviews.sql`**. It is idempotent — safe to re-run.

What it does:
- Adds `orders.review_request_sent_at` (timestamptz)
- Adds `orders.delivered_at` (timestamptz) if missing + trigger to auto-stamp it when `status → Delivered`
- Adds composite index for the daily cron query
- Backfills `delivered_at` for already-delivered orders so the cron picks them up

## 2. Vercel environment variables
All Phase-3 env vars (set in Vercel → Project → Settings → Environment Variables):

| Key | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | Yes | Already provisioned (`re_fz6y...ahi9`) |
| `RESEND_FROM_EMAIL` | Yes | Must be a verified sender. Example: `invoice@oncost.shop`. Defaults to `onboarding@resend.dev` if missing (test-only). |
| `RESEND_REPLY_TO` | No | e.g. `support@oncost.shop` |
| `ADMIN_EMAIL` | No | Defaults to `enterprisepragna@gmail.com` |
| `CRON_SECRET` | Optional | Adds Bearer-token check on cron endpoints. Vercel already auto-stamps its cron UA. |
| `REVIEW_REQUEST_DELAY_DAYS` | No | Defaults to `2`. Set to `7` if you want to wait a week. |

## 3. Resend domain verification
For invoices to actually deliver (not land in spam), verify the `oncost.shop` domain in Resend:
1. Resend dashboard → Domains → Add `oncost.shop`
2. Add the 3 DNS records (SPF, DKIM, DMARC) shown to your DNS host
3. Wait for "Verified" → set `RESEND_FROM_EMAIL=invoice@oncost.shop`

Until verified, Resend will send from `onboarding@resend.dev` (works but lower deliverability and the test sandbox restricts to your verified address).

## 4. What now happens automatically

```
CCAvenue payment SUCCESS
   ↓
ccavenue/response.js  →  UPSERT order row (status=Paid)
   ↓
   ├── Delhivery: auto-create AWB shipment
   ├── Resend  : send PDF GST invoice (type=order_invoice)
   └── AiSensy : send WhatsApp confirmation
```

```
Vercel cron daily 04:30 UTC (≈ 10:00 IST)
   ↓
GET /api/reviews/request?cron=1
   ↓
   - find Delivered orders where (delivered_at <= now - 2d) AND review_request_sent_at IS NULL
   - generate review_token if missing
   - email + WhatsApp the customer
   - stamp review_request_sent_at  → never resent
```

## 5. Smoke tests after deploy

### a) PDF invoice
Either:
- Pay a 1-rupee test order through CCAvenue → check inbox for "Your ONCOST Invoice · INV-..." with attachment.
- OR manually trigger:
  ```bash
  curl -X POST https://oncost.shop/api/email/send \
    -H 'Content-Type: application/json' \
    -H "x-admin-key: $ADMIN_RECOVERY_KEY" \
    -d '{"type":"order_invoice","to":"yourself@example.com","order_id":"<UUID of a paid order>","data":{"name":"You"}}'
  ```

### b) Cron dry-run (without waiting for 04:30 UTC)
```bash
curl "https://oncost.shop/api/reviews/request?cron=1&secret=$CRON_SECRET"
# → { ok: true, processed: N, results: [...] }
```
Or use the admin key header instead of the secret query.

## 6. Function count tracking
Current Vercel functions (Hobby limit = 12):
1. `api/admin/recover-order.js`
2. `api/ccavenue/initiate.js`
3. `api/ccavenue/response.js`
4. `api/delhivery/index.js`           ← dispatcher (5 actions)
5. `api/email/send.js`
6. `api/orders/lookup.js`
7. `api/reviews/request.js`            ← also handles `?cron=1`
8. `api/reviews/submit.js`
9. `api/whatsapp/index.js`             ← dispatcher (send/webhook/cron)

Total: **9** — 3 slots free for future endpoints.

## 7. Customising the invoice
Edit `/app/api/email/lib/invoice-pdf.js`:
- `DEFAULT_SELLER` block (top of file) — set your GSTIN, legal name, address.
- Colours: `colors.brand` (wine) and `colors.accent` (gold) — tweak hex equivalents.
- Logo: pdf-lib supports PNG embedding via `doc.embedPng()` — drop a base64 PNG in.
