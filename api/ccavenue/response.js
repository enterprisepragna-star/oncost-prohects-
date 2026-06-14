// POST /api/ccavenue/response
// CCAvenue posts here with `encResp` (encrypted payload).
// We decrypt → UPSERT order row → redirect to /thank-you.html with order_id.
//
// UPSERT logic: PATCH by ccavenue_order_id; if 0 rows matched (i.e. pre-insert failed),
// INSERT a new row using the decrypted payload as the only source of truth.

const { decrypt, parseResponse } = require('./lib/ccavenue-crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') { res.status(405).send('Method Not Allowed'); return; }

  const WORKING_KEY  = (process.env.CCAVENUE_WORKING_KEY || '').trim();
  const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
  const SERVICE_KEY  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const SITE_URL     = (process.env.SITE_URL || `https://${req.headers.host}`).trim();

  if (!WORKING_KEY) {
    console.error('[ccavenue/response] Missing CCAVENUE_WORKING_KEY');
    res.status(500).send('CCAvenue Working Key not configured.'); return;
  }

  const encResp = (req.body && req.body.encResp) || (req.query && req.query.encResp);
  if (!encResp) {
    console.error('[ccavenue/response] No encResp in payload. body=', JSON.stringify(req.body), 'query=', JSON.stringify(req.query));
    res.redirect(302, `${SITE_URL}/thank-you.html?status=invalid&reason=no_payload`);
    return;
  }

  let data = {};
  try {
    const plaintext = decrypt(String(encResp), WORKING_KEY);
    data = parseResponse(plaintext);
    console.log('[ccavenue/response] Decrypted payload:', JSON.stringify({ ...data, card_name: undefined, billing_email: data.billing_email }));
  } catch (err) {
    console.error('[ccavenue/response] Decrypt failed:', err.message);
    res.redirect(302, `${SITE_URL}/thank-you.html?status=invalid&reason=decrypt_failed`);
    return;
  }

  const orderId    = data.order_id;
  const ccStatus   = (data.order_status || '').toLowerCase();   // success | aborted | failure
  const trackingId = data.tracking_id;
  const amount     = data.amount;
  const failureMsg = data.failure_message || '';
  const paymentMode = data.payment_mode || '';

  // Map CCAvenue status → our internal status
  let dbStatus = 'Processing';
  let payStatus = 'Pending';
  if (ccStatus === 'success')        { dbStatus = 'Paid';      payStatus = 'Paid'; }
  else if (ccStatus === 'aborted')   { dbStatus = 'Cancelled'; payStatus = 'Cancelled'; }
  else if (ccStatus === 'failure')   { dbStatus = 'Failed';    payStatus = 'Failed'; }

  console.log(`[ccavenue/response] order=${orderId} status=${ccStatus}→${dbStatus} tracking=${trackingId} amount=${amount}`);

  // ============= UPSERT INTO SUPABASE =============
  let orderRow = null;
  if (SUPABASE_URL && SERVICE_KEY && orderId) {
    const commonFields = {
      status: dbStatus,
      payment_status: payStatus,
      payment_method: paymentMode || 'CCAvenue',
      payment_tracking_id: trackingId || null,
      payment_response: { ...data },
    };

    try {
      // 1️⃣ PATCH (update existing row created by /initiate)
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?ccavenue_order_id=eq.${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(commonFields),
      });
      const patched = await patchRes.json();
      if (Array.isArray(patched) && patched[0]) {
        orderRow = patched[0];
        console.log(`[ccavenue/response] PATCH ok rows=${patched.length} id=${orderRow.id} invoice=${orderRow.invoice_number}`);
      } else {
        console.warn(`[ccavenue/response] PATCH returned no rows for order_id=${orderId}. Attempting INSERT (recovery path).`);

        // 2️⃣ INSERT (recovery) — pre-insert was missing, create a minimal order from CCAvenue payload
        const minimalShip = {
          name:    data.billing_name    || '',
          email:   data.billing_email   || '',
          phone:   data.billing_tel     || '',
          address: data.billing_address || '',
          city:    data.billing_city    || '',
          state:   data.billing_state   || '',
          zip:     data.billing_zip     || '',
          country: data.billing_country || 'India',
        };
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            user_id: null,
            ccavenue_order_id: orderId,
            items: [],          // unknown — admin can add manually if needed
            total_amount: Number(amount || 0),
            items_subtotal: Number(amount || 0),
            shipping_amount: 0,
            discount_amount: 0,
            guest_email: minimalShip.email,
            guest_phone: minimalShip.phone,
            shipping_address: minimalShip,
            ...commonFields,
          }),
        });
        const ins = await insertRes.json();
        if (Array.isArray(ins) && ins[0]) {
          orderRow = ins[0];
          console.log(`[ccavenue/response] INSERT (recovery) ok id=${orderRow.id} invoice=${orderRow.invoice_number}`);
        } else {
          console.error('[ccavenue/response] INSERT recovery failed:', JSON.stringify(ins));
        }
      }
    } catch (e) {
      console.error('[ccavenue/response] Supabase upsert exception:', e.message);
    }
  } else {
    console.error('[ccavenue/response] Skipping DB write — Supabase env or order_id missing.');
  }

  // ============= AUTO-CREATE DELHIVERY AWB ON PAID =============
  if (dbStatus === 'Paid' && orderRow && !orderRow.awb_number && process.env.DELHIVERY_TOKEN) {
    const ADMIN_KEY = process.env.ADMIN_RECOVERY_KEY;
    fetch(`${SITE_URL}/api/delhivery/create-shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY || '' },
      body: JSON.stringify({ order_id: orderRow.id }),
    }).then(r => r.json()).then(j => {
      console.log('[ccavenue/response] AWB auto-create result:', JSON.stringify(j));
    }).catch(err => console.error('[ccavenue/response] AWB auto-create failed:', err.message));
  }

  // ============= FIRE-AND-FORGET WHATSAPP CONFIRM =============
  if (dbStatus === 'Paid' && orderRow) {
    const INTERNAL_KEY = process.env.INTERNAL_API_KEY;
    const phone = orderRow.guest_phone || (orderRow.shipping_address && orderRow.shipping_address.phone);
    const name  = (orderRow.shipping_address && orderRow.shipping_address.name) || 'Customer';
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
      }).catch(err => console.error('[ccavenue/response] WhatsApp confirm failed:', err.message));
    }
  }

  // ============= REDIRECT TO THANK-YOU =============
  const params = new URLSearchParams({
    status: ccStatus,
    order_id: orderId || '',
    tracking_id: trackingId || '',
    amount: amount || '',
  }).toString();
  res.redirect(302, `${SITE_URL}/thank-you.html?${params}`);
};

module.exports.config = { api: { bodyParser: true } };
