// GET /api/whatsapp/abandoned-cart-cron
// Daily cron (Vercel cron via vercel.json) — finds carts > 24h old, sends WhatsApp recovery message.
// Only triggers if cart_items exist for users with phones set in profiles.

module.exports = async function handler(req, res) {
  // Only allow GET from Vercel cron
  const CRON_SECRET = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  if (CRON_SECRET && !auth.includes(CRON_SECRET)) {
    res.status(401).send('Unauthorized'); return;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SITE_URL     = process.env.SITE_URL || 'https://www.oncost.shop';
  const INTERNAL_KEY = process.env.INTERNAL_API_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) { res.status(500).json({ error: 'Supabase not configured' }); return; }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const beforeToday = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(); // older than 12h

  try {
    // Fetch cart_items + joined product info + user profile (with phone)
    const r = await fetch(`${SUPABASE_URL}/rest/v1/cart_items?select=user_id,qty,product_id,created_at&created_at=lt.${beforeToday}&created_at=gt.${since}`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    });
    const items = await r.json();
    if (!Array.isArray(items) || !items.length) { res.status(200).json({ ok: true, processed: 0, message: 'No abandoned carts in window' }); return; }

    // Group by user
    const byUser = {};
    items.forEach(it => {
      byUser[it.user_id] = byUser[it.user_id] || { items: [], oldest: it.created_at };
      byUser[it.user_id].items.push(it);
      if (it.created_at < byUser[it.user_id].oldest) byUser[it.user_id].oldest = it.created_at;
    });

    let sent = 0, skipped = 0;
    for (const userId of Object.keys(byUser)) {
      // Fetch profile (phone + name)
      const pr = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=name,phone`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const profiles = await pr.json();
      const profile = Array.isArray(profiles) && profiles[0];
      if (!profile?.phone) { skipped++; continue; }

      // Compute approx cart value
      const itemIds = byUser[userId].items.map(i => `"${i.product_id}"`).join(',');
      const pp = await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.(${encodeURIComponent(itemIds)})&select=id,price,offer_price`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const products = await pp.json();
      let cartValue = 0;
      byUser[userId].items.forEach(it => {
        const p = products.find(x => x.id === it.product_id);
        if (!p) return;
        const eff = (p.offer_price && p.offer_price < p.price) ? p.offer_price : p.price;
        cartValue += Number(eff || 0) * Number(it.qty || 1);
      });
      if (cartValue <= 0) { skipped++; continue; }

      // Skip if we already sent within last 5 days
      const dedupe = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_logs?phone=eq.${encodeURIComponent(profile.phone.replace(/[^0-9]/g,''))}&direction=eq.outbound&message=like.*abandoned*&created_at=gt.${new Date(Date.now() - 5*86400000).toISOString()}`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      });
      const recent = await dedupe.json();
      if (Array.isArray(recent) && recent.length) { skipped++; continue; }

      // Send via our /api/whatsapp/send
      try {
        await fetch(`${SITE_URL}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(INTERNAL_KEY ? { 'x-internal-key': INTERNAL_KEY } : {}) },
          body: JSON.stringify({
            type: 'abandoned_cart',
            to: profile.phone,
            params: {
              customer_name: profile.name || 'there',
              cart_value: Math.round(cartValue).toLocaleString('en-IN'),
              recovery_url: `${SITE_URL}/cart.html`,
            },
          }),
        });
        // Log
        await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_logs`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ direction: 'outbound', phone: profile.phone, message: `abandoned_cart sent · ₹${cartValue}` }),
        });
        sent++;
      } catch { skipped++; }
    }

    res.status(200).json({ ok: true, sent, skipped, totalCarts: Object.keys(byUser).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
