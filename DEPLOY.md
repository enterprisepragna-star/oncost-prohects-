# ONCOST Deployment Guide

## Architecture
- **Frontend** (React SPA) → **Vercel**
- **Backend** (FastAPI + PyMuPDF + MongoDB) → **Railway** or **Render**
- **Database** → **MongoDB Atlas** (free tier)

> Vercel alone cannot host the backend: PyMuPDF, Pillow, and persistent file storage
> (product images) require a real server process. The frontend-only Vercel deployment
> calls your separately hosted backend API.

---

## Step 1 — Backend on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select this repo, set the **Root Directory** to `backend`
3. Railway auto-detects the `Procfile` and uses `requirements.txt`  
   → If it complains about emergent-specific packages, rename `requirements-deploy.txt` to `requirements.txt`
4. Add these **Environment Variables** in Railway:

   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | your MongoDB Atlas connection string |
   | `DB_NAME` | `oncost` |
   | `JWT_SECRET` | any long random string |
   | `ADMIN_EMAIL` | `admin@oncost.shop` |
   | `ADMIN_PASSWORD` | your admin password |
   | `COMPANY_LEGAL_NAME` | `PRAGNA ENTERPRISES` |
   | `COMPANY_PHONE` | your phone |
   | `COMPANY_EMAIL` | your email |
   | `COMPANY_WEBSITE` | `www.oncost.shop` |
   | `PORT` | `8000` (Railway sets this automatically) |

5. Deploy → Copy the generated URL, e.g. `https://oncost-api-production.up.railway.app`

---

## Step 2 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select this repo
3. Vercel will auto-detect `vercel.json` at the root and use:
   - Build command: `cd frontend && yarn install && yarn build`
   - Output: `frontend/build`
4. Add this **Environment Variable** in Vercel:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | the Railway URL from Step 1 (e.g. `https://oncost-api-production.up.railway.app`) |

5. Deploy → your site is live at `https://your-project.vercel.app`

---

## Step 3 — MongoDB Atlas (if not already set up)

1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → Free M0 cluster
2. Create a database user and whitelist `0.0.0.0/0` (allow all IPs, needed for Railway)
3. Copy the connection string → paste as `MONGO_URL` in Railway

---

## Custom Domain (optional)

In Vercel → Project Settings → Domains → add `oncost.shop`  
Point your DNS A/CNAME records to Vercel as instructed.

---

## PDF Import Fix (what changed)

The old extraction code used `page.get_image_info()` which returned bounding boxes
of embedded PDF image objects. In your Photoshop-composed PDF, these boxes covered
the entire cell (image + text caption), causing cropped images to include product codes
and prices.

The new approach:
1. Detects product codes using word-level coordinates from `page.get_text("words")`
2. Groups codes into rows/columns to detect the actual grid layout (3×3 or any NxM)
3. Slices only the **top 62%** of each grid cell (the pure image zone)
4. Pads to square on white background and saves at 88% JPEG quality
