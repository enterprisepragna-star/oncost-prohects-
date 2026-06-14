// GET /api/delhivery/serviceability?pickup_pincode=&drop_pincode=&weight_grams=
// Returns serviceability + shipping cost for the customer's pincode.
const { checkPincode, calculateRate, PICKUP_PINCODE } = require('./lib/client');

module.exports = async function handler(req, res) {
  try {
    const drop_pincode = req.query.drop_pincode || req.query.pincode;
    const weight_grams = Number(req.query.weight_grams || req.query.weight || 500);
    const pickup_pincode = req.query.pickup_pincode || PICKUP_PINCODE;
    if (!drop_pincode) return res.status(400).json({ error: 'drop_pincode required' });
    if (!pickup_pincode) return res.status(500).json({ error: 'Set DELHIVERY_PICKUP_PINCODE env var (your warehouse pincode)' });

    const [svc, rate] = await Promise.all([
      checkPincode(drop_pincode).catch(e => ({ serviceable: false, error: e.message })),
      calculateRate({ pickup_pincode, drop_pincode, weight_grams }).catch(e => ({ total_amount: 0, error: e.message })),
    ]);

    if (!svc.serviceable) return res.status(200).json({ serviceable: false, message: 'Delivery not available to this pincode', ...svc });

    res.status(200).json({
      serviceable: true,
      pincode: drop_pincode,
      state: svc.state,
      district: svc.district,
      shipping_amount: Math.round(rate.total_amount || 79),
      chargeable_weight_g: rate.chargeable_weight_g,
      zone: rate.zone,
      mode: 'Surface',
      cod_available: svc.cod,
    });
  } catch (e) {
    console.error('[delhivery/serviceability]', e.message);
    res.status(500).json({ error: e.message, fallback_shipping: 79 });
  }
};
module.exports.config = { api: { bodyParser: true } };
