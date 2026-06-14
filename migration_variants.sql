-- =====================================================================
-- ONCOST · Product Variants Migration
-- Adds variant support to products (Amazon-style: 55gms / 60gms / Gold / Silver etc.)
-- Run AFTER migration_ALL_IN_ONE.sql. Idempotent.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id      text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_type    text NOT NULL DEFAULT 'Size',      -- Size / Color / Material / Capacity / Pack / Other
  variant_label   text NOT NULL,                      -- e.g. "55 gms" / "Gold" / "Brass"
  variant_value   text,                               -- machine-readable: "55", "gold", etc.
  sku             text,
  barcode         text,
  price           numeric NOT NULL,
  offer_price     numeric,
  stock           integer DEFAULT 0,
  weight_grams    integer,
  length_cm       numeric,
  breadth_cm      numeric,
  height_cm       numeric,
  image_url       text,
  sort_order      integer DEFAULT 0,
  is_default      boolean DEFAULT false,              -- one default per product
  status          text DEFAULT 'Active',              -- Active / Inactive
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku        ON public.product_variants (sku);
CREATE INDEX IF NOT EXISTS idx_variants_barcode    ON public.product_variants (barcode);
CREATE UNIQUE INDEX IF NOT EXISTS uq_variants_product_label ON public.product_variants (product_id, variant_label);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view variants" ON public.product_variants;
CREATE POLICY "Anyone can view variants"
  ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage variants" ON public.product_variants;
CREATE POLICY "Admins manage variants"
  ON public.product_variants FOR ALL
  USING (auth.email() = 'enterprisepragna@gmail.com');

-- Flag on the parent product to indicate "this product has variants"
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_variants boolean DEFAULT false;

-- Cart items need to track which variant the customer chose
ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS variant_id     uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS variant_label  text,
  ADD COLUMN IF NOT EXISTS unit_price     numeric;

CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON public.cart_items (variant_id);

-- =====================================================================
-- DONE. The Admin will now show a "Variants" tab in the product form.
-- =====================================================================
