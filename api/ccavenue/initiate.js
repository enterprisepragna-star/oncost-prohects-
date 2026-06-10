// POST /api/ccavenue/initiate
// Body: { items, total_amount, shipping_address: {name,email,phone,address,city,state,zip}, user_id, applied_coupon }
// Returns: HTML auto-submitting form that posts to CCAvenue (browser is redirected here)

const { encrypt, buildMerchantData } = require('./lib/ccavenue-crypto');

const CCAV_URL = {
  test:       'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  production: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

  const MERCHANT_ID = (process.env.CCAVENUE_MERCHANT_ID || '').trim();
  const ACCESS_CODE = (process.env.CCAVENUE_ACCESS_CODE || '').trim();
  const WORKING_KEY = (process.env.CCAVENUE_WORKING_KEY || '').trim();
  const ENV         = (process.env.CCAVENUE_ENV || 'test').trim().toLowerCase();
  const SITE_URL    = (process.env.SITE_URL || `https://${req.headers.host}`).trim();

  if (!MERCHANT_ID || !ACCESS_CODE || !WORKING_KEY) {
    res.status(500).json({ error: 'CCAvenue not configured. Set CCAVENUE_MERCHANT_ID / ACCESS_CODE / WORKING_KEY env vars in Vercel.' });
    return;
  }

  const body = req.body || {};
  const orderId      = body.order_id || `OC-${Date.now()}-${Math.floor(Math.random()*9999)}`;
  const amount       = Number(body.total_amount || 0).toFixed(2);
  const ship         = body.shipping_address || {};
  const merchantData = body.merchant_data || '';

  if (Number(amount) <= 0) { res.status(400).json({ error: 'Invalid amount' }); return; }
  if (!ship.email || !ship.name || !ship.phone) { res.status(400).json({ error: 'Missing customer email / name / phone' }); return; }

  const payload = {
    merchant_id:      MERCHANT_ID,
    order_id:         orderId,
    amount,
    currency:         'INR',
    redirect_url:     `${SITE_URL}/api/ccavenue/response`,
    cancel_url:       `${SITE_URL}/api/ccavenue/response`,
    language:         'EN',
    billing_name:     ship.name,
    billing_address:  ship.address || '',
    billing_city:     ship.city || '',
    billing_state:    ship.state || '',
    billing_zip:      ship.zip || '',
    billing_country:  ship.country || 'India',
    billing_tel:      ship.phone,
    billing_email:    ship.email,
    delivery_name:    ship.name,
    delivery_address: ship.address || '',
    delivery_city:    ship.city || '',
    delivery_state:   ship.state || '',
    delivery_zip:     ship.zip || '',
    delivery_country: ship.country || 'India',
    delivery_tel:     ship.phone,
    merchant_param1:  body.user_id || 'guest',
    merchant_param2:  merchantData.substring(0, 250),    // arbitrary metadata
    merchant_param3:  body.applied_coupon || '',
  };

  const plaintext  = buildMerchantData(payload);
  const ciphertext = encrypt(plaintext, WORKING_KEY);

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>CCAvenue Debug</title>
<style>body{font-family:system-ui;margin:0;background:#f9f9f9;color:#333;padding:40px;text-align:center;}</style></head>
<body>
  <h2>CCAvenue Debug Mode</h2>
  <p><strong>Environment:</strong> ${ENV}</p>
  <p><strong>Target URL:</strong> ${CCAV_URL[ENV] || CCAV_URL.test}</p>
  <p><strong>Access Code:</strong> ${ACCESS_CODE} (Length: ${ACCESS_CODE.length})</p>
  <p><strong>Merchant ID:</strong> ${MERCHANT_ID}</p>
  <form id="f" method="post" action="${CCAV_URL[ENV] || CCAV_URL.test}">
    <input type="hidden" name="encRequest" value="${ciphertext}" />
    <input type="hidden" name="access_code" value="${ACCESS_CODE}" />
    <button type="submit" style="padding:12px 24px;background:#7a1f35;color:#fff;border:none;border-radius:6px;font-size:16px;cursor:pointer;margin-top:20px;">Submit Payment to CCAvenue</button>
  </form>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
