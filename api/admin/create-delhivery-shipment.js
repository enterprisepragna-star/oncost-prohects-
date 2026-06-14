const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jyvmmypalshebqmnrdma.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_RECOVERY_KEY = process.env.ADMIN_RECOVERY_KEY || '';

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const DELHIVERY_PICKUP_LOCATION = process.env.DELHIVERY_PICKUP_LOCATION || 'Main Office';
const DELHIVERY_API_URL = 'https://track.delhivery.com/api/cmu/create.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate Admin
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== ADMIN_RECOVERY_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin key.' });
  }

  if (!DELHIVERY_API_KEY) {
    return res.status(400).json({ error: 'Delhivery API Key is not configured in Vercel.' });
  }

  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // 1. Fetch Order from Supabase
    const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', order_id).single();
    if (fetchErr || !order) throw new Error('Order not found');

    const ship = order.shipping_address || {};
    if (!ship.name || !ship.zip || !ship.address || !ship.phone) {
      throw new Error('Incomplete shipping address in order. Name, zip, address, and phone are required.');
    }

    if (ship.tracking_url) {
      throw new Error('This order already has a Tracking URL assigned.');
    }

    // 2. Prepare Delhivery Payload
    const items = Array.isArray(order.items) ? order.items : (order.items?.items || []);
    const productsDesc = items.map(i => `${i.name} (x${i.qty || i.quantity || 1})`).join(', ').substring(0, 200);

    const payload = {
      format: 'json',
      data: {
        shipments: [
          {
            name: ship.name,
            add: ship.address,
            pin: ship.zip,
            city: ship.city || 'Unknown',
            state: ship.state || 'Unknown',
            country: ship.country || 'India',
            phone: ship.phone,
            order: order.ccavenue_order_id || order.id,
            payment_mode: "Pre-paid",
            products_desc: productsDesc || 'E-commerce Goods',
            total_amount: order.total_amount || 0,
            quantity: items.length || 1,
            weight: 500, // Default weight (grams), can be dynamic if available
          }
        ],
        pickup_location: {
          name: DELHIVERY_PICKUP_LOCATION
        }
      }
    };

    // Delhivery expects POST format=json&data={JSON} URL Encoded
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append('format', 'json');
    urlEncodedData.append('data', JSON.stringify(payload.data));

    // 3. Send to Delhivery
    const delhiveryRes = await fetch(DELHIVERY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DELHIVERY_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: urlEncodedData.toString()
    });

    const delhiveryJson = await delhiveryRes.json();
    console.log("Delhivery Response:", JSON.stringify(delhiveryJson));

    if (!delhiveryRes.ok || !delhiveryJson.success) {
      const errMsg = delhiveryJson.error?.message || delhiveryJson.rmk || 'Delhivery API failed to create shipment.';
      throw new Error(`Delhivery Error: ${errMsg}`);
    }

    // 4. Extract AWB and save to Supabase
    const packageInfo = delhiveryJson.packages?.[0];
    if (!packageInfo || !packageInfo.waybill) {
      throw new Error('Delhivery succeeded but did not return a Waybill (AWB) number.');
    }

    const awb = packageInfo.waybill;
    const trackingUrl = `https://www.delhivery.com/track/package/${awb}`;

    // Update Supabase
    const updatedShip = { ...ship, tracking_url: trackingUrl };
    const { error: updateErr } = await supabase.from('orders').update({ shipping_address: updatedShip, status: 'Packed' }).eq('id', order_id);
    if (updateErr) throw new Error('Failed to save tracking URL to database');

    return res.status(200).json({ success: true, awb, tracking_url: trackingUrl });

  } catch (err) {
    console.error('Delhivery Shipment Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
