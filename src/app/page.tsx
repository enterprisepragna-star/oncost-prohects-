import {
  Gift,
  Heart,
  Home,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
  Boxes,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

const navLinks = ["Home", "Shop", "Collections", "Bulk Orders", "Contact"];

const collections = [
  { name: "Brass Collection", detail: "Traditional keepsakes", tone: "maroon" },
  { name: "Birthday Collection", detail: "Joyful party favors", tone: "gold" },
  { name: "Return Gifts", detail: "Ready for every event", tone: "rose" },
  { name: "Tin Boxes", detail: "Reusable festive packaging", tone: "sage" },
  { name: "German Silver", detail: "Elegant pooja gifting", tone: "silver" },
  { name: "Thambulam Sets", detail: "Celebration essentials", tone: "cream" },
];

const products = [
  { name: "Brass Diya Set", price: "From Rs. 149", badge: "Best Seller" },
  { name: "Decorative Tin Box", price: "From Rs. 99", badge: "New" },
  { name: "German Silver Bowl", price: "From Rs. 199", badge: "Premium" },
  { name: "Thambulam Gift Set", price: "From Rs. 249", badge: "Bulk Ready" },
];

const mobileNav = [
  { label: "Home", icon: Home },
  { label: "Shop", icon: ShoppingBag },
  { label: "Categories", icon: Boxes },
  { label: "Cart", icon: ShoppingCart },
  { label: "Account", icon: User },
];

export default function HomePage() {
  return (
    <main>
      <div className="topbar" aria-label="Store highlights">
        <span>
          <Sparkles aria-hidden="true" size={16} /> Bulk Orders Available
        </span>
        <span>
          <Truck aria-hidden="true" size={16} /> Pan India Delivery
        </span>
        <span>
          <Gift aria-hidden="true" size={16} /> Premium Return Gifts
        </span>
      </div>

      <header className="site-header">
        <a className="logo" href="#" aria-label="ONCOST home">
          ONCOST
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </nav>
        <div className="header-actions" aria-label="Store tools">
          <button aria-label="Search">
            <Search size={20} />
          </button>
          <button aria-label="Wishlist">
            <Heart size={20} />
          </button>
          <button aria-label="Cart">
            <ShoppingCart size={20} />
          </button>
          <button aria-label="Account">
            <User size={20} />
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Premium celebration gifting</p>
          <h1 id="hero-title">Curated Return Gifts & Premium Collections</h1>
          <p>
            Thoughtfully designed gifts for birthdays, poojas, weddings, and
            family celebrations, with bulk-friendly choices for every guest
            list.
          </p>
          <div className="button-row">
            <a className="button primary" href="#">
              Shop Now <ChevronRight aria-hidden="true" size={18} />
            </a>
            <a className="button secondary" href="#">
              Bulk Enquiry
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-label="Premium gift preview">
          <div className="gift-stack gift-stack-one" />
          <div className="gift-stack gift-stack-two" />
          <div className="gift-stack gift-stack-three" />
          <div className="hero-badge">
            <PackageCheck aria-hidden="true" size={18} />
            Ready for bulk orders
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="collections-title">
        <div className="section-heading">
          <p className="eyebrow">Browse occasions</p>
          <h2 id="collections-title">Shop By Collection</h2>
        </div>
        <div className="collection-grid">
          {collections.map((collection) => (
            <a href="#" className="collection-card" key={collection.name}>
              <span className={`collection-art ${collection.tone}`} />
              <strong>{collection.name}</strong>
              <span>{collection.detail}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="section loved" aria-labelledby="products-title">
        <div className="section-heading">
          <p className="eyebrow">Customer favorites</p>
          <h2 id="products-title">Most Loved Products</h2>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image">
                <span>{product.badge}</span>
              </div>
              <div className="product-copy">
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="bulk-title">
        <div className="bulk-panel">
          <div>
            <p className="eyebrow">Event gifting made simple</p>
            <h2 id="bulk-title">Need 50+ Pieces?</h2>
            <p>
              Customize gifts, packaging, and quantities for birthdays,
              weddings, poojas, school events, and corporate celebrations.
            </p>
            <a className="button primary" href="#">
              <MessageCircle aria-hidden="true" size={18} /> WhatsApp Us
            </a>
          </div>
          <div className="packaging-preview" aria-label="Gift packaging preview">
            <Gift aria-hidden="true" size={44} />
            <span>Gift Packaging Preview</span>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <h2>ONCOST</h2>
        <p>Premium gifting collections for every occasion</p>
        <nav aria-label="Footer navigation">
          <a href="#">Contact</a>
          <a href="#">Policies</a>
          <a href="#">Instagram</a>
          <a href="#">WhatsApp</a>
        </nav>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {mobileNav.map(({ label, icon: Icon }) => (
          <a href="#" key={label}>
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </main>
  );
}
