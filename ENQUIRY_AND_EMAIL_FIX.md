# 🔥 Just Shipped — Enquiry Workflow + My Orders Fix + Email Notifications

## ✅ Three things fixed/added

### 1. "My Orders" empty for customers — FIXED
**Bug**: Orders placed as guest (when not logged in) had `user_id = null`. After signup/login, the My Orders query looked for `user_id = current_user.id` → found nothing.

**Fix**: My Orders now matches **`user_id` OR `guest_email = current_user.email`** — so any past guest order placed with the same email automatically appears once the customer logs in.

Also added matching RLS policy in Supabase so the query actually returns data.

### 2. Enquiries page — Completely reworked
**Before**: Showed raw JSON dump in one column.
**Now**:
- ✅ **Parsed columns**: Date · Name · Email/Phone · Event · Qty · Budget · Message preview · Status badge
- ✅ **Clickable Eye icon** opens detailed enquiry view with all fields
- ✅ **Status workflow** dropdown: `New / Contacted / Discussed / Quoted / Accepted / Converted / Not Converted / Lost`
- ✅ **Deal Value** field (₹) — fill in when status = Converted to track revenue
- ✅ **Admin Notes** — internal log of conversations, call outcomes, next steps
- ✅ **One-click WhatsApp + Phone + Email** buttons to contact customer directly
- ✅ **Delete** button per row
- ✅ **Color-coded status badges** — blue (new), orange (in progress), green (converted), red (lost)

### 3. Admin email notification on new enquiry — NEW
Every time a customer submits the bulk enquiry form on `/bulk.html`:
1. Lead saved to Supabase (existing behavior)
2. **Beautiful HTML email auto-sent to `enterprisepragna@gmail.com`** with all enquiry details, including:
   - Customer name, email, phone, event type, date, qty, budget, full message
   - 🔘 "Open in Admin" button
   - 🔘 "WhatsApp customer" button (one-click WhatsApp Web link)
3. Resend sends from your configured `RESEND_FROM_EMAIL` env var

Plus: **Order confirmation emails** now also fire automatically on successful CCAvenue payment with order ID, amount, and invoice link.

---

## ⚠️ Two things to do for it to work

### A. Re-run `migration_ALL_IN_ONE.sql` in Supabase
I appended **Part 6** that adds:
- `leads.status` (default 'New'), `leads.admin_notes`, `leads.deal_value`, `leads.contacted_at`, `leads.resolved_at`
- Updated orders SELECT RLS policy so customers see guest-orders by their email

Idempotent — safe to re-run.

### B. Verify Vercel env vars are set
- `RESEND_API_KEY` = `re_fz6ySwSi_qqzUtwWqfyKw1MMCihmzahi9` ✅ already provided
- `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (until your domain is verified in Resend)
- `RESEND_REPLY_TO` = `enterprisepragna@gmail.com`
- `ADMIN_EMAIL` = `enterprisepragna@gmail.com` (where enquiry notifications go)

---

## 🧪 Test it (after migration + redeploy)

1. **My Orders fix**: Log in as the customer who reported the issue → go to `/account.html?tab=orders` → his past orders (placed as guest with same email) now appear
2. **Enquiry workflow**: Open Admin → Enquiries → click eye icon on any lead → set status to "Discussed" → save → status badge updates in list
3. **Email notification**: Go to `/bulk.html` → fill the form → submit → check `enterprisepragna@gmail.com` inbox → enquiry email should arrive within 30 sec

---

## Phase 3 progress

**Done now:**
- ✅ Unified `/api/email/send` endpoint via Resend
- ✅ Enquiry admin notification template
- ✅ Order confirmation email template

**Still to ship in Phase 3** (next session):
- 📄 PDF invoice generation (currently we use the printable HTML on thank-you page)
- 📧 Status notification emails (Packed / Shipped / Out for Delivery / Delivered)
- ⏰ Testimonial reminder cron — 2 days post-delivery

Function count: **11/12** — one slot left for the Vercel cron we'll add for testimonial reminders.

---

## 📝 Files changed

- `app.js` — My Orders query (user_id OR email), enquiry submit fires admin email
- `admin.js` — completely rebuilt `renderLeads` + new `viewLead` modal + `deleteLead`
- `admin-dashboard.html` — leads table header now has 9 columns
- `api/email/send.js` *(new)* — Resend dispatcher
- `api/ccavenue/response.js` — fires order_confirm email on Paid
- `migration_ALL_IN_ONE.sql` — Part 6 (leads workflow) + updated orders SELECT policy
- This file

Push to GitHub → re-run migration → redeploy → test. 🚀
