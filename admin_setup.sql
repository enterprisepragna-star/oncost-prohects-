-- ============================================================
-- ONCOST Admin v2 — Schema additions
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- 1. Add imgbb_api_key to site_settings so admin can store the JPG-upload key
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS imgbb_api_key text;

-- 2. Make sure products table has the columns the admin form writes
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description text;

-- 3. Indexes for admin filtering speed (no-op if already present)
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status   ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 4. Verify admin RLS still allows the admin email full access
--    (no change needed if you kept enterprisepragna@gmail.com — see supabase_schema.sql)
