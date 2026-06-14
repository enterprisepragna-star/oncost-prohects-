module.exports = async function handler(req, res) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
    if (uErr) return res.json({ error: uErr });
    const user = users.users.find(u => u.email === 'sreekar092004@gmail.com');
    if (!user) return res.json({ error: 'User not found' });

    const orderData = {
      user_id: user.id,
      ccavenue_order_id: 'OC-1781335116391-1160',
      payment_tracking_id: '114577334122',
      total_amount: 378.00,
      status: 'Paid',
      payment_status: 'Success',
      payment_method: 'CCAvenue',
      guest_email: 'sreekar092004@gmail.com',
      guest_phone: '9999999999',
      shipping_address: { name: "Recovered Order", email: "sreekar092004@gmail.com", address: "Recovered from Screenshot" },
      items: [{ name: "Recovered CCAvenue Order", qty: 1, price: 378.00 }]
    };

    const { data, error } = await supabase.from('orders').upsert(orderData, { onConflict: 'ccavenue_order_id' });
    if (error) return res.json({ error });

    res.json({ success: true, user_id: user.id, data });
  } catch (err) {
    res.json({ catch_error: err.message });
  }
};
