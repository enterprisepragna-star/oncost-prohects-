# 🚚 Phase 2 Setup — Delhivery Integration

## Add 4 environment variables to Vercel

Open **Vercel → your project → Settings → Environment Variables → "Add new"**.
Add these (for **Production**, **Preview**, and **Development** scopes — tick all 3):

| Name | Value |
|---|---|
| `DELHIVERY_TOKEN` | `d3fd947d6e830495a032d1cbd00938f45b9ba21f` *(your token)* |
| `DELHIVERY_CLIENT_NAME` | your registered **warehouse / pickup location name** in Delhivery (case-sensitive — exactly as it appears in `https://one.delhivery.com/settings/warehouses`) |
| `DELHIVERY_PICKUP_PINCODE` | your warehouse pincode, e.g. `560001` |
| `DELHIVERY_BASE_URL` | *(optional)* `https://track.delhivery.com` — leave blank for default |

After saving, **redeploy** (Vercel → Deployments → ⋯ → Redeploy).

> 💡 **Where to find the warehouse name**: Log into Delhivery One → Settings → Warehouses. Use the exact value of the "Name" column (not the address). If you don't have one yet, create a warehouse with your business pickup address first.

---

## What's now live

### 🛒 At checkout
- When customer types a 6-digit PIN code → the page automatically calls Delhivery to:
  - Check **serviceability** (shows "Not serviceable" if Delhivery can't deliver)
  - Calculate **live shipping cost** based on weight + pickup-to-drop distance
  - Update the total in real time
- If Delhivery is down, falls back to flat ₹79 (no checkout blocking)
- District/state hint appears next to shipping line

### 💰 After successful payment
- `/api/ccavenue/response` now **automatically calls Delhivery** to generate an AWB
- The order gets stamped with `awb_number`, `tracking_url`, `courier_partner = Delhivery`
- Total weight + dimensions are computed from your product catalog (uses the weight/L/B/H you fill in the new Shipping & Tax tab)

### 📦 In Admin → Order Detail
Three new buttons in the Logistics card:
- **Generate Delhivery AWB** — manual trigger if auto-AWB failed (e.g. token misconfigured)
- **Print Shipping Label** — opens the PDF label in a new tab (ready for thermal printer)
- **Track Shipment** — opens public Delhivery tracking page
- **Schedule Pickup** — prompts for date, schedules pickup with Delhivery

### 📋 In Admin → Products
The **Shipping & Tax tab** you've already filled (weight, L, B, H, HSN, GST%) is what drives shipping cost. **Make sure every product has weight set** — otherwise the system uses 500g fallback per item which may under-estimate cost.

---

## How to test before going live

1. **Edit a product** → fill Shipping & Tax tab (weight 500g, L/B/H 15×10×6, HSN 7117, GST 18%)
2. **Add to cart → Checkout**
3. **Type a Bangalore-area PIN like `560001`** → watch shipping update live
4. **Type a far PIN like `744304` (Andaman)** → shipping should be higher  
5. **Complete a test payment** (any small CCAvenue test transaction)
6. **Open Admin → Orders → view the order** — AWB should auto-appear within 30 seconds
7. **Click "Print Shipping Label"** — Delhivery PDF should open

---

## API endpoints reference (for your records)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/delhivery/serviceability?drop_pincode=&weight_grams=` | GET | Live shipping quote (called by checkout) |
| `/api/delhivery/create-shipment` | POST + `x-admin-key` | Generate AWB for an order |
| `/api/delhivery/label?awb=` | GET | Stream PDF shipping label |
| `/api/delhivery/schedule-pickup` | POST + `x-admin-key` | Schedule warehouse pickup |

Public tracking URL format: `https://www.delhivery.com/track/package/<AWB>`

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Checkout shows flat ₹79 always | `DELHIVERY_TOKEN` or `DELHIVERY_PICKUP_PINCODE` missing | Add env vars + redeploy |
| "Not serviceable" for every pincode | Token invalid or wrong API base | Check token in one.delhivery.com → API setup |
| AWB doesn't auto-generate after payment | `DELHIVERY_CLIENT_NAME` mismatch | Match exactly the warehouse name in Delhivery One |
| Label PDF doesn't open | AWB not yet picked up by Delhivery, or pickup not scheduled | Schedule pickup first |
| `Pickup scheduling failed` | Pickup time outside Delhivery's daily window | Try a future date with `pickup_time = 12:00:00` |

For deep debugging, check **Vercel → Functions → Logs**. Every Delhivery call is logged with `[delhivery/...]` prefix.

---

## Phase 3 is next (after this is working)

Once you confirm Phase 2 works:
- PDF GST invoice generation
- Auto-email invoice + AWB tracking link via Resend (`re_fz6...` key already saved by you)
- "Order Shipped" / "Out for Delivery" / "Delivered" status emails
- Testimonial reminder 2 days post-delivery (Vercel cron)
