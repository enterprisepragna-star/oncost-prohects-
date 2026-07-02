-- Migration: fix product edit after CSV import + add multi-image support (max 5)
-- Run this once in your Supabase SQL editor

-- Add missing columns that the admin form uses
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls  jsonb    DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS barcode     text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_variants boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS length_cm   numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS breadth_cm  numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS height_cm   numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hsn_code    text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gst_percent numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge       text;

-- Backfill image_urls from image_url for existing products that have one
UPDATE public.products
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL
  AND (image_urls IS NULL OR image_urls = '[]'::jsonb);
