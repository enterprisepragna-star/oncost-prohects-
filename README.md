# ONCOST — Premium Return Gifts & Event Gifting

> **Live site:** [oncost.shop](https://oncost.shop) · **Admin portal:** [oncost.shop/admin-login.html](https://oncost.shop/admin-login.html)

ONCOST is a B2C e-commerce platform for premium return gifts targeting Indian celebration events — birthdays, poojas, weddings, and corporate gifting. Customers browse curated collections, add to cart, and place bulk enquiries or direct orders. A connected admin backend allows the business owner to manage the full catalogue, pricing, orders, coupons, sale events, and customer activity.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Repository Structure](#repository-structure)
4. [Deployment Setup](#deployment-setup)
5. [Supabase Database](#supabase-database)
6. [Phase 1 — Completed Work](#phase-1--completed-work)
7. [Phase 2 — Upcoming Work](#phase-2--upcoming-work)
8. [Phase 3 — Future Roadmap](#phase-3--future-roadmap)
9. [Branch & PR Strategy](#branch--pr-strategy)
10. [Environment Variables](#environment-variables)
11. [Running Locally](#running-locally)
12. [Team Responsibilities](#team-responsibilities)
13. [Key Contacts & Credentials](#key-contacts--credentials)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (storefront)** | HTML5, CSS3, Vanilla JS | Customer-facing pages served statically |
| **Frontend (Next.js)** | Next.js 15, React 19, TypeScript | Progressive upgrade layer, deployed to Vercel |
| **Styling** | Custom CSS (`site.css`, `luxury.css`, `globals.css`) | Brand design system — burgundy `#7a1f35`, gold `#d4af37` |
| **Backend / Database** | Supabase (PostgreSQL + Auth + RLS) | Products, orders, cart, leads, coupons, testimonials |
| **Deployment — Storefront** | Vercel (static, `cleanUrls: true`) | Serves HTML files from repo root |
| **Deployment — Domain** | Hostinger (`oncost.shop`) | DNS points to Vercel |
| **Icons** | Lucide React (Next.js), Font Awesome (admin) | UI icons |
| **Analytics** | Vercel Analytics | Page view tracking |

---

## Architecture Overview

```
oncost.shop (domain — Hostinger DNS)
      │
      ▼
  Vercel CDN
      │
      ├── / ──────────────── index.html           (homepage)
      ├── /products.html ──── products.html        (product listing)
      ├── /product.html ───── product.html         (product detail)
      ├── /cart.html ─────── cart.html             (shopping cart)
      ├── /account.html ───── account.html         (customer account)
      ├── /login.html ──────── login.html          (auth)
      ├── /signup.html ──────── signup.html        (auth)
      ├── /enquiry.html ─────── enquiry.html       (bulk enquiry form)
      ├── /payment.html ─────── payment.html       (payment page)
      ├── /bulk.html ─────────── bulk.html         (bulk orders info)
      ├── /contact.html ──────── contact.html      (contact)
      ├── /admin-login.html ──── admin-login.html  (admin auth)
      └── /admin-dashboard.html ─ admin-dashboard.html (admin portal)
                │
                ▼
          Supabase (PostgreSQL)
          ┌─────────────────────────────────────┐
          │ products     cart_items   orders     │
          │ profiles     leads        coupons    │
          │ sale_events  testimonials categories │
          │ site_settings                        │
          └─────────────────────────────────────┘
```

**Two frontend layers exist in parallel:**
- **Static HTML layer** — the live deployed site. All pages are plain HTML files at the repo root, using `app.js` for Supabase interactions and `site.css` / `luxury.css` for styling.
- **Next.js layer** (`src/app/`) — a progressive upgrade being built. Currently has all customer routes as React/TypeScript components. Will become the primary layer once Supabase is wired in.

---

## Repository Structure

```
oncost-prohects-/
│
├── index.html                  Homepage (hero, collections, products, bulk CTA)
├── products.html               Product listing with search + filter
├── product.html                Product detail page (login-gated)
├── cart.html                   Shopping cart (Supabase cart_items)
├── account.html                Customer account dashboard
├── login.html                  Customer login (email + OTP)
├── signup.html                 Customer signup (email + OTP)
├── enquiry.html                Bulk enquiry form (saves to leads table)
├── payment.html                Payment page (Supabase order creation)
├── bulk.html                   Bulk orders info page
├── contact.html                Contact form
├── 404.html                    Custom 404 page
│
├── admin-login.html            Admin authentication page
├── admin-dashboard.html        Full admin portal (8 management modules)
├── admin.js                    All admin CRUD logic (separate from HTML)
│
├── app.js                      Customer-facing JS (Supabase auth, cart, orders)
├── supabase-client.js          Supabase client initialisation
├── supabase-schema.sql         ⭐ Run this in Supabase SQL Editor
├── site.css                    Main customer stylesheet
├── luxury.css                  Luxury variant stylesheet (admin + premium pages)
│
├── src/
│   ├── app/                    Next.js App Router pages
│   │   ├── page.tsx            Homepage
│   │   ├── layout.tsx          Root layout (Header + Footer + Analytics)
│   │   ├── globals.css         Next.js global styles
│   │   ├── not-found.tsx       404 page
│   │   ├── products/
│   │   │   ├── page.tsx        Product listing (client-side filter)
│   │   │   └── [id]/page.tsx   Product detail (SSG)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── account/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── bulk/page.tsx
│   │   ├── enquiry/page.tsx
│   │   ├── payment/page.tsx
│   │   └── contact/page.tsx
│   ├── components/
│   │   ├── Header.tsx          Sticky navigation with active link
│   │   ├── Footer.tsx          Footer + mobile nav bar
│   │   └── ProductCard.tsx     Reusable product card
│   └── lib/
│       └── data.ts             Static product/collection data (placeholder)
│
├── package.json                Next.js 15 + React 19 dependencies
├── next.config.ts              Next.js configuration
├── tsconfig.json               TypeScript configuration
├── vercel.json                 Vercel deployment config (static, cleanUrls)
├── .htaccess                   Apache config for Hostinger (HTTPS, gzip, cache)
└── README.md                   This file
```

---

## Deployment Setup

### Vercel (primary — oncost.shop)

- **GitHub repo** connected to Vercel project `oncost-prohects`
- Every push to `main` auto-deploys to `oncost.shop`
- Every PR gets a **preview deployment URL** automatically
- `vercel.json` is set to `"framework": null` — deploys static HTML files directly
- `cleanUrls: true` removes `.html` extensions from URLs

**To deploy:**
```
git push origin main
```
Vercel picks it up automatically within 30–60 seconds.

### Hostinger (DNS only)

- Domain `oncost.shop` is registered on Hostinger
- DNS nameservers point to Vercel — Hostinger is **not** serving any files
- SSL is managed by Vercel (auto-provisioned)
- `.htaccess` in the repo is kept for compatibility but not active on Vercel

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — live at `oncost.shop` |
| `feature/nextjs-full-pages` | Active development branch (current PR) |
| `feature/*` | Feature branches — always PR into `main` |

---

## Supabase Database

**Project URL:** `https://jyvmmypalshebqmnrdma.supabase.co`

### ⭐ First-time setup — Run the schema

Go to **Supabase Dashboard → SQL Editor** and run the contents of `supabase-schema.sql`.

This creates or updates the following tables:

| Table | Purpose |
|-------|---------|
| `products` | Product catalogue — name, price, offer_price, stock, badge, image_url, SEO fields |
| `categories` | Product categories — name, slug, description |
| `profiles` | Customer profiles — name, phone, email (linked to auth.users) |
| `cart_items` | Per-user cart — product_id, qty (auto-cleared after order) |
| `orders` | Customer orders — email, total, status, payment_id, coupon used |
| `leads` | Bulk enquiries — customer details, product, event details, status |
| `coupons` | Discount codes — % or flat, min order, expiry, usage limits |
| `sale_events` | Timed sales — banner text, discount %, start/end dates (auto-shows on site) |
| `testimonials` | Customer reviews — rating, text, approve/reject workflow |
| `site_settings` | Key-value store for SEO metadata and social media links |

### Row Level Security (RLS)

All tables have RLS enabled. Rules:
- **Products, categories, coupons, sale_events, site_settings** — public `SELECT`, admin-only `INSERT/UPDATE/DELETE`
- **cart_items** — each user can only see and manage their own rows
- **orders** — users see own orders, admin sees all
- **leads** — users can insert, admin manages all
- **testimonials** — public can only read `approved` reviews; users insert; admin manages all
- **Admin** is identified by email `enterprisepragna@gmail.com`

---

## Phase 1 — Completed Work

### ✅ Customer Storefront (HTML)

| Page | Status | Notes |
|------|--------|-------|
| Homepage (`index.html`) | ✅ Live | Hero, 6 collection cards, 4 featured products, bulk CTA |
| Products (`products.html`) | ✅ Live | Search, collection filter tabs, Supabase product loading |
| Product Detail (`product.html`) | ✅ Live | Login-gated, add to cart, enquire, pay buttons |
| Cart (`cart.html`) | ✅ Live | Supabase cart_items, qty controls, order simulation |
| Account (`account.html`) | ✅ Live | Profile from Supabase, order count, leads count |
| Login (`login.html`) | ✅ Live | Supabase auth (email + password), OTP tab (demo) |
| Signup (`signup.html`) | ✅ Live | Supabase signUp, profile creation, OTP tab (demo) |
| Enquiry (`enquiry.html`) | ✅ Live | Saves to Supabase `leads`, opens mailto |
| Payment (`payment.html`) | ✅ Live | Simulated order creation in Supabase `orders` |
| Bulk Orders (`bulk.html`) | ✅ Live | Features, events covered, 4-step process |
| Contact (`contact.html`) | ✅ Live | Form saves to leads, opens mailto |
| 404 (`404.html`) | ✅ Live | Branded error page |

### ✅ Admin Portal

| Module | Status | Features |
|--------|--------|---------|
| Admin Login | ✅ Done | Supabase auth, admin email guard |
| Dashboard | ✅ Done | Revenue, orders, products, leads metrics; recent orders/leads/pending reviews |
| Products | ✅ Done | Add, edit, delete; price, offer price, stock, badge, status, image URL, description, SKU, SEO title/description |
| Categories | ✅ Done | Add/delete categories, product count per category |
| Orders | ✅ Done | Full table, filter by status, inline status update (Processing → Shipped → Delivered → Cancelled) |
| Coupons & Offers | ✅ Done | Create % or flat discount codes, min order, usage limit, expiry date |
| Sale Events | ✅ Done | Named sales with banner text, discount %, start/end dates — auto-shows on storefront |
| Customers | ✅ Done | All registered users, search by name/email, email link |
| Leads / Enquiries | ✅ Done | All enquiry leads, filter by status, mark as contacted/converted |
| Testimonials | ✅ Done | Approve/reject reviews, pending count on dashboard |
| SEO Settings | ✅ Done | Site title, meta description, keywords, OG image, canonical URL, GA ID, GSC verification, robots.txt |
| Social Media | ✅ Done | WhatsApp, Instagram, Facebook, YouTube, Pinterest, Twitter/X links |

### ✅ Next.js Layer (Vercel)

All customer routes exist as proper React/TypeScript components under `src/app/`:

- `/` — Homepage with real `Link` navigation
- `/products` — Client-side search + collection tab filter
- `/products/[id]` — Product detail with static generation (SSG)
- `/login`, `/signup` — Tabbed auth forms (localStorage, to be upgraded to Supabase)
- `/account` — Profile strip, info cards, logout
- `/cart` — Live cart with qty controls + remove
- `/bulk` — Full bulk orders page
- `/enquiry` — Two-column form + sidebar
- `/payment` — Payment summary + sidebar
- `/contact` — Contact form + FAQ accordion
- Shared `Header`, `Footer`, `ProductCard` components

### ✅ Infrastructure

- `.htaccess` — HTTPS redirect, gzip, browser caching, security headers
- `supabase-schema.sql` — Full database schema with RLS policies
- Vercel auto-deploy pipeline via GitHub
- `vercel.json` — Static deployment with clean URLs

---

## Phase 2 — Upcoming Work

This is the active next sprint. All items below need to be built.

### 2A — Storefront connected to Admin settings

**Goal:** Changes made in the admin portal automatically reflect on the customer-facing site without any code deployment.

| Task | Description | Files affected |
|------|-------------|---------------|
| **Sale banner** | When an active sale event exists in `sale_events`, show a dismissible banner at the top of all pages automatically. Check start/end dates on page load. | `index.html`, `app.js` |
| **Testimonials section** | Pull approved reviews from `testimonials` table and display a carousel/grid on the homepage. | `index.html`, `app.js` |
| **SEO meta tags from DB** | Load SEO settings from `site_settings` and inject `<title>`, `<meta description>`, `<meta keywords>`, Open Graph tags dynamically. | All HTML pages |
| **Social links from DB** | Load social media links from `site_settings` and populate footer links and floating WhatsApp button. | `index.html`, `site.css` |
| **Offer price on storefront** | When a product has `offer_price` set, show it with a strikethrough on the original price. Show discount % badge. | `products.html`, `product.html`, `app.js` |

### 2B — Coupon code at checkout

**Goal:** Customers can apply a coupon code before completing their order.

| Task | Description |
|------|-------------|
| Add coupon input field to `cart.html` and `payment.html` | Text field + "Apply" button |
| Validate coupon via Supabase | Check code exists, not expired, usage < max_uses, order value ≥ min_order_value |
| Apply discount to order total | Show discount breakdown, update `total_amount` |
| Increment `used_count` on successful order | Update `coupons` table when order is placed |

### 2C — Payment Gateway (Razorpay)

**Goal:** Customers can complete real payments on oncost.shop.

| Task | Description |
|------|-------------|
| Razorpay account setup | Create account at razorpay.com, get API key and secret |
| Add Razorpay script to `payment.html` | `<script src="https://checkout.razorpay.com/v1/checkout.js">` |
| Create order on backend | Vercel serverless function `/api/create-order` — calls Razorpay API to create order with amount |
| Open Razorpay checkout | On "Pay Now" click, open Razorpay modal with order details |
| Handle payment success | On callback, verify payment signature, insert into Supabase `orders` with `payment_id`, clear cart |
| Handle payment failure | Show error, allow retry |
| Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Vercel environment variables | Never commit these to git |

> **Note:** Razorpay requires a business PAN and bank account for live mode. Test mode works immediately after signup.

### 2D — Customer testimonial submission

**Goal:** Customers can submit a product review from their account or order confirmation page.

| Task | Description |
|------|-------------|
| Add review form to `account.html` | Product selector, 1–5 star rating, review text |
| Insert into `testimonials` table | With `status: 'pending'` |
| Admin approves in portal | Already built in Phase 1 |
| Approved reviews appear on homepage | Part of 2A above |

### 2E — SEO implementation

**Goal:** oncost.shop ranks on Google for "return gifts", "bulk gifting India", etc.

| Task | Description |
|------|-------------|
| Add structured data (JSON-LD) | `Product`, `Organization`, `BreadcrumbList` schema on product pages |
| Create `sitemap.xml` | List all pages with lastmod dates |
| Create `robots.txt` | Allow all, reference sitemap |
| Add Google Analytics 4 | GA tracking code on all pages, pulled from `site_settings` |
| Add Google Search Console | Submit sitemap, verify ownership |
| Open Graph + Twitter Card meta | OG image, title, description for social sharing |
| Page speed optimisation | Compress images, lazy load, minify CSS/JS |

### 2F — Next.js Supabase integration

**Goal:** Wire the Next.js layer to Supabase so it can replace the HTML layer entirely.

| Task | Description |
|------|-------------|
| Install `@supabase/supabase-js` in Next.js | `npm install @supabase/supabase-js` |
| Create `src/lib/supabase.ts` | Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Update `src/lib/data.ts` | Replace static arrays with Supabase fetch functions |
| Update `/products/page.tsx` | Fetch products from Supabase on server side |
| Update `/products/[id]/page.tsx` | `generateStaticParams` from Supabase |
| Update `/login` and `/signup` | Use Supabase auth instead of localStorage |
| Update `/account`, `/cart` | Read from Supabase tables |
| Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars | |

---

## Phase 3 — Future Roadmap

These are planned but not yet scoped for active development.

| Feature | Description |
|---------|-------------|
| **Product image upload** | Replace image URL input with direct file upload to Supabase Storage. Admin selects a file, it uploads and the URL is saved automatically. |
| **Real SMS OTP** | Replace the demo OTP (browser alert) with a real SMS provider — MSG91 or Twilio. Required for production mobile login. |
| **Order tracking page** | Customer can view their order status (`/account/orders/[id]`) with a timeline. |
| **WhatsApp order notifications** | When an order is placed, automatically send a WhatsApp message to the business owner via WhatsApp Business API or Twilio. |
| **Email confirmations** | Send order confirmation email to customer using Supabase Edge Functions + Resend or SendGrid. |
| **Inventory management** | Decrement `stock` count when items are added to cart or ordered. Show "Low Stock" / "Out of Stock" badges automatically. |
| **Product variants** | Size, colour, material variants per product (new `product_variants` table). |
| **Wishlist** | Customers can save products to a wishlist (new `wishlists` table). |
| **Multi-image gallery** | Each product can have multiple images displayed in a carousel. |
| **Advanced admin analytics** | Revenue charts by date range, top products, conversion rate, cart abandonment rate. |
| **Bulk order workflow** | Dedicated flow for bulk orders (50+ pieces) — quote generation, negotiation, approval, payment. |
| **Mobile app** | React Native app using the same Supabase backend. |

---

## Branch & PR Strategy

```
main (production — oncost.shop)
  └── feature/phase2-storefront-settings   ← Create this for Phase 2A
  └── feature/phase2-coupon-checkout       ← Create this for Phase 2B
  └── feature/phase2-razorpay              ← Create this for Phase 2C
  └── feature/phase2-testimonials          ← Create this for Phase 2D
  └── feature/phase2-seo                  ← Create this for Phase 2E
  └── feature/nextjs-supabase             ← Create this for Phase 2F
```

**Rules:**
- Never push directly to `main`
- Always create a feature branch and open a PR
- Every PR gets a Vercel preview URL — test on preview before merging
- Merge to `main` only when the feature is fully tested on preview

---

## Environment Variables

### Vercel Dashboard (Settings → Environment Variables)

| Variable | Value | Used in |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jyvmmypalshebqmnrdma.supabase.co` | Next.js pages |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from Supabase project settings) | Next.js pages |
| `RAZORPAY_KEY_ID` | (from Razorpay dashboard) | Phase 2C |
| `RAZORPAY_KEY_SECRET` | (from Razorpay dashboard) | Phase 2C — server only, never public |

> The Supabase URL and anon key are also hardcoded in `supabase-client.js` for the static HTML layer. The anon key is safe to expose publicly — it is restricted by RLS policies.

> **Never commit** `.env.local`, Razorpay secrets, or any API keys to git. The `.gitignore` already excludes `.env*`.

---

## Running Locally

### Static HTML site (Hostinger / Vercel preview)

No build step needed. Open `index.html` directly in a browser, or use a local server:

```bash
# Using Python (built into most systems)
python -m http.server 3000

# Using Node.js (if installed)
npx serve .
```

Then visit `http://localhost:3000`.

> The Supabase connection works on localhost as the anon key has no domain restrictions. Auth redirect URLs may need to be added to Supabase → Authentication → URL Configuration.

### Next.js development server

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The Next.js layer currently uses static data from `src/lib/data.ts`. After Phase 2F, it will connect to Supabase.

---

## Team Responsibilities

| Role | Responsibilities |
|------|-----------------|
| **Business Owner** | Admin portal access, product management, order processing, coupon/sale creation, testimonial approval |
| **Frontend Developer** | HTML/CSS pages, `app.js`, `site.css`, responsive design, Phase 2A–2E storefront features |
| **Next.js Developer** | `src/app/` pages, components, Phase 2F Supabase integration |
| **Backend / DevOps** | Supabase schema, RLS policies, Vercel serverless functions (Phase 2C), environment variables |

---

## Key Contacts & Credentials

| Item | Value |
|------|-------|
| **Business email** | enterprisepragna@gmail.com |
| **Admin portal URL** | https://oncost.shop/admin-login.html |
| **Admin login** | Same as Supabase auth — use Supabase Dashboard to reset password |
| **Supabase project** | https://supabase.com/dashboard/project/jyvmmypalshebqmnrdma |
| **Vercel project** | https://vercel.com/oncost-project-s-projects/oncost-prohects |
| **GitHub repo** | https://github.com/enterprisepragna-star/oncost-prohects- |
| **WhatsApp business** | +91 77997 91820 |

---

## Quick Reference — Common Tasks

### Add a new product
1. Go to `oncost.shop/admin-login.html`
2. Login with admin email + password
3. Click **Products** in the sidebar
4. Click **Add Product** — fill in name, category, price, image URL
5. Click **Save Product** — appears on storefront immediately

### Create a sale / discount banner
1. Admin portal → **Sale Events**
2. Click **Create Sale**
3. Fill in sale name, banner text (this shows on the site), discount %, start and end date/time
4. Click **Launch Sale** — banner automatically appears on oncost.shop during the sale window

### Create a coupon code
1. Admin portal → **Coupons & Offers**
2. Click **Create Coupon**
3. Enter code (e.g. `DIWALI20`), select type (% or flat ₹), set value, optional min order and expiry
4. Click **Create Coupon** — customers can apply this at checkout (Phase 2B)

### Change a product price
1. Admin portal → **Products**
2. Click the **edit** (pencil) icon on the product row
3. Update the **Price** and/or **Offer Price** fields
4. Click **Update Product** — price updates live on the storefront

### Review and approve a testimonial
1. Admin portal → **Testimonials**
2. Default view shows **Pending** reviews
3. Click **Approve** to publish on homepage or **Reject** to remove

### Mark an order as shipped
1. Admin portal → **Orders**
2. Find the order in the table
3. Change the status dropdown from `Processing` to `Shipped`
4. Status updates instantly in the database

---

*Last updated: June 2026 — Phase 1 complete, Phase 2 in planning.*
