import re

with open("app.js", "r") as f:
    code = f.read()

# 1. renderProducts: Add sorting
code = re.sub(
    r'const collection = document\.querySelector\("\[data-product-filter\]"\);',
    'const collection = document.querySelector("[data-product-filter]");\n  const sortElem = document.querySelector("[data-product-sort]");',
    code
)
code = re.sub(
    r'const selected = collection\?\.value \|\| "all";',
    'const selected = collection?.value || "all";\n    const sortVal = sortElem?.value || "default";',
    code
)
code = re.sub(
    r'const matchesCollection = selected === "all" \|\| product\.collection === selected;\n      return matchesQuery && matchesCollection;\n    }\);',
    r'''const matchesCollection = selected === "all" || product.collection === selected;
      return matchesQuery && matchesCollection;
    });
    
    if (sortVal === "price_asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortVal === "price_desc") {
      products.sort((a, b) => b.price - a.price);
    }''',
    code
)
code = re.sub(
    r'collection\?\.addEventListener\("change", draw\);',
    'collection?.addEventListener("change", draw);\n  sortElem?.addEventListener("change", draw);',
    code
)

# 2. renderProductDetail: Remove requireLogin
code = re.sub(r'if \(!\(await requireLogin\(\)\)\) return;\n\n  const product = getProductFromUrl\(\);', 'const product = getProductFromUrl();', code)

# 3. addToCart: Add Guest mode
add_to_cart_new = '''async function addToCart(productId) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const product = ONCOST_PRODUCTS.find((item) => item.id === productId);
  if (!product) return;
  
  if (session) {
    const { data: existing } = await supabaseClient.from('cart_items').select('*').eq('user_id', session.user.id).eq('product_id', productId).single();
    if (existing) {
      await supabaseClient.from('cart_items').update({ qty: existing.qty + 1 }).eq('id', existing.id);
    } else {
      await supabaseClient.from('cart_items').insert([{ user_id: session.user.id, product_id: productId, qty: 1 }]);
    }
  } else {
    const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    const existing = cart.find(i => i.product_id === productId);
    if (existing) existing.qty++;
    else cart.push({ product_id: productId, qty: 1 });
    localStorage.setItem('guest_cart', JSON.stringify(cart));
  }
  await updateShell();
  alert(`${product.name} added to cart.`);
}'''
code = re.sub(r'async function addToCart\(productId\) \{.*?(?=async function renderCart)', add_to_cart_new + '\n\n', code, flags=re.DOTALL)

# 4. renderCart: Add Guest mode
render_cart_new = '''async function renderCart() {
  const mount = document.querySelector("[data-cart]");
  if (!mount) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  let cart = [];
  
  if (session) {
    const { data } = await supabaseClient.from('cart_items').select('*').eq('user_id', session.user.id);
    cart = data || [];
  } else {
    cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
  }

  if (!cart || !cart.length) {
    mount.innerHTML = `<div class="card"><h3>Your cart is empty</h3><p>Browse products and add gifts for your event.</p><a class="button primary" href="products.html">Shop Products</a></div>`;
    return;
  }

  let total = 0;
  mount.innerHTML = cart.map((item) => {
    const product = ONCOST_PRODUCTS.find((entry) => entry.id === item.product_id);
    if (!product) return "";
    total += product.price * item.qty;
    return `
      <div class="cart-row">
        <div><strong>${product.name}</strong><p>${product.collection}</p></div>
        <span>Qty ${item.qty}</span>
        <strong>${money(product.price * item.qty)}</strong>
      </div>
    `;
  }).join("") + `<div class="card"><h3>Estimated total: ${money(total)}</h3><p>Final bulk pricing and shipping can be confirmed by the ONCOST team.</p><a class="button primary" href="enquiry.html">Send Enquiry</a> <a class="button pay" href="payment.html">Pay Now</a></div>`;
}'''
code = re.sub(r'async function renderCart\(\) \{.*?(?=async function renderAccount)', render_cart_new + '\n\n', code, flags=re.DOTALL)

# 5. updateShell: Add Guest mode cart badge count
update_shell_new = '''async function updateShell() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const accountLinks = document.querySelectorAll("[data-account-link]");
  const cartBadges = document.querySelectorAll("[data-cart-count]");
  
  let cartCount = 0;
  if (session) {
    const { data: cart } = await supabaseClient.from('cart_items').select('qty').eq('user_id', session.user.id);
    if (cart) cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  } else {
    const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  }

  accountLinks.forEach((link) => {
    link.textContent = session ? "Account" : "Login";
    link.setAttribute("href", session ? "account.html" : "login.html");
  });

  cartBadges.forEach((badge) => {
    badge.textContent = cartCount ? `Cart (${cartCount})` : "Cart";
  });
}'''
code = re.sub(r'async function updateShell\(\) \{.*?(?=async function renderProducts)', update_shell_new + '\n\n', code, flags=re.DOTALL)

# 6. renderPayment: Add Guest email/phone form
render_payment_new = '''async function renderPayment() {
  const mount = document.querySelector("[data-payment]");
  if (!mount) return;

  const product = getProductFromUrl();
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  let amount = 0;
  let label = "";
  let cart = [];
  
  if (product && window.location.search.includes("id=")) {
    amount = product.price;
    label = `1x ${product.name}`;
  } else {
    if (session) {
      const { data } = await supabaseClient.from('cart_items').select('*').eq('user_id', session.user.id);
      cart = data || [];
    } else {
      cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
    }
    cart.forEach(item => {
      const p = ONCOST_PRODUCTS.find(p => p.id === item.product_id);
      if (p) amount += p.price * item.qty;
    });
    label = `Cart Checkout (${cart.length} items)`;
  }
  
  const guestFormHtml = !session ? `
    <div style="margin-bottom:16px;">
      <label style="display:block; margin-bottom:4px; font-weight:bold;">Email for Order Updates</label>
      <input type="email" id="guest-email" class="field" placeholder="Enter your email" required style="width:100%;">
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block; margin-bottom:4px; font-weight:bold;">Phone Number</label>
      <input type="tel" id="guest-phone" class="field" placeholder="Enter your phone" style="width:100%;">
    </div>
  ` : "";

  mount.innerHTML = `
    <article class="card">
      <h1>Pay Now</h1>
      <p><strong>${label}</strong></p>
      <p class="price">Estimated amount: ${money(amount || 0)}</p>
      <ul class="meta-list">
        <li>Use this page for MyBillBook invoice payment link or your payment gateway checkout.</li>
      </ul>
      ${guestFormHtml}
      <button class="button pay" id="complete-order-btn">Complete Order</button>
    </article>
  `;
  
  document.getElementById('complete-order-btn')?.addEventListener('click', async () => {
    let guestEmail = null;
    let guestPhone = null;
    
    if (!session) {
      guestEmail = document.getElementById('guest-email')?.value;
      guestPhone = document.getElementById('guest-phone')?.value;
      if (!guestEmail) {
        alert("Please enter an email address.");
        return;
      }
    }

    const btn = document.getElementById('complete-order-btn');
    btn.textContent = "Processing...";
    btn.disabled = true;
    
    const { data: order, error } = await supabaseClient.from('orders').insert([{
      user_id: session ? session.user.id : null,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      items: product && window.location.search.includes("id=") ? [{ id: product.id, qty: 1 }] : cart,
      status: 'Processing',
      total_amount: amount
    }]).select();
    
    if (error) {
      alert("Failed to create order: " + error.message);
      btn.textContent = "Try Again";
      btn.disabled = false;
      return;
    }
    
    if (session) {
      await supabaseClient.from('cart_items').delete().eq('user_id', session.user.id);
    } else {
      localStorage.removeItem('guest_cart');
    }
    
    alert("Order completed successfully!");
    location.href = session ? "account.html" : "index.html";
  });
}'''
code = re.sub(r'async function renderPayment\(\) \{.*?(?=function bindAuthForms)', render_payment_new + '\n\n', code, flags=re.DOTALL)

# 7. renderAccount: Add Order History UI
render_account_new = '''async function renderAccount() {
  const mount = document.querySelector("[data-account]");
  if (!mount) return;
  if (!(await requireLogin())) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
  const { data: leads } = await supabaseClient.from('leads').select('*').eq('user_id', session.user.id);
  const { data: orders } = await supabaseClient.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
  
  const leadsCount = leads ? leads.length : 0;
  const ordersCount = orders ? orders.length : 0;
  
  const ordersListHtml = orders && orders.length > 0 
    ? orders.map(o => `
        <div style="border: 1px solid var(--line); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="font-size:0.9rem;">Order ID: ${o.id.split('-')[0]}...</strong>
            <span style="background:var(--champagne); color:var(--burgundy); font-weight:bold; padding:2px 8px; border-radius:12px; font-size:0.8rem;">${o.status}</span>
          </div>
          <p style="margin:0; font-size:0.85rem; color:#666;">Placed on: ${new Date(o.created_at).toLocaleDateString()}</p>
          <p style="margin:4px 0 0; font-weight:bold;">${money(o.total_amount)}</p>
        </div>
      `).join('')
    : '<p>No orders placed yet.</p>';

  mount.innerHTML = `
    <div class="module-grid">
      <article class="card"><h3>Profile</h3><p>${profile ? profile.name : session.user.email}</p><p>${session.user.email}</p></article>
      <article class="card" style="grid-row: span 2;">
        <h3>Order History</h3>
        <div style="margin-top:16px;">${ordersListHtml}</div>
      </article>
      <article class="card"><h3>Leads Submitted</h3><p>${leadsCount} enquiry lead${leadsCount === 1 ? "" : "s"} saved.</p></article>
      <article class="card"><h3>Support</h3><p>Use bulk enquiry for event quantities, packaging, and delivery discussion.</p></article>
    </div>
  `;
}'''
code = re.sub(r'async function renderAccount\(\) \{.*?(?=async function renderEnquiry)', render_account_new + '\n\n', code, flags=re.DOTALL)


with open("app.js", "w") as f:
    f.write(code)
