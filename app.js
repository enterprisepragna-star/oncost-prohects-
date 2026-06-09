/* =================================================================
   ONCOST Storefront · app.js (Unified)
   Live data from Supabase: products, categories, sale_events,
   testimonials, site_settings, cart_items, coupons.
   ================================================================= */
'use strict';

const ADMIN_EMAILS = ['enterprisepragna@gmail.com'];

const state = {
  user: null,
  profile: null,
  settings: {},
  products: [],
  categories: [],
  testimonials: [],
  saleEvents: [],
  cart: [],            // [{ id, product_id, qty, product }]
  appliedCoupon: null,
  isAdmin: false,
};

// ---------- Utilities ----------
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmtINR = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const escapeHTML = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const param = (name) => new URLSearchParams(location.search).get(name);

function toast(msg, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + (kind || '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ---------- Settings, SEO, Sale banner, Whatsapp ----------
async function loadSettings() {
  try {
    const { data } = await supabaseClient.from('site_settings').select('*').limit(1);
    state.settings = (data && data[0]) || {};
  } catch (e) { state.settings = {}; }
}
function applySEO() {
  const s = state.settings;
  if (s.site_title) document.title = s.site_title;
  if (s.meta_description) setMeta('description', s.meta_description);
  if (s.keywords) setMeta('keywords', s.keywords);
  if (s.canonical_url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', s.canonical_url);
  }
  // GA
  if (s.ga_id && !window._gaLoaded) {
    window._gaLoaded = true;
    const sc = document.createElement('script'); sc.async = true; sc.src = `https://www.googletagmanager.com/gtag/js?id=${s.ga_id}`;
    document.head.appendChild(sc);
    window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments)} window.gtag = gtag;
    gtag('js', new Date()); gtag('config', s.ga_id);
  }
}
function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', name); document.head.appendChild(tag); }
  tag.setAttribute('content', content);
}

async function loadSaleEvents() {
  try {
    const { data } = await supabaseClient.from('sale_events').select('*').eq('is_active', true);
    state.saleEvents = data || [];
  } catch (e) { state.saleEvents = []; }
}
function renderSaleBanner() {
  const slot = $('#sale-banner');
  if (!slot) return;
  const now = new Date();
  const live = state.saleEvents.find(s => {
    const sd = new Date(s.start_date), ed = new Date(s.end_date);
    return sd <= now && ed >= now;
  });
  if (!live) { slot.classList.remove('show'); return; }
  slot.innerHTML = `<span class="pill">LIVE</span> ${escapeHTML(live.banner_text || live.name)}`;
  slot.classList.add('show');
}

function applyWhatsappFab() {
  const fab = $('#fab-whatsapp');
  if (!fab) return;
  const num = (state.settings.whatsapp_number || '').replace(/[^0-9]/g, '');
  if (!num) { fab.style.display = 'none'; return; }
  const msg = encodeURIComponent(state.settings.whatsapp_text || 'Hi, I would like to enquire about ONCOST gifts.');
  fab.href = `https://wa.me/${num}?text=${msg}`;
}

function applyFooterSocials() {
  const s = state.settings;
  const map = { instagram: s.instagram_url, facebook: s.facebook_url, youtube: s.youtube_url, pinterest: s.pinterest_url, twitter: s.twitter_url, whatsapp: s.whatsapp_number ? `https://wa.me/${s.whatsapp_number.replace(/[^0-9]/g,'')}` : '' };
  Object.entries(map).forEach(([k, v]) => {
    const a = $(`#social-${k}`);
    if (!a) return;
    if (v) { a.href = v; a.style.display = ''; } else { a.style.display = 'none'; }
  });
}

// ---------- Auth ----------
async function loadAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    state.user = session?.user || null;
    state.isAdmin = !!state.user && ADMIN_EMAILS.includes(state.user.email.toLowerCase());
    if (state.user) {
      try {
        const { data: prof } = await supabaseClient.from('profiles').select('*').eq('id', state.user.id).single();
        state.profile = prof;
      } catch {}
    }
  } catch (e) { state.user = null; }
}
function renderAuthState() {
  const userName = state.profile?.name || state.user?.email?.split('@')[0] || '';
  $$('[data-account-link]').forEach(a => {
    if (state.user) {
      a.innerHTML = a.querySelector('i') ? `<i class="fas fa-user"></i>` : escapeHTML(userName || 'Account');
      a.href = 'account.html';
    } else {
      a.innerHTML = a.querySelector('i') ? `<i class="fas fa-user"></i>` : 'Login';
      a.href = 'login.html';
    }
  });
  const adminLink = $('.admin-link');
  if (adminLink) {
    if (state.isAdmin) adminLink.classList.add('show');
    else adminLink.classList.remove('show');
  }
}
async function doLogout() {
  await supabaseClient.auth.signOut();
  location.href = 'index.html';
}
window.doLogout = doLogout;

// ---------- Products ----------
async function loadProducts() {
  try {
    const { data } = await supabaseClient.from('products').select('*').eq('status', 'Active').order('created_at', { ascending: false });
    state.products = data || [];
  } catch (e) { state.products = []; }
}
function productCardHTML(p) {
  const stock = Number(p.stock || 0);
  const imgHTML = p.image_url
    ? `<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'placeholder',innerHTML:'<i class=\\'fas fa-image\\'></i>'}))" />`
    : `<div class="placeholder"><i class="fas fa-image"></i></div>`;
  const offer = p.offer_price && Number(p.offer_price) > 0 && Number(p.offer_price) < Number(p.price);
  const save = offer ? Math.round(((p.price - p.offer_price) / p.price) * 100) : 0;
  return `<a class="product-card" href="product.html?id=${encodeURIComponent(p.id)}" data-testid="product-card-${escapeHTML(p.id)}">
    <div class="img-wrap">
      ${imgHTML}
      ${p.badge ? `<span class="badge-pill ${p.badge.toLowerCase().includes('sale') || offer ? 'gold' : ''}">${escapeHTML(p.badge)}</span>` : ''}
      ${stock === 0 ? `<span class="stock-tag">Out of stock</span>` : ''}
    </div>
    <div class="info">
      <div class="cat">${escapeHTML(p.category || 'Premium')}</div>
      <h3>${escapeHTML(p.name)}</h3>
      <div class="price-row">
        <span class="price">${fmtINR(offer ? p.offer_price : p.price)}</span>
        ${offer ? `<span class="price-old">${fmtINR(p.price)}</span><span class="save">−${save}%</span>` : ''}
      </div>
    </div>
  </a>`;
}

function renderHomeProducts() {
  const slot = $('#home-products');
  if (!slot) return;
  const items = state.products.slice(0, 8);
  if (!items.length) {
    slot.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-box-open"></i><h3>Catalog refreshing soon</h3><p>Our team is curating the next collection.</p></div>`;
    return;
  }
  slot.innerHTML = items.map(productCardHTML).join('');
}

function renderHomeCollections() {
  const slot = $('#home-collections');
  if (!slot) return;
  const cats = state.categories.slice(0, 6);
  const fallbackImgs = ['bg-maroon','bg-gold','bg-rose','bg-sage','bg-silver','bg-cream'];
  if (!cats.length) { slot.innerHTML = ''; return; }
  slot.innerHTML = cats.map((c, i) => {
    const productsInCat = state.products.filter(p => (p.category||'') === c.name).length;
    const bg = c.image_url ? `style="background-image:url('${escapeHTML(c.image_url)}');background-size:cover;background-position:center;"` : '';
    const cls = c.image_url ? '' : fallbackImgs[i % fallbackImgs.length];
    return `<a class="collection-card" href="products.html?cat=${encodeURIComponent(c.name)}" data-testid="cat-card-${escapeHTML(c.name)}">
      <div class="visual ${cls}" ${bg}></div>
      <div class="label">
        <h3>${escapeHTML(c.name)}</h3>
        <span>${productsInCat} product${productsInCat===1?'':'s'}</span>
      </div>
    </a>`;
  }).join('');
}

function renderProductsListing() {
  const slot = $('[data-products]');
  if (!slot) return;
  const q = ($('[data-product-search]')?.value || '').toLowerCase().trim();
  const cat = ($('[data-product-filter]')?.value || param('cat') || 'all');
  const sort = ($('[data-product-sort]')?.value || 'default');

  // Set category filter from query param on first render
  if (param('cat') && $('[data-product-filter]') && !$('[data-product-filter]').dataset.set) {
    $('[data-product-filter]').value = param('cat');
    $('[data-product-filter]').dataset.set = '1';
  }

  let items = state.products.slice();
  if (cat && cat !== 'all') items = items.filter(p => (p.category||'').toLowerCase() === cat.toLowerCase());
  if (q) items = items.filter(p => `${p.name} ${p.category||''} ${p.description||''} ${p.sku||''}`.toLowerCase().includes(q));
  const eff = (p) => p.offer_price && p.offer_price < p.price ? p.offer_price : p.price;
  if (sort === 'price_asc')  items.sort((a,b) => eff(a) - eff(b));
  if (sort === 'price_desc') items.sort((a,b) => eff(b) - eff(a));

  if (!items.length) {
    slot.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search"></i><h3>No products found</h3><p>Try adjusting filters or browsing all collections.</p></div>`;
    return;
  }
  slot.innerHTML = items.map(productCardHTML).join('');
  const sub = $('#products-count');
  if (sub) sub.textContent = `${items.length} product${items.length===1?'':'s'}`;
}

function populateCategoryFilter() {
  const sel = $('[data-product-filter]');
  if (!sel) return;
  const existing = state.categories.map(c => c.name);
  sel.innerHTML = `<option value="all">All Collections</option>` + existing.map(n => `<option value="${escapeHTML(n)}">${escapeHTML(n)}</option>`).join('');
}

function renderProductDetail() {
  const slot = $('[data-product-detail]');
  if (!slot) return;
  const id = param('id');
  const p = state.products.find(x => x.id === id);
  if (!p) {
    slot.innerHTML = `<div class="empty-state"><i class="fas fa-box-open"></i><h3>Product not found</h3><p>This item may have been removed.</p><a class="btn primary" href="products.html">Browse All</a></div>`;
    return;
  }
  if (state.settings.site_title) document.title = `${p.name} · ${state.settings.site_title}`;
  if (p.seo_description) setMeta('description', p.seo_description);

  const offer = p.offer_price && p.offer_price < p.price;
  const save = offer ? Math.round(((p.price - p.offer_price) / p.price) * 100) : 0;
  const stock = Number(p.stock || 0);
  const imgHTML = p.image_url
    ? `<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" />`
    : `<div class="placeholder"><i class="fas fa-image"></i></div>`;

  const related = state.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  slot.innerHTML = `
    <div class="product-detail">
      <div class="pd-gallery">${imgHTML}</div>
      <div class="pd-info">
        ${p.category ? `<div class="cat">${escapeHTML(p.category)}</div>` : ''}
        <h1>${escapeHTML(p.name)}</h1>
        <div class="price-row">
          <span class="price">${fmtINR(offer ? p.offer_price : p.price)}</span>
          ${offer ? `<span class="price-old">${fmtINR(p.price)}</span><span class="save-tag">Save ${save}%</span>` : ''}
        </div>
        ${p.description ? `<p class="desc">${escapeHTML(p.description)}</p>` : ''}
        <div class="qty-row">
          <span style="font-weight:600;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);">Quantity</span>
          <div class="qty-stepper">
            <button onclick="changeQty(-1)" aria-label="Decrease" data-testid="pd-qty-minus"><i class="fas fa-minus"></i></button>
            <input id="pd-qty" type="number" min="1" max="${stock || 999}" value="1" data-testid="pd-qty" />
            <button onclick="changeQty(1)" aria-label="Increase" data-testid="pd-qty-plus"><i class="fas fa-plus"></i></button>
          </div>
          ${stock <= 5 && stock > 0 ? `<span style="font-size:12px;color:var(--error);font-weight:600;">Only ${stock} left</span>` : ''}
          ${stock === 0 ? `<span style="font-size:12px;color:var(--error);font-weight:600;">Out of stock</span>` : ''}
        </div>
        <div class="actions">
          <button class="btn primary" onclick="addToCartFromDetail('${escapeHTML(p.id)}')" ${stock===0?'disabled':''} data-testid="pd-add-cart"><i class="fas fa-cart-plus"></i> Add to Cart</button>
          <a class="btn secondary" href="bulk.html?product=${encodeURIComponent(p.id)}" data-testid="pd-bulk-enquiry"><i class="fab fa-whatsapp"></i> Bulk Enquiry</a>
        </div>
        <div class="pd-perks">
          <div class="perk"><i class="fas fa-truck"></i><div><b>Pan India delivery</b><br><span style="color:var(--muted)">Free shipping over ₹999</span></div></div>
          <div class="perk"><i class="fas fa-box-open"></i><div><b>Premium packaging</b><br><span style="color:var(--muted)">Gift-ready out of the box</span></div></div>
          <div class="perk"><i class="fas fa-shield-halved"></i><div><b>Secure checkout</b><br><span style="color:var(--muted)">Razorpay / UPI / Card</span></div></div>
          <div class="perk"><i class="fas fa-rotate-left"></i><div><b>Easy returns</b><br><span style="color:var(--muted)">7-day return window</span></div></div>
        </div>
      </div>
    </div>
    ${related.length ? `
      <section style="margin-top:64px;">
        <div class="section-head" style="text-align:left;margin-bottom:24px;"><h2 style="font-size:1.8rem;">You may also love</h2></div>
        <div class="product-grid">${related.map(productCardHTML).join('')}</div>
      </section>` : ''}
  `;
}
window.changeQty = function(delta) {
  const inp = $('#pd-qty');
  if (!inp) return;
  const v = Math.max(1, (parseInt(inp.value, 10) || 1) + delta);
  inp.value = v;
};
window.addToCartFromDetail = async function(productId) {
  const qty = Math.max(1, parseInt($('#pd-qty')?.value, 10) || 1);
  await addToCart(productId, qty);
};

// ---------- Cart ----------
async function loadCart() {
  if (!state.user) {
    // Guest cart in localStorage
    try { state.cart = JSON.parse(localStorage.getItem('oncost_cart') || '[]'); }
    catch { state.cart = []; }
    state.cart.forEach(it => { it.product = state.products.find(p => p.id === it.product_id); });
    return;
  }
  try {
    const { data } = await supabaseClient.from('cart_items').select('*').eq('user_id', state.user.id);
    state.cart = (data || []).map(it => ({ ...it, product: state.products.find(p => p.id === it.product_id) }));
  } catch { state.cart = []; }
}
function saveGuestCart() {
  if (state.user) return;
  const minimal = state.cart.map(it => ({ id: it.id, product_id: it.product_id, qty: it.qty }));
  localStorage.setItem('oncost_cart', JSON.stringify(minimal));
}

async function addToCart(productId, qty = 1) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return toast('Product not available', 'err');
  if (state.user) {
    // Check existing
    const existing = state.cart.find(it => it.product_id === productId);
    if (existing) {
      await supabaseClient.from('cart_items').update({ qty: existing.qty + qty }).eq('id', existing.id);
      existing.qty += qty;
    } else {
      const { data, error } = await supabaseClient.from('cart_items').insert({ user_id: state.user.id, product_id: productId, qty }).select().single();
      if (error) return toast('Could not add: ' + error.message, 'err');
      data.product = product;
      state.cart.push(data);
    }
  } else {
    const existing = state.cart.find(it => it.product_id === productId);
    if (existing) existing.qty += qty;
    else state.cart.push({ id: 'g-' + Date.now(), product_id: productId, qty, product });
    saveGuestCart();
  }
  toast(`Added "${product.name}" × ${qty}`, 'ok');
  updateCartBadge();
}
async function updateCartQty(rowId, qty) {
  qty = Math.max(1, parseInt(qty, 10) || 1);
  const it = state.cart.find(x => x.id === rowId);
  if (!it) return;
  it.qty = qty;
  if (state.user && !String(rowId).startsWith('g-')) await supabaseClient.from('cart_items').update({ qty }).eq('id', rowId);
  else saveGuestCart();
  renderCart();
  updateCartBadge();
}
async function removeCartItem(rowId) {
  if (state.user && !String(rowId).startsWith('g-')) await supabaseClient.from('cart_items').delete().eq('id', rowId);
  state.cart = state.cart.filter(x => x.id !== rowId);
  saveGuestCart();
  renderCart();
  updateCartBadge();
  toast('Item removed');
}
window.updateCartQty = updateCartQty;
window.removeCartItem = removeCartItem;

function updateCartBadge() {
  const count = state.cart.reduce((s, it) => s + (it.qty || 1), 0);
  $$('[data-cart-count]').forEach(el => {
    let b = el.querySelector('.badge');
    if (count > 0) {
      if (!b) { b = document.createElement('span'); b.className = 'badge'; el.appendChild(b); }
      b.textContent = count > 99 ? '99+' : count;
    } else if (b) b.remove();
  });
}

function cartTotals() {
  let subtotal = 0;
  state.cart.forEach(it => {
    if (!it.product) return;
    const eff = (it.product.offer_price && it.product.offer_price < it.product.price) ? it.product.offer_price : it.product.price;
    subtotal += eff * it.qty;
  });
  let discount = 0;
  if (state.appliedCoupon) {
    if (state.appliedCoupon.discount_type === 'percent') discount = subtotal * state.appliedCoupon.discount_value / 100;
    else discount = state.appliedCoupon.discount_value;
    discount = Math.min(discount, subtotal);
  }
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, discount, shipping, total };
}

function renderCart() {
  const slot = $('[data-cart]');
  if (!slot) return;
  if (!state.cart.length) {
    slot.innerHTML = `<div class="empty-state"><i class="fas fa-cart-shopping"></i><h3>Your cart is empty</h3><p>Discover our curated collections of brass &amp; gifting essentials.</p><a class="btn primary" href="products.html"><i class="fas fa-store"></i> Start Shopping</a></div>`;
    return;
  }
  const { subtotal, discount, shipping, total } = cartTotals();
  const guestNote = !state.user ? `<div style="background:var(--gold-soft);border:1px solid var(--gold);padding:12px;border-radius:6px;font-size:13px;margin-bottom:18px;"><b>Tip:</b> <a href="login.html" style="color:var(--burgundy);font-weight:700;">Log in</a> to save your cart across devices.</div>` : '';

  slot.innerHTML = `
    ${guestNote}
    <div class="cart-grid">
      <div class="cart-list">
        ${state.cart.map(it => {
          if (!it.product) return '';
          const p = it.product;
          const eff = (p.offer_price && p.offer_price < p.price) ? p.offer_price : p.price;
          const img = p.image_url
            ? `<img src="${escapeHTML(p.image_url)}" alt="" onerror="this.style.display='none'" />`
            : `<div style="width:100%;height:100%;display:grid;place-items:center;color:var(--muted);"><i class="fas fa-image"></i></div>`;
          return `<div class="cart-row" data-testid="cart-row-${escapeHTML(it.id)}">
            <div class="thumb">${img}</div>
            <div class="meta"><h4>${escapeHTML(p.name)}</h4><div class="c">${escapeHTML(p.category||'')} · ${fmtINR(eff)} each</div></div>
            <div class="qty-stepper">
              <button onclick="updateCartQty('${escapeHTML(it.id)}', ${it.qty - 1})"><i class="fas fa-minus"></i></button>
              <input value="${it.qty}" onchange="updateCartQty('${escapeHTML(it.id)}', this.value)" type="number" min="1" />
              <button onclick="updateCartQty('${escapeHTML(it.id)}', ${it.qty + 1})"><i class="fas fa-plus"></i></button>
            </div>
            <div class="line-total">${fmtINR(eff * it.qty)}</div>
            <button class="remove" onclick="removeCartItem('${escapeHTML(it.id)}')" title="Remove" data-testid="cart-remove-${escapeHTML(it.id)}"><i class="fas fa-trash"></i></button>
          </div>`;
        }).join('')}
      </div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="line"><span>Subtotal</span><span>${fmtINR(subtotal)}</span></div>
        ${discount > 0 ? `<div class="line" style="color:var(--success);"><span>Discount (${escapeHTML(state.appliedCoupon.code)})</span><span>−${fmtINR(discount)}</span></div>` : ''}
        <div class="line"><span>Shipping</span><span>${shipping === 0 ? 'Free' : fmtINR(shipping)}</span></div>
        <div class="line total"><span>Total</span><span>${fmtINR(total)}</span></div>

        <div class="coupon">
          <input class="field" id="coupon-input" placeholder="Coupon code" value="${state.appliedCoupon ? escapeHTML(state.appliedCoupon.code) : ''}" />
          <button class="btn outline sm" onclick="applyCoupon()" data-testid="apply-coupon">${state.appliedCoupon ? 'Remove' : 'Apply'}</button>
        </div>
        <div class="coupon-msg" id="coupon-msg"></div>

        <button class="btn primary block" style="margin-top:8px;" onclick="placeOrder()" data-testid="place-order"><i class="fas fa-lock"></i> Proceed to Checkout</button>
        <a class="btn ghost block" href="bulk.html"><i class="fab fa-whatsapp"></i> Or send bulk enquiry</a>
      </div>
    </div>
  `;
}
window.applyCoupon = async function() {
  if (state.appliedCoupon) {
    state.appliedCoupon = null;
    renderCart();
    return;
  }
  const code = ($('#coupon-input')?.value || '').trim().toUpperCase();
  const msgEl = $('#coupon-msg');
  if (!code) return;
  try {
    const { data } = await supabaseClient.from('coupons').select('*').ilike('code', code).limit(1);
    if (!data || !data.length) { msgEl.textContent = 'Invalid coupon code'; msgEl.className = 'coupon-msg err'; return; }
    const c = data[0];
    if (c.expires_at && new Date(c.expires_at) < new Date()) { msgEl.textContent = 'This coupon has expired'; msgEl.className = 'coupon-msg err'; return; }
    if (c.usage_limit && c.used_count >= c.usage_limit) { msgEl.textContent = 'Coupon usage limit reached'; msgEl.className = 'coupon-msg err'; return; }
    const { subtotal } = cartTotals();
    if (c.min_order_amount && subtotal < c.min_order_amount) {
      msgEl.textContent = `Minimum order ${fmtINR(c.min_order_amount)} required`; msgEl.className = 'coupon-msg err'; return;
    }
    state.appliedCoupon = c;
    renderCart();
    toast(`Coupon ${c.code} applied`, 'ok');
  } catch (e) {
    msgEl.textContent = 'Could not validate coupon';
    msgEl.className = 'coupon-msg err';
  }
};

window.placeOrder = async function() {
  if (!state.cart.length) return;
  if (!state.user) {
    toast('Please log in to place an order', '');
    setTimeout(() => location.href = 'login.html?redirect=cart.html', 1000);
    return;
  }
  const { subtotal, discount, shipping, total } = cartTotals();
  const items = state.cart.map(it => ({
    product_id: it.product_id, name: it.product?.name,
    qty: it.qty, price: (it.product?.offer_price && it.product.offer_price < it.product.price) ? it.product.offer_price : it.product?.price,
  }));
  try {
    const { error } = await supabaseClient.from('orders').insert({
      user_id: state.user.id,
      items, total_amount: total, status: 'Processing',
      guest_email: state.user.email,
      shipping_address: { note: 'Provided after checkout' },
    });
    if (error) return toast('Order failed: ' + error.message, 'err');
    // Clear cart
    if (state.cart.some(it => !String(it.id).startsWith('g-'))) {
      await supabaseClient.from('cart_items').delete().eq('user_id', state.user.id);
    }
    state.cart = []; saveGuestCart();
    toast('Order placed! 🎉', 'ok');
    setTimeout(() => location.href = 'account.html?tab=orders', 1200);
  } catch (e) { toast('Order failed: ' + e.message, 'err'); }
};

// ---------- Testimonials ----------
async function loadTestimonials() {
  try {
    const { data } = await supabaseClient.from('testimonials').select('*').eq('status', 'Approved').order('created_at', { ascending: false });
    state.testimonials = data || [];
  } catch { state.testimonials = []; }
}
function renderReviewsMarquee() {
  const slot = $('#reviews-marquee');
  if (!slot) return;
  const fallback = [
    { customer_name: 'Priya S.', review_text: 'Absolutely stunning packaging!' },
    { customer_name: 'Rahul K.',  review_text: 'Perfect return gifts for our wedding.' },
    { customer_name: 'Ananya T.', review_text: 'Great quality brass items, highly recommend.' },
    { customer_name: 'Vikram M.', review_text: 'Super fast delivery for my bulk order.' },
    { customer_name: 'Sneha R.',  review_text: 'The guests loved the thambulam sets!' },
  ];
  const items = state.testimonials.length ? state.testimonials : fallback;
  const cardsHTML = items.map(t => `<div class="review-item">"${escapeHTML(t.review_text)}" <span class="author">— ${escapeHTML(t.customer_name)}</span></div>`).join('');
  slot.innerHTML = cardsHTML + cardsHTML;  // duplicate for seamless loop
}

// ---------- Categories ----------
async function loadCategories() {
  try {
    const { data } = await supabaseClient.from('categories').select('*').order('name', { ascending: true });
    state.categories = data || [];
  } catch { state.categories = []; }
}

// ---------- Account ----------
async function renderAccount() {
  const slot = $('[data-account]');
  if (!slot) return;
  if (!state.user) {
    slot.innerHTML = `<div class="empty-state"><i class="fas fa-user-lock"></i><h3>Please sign in</h3><p>Access your orders, wishlist and bulk enquiries.</p><a class="btn primary" href="login.html"><i class="fas fa-right-to-bracket"></i> Sign in</a> <a class="btn outline" href="signup.html">Create account</a></div>`;
    return;
  }
  const tab = param('tab') || 'orders';
  let orders = [], leads = [];
  try { const r = await supabaseClient.from('orders').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false }); orders = r.data || []; } catch {}
  try { const r = await supabaseClient.from('leads').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false }); leads = r.data || []; } catch {}

  slot.innerHTML = `
    <div class="account-grid">
      <aside class="account-side">
        <div style="padding:6px 12px 16px;border-bottom:1px solid var(--line);margin-bottom:12px;">
          <div style="font-weight:600;font-size:14px;">${escapeHTML(state.profile?.name || state.user.email.split('@')[0])}</div>
          <div style="font-size:12px;color:var(--muted);">${escapeHTML(state.user.email)}</div>
        </div>
        <button class="${tab==='orders'?'active':''}" onclick="location.href='account.html?tab=orders'"><i class="fas fa-receipt"></i> My Orders</button>
        <button class="${tab==='enquiries'?'active':''}" onclick="location.href='account.html?tab=enquiries'"><i class="fas fa-envelope"></i> Enquiries</button>
        <button class="${tab==='profile'?'active':''}" onclick="location.href='account.html?tab=profile'"><i class="fas fa-user"></i> Profile</button>
        ${state.isAdmin ? `<button onclick="location.href='admin-dashboard.html'" style="color:var(--gold);font-weight:700;border-top:1px solid var(--line);margin-top:8px;padding-top:14px;"><i class="fas fa-shield-halved"></i> Admin Console</button>` : ''}
        <button onclick="doLogout()"><i class="fas fa-right-from-bracket"></i> Sign out</button>
      </aside>
      <main class="account-pane">
        ${tab === 'orders' ? renderAccountOrders(orders) : ''}
        ${tab === 'enquiries' ? renderAccountLeads(leads) : ''}
        ${tab === 'profile' ? renderAccountProfile() : ''}
      </main>
    </div>
  `;
}
function renderAccountOrders(orders) {
  if (!orders.length) return `<h2>My Orders</h2><div class="empty-state"><i class="fas fa-receipt"></i><h3>No orders yet</h3><p>Your orders will show up here.</p><a class="btn primary" href="products.html">Browse Products</a></div>`;
  return `<h2>My Orders</h2>${orders.map(o => `
    <div style="border:1px solid var(--line);border-radius:6px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div><b>#${escapeHTML(String(o.id).substring(0,8))}</b> <span style="color:var(--muted);font-size:12px;">· ${new Date(o.created_at).toLocaleDateString()}</span></div>
        <span style="padding:3px 10px;border-radius:4px;background:var(--cream);color:var(--burgundy);font-size:12px;font-weight:600;">${escapeHTML(o.status)}</span>
      </div>
      <div style="font-size:13px;color:var(--muted);">${(Array.isArray(o.items) ? o.items : []).map(i => escapeHTML(i.name)).join(' · ')}</div>
      <div style="margin-top:8px;font-weight:700;color:var(--burgundy);">${fmtINR(o.total_amount)}</div>
    </div>
  `).join('')}`;
}
function renderAccountLeads(leads) {
  if (!leads.length) return `<h2>My Enquiries</h2><div class="empty-state"><i class="fas fa-envelope-open"></i><h3>No enquiries yet</h3><p>Need bulk pricing or customization? Send us an enquiry.</p><a class="btn primary" href="bulk.html">Submit Bulk Enquiry</a></div>`;
  return `<h2>My Enquiries</h2>${leads.map(l => `
    <div style="border:1px solid var(--line);border-radius:6px;padding:16px;margin-bottom:12px;">
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px;">${new Date(l.created_at).toLocaleDateString()} ${l.product_id ? `· ${escapeHTML(l.product_id)}` : ''}</div>
      <div style="font-size:14px;">${escapeHTML(l.summary)}</div>
    </div>
  `).join('')}`;
}
function renderAccountProfile() {
  const p = state.profile || {};
  return `<h2>Profile</h2>
    <div style="display:grid;gap:14px;max-width:480px;">
      <label>Name <input id="prof-name" class="field" value="${escapeHTML(p.name||'')}" /></label>
      <label>Phone <input id="prof-phone" class="field" value="${escapeHTML(p.phone||'')}" /></label>
      <button class="btn primary" onclick="saveProfile()" style="justify-self:start;"><i class="fas fa-save"></i> Save</button>
    </div>`;
}
window.saveProfile = async function() {
  const payload = { id: state.user.id, name: $('#prof-name').value, phone: $('#prof-phone').value };
  const { data, error } = await supabaseClient.from('profiles').upsert(payload).select().single();
  if (error) return toast('Save failed: ' + error.message, 'err');
  state.profile = data;
  toast('Profile saved', 'ok');
};

// ---------- Bulk Enquiry ----------
function setupEnquiryForm() {
  const form = $('[data-enquiry-form]');
  if (!form) return;
  const productSlot = $('[data-selected-product]');
  if (productSlot) {
    const pid = param('product');
    if (pid) {
      const p = state.products.find(x => x.id === pid);
      if (p) productSlot.textContent = `Enquiry for: ${p.name}`;
    }
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const summary = `Name: ${fd.get('name')} | Email: ${fd.get('email')} | Phone: ${fd.get('phone')} | GSTIN: ${fd.get('gstin')||'—'} | Event: ${fd.get('eventType')} | Qty: ${fd.get('quantity')} | Date: ${fd.get('eventDate')||'—'} | Budget: ${fd.get('budget')||'—'} | Message: ${fd.get('message')||'—'}`;
    try {
      await supabaseClient.from('leads').insert({
        user_id: state.user?.id || null,
        product_id: param('product') || null,
        summary,
      });
      toast('Enquiry sent — we will reach out soon!', 'ok');
      form.reset();
    } catch (err) { toast('Failed: ' + err.message, 'err'); }
  });
}

// ---------- Boot ----------
async function bootstrap() {
  await Promise.all([loadAuth(), loadSettings(), loadSaleEvents(), loadCategories(), loadProducts(), loadTestimonials()]);
  await loadCart();

  applySEO();
  applyWhatsappFab();
  applyFooterSocials();
  renderSaleBanner();
  renderAuthState();
  updateCartBadge();

  // Page-specific renders
  renderHomeProducts();
  renderHomeCollections();
  populateCategoryFilter();
  renderProductsListing();
  renderProductDetail();
  renderReviewsMarquee();
  renderCart();
  await renderAccount();
  setupEnquiryForm();

  // Hook up controls
  const s = $('[data-product-search]'); if (s) s.addEventListener('input', renderProductsListing);
  const f = $('[data-product-filter]'); if (f) f.addEventListener('change', renderProductsListing);
  const so = $('[data-product-sort]'); if (so) so.addEventListener('change', renderProductsListing);
  const lo = $('[data-logout]'); if (lo) lo.addEventListener('click', doLogout);

  // Review modal (if on home)
  const writeBtn = $('#write-review-btn');
  if (writeBtn) writeBtn.addEventListener('click', () => $('#review-modal')?.showModal());
  $('#close-review-modal')?.addEventListener('click', () => $('#review-modal')?.close());
  $('#submit-review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.user) return toast('Please log in to submit a review', '');
    try {
      await supabaseClient.from('testimonials').insert({
        user_id: state.user.id,
        customer_name: state.profile?.name || state.user.email.split('@')[0],
        rating: parseInt($('#review-rating').value, 10),
        review_text: $('#review-text').value,
        status: 'Pending',
      });
      $('#review-modal')?.close();
      toast('Review submitted! Awaiting moderation.', 'ok');
    } catch (err) { toast('Failed: ' + err.message, 'err'); }
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
