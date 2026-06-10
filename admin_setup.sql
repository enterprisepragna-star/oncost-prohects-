-- ============================================================
-- ONCOST Admin v3 — Schema additions
-- Run in Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- v2 (previous) ----------------------------------------------
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS imgbb_api_key text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description text;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status   ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- v3 NEW -----------------------------------------------------

-- 1. Multi-image gallery (additional images beyond image_url)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls text[];

-- 2. AI SEO key + low-stock alert config
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS openai_api_key text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS alert_whatsapp text;   -- admin's own WhatsApp for low-stock pings

-- 3. Wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_select_own"   ON public.wishlists;
DROP POLICY IF EXISTS "wishlist_insert_own"   ON public.wishlists;
DROP POLICY IF EXISTS "wishlist_delete_own"   ON public.wishlists;

CREATE POLICY "wishlist_select_own" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_insert_own" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_delete_own" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- 4. CCAvenue payment tracking columns on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ccavenue_order_id   text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_tracking_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_response    jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone         text;
CREATE INDEX IF NOT EXISTS idx_orders_ccavenue ON public.orders(ccavenue_order_id);

-- 6. Gemini Nano Banana API key for AI image generation
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS gemini_api_key text;


-- 5. Allow anon to INSERT orders (guest checkout)
DROP POLICY IF EXISTS "orders_insert_self" ON public.orders;
CREATE POLICY "orders_insert_self" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. WhatsApp logs table (audit + dedupe)
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction   text NOT NULL CHECK (direction IN ('inbound','outbound')),
  phone       text NOT NULL,
  message     text,
  payload     jsonb,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_phone   ON public.whatsapp_logs(phone);
CREATE INDEX IF NOT EXISTS idx_wa_created ON public.whatsapp_logs(created_at DESC);

-- 8. Make sure profiles has phone (for abandoned-cart cron)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
