// POST /api/ccavenue/response
// CCAvenue posts back to this endpoint with `encResp` (encrypted payload).
// We decrypt, verify, update Supabase order, redirect to thank-you / failure page.

const { decrypt, parseResponse } = require('./lib/ccavenue-crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') { res.status(405).send('Method Not Allowed'); return; }

  const MERCHANT_ID = (process.env.CCAVENUE_MERCHANT_ID || '').trim();
  const ACCESS_CODE = (process.env.CCAVENUE_ACCESS_CODE || '').trim();
  const WORKING_KEY = (process.env.CCAVENUE_WORKING_KEY || '').trim();
  const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
  const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const SITE_URL     = process.env.SITE_URL || `https://${req.headers.host}`;

  if (!WORKING_KEY) {
    res.status(500).send('CCAvenue Working Key not configured.'); return;
  }

  // Vercel parses POST form bodies automatically when content-type is form-urlencoded
  const encResp = (req.body && req.body.encResp) || (req.query && req.query.encResp);
  if (!encResp) {
    res.redirect(302, `${SITE_URL}/thank-you.html?status=invalid`);
    return;
  }

  let data = {};
  try {
    const plaintext = decrypt(String(encResp), WORKING_KEY);
    data = parseResponse(plaintext);
  } catch (err) {
    res.redirect(302, `${SITE_URL}/thank-you.html?status=invalid`);
    return;
  }

  const orderId    = data.order_id;
  const status     = (data.order_status || '').toLowerCase();   // success | aborted | failure
  const trackingId = data.tracking_id;
  const amount     = data.amount;
  const failureMsg = data.failure_message || '';

  // Map CCAvenue status → our order status
  let dbStatus = 'Processing';
  if (status === 'success')        dbStatus = 'Paid';
  else if (status === 'aborted')   dbStatus = 'Cancelled';
  else if (status === 'failure')   dbStatus = 'Failed';

  // Update Supabase order if credentials present
  let orderRow = null;
  if (SUPABASE_URL && SERVICE_KEY && orderId) {
    try {
      const upd = await fetch(`${SUPABASE_URL}/rest/v1/orders?ccavenue_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          status: dbStatus,
          payment_tracking_id: trackingId || null,
          payment_response: { status, amount, failure_message: failureMsg, raw: data },
        }),
      });
      const arr = await upd.json();
      if (Array.isArray(arr) && arr[0]) orderRow = arr[0];
    } catch (e) {
      console.error('Supabase order update failed:', e.message);
    }
  }

  // Fire-and-forget WhatsApp order confirmation on payment success
  if (dbStatus === 'Paid' && orderRow) {
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY;
    const phone = orderRow.guest_phone || orderRow.shipping_address?.phone;
    const name  = orderRow.shipping_address?.name || 'Customer';
    if (phone) {
      fetch(`${SITE_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(INTERNAL_KEY ? { 'x-internal-key': INTERNAL_KEY } : {}) },
        body: JSON.stringify({
          type: 'order_confirm',
          to: phone,
          params: {
            customer_name: name,
            order_id: orderId,
            amount: String(amount || orderRow.total_amount || ''),
            tracking_url: `${SITE_URL}/account.html?tab=orders`,
          },
        }),
      }).catch(err => console.error('WhatsApp confirm failed:', err.message));
    }
  }

  // Redirect to thank-you page with status (no secrets in URL)
  const params = new URLSearchParams({
    status,
    order_id: orderId || '',
    tracking_id: trackingId || '',
    amount: amount || '',
  }).toString();
  res.redirect(302, `${SITE_URL}/thank-you.html?${params}`);
};

// Tell Vercel to parse form-urlencoded body
module.exports.config = { api: { bodyParser: true } };
