# ONCOST — Pending Setup Tasks (Developer Handoff)

> **Status as of this commit**: All code is written, lint-clean, and ready to deploy. The items below are the configuration / dashboard work that must be done outside the codebase (Vercel, Supabase, CCAvenue, AiSensy, AI providers).
>
> **Stack**: Vanilla HTML/JS + Supabase + Vercel serverless functions

---

## 🔴 P0 — BLOCKING (must do before payments work)

### 1. Run latest Supabase migration
**File**: `admin_setup.sql` (in repo root)
**Where**: Supabase Dashboard → SQL Editor → New query → paste contents → Run
**Adds**:
- `products.image_urls` (multi-image gallery)
- `site_settings.openai_api_key`, `gemini_api_key`, `low_stock_threshold`, `alert_whatsapp`
- `orders.ccavenue_order_id`, `payment_tracking_id`, `payment_response`, `guest_phone`
- `wishlists` table + RLS
- `whatsapp_logs` table
- `profiles.phone`
**Safe to re-run** (uses `IF NOT EXISTS` everywhere).

### 2. Add Vercel environment variables
**Where**: Vercel Dashboard → Project `oncost-prohects-` → Settings → Environment Variables
**Tick all 3 environments**: Production / Preview / Development

#### CCAvenue (already have these from merchant dashboard)
| Variable | Value |
|---|---|
| `CCAVENUE_MERCHANT_ID` | `4444301` |
| `CCAVENUE_ACCESS_CODE` | `AVVZ93NF13AH86ZVHA` |
| `CCAVENUE_WORKING_KEY` | `84FC355BA866871F6324D409261A59CB` |
| `CCAVENUE_ENV` | `test` *(switch to `production` after first successful test)* |

#### Supabase (Service Role Key needed)
| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | `https://jyvmmypalshebqmnrdma.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key |

#### Site & WhatsApp helpers
| Variable | Value |
|---|---|
| `SITE_URL` | `https://www.oncost.shop` |
| `INTERNAL_API_KEY` | Generate: `openssl rand -hex 16` (32-char random string) |
| `CRON_SECRET` | Generate another: `openssl rand -hex 16` |

#### AiSensy (after sign-up — see P1 item 4)
| Variable | Value |
|---|---|
| `AISENSY_API_KEY` | Get from AiSensy Dashboard → Settings → API (after Meta verification) |

**After adding all vars** → Deployments tab → click `...` on latest → **Redeploy**.

### 3. Configure CCAvenue response URL
**Where**: CCAvenue Merchant Dashboard → Settings → API → Response URL
**Set to**: `https://www.oncost.shop/api/ccavenue/response`
**Why**: Without this, payment success won't update order status in Supabase.

### 4. Push latest code to GitHub
**How**: Click Emergent's "Save to GitHub" button → push to new branch (e.g. `v5-ccavenue-whatsapp-ai`) → review PR on GitHub → merge to `main`.
**Vercel will auto-deploy** within 1-2 mins of merge.

---

## 🟡 P1 — IMPORTANT (do this week)

### 5. Sign up at AiSensy for WhatsApp automation
**Why**: Unlocks order confirmations, abandoned cart recovery, chatbot.
**Steps** (full guide in `AISENSY_SETUP_GUIDE.md`):
1. https://www.aisensy.com → Basic plan ₹999/mo
2. Submit dedicated WhatsApp business number: **+91 90594 24167**
3. Complete Meta Business Verification (AiSensy assists — 1-3 days)
4. Create 4 message templates **exactly as specified** in `AISENSY_SETUP_GUIDE.md`:
   - `oncost_order_confirm` (Utility, 4 variables)
   - `oncost_abandoned_cart` (Marketing, 3 variables)
   - `oncost_shipping_update` (Utility, 4 variables)
   - `oncost_chatbot_reply` (Utility, 1 variable)
5. Wait for Meta template approval (24-48 hrs)
6. Copy API key from AiSensy → add as `AISENSY_API_KEY` Vercel env var
7. Set AiSensy webhook URL: `https://www.oncost.shop/api/whatsapp/webhook`

### 6. Set up imgbb (for image uploads + AI-generated images)
**Why**: Admin's image-upload features need a free image-hosting endpoint.
**Steps**:
1. Sign up at https://imgbb.com (free)
2. Account → Settings → API → "Add key" → copy
3. Log into admin → Site Settings → Image Upload Configuration → paste imgbb key → Save

### 7. Add AI provider keys (optional but recommended)
**Where**: Admin → Site Settings → AI & Alerts Configuration

| Key | Get from | Purpose |
|---|---|---|
| **OpenAI API Key** | https://platform.openai.com/api-keys | Auto-fills SEO title/description/product description (~$0.0001/click) |
| **Gemini API Key** | https://aistudio.google.com/app/apikey | AI image generation via Nano Banana (free tier 1500/day) |

**⚠️ Security**: The OpenAI key shared earlier in chat (`sk-proj-OrhNk3v...`) must be **revoked**, then a fresh key generated and pasted only in the admin UI — never in chat or code.

### 8. Configure low-stock alert
**Where**: Admin → Site Settings → AI & Alerts Configuration
- Set `Low-stock threshold` (default 5)
- Set `Alert WhatsApp number` to your own (+919059424167)
- "Send WhatsApp Alert" button appears on dashboard when products fall below threshold

### 9. Add real product photos
**Three options** (pick one):
- **a)** Manual: open each product → Media tab → drag-drop JPG (one-by-one, ~5 min/product)
- **b)** Bulk via CSV re-import: open GoDaddy CSV → fill `IMAGE URL` column → Admin → Bulk Import → upserts by SKU (no duplicates)
- **c)** AI placeholder: Media tab → "🎨 Generate" button (needs Gemini + imgbb keys) — generates a styled brass product photo from product name
**Recommendation**: Use (c) immediately to make storefront feel premium, replace with real photos as you shoot them.

---

## 🟢 P2 — POLISH (next sprint)

### 10. Test full purchase flow end-to-end
**Sandbox CCAvenue card**: `4111-1111-1111-1111` · CVV `123` · OTP `123456`
- Add product to cart → Checkout → fill shipping → Pay
- Verify Supabase `orders` row created with status `Paid`
- Verify thank-you page shows tracking ID
- *(After AiSensy live)* Verify WhatsApp confirmation arrives within 5 seconds

### 11. Re-secure the GitHub repo
After successful merge:
- Make repo private again (GitHub → Settings → Change visibility)
- Enable 2FA on your GitHub account
- The Emergent GitHub App will continue working with private repos

### 12. Switch CCAvenue to production
Once test transaction works:
- Vercel env var: `CCAVENUE_ENV` → change `test` → `production`
- Redeploy
- Do one small real transaction with your own card to confirm

---

## 📋 Sanity Checklist for Developer

Before signing off, your developer should verify:

- [ ] `admin_setup.sql` has been run (no errors in Supabase SQL Editor)
- [ ] All 9 Vercel env vars are set (CCAvenue × 4, Supabase × 2, Site/Internal × 3)
- [ ] CCAvenue Response URL is set in their merchant dashboard
- [ ] Vercel has redeployed since env vars were added
- [ ] Test card transaction succeeds end-to-end
- [ ] Supabase order row gets status `Paid` automatically
- [ ] Thank-you page shows correct order ID + tracking ID
- [ ] Admin login at `oncost.shop/admin-login.html` works
- [ ] All 158 products visible in admin Products tab
- [ ] At least one product has a real image (verify storefront renders cleanly)
- [ ] AiSensy sign-up initiated (Meta verification in progress)
- [ ] OpenAI key revoked + new key added to admin via UI (not code)
- [ ] Admin Site Settings populated: WhatsApp number, social URLs, SEO meta

---

## 📚 Reference Documentation in Repo

| File | What it covers |
|---|---|
| `admin_setup.sql` | All database migrations |
| `VERCEL_ENV_SETUP.md` | Env var reference (no secrets in file) |
| `CCAVENUE_INTEGRATION_PLAN.md` | CCAvenue architecture & flow |
| `AISENSY_SETUP_GUIDE.md` | Full WhatsApp setup walkthrough |
| `memory/PRD.md` | Complete product requirements + history |

---

## 🚨 Security Reminders for Developer

1. **NEVER commit** any value from the "Vercel env vars" table above to git. They go ONLY in Vercel's encrypted env var store.
2. **The Working Key, Service Role Key, AiSensy API Key, OpenAI Key, Gemini Key are all SECRETS.** If any leak, rotate immediately via the respective provider's dashboard.
3. **The publishable Supabase anon key in `supabase-client.js` is intentionally public** — it's RLS-protected. Don't confuse it with the service_role key.
4. **`.env.local`** is in `.gitignore` — fine to use for local Vercel dev (`vercel dev`), but never commit it.

---

## 💬 Open Questions for Developer

If your developer has questions, here are the architectural decisions made:

1. **Why static HTML/JS not Next.js?** — Matches existing oncost.shop deployment (Vercel static). Less complexity, no SSR build step. Migration to Next.js possible later if SSR/SEO demands it.
2. **Why Vercel serverless instead of Render/Railway backend?** — Free tier covers expected traffic. Co-located with the frontend deploy. No CORS issues.
3. **Why client-side OpenAI/Gemini API calls?** — Admin-only feature with admin's own key. Server-side would mean a Vercel function + key in env, which is fine too but adds complexity. Can be migrated to server-side in 30 min if needed.
4. **Why AiSensy instead of Meta Cloud API direct?** — Avoids 1-2 weeks of Meta verification paperwork. AiSensy's API is a thin wrapper — easy to swap to Meta direct later if costs scale.

---

**Last updated**: 2026-06-09
**Repo branch to deploy**: `v5-ccavenue-whatsapp-ai` (or latest)
**Live storefront**: https://www.oncost.shop
**Admin**: https://www.oncost.shop/admin-login.html
