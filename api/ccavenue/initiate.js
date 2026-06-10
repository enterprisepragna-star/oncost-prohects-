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

  // Auto-submitting form (CCAvenue requires POST to checkout endpoint)
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Redirecting to CCAvenue…</title>
<style>body{font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;background:#7a1f35;color:#f2dd92;text-align:center;padding:24px;}.s{width:34px;height:34px;border:3px solid currentColor;border-bottom-color:transparent;border-radius:50%;animation:r 0.8s linear infinite;margin-bottom:14px;}@keyframes r{to{transform:rotate(360deg)}}</style></head>
<body>
  <div class="s"></div>
  <h2 style="font-family:Georgia,serif;margin:0 0 6px;">Redirecting to secure payment</h2>
  <p style="opacity:.8;margin:0;">Powered by CCAvenue · Order ${orderId} · ₹${amount}</p>
  <form id="f" method="post" action="${CCAV_URL[ENV] || CCAV_URL.test}">
    <input type="hidden" name="encRequest" value="${ciphertext}" />
    <input type="hidden" name="access_code" value="${ACCESS_CODE}" />
  </form>
  <script>document.getElementById('f').submit();</script>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
