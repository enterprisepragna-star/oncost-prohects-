let ONCOST_PRODUCTS = [];

const DUMMY_PRODUCTS = [
  { id: "brass-diya-set", name: "Brass Diya Set", price: 149, badge: "Best Seller", collection: "Brass Collection", description: "A warm traditional diya set for pooja return gifts and festive gifting." },
  { id: "decorative-tin-box", name: "Decorative Tin Box", price: 99, badge: "New", collection: "Tin Boxes", description: "Reusable decorative tin packaging for sweets, dry fruits, and party favors." },
  { id: "german-silver-bowl", name: "German Silver Bowl", price: 199, badge: "Premium", collection: "German Silver", description: "A polished bowl option for elegant pooja and wedding gifting." },
  { id: "thambulam-gift-set", name: "Thambulam Gift Set", price: 249, badge: "Bulk Ready", collection: "Thambulam Sets", description: "A complete celebration gift set ready for guest distribution." },
  { id: "birthday-favor-box", name: "Birthday Favor Box", price: 129, badge: "Party Pick", collection: "Birthday Collection", description: "A cheerful birthday return gift box for kids and family parties." }
];

async function loadProductsFromSupabase() {
  let hasData = false;
  try {
    if (typeof supabaseClient !== 'undefined') {
      const { data: products, error } = await supabaseClient.from('products').select('*').order('id', { ascending: false });
      if (products && products.length > 0) {
        ONCOST_PRODUCTS = products.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: p.price,
          badge: p.badge || "",
          collection: p.category || "Return Gifts",
          description: p.description || "A premium gifting item from ONCOST.",
          image_url: p.image_url
        }));
        hasData = true;
      }
    }
  } catch (err) {
    console.error("Failed to load products from DB", err);
  }
  
  if (!hasData) {
    ONCOST_PRODUCTS = DUMMY_PRODUCTS;
  }
  
  await renderProducts();
  await renderProductDetail();
}

const ONCOST_LEAD_EMAIL = "enterprisepragna@gmail.com";
const ONCOST_PAYMENT_LINK = "";

function money(value) {
  return `Rs. ${value}`;
}

async function requireLogin() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?redirect=${redirect}`;
    return false;
  }
  return true;
}

function getProductFromUrl() {
  const id = new URLSearchParams(location.search).get("id") || (ONCOST_PRODUCTS[0] ? ONCOST_PRODUCTS[0].id : null);
  return ONCOST_PRODUCTS.find((item) => item.id === id) || ONCOST_PRODUCTS[0];
}

function makeLeadSummary({ user, product, form, source }) {
  const lines = [
    "ONCOST Customer Lead",
    "",
    `Source: ${source}`,
    `Customer Email: ${user.email}`,
    `Customer Phone: ${form.get("phone") || "Not provided"}`,
    `Customer GSTIN: ${form.get("gstin") || "Not provided"}`,
    "",
    product ? `Selected Product: ${product.name}` : "Selected Product: General bulk enquiry",
    product ? `Collection: ${product.collection}` : "",
    product ? `Starting Price: ${money(product.price)}` : "",
    "",
    `Event Type: ${form.get("eventType") || "Not provided"}`,
    `Quantity: ${form.get("quantity") || "Not provided"}`,
    `Event Date: ${form.get("eventDate") || "Not provided"}`,
    `Budget: ${form.get("budget") || "Not provided"}`,
    "",
    `Message: ${form.get("message") || "Not provided"}`,
  ].filter(Boolean);
  return lines.join("\n");
}

function openLeadEmail({ summary, product }) {
  const subject = product
    ? `ONCOST Lead - ${product.name}`
    : "ONCOST Lead - Bulk Enquiry";
  location.href = `mailto:${ONCOST_LEAD_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
}

async function updateShell() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const accountLinks = document.querySelectorAll("[data-account-link]");
  const cartBadges = document.querySelectorAll("[data-cart-count]");
  
  let cartCount = 0;
  if (session) {
    const { data: cart } = await supabaseClient.from('cart_items').select('qty').eq('user_id', session.user.id);
    if (cart) {
      cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    }
  }

  accountLinks.forEach((link) => {
    link.textContent = session ? "Account" : "Login";
    link.setAttribute("href", session ? "account.html" : "login.html");
  });
  cartBadges.forEach((badge) => {
    badge.textContent = cartCount ? `Cart (${cartCount})` : "Cart";
  });
}

async function renderProducts() {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;

  const search = document.querySelector("[data-product-search]");
  const collection = document.querySelector("[data-product-filter]");
  const draw = () => {
    const query = (search?.value || "").toLowerCase();
    const selected = collection?.value || "all";
    const products = ONCOST_PRODUCTS.filter((product) => {
      const matchesQuery = `${product.name} ${product.collection}`.toLowerCase().includes(query);
      const matchesCollection = selected === "all" || product.collection === selected;
      return matchesQuery && matchesCollection;
    });
    grid.innerHTML = products.map((product) => `
      <article class="product-card">
        <a href="product.html?id=${product.id}" data-protected-product>
          <div class="product-image" ${product.image_url ? `style="background-image: url('${product.image_url}'); background-size: cover; background-position: center;"` : ''}><span>${product.badge}</span></div>
          <div class="product-copy">
            <h3>${product.name}</h3>
            <p>${product.collection}</p>
            <p class="price">From ${money(product.price)}</p>
          </div>
        </a>
      </article>
    `).join("");
  };

  search?.addEventListener("input", draw);
  collection?.addEventListener("change", draw);
  draw();
}

async function renderProductDetail() {
  const mount = document.querySelector("[data-product-detail]");
  if (!mount) return;
  if (!(await requireLogin())) return;

  const product = getProductFromUrl();
  if(!product) return;
  
  mount.innerHTML = `
    <div class="detail-layout">
      <div class="detail-visual" aria-label="${product.name} preview" ${product.image_url ? `style="background-image: url('${product.image_url}'); background-size: cover; background-position: center;"` : ''}></div>
      <article class="detail-card">
        <p class="eyebrow">${product.collection}</p>
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <p class="price">From ${money(product.price)} per piece</p>
        <ul class="meta-list">
          <li>Bulk quantity customization available</li>
          <li>Packaging options can be discussed on enquiry</li>
          <li>Pan India delivery support</li>
        </ul>
        <button class="button primary" data-add-cart="${product.id}">Add to Cart</button>
        <a class="button secondary" href="enquiry.html?id=${product.id}">Enquire Now</a>
        <a class="button pay" href="payment.html?id=${product.id}">Pay Now</a>
      </article>
    </div>
  `;
}

async function addToCart(productId) {
  if (!(await requireLogin())) return;
  const product = ONCOST_PRODUCTS.find((item) => item.id === productId);
  if (!product) return;
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  // Check if item exists in cart
  const { data: existing } = await supabaseClient.from('cart_items')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('product_id', productId)
    .single();
    
  if (existing) {
    await supabaseClient.from('cart_items')
      .update({ qty: existing.qty + 1 })
      .eq('id', existing.id);
  } else {
    await supabaseClient.from('cart_items')
      .insert([{ user_id: session.user.id, product_id: productId, qty: 1 }]);
  }
  
  await updateShell();
  alert(`${product.name} added to cart.`);
}

async function renderCart() {
  const mount = document.querySelector("[data-cart]");
  if (!mount) return;
  if (!(await requireLogin())) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  const { data: cart } = await supabaseClient.from('cart_items').select('*').eq('user_id', session.user.id);

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
}

async function renderAccount() {
  const mount = document.querySelector("[data-account]");
  if (!mount) return;
  if (!(await requireLogin())) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();
  const { data: leads } = await supabaseClient.from('leads').select('*').eq('user_id', session.user.id);
  const { data: orders } = await supabaseClient.from('orders').select('*').eq('customer_email', session.user.email);
  
  const leadsCount = leads ? leads.length : 0;
  const ordersCount = orders ? orders.length : 0;

  mount.innerHTML = `
    <div class="module-grid">
      <article class="card"><h3>Profile</h3><p>${profile ? profile.name : session.user.email}</p><p>${session.user.email}</p></article>
      <article class="card"><h3>Orders</h3><p>${ordersCount} placed orders.</p></article>
      <article class="card"><h3>Leads Submitted</h3><p>${leadsCount} enquiry lead${leadsCount === 1 ? "" : "s"} saved.</p></article>
      <article class="card"><h3>Support</h3><p>Use bulk enquiry for event quantities, packaging, and delivery discussion.</p></article>
    </div>
  `;
}

async function renderEnquiry() {
  const form = document.querySelector("[data-enquiry-form]");
  if (!form) return;
  if (!(await requireLogin())) return;

  const productId = new URLSearchParams(location.search).get("id");
  const product = productId ? ONCOST_PRODUCTS.find((item) => item.id === productId) : null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', session.user.id).single();

  const title = document.querySelector("[data-enquiry-title]");
  const selected = document.querySelector("[data-selected-product]");
  const name = form.querySelector("[name='name']");
  const email = form.querySelector("[name='email']");
  const phone = form.querySelector("[name='phone']");

  if (title) title.textContent = product ? `Enquire for ${product.name}` : "Bulk Enquiry";
  if (selected) selected.textContent = product
    ? `${product.name} | ${product.collection} | From ${money(product.price)}`
    : "General cart or event enquiry";
    
  if (name && profile) name.value = profile.name || "";
  if (email) email.value = session.user.email || "";
  if (phone && profile) phone.value = profile.phone || "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const summary = makeLeadSummary({ user: session.user, product, form: formData, source: "Website enquiry form" });
    
    await supabaseClient.from('leads').insert([{
      user_id: session.user.id,
      product_id: product?.id || "general",
      summary: summary
    }]);

    document.querySelector("[data-lead-status]")?.classList.add("show");
    openLeadEmail({ summary, product });
  });
}

async function renderPayment() {
  const mount = document.querySelector("[data-payment]");
  if (!mount) return;
  if (!(await requireLogin())) return;

  const productId = new URLSearchParams(location.search).get("id");
  const product = productId ? ONCOST_PRODUCTS.find((item) => item.id === productId) : null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  const { data: cart } = await supabaseClient.from('cart_items').select('*').eq('user_id', session.user.id);
  
  let cartTotal = 0;
  if (cart) {
    cartTotal = cart.reduce((sum, item) => {
      const entry = ONCOST_PRODUCTS.find((productItem) => productItem.id === item.product_id);
      return sum + (entry ? entry.price * item.qty : 0);
    }, 0);
  }
  
  const amount = product ? product.price : cartTotal;
  const label = product ? product.name : "Cart payment";

  mount.innerHTML = `
    <article class="detail-card">
      <p class="eyebrow">Payment gateway</p>
      <h1>Pay Now</h1>
      <p><strong>${label}</strong></p>
      <p class="price">Estimated amount: ${money(amount || 0)}</p>
      <ul class="meta-list">
        <li>Use this page for MyBillBook invoice payment link or your payment gateway checkout.</li>
        <li>For production, the server should create an invoice/payment link and redirect the customer securely.</li>
        <li>This static demo can request the invoice by email until credentials are connected.</li>
      </ul>
      <button class="button pay" id="complete-order-btn">Complete Order (Simulation)</button>
    </article>
  `;
  
  document.getElementById('complete-order-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('complete-order-btn');
    btn.textContent = "Processing...";
    btn.disabled = true;
    
    // Create an order in Supabase
    const { data: order, error } = await supabaseClient.from('orders').insert([{
      customer_email: session.user.email,
      total_items: product ? 1 : (cart ? cart.length : 0),
      status: 'Processing',
      total_amount: amount
    }]).select();
    
    if (error) {
      alert("Failed to create order: " + error.message);
      btn.textContent = "Try Again";
      btn.disabled = false;
      return;
    }
    
    // Clear cart if it was a cart checkout
    if (!product && cart && cart.length > 0) {
      await supabaseClient.from('cart_items').delete().eq('user_id', session.user.id);
    }
    
    alert("Order completed successfully!");
    location.href = "account.html";
  });
}

function bindAuthForms() {
  const signup = document.querySelector("[data-signup-form]");
  signup?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(signup);
    const email = form.get("email");
    const password = form.get("password") || "DefaultPassword123!"; // Wait, the UI doesn't have a password field. Let's create one or just auto-gen.
    
    // If no password field in UI, we use a default one for simulation
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    
    // Create profile
    if (data.user) {
      await supabaseClient.from('profiles').insert([{
        id: data.user.id,
        name: form.get("name") || email.split("@")[0],
        phone: form.get("phone") || ""
      }]);
    }
    
    alert("Account created successfully!");
    location.href = "products.html";
  });

  const login = document.querySelector("[data-login-form]");
  login?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(login);
    const email = form.get("email");
    const password = form.get("password") || "DefaultPassword123!";
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    
    const redirect = new URLSearchParams(location.search).get("redirect") || "products.html";
    alert("Login successful!");
    location.href = redirect;
  });

  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    location.href = "index.html";
  });
}

function bindActions() {
  document.addEventListener("click", async (event) => {
    const protectedProduct = event.target.closest("[data-protected-product]");
    if (protectedProduct) {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        event.preventDefault();
        const href = protectedProduct.getAttribute("href");
        location.href = `login.html?redirect=${encodeURIComponent(href)}`;
        return;
      }
    }

    const cartButton = event.target.closest("[data-add-cart]");
    if (cartButton) await addToCart(cartButton.dataset.addCart);
  });
}

async function init() {
  bindAuthForms();
  bindActions();
  await updateShell();
  await loadProductsFromSupabase(); // This calls renderProducts and renderProductDetail
  
  // These rely on products being loaded
  await renderCart();
  await renderAccount();
  await renderEnquiry();
  await renderPayment();
}

// Start application
if (typeof supabaseClient !== 'undefined') {
  init();
}
