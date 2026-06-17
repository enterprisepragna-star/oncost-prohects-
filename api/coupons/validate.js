module.exports = async function handler(req, res) {
  // Add CORS headers so the storefront can call this
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '').replace(/^(?!https?:\/\/)/, 'https://');
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SERVICE_KEY) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  const { code, cartSubtotal } = req.body || {};

  if (!code) {
    res.status(400).json({ valid: false, error: 'Coupon code is required' });
    return;
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/coupons?code=ilike.${encodeURIComponent(code)}&select=*&limit=1`;
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await r.text();
    let rows;
    try {
      rows = JSON.parse(responseText);
    } catch(e) {
      console.error('Invalid JSON from Supabase:', responseText);
      res.status(500).json({ valid: false, error: 'Database connection error on Live Server. Double check your Vercel Environment Variables.' });
      return;
    }

    if (!r.ok || !rows || rows.length === 0 || !Array.isArray(rows)) {
      res.status(404).json({ valid: false, error: 'Invalid coupon code' });
      return;
    }

    const data = rows[0];

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      res.status(400).json({ valid: false, error: 'This coupon has expired' });
      return;
    }

    if (data.usage_limit && data.used_count >= data.usage_limit) {
      res.status(400).json({ valid: false, error: 'Coupon usage limit reached' });
      return;
    }

    if (cartSubtotal && data.min_order_value && Number(cartSubtotal) < Number(data.min_order_value)) {
      res.status(400).json({ valid: false, error: `Minimum order of ₹${data.min_order_value} required` });
      return;
    }

    res.status(200).json({
      valid: true,
      coupon: {
        id: data.id,
        code: data.code,
        discount_amount: data.discount_amount,
        min_order_value: data.min_order_value
      }
    });

  } catch (err) {
    console.error('Coupon validation error:', err);
    res.status(500).json({ valid: false, error: 'Server error validating coupon: ' + String(err.message || err) });
  }
}
