# 🔴 URGENT — Steps to fix CCAvenue orders not showing in Admin

You're 3 steps away from a working end-to-end checkout + invoice flow.

---

## Step 1 · Run the SQL migration in Supabase (2 minutes)

This adds the missing columns (`ccavenue_order_id`, `payment_tracking_id`, etc.) and the `business_profile` table, plus a trigger that auto-generates invoice numbers like `INV-2026-001000`.

1. Open Supabase Dashboard → your project → **SQL Editor** → **New query**
2. Open the file **`migration_ccavenue_fix.sql`** in the project root
3. Copy-paste the entire contents into the SQL Editor
4. Click **Run** (bottom-right). You should see "Success. No rows returned."

---

## Step 2 · Add `ADMIN_RECOVERY_KEY` to Vercel env vars (1 minute)

This protects the order-recovery endpoint so only you can call it.

1. Open **Vercel Dashboard → your project → Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ADMIN_RECOVERY_KEY`
   - **Value:** any long random string (e.g. `oncost-recover-7Hk29Bmq4`) — keep it private
   - **Environments:** Production, Preview, Development (tick all)
3. **Save** → trigger a redeploy (Vercel → Deployments → ⋯ → Redeploy)

> While you're there, double-check these vars are also set:
> - `CCAVENUE_MERCHANT_ID`, `CCAVENUE_ACCESS_CODE`, `CCAVENUE_WORKING_KEY`, `CCAVENUE_ENV` = `production`
> - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
> - `SITE_URL` = `https://www.oncost.shop`

---

## Step 3 · Recover the two missed orders from your CCAvenue dashboard

The two completed transactions you showed me (`OC-1781110752895-6373` for ₹139 and `OC-1781111689040-8696` for ₹154) need to be backfilled into Supabase.

1. Go to your live admin: `https://www.oncost.shop/admin-dashboard.html`
2. Click **Orders** in the sidebar → **Recover Missed Order** (top-right)
3. Fill in for each missed order:
   - **Order ID:** `OC-1781110752895-6373` (or the second one)
   - **Tracking / Ref. #:** `114571273239` (from CCAvenue dashboard)
   - **Amount:** `139.00`
   - **Status:** `Paid`
   - **Customer email/phone/name/address:** whatever you entered during the test
   - **Admin Recovery Key:** the random string you set in Step 2
4. Click **Recover Order** → the order appears in Admin → click the invoice icon to view/print

---

## Step 4 · Set up your Business Profile (for invoice header)

1. In the admin console, go to **Site Settings**
2. Scroll to the new **"Business Profile"** card
3. Fill in:
   - Business Name, Legal Name (optional)
   - **GSTIN** (very important if you're GST-registered — appears on the tax invoice)
   - Full address (line1/line2/city/state/PIN)
   - Phone, Email
4. Save

These appear on every customer invoice from now on.

---

## What changed under the hood (technical summary)

### Root cause
The `orders` table was missing 3 columns (`ccavenue_order_id`, `payment_tracking_id`, `payment_response`) that the checkout code was trying to write. The Supabase insert failed silently → no row to update → admin showed nothing.

Also: RLS policy `WITH CHECK (auth.uid() = user_id)` blocked **guest** checkouts (where both are null, since `null = null` is `null` in SQL, not `true`).

### Fixes shipped
- ✅ `migration_ccavenue_fix.sql` — adds missing columns, fixes RLS, adds invoice numbering trigger
- ✅ `api/ccavenue/initiate.js` — now uses **service role key** to insert the pending order *server-side*, bypassing all RLS issues
- ✅ `api/ccavenue/response.js` — now **UPSERTS** (PATCH; if 0 rows, INSERT) so even an unexpected schema/RLS hiccup can't lose an order
- ✅ Detailed `console.log`/`console.error` at every step (visible in Vercel Logs)
- ✅ `api/admin/recover-order.js` — manual backfill endpoint, protected by `ADMIN_RECOVERY_KEY`
- ✅ `api/orders/lookup.js` — fetches order + business profile for the thank-you invoice
- ✅ `thank-you.html` — beautiful printable tax invoice (browser-native PDF; no email needed)
- ✅ Admin "Recover Missed Order" button + Business Profile editor + invoice icon per order

### What about email invoicing?
Not built yet — by design. The current solution gives every customer a printable PDF invoice on the thank-you page (one click → save as PDF), and CCAvenue already auto-emails a payment receipt. When you're ready, adding Resend for invoice email is a 30-min job.

---

## Verify it's working

1. After Step 1+2 redeploy, place a new test transaction (small amount).
2. Admin → Orders should show the new order within seconds of payment success.
3. Thank-you page should show the invoice with your business details and GSTIN.
4. If anything fails, check **Vercel → Logs → /api/ccavenue/response** — we now log every step (`[ccavenue/response] order=... status=... PATCH ok rows=1`).

Reach back if any step is unclear or any logs look odd.
