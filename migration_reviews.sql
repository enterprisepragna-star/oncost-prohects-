-- =====================================================================
-- ONCOST · Product Reviews Migration
-- Run AFTER migration_ccavenue_fix.sql
-- Adds product-level reviews + verified-buyer flag + admin-managed testimonials
-- Idempotent — safe to re-run.
-- =====================================================================

-- 1. Extend testimonials with product link + order link + verified flag
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS product_id   text REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_id     uuid REFERENCES public.orders(id)   ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS review_token text UNIQUE;     -- magic-link recovery token

-- Note: is_verified and image_url already exist from supabase_schema.sql

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_testimonials_product_id  ON public.testimonials (product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status      ON public.testimonials (status);
CREATE INDEX IF NOT EXISTS idx_testimonials_order_id    ON public.testimonials (order_id);

-- 3. Allow public (anon) to read approved testimonials for a product (already exists, just confirm)
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials FOR SELECT USING (status = 'Approved');

-- 4. Allow admin to view all testimonials (re-confirm)
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL USING (auth.email() = 'enterprisepragna@gmail.com');

-- 5. Allow logged-in users to read THEIR OWN testimonials (any status — so they can see Pending)
DROP POLICY IF EXISTS "Users can view own testimonials" ON public.testimonials;
CREATE POLICY "Users can view own testimonials"
  ON public.testimonials FOR SELECT USING (auth.uid() = user_id);

-- 6. Insert policy: server-side (service role bypasses) handles verified-buyer check.
--    Direct client insert is closed to prevent spam.
DROP POLICY IF EXISTS "Users can insert own testimonials" ON public.testimonials;
-- We intentionally do NOT recreate a permissive insert policy here.
-- Customer reviews come through /api/reviews/submit (uses service role).

-- =====================================================================
-- DONE.
-- =====================================================================
