/* =============================================================
   ONCOST Admin Console · admin.js
   Vanilla JS · Supabase JS v2 · Single-file SPA
   ============================================================= */
/* global supabaseClient, Chart, Papa, XLSX */
'use strict';

const ADMIN_EMAILS = ['enterprisepragna@gmail.com'];

// ------------------------- State -------------------------
const state = {
  user: null,
  settings: {},
  products: [],         // full list (paged client-side for simplicity)
  productsFiltered: [],
  productsPage: 1,
  productsPageSize: 20,
  categories: [],
  orders: [],
  coupons: [],
  sales: [],
  leads: [],
  testimonials: [],
  inv: [],
  imgbbKey: '',
};

// ------------------------- Utilities -------------------------
const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, html = '') => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') n.className = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  });
  if (html) n.innerHTML = html;
  return n;
};
const fmtINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const escapeHTML = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('id-' + Date.now());

function showToast(msg, kind = 'success') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast ' + (kind === 'error' ? 'error' : kind === 'success' ? 'success' : '');
  t.style.display = 'block';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function confirmDialog(message, { confirmLabel = 'Confirm', danger = false } = {}) {
  return new Promise((resolve) => {
    const root = $('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" data-testid="confirm-overlay">
        <div class="modal sm">
          <div class="modal-head"><h3>Confirm</h3></div>
          <div class="modal-body"><p style="margin:0;color:var(--admin-text-mute)">${escapeHTML(message)}</p></div>
          <div class="modal-foot">
            <button class="btn btn-secondary" id="cnf-no" data-testid="confirm-no">Cancel</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cnf-yes" data-testid="confirm-yes">${escapeHTML(confirmLabel)}</button>
          </div>
        </div>
      </div>`;
    root.querySelector('.modal-backdrop').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) { close(false); }
    });
    $('cnf-no').onclick = () => close(false);
    $('cnf-yes').onclick = () => close(true);
    function close(v) { root.innerHTML = ''; resolve(v); }
  });
}

function openModal({ title, size = '', body, footer, testid = 'modal' }) {
  const root = $('modal-root');
  const wrap = el('div', { class: 'modal-backdrop', 'data-testid': testid + '-overlay' });
  wrap.innerHTML = `
    <div class="modal ${size}">
      <div class="modal-head">
        <h3>${escapeHTML(title)}</h3>
        <button class="icon-btn" id="${testid}-close" data-testid="${testid}-close"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="modal-body" id="${testid}-body"></div>
      <div class="modal-foot" id="${testid}-foot"></div>
    </div>`;
  root.appendChild(wrap);
  if (typeof body === 'string') $(`${testid}-body`).innerHTML = body;
  else if (body) $(`${testid}-body`).appendChild(body);
  if (footer) $(`${testid}-foot`).appendChild(footer);
  $(`${testid}-close`).onclick = () => close();
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  function close() { wrap.remove(); }
  return { close, root: wrap };
}

// ------------------------- Auth & Boot -------------------------
async function bootstrap() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
      window.location.href = 'admin-login.html'; return;
    }
    state.user = session.user;
    $('user-name').textContent = session.user.user_metadata?.name || 'Admin';
    $('user-email').textContent = session.user.email;
    $('user-avatar').textContent = (session.user.email || 'A').charAt(0).toUpperCase();

    setupNav();
    setupSearches();
    setupImport();

    await Promise.all([
      loadSettings(),
      loadCategories(),
      loadProducts(),
      loadOrders(),
      loadCoupons(),
      loadSales(),
      loadLeads(),
      loadTestimonials(),
    ]);
    renderAllOnce();
  } catch (err) {
    console.error(err);
    showToast('Failed to load admin: ' + err.message, 'error');
  }
}

async function adminLogout() {
  if (!await confirmDialog('Sign out of the admin console?', { confirmLabel: 'Sign out' })) return;
  await supabaseClient.auth.signOut();
  window.location.href = 'admin-login.html';
}
window.adminLogout = adminLogout;

// ------------------------- Navigation -------------------------
const VIEW_TITLES = {
  dashboard: 'Dashboard', products: 'Products', categories: 'Categories',
  inventory: 'Inventory', import: 'Bulk Import', orders: 'Orders',
  coupons: 'Coupons', sales: 'Sale Events', leads: 'Enquiries',
  testimonials: 'Testimonials', settings: 'Site Settings',
};

function setupNav() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => goView(btn.dataset.view));
  });
}
function goView(view) {
  document.querySelectorAll('[data-view-pane]').forEach(p => p.classList.toggle('active', p.dataset.viewPane === view));
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $('topbar-crumb').textContent = VIEW_TITLES[view] || 'Admin';
  if (window.innerWidth < 800) document.getElementById('sidebar').classList.remove('open');
  // Re-render views that need fresh data
  if (view === 'inventory') renderInventory();
  if (view === 'orders') renderOrders();
  if (view === 'dashboard') { renderCharts(); renderLowStockAlert(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goView = goView;

// ------------------------- Settings -------------------------
async function loadSettings() {
  const { data } = await supabaseClient.from('site_settings').select('*').limit(1);
  state.settings = (data && data[0]) || {};
  state.imgbbKey = state.settings.imgbb_api_key || '';
  // Populate form
  ['site_title','meta_description','keywords','og_image','canonical_url','ga_id','gsc_verification','robots_txt',
   'whatsapp_number','whatsapp_text','instagram_url','facebook_url','youtube_url','pinterest_url','twitter_url',
   'imgbb_api_key','openai_api_key','gemini_api_key','low_stock_threshold','alert_whatsapp'].forEach(k => {
    const node = $(`set-${k}`);
    if (node) node.value = state.settings[k] ?? '';
  });
}
async function saveSettings() {
  const payload = {};
  ['site_title','meta_description','keywords','og_image','canonical_url','ga_id','gsc_verification','robots_txt',
   'whatsapp_number','whatsapp_text','instagram_url','facebook_url','youtube_url','pinterest_url','twitter_url',
   'imgbb_api_key','openai_api_key','gemini_api_key','low_stock_threshold','alert_whatsapp'].forEach(k => {
    const node = $(`set-${k}`);
    if (node) payload[k] = k === 'low_stock_threshold' ? (Number(node.value) || 5) : node.value.trim();
  });
  let res;
  if (state.settings.id) {
    res = await supabaseClient.from('site_settings').update(payload).eq('id', state.settings.id).select().single();
  } else {
    res = await supabaseClient.from('site_settings').insert(payload).select().single();
  }
  if (res.error) {
    if (res.error.message?.includes('imgbb_api_key') || res.error.message?.includes('openai_api_key') || res.error.message?.includes('low_stock') || res.error.message?.includes('alert_whatsapp')) {
      showToast('Run the latest admin_setup.sql in Supabase SQL Editor to add new columns.', 'error');
    } else {
      showToast('Failed: ' + res.error.message, 'error');
    }
    return;
  }
  state.settings = res.data;
  state.imgbbKey = res.data.imgbb_api_key || '';
  showToast('Settings saved.');
}
window.saveSettings = saveSettings;

// ------------------------- Image upload (imgbb) -------------------------
async function uploadImageToImgbb(file) {
  if (!state.imgbbKey) {
    throw new Error('Add an imgbb API key in Site Settings to enable JPG upload.');
  }
  const fd = new FormData();
  fd.append('image', file);
  const r = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(state.imgbbKey)}`, { method: 'POST', body: fd });
  const j = await r.json();
  if (!j.success) throw new Error(j.error?.message || 'imgbb upload failed');
  return j.data.url; // direct image url
}

// ------------------------- Dashboard -------------------------
function renderDashboard() {
  const threshold = Number(state.settings.low_stock_threshold) || 5;
  const totalProducts = state.products.length;
  const active = state.products.filter(p => (p.status || 'Active') === 'Active').length;
  const totalCats = state.categories.length;
  const lowStock = state.products.filter(p => (p.stock ?? 0) <= threshold).length;
  const outStock = state.products.filter(p => (p.stock ?? 0) === 0).length;
  const totalOrders = state.orders.length;
  const revenue = state.orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const pendingOrders = state.orders.filter(o => o.status === 'Processing').length;
  const newLeads = state.leads.length;
  const invValue = state.products.reduce((s, p) => s + (Number(p.stock || 0) * Number(p.price || 0)), 0);
  const liveSales = state.sales.filter(s => s.is_active).length;

  $('kpi-grid').innerHTML = [
    kpi('Revenue', fmtINR(revenue), 'fa-indian-rupee-sign', `${totalOrders} orders`),
    kpi('Orders Pending', pendingOrders, 'fa-clock', `${totalOrders} total`),
    kpi('Total Products', totalProducts, 'fa-box', `${active} active`),
    kpi('Low Stock', lowStock, 'fa-triangle-exclamation', `${outStock} out of stock`, lowStock > 0 ? 'warn' : ''),
    kpi('Categories', totalCats, 'fa-layer-group'),
    kpi('Inventory Value', fmtINR(invValue), 'fa-warehouse'),
    kpi('Live Sales', liveSales, 'fa-bullhorn'),
    kpi('New Enquiries', newLeads, 'fa-envelope'),
  ].join('');

  // Recent orders
  const ro = $('recent-orders-list');
  if (state.orders.length === 0) {
    ro.innerHTML = `<div class="empty"><div class="ic"><i class="fas fa-receipt"></i></div><h4>No orders yet</h4><p>When customers place orders, they’ll appear here.</p></div>`;
  } else {
    ro.innerHTML = `<table class="data" style="border:none;"><tbody>` + state.orders.slice(0, 6).map(o => `
      <tr>
        <td><div style="font-weight:600;">#${escapeHTML(String(o.id).substring(0,8))}</div><div style="font-size:11px;color:var(--admin-text-mute);">${escapeHTML(o.guest_email || (o.user_id||'').substring(0,12))}</div></td>
        <td style="text-align:right;font-weight:600">${fmtINR(o.total_amount)}</td>
        <td>${statusBadge(o.status)}</td>
        <td style="font-size:11px;color:var(--admin-text-mute)">${new Date(o.created_at).toLocaleDateString()}</td>
      </tr>`).join('') + '</tbody></table>';
  }

  // Low stock list
  const lo = $('low-stock-list');
  const lows = state.products.filter(p => (p.stock ?? 0) <= threshold).sort((a,b) => (a.stock||0)-(b.stock||0)).slice(0, 7);
  if (lows.length === 0) {
    lo.innerHTML = `<div class="empty"><div class="ic"><i class="fas fa-circle-check"></i></div><h4>All healthy</h4><p>No products below threshold.</p></div>`;
  } else {
    lo.innerHTML = lows.map(p => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--admin-border)">
        <div style="min-width:0;">
          <div style="font-weight:500;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(p.name)}</div>
          <div style="font-size:11px;color:var(--admin-text-mute)">${escapeHTML(p.category || 'Uncategorized')}</div>
        </div>
        <span class="badge ${p.stock === 0 ? 'b-error' : 'b-warn'}">${p.stock ?? 0} left</span>
      </div>`).join('');
  }
}

function renderLowStockAlert() {
  const threshold = Number(state.settings.low_stock_threshold) || 5;
  const lows = state.products.filter(p => (p.stock ?? 0) <= threshold);
  const banner = $('low-stock-alert');
  if (!banner) return;
  if (!lows.length) { banner.style.display = 'none'; return; }
  banner.style.display = 'flex';
  $('lsa-title').textContent = `${lows.length} product${lows.length===1?'':'s'} at or below threshold (${threshold})`;
  $('lsa-detail').textContent = lows.slice(0,3).map(p => `${p.name} (${p.stock||0} left)`).join(' · ') + (lows.length > 3 ? ` · +${lows.length-3} more` : '');
  const wa = (state.settings.alert_whatsapp || '').replace(/[^0-9]/g, '');
  const link = $('lsa-wa');
  if (wa) {
    const msg = encodeURIComponent(`🔔 ONCOST Low Stock Alert\n\n${lows.length} product(s) at/below ${threshold} units:\n\n` + lows.slice(0,10).map(p => `• ${p.name}: ${p.stock||0} left`).join('\n'));
    link.href = `https://wa.me/${wa}?text=${msg}`;
    link.style.display = '';
  } else {
    link.href = '#'; link.style.display = 'none';
  }
}

let _chartRevenue, _chartCategories;
function renderCharts() {
  if (typeof Chart === 'undefined') return;
  // Revenue last 30 days
  const days = [];
  const map = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
    const k = d.toISOString().slice(0,10);
    days.push(k); map[k] = 0;
  }
  state.orders.forEach(o => {
    const k = (o.created_at || '').slice(0,10);
    if (k in map) map[k] += Number(o.total_amount || 0);
  });
  const labels = days.map(d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' }));
  const data = days.map(d => map[d]);
  const rc = $('chart-revenue');
  if (rc) {
    if (_chartRevenue) _chartRevenue.destroy();
    _chartRevenue = new Chart(rc, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Revenue (₹)', data, borderColor: '#7a1f35', backgroundColor: 'rgba(122,31,53,.10)', tension: .35, fill: true, pointRadius: 2, pointBackgroundColor: '#d4af37' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxTicksLimit: 8, color: '#7A726B' }, grid: { display: false } }, y: { ticks: { color: '#7A726B', callback: v => '₹' + Number(v).toLocaleString('en-IN') }, grid: { color: '#F3EDE5' } } } }
    });
  }
  // Top categories by inventory value
  const catMap = {};
  state.products.forEach(p => {
    const c = p.category || 'Uncategorized';
    catMap[c] = (catMap[c] || 0) + Number(p.price || 0) * Number(p.stock || 0);
  });
  const cats = Object.entries(catMap).sort((a,b) => b[1] - a[1]).slice(0, 6);
  const cc = $('chart-categories');
  if (cc) {
    if (_chartCategories) _chartCategories.destroy();
    _chartCategories = new Chart(cc, {
      type: 'doughnut',
      data: { labels: cats.map(c => c[0]), datasets: [{ data: cats.map(c => c[1]), backgroundColor: ['#7a1f35','#d4af37','#b15f72','#f2dd92','#5c1527','#a47a45'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: '55%' }
    });
  }
}

function kpi(label, value, icon, sub = '', tone = '') {
  return `<div class="kpi" data-testid="kpi-${slugify(label)}">
    <div class="kpi-icon" ${tone === 'warn' ? 'style="background:#FBF1E3;color:var(--admin-warn);"' : ''}><i class="fas ${icon}"></i></div>
    <div class="kpi-label">${escapeHTML(label)}</div>
    <div class="kpi-value">${escapeHTML(String(value))}</div>
    ${sub ? `<div class="kpi-sub">${escapeHTML(sub)}</div>` : ''}
  </div>`;
}
function statusBadge(s) {
  s = s || '';
  const cls = ({
    'Active': 'b-success', 'Live': 'b-success', 'Delivered': 'b-success', 'Approved': 'b-success',
    'Inactive': 'b-muted', 'Ended': 'b-muted',
    'Draft': 'b-warn', 'Processing': 'b-warn', 'Packed': 'b-warn', 'Shipped': 'b-warn', 'Pending': 'b-warn',
    'Cancelled': 'b-error', 'Rejected': 'b-error',
  })[s] || 'b-muted';
  return `<span class="badge ${cls}">${escapeHTML(s)}</span>`;
}

// ------------------------- Products -------------------------
async function loadProducts() {
  const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  if (error) { showToast('Load products failed: ' + error.message, 'error'); return; }
  state.products = data || [];
}

function applyProductFilters() {
  const q = ($('products-search').value || '').toLowerCase().trim();
  const cat = $('products-cat-filter').value;
  const st = $('products-status-filter').value;
  state.productsFiltered = state.products.filter(p => {
    if (cat && (p.category || '') !== cat) return false;
    if (st && (p.status || 'Active') !== st) return false;
    if (q) {
      const hay = `${p.name || ''} ${p.sku || ''} ${p.category || ''} ${p.id || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  state.productsPage = 1;
  renderProducts();
}

function renderProducts() {
  // Populate category filter dropdown
  const catSel = $('products-cat-filter');
  const cats = state.categories.map(c => c.name);
  const current = catSel.value;
  catSel.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
  catSel.value = current;

  $('products-sub').textContent = `${state.productsFiltered.length} of ${state.products.length} products shown.`;

  const page = state.productsPage;
  const ps = state.productsPageSize;
  const slice = state.productsFiltered.slice((page-1) * ps, page * ps);

  if (slice.length === 0 && state.products.length === 0) {
    $('products-tbody').innerHTML = `<tr><td colspan="8"><div class="empty"><div class="ic"><i class="fas fa-box-open"></i></div><h4>No products yet</h4><p>Add manually or use Bulk Import.</p><button class="btn btn-primary" onclick="openProductForm()"><i class="fas fa-plus"></i> Add product</button></div></td></tr>`;
    $('products-pagination').style.display = 'none';
    return;
  }
  if (slice.length === 0) {
    $('products-tbody').innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--admin-text-mute);">No products match these filters.</td></tr>`;
    $('products-pagination').style.display = 'none';
    return;
  }

  $('products-tbody').innerHTML = slice.map(p => {
    const img = p.image_url ? `<img class="product-thumb" src="${escapeHTML(p.image_url)}" alt="" onerror="this.style.display='none'" />` :
      `<div class="product-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--admin-text-mute);"><i class="fas fa-image"></i></div>`;
    const stock = Number(p.stock || 0);
    const stockBadge = stock === 0 ? 'b-error' : stock <= 5 ? 'b-warn' : 'b-muted';
    const offer = (p.offer_price && Number(p.offer_price) !== Number(p.price));
    return `<tr data-testid="product-row-${escapeHTML(p.id)}">
      <td>${img}</td>
      <td><div style="font-weight:600">${escapeHTML(p.name)}</div><div style="font-size:11px;color:var(--admin-text-mute)">${escapeHTML((p.description||'').substring(0,60))}</div></td>
      <td><code style="font-size:11px;color:var(--admin-text-mute)">${escapeHTML(p.sku || '—')}</code></td>
      <td>${escapeHTML(p.category || '—')}</td>
      <td style="text-align:right"><div style="font-weight:600">${fmtINR(p.price)}</div>${offer ? `<div style="font-size:11px;color:var(--admin-primary)">Sale ${fmtINR(p.offer_price)}</div>` : ''}</td>
      <td style="text-align:right"><span class="badge ${stockBadge}">${stock}</span></td>
      <td>${statusBadge(p.status || 'Active')}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" onclick="openProductForm('${escapeHTML(p.id)}')" data-testid="edit-product-${escapeHTML(p.id)}" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="deleteProduct('${escapeHTML(p.id)}')" data-testid="delete-product-${escapeHTML(p.id)}" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Pagination
  const totalPages = Math.max(1, Math.ceil(state.productsFiltered.length / ps));
  if (totalPages > 1) {
    $('products-pagination').style.display = 'flex';
    $('products-count').textContent = `Page ${page} / ${totalPages} · ${state.productsFiltered.length} products`;
    $('products-prev').disabled = page <= 1;
    $('products-next').disabled = page >= totalPages;
    $('products-prev').onclick = () => { state.productsPage = Math.max(1, page-1); renderProducts(); };
    $('products-next').onclick = () => { state.productsPage = Math.min(totalPages, page+1); renderProducts(); };
  } else {
    $('products-pagination').style.display = 'none';
  }
}

async function deleteProduct(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  if (!await confirmDialog(`Permanently delete "${p.name}"?`, { confirmLabel: 'Delete', danger: true })) return;
  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if (error) return showToast('Delete failed: ' + error.message, 'error');
  state.products = state.products.filter(x => x.id !== id);
  applyProductFilters();
  showToast('Product deleted.');
}
window.deleteProduct = deleteProduct;

function openProductForm(id) {
  const p = id ? state.products.find(x => x.id === id) : null;
  const isEdit = !!p;
  const formId = 'pf';
  const html = `
    <div class="tabs">
      <button type="button" class="tab-btn active" data-tab="general" data-testid="pf-tab-general">General</button>
      <button type="button" class="tab-btn" data-tab="media" data-testid="pf-tab-media">Media</button>
      <button type="button" class="tab-btn" data-tab="inventory" data-testid="pf-tab-inventory">Inventory</button>
      <button type="button" class="tab-btn" data-tab="seo" data-testid="pf-tab-seo">SEO</button>
    </div>
    <form id="${formId}-form">
      <div class="tab-pane active" data-pane="general">
        <div class="grid-2">
          <div class="field" style="grid-column:1/-1"><label>Name *</label><input class="input" id="${formId}-name" required data-testid="pf-name" value="${escapeHTML(p?.name||'')}" /></div>
          <div class="field"><label>SKU</label><input class="input" id="${formId}-sku" data-testid="pf-sku" value="${escapeHTML(p?.sku||'')}" /></div>
          <div class="field"><label>Status</label>
            <select class="select" id="${formId}-status" data-testid="pf-status">
              ${['Active','Inactive','Draft'].map(s => `<option ${(p?.status||'Active')===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Category</label>
            <input class="input" list="${formId}-catlist" id="${formId}-category" data-testid="pf-category" value="${escapeHTML(p?.category||'')}" placeholder="e.g. Brass Collection" />
            <datalist id="${formId}-catlist">${state.categories.map(c => `<option value="${escapeHTML(c.name)}">`).join('')}</datalist>
          </div>
          <div class="field"><label>Badge (e.g. "Best Seller")</label><input class="input" id="${formId}-badge" data-testid="pf-badge" value="${escapeHTML(p?.badge||'')}" /></div>
          <div class="field"><label>Price (₹) *</label><input class="input" id="${formId}-price" type="number" min="0" step="0.01" required data-testid="pf-price" value="${p?.price ?? ''}" /></div>
          <div class="field"><label>Offer / Sale Price (₹)</label><input class="input" id="${formId}-offer_price" type="number" min="0" step="0.01" data-testid="pf-offer" value="${p?.offer_price ?? ''}" /></div>
          <div class="field" style="grid-column:1/-1"><label>Description</label><textarea class="textarea" id="${formId}-description" data-testid="pf-description">${escapeHTML(p?.description||'')}</textarea></div>
        </div>
      </div>

      <div class="tab-pane" data-pane="media">
        <div id="${formId}-img-block">
          ${p?.image_url ? `<div style="margin-bottom:12px;"><img src="${escapeHTML(p.image_url)}" alt="" style="max-width:240px;border-radius:6px;border:1px solid var(--admin-border);" /></div>` : ''}
        </div>
        <div class="field"><label>Primary Image URL</label><input class="input" id="${formId}-image_url" data-testid="pf-image_url" value="${escapeHTML(p?.image_url||'')}" placeholder="https://..." /></div>
        <div style="margin:14px 0 6px;font-size:12px;color:var(--admin-text-mute);text-align:center;">— or —</div>
        <div class="dropzone" id="${formId}-drop" data-testid="pf-drop">
          <div class="big-icon"><i class="fas fa-image"></i></div>
          <div style="font-weight:600;margin-bottom:4px">Drop a JPG/PNG to upload</div>
          <div style="font-size:12px;color:var(--admin-text-mute)" id="${formId}-drop-sub">Uses imgbb (configure key in Site Settings → Image Upload)</div>
          <input type="file" id="${formId}-file" accept="image/jpeg,image/png,image/webp" hidden />
        </div>
        <div style="margin:14px 0 6px;font-size:12px;color:var(--admin-text-mute);text-align:center;">— or —</div>
        <div style="background:linear-gradient(135deg,#fdf6e9,#f6e9de);border:1px solid #e8c896;border-radius:6px;padding:14px;display:flex;gap:12px;align-items:center;">
          <div style="font-size:24px;">🎨</div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:13px;color:var(--admin-primary);">Generate with AI (Gemini Nano Banana)</div>
            <div style="font-size:11px;color:var(--admin-text-mute);">Auto-generated from product name + category. Free up to 1500/day.</div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="${formId}-ai_img" data-testid="pf-ai-img"><i class="fas fa-wand-magic-sparkles"></i> Generate</button>
        </div>

        <div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--admin-border);">
          <label class="label" style="display:block;margin-bottom:10px;">Additional Gallery Images</label>
          <div id="${formId}-gallery" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;"></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input class="input" id="${formId}-gallery_url" placeholder="Paste another image URL" />
            <button type="button" class="btn btn-secondary btn-sm" id="${formId}-gallery_add_url"><i class="fas fa-plus"></i> Add URL</button>
            <button type="button" class="btn btn-secondary btn-sm" id="${formId}-gallery_upload_btn"><i class="fas fa-upload"></i> Upload</button>
            <input type="file" id="${formId}-gallery_file" accept="image/jpeg,image/png,image/webp" hidden multiple />
          </div>
          <div class="hint" style="margin-top:6px;">Gallery shows on the product detail page. Up to 8 images.</div>
        </div>
      </div>

      <div class="tab-pane" data-pane="inventory">
        <div class="grid-2">
          <div class="field"><label>Stock On Hand</label><input class="input" id="${formId}-stock" type="number" min="0" data-testid="pf-stock" value="${p?.stock ?? 0}" /></div>
        </div>
      </div>

      <div class="tab-pane" data-pane="seo">
        <div style="margin-bottom:14px;text-align:right;">
          <button type="button" class="btn btn-secondary btn-sm" id="${formId}-ai_seo" data-testid="pf-ai-seo"><i class="fas fa-wand-magic-sparkles"></i> AI Generate SEO</button>
        </div>
        <div class="field"><label>SEO Title <span class="hint" style="float:right;" id="${formId}-seoTL"></span></label><input class="input" id="${formId}-seo_title" data-testid="pf-seo_title" value="${escapeHTML(p?.seo_title||'')}" placeholder="${escapeHTML(p?.name||'Product name shown in Google')}" /></div>
        <div class="field"><label>SEO Description <span class="hint" style="float:right;" id="${formId}-seoDL"></span></label><textarea class="textarea" id="${formId}-seo_description" data-testid="pf-seo_description">${escapeHTML(p?.seo_description||'')}</textarea></div>
        <div class="field"><label>Storefront URL</label><div class="hint">www.oncost.shop/product.html?id=<b>${escapeHTML(p?.id || slugify(p?.name || 'new-product'))}</b></div></div>
      </div>
    </form>`;

  const footer = el('div', { style: 'display:flex;gap:8px;' });
  footer.innerHTML = `
    <button class="btn btn-secondary" id="${formId}-cancel" data-testid="pf-cancel">Cancel</button>
    <button class="btn btn-primary" id="${formId}-save" data-testid="pf-save"><i class="fas fa-save"></i> ${isEdit ? 'Save changes' : 'Create product'}</button>`;

  const m = openModal({ title: isEdit ? `Edit · ${p.name}` : 'New Product', size: 'lg', body: html, footer, testid: 'pf' });

  // tabs
  m.root.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
    m.root.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    m.root.querySelectorAll('.tab-pane').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    m.root.querySelector(`[data-pane="${b.dataset.tab}"]`).classList.add('active');
  });

  // SEO counters
  const upd = () => {
    $(`${formId}-seoTL`).textContent = `${$(`${formId}-seo_title`).value.length}/60`;
    $(`${formId}-seoDL`).textContent = `${$(`${formId}-seo_description`).value.length}/160`;
  };
  $(`${formId}-seo_title`).addEventListener('input', upd);
  $(`${formId}-seo_description`).addEventListener('input', upd);
  upd();

  // Upload
  const drop = $(`${formId}-drop`), file = $(`${formId}-file`);
  drop.addEventListener('click', () => file.click());
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); });
  file.addEventListener('change', (e) => e.target.files[0] && handleUpload(e.target.files[0]));
  async function handleUpload(f) {
    if (!state.imgbbKey) { showToast('Add an imgbb API key in Site Settings first.', 'error'); return; }
    $(`${formId}-drop-sub`).innerHTML = '<span class="spin"></span> Uploading…';
    try {
      const url = await uploadImageToImgbb(f);
      $(`${formId}-image_url`).value = url;
      $(`${formId}-img-block`).innerHTML = `<div style="margin-bottom:12px;"><img src="${escapeHTML(url)}" alt="" style="max-width:240px;border-radius:6px;border:1px solid var(--admin-border);" /></div>`;
      $(`${formId}-drop-sub`).textContent = 'Uploaded · ready to save';
      showToast('Image uploaded.');
    } catch (e) {
      showToast(e.message, 'error');
      $(`${formId}-drop-sub`).textContent = 'Uses imgbb (configure key in Site Settings)';
    }
  }

  // Save
  $(`${formId}-cancel`).onclick = () => m.close();

  // ---------- Gallery management ----------
  let gallery = Array.isArray(p?.image_urls) ? [...p.image_urls] : [];
  function renderGallery() {
    const slot = $(`${formId}-gallery`);
    if (!slot) return;
    if (!gallery.length) { slot.innerHTML = `<div style="color:var(--admin-text-mute);font-size:12px;">No additional images yet.</div>`; return; }
    slot.innerHTML = gallery.map((url, i) => `
      <div style="position:relative;width:84px;height:84px;border-radius:6px;overflow:hidden;border:1px solid var(--admin-border);background:var(--admin-muted);">
        <img src="${escapeHTML(url)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
        <button type="button" data-gi="${i}" style="position:absolute;top:-2px;right:-2px;width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid var(--admin-border);color:var(--admin-error);font-size:11px;cursor:pointer;" title="Remove">✕</button>
      </div>`).join('');
    slot.querySelectorAll('[data-gi]').forEach(btn => btn.onclick = () => { gallery.splice(parseInt(btn.dataset.gi,10), 1); renderGallery(); });
  }
  renderGallery();
  $(`${formId}-gallery_add_url`).onclick = () => {
    const u = $(`${formId}-gallery_url`).value.trim();
    if (!u) return;
    if (gallery.length >= 8) return showToast('Max 8 gallery images.', 'error');
    gallery.push(u); $(`${formId}-gallery_url`).value = ''; renderGallery();
  };
  $(`${formId}-gallery_upload_btn`).onclick = () => $(`${formId}-gallery_file`).click();
  $(`${formId}-gallery_file`).onchange = async (e) => {
    if (!state.imgbbKey) { showToast('Add an imgbb API key in Site Settings first.', 'error'); return; }
    for (const f of Array.from(e.target.files || [])) {
      if (gallery.length >= 8) break;
      try { const url = await uploadImageToImgbb(f); gallery.push(url); renderGallery(); }
      catch (err) { showToast(err.message, 'error'); }
    }
    e.target.value = '';
  };

  // ---------- AI Image generator (Gemini Nano Banana) ----------
  $(`${formId}-ai_img`).onclick = async () => {
    const geminiKey = state.settings.gemini_api_key;
    if (!geminiKey) return showToast('Add a Gemini API key in Site Settings → AI & Alerts.', 'error');
    if (!state.imgbbKey) return showToast('Also add an imgbb API key (to host the generated image).', 'error');
    const name = $(`${formId}-name`).value.trim();
    if (!name) return showToast('Enter product name first.', 'error');
    const category = $(`${formId}-category`).value.trim() || 'premium gift';
    const btn = $(`${formId}-ai_img`);
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Generating…';
    try {
      const prompt = `Professional product photography of "${name}" — a ${category} for an Indian luxury return-gifts e-commerce store. Single product centered on a soft cream/beige background with subtle warm lighting. Studio quality, ultra-detailed, brass/gold/copper tones. Square aspect ratio. No text, no watermark, no people. Tasteful, premium, gift-ready presentation.`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE'] },
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || `Gemini error ${r.status}`);
      // Find the inline_data part in the response
      const parts = j.candidates?.[0]?.content?.parts || [];
      const img = parts.find(p => p.inlineData || p.inline_data);
      const dataBlock = img?.inlineData || img?.inline_data;
      if (!dataBlock?.data) throw new Error('No image returned by Gemini');
      // Convert base64 → Blob → imgbb upload
      const byteChars = atob(dataBlock.data);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: dataBlock.mimeType || dataBlock.mime_type || 'image/png' });
      const file = new File([blob], `ai-${slugify(name)}.png`, { type: blob.type });
      btn.innerHTML = '<span class="spin"></span> Uploading…';
      const imgbbUrl = await uploadImageToImgbb(file);
      $(`${formId}-image_url`).value = imgbbUrl;
      $(`${formId}-img-block`).innerHTML = `<div style="margin-bottom:12px;"><img src="${escapeHTML(imgbbUrl)}" alt="" style="max-width:240px;border-radius:6px;border:1px solid var(--admin-border);" /></div>`;
      showToast('🎨 AI image generated. Review and save.');
    } catch (err) {
      showToast('AI image failed: ' + err.message, 'error');
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate';
    }
  };

  // ---------- AI SEO generator ----------
  $(`${formId}-ai_seo`).onclick = async () => {
    const key = state.settings.openai_api_key;
    if (!key) return showToast('Add an OpenAI API key in Site Settings → AI & Alerts.', 'error');
    const name = $(`${formId}-name`).value.trim() || 'Product';
    const category = $(`${formId}-category`).value.trim() || 'Premium gift';
    const desc = $(`${formId}-description`).value.trim() || '';
    const price = $(`${formId}-price`).value || '';
    const btn = $(`${formId}-ai_seo`);
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Generating…';
    try {
      const prompt = `You are an SEO copywriter for ONCOST — a premium Indian e-commerce store selling brass, German silver, tin and thambulam return gifts for weddings, poojas, birthdays and corporate events.\n\nProduct:\nName: ${name}\nCategory: ${category}\nPrice: ₹${price}\nNotes: ${desc || '(none)'}\n\nWrite JSON with these exact keys:\n- seo_title: max 60 chars, includes product name + key benefit\n- seo_description: max 155 chars, persuasive, includes "ONCOST" and a buying intent phrase\n- description: 2 sentences, 30-50 words, warm and aspirational, mentions gifting use-case\n\nReturn ONLY valid JSON, no markdown, no commentary.`;
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || 'OpenAI error');
      const content = j.choices?.[0]?.message?.content || '{}';
      const out = JSON.parse(content);
      if (out.seo_title) $(`${formId}-seo_title`).value = out.seo_title;
      if (out.seo_description) $(`${formId}-seo_description`).value = out.seo_description;
      if (out.description && !$(`${formId}-description`).value.trim()) $(`${formId}-description`).value = out.description;
      // refresh char counters
      $(`${formId}-seoTL`).textContent = `${$(`${formId}-seo_title`).value.length}/60`;
      $(`${formId}-seoDL`).textContent = `${$(`${formId}-seo_description`).value.length}/160`;
      showToast('✨ SEO generated. Review and save.');
    } catch (err) {
      showToast('AI failed: ' + err.message, 'error');
    } finally {
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> AI Generate SEO';
    }
  };

  $(`${formId}-save`).onclick = async () => {
    const name = $(`${formId}-name`).value.trim();
    if (!name) return showToast('Name is required.', 'error');
    const newId = isEdit ? p.id : slugify(name);
    const payload = {
      id: newId, name,
      sku: $(`${formId}-sku`).value.trim() || null,
      status: $(`${formId}-status`).value,
      category: $(`${formId}-category`).value.trim() || null,
      badge: $(`${formId}-badge`).value.trim() || null,
      price: Number($(`${formId}-price`).value) || 0,
      offer_price: $(`${formId}-offer_price`).value ? Number($(`${formId}-offer_price`).value) : null,
      description: $(`${formId}-description`).value.trim() || null,
      image_url: $(`${formId}-image_url`).value.trim() || null,
      image_urls: gallery.length ? gallery : null,
      stock: Number($(`${formId}-stock`).value) || 0,
      seo_title: $(`${formId}-seo_title`).value.trim() || null,
      seo_description: $(`${formId}-seo_description`).value.trim() || null,
    };
    let res;
    if (isEdit) {
      res = await supabaseClient.from('products').update(payload).eq('id', p.id).select().single();
    } else {
      res = await supabaseClient.from('products').upsert(payload).select().single();
    }
    if (res.error) return showToast('Save failed: ' + res.error.message, 'error');
    // Update local cache
    const idx = state.products.findIndex(x => x.id === res.data.id);
    if (idx >= 0) state.products[idx] = res.data; else state.products.unshift(res.data);
    applyProductFilters();
    renderDashboard();
    showToast(isEdit ? 'Product saved.' : 'Product created.');
    m.close();
  };
}
window.openProductForm = openProductForm;

// ------------------------- Categories -------------------------
async function loadCategories() {
  const { data } = await supabaseClient.from('categories').select('*').order('name', { ascending: true });
  state.categories = data || [];
}
function renderCategories() {
  $('categories-sub').textContent = `${state.categories.length} categories.`;
  const tbody = $('categories-tbody');
  if (!state.categories.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="ic"><i class="fas fa-layer-group"></i></div><h4>No categories yet</h4><p>Add one manually or import a CSV — categories auto-create from SHORTCODE column.</p><button class="btn btn-primary" onclick="openCategoryForm()"><i class="fas fa-plus"></i> Add category</button></div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.categories.map(c => {
    const used = state.products.filter(p => (p.category||'') === c.name).length;
    return `<tr data-testid="cat-row-${escapeHTML(c.id)}">
      <td style="font-weight:600">${escapeHTML(c.name)}</td>
      <td style="color:var(--admin-text-mute)">${escapeHTML(c.description||'—')}</td>
      <td><span class="badge b-maroon">${used} products</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" onclick="openCategoryForm('${escapeHTML(c.id)}')" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="icon-btn danger" onclick="deleteCategory('${escapeHTML(c.id)}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}
function openCategoryForm(id) {
  const c = id ? state.categories.find(x => x.id === id) : null;
  const isEdit = !!c;
  const html = `
    <div class="field"><label>Name *</label><input class="input" id="cf-name" required data-testid="cf-name" value="${escapeHTML(c?.name||'')}" /></div>
    <div class="field"><label>Description</label><textarea class="textarea" id="cf-description" data-testid="cf-description">${escapeHTML(c?.description||'')}</textarea></div>
    <div class="field"><label>Image URL</label><input class="input" id="cf-image_url" data-testid="cf-image_url" value="${escapeHTML(c?.image_url||'')}" placeholder="https://..." /></div>`;
  const footer = el('div', {});
  footer.innerHTML = `<button class="btn btn-secondary" id="cf-cancel" data-testid="cf-cancel">Cancel</button><button class="btn btn-primary" id="cf-save" data-testid="cf-save"><i class="fas fa-save"></i> ${isEdit ? 'Save' : 'Create'}</button>`;
  const m = openModal({ title: isEdit ? `Edit Category` : 'New Category', size: 'sm', body: html, footer, testid: 'cf' });
  $('cf-cancel').onclick = () => m.close();
  $('cf-save').onclick = async () => {
    const name = $('cf-name').value.trim();
    if (!name) return showToast('Name required.', 'error');
    const payload = { name, description: $('cf-description').value.trim() || null, image_url: $('cf-image_url').value.trim() || null };
    let res;
    if (isEdit) res = await supabaseClient.from('categories').update(payload).eq('id', c.id).select().single();
    else        res = await supabaseClient.from('categories').insert(payload).select().single();
    if (res.error) return showToast('Save failed: ' + res.error.message, 'error');
    if (isEdit) {
      const idx = state.categories.findIndex(x => x.id === c.id);
      state.categories[idx] = res.data;
    } else state.categories.push(res.data);
    state.categories.sort((a,b) => a.name.localeCompare(b.name));
    renderCategories();
    renderProducts();
    showToast(isEdit ? 'Category saved.' : 'Category created.');
    m.close();
  };
}
window.openCategoryForm = openCategoryForm;
async function deleteCategory(id) {
  const c = state.categories.find(x => x.id === id);
  if (!c) return;
  if (!await confirmDialog(`Delete category "${c.name}"? Products keep their category text.`, { confirmLabel: 'Delete', danger: true })) return;
  const { error } = await supabaseClient.from('categories').delete().eq('id', id);
  if (error) return showToast('Delete failed: ' + error.message, 'error');
  state.categories = state.categories.filter(x => x.id !== id);
  renderCategories();
  showToast('Category deleted.');
}
window.deleteCategory = deleteCategory;

// ------------------------- Inventory -------------------------
function renderInventory() {
  const q = ($('inv-search').value || '').toLowerCase().trim();
  const lowOnly = $('inv-low-only').checked;
  const rows = state.products.filter(p => {
    if (lowOnly && (p.stock ?? 0) > 5) return false;
    if (q) {
      const hay = `${p.name} ${p.sku || ''} ${p.category || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const tbody = $('inv-tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--admin-text-mute);">No products match.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(p => {
    const stock = Number(p.stock || 0);
    const sb = stock === 0 ? 'b-error' : stock <= 5 ? 'b-warn' : 'b-success';
    return `<tr data-testid="inv-row-${escapeHTML(p.id)}">
      <td style="font-weight:600">${escapeHTML(p.name)}</td>
      <td><code style="font-size:11px">${escapeHTML(p.sku||'—')}</code></td>
      <td>${escapeHTML(p.category||'—')}</td>
      <td style="text-align:center"><span class="badge ${sb}" data-testid="inv-stock-${escapeHTML(p.id)}">${stock}</span></td>
      <td style="text-align:right">
        ${[-10,-1,1,10].map(d => `<button class="btn btn-secondary btn-sm" style="min-width:46px;padding:5px 8px" onclick="adjustStock('${escapeHTML(p.id)}',${d})" data-testid="inv-adj-${escapeHTML(p.id)}-${d}">${d>0?'+'+d:d}</button>`).join(' ')}
      </td>
    </tr>`;
  }).join('');
}
async function adjustStock(id, delta) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const newStock = Math.max(0, Number(p.stock||0) + delta);
  const { error } = await supabaseClient.from('products').update({ stock: newStock }).eq('id', id);
  if (error) return showToast('Adjust failed: ' + error.message, 'error');
  p.stock = newStock;
  renderInventory();
  renderDashboard();
}
window.adjustStock = adjustStock;

// ------------------------- Bulk Import -------------------------
function setupImport() {
  const drop = $('import-drop'), file = $('import-file');
  drop.addEventListener('click', () => file.click());
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); if (e.dataTransfer.files[0]) onImportFile(e.dataTransfer.files[0]); });
  file.addEventListener('change', (e) => e.target.files[0] && onImportFile(e.target.files[0]));
  $('import-preview-btn').addEventListener('click', doImportPreview);
  $('import-commit-btn').addEventListener('click', doImportCommit);
}

let importFile = null, importRows = null;
function onImportFile(f) {
  importFile = f; importRows = null;
  $('import-droptext').textContent = f.name;
  $('import-dropsub').textContent = `${(f.size/1024).toFixed(1)} KB · click to replace`;
  $('import-preview-btn').disabled = false;
  $('import-commit-btn').disabled = false;
  $('import-result').innerHTML = '';
  $('import-preview-block').style.display = 'none';
}

function parseImportFile() {
  return new Promise((resolve, reject) => {
    if (!importFile) return reject(new Error('No file'));
    const name = importFile.name.toLowerCase();
    if (name.endsWith('.csv')) {
      Papa.parse(importFile, {
        header: true, skipEmptyLines: true,
        transformHeader: h => (h || '').trim().toUpperCase(),
        complete: (r) => resolve(r.data),
        error: (e) => reject(e),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          // Normalize keys
          const normalized = rows.map(r => {
            const o = {};
            Object.entries(r).forEach(([k, v]) => o[(k || '').trim().toUpperCase()] = v);
            return o;
          });
          resolve(normalized);
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(importFile);
    }
  });
}

function mapRow(r) {
  const status = (r.STATUS || 'ACTIVE').toString().trim().toUpperCase();
  const statusUI = status === 'ACTIVE' ? 'Active' : status === 'INACTIVE' ? 'Inactive' : status === 'DRAFT' ? 'Draft' : 'Active';
  const name = (r.NAME || '').toString().trim();
  return {
    name,
    sku: (r.SKU || '').toString().trim() || null,
    category: (r.SHORTCODE || r.CATEGORY || '').toString().trim() || null,
    badge: (r.BADGE || '').toString().trim() || null,
    description: (r.DESCRIPTION || '').toString().trim() || null,
    price: Number(String(r.PRICE || '').replace(/,/g,'')) || 0,
    offer_price: Number(String(r['SALE PRICE'] || '').replace(/,/g,'')) || null,
    stock: parseInt(String(r['ON HAND'] || r.AVAILABLE || '').replace(/,/g,''), 10) || 0,
    status: statusUI,
    image_url: (r['IMAGE URL'] || '').toString().trim() || null,
    seo_title: null, seo_description: null,
  };
}

async function doImportPreview() {
  try {
    if (!importRows) importRows = await parseImportFile();
    const preview = importRows.slice(0, 20).map(mapRow);
    $('import-preview-block').style.display = 'block';
    $('import-preview-tbody').innerHTML = preview.map(r => `
      <tr>
        <td style="font-weight:500">${escapeHTML(r.name || '(blank)')}</td>
        <td><code style="font-size:11px">${escapeHTML(r.sku||'—')}</code></td>
        <td>${escapeHTML(r.category||'—')}</td>
        <td style="text-align:right">${fmtINR(r.price)}</td>
        <td style="text-align:right">${r.stock}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>`).join('');
    $('import-result').innerHTML = `<div style="font-size:13px;color:var(--admin-text-mute);">Detected <b>${importRows.length}</b> rows in the file.</div>`;
  } catch (e) {
    showToast('Preview failed: ' + e.message, 'error');
  }
}

async function doImportCommit() {
  try {
    $('import-commit-btn').disabled = true;
    $('import-commit-btn').innerHTML = '<span class="spin"></span> Importing…';
    if (!importRows) importRows = await parseImportFile();
    const mapped = importRows.map(mapRow).filter(r => r.name);

    // Auto-create missing categories
    const existingCatNames = new Set(state.categories.map(c => c.name));
    const newCats = [...new Set(mapped.map(r => r.category).filter(Boolean).filter(c => !existingCatNames.has(c)))];
    let catsCreated = 0;
    if (newCats.length) {
      const ins = newCats.map(name => ({ name }));
      const { data, error } = await supabaseClient.from('categories').insert(ins).select();
      if (!error && data) { state.categories = state.categories.concat(data); catsCreated = data.length; }
    }

    // Upsert products in batches of 50 (PK by id - we generate slug-based id)
    let created = 0, updated = 0, skipped = 0;
    const seen = new Set(state.products.map(p => p.id));
    // build payload with stable ids
    const idCount = {};
    const toUpsert = mapped.map(r => {
      // pick id: if sku exists, prefer slug from sku; else from name
      let base = slugify(r.sku || r.name);
      idCount[base] = (idCount[base] || 0) + 1;
      const id = idCount[base] > 1 ? `${base}-${idCount[base]}` : base;
      const isUpdate = seen.has(id);
      if (isUpdate) updated++; else created++;
      return { id, ...r };
    });

    // Upsert in chunks
    const CHUNK = 50;
    for (let i = 0; i < toUpsert.length; i += CHUNK) {
      const slice = toUpsert.slice(i, i + CHUNK);
      const { error } = await supabaseClient.from('products').upsert(slice, { onConflict: 'id' });
      if (error) {
        skipped += slice.length;
        console.error('Upsert error:', error);
      }
    }

    await loadProducts();
    applyProductFilters();
    renderCategories();
    renderDashboard();

    $('import-result').innerHTML = `
      <div style="background:#E8F4E9;border:1px solid #C2DFC4;color:var(--admin-success);padding:12px 14px;border-radius:6px;display:flex;gap:10px;align-items:center;">
        <i class="fas fa-circle-check" style="font-size:18px"></i>
        <div>
          <div style="font-weight:600;">Import complete</div>
          <div style="font-size:12px;">Created: <b>${created - updated < 0 ? 0 : created - updated}</b> · Updated: <b>${updated}</b> · Skipped: <b>${skipped}</b> · New categories: <b>${catsCreated}</b></div>
        </div>
      </div>`;
    showToast('Import complete.');
  } catch (e) {
    showToast('Import failed: ' + e.message, 'error');
    $('import-result').innerHTML = `<div style="background:#FBECEC;border:1px solid #E8C1C1;color:var(--admin-error);padding:12px 14px;border-radius:6px;">${escapeHTML(e.message)}</div>`;
  } finally {
    $('import-commit-btn').disabled = false;
    $('import-commit-btn').innerHTML = '<i class="fas fa-check"></i> Import All';
  }
}

// ------------------------- Orders -------------------------
async function loadOrders() {
  const { data } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
  state.orders = data || [];
}
function renderOrders() {
  $('orders-sub').textContent = `${state.orders.length} orders to date.`;
  const tbody = $('orders-tbody');
  const q = ($('orders-search').value || '').toLowerCase();
  const st = $('orders-status-filter').value;
  const filtered = state.orders.filter(o => {
    if (st && o.status !== st) return false;
    if (q) {
      const hay = `${o.id} ${o.guest_email||''} ${o.user_id||''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><div class="ic"><i class="fas fa-receipt"></i></div><h4>No orders ${state.orders.length ? 'match filters' : 'yet'}</h4><p>Orders placed through the storefront will appear here.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(o => {
    const items = Array.isArray(o.items) ? o.items : (o.items?.items || []);
    const qty = items.reduce((s, it) => s + Number(it.qty || it.quantity || 1), 0);
    return `<tr data-testid="order-row-${escapeHTML(o.id)}">
      <td><code style="font-size:11px">#${escapeHTML(String(o.id).substring(0,8))}</code></td>
      <td><div style="font-size:12px">${escapeHTML(o.guest_email || o.user_id || '—')}</div><div style="font-size:11px;color:var(--admin-text-mute)">${escapeHTML(o.guest_phone || '')}</div></td>
      <td style="text-align:right;font-weight:600">${fmtINR(o.total_amount)}</td>
      <td>${qty} item${qty===1?'':'s'}</td>
      <td>
        <select class="select" style="padding:5px 8px;font-size:12px;min-width:130px;" onchange="updateOrderStatus('${escapeHTML(o.id)}', this.value)" data-testid="order-status-${escapeHTML(o.id)}">
          ${['Processing','Packed','Shipped','Delivered','Cancelled'].map(s => `<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="font-size:12px;color:var(--admin-text-mute)">${new Date(o.created_at).toLocaleDateString()}</td>
      <td><div class="row-actions"><button class="icon-btn" onclick="viewOrder('${escapeHTML(o.id)}')" title="View"><i class="fas fa-eye"></i></button></div></td>
    </tr>`;
  }).join('');
}
async function updateOrderStatus(id, status) {
  const { error } = await supabaseClient.from('orders').update({ status }).eq('id', id);
  if (error) return showToast('Update failed: ' + error.message, 'error');
  const o = state.orders.find(x => x.id === id); if (o) o.status = status;
  showToast(`Order #${id.substring(0,8)} → ${status}`);
  renderDashboard();
}
window.updateOrderStatus = updateOrderStatus;
function viewOrder(id) {
  const o = state.orders.find(x => x.id === id); if (!o) return;
  const items = Array.isArray(o.items) ? o.items : (o.items?.items || []);
  const ship = o.shipping_address || {};
  const body = `
    <div class="grid-2">
      <div><div class="field"><label>Order ID</label><div><code>${escapeHTML(o.id)}</code></div></div></div>
      <div><div class="field"><label>Status</label><div>${statusBadge(o.status)}</div></div></div>
      <div><div class="field"><label>Customer Email</label><div>${escapeHTML(o.guest_email||o.user_id||'—')}</div></div></div>
      <div><div class="field"><label>Phone</label><div>${escapeHTML(o.guest_phone||'—')}</div></div></div>
      <div style="grid-column:1/-1"><div class="field"><label>Shipping Address</label><div style="white-space:pre-wrap;font-size:13px;">${escapeHTML(JSON.stringify(ship, null, 2))}</div></div></div>
    </div>
    <h4 class="card-title" style="margin:16px 0 8px;">Items</h4>
    <table class="data">
      <thead><tr><th>Product</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${items.map(it => `<tr><td>${escapeHTML(it.name || it.product_id || '—')}</td><td style="text-align:right">${it.qty || it.quantity || 1}</td><td style="text-align:right">${fmtINR(it.price)}</td><td style="text-align:right">${fmtINR((it.price||0) * (it.qty||it.quantity||1))}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3" style="text-align:right;font-weight:600">Total</td><td style="text-align:right;font-weight:700;color:var(--admin-primary)">${fmtINR(o.total_amount)}</td></tr></tfoot>
    </table>`;
  const footer = el('div', {});
  footer.innerHTML = `<button class="btn btn-secondary" id="ov-close">Close</button>`;
  const m = openModal({ title: `Order #${o.id.substring(0,8)}`, body, footer, size: 'lg', testid: 'order-view' });
  $('ov-close').onclick = () => m.close();
}
window.viewOrder = viewOrder;

// ------------------------- Coupons -------------------------
async function loadCoupons() {
  const { data } = await supabaseClient.from('coupons').select('*').order('created_at', { ascending: false });
  state.coupons = data || [];
}
function renderCoupons() {
  const tbody = $('coupons-tbody');
  if (!state.coupons.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="ic"><i class="fas fa-tags"></i></div><h4>No coupons yet</h4><p>Create your first discount code.</p><button class="btn btn-primary" onclick="openCouponForm()"><i class="fas fa-plus"></i> Add coupon</button></div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.coupons.map(c => {
    const disc = c.discount_type === 'percent' ? `${c.discount_value}%` : fmtINR(c.discount_value);
    return `<tr data-testid="coupon-row-${escapeHTML(c.id)}">
      <td><code style="font-weight:600;font-size:13px;background:var(--admin-muted);padding:2px 8px;border-radius:4px;">${escapeHTML(c.code)}</code></td>
      <td><span class="badge b-gold">${disc} off</span></td>
      <td>${fmtINR(c.min_order_amount || 0)}</td>
      <td>${c.used_count || 0}${c.usage_limit ? ' / '+c.usage_limit : ''}</td>
      <td style="font-size:12px;color:var(--admin-text-mute)">${c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'No expiry'}</td>
      <td><div class="row-actions">
        <button class="icon-btn" onclick="openCouponForm('${escapeHTML(c.id)}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="icon-btn danger" onclick="deleteCoupon('${escapeHTML(c.id)}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}
function openCouponForm(id) {
  const c = id ? state.coupons.find(x => x.id === id) : null;
  const isEdit = !!c;
  const html = `
    <div class="grid-2">
      <div class="field" style="grid-column:1/-1"><label>Code *</label><input class="input" id="co-code" required style="text-transform:uppercase;" data-testid="co-code" value="${escapeHTML(c?.code||'')}" placeholder="FESTIVE10" /></div>
      <div class="field"><label>Discount Type</label>
        <select class="select" id="co-discount_type" data-testid="co-type">
          <option value="percent" ${c?.discount_type==='percent'?'selected':''}>Percent (%)</option>
          <option value="flat" ${c?.discount_type==='flat'?'selected':''}>Flat (₹)</option>
        </select></div>
      <div class="field"><label>Discount Value *</label><input class="input" id="co-discount_value" type="number" min="0" step="0.01" required data-testid="co-value" value="${c?.discount_value ?? ''}" /></div>
      <div class="field"><label>Minimum Order (₹)</label><input class="input" id="co-min_order_amount" type="number" min="0" data-testid="co-min" value="${c?.min_order_amount ?? 0}" /></div>
      <div class="field"><label>Usage Limit (blank = unlimited)</label><input class="input" id="co-usage_limit" type="number" min="0" data-testid="co-limit" value="${c?.usage_limit ?? ''}" /></div>
      <div class="field" style="grid-column:1/-1"><label>Expires At</label><input class="input" id="co-expires_at" type="datetime-local" data-testid="co-expires" value="${c?.expires_at ? new Date(c.expires_at).toISOString().slice(0,16) : ''}" /></div>
    </div>`;
  const footer = el('div', {});
  footer.innerHTML = `<button class="btn btn-secondary" id="co-cancel" data-testid="co-cancel">Cancel</button><button class="btn btn-primary" id="co-save" data-testid="co-save"><i class="fas fa-save"></i> ${isEdit?'Save':'Create'}</button>`;
  const m = openModal({ title: isEdit ? 'Edit Coupon' : 'New Coupon', body: html, footer, testid: 'co' });
  $('co-cancel').onclick = () => m.close();
  $('co-save').onclick = async () => {
    const code = $('co-code').value.trim().toUpperCase();
    if (!code) return showToast('Code required.', 'error');
    const payload = {
      code,
      discount_type: $('co-discount_type').value,
      discount_value: Number($('co-discount_value').value) || 0,
      min_order_amount: Number($('co-min_order_amount').value) || 0,
      usage_limit: $('co-usage_limit').value ? Number($('co-usage_limit').value) : null,
      expires_at: $('co-expires_at').value ? new Date($('co-expires_at').value).toISOString() : null,
    };
    let res;
    if (isEdit) res = await supabaseClient.from('coupons').update(payload).eq('id', c.id).select().single();
    else res = await supabaseClient.from('coupons').insert(payload).select().single();
    if (res.error) return showToast('Save failed: ' + res.error.message, 'error');
    if (isEdit) state.coupons = state.coupons.map(x => x.id === c.id ? res.data : x);
    else state.coupons.unshift(res.data);
    renderCoupons();
    showToast('Coupon saved.');
    m.close();
  };
}
window.openCouponForm = openCouponForm;
async function deleteCoupon(id) {
  if (!await confirmDialog('Delete this coupon?', { confirmLabel: 'Delete', danger: true })) return;
  const { error } = await supabaseClient.from('coupons').delete().eq('id', id);
  if (error) return showToast('Delete failed: ' + error.message, 'error');
  state.coupons = state.coupons.filter(x => x.id !== id);
  renderCoupons();
  showToast('Coupon deleted.');
}
window.deleteCoupon = deleteCoupon;

// ------------------------- Sale Events -------------------------
async function loadSales() {
  const { data } = await supabaseClient.from('sale_events').select('*').order('start_date', { ascending: false });
  state.sales = data || [];
}
function renderSales() {
  const tbody = $('sales-tbody');
  if (!state.sales.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><div class="ic"><i class="fas fa-bullhorn"></i></div><h4>No sale events yet</h4><p>Schedule your first promotion: Diwali Sale, Festival of Brass…</p><button class="btn btn-primary" onclick="openSaleForm()"><i class="fas fa-plus"></i> Add sale event</button></div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.sales.map(s => `
    <tr data-testid="sale-row-${escapeHTML(s.id)}">
      <td style="font-weight:600">${escapeHTML(s.name)}</td>
      <td style="font-size:12px;color:var(--admin-text-mute)">${escapeHTML(s.banner_text||'—')}</td>
      <td><span class="badge b-maroon">${s.discount_percent}%</span></td>
      <td style="font-size:12px">${new Date(s.start_date).toLocaleDateString()}</td>
      <td style="font-size:12px">${new Date(s.end_date).toLocaleDateString()}</td>
      <td>${s.is_active ? statusBadge('Live') : statusBadge('Inactive')}</td>
      <td><div class="row-actions">
        <button class="icon-btn" onclick="openSaleForm('${escapeHTML(s.id)}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="icon-btn danger" onclick="deleteSale('${escapeHTML(s.id)}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}
function openSaleForm(id) {
  const s = id ? state.sales.find(x => x.id === id) : null;
  const isEdit = !!s;
  const today = new Date().toISOString().slice(0,10);
  const wk = new Date(Date.now() + 7*86400000).toISOString().slice(0,10);
  const html = `
    <div class="grid-2">
      <div class="field" style="grid-column:1/-1"><label>Event Name *</label><input class="input" id="se-name" required data-testid="se-name" value="${escapeHTML(s?.name||'')}" placeholder="Diwali Brass Festival" /></div>
      <div class="field" style="grid-column:1/-1"><label>Banner Text *</label><input class="input" id="se-banner_text" required data-testid="se-banner" value="${escapeHTML(s?.banner_text||'')}" placeholder="🪔 Diwali Sale: Flat 20% off on Brass!" /></div>
      <div class="field"><label>Discount %</label><input class="input" id="se-discount_percent" type="number" min="0" max="100" data-testid="se-discount" value="${s?.discount_percent ?? 10}" /></div>
      <div class="field"><label>Active</label>
        <select class="select" id="se-is_active" data-testid="se-active">
          <option value="true" ${s?.is_active!==false?'selected':''}>Live</option>
          <option value="false" ${s?.is_active===false?'selected':''}>Inactive</option>
        </select></div>
      <div class="field"><label>Start Date</label><input class="input" id="se-start_date" type="date" data-testid="se-start" value="${s?.start_date ? new Date(s.start_date).toISOString().slice(0,10) : today}" /></div>
      <div class="field"><label>End Date</label><input class="input" id="se-end_date" type="date" data-testid="se-end" value="${s?.end_date ? new Date(s.end_date).toISOString().slice(0,10) : wk}" /></div>
    </div>`;
  const footer = el('div', {});
  footer.innerHTML = `<button class="btn btn-secondary" id="se-cancel" data-testid="se-cancel">Cancel</button><button class="btn btn-primary" id="se-save" data-testid="se-save"><i class="fas fa-save"></i> ${isEdit?'Save':'Create'}</button>`;
  const m = openModal({ title: isEdit ? 'Edit Sale Event' : 'New Sale Event', body: html, footer, testid: 'se' });
  $('se-cancel').onclick = () => m.close();
  $('se-save').onclick = async () => {
    const name = $('se-name').value.trim();
    const banner = $('se-banner_text').value.trim();
    if (!name || !banner) return showToast('Name and banner required.', 'error');
    const payload = {
      name, banner_text: banner,
      discount_percent: Number($('se-discount_percent').value) || 0,
      start_date: new Date($('se-start_date').value).toISOString(),
      end_date: new Date($('se-end_date').value).toISOString(),
      is_active: $('se-is_active').value === 'true',
    };
    let res;
    if (isEdit) res = await supabaseClient.from('sale_events').update(payload).eq('id', s.id).select().single();
    else res = await supabaseClient.from('sale_events').insert(payload).select().single();
    if (res.error) return showToast('Save failed: ' + res.error.message, 'error');
    if (isEdit) state.sales = state.sales.map(x => x.id === s.id ? res.data : x);
    else state.sales.unshift(res.data);
    renderSales();
    renderDashboard();
    showToast('Sale event saved.');
    m.close();
  };
}
window.openSaleForm = openSaleForm;
async function deleteSale(id) {
  if (!await confirmDialog('Delete this sale event?', { confirmLabel: 'Delete', danger: true })) return;
  const { error } = await supabaseClient.from('sale_events').delete().eq('id', id);
  if (error) return showToast('Delete failed: ' + error.message, 'error');
  state.sales = state.sales.filter(x => x.id !== id);
  renderSales();
  showToast('Sale event deleted.');
}
window.deleteSale = deleteSale;

// ------------------------- Leads -------------------------
async function loadLeads() {
  const { data } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
  state.leads = data || [];
}
function renderLeads() {
  const tbody = $('leads-tbody');
  if (!state.leads.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty"><div class="ic"><i class="fas fa-envelope"></i></div><h4>No enquiries yet</h4><p>Customer enquiries from the storefront will appear here.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.leads.map(l => `
    <tr>
      <td style="font-size:12px">${new Date(l.created_at).toLocaleDateString()}</td>
      <td><code style="font-size:11px">${escapeHTML(l.product_id||'—')}</code></td>
      <td style="max-width:500px">${escapeHTML(l.summary||'')}</td>
      <td style="font-size:11px;color:var(--admin-text-mute)">${escapeHTML((l.user_id||'').substring(0,8))}</td>
    </tr>`).join('');
}

// ------------------------- Testimonials -------------------------
async function loadTestimonials() {
  const { data } = await supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
  state.testimonials = data || [];
}
function renderTestimonials() {
  const tbody = $('testimonials-tbody');
  if (!state.testimonials.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="ic"><i class="fas fa-star"></i></div><h4>No testimonials yet</h4><p>Customer reviews submitted via storefront will appear here for moderation.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.testimonials.map(t => `
    <tr data-testid="testi-row-${escapeHTML(t.id)}">
      <td style="font-weight:500">${escapeHTML(t.customer_name||'—')}</td>
      <td>${'★'.repeat(t.rating||0)}<span style="color:var(--admin-text-mute)">${'☆'.repeat(5-(t.rating||0))}</span></td>
      <td style="max-width:340px;font-size:13px">${escapeHTML((t.review_text||'').substring(0,150))}${(t.review_text||'').length>150?'…':''}</td>
      <td>${statusBadge(t.status||'Pending')}</td>
      <td style="font-size:12px">${new Date(t.created_at).toLocaleDateString()}</td>
      <td style="text-align:right">
        ${t.status !== 'Approved' ? `<button class="btn btn-secondary btn-sm" onclick="updateTestimonial('${escapeHTML(t.id)}','Approved')" data-testid="testi-approve-${escapeHTML(t.id)}">Approve</button>` : ''}
        ${t.status !== 'Rejected' ? `<button class="btn btn-ghost btn-sm" onclick="updateTestimonial('${escapeHTML(t.id)}','Rejected')" data-testid="testi-reject-${escapeHTML(t.id)}">Reject</button>` : ''}
      </td>
    </tr>`).join('');
}
async function updateTestimonial(id, status) {
  const { error } = await supabaseClient.from('testimonials').update({ status }).eq('id', id);
  if (error) return showToast('Update failed: ' + error.message, 'error');
  const t = state.testimonials.find(x => x.id === id); if (t) t.status = status;
  renderTestimonials();
  showToast(`Testimonial ${status.toLowerCase()}.`);
}
window.updateTestimonial = updateTestimonial;

// ------------------------- Render orchestration -------------------------
function setupSearches() {
  let pt; $('products-search').addEventListener('input', () => { clearTimeout(pt); pt = setTimeout(applyProductFilters, 200); });
  $('products-cat-filter').addEventListener('change', applyProductFilters);
  $('products-status-filter').addEventListener('change', applyProductFilters);
  let it; $('inv-search').addEventListener('input', () => { clearTimeout(it); it = setTimeout(renderInventory, 200); });
  $('inv-low-only').addEventListener('change', renderInventory);
  let ot; $('orders-search').addEventListener('input', () => { clearTimeout(ot); ot = setTimeout(renderOrders, 200); });
  $('orders-status-filter').addEventListener('change', renderOrders);
}

function renderAllOnce() {
  applyProductFilters();
  renderCategories();
  renderCoupons();
  renderSales();
  renderLeads();
  renderTestimonials();
  renderInventory();
  renderOrders();
  renderDashboard();
  renderLowStockAlert();
  renderCharts();
}

// kick it off
document.addEventListener('DOMContentLoaded', bootstrap);
