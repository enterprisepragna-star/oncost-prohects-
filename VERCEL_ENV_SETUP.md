# Vercel Environment Variables Setup

⚠️ **DO NOT commit actual values to git.** This file documents which env vars to set
in the Vercel dashboard → Project Settings → Environment Variables.

## Required for CCAvenue payment gateway

| Variable | Example value | Where it's used |
|---|---|---|
| `CCAVENUE_MERCHANT_ID`     | `XXXXXXX`                          | `/api/ccavenue/initiate.js` |
| `CCAVENUE_ACCESS_CODE`     | `AVxxxxxxxxxxxxxxxx`               | `/api/ccavenue/initiate.js` |
| `CCAVENUE_WORKING_KEY`     | `<32-char-hex-secret>`             | `/api/ccavenue/*.js` (encrypts/decrypts) |
| `CCAVENUE_ENV`             | `production`  (or `test`)          | Chooses CCAvenue endpoint |
| `SITE_URL`                 | `https://www.oncost.shop`          | Used to build redirect/callback URLs |

## Required for Supabase order updates from serverless functions

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL`              | `https://jyvmmypalshebqmnrdma.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → `service_role` key (SECRET) |

## Setting them in Vercel

1. Go to https://vercel.com → your `oncost` project → **Settings → Environment Variables**
2. For each variable above:
   - Name: as in the table
   - Value: paste the real value
   - Environment: tick **Production**, **Preview**, **Development** as needed
3. Click **Save**
4. **Redeploy** from the Deployments tab so the new env vars take effect

## Local testing
For local Vercel dev (`vercel dev`), create a `.env.local` (also git-ignored) with the same vars.

## Security notes
- `CCAVENUE_WORKING_KEY` is the encryption key — never expose in browser code, screenshots, or this file's committed version
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — same rule
- Both are read by serverless functions ONLY via `process.env`, never by the browser
- The browser-safe Supabase anon key in `supabase-client.js` is intentionally public
