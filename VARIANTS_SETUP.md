# 🧩 Product Variants — Setup Guide

Just shipped: Amazon-style product variants. One product = many variants (sizes, colors, materials, capacities, pack quantities).

---

## ⚠️ One thing you must do

**Re-run `migration_ALL_IN_ONE.sql` in Supabase** — I've added the variant tables to the same file. It's idempotent, so re-running won't break anything.

1. Open Supabase → SQL Editor → New query
2. Paste the contents of [`migration_ALL_IN_ONE.sql`](https://github.com/enterprisepragna-star/oncost-prohects-/blob/main/migration_ALL_IN_ONE.sql) (Raw button → Ctrl+A → Ctrl+C)
3. Run → wait for green "Success"

This adds:
- `product_variants` table (the variants themselves)
- `products.has_variants` flag
- `cart_items.variant_id`, `variant_label`, `unit_price` (so cart knows what variant)

---

## 🎨 How to use it

### Adding variants to a NEW product

1. **Admin → Products → "+ New Product"** → fill in basic info (name, base price, category)
2. Click the **"Variants" tab** (new tab)
3. ✅ Tick **"This product has multiple variants"**
4. Pick variant type: **Size / Color / Material / Capacity / Pack / Other**
5. Click **"+ Add Variant"** → fill in each row:
   - **Label** = what customer sees ("55 gms", "Gold", "Set of 5")
   - **SKU** = auto-suggested from base SKU
   - **Price** = variant's specific price
   - **Stock** = stock for this variant only
   - **Weight (g)** = drives Delhivery shipping cost per variant
   - **Image URL** (optional) = swaps when customer picks this variant
6. Add as many variants as needed (e.g. 3 sizes = 3 rows)
7. Click **Save** → done

### Converting an EXISTING product into a variant parent

For your **Brass Prasadam Bowl** that has 2 listings (₹499 and ₹299 for 55gms):

1. **Edit the higher-priced one** (₹499, "Brass Prasadam bowl")
2. Variants tab → tick **"This product has multiple variants"**
3. Click **+ Add Variant** 3 times → fill in:
   - Row 1: `55 gms` · price `299` · stock from old product
   - Row 2: `60 gms` · price `349` · stock
   - Row 3: `80 gms` · price `449` · stock
4. Save
5. **Delete the duplicate** (the ₹299 one) from Products list → "Brass Prasadam Bowl (55 gms)" can now be deleted

Now your storefront shows ONE listing "Brass Prasadam bowl" with chips: **55 gms | 60 gms | 80 gms**.

---

## 🛍 What the customer sees

On the product page:
- A **chip selector** appears under the price: `55 gms · 60 gms · 80 gms`
- Click any chip → **price updates instantly** to that variant's price
- Click any chip → **image swaps** (if variant has its own image)
- **Out-of-stock variants** show greyed out + strikethrough + "OOS" label (can't be clicked)
- Cart row shows the variant: **"Brass Prasadam Bowl · 55 gms"** (with gold badge)
- Invoice line items include variant: "Brass Prasadam Bowl (55 gms) × 2"
- Delhivery shipment uses the variant's weight, not the product's base weight

---

## 🎯 Variant types supported

| Type | Best for | Example labels |
|---|---|---|
| **Size** | Weight-based items | `55 gms`, `60 gms`, `80 gms`, `1 kg` |
| **Color** | Any colored item | `Gold`, `Silver`, `Rose Gold`, `Antique Brass` |
| **Material** | Same design, different metal | `Brass`, `Copper`, `German Silver` |
| **Capacity** | Containers/vessels | `250 ml`, `500 ml`, `1 L` |
| **Pack** | Bulk/gift sets | `Set of 1`, `Set of 5`, `Set of 10` |
| **Other** | Anything else | Free text |

---

## ⚠️ Important behaviour notes

1. **Pricing**: Each variant has its own `price` and `offer_price`. The base product price is only shown for products WITHOUT variants.
2. **Stock**: Each variant has its own stock count. Add-to-cart respects variant stock.
3. **Shipping weight**: Delhivery uses the variant's `weight_grams`. If a variant is missing weight, falls back to product weight, then 500g.
4. **Variant images**: Optional — if blank, the variant uses the product's main image.
5. **First variant = default**: The first variant in the list is auto-selected when customer lands on the product page.
6. **Cart deduplication**: Cart now treats `same product + different variant` as separate cart rows. So `Bowl 55gms` and `Bowl 80gms` add as 2 lines.
7. **Backward compatible**: Existing products without variants work exactly as before. Nothing breaks.

---

## 🐛 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Variants" tab is empty after toggling on | Migration not yet run | Run `migration_ALL_IN_ONE.sql` |
| Save fails with `column "variant_id" does not exist` | Same | Same |
| Customer adds variant but cart shows wrong price | Cached old cart | Customer needs to clear cart once (the unit_price column wasn't there before) |
| Variant chips don't appear on storefront | `has_variants` flag is false or no Active variants exist | Edit product → Variants tab → tick the box → verify variants saved |
| Image doesn't swap when picking variant | Variant doesn't have its own `image_url` set | Add image URL to that variant row |

---

## 🚀 Push & Test

1. **Save to GitHub** via chat input
2. **Re-run `migration_ALL_IN_ONE.sql`** in Supabase (it now includes variant tables)
3. Test by editing your **Brass Prasadam bowl** → add variants 55/60/80 gms
4. Visit `/product.html?id=<that-product-id>` → see chip selector
5. Pick a variant → confirm price/image swap
6. Add to cart → cart row shows variant badge

Send a screenshot if anything looks off! 🎨
