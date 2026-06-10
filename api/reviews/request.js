// POST /api/reviews/request
// Admin clicks "Request Review" on a Delivered order → we generate a magic-link
// token, stamp it on the order row, and send a WhatsApp message via AiSensy.
//
// Auth: x-admin-key header must match ADMIN_RECOVERY_KEY env var.
//
// Body: { order_id: uuid }  (the Supabase orders.id, NOT ccavenue_order_id)

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_KEY    = process.env.ADMIN_RECOVERY_KEY;
  const SITE_URL     = process.env.SITE_URL || `https://${req.headers.host}`;
  const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) { res.status(500).json({ error: 'Supabase not configured.' }); return; }
  if (!ADMIN_KEY)                    { res.status(500).json({ error: 'ADMIN_RECOVERY_KEY missing.' }); return; }
  if (req.headers['x-admin-key'] !== ADMIN_KEY) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const orderId = (req.body && req.body.order_id) || '';
  if (!orderId) { res.status(400).json({ error: 'order_id required' }); return; }

  try {
    // 1. Load order
    const oRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const orders = await oRes.json();
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    if (!['Paid','Packed','Shipped','Delivered'].includes(order.status)) {
      res.status(400).json({ error: 'Order must be Paid/Delivered before requesting a review.' }); return;
    }

    // 2. Ensure review_token exists on the order (idempotent — reuse if already set)
    let token = order.review_token;
    if (!token) {
      token = crypto.randomBytes(20).toString('hex');
      const upd = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_token: token }),
      });
      if (!upd.ok) {
        const t = await upd.text();
        console.error('[reviews/request] token persist failed', t);
        res.status(500).json({ error: 'Could not store review token (run migration_reviews.sql)' }); return;
      }
    }

    // 3. Build link — points to first product in the order for now
    const items = Array.isArray(order.items) ? order.items : [];
    const firstProductId = (items[0] && items[0].product_id) || '';
    const reviewLink = `${SITE_URL}/product.html?id=${encodeURIComponent(firstProductId)}&review_token=${encodeURIComponent(token)}`;

    // 4. Try sending WhatsApp via internal AiSensy endpoint
    const phone = order.guest_phone || (order.shipping_address && order.shipping_address.phone);
    const name  = (order.shipping_address && order.shipping_address.name) || 'Customer';
    let waSent = false;
    let waError = null;

    if (phone) {
      try {
        const waRes = await fetch(`${SITE_URL}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(INTERNAL_KEY ? { 'x-internal-key': INTERNAL_KEY } : {}) },
          body: JSON.stringify({
            type: 'review_request',
            to: phone,
            params: {
              customer_name: name,
              product_name: (items[0] && items[0].name) || 'your order',
              review_link: reviewLink,
            },
          }),
        });
        waSent = waRes.ok;
        if (!waRes.ok) waError = await waRes.text();
      } catch (e) {
        waError = e.message;
      }
    }

    // 5. Always return the link (admin can copy/share manually if WhatsApp fails)
    res.status(200).json({
      ok: true,
      token,
      review_link: reviewLink,
      whatsapp_sent: waSent,
      whatsapp_error: waSent ? null : waError,
      copy_paste_message: `Hi ${name}! Thanks for shopping with ONCOST. How was your experience with ${(items[0] && items[0].name) || 'your order'}? Leave a quick review: ${reviewLink}`,
    });
  } catch (e) {
    console.error('[reviews/request] exception', e.message);
    res.status(500).json({ error: e.message });
  }
};

module.exports.config = { api: { bodyParser: true } };
