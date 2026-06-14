-- migration_phase3_invoice_reviews.sql
-- Phase 3: PDF invoicing + 2-day testimonial cron tracking
-- Idempotent — safe to run multiple times.

-- Track whether the auto-review-request email/WhatsApp has been sent for an order
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS review_request_sent_at timestamp with time zone;

-- Track when the order was marked Delivered (Vercel cron filters by this)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;

-- Auto-stamp delivered_at when status flips to 'Delivered'
CREATE OR REPLACE FUNCTION public.set_delivered_at()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'Delivered' AND (OLD.status IS DISTINCT FROM 'Delivered') AND NEW.delivered_at IS NULL THEN
    NEW.delivered_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_delivered_at ON public.orders;
CREATE TRIGGER trg_set_delivered_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_delivered_at();

-- Helpful index for the cron query (Delivered + pending review request)
CREATE INDEX IF NOT EXISTS idx_orders_review_cron
  ON public.orders (status, review_request_sent_at, delivered_at)
  WHERE status = 'Delivered' AND review_request_sent_at IS NULL;

-- Backfill delivered_at for already-Delivered orders so the cron can still pick them up
UPDATE public.orders
   SET delivered_at = COALESCE(updated_at, created_at)
 WHERE status = 'Delivered' AND delivered_at IS NULL;
