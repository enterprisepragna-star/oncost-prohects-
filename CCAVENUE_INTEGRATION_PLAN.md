# CCAvenue Payment Gateway Integration — Plan

## Status: PENDING credentials & architecture decision

CCAvenue is a **server-side-only** gateway. The Working Key (32-char secret) is used to AES/MD5-hash request and response payloads — it must never reach the browser. Your storefront on Vercel (static) cannot do this alone.

## What we need from your CCAvenue Merchant Dashboard

| Credential | Where to find it | Notes |
|---|---|---|
| **Merchant ID** | Dashboard → Settings → API | 6-digit number, e.g. `123456` |
| **Access Code** | Dashboard → Settings → API | Starts with `AV...` |
| **Working Key** | Dashboard → Settings → API → "View Working Key" | 32-char hex string — **SECRET** |
| **Environment** | — | Test (`test.ccavenue.com`) OR Production (`secure.ccavenue.com`) |
| **Currency** | Should be `INR` | Auto-set by KYC |
| **Webhook / Response URL** | We'll set this to `https://www.oncost.shop/api/ccavenue/response` | After deploy |

## Two architecture options

### Option A — Vercel Serverless Functions (recommended)
- **Cost**: Free (Vercel hobby tier covers up to 100GB-hours/month)
- **Setup**: Add `/api/ccavenue/initiate.js` + `/api/ccavenue/response.js` Node.js functions to your repo
- **How it works**:
  1. Storefront cart calls `/api/ccavenue/initiate` with order details
  2. Function encrypts payload with Working Key + redirects browser to CCAvenue
  3. Customer pays on CCAvenue
  4. CCAvenue posts back to `/api/ccavenue/response`
  5. Function decrypts, marks order as `Paid` in Supabase, redirects to thank-you page
- **Env vars** (set in Vercel dashboard → Project Settings → Environment Variables):
  - `CCAVENUE_MERCHANT_ID`
  - `CCAVENUE_ACCESS_CODE`
  - `CCAVENUE_WORKING_KEY`
  - `CCAVENUE_ENV` = `test` or `production`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (for marking orders paid bypassing RLS)

### Option B — Separate small backend
- More flexible (cron jobs, webhooks, etc.) but more setup
- Host on Railway / Render / Fly.io (~$5/mo)
- Same crypto logic, just deployed standalone

## Implementation outline (Option A) — what I'd write

```
/api/ccavenue/
├── initiate.js   — encrypts order details, redirects browser to CCAvenue checkout
├── response.js   — receives & verifies CCAvenue's POST callback, updates order status
└── lib/
    └── ccavenue-crypto.js   — AES-128-CBC encrypt/decrypt with Working Key
```

Frontend changes:
- Cart page → "Proceed to Checkout" button now POSTs cart + delivery address to `/api/ccavenue/initiate`
- New `checkout.html` collects shipping address + invoice details before payment
- New `thank-you.html` shows order confirmation after success

## Once you share credentials
1. Add them as Vercel env vars (you do this — I never see the secret key)
2. I'll commit the 3 server functions + checkout/thank-you pages to a new branch
3. We test with CCAvenue's sandbox numbers (e.g. card `4111-1111-1111-1111`, CVV `123`, OTP `123456` on test env)
4. Switch `CCAVENUE_ENV=production` once verified

## Estimated work after you share credentials: ~90 minutes

---

**For now**: Cart's "Proceed to Checkout" button still creates an order row in Supabase with status `Processing` — exactly as before. The payment step will be inserted between "Add to Cart" and "Order Confirmed" once we have the credentials.

Share the **Merchant ID + Access Code + Working Key** (or just paste a screenshot of your CCAvenue API settings page) and I'll execute Option A in the next push.
