// POST /api/whatsapp/send
// Unified outbound WhatsApp sender for AiSensy.
// Body: { type: 'order_confirm' | 'abandoned_cart' | 'shipping_update' | 'custom',
//         to: '91XXXXXXXXXX', params: { ... template variables ... },
//         template?: 'oncost_order_confirm'  // override if custom }
//
// Auth: requires `x-internal-key` header matching INTERNAL_API_KEY env var (so only our own
// serverless functions or admin dashboard can call this — not random visitors).

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const AISENSY_API_KEY = process.env.AISENSY_API_KEY;
  const INTERNAL_KEY    = process.env.INTERNAL_API_KEY;
  if (!AISENSY_API_KEY) { res.status(500).json({ error: 'AISENSY_API_KEY not configured' }); return; }
  if (INTERNAL_KEY && req.headers['x-internal-key'] !== INTERNAL_KEY) {
    res.status(401).json({ error: 'Unauthorized' }); return;
  }

  const { type, to, params = {}, template, campaignName } = req.body || {};
  if (!to) { res.status(400).json({ error: 'Missing recipient phone' }); return; }

  // Normalize phone to E.164 without + (AiSensy expects "91XXXXXXXXXX")
  const phone = String(to).replace(/[^0-9]/g, '').replace(/^0+/, '');
  const e164 = phone.startsWith('91') ? phone : `91${phone}`;
  if (e164.length !== 12) { res.status(400).json({ error: 'Invalid Indian phone number' }); return; }

  // Map our internal type → AiSensy approved campaign / template
  const TEMPLATES = {
    order_confirm: {
      campaignName: campaignName || 'oncost_order_confirm',
      // Template variables in order — must match the approved template in AiSensy
      templateParams: [params.customer_name || 'Customer', params.order_id || '', params.amount || '', params.tracking_url || 'https://www.oncost.shop'],
    },
    abandoned_cart: {
      campaignName: campaignName || 'oncost_abandoned_cart',
      templateParams: [params.customer_name || 'Customer', params.cart_value || '', params.recovery_url || 'https://www.oncost.shop/cart.html'],
    },
    shipping_update: {
      campaignName: campaignName || 'oncost_shipping_update',
      templateParams: [params.customer_name || 'Customer', params.order_id || '', params.status || 'Shipped', params.tracking_url || ''],
    },
    review_request: {
      campaignName: campaignName || 'oncost_review_request',
      templateParams: [params.customer_name || 'Customer', params.product_name || 'your order', params.review_link || 'https://www.oncost.shop'],
    },
    custom: {
      campaignName: campaignName || template,
      templateParams: params.template_params || [],
    },
  };
  const tpl = TEMPLATES[type];
  if (!tpl || !tpl.campaignName) { res.status(400).json({ error: 'Unknown message type or missing campaignName' }); return; }

  // AiSensy "Send Campaign" API — https://docs.aisensy.com
  try {
    const r = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: AISENSY_API_KEY,
        campaignName: tpl.campaignName,
        destination: e164,
        userName: params.customer_name || 'Customer',
        templateParams: tpl.templateParams,
        source: 'oncost-storefront',
        media: params.image_url ? { url: params.image_url, filename: 'product.jpg' } : undefined,
      }),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.status(502).json({ error: 'AiSensy error', detail: json });
      return;
    }
    res.status(200).json({ ok: true, type, to: e164, aisensy: json });
  } catch (err) {
    res.status(500).json({ error: 'Send failed', detail: err.message });
  }
};
