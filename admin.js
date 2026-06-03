const ADMIN_EMAIL = 'enterprisepragna@gmail.com';

// Setup Toast Notification
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isError ? '#D32F2F' : '#2E7D32';
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

// Check Authentication
async function checkAuth() {
  if (typeof supabaseClient === 'undefined') return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) {
    window.location.href = 'admin-login.html';
  } else {
    loadAllData();
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'admin-login.html';
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  document.querySelectorAll('.admin-nav button').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

// Master Load Function
async function loadAllData() {
  await Promise.all([
    loadDashboard(),
    loadProducts(),
    loadCategories(),
    loadOrders(),
    loadCoupons(),
    loadSales(),
    loadCustomers(),
    loadLeads(),
    loadTestimonials(),
    loadSettings()
  ]);
}

// 1. Dashboard
async function loadDashboard() {
  const { data: orders } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  const { data: products } = await supabaseClient.from('products').select('*').eq('status', 'Active');
  const { data: leads } = await supabaseClient.from('leads').select('*');
  
  let revenue = 0;
  if (orders) {
    revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  }
  
  document.getElementById('metric-revenue').textContent = `₹${revenue.toLocaleString()}`;
  document.getElementById('metric-orders').textContent = orders ? orders.length : 0;
  document.getElementById('metric-products').textContent = products ? products.length : 0;
  document.getElementById('metric-leads').textContent = leads ? leads.length : 0;
  
  const rTable = document.getElementById('recent-orders-table');
  if (orders && orders.length > 0) {
    rTable.innerHTML = orders.slice(0, 5).map(o => `
      <tr>
        <td>#${o.id.substring(0,8)}</td>
        <td style="font-size:0.8rem">${o.user_id}</td>
        <td><strong>₹${o.total_amount}</strong></td>
        <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } else {
    rTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent orders.</td></tr>';
  }
}

// 2. Categories
async function loadCategories() {
  const { data: categories } = await supabaseClient.from('categories').select('*').order('created_at', { ascending: false });
  const select = document.getElementById('p-category');
  const table = document.getElementById('categories-table');
  
  if (categories && categories.length > 0) {
    select.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    table.innerHTML = categories.map(c => `
      <tr>
        <td>${c.image_url ? `<img src="${c.image_url}" width="40" height="40" style="object-fit:cover;border-radius:4px;">` : 'No Img'}</td>
        <td><strong>${c.name}</strong></td>
        <td>${c.description || '-'}</td>
        <td><button class="action-btn delete" onclick="deleteCategory('${c.id}')"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `).join('');
  } else {
    select.innerHTML = '<option value="">Create a category first</option>';
    table.innerHTML = '<tr><td colspan="4" style="text-align:center;">No categories found.</td></tr>';
  }
}

document.getElementById('category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('c-name').value;
  const description = document.getElementById('c-desc').value;
  const image_url = document.getElementById('c-img').value;
  const { error } = await supabaseClient.from('categories').insert([{ name, description, image_url }]);
  if (error) return showToast(error.message, true);
  showToast('Category saved!');
  document.getElementById('category-form').reset();
  loadCategories();
});

async function deleteCategory(id) {
  if (confirm('Delete this category?')) {
    await supabaseClient.from('categories').delete().eq('id', id);
    loadCategories();
  }
}

// 3. Products
let editingProductId = null;
async function loadProducts() {
  const { data: products } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('products-table');
  if (products && products.length > 0) {
    table.innerHTML = products.map(p => `
      <tr>
        <td>${p.image_url ? `<img src="${p.image_url}" width="50" height="50" style="object-fit:cover;border-radius:6px;">` : ''}</td>
        <td><strong>${p.name}</strong><br><span style="font-size:0.8rem;color:#888;">${p.sku || 'No SKU'}</span></td>
        <td>₹${p.price} <br><span style="font-size:0.8rem;color:green;">${p.offer_price ? `Offer: ₹${p.offer_price}` : ''}</span></td>
        <td>${p.stock}</td>
        <td><span style="font-size:0.8rem;padding:4px 8px;border-radius:4px;background:#eee;">${p.status}</span></td>
        <td>
          <button class="action-btn edit" onclick='editProduct(${JSON.stringify(p).replace(/'/g, "&#39;")})'><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found.</td></tr>';
  }
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const product = {
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    sku: document.getElementById('p-sku').value,
    price: parseFloat(document.getElementById('p-price').value),
    offer_price: document.getElementById('p-offer').value ? parseFloat(document.getElementById('p-offer').value) : null,
    stock: parseInt(document.getElementById('p-stock').value || '0'),
    badge: document.getElementById('p-badge').value,
    status: document.getElementById('p-status').value,
    image_url: document.getElementById('p-image').value,
    description: document.getElementById('p-desc').value,
    seo_title: document.getElementById('p-seo-title').value,
    seo_description: document.getElementById('p-seo-desc').value,
  };
  
  if (!product.id && !editingProductId) {
    product.id = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  let error;
  if (editingProductId) {
    const { error: err } = await supabaseClient.from('products').update(product).eq('id', editingProductId);
    error = err;
  } else {
    const { error: err } = await supabaseClient.from('products').insert([product]);
    error = err;
  }
  
  if (error) return showToast(error.message, true);
  showToast(editingProductId ? 'Product updated!' : 'Product added!');
  resetProductForm();
  loadProducts();
  loadDashboard();
});

function editProduct(p) {
  editingProductId = p.id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-category').value = p.category || '';
  document.getElementById('p-sku').value = p.sku || '';
  document.getElementById('p-price').value = p.price;
  document.getElementById('p-offer').value = p.offer_price || '';
  document.getElementById('p-stock').value = p.stock || 0;
  document.getElementById('p-badge').value = p.badge || '';
  document.getElementById('p-status').value = p.status || 'Active';
  document.getElementById('p-image').value = p.image_url || '';
  document.getElementById('p-desc').value = p.description || '';
  document.getElementById('p-seo-title').value = p.seo_title || '';
  document.getElementById('p-seo-desc').value = p.seo_description || '';
  document.getElementById('product-btn').textContent = 'Update Product';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetProductForm() {
  editingProductId = null;
  document.getElementById('product-form').reset();
  document.getElementById('product-btn').textContent = 'Save Product';
}

async function deleteProduct(id) {
  if (confirm('Delete this product?')) {
    await supabaseClient.from('products').delete().eq('id', id);
    loadProducts();
    loadDashboard();
  }
}

// 4. Orders
async function loadOrders() {
  const { data: orders } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('all-orders-table');
  if (orders && orders.length > 0) {
    table.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id.substring(0,8)}</td>
        <td style="font-size:0.8rem">${o.user_id}</td>
        <td style="font-size:0.75rem">${JSON.stringify(o.items).substring(0,40)}...</td>
        <td><strong>₹${o.total_amount}</strong></td>
        <td>
          <select class="select-sm" onchange="updateOrderStatus('${o.id}', this.value)">
            <option value="Processing" ${o.status==='Processing'?'selected':''}>Processing</option>
            <option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option>
            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>';
  }
}
async function updateOrderStatus(id, status) {
  const { error } = await supabaseClient.from('orders').update({ status }).eq('id', id);
  if (error) showToast(error.message, true);
  else showToast('Status updated!');
  loadDashboard();
}

// 5. Coupons
async function loadCoupons() {
  const { data: coupons } = await supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('coupons-table');
  if (coupons && coupons.length > 0) {
    table.innerHTML = coupons.map(c => `
      <tr>
        <td><strong>${c.code}</strong></td>
        <td>${c.discount_type === 'percent' ? c.discount_value + '%' : '₹' + c.discount_value}</td>
        <td>₹${c.min_order_amount}</td>
        <td>${c.used_count} / ${c.usage_limit || '∞'}</td>
        <td>${c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
        <td><button class="action-btn delete" onclick="deleteCoupon('${c.id}')"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="6" style="text-align:center;">No coupons found.</td></tr>';
  }
}
document.getElementById('coupon-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    code: document.getElementById('cp-code').value.toUpperCase(),
    discount_type: document.getElementById('cp-type').value,
    discount_value: parseFloat(document.getElementById('cp-value').value),
    min_order_amount: parseFloat(document.getElementById('cp-min').value || 0),
    usage_limit: document.getElementById('cp-limit').value ? parseInt(document.getElementById('cp-limit').value) : null,
    expires_at: document.getElementById('cp-expiry').value || null
  };
  const { error } = await supabaseClient.from('coupons').insert([data]);
  if (error) return showToast(error.message, true);
  showToast('Coupon created!');
  document.getElementById('coupon-form').reset();
  loadCoupons();
});
async function deleteCoupon(id) {
  if(confirm('Delete coupon?')) {
    await supabaseClient.from('coupons').delete().eq('id', id);
    loadCoupons();
  }
}

// 6. Sales
async function loadSales() {
  const { data: sales } = await supabaseClient.from('sale_events').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('sales-table');
  if (sales && sales.length > 0) {
    table.innerHTML = sales.map(s => `
      <tr>
        <td><strong>${s.name}</strong><br><span style="font-size:0.75rem;color:#888;">${s.banner_text}</span></td>
        <td>${s.discount_percent}%</td>
        <td style="font-size:0.8rem">${new Date(s.start_date).toLocaleDateString()} - ${new Date(s.end_date).toLocaleDateString()}</td>
        <td><span class="status-badge" style="background:${s.is_active?'#E8F5E9':'#FFEBEE'}; color:${s.is_active?'#2E7D32':'#C62828'}">${s.is_active?'Active':'Inactive'}</span></td>
        <td><button class="action-btn delete" onclick="deleteSale('${s.id}')"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="5" style="text-align:center;">No sale events found.</td></tr>';
  }
}
document.getElementById('sale-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById('s-name').value,
    banner_text: document.getElementById('s-banner').value,
    discount_percent: parseFloat(document.getElementById('s-discount').value || 0),
    is_active: document.getElementById('s-active').value === 'true',
    start_date: document.getElementById('s-start').value,
    end_date: document.getElementById('s-end').value
  };
  const { error } = await supabaseClient.from('sale_events').insert([data]);
  if (error) return showToast(error.message, true);
  showToast('Sale Event created!');
  document.getElementById('sale-form').reset();
  loadSales();
});
async function deleteSale(id) {
  if(confirm('Delete sale event?')) {
    await supabaseClient.from('sale_events').delete().eq('id', id);
    loadSales();
  }
}

// 7. Customers
async function loadCustomers() {
  const { data: profiles } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('customers-table');
  if (profiles && profiles.length > 0) {
    table.innerHTML = profiles.map(p => `
      <tr>
        <td style="font-size:0.75rem; color:#888;">${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.phone || '-'}</td>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="4" style="text-align:center;">No customers found.</td></tr>';
  }
}

// 8. Leads
async function loadLeads() {
  const { data: leads } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('leads-table');
  if (leads && leads.length > 0) {
    table.innerHTML = leads.map(l => `
      <tr>
        <td>${new Date(l.created_at).toLocaleDateString()}</td>
        <td style="font-size:0.75rem">${l.user_id || 'Guest'}</td>
        <td>${l.product_id || 'Bulk Enquiry'}</td>
        <td style="font-size:0.85rem">${l.summary}</td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="4" style="text-align:center;">No leads found.</td></tr>';
  }
}

// 9. Testimonials
async function loadTestimonials() {
  const { data: testies } = await supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
  const table = document.getElementById('testimonials-table');
  if (testies && testies.length > 0) {
    const pendingCount = testies.filter(t => t.status === 'Pending').length;
    const badge = document.getElementById('pending-reviews-badge');
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
    
    table.innerHTML = testies.map(t => `
      <tr>
        <td>${new Date(t.created_at).toLocaleDateString()}</td>
        <td><strong>${t.customer_name}</strong><br><span style="font-size:0.7rem">${t.user_id}</span></td>
        <td>${'⭐'.repeat(t.rating)}</td>
        <td style="font-size:0.85rem">${t.review_text}</td>
        <td>
          <select class="select-sm" onchange="updateTestimonial('${t.id}', this.value)">
            <option value="Pending" ${t.status==='Pending'?'selected':''}>Pending</option>
            <option value="Approved" ${t.status==='Approved'?'selected':''}>Approved</option>
            <option value="Rejected" ${t.status==='Rejected'?'selected':''}>Rejected</option>
          </select>
        </td>
        <td style="text-align:center;">
          <input type="checkbox" onchange="updateTestimonialVerified('${t.id}', this.checked)" ${t.is_verified ? 'checked' : ''}>
        </td>
      </tr>
    `).join('');
  } else {
    table.innerHTML = '<tr><td colspan="5" style="text-align:center;">No testimonials found.</td></tr>';
  }
}
async function updateTestimonial(id, status) {
  const { error } = await supabaseClient.from('testimonials').update({ status }).eq('id', id);
  if (error) showToast(error.message, true);
  else { showToast('Testimonial updated!'); loadTestimonials(); }
}
async function updateTestimonialVerified(id, is_verified) {
  const { error } = await supabaseClient.from('testimonials').update({ is_verified }).eq('id', id);
  if (error) showToast(error.message, true);
  else { showToast('Verified status updated!'); }
}

// 10. SEO & Social Settings
let settingsId = null;
async function loadSettings() {
  const { data: settings } = await supabaseClient.from('site_settings').select('*').limit(1);
  if (settings && settings.length > 0) {
    const s = settings[0];
    settingsId = s.id;
    // SEO
    document.getElementById('seo-title').value = s.site_title || '';
    document.getElementById('seo-desc').value = s.meta_description || '';
    document.getElementById('seo-keys').value = s.keywords || '';
    document.getElementById('seo-og').value = s.og_image || '';
    document.getElementById('seo-canon').value = s.canonical_url || '';
    document.getElementById('seo-ga').value = s.ga_id || '';
    document.getElementById('seo-gsc').value = s.gsc_verification || '';
    // Social
    document.getElementById('soc-wa-num').value = s.whatsapp_number || '';
    document.getElementById('soc-wa-txt').value = s.whatsapp_text || '';
    document.getElementById('soc-ig').value = s.instagram_url || '';
    document.getElementById('soc-fb').value = s.facebook_url || '';
    document.getElementById('soc-yt').value = s.youtube_url || '';
    document.getElementById('soc-tw').value = s.twitter_url || '';
    document.getElementById('soc-pin').value = s.pinterest_url || '';
  }
}

document.getElementById('seo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    site_title: document.getElementById('seo-title').value,
    meta_description: document.getElementById('seo-desc').value,
    keywords: document.getElementById('seo-keys').value,
    og_image: document.getElementById('seo-og').value,
    canonical_url: document.getElementById('seo-canon').value,
    ga_id: document.getElementById('seo-ga').value,
    gsc_verification: document.getElementById('seo-gsc').value
  };
  let error;
  if (settingsId) { error = (await supabaseClient.from('site_settings').update(data).eq('id', settingsId)).error; }
  else { error = (await supabaseClient.from('site_settings').insert([data])).error; }
  if (error) return showToast(error.message, true);
  showToast('SEO settings saved!');
  loadSettings();
});

document.getElementById('social-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    whatsapp_number: document.getElementById('soc-wa-num').value,
    whatsapp_text: document.getElementById('soc-wa-txt').value,
    instagram_url: document.getElementById('soc-ig').value,
    facebook_url: document.getElementById('soc-fb').value,
    youtube_url: document.getElementById('soc-yt').value,
    twitter_url: document.getElementById('soc-tw').value,
    pinterest_url: document.getElementById('soc-pin').value
  };
  let error;
  if (settingsId) { error = (await supabaseClient.from('site_settings').update(data).eq('id', settingsId)).error; }
  else { error = (await supabaseClient.from('site_settings').insert([data])).error; }
  if (error) return showToast(error.message, true);
  showToast('Social settings saved!');
  loadSettings();
});

// Init
checkAuth();
