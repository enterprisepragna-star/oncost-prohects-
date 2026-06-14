// POST /api/delhivery/schedule-pickup
// Body: { pickup_date: "YYYY-MM-DD", pickup_time?: "HH:MM:SS", expected_package_count?: number }
// Header: x-admin-key
const { schedulePickup } = require('./lib/client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const ADMIN_KEY = process.env.ADMIN_RECOVERY_KEY;
  if (!ADMIN_KEY)                              return res.status(500).json({ error: 'ADMIN_RECOVERY_KEY not set' });
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const { pickup_date, pickup_time, expected_package_count } = req.body || {};
  if (!pickup_date) return res.status(400).json({ error: 'pickup_date required (YYYY-MM-DD)' });

  try {
    const result = await schedulePickup({ pickup_date, pickup_time, expected_package_count });
    res.status(200).json(result);
  } catch (e) {
    console.error('[delhivery/schedule-pickup]', e.message);
    res.status(500).json({ error: e.message });
  }
};
module.exports.config = { api: { bodyParser: true } };
