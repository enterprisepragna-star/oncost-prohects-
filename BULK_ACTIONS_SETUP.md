# 📦 Bulk Actions + Barcode Setup

## ⚠️ One-time SQL migration (30 seconds)

Run this in **Supabase → SQL Editor → New query**:

```
migration_barcode.sql
```

It adds a `barcode` column to the products table.

---

## ✨ What's new in Admin

### 1. Bulk select & bulk actions on Products
- **Checkbox in each row** + **"Select all on this page"** header checkbox
- When ≥1 product is selected, a **yellow toolbar appears** above the table with:
  - **Activate / Deactivate / Set Draft** — bulk status change (great for hiding test products before going live)
  - **Change Category** — move many products at once
  - **Delete Selected** — permanently remove all selected (with confirmation)
  - **Clear** — uncheck everything

### 2. Bulk delete orders (clear test traffic)
- Same checkbox pattern on Orders page
- **"Delete Selected"** for ad-hoc cleanup
- **"Delete all Failed"** — one-click clear of all failed payment attempts
- **"Delete all Processing"** — clears stuck/abandoned test orders before launch
- Each row now has a 🗑 icon to delete individual orders

### 3. Barcodes for every product
- New **Barcode** field in the product form (Basic tab, next to SKU)
- ✨ **Auto-generate** button (wand icon) — uses SKU if set, otherwise a random 12-digit number
- Live **barcode preview** below the input
- Barcodes are searchable in the Products list (type a barcode into the search box)
- Each product row in the table shows the barcode visually
- 🖨 **"Print Label"** button on each row → opens a 60mm × 40mm label with barcode, product name, SKU, and price for thermal/sticker printers
- CSV bulk import now accepts `BARCODE`, `EAN`, or `UPC` columns

---

## 🚀 Recommended workflow before launching

Once SQL migration is run:

1. Go to **Admin → Products** → set status filter to **Draft** (or whatever your test products show as)
2. Click "select all" checkbox in header → click **Delete Selected** → confirm
3. Repeat for any other test categories
4. Go to **Admin → Orders** → click **"Delete all Processing"** (clears half-completed test orders) → confirm
5. Click **"Delete all Failed"** (clears any failed payments) → confirm
6. (Optional) For each remaining good product, edit it → set Barcode (or click auto-generate) → save
7. Use 🖨 to print labels for your shop inventory if you sell offline too

---

## 🛡 Safety
- All bulk operations require **a confirmation dialog** with the exact count of items being affected
- Bulk delete is **permanent** — there's no undo (so the confirm dialog uses red "Danger" styling)
- Selections **clear automatically** after any bulk action so you don't accidentally re-apply
