# 📋 ONCOST · PENDING ACTIONS

**Updated:** 11 June 2026  
**Project:** oncost.shop  
**Status:** Code complete for Phases 1 & 2. Deployment + database migration pending on your side.

---

## 🚨 P0 — DO THESE TODAY (15 min total)

### 1️⃣ Merge PR #10 in GitHub _(if not done yet)_

- 🔗 https://github.com/enterprisepragna-star/oncost-prohects-/pull/10
- Resolve the `admin.js` + `response.js` conflicts using the merged versions I provided
- Click **"Commit merge"** at the bottom
- ✅ Done when: PR shows green ✅ "Mergeable"

### 2️⃣ Run the all-in-one SQL migration in Supabase

- Open https://supabase.com/dashboard → oncost project → **SQL Editor → New query**
- Open https://github.com/enterprisepragna-star/oncost-prohects-/blob/main/migration_ALL_IN_ONE.sql → **Raw** → **Ctrl+A → Ctrl+C**
- Paste into Supabase SQL Editor → click **Run**
- ✅ Done when: bottom shows green "Success. No rows returned."

**If you see `policy already exists` error:** Run this one-liner first, then re-run the migration:
```sql
DROP POLICY IF EXISTS "Anyone can insert pending orders" ON public.orders;
```

### 3️⃣ Add 6 environment variables in Vercel

https://vercel.com/dashboard → oncost project → **Settings → Environment Variables → Add New**

For each variable: tick **Production**, **Preview**, **Development** all three.

| Variable Name | Value | Notes |
|---|---|---|
| `DELHIVERY_TOKEN` | `d3fd947d6e830495a032d1cbd00938f45b9ba21f` | ✅ already have |
| `DELHIVERY_CLIENT_NAME` | _your warehouse name_ | Get from Delhivery One → Settings → Warehouses (**case-sensitive**, exact match) |
| `DELHIVERY_PICKUP_PINCODE` | _your pincode_ | e.g. `560001` |
| `RESEND_API_KEY` | `re_fz6ySwSi_qqzUtwWqfyKw1MMCihmzahi9` | ✅ already have |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` | Use this until your domain is verified in Resend |
| `RESEND_REPLY_TO` | `enterprisepragna@gmail.com` | Your inbox for customer replies |

### 4️⃣ Trigger a Vercel redeploy

- After adding env vars: Deployments tab → ⋯ on latest deployment → **Redeploy** → tick "Use existing Build Cache"
- ✅ Done when: deployment turns green ✅

### 5️⃣ Verify the mystery file is gone

Open https://github.com/enterprisepragna-star/oncost-prohects-/tree/main/api

- ❌ If you see `create-delhivery-shipment.js` directly inside `/api/` (NOT inside `/api/delhivery/`) → click it → 🗑 delete → commit
- ✅ Should look like: `/api/ccavenue/`, `/api/delhivery/`, `/api/orders/`, `/api/admin/`, `/api/reviews/`, `/api/whatsapp/` (folders only, no loose files at the root)

---

## 🟡 P1 — DO THIS WEEK (after P0 is green)

### 6️⃣ Fill in product shipping details

- Admin → Products → edit each product → **Shipping & Tax tab**
- Required for each: `Weight (g)`, `Length/Breadth/Height (cm)`, `HSN Code`, `GST %`
- This drives shipping cost + invoice GST breakup
- Without this, system uses 500g fallback (may under-estimate cost)

### 7️⃣ Fill in your Business Profile

- Admin → Site Settings → **Business Profile** card
- Required: `Business Name`, `GSTIN`, full address (line1/city/state/pincode), phone, email
- This appears on every customer invoice

### 8️⃣ Verify your domain in Resend (for branded emails)

- https://resend.com → Domains → **Add Domain**
- Use `mail.oncost.shop` (subdomain, doesn't touch your main DNS)
- Add the 3 DNS records (SPF, DKIM, DMARC) at your domain provider
- Wait 10–30 mins for green verification
- Then change `RESEND_FROM_EMAIL` in Vercel to `orders@mail.oncost.shop` and redeploy
- Until verified: emails work but come from `onboarding@resend.dev`

### 9️⃣ Test the full flow end-to-end

| Test | Steps | Pass criteria |
|---|---|---|
| Image upload | Admin → edit any product → Media tab → drag a JPG | Image appears, URL contains `supabase.co/storage` |
| Live shipping | Cart → Checkout → enter 6-digit PIN | Shipping cost updates from ₹79 to real Delhivery rate within 2 sec |
| Order auto-AWB | Complete a small test transaction | Admin → Order Detail shows AWB number + "Print Label" button within 30 sec |
| Print label | Admin → Order Detail → Print Shipping Label | Delhivery PDF opens in new tab |
| Complaint flow | `/support.html` → submit a ticket | Ticket appears in Admin → Complaints with auto-number `CMP-2026-...` |
| Review request | Order with status=Paid → ★ icon → Request Review | Customer gets WhatsApp link OR copy-paste fallback shown |

---

## 🟢 P2 — PHASE 3 (next session, ~1 hour build by me)

Once P0 is verified and you say "**start Phase 3**":

- 📄 **PDF tax invoice generation** — proper GST invoice with HSN/GST breakup, business letterhead, signed Tax Invoice
- 📧 **Auto-email on payment** — invoice PDF attached, AWB link, estimated delivery date
- 📧 **Status notification emails** — Order Confirmed / Packed / Shipped / Out for Delivery / Delivered
- ⏰ **Testimonial reminder cron** — auto-email 2 days after Delivered status asking for review

**Provider:** Resend (key already saved). No additional setup needed beyond env vars in P0 step 3.

---

## 🔵 P3 — BACKLOG (Phase 4, build as needed)

- **Multi-courier framework** — add Bluedart / Shiprocket as fallbacks when Delhivery is unavailable for a pincode
- **Multi-warehouse routing** — pick the closest warehouse per order
- **COD payment option** — enable Cash on Delivery (Delhivery supports it; we just need to wire UI)
- **Bulk shipping label printing** — one click → PDF of all today's AWBs for delivery boy pickup
- **WhatsApp parity** — every email notification (order confirmed, packed, shipped, etc.) also fires AiSensy WhatsApp message
- **Auto review request cron** — same as testimonial reminder, but via WhatsApp instead of email
- **Customer chat widget** — live chat on storefront connected to admin dashboard
- **Inventory low-stock email alerts** — when stock < 5, email admin
- **Auto refund flow** — admin clicks "Refund" → CCAvenue refund API → email customer
- **Multi-language storefront** — Hindi + Kannada + Tamil for South India
- **Mobile app** — React Native wrapper (Phase 5)

---

## 🔍 Current state at a glance

### ✅ Working (live in code, may need env vars or migration)
| Feature | Code | Migration | Env vars |
|---|:-:|:-:|:-:|
| Storefront browsing & cart | ✅ | – | – |
| User signup/login (Supabase Auth) | ✅ | – | ✅ |
| Admin panel | ✅ | – | – |
| CCAvenue payment | ✅ | ⚠️ Need #2 | ✅ |
| Invoice number generation | ✅ | ⚠️ Need #2 | – |
| Order management workflow | ✅ | ⚠️ Need #2 | – |
| Status timeline + history | ✅ | ⚠️ Need #2 | – |
| Bulk product actions | ✅ | – | – |
| Bulk order delete | ✅ | – | – |
| Barcode field + label print | ✅ | ⚠️ Need #2 | – |
| Product reviews (verified buyer) | ✅ | ⚠️ Need #2 | – |
| Customer complaint cell | ✅ | ⚠️ Need #2 | – |
| Supabase Storage image upload | ✅ | ⚠️ Need #2 | – |
| WhatsApp confirmations (AiSensy) | ✅ | – | ✅ |
| **Delhivery live shipping** | ✅ | ⚠️ Need #2 | ⚠️ Need #3 |
| **Delhivery auto-AWB** | ✅ | ⚠️ Need #2 | ⚠️ Need #3 |
| **Delhivery label printing** | ✅ | – | ⚠️ Need #3 |

### ⏳ Not built yet
- PDF tax invoice file generation
- Email automation (Resend)
- Testimonial reminder cron
- Anything in P3 backlog

### ⚠️ Known issues
- Vercel function count is at 10/12 (Phase 3 will push it to 12 — at the limit; consider upgrading to Vercel Pro before Phase 4)
- Resend `FROM_EMAIL` is `onboarding@resend.dev` until you verify domain (P1 step 8)

---

## 📞 If anything breaks

**Paste here:**
- The exact error message (screenshot or text)
- Which step you were on
- Vercel build logs (if deployment-related)

I'll fix on the spot. No need to debug yourself.

---

## 🎯 Quick win — what to do RIGHT NOW

1. Open this list in a new tab so you can tick items as you go
2. Do **P0 steps 1 → 5 in order** (15 min)
3. Reply with "**P0 done**" — I'll verify everything's green and start Phase 3

Good luck! 🚀
