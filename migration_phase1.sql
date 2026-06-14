-- =====================================================================
-- ONCOST · Phase 1 — Fulfilment Foundation Migration
-- Adds: product shipping fields, order status timeline, complaints table,
-- Supabase Storage bucket, and updated business profile fields.
-- Idempotent — safe to re-run.
-- =====================================================================

-- ============ 1. PRODUCTS · Shipping + GST fields ============
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_grams   integer,           -- per single unit
  ADD COLUMN IF NOT EXISTS length_cm      numeric,
  ADD COLUMN IF NOT EXISTS breadth_cm     numeric,
  ADD COLUMN IF NOT EXISTS height_cm      numeric,
  ADD COLUMN IF NOT EXISTS hsn_code       text,
  ADD COLUMN IF NOT EXISTS gst_percent    numeric DEFAULT 0; -- 0, 5, 12, 18, 28

-- ============ 2. ORDERS · Fulfilment + tracking + timeline ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS awb_number        text,
  ADD COLUMN IF NOT EXISTS courier_partner   text DEFAULT 'Delhivery',
  ADD COLUMN IF NOT EXISTS tracking_url      text,
  ADD COLUMN IF NOT EXISTS warehouse_code    text DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS pickup_scheduled_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS shipped_at        timestamp with time zone,
  ADD COLUMN IF NOT EXISTS delivered_at      timestamp with time zone,
  ADD COLUMN IF NOT EXISTS packed_at         timestamp with time zone,
  ADD COLUMN IF NOT EXISTS confirmed_at      timestamp with time zone,
  ADD COLUMN IF NOT EXISTS cancelled_at      timestamp with time zone,
  ADD COLUMN IF NOT EXISTS status_history    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS shipping_weight_g integer,
  ADD COLUMN IF NOT EXISTS shipping_dim_l    numeric,
  ADD COLUMN IF NOT EXISTS shipping_dim_b    numeric,
  ADD COLUMN IF NOT EXISTS shipping_dim_h    numeric,
  ADD COLUMN IF NOT EXISTS internal_notes    text;            -- admin only

CREATE INDEX IF NOT EXISTS idx_orders_awb       ON public.orders (awb_number);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON public.orders (status);

-- ============ 3. COMPLAINTS · Customer support cell ============
CREATE TABLE IF NOT EXISTS public.complaints (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number   text UNIQUE,                       -- auto-generated like CMP-2026-000001
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  guest_email     text,
  guest_phone     text,
  customer_name   text NOT NULL,
  category        text NOT NULL,                     -- Damaged / Wrong Item / Not Delivered / Quality / Refund / Other
  subject         text NOT NULL,
  description     text NOT NULL,
  attachments     jsonb DEFAULT '[]'::jsonb,         -- list of public URLs
  status          text DEFAULT 'Open',               -- Open / In Progress / Resolved / Closed
  priority        text DEFAULT 'Normal',             -- Low / Normal / High / Urgent
  admin_notes     text,
  resolution      text,
  responses       jsonb DEFAULT '[]'::jsonb,         -- [{author, message, at}]
  resolved_at     timestamp with time zone,
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_complaints_status   ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_user     ON public.complaints (user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_order    ON public.complaints (order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created  ON public.complaints (created_at DESC);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage all complaints" ON public.complaints;
CREATE POLICY "Admins manage all complaints" ON public.complaints
  FOR ALL USING (auth.email() = 'enterprisepragna@gmail.com');
DROP POLICY IF EXISTS "Users view own complaints" ON public.complaints;
CREATE POLICY "Users view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can submit a complaint" ON public.complaints;
CREATE POLICY "Anyone can submit a complaint" ON public.complaints
  FOR INSERT WITH CHECK (true);

-- Auto-generate ticket number sequence
CREATE SEQUENCE IF NOT EXISTS public.complaint_seq START 1000;
CREATE OR REPLACE FUNCTION public.set_complaint_ticket()
RETURNS trigger AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := 'CMP-' || to_char(now(),'YYYY') || '-' ||
                         LPAD(nextval('public.complaint_seq')::text, 6, '0');
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_set_complaint_ticket ON public.complaints;
CREATE TRIGGER trg_set_complaint_ticket
  BEFORE INSERT OR UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_complaint_ticket();

-- ============ 4. SUPABASE STORAGE BUCKET for product images ============
-- Creates a public bucket called 'product-images' (free up to 1GB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

-- Public read policy
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated users can upload (admin will be authenticated)
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
CREATE POLICY "Authenticated can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Admin can update/delete (you can extend this to any auth user owning the file)
DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
CREATE POLICY "Authenticated can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
CREATE POLICY "Authenticated can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- ============ DONE ============
-- After running this:
-- • Products get weight/dimension/HSN/GST fields
-- • Orders get fulfilment + tracking columns
-- • Complaints table is ready
-- • product-images Supabase Storage bucket is ready for direct uploads
-- =====================================================================
