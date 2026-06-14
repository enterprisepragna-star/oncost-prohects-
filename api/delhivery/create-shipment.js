// POST /api/delhivery/create-shipment
// Admin-key protected. Generates AWB for a given order_id (Supabase UUID) and stores
// awb_number + tracking_url + courier_partner on the order row.
const { createShipment } = require('./lib/client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_KEY    = process.env.ADMIN_RECOVERY_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_KEY) return res.status(500).json({ error: 'Server env not configured' });
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const orderId = (req.body && req.body.order_id) || '';
  if (!orderId) return res.status(400).json({ error: 'order_id required' });

  try {
    // 1. Load order
    const oRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const orders = await oRes.json();
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.awb_number) return res.status(200).json({ ok: true, awb: order.awb_number, message: 'AWB already exists' });

    // 2. Calculate total shipment weight from products
    const items = Array.isArray(order.items) ? order.items : [];
    let totalWeight = 0;
    let maxL = 0, maxB = 0, totalH = 0;
    for (const it of items) {
      const pRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(it.product_id || '')}&select=weight_grams,length_cm,breadth_cm,height_cm,hsn_code&limit=1`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const ps = await pRes.json();
      const prod = ps?.[0] || {};
      const qty = it.qty || it.quantity || 1;
      totalWeight += Number(prod.weight_grams || 500) * qty;
      maxL = Math.max(maxL, Number(prod.length_cm || 15));
      maxB = Math.max(maxB, Number(prod.breadth_cm || 10));
      totalH += Number(prod.height_cm || 6) * qty;
      if (prod.hsn_code && !it.hsn_code) it.hsn_code = prod.hsn_code;
    }
    if (!totalWeight) totalWeight = 500;

    // 3. Stamp shipment weight on the order
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipping_weight_g: totalWeight, shipping_dim_l: maxL, shipping_dim_b: maxB, shipping_dim_h: totalH }),
    });

    // 4. Create shipment via Delhivery
    const result = await createShipment({ ...order, items, shipping_weight_g: totalWeight, shipping_dim_l: maxL, shipping_dim_b: maxB, shipping_dim_h: totalH });

    // 5. Save AWB + tracking on order
    const upd = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        awb_number: result.awb,
        tracking_url: result.tracking_url,
        courier_partner: 'Delhivery',
      }),
    });
    if (!upd.ok) console.error('[delhivery/create-shipment] Supabase update failed', await upd.text());

    res.status(200).json({ ok: true, awb: result.awb, tracking_url: result.tracking_url, weight_g: totalWeight });
  } catch (e) {
    console.error('[delhivery/create-shipment]', e.message);
    res.status(500).json({ error: e.message });
  }
};
module.exports.config = { api: { bodyParser: true } };
