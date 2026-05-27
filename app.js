const ONCOST_PRODUCTS = [
  {
    id: "brass-diya-set",
    name: "Brass Diya Set",
    price: 149,
    badge: "Best Seller",
    collection: "Brass Collection",
    description: "A warm traditional diya set for pooja return gifts and festive gifting.",
  },
  {
    id: "decorative-tin-box",
    name: "Decorative Tin Box",
    price: 99,
    badge: "New",
    collection: "Tin Boxes",
    description: "Reusable decorative tin packaging for sweets, dry fruits, and party favors.",
  },
  {
    id: "german-silver-bowl",
    name: "German Silver Bowl",
    price: 199,
    badge: "Premium",
    collection: "German Silver",
    description: "A polished bowl option for elegant pooja and wedding gifting.",
  },
  {
    id: "thambulam-gift-set",
    name: "Thambulam Gift Set",
    price: 249,
    badge: "Bulk Ready",
    collection: "Thambulam Sets",
    description: "A complete celebration gift set ready for guest distribution.",
  },
  {
    id: "birthday-favor-box",
    name: "Birthday Favor Box",
    price: 129,
    badge: "Party Pick",
    collection: "Birthday Collection",
    description: "A cheerful birthday return gift box for kids and family parties.",
  },
  {
    id: "haldi-kumkum-set",
    name: "Haldi Kumkum Set",
    price: 179,
    badge: "Festive",
    collection: "Return Gifts",
    description: "A compact festive set designed for poojas, ceremonies, and house events.",
  },
];

const ONCOST_LEAD_EMAIL = "enterprisepragna@gmail.com";
const ONCOST_PAYMENT_LINK = "https://oncost.shop/payment"; // Production payment gateway - configure with actual endpoint

const storage = {
  getUser() {
    return JSON.parse(localStorage.getItem("oncostUser") || "null");
  },
  setUser(user) {
    localStorage.setItem("oncostUser", JSON.stringify(user));
  },
  getCart() {
    return JSON.parse(localStorage.getItem("oncostCart") || "[]");
  },
  setCart(cart) {
    localStorage.setItem("oncostCart", JSON.stringify(cart));
  },
  getLeads() {
    return JSON.parse(localStorage.getItem("oncostLeads") || "[]");
  },
  setLeads(leads) {
    localStorage.setItem("oncostLeads", JSON.stringify(leads));
  },
};

function money(value) {
  return `Rs. ${value}`;
}

function requireLogin() {
  if (!storage.getUser()) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?redirect=${redirect}`;
    return false;
  }
  return true;
}

function getProductFromUrl() {
  const id = new URLSearchParams(location.search).get("id") || ONCOST_PRODUCTS[0].id;
  return ONCOST_PRODUCTS.find((item) => item.id === id) || ONCOST_PRODUCTS[0];
}

function makeLeadSummary({ user, product, form, source }) {
  const lines = [
    "ONCOST Customer Lead",
    "",
    `Source: ${source}`,
    `Customer Name: ${user.name}`,
    `Customer Email: ${user.email}`,
    `Customer Phone: ${user.phone || form.get("phone") || "Not provided"}`,
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

function updateShell() {
  const user = storage.getUser();
  const accountLinks = document.querySelectorAll("[data-account-link]");
  const cartBadges = document.querySelectorAll("[data-cart-count]");
  const cartCount = storage.getCart().reduce((sum, item) => sum + item.qty, 0);

  accountLinks.forEach((link) => {
    link.textContent = user ? "Account" : "Login";
    link.setAttribute("href", user ? "account.html" : "login.html");
  });
  cartBadges.forEach((badge) => {
    badge.textContent = cartCount ? `Cart (${cartCount})` : "Cart";
  });
}

function renderProducts() {
  const grid = document.querySelector("[data-products]");
  if (!grid) return;

  const search = document.querySelector("[data-product-search]");
  const collection = document.querySelector("[data-product-filter]");
  // respect ?collection=... query param when opening products page
  try {
    const params = new URLSearchParams(location.search);
    const initialCollection = params.get("collection");
    if (initialCollection && collection) collection.value = initialCollection;
  } catch (e) {
    // ignore
  }
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
          <div class="product-image"><span>${product.badge}</span></div>
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

function renderProductDetail() {
  const mount = document.querySelector("[data-product-detail]");
  if (!mount) return;
  if (!requireLogin()) return;

  const product = getProductFromUrl();
  mount.innerHTML = `
    <div class="detail-layout">
      <div class="detail-visual" aria-label="${product.name} preview"></div>
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

function addToCart(productId) {
  if (!requireLogin()) return;
  const product = ONCOST_PRODUCTS.find((item) => item.id === productId);
  if (!product) return;
  const cart = storage.getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  storage.setCart(cart);
  updateShell();
  alert(`${product.name} added to cart.`);
}

function renderCart() {
  const mount = document.querySelector("[data-cart]");
  if (!mount) return;
  if (!requireLogin()) return;

  const cart = storage.getCart();
  if (!cart.length) {
    mount.innerHTML = `<div class="card"><h3>Your cart is empty</h3><p>Browse products and add gifts for your event.</p><a class="button primary" href="products.html">Shop Products</a></div>`;
    return;
  }

  let total = 0;
  mount.innerHTML = cart.map((item) => {
    const product = ONCOST_PRODUCTS.find((entry) => entry.id === item.id);
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

function renderAccount() {
  const mount = document.querySelector("[data-account]");
  if (!mount) return;
  if (!requireLogin()) return;

  const user = storage.getUser();
  const leads = storage.getLeads();
  mount.innerHTML = `
    <div class="module-grid">
      <article class="card"><h3>Profile</h3><p>${user.name}</p><p>${user.email}</p></article>
      <article class="card"><h3>Orders</h3><p>No placed orders yet. Cart and enquiries are saved locally for this demo.</p></article>
      <article class="card"><h3>Leads Submitted</h3><p>${leads.length} enquiry lead${leads.length === 1 ? "" : "s"} saved in this browser.</p></article>
      <article class="card"><h3>Support</h3><p>Use bulk enquiry for event quantities, packaging, and delivery discussion.</p></article>
    </div>
  `;
}

function renderEnquiry() {
  const form = document.querySelector("[data-enquiry-form]");
  if (!form) return;
  if (!requireLogin()) return;

  const productId = new URLSearchParams(location.search).get("id");
  const product = productId ? ONCOST_PRODUCTS.find((item) => item.id === productId) : null;
  const user = storage.getUser();
  const title = document.querySelector("[data-enquiry-title]");
  const selected = document.querySelector("[data-selected-product]");
  const name = form.querySelector("[name='name']");
  const email = form.querySelector("[name='email']");
  const phone = form.querySelector("[name='phone']");

  if (title) title.textContent = product ? `Enquire for ${product.name}` : "Bulk Enquiry";
  if (selected) selected.textContent = product
    ? `${product.name} | ${product.collection} | From ${money(product.price)}`
    : "General cart or event enquiry";
  if (name) name.value = user.name || "";
  if (email) email.value = user.email || "";
  if (phone) phone.value = user.phone || "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const lead = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      productId: product?.id || "general",
      summary: makeLeadSummary({ user, product, form: formData, source: "Website enquiry form" }),
    };
    const leads = storage.getLeads();
    leads.unshift(lead);
    storage.setLeads(leads);
    document.querySelector("[data-lead-status]")?.classList.add("show");
    openLeadEmail({ summary: lead.summary, product });
  });
}

function renderPayment() {
  const mount = document.querySelector("[data-payment]");
  if (!mount) return;
  if (!requireLogin()) return;

  const productId = new URLSearchParams(location.search).get("id");
  const product = productId ? ONCOST_PRODUCTS.find((item) => item.id === productId) : null;
  const cart = storage.getCart();
  const cartTotal = cart.reduce((sum, item) => {
    const entry = ONCOST_PRODUCTS.find((productItem) => productItem.id === item.id);
    return sum + (entry ? entry.price * item.qty : 0);
  }, 0);
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
      ${ONCOST_PAYMENT_LINK ? `<a class="button pay" href="${ONCOST_PAYMENT_LINK}">Continue to Payment</a>` : `<a class="button primary" href="enquiry.html${product ? `?id=${product.id}` : ""}">Request Invoice Link</a>`}
    </article>
  `;
}

function bindAuthForms() {
  const signup = document.querySelector("[data-signup-form]");
  signup?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(signup);
    storage.setUser({
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
    });
    location.href = "products.html";
  });

  const login = document.querySelector("[data-login-form]");
  login?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(login);
    storage.setUser({
      name: form.get("email").toString().split("@")[0] || "ONCOST Customer",
      email: form.get("email"),
      phone: "",
    });
    const redirect = new URLSearchParams(location.search).get("redirect") || "products.html";
    location.href = redirect;
  });

  // --- Mobile OTP flows (demo) ---
  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  function sendOtp(phone) {
    const code = generateOtp();
    sessionStorage.setItem(`oncostOtp:${phone}`, JSON.stringify({ code, expires: Date.now() + 5 * 60 * 1000 }));
    // for demo purposes show the OTP to the user (no SMS integration)
    alert(`Demo OTP for ${phone}: ${code}`);
    return code;
  }
  function verifyOtp(phone, otp) {
    const raw = sessionStorage.getItem(`oncostOtp:${phone}`);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      return data.code === otp && data.expires > Date.now();
    } catch (e) {
      return false;
    }
  }

  const loginOtp = document.querySelector("[data-login-otp]");
  if (loginOtp) {
    const phoneInput = loginOtp.querySelector("[name='phone']");
    const otpInput = loginOtp.querySelector("[name='otp']");
    const requestBtn = loginOtp.querySelector("[data-request-otp]");
    requestBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const phone = (phoneInput.value || "").trim();
      if (!phone) return alert("Enter mobile number to receive OTP (demo)");
      sendOtp(phone);
      otpInput?.focus();
    });
    loginOtp.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = (phoneInput.value || "").trim();
      const code = (otpInput.value || "").trim();
      if (!verifyOtp(phone, code)) return alert("Invalid or expired OTP");
      storage.setUser({ name: `user_${phone.slice(-4)}`, email: `phone+${phone}@oncost.local`, phone });
      const redirect = new URLSearchParams(location.search).get("redirect") || "products.html";
      location.href = redirect;
    });
  }

  const signupOtp = document.querySelector("[data-signup-otp]");
  if (signupOtp) {
    const phoneInput = signupOtp.querySelector("[name='phone']");
    const otpInput = signupOtp.querySelector("[name='otp']");
    const requestBtn = signupOtp.querySelector("[data-request-otp]");
    requestBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      const phone = (phoneInput.value || "").trim();
      if (!phone) return alert("Enter mobile number to receive OTP (demo)");
      sendOtp(phone);
      otpInput?.focus();
    });
    signupOtp.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = (phoneInput.value || "").trim();
      const code = (otpInput.value || "").trim();
      if (!verifyOtp(phone, code)) return alert("Invalid or expired OTP");
      storage.setUser({ name: `user_${phone.slice(-4)}`, email: `phone+${phone}@oncost.local`, phone });
      location.href = "products.html";
    });
  }
  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    localStorage.removeItem("oncostUser");
    location.href = "index.html";
  });
}

function bindActions() {
  document.addEventListener("click", (event) => {
    const protectedProduct = event.target.closest("[data-protected-product]");
    if (protectedProduct && !storage.getUser()) {
      event.preventDefault();
      const href = protectedProduct.getAttribute("href");
      location.href = `login.html?redirect=${encodeURIComponent(href)}`;
      return;
    }

    const cartButton = event.target.closest("[data-add-cart]");
    if (cartButton) addToCart(cartButton.dataset.addCart);
  });
}

bindAuthForms();
bindActions();
renderProducts();
renderProductDetail();
renderCart();
renderAccount();
renderEnquiry();
renderPayment();
updateShell();
