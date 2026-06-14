// POST /api/email/send
// Unified email dispatcher via Resend.
// Auth: x-admin-key OR called internally from other API routes
// Body: { type, to, data }
//   types: enquiry_admin_notify | order_confirm | order_shipped | testimonial_request | custom

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  const RESEND_API_KEY  = (process.env.RESEND_API_KEY  || '').trim();
  const FROM_EMAIL      = (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').trim();
  const REPLY_TO        = (process.env.RESEND_REPLY_TO || '').trim();
  const ADMIN_EMAIL     = (process.env.ADMIN_EMAIL || 'enterprisepragna@gmail.com').trim();
  const ADMIN_KEY       = process.env.ADMIN_RECOVERY_KEY;
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY missing in Vercel env' });

  // Allow internal calls (no key check) OR admin key
  const isAdmin = req.headers['x-admin-key'] === ADMIN_KEY;
  const isInternal = req.headers['x-internal'] === '1';
  if (!isAdmin && !isInternal) {
    // Public endpoint = enquiry-only (used by storefront contact form)
    if (req.body?.type !== 'enquiry_admin_notify') return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type = 'custom', to, data = {} } = req.body || {};
  let subject = '', html = '', recipient = to;

  switch (type) {
    case 'enquiry_admin_notify':
      recipient = ADMIN_EMAIL;
      subject = `🔔 New enquiry from ${data.name || 'a customer'}`;
      html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fdfaf3;">
        <div style="background:#7a1f35;color:#f2dd92;padding:18px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-family:Georgia,serif;">New Enquiry</h2>
          <p style="margin:4px 0 0;opacity:.85;font-size:13px;">${new Date().toLocaleString('en-IN')}</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e8e0d2;border-top:none;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#7a726b;width:120px;">Name:</td><td><strong>${(data.name||'—')}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;">Email:</td><td><a href="mailto:${(data.email||'')}">${(data.email||'—')}</a></td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;">Phone:</td><td><a href="tel:${(data.phone||'')}">${(data.phone||'—')}</a></td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;">Event:</td><td>${(data.event||'—')}</td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;">Date:</td><td>${(data.date||'—')}</td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;">Quantity:</td><td>${(data.qty||'—')}</td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;">Budget:</td><td><strong>${data.budget?'₹'+data.budget:'—'}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#7a726b;vertical-align:top;">Message:</td><td style="white-space:pre-wrap;background:#fdfaf3;padding:10px;border-radius:6px;">${(data.message||'—')}</td></tr>
          </table>
          <div style="margin-top:18px;display:flex;gap:10px;">
            <a href="https://www.oncost.shop/admin-dashboard.html#leads" style="background:#7a1f35;color:#f2dd92;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">Open in Admin →</a>
            ${data.phone ? `<a href="https://wa.me/${(data.phone||'').replace(/[^\d]/g,'').replace(/^0+/,'91')}" style="background:#25D366;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;">WhatsApp customer</a>` : ''}
          </div>
        </div>
      </div>`;
      break;

    case 'order_confirm':
      subject = `✓ Order confirmed · ${data.order_id || ''}`;
      html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fdfaf3;">
        <div style="background:#7a1f35;color:#f2dd92;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;">ONCOST</h1>
          <p style="margin:6px 0 0;font-size:14px;opacity:.9;">Thank you for your order!</p>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e8e0d2;border-top:none;border-radius:0 0 8px 8px;">
          <p style="font-size:15px;">Hi ${(data.name||'Customer')},</p>
          <p>Your order <strong>${(data.order_id||'')}</strong> has been confirmed. Total paid: <strong style="color:#7a1f35;">₹${(data.amount||'')}</strong></p>
          ${data.invoice_url ? `<p><a href="${data.invoice_url}" style="background:#7a1f35;color:#f2dd92;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">View Invoice →</a></p>` : ''}
          <p style="color:#7a726b;font-size:13px;margin-top:24px;">We'll send you tracking details once your order is shipped (usually within 24 hours).</p>
          <hr style="border:none;border-top:1px solid #e8e0d2;margin:24px 0;">
          <p style="font-size:12px;color:#7a726b;margin:0;">Questions? Reply to this email or visit <a href="https://www.oncost.shop/support.html" style="color:#7a1f35;">support</a>.</p>
        </div>
      </div>`;
      break;

    default:
      subject = data.subject || 'Notification from ONCOST';
      html = data.html || `<p>${(data.message || 'You have a new notification.')}</p>`;
  }

  if (!recipient) return res.status(400).json({ error: 'No recipient address' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(recipient) ? recipient : [recipient],
        subject,
        html,
        reply_to: REPLY_TO || undefined,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      console.error('[email/send] Resend error:', j);
      return res.status(500).json({ error: j.message || 'Resend send failed', detail: j });
    }
    console.log(`[email/send] type=${type} to=${recipient} id=${j.id}`);
    res.status(200).json({ ok: true, id: j.id });
  } catch (e) {
    console.error('[email/send] exception:', e.message);
    res.status(500).json({ error: e.message });
  }
};
module.exports.config = { api: { bodyParser: true } };
