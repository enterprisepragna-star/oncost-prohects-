// POST /api/admin/recover-order
// Manually create / upsert an order from CCAvenue Order Lookup data.
// Use this to backfill orders missed because the webhook fired before the
// schema was patched.
//
// Auth: requires header `x-admin-key` matching env var ADMIN_RECOVERY_KEY
//        (set this in Vercel env to any random secret).
//
// Body: {
//   order_id:           string  // CCAvenue order_id e.g. "OC-1781110752895-6373"
//   tracking_id?:       string  // CCAvenue Ref. # e.g. "114571273239"
//   amount:             number
//   status?:            string  // "Paid" (default) | "Failed" | "Cancelled"
//   guest_email?:       string
//   guest_phone?:       string
//   shipping_address?:  object
//   items?:             array
//   notes?:             string
// }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_KEY    = process.env.ADMIN_RECOVERY_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    res.status(500).json({ error: 'Supabase not configured.' });
    return;
  }
  if (!ADMIN_KEY) {
    res.status(500).json({ error: 'ADMIN_RECOVERY_KEY not configured in env.' });
    return;
  }

  const providedKey = req.headers['x-admin-key'] || (req.body && req.body.admin_key);
  if (providedKey !== ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized — invalid x-admin-key header.' });
    return;
  }

  const b = req.body || {};
  const orderId = b.order_id;
  if (!orderId) { res.status(400).json({ error: 'order_id required' }); return; }

  const amount = Number(b.amount || 0);
  if (amount <= 0) { res.status(400).json({ error: 'Valid amount required' }); return; }

  const status = b.status || 'Paid';
  const payStatus = status === 'Paid' ? 'Paid' : (status === 'Cancelled' ? 'Cancelled' : status === 'Failed' ? 'Failed' : 'Pending');

  const row = {
    user_id: null,
    ccavenue_order_id: orderId,
    items: Array.isArray(b.items) ? b.items : [],
    total_amount: amount,
    items_subtotal: amount,
    shipping_amount: 0,
    discount_amount: 0,
    guest_email: b.guest_email || null,
    guest_phone: b.guest_phone || null,
    shipping_address: b.shipping_address || {},
    status,
    payment_status: payStatus,
    payment_method: 'CCAvenue',
    payment_tracking_id: b.tracking_id || null,
    payment_response: {
      recovered: true,
      recovered_at: new Date().toISOString(),
      notes: b.notes || 'Manually recovered from CCAvenue dashboard',
      order_status: status.toLowerCase(),
      amount: String(amount),
      tracking_id: b.tracking_id || '',
    },
  };

  try {
    // Try INSERT; on UNIQUE conflict (ccavenue_order_id), do PATCH instead.
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify(row),
    });

    if (insertRes.ok) {
      const arr = await insertRes.json();
      res.status(200).json({ ok: true, order: Array.isArray(arr) ? arr[0] : arr, action: 'upserted' });
      return;
    }

    // If non-OK, attempt explicit PATCH
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?ccavenue_order_id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    });
    if (patchRes.ok) {
      const arr = await patchRes.json();
      res.status(200).json({ ok: true, order: Array.isArray(arr) ? arr[0] : arr, action: 'patched' });
      return;
    }
    const errTxt = await patchRes.text();
    res.status(500).json({ error: 'Recovery failed', details: errTxt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.config = { api: { bodyParser: true } };
