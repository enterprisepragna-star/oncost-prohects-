/* ═══════════════════════════════════════════
   ONCOST ADMIN PORTAL — admin.js
   All tab logic, Supabase CRUD, UI helpers
═══════════════════════════════════════════ */

const ADMIN_EMAIL = 'enterprisepragna@gmail.com';

/* ── AUTH ── */
async function checkAdminAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

async function adminLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'admin-login.html';
}

/* ── NAV ── */
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
  loadTab(tabId);
}

function switchTabByName(name) {
  const btn = [...document.querySelectorAll('.nav-btn')].find(b => b.textContent.trim().toLowerCase().includes(name));
  if (btn) btn.click();
}

function loadTab(tabId) {
  const loaders = {
    dashboard: loadDashboard,
    products: loadProducts,
    categories: loadCategories,
    orders: loadOrders,
    coupons: loadCoupons,
    sales: loadSales,
    customers: loadCustomers,
    leads: loadLeads,
    testimonials: loadTestimonials,
    seo: loadSEO,
    social: loadSocial,
  };
  if (loaders[tabId]) loaders[tabId]();
}

/* ── MODAL ── */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ── TOAST ── */
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3200);
}

/* ── HELPERS ── */
function statusBadge(status) {
  const map = {
    Processing: 'badge-orange', Shipped: 'badge-blue', Delivered: 'badge-green',
    Cancelled: 'badge-red', active: 'badge-green', inactive: 'badge-grey',
    out_of_stock: 'badge-red', pending: 'badge-orange', approved: 'badge-green',
    rejected: 'badge-red', new: 'badge-blue', contacted: 'badge-orange', converted: 'badge-green',
  };
  return `<span class="badge ${map[status] || 'badge-grey'}">${status || '—'}</span>`;
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

/* ════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════ */
async function loadDashboard() {
  const [{ data: orders }, { data: products }, { data: leads }, { data: testimonials }] = await Promise.all([
    supabaseClient.from('orders').select('total_amount,status'),
    supabaseClient.from('products').select('id'),
    supabaseClient.from('leads').select('id,status'),
    supabaseClient.from('testimonials').select('id,status,customer_name,rating').eq('status', 'pending'),
  ]);

  const revenue = (orders || []).reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingLeads = (leads || []).filter(l => l.status === 'new' || !l.status).length;

  document.getElementById('m-revenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('m-orders').textContent = (orders || []).length;
  document.getElementById('m-products').textContent = (products || []).length;
  document.getElementById('m-leads').textContent = pendingLeads;

  // Recent orders (last 5)
  const { data: recentOrders } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
  const rOtbl = document.getElementById('dash-orders');
  rOtbl.innerHTML = (recentOrders || []).length
    ? recentOrders.map(o => `<tr><td>#${o.id.toString().substring(0,8)}</td><td>${o.customer_email}</td><td>${fmtDate(o.created_at)}</td><td>₹${o.total_amount}</td><td>${statusBadge(o.status)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="empty-state">No orders yet.</td></tr>';

  // Recent leads (last 5)
  const { data: recentLeads } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false }).limit(5);
  const rLtbl = document.getElementById('dash-leads');
  rLtbl.innerHTML = (recentLeads || []).length
    ? recentLeads.map(l => `<tr><td>${l.customer_email || '—'}</td><td>${l.product_id || 'General'}</td><td>${fmtDate(l.created_at)}</td><td>${statusBadge(l.status || 'new')}</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-state">No leads yet.</td></tr>';

  // Pending testimonials
  const rTtbl = document.getElementById('dash-testimonials');
  rTtbl.innerHTML = (testimonials || []).length
    ? testimonials.slice(0,5).map(t => `<tr><td>${t.customer_name}</td><td>${'★'.repeat(t.rating || 0)}</td><td><button class="btn btn-sm btn-primary" onclick="approveTestimonial('${t.id}')">Approve</button></td></tr>`).join('')
    : '<tr><td colspan="3" class="empty-state">No pending reviews.</td></tr>';
}

/* ════════════════════════════════════════
   PRODUCTS
════════════════════════════════════════ */
let allProducts = [];

async function loadProducts() {
  const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: false });
  allProducts = data || [];
  renderProductsTable(allProducts);
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-table');
  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><i class="fa-solid fa-tags"></i> No products found.</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image_url || ''}" class="prod-img" onerror="this.style.background='#eee'"></td>
      <td><strong>${p.name}</strong><br><span style="font-size:0.78rem;color:#aaa">${p.sku || '—'}</span></td>
      <td>${p.category}</td>
      <td><strong>₹${p.price}</strong></td>
      <td>${p.offer_price ? '<span style="color:#2E7D32;font-weight:700">₹' + p.offer_price + '</span>' : '—'}</td>
      <td>${p.stock ?? '—'}</td>
      <td>${p.badge ? `<span class="badge badge-purple">${p.badge}</span>` : '—'}</td>
      <td>${statusBadge(p.status || 'active')}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-sm btn-outline btn-icon" title="Edit" onclick="editProduct(${p.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-danger btn-icon" title="Delete" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function filterProducts() {
  const q = document.getElementById('product-search').value.toLowerCase();
  renderProductsTable(allProducts.filter(p =>
    p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
  ));
}

async function editProduct(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('pf-id').value = p.id;
  document.getElementById('pf-name').value = p.name;
  document.getElementById('pf-category').value = p.category;
  document.getElementById('pf-sku').value = p.sku || '';
  document.getElementById('pf-price').value = p.price;
  document.getElementById('pf-offer').value = p.offer_price || '';
  document.getElementById('pf-stock').value = p.stock || 0;
  document.getElementById('pf-badge').value = p.badge || '';
  document.getElementById('pf-status').value = p.status || 'active';
  document.getElementById('pf-image').value = p.image_url || '';
  document.getElementById('pf-desc').value = p.description || '';
  document.getElementById('pf-seo-title').value = p.seo_title || '';
  document.getElementById('pf-seo-desc').value = p.seo_description || '';
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('product-save-btn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Product';
  openModal('product-modal');
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) { toast('Delete failed: ' + error.message, 'error'); return; }
  toast('Product deleted.');
  loadProducts();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('product-save-btn');
    btn.textContent = 'Saving...'; btn.disabled = true;
    const id = document.getElementById('pf-id').value;
    const payload = {
      name: document.getElementById('pf-name').value,
      category: document.getElementById('pf-category').value,
      sku: document.getElementById('pf-sku').value || null,
      price: parseInt(document.getElementById('pf-price').value),
      offer_price: document.getElementById('pf-offer').value ? parseInt(document.getElementById('pf-offer').value) : null,
      stock: parseInt(document.getElementById('pf-stock').value || '0'),
      badge: document.getElementById('pf-badge').value || null,
      status: document.getElementById('pf-status').value,
      image_url: document.getElementById('pf-image').value,
      description: document.getElementById('pf-desc').value || null,
      seo_title: document.getElementById('pf-seo-title').value || null,
      seo_description: document.getElementById('pf-seo-desc').value || null,
    };
    const { error } = id
      ? await supabaseClient.from('products').update(payload).eq('id', id)
      : await supabaseClient.from('products').insert([payload]);
    if (error) { toast('Error: ' + error.message, 'error'); }
    else { toast(id ? 'Product updated!' : 'Product added!'); closeModal('product-modal'); loadProducts(); document.getElementById('product-form').reset(); document.getElementById('pf-id').value = ''; document.getElementById('product-modal-title').textContent = 'Add New Product'; }
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product'; btn.disabled = false;
  });
});

/* ════════════════════════════════════════
   CATEGORIES
════════════════════════════════════════ */
async function loadCategories() {
  const { data: cats } = await supabaseClient.from('categories').select('*').order('name');
  const { data: products } = await supabaseClient.from('products').select('category');
  const countMap = {};
  (products || []).forEach(p => { countMap[p.category] = (countMap[p.category] || 0) + 1; });
  const tbody = document.getElementById('categories-table');
  tbody.innerHTML = (cats || []).length
    ? cats.map(c => `<tr><td><strong>${c.name}</strong></td><td><code>${c.slug}</code></td><td>${c.description || '—'}</td><td>${countMap[c.name] || 0}</td>
      <td><button class="btn btn-sm btn-danger btn-icon" onclick="deleteCategory(${c.id})"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('')
    : '<tr><td colspan="5" class="empty-state">No categories yet.</td></tr>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('category-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabaseClient.from('categories').insert([{
      name: document.getElementById('catf-name').value,
      slug: document.getElementById('catf-slug').value,
      description: document.getElementById('catf-desc').value || null,
    }]);
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Category added!'); closeModal('category-modal'); loadCategories();
  });
});

async function deleteCategory(id) {
  if (!confirm('Delete category?')) return;
  await supabaseClient.from('categories').delete().eq('id', id);
  toast('Category deleted.'); loadCategories();
}

/* ════════════════════════════════════════
   ORDERS
════════════════════════════════════════ */
async function loadOrders() {
  const filter = document.getElementById('order-filter')?.value || '';
  let q = supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  if (filter) q = q.eq('status', filter);
  const { data: orders, error } = await q;
  if (error && error.code === '42P01') {
    document.getElementById('orders-table').innerHTML = '<tr><td colspan="7" style="color:#D32F2F;text-align:center;padding:20px">Run the SQL schema script to create the orders table.</td></tr>';
    return;
  }
  const all = orders || [];
  document.getElementById('o-processing').textContent = all.filter(o => o.status === 'Processing').length;
  document.getElementById('o-shipped').textContent = all.filter(o => o.status === 'Shipped').length;
  document.getElementById('o-delivered').textContent = all.filter(o => o.status === 'Delivered').length;
  document.getElementById('o-cancelled').textContent = all.filter(o => o.status === 'Cancelled').length;
  const tbody = document.getElementById('orders-table');
  tbody.innerHTML = all.length
    ? all.map(o => `<tr>
        <td><code>#${o.id.toString().substring(0,8)}</code></td>
        <td>${o.customer_email}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>${o.total_items} items</td>
        <td><strong>₹${o.total_amount}</strong></td>
        <td>${statusBadge(o.status)}</td>
        <td><select class="status-select" onchange="updateOrderStatus('${o.id}',this.value)">
          <option value="Processing" ${o.status==='Processing'?'selected':''}>Processing</option>
          <option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option>
          <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
          <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
        </select></td>
      </tr>`).join('')
    : '<tr><td colspan="7" class="empty-state">No orders found.</td></tr>';
}

async function updateOrderStatus(id, status) {
  const { error } = await supabaseClient.from('orders').update({ status }).eq('id', id);
  if (error) { toast('Update failed.', 'error'); return; }
  toast('Order status updated to ' + status + '.');
}

/* ════════════════════════════════════════
   COUPONS
════════════════════════════════════════ */
async function loadCoupons() {
  const { data, error } = await supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
  if (error && error.code === '42P01') {
    document.getElementById('coupons-table').innerHTML = '<tr><td colspan="8" style="color:#D32F2F;text-align:center;padding:20px">Run the SQL schema to create the coupons table.</td></tr>';
    return;
  }
  const coupons = data || [];
  const tbody = document.getElementById('coupons-table');
  const now = new Date();
  tbody.innerHTML = coupons.length
    ? coupons.map(c => {
        const expired = c.valid_until && new Date(c.valid_until) < now;
        return `<tr>
          <td><code style="font-weight:700;font-size:0.95rem">${c.code}</code></td>
          <td>${c.discount_type === 'percentage' ? 'Percentage' : 'Flat'}</td>
          <td><strong>${c.discount_type === 'percentage' ? c.discount_value + '%' : '₹' + c.discount_value}</strong></td>
          <td>${c.min_order_value ? '₹' + c.min_order_value : '—'}</td>
          <td>${c.used_count || 0} / ${c.max_uses || '∞'}</td>
          <td>${fmtDate(c.valid_until)}</td>
          <td>${expired ? statusBadge('inactive') : statusBadge('active')}</td>
          <td><button class="btn btn-sm btn-danger btn-icon" onclick="deleteCoupon(${c.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;}).join('')
    : '<tr><td colspan="8" class="empty-state">No coupons created yet.</td></tr>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('coupon-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabaseClient.from('coupons').insert([{
      code: document.getElementById('cf-code').value.toUpperCase(),
      discount_type: document.getElementById('cf-type').value,
      discount_value: parseFloat(document.getElementById('cf-value').value),
      min_order_value: document.getElementById('cf-min').value ? parseFloat(document.getElementById('cf-min').value) : null,
      max_uses: document.getElementById('cf-max-uses').value ? parseInt(document.getElementById('cf-max-uses').value) : null,
      valid_from: document.getElementById('cf-start').value || null,
      valid_until: document.getElementById('cf-end').value || null,
      description: document.getElementById('cf-desc').value || null,
      used_count: 0,
    }]);
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Coupon created!'); closeModal('coupon-modal'); loadCoupons();
  });
});

async function deleteCoupon(id) {
  if (!confirm('Delete this coupon?')) return;
  await supabaseClient.from('coupons').delete().eq('id', id);
  toast('Coupon deleted.'); loadCoupons();
}

/* ════════════════════════════════════════
   SALE EVENTS
════════════════════════════════════════ */
async function loadSales() {
  const { data, error } = await supabaseClient.from('sale_events').select('*').order('start_date', { ascending: false });
  if (error && error.code === '42P01') {
    document.getElementById('sales-table').innerHTML = '<tr><td colspan="7" style="color:#D32F2F;text-align:center;padding:20px">Run the SQL schema to create sale_events table.</td></tr>';
    return;
  }
  const now = new Date();
  const tbody = document.getElementById('sales-table');
  tbody.innerHTML = (data || []).length
    ? data.map(s => {
        const isActive = new Date(s.start_date) <= now && new Date(s.end_date) >= now;
        return `<tr>
          <td><strong>${s.name}</strong></td>
          <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.banner_text}</td>
          <td>${s.discount_percentage ? s.discount_percentage + '%' : '—'}</td>
          <td>${fmtDate(s.start_date)}</td>
          <td>${fmtDate(s.end_date)}</td>
          <td>${isActive ? '<span class="badge badge-green">🟢 Live</span>' : (new Date(s.end_date) < now ? statusBadge('inactive') : '<span class="badge badge-blue">Scheduled</span>')}</td>
          <td><button class="btn btn-sm btn-danger btn-icon" onclick="deleteSale(${s.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;}).join('')
    : '<tr><td colspan="7" class="empty-state">No sale events created yet.</td></tr>';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sale-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabaseClient.from('sale_events').insert([{
      name: document.getElementById('sf-name').value,
      banner_text: document.getElementById('sf-banner').value,
      discount_percentage: document.getElementById('sf-discount').value ? parseInt(document.getElementById('sf-discount').value) : null,
      start_date: document.getElementById('sf-start').value,
      end_date: document.getElementById('sf-end').value,
      banner_color: document.getElementById('sf-color').value,
    }]);
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Sale event created! Banner will appear on storefront.'); closeModal('sale-modal'); loadSales();
  });
});

async function deleteSale(id) {
  if (!confirm('Delete this sale event?')) return;
  await supabaseClient.from('sale_events').delete().eq('id', id);
  toast('Sale deleted.'); loadSales();
}

/* ════════════════════════════════════════
   CUSTOMERS
════════════════════════════════════════ */
let allCustomers = [];

async function loadCustomers() {
  const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
  if (error && error.code === '42P01') {
    document.getElementById('customers-table').innerHTML = '<tr><td colspan="6" style="color:#D32F2F;text-align:center;padding:20px">Run the SQL schema to create the profiles table.</td></tr>';
    return;
  }
  allCustomers = data || [];
  renderCustomersTable(allCustomers);
}

function renderCustomersTable(customers) {
  const tbody = document.getElementById('customers-table');
  tbody.innerHTML = customers.length
    ? customers.map(c => `<tr>
        <td><strong>${c.name || '—'}</strong></td>
        <td>${c.email || '—'}</td>
        <td>${c.phone || '—'}</td>
        <td>—</td>
        <td>${fmtDate(c.created_at)}</td>
        <td><a class="btn btn-sm btn-outline" href="mailto:${c.email}"><i class="fa-solid fa-envelope"></i></a></td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="empty-state">No customers yet.</td></tr>';
}

function filterCustomers() {
  const q = document.getElementById('customer-search').value.toLowerCase();
  renderCustomersTable(allCustomers.filter(c =>
    (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
  ));
}

/* ════════════════════════════════════════
   LEADS
════════════════════════════════════════ */
async function loadLeads() {
  const filter = document.getElementById('lead-filter')?.value || '';
  let q = supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
  if (filter) q = q.eq('status', filter);
  const { data, error } = await q;
  if (error && error.code === '42P01') {
    document.getElementById('leads-table').innerHTML = '<tr><td colspan="6" style="color:#D32F2F;text-align:center;padding:20px">Run the SQL schema to create the leads table.</td></tr>';
    return;
  }
  const tbody = document.getElementById('leads-table');
  tbody.innerHTML = (data || []).length
    ? data.map(l => `<tr>
        <td>${l.customer_email || '—'}</td>
        <td>${l.product_id || 'General'}</td>
        <td>${fmtDate(l.created_at)}</td>
        <td>${statusBadge(l.status || 'new')}</td>
        <td style="max-width:200px;font-size:0.8rem;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(l.summary || '').substring(0, 80)}...</td>
        <td style="display:flex;gap:6px">
          <button class="btn btn-sm btn-outline" onclick="updateLeadStatus('${l.id}','contacted')">Contacted</button>
          <button class="btn btn-sm btn-primary" onclick="updateLeadStatus('${l.id}','converted')">Converted</button>
          <a class="btn btn-sm btn-gold btn-icon" href="mailto:${l.customer_email}" title="Email customer"><i class="fa-solid fa-envelope"></i></a>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="empty-state">No leads found.</td></tr>';
}

async function updateLeadStatus(id, status) {
  await supabaseClient.from('leads').update({ status }).eq('id', id);
  toast('Lead marked as ' + status + '.'); loadLeads();
}

/* ════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════ */
let testimonialFilter = 'pending';

async function loadTestimonials() {
  let q = supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
  if (testimonialFilter) q = q.eq('status', testimonialFilter);
  const { data, error } = await q;
  if (error && error.code === '42P01') {
    document.getElementById('testimonials-table').innerHTML = '<tr><td colspan="7" style="color:#D32F2F;text-align:center;padding:20px">Run the SQL schema to create the testimonials table.</td></tr>';
    return;
  }
  const tbody = document.getElementById('testimonials-table');
  tbody.innerHTML = (data || []).length
    ? data.map(t => `<tr>
        <td><strong>${t.customer_name}</strong><br><span style="font-size:0.78rem;color:#aaa">${t.customer_email || ''}</span></td>
        <td>${t.product_name || 'General'}</td>
        <td style="color:#d4af37">${'★'.repeat(t.rating || 0)}${'☆'.repeat(5 - (t.rating || 0))}</td>
        <td style="max-width:220px;font-size:0.88rem">${t.review_text || '—'}</td>
        <td>${fmtDate(t.created_at)}</td>
        <td>${statusBadge(t.status || 'pending')}</td>
        <td style="display:flex;gap:6px">
          ${t.status !== 'approved' ? `<button class="btn btn-sm btn-primary" onclick="updateTestimonial('${t.id}','approved')">Approve</button>` : ''}
          ${t.status !== 'rejected' ? `<button class="btn btn-sm btn-danger" onclick="updateTestimonial('${t.id}','rejected')">Reject</button>` : ''}
        </td>
      </tr>`).join('')
    : '<tr><td colspan="7" class="empty-state">No testimonials found.</td></tr>';
}

function filterTestimonials(status, btn) {
  testimonialFilter = status;
  document.querySelectorAll('.inner-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadTestimonials();
}

async function approveTestimonial(id) {
  await updateTestimonial(id, 'approved');
  loadDashboard();
}

async function updateTestimonial(id, status) {
  await supabaseClient.from('testimonials').update({ status }).eq('id', id);
  toast('Testimonial ' + status + '.'); loadTestimonials();
}

/* ════════════════════════════════════════
   SEO & SOCIAL SETTINGS
════════════════════════════════════════ */
async function loadSEO() {
  const { data } = await supabaseClient.from('site_settings').select('*').eq('key', 'seo').single();
  if (data?.value) {
    const s = data.value;
    Object.entries(s).forEach(([k, v]) => { const el = document.getElementById('seo-' + k); if (el) el.value = v; });
  }
}

async function loadSocial() {
  const { data } = await supabaseClient.from('site_settings').select('*').eq('key', 'social').single();
  if (data?.value) {
    const s = data.value;
    Object.entries(s).forEach(([k, v]) => { const el = document.getElementById('social-' + k); if (el) el.value = v; });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('seo-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = { title: document.getElementById('seo-title').value, template: document.getElementById('seo-template').value, desc: document.getElementById('seo-desc').value, keywords: document.getElementById('seo-keywords').value, 'og-image': document.getElementById('seo-og-image').value, canonical: document.getElementById('seo-canonical').value, ga: document.getElementById('seo-ga').value, gsc: document.getElementById('seo-gsc').value, robots: document.getElementById('seo-robots').value };
    const { error } = await supabaseClient.from('site_settings').upsert([{ key: 'seo', value: val }], { onConflict: 'key' });
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('SEO settings saved!');
  });

  document.getElementById('social-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = { wa: document.getElementById('social-wa').value, ig: document.getElementById('social-ig').value, fb: document.getElementById('social-fb').value, yt: document.getElementById('social-yt').value, pt: document.getElementById('social-pt').value, tw: document.getElementById('social-tw').value, 'wa-text': document.getElementById('social-wa-text').value };
    const { error } = await supabaseClient.from('site_settings').upsert([{ key: 'social', value: val }], { onConflict: 'key' });
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Social settings saved!');
  });
});

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
(async () => {
  const ok = await checkAdminAuth();
  if (ok) loadDashboard();
})();
