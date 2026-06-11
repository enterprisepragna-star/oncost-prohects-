# 🌟 Reviews System — Setup & Deploy

After your next Vercel deployment, do **these 3 steps**:

## Step 1 · Run the new SQL migration (1 minute)

In **Supabase → SQL Editor → New query**, paste the entire contents of:

```
migration_reviews.sql
```

Click **Run**. This adds `product_id`, `order_id`, `title`, `review_token` to the `testimonials` table + indexes + RLS policies for the new flow.

> Note: `migration_ccavenue_fix.sql` should already be run from the previous step. If not, run it first.

## Step 2 · (Optional) Create the AiSensy review template

For the **"Request Review via WhatsApp"** feature, create a template in your AiSensy dashboard:

- **Campaign name:** `oncost_review_request`
- **Body:** `Hi {{1}}! Thanks for shopping with ONCOST. How was your experience with {{2}}? Leave a quick review here: {{3}}`
- **Variables:** customer_name, product_name, review_link

If you skip this, the **copy-paste fallback** still works — the admin gets the link + ready-made message to send manually.

## Step 3 · Test it end-to-end

**(A) Admin adds testimonial on behalf of customer:**
1. Admin → Testimonials → click **"+ Add Testimonial"**
2. Fill in customer name, rating, review text. Pick a product or leave blank for site-wide.
3. Status defaults to **Approved** so it goes live immediately. Save.
4. Refresh storefront → review appears on the product page.

**(B) Verified buyer leaves a review:**
1. Customer logs in to oncost.shop with the same email they used at checkout.
2. Goes to a product they purchased → clicks **"Write a Review"**.
3. Submits → review enters **Pending** state.
4. Admin moderates in Testimonials tab.

**(C) Admin requests review via WhatsApp magic link:**
1. Admin → Orders → find a **Paid/Delivered** order → click the **★ (Request Review)** icon
2. A modal opens with: WhatsApp status (sent ✓ or fallback message), the review link, and an "Open in WhatsApp" button
3. Customer taps link → opens product page with **"Write a Review"** pre-authorised (no login required, marked as verified buyer)

## What's new in the UI

### Storefront (product page)
- ⭐ Summary stars + rating + review count next to product name
- Full **Customer Reviews** section below product description
- Green ✓ **Verified Buyer** badge on reviews from real purchasers
- **"Write a Review"** button (login required, or magic-link from admin)

### Admin Console
- **Testimonials tab**: "+ Add Testimonial" button (top-right) + Edit/Delete per row + product column
- **Orders tab**: new **★ icon** on Paid/Delivered orders → "Request Review" modal with WhatsApp send + copy-paste fallback

### New API endpoints (Vercel functions)
- `POST /api/reviews/submit` — customer review submission (verified-buyer check)
- `POST /api/reviews/request` — admin generates magic-link & sends WhatsApp (auth: `x-admin-key`)
- Updated: `/api/whatsapp/send` now supports `type: 'review_request'`

## Anti-abuse safeguards built in
- ✅ Only Paid/Delivered orders can be reviewed (server-enforced via `/api/reviews/submit`)
- ✅ One review per (user, product) — duplicates rejected
- ✅ Min 10 characters per review
- ✅ Default status = **Pending** (admin must approve before going live)
- ✅ Magic-link token = 40-char random hex, stored once per order
- ✅ Verified Buyer badge only on server-verified reviews (admin can manually toggle for legacy reviews)
