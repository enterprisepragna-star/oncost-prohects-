// GET /api/delhivery/label?awb=XXXXX — streams the PDF shipping label from Delhivery
const { BASE } = require('./lib/client');

module.exports = async function handler(req, res) {
  const awb = req.query.awb;
  const TOKEN = (process.env.DELHIVERY_TOKEN || '').trim();
  if (!awb)   return res.status(400).json({ error: 'awb required' });
  if (!TOKEN) return res.status(500).json({ error: 'DELHIVERY_TOKEN missing' });
  try {
    const r = await fetch(`${BASE}/api/p/packing_slip?wbns=${encodeURIComponent(awb)}&pdf=true`, {
      headers: { Authorization: `Token ${TOKEN}` },
    });
    if (!r.ok) return res.status(r.status).json({ error: `Delhivery label HTTP ${r.status}` });

    // Delhivery returns JSON with packages[0].pdf_download_link, OR direct PDF bytes
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/pdf')) {
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="label-${awb}.pdf"`);
      return res.status(200).send(buf);
    }
    const data = await r.json();
    const link = data?.packages?.[0]?.pdf_download_link || data?.pdf_download_link;
    if (link) return res.redirect(302, link);
    res.status(500).json({ error: 'No label URL returned', raw: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
module.exports.config = { api: { bodyParser: true } };
