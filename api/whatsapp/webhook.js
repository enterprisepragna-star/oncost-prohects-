// POST /api/whatsapp/webhook
// AiSensy sends inbound customer messages here. Configure this URL in AiSensy Dashboard → Webhooks.
// Welcome chatbot flow: 1️⃣ Browse 2️⃣ Bulk enquiry 3️⃣ Track order 4️⃣ Talk to human

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    // AiSensy may probe with GET for verification — respond 200
    res.status(200).send('ok'); return;
  }
  if (req.method !== 'POST') { res.status(405).send('POST only'); return; }

  const SUPABASE_URL    = process.env.SUPABASE_URL;
  const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SITE_URL        = process.env.SITE_URL || 'https://www.oncost.shop';
  const INTERNAL_KEY    = process.env.INTERNAL_API_KEY;

  const body = req.body || {};
  // AiSensy webhook payload (varies — we read the common shape)
  const from    = (body.waId || body.from || body.phone || '').replace(/[^0-9]/g, '');
  const message = (body.text || body.message || body.body || '').trim();
  if (!from || !message) { res.status(200).json({ ok: true, skipped: true }); return; }

  // 1. Log conversation in Supabase (best-effort)
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_logs`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          direction: 'inbound',
          phone: from,
          message,
          payload: body,
        }),
      });
    } catch { /* ignore log errors */ }
  }

  // 2. Determine bot response based on user message
  const lower = message.toLowerCase();
  let reply, type = 'custom', templateName = 'oncost_chatbot_reply', templateParams = [];

  if (/^(hi|hello|hey|menu|start|namaste|hola)/i.test(lower) || lower === '0') {
    reply = `Welcome to ONCOST 🌸\n\nHow can we help today?\n\n1️⃣ Browse catalog\n2️⃣ Bulk gifting enquiry\n3️⃣ Track your order\n4️⃣ Talk to a human\n\nReply with the number.`;
  } else if (lower === '1' || /browse|catalog|shop/.test(lower)) {
    reply = `🛍️ Explore our collections:\n\n${SITE_URL}/products.html\n\nReturn gifts, brass keepsakes, thambulam sets — all curated for every celebration. Need a recommendation? Reply with the occasion (wedding / pooja / birthday / corporate).`;
  } else if (lower === '2' || /bulk|enquir/.test(lower)) {
    reply = `💝 Tell us about your event and we'll craft a custom gifting package within 24 hours.\n\n📝 Quick form: ${SITE_URL}/bulk.html\n\nOr just reply here with:\n• Event type\n• Quantity (50+ pieces)\n• Date\n• Budget per piece`;
  } else if (lower === '3' || /track|order/.test(lower)) {
    reply = `📦 Please share your Order ID (starts with OC-) and we'll check the status.`;
  } else if (/^OC-/i.test(message.trim())) {
    // Try fetching order status from Supabase
    const orderId = message.trim();
    let status = null;
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?ccavenue_order_id=eq.${encodeURIComponent(orderId)}&select=status,total_amount,created_at`, {
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        });
        const arr = await r.json();
        if (Array.isArray(arr) && arr[0]) status = arr[0];
      } catch { /* ignore */ }
    }
    if (status) {
      reply = `📦 Order ${orderId}\nStatus: ${status.status}\nAmount: ₹${status.total_amount}\nPlaced: ${new Date(status.created_at).toLocaleDateString('en-IN')}\n\nView full details: ${SITE_URL}/account.html`;
    } else {
      reply = `We could not find order ${orderId}. Please double-check the ID, or reply "4" to talk to our team.`;
    }
  } else if (lower === '4' || /human|agent|help|team|support/.test(lower)) {
    reply = `🙏 Our team will reach out to you within business hours (10am-7pm IST). For urgent queries call us on +91 90594 24167.`;
    // Also create a lead
    if (SUPABASE_URL && SERVICE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: 'POST',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ summary: `WhatsApp escalation from ${from}: ${message}` }),
        });
      } catch { /* ignore */ }
    }
  } else {
    reply = `I didn't quite catch that 🌼\n\nReply with:\n1️⃣ Browse catalog\n2️⃣ Bulk enquiry\n3️⃣ Track order\n4️⃣ Talk to human\n\nOr type "menu" to start over.`;
  }

  // 3. Send the bot reply via our /api/whatsapp/send endpoint
  try {
    await fetch(`${SITE_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(INTERNAL_KEY ? { 'x-internal-key': INTERNAL_KEY } : {}),
      },
      body: JSON.stringify({
        type: 'custom',
        campaignName: templateName,
        to: from,
        params: { customer_name: 'there', template_params: [reply] },
      }),
    });
  } catch { /* ignore */ }

  // Log outbound too
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_logs`, {
        method: 'POST',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ direction: 'outbound', phone: from, message: reply }),
      });
    } catch { /* ignore */ }
  }

  res.status(200).json({ ok: true });
};

module.exports.config = { api: { bodyParser: true } };
