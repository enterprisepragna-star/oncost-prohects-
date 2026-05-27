'use client';

import Link from 'next/link';
import {
  Gift,
  Heart,
  Home,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
  Boxes,
} from 'lucide-react';

const collections = [
  { name: 'Brass Collection', detail: 'Traditional keepsakes', tone: 'maroon' },
  { name: 'Birthday Collection', detail: 'Joyful party favors', tone: 'gold' },
  { name: 'Return Gifts', detail: 'Ready for every event', tone: 'rose' },
  { name: 'Tin Boxes', detail: 'Reusable festive packaging', tone: 'sage' },
  { name: 'German Silver', detail: 'Elegant pooja gifting', tone: 'silver' },
  { name: 'Thambulam Sets', detail: 'Celebration essentials', tone: 'cream' },
];

const mobileNav = [
  { label: 'Home', icon: Home },
  { label: 'Shop', icon: ShoppingBag },
  { label: 'Categories', icon: Boxes },
  { label: 'Cart', icon: ShoppingCart },
  { label: 'Account', icon: User },
];

export default function CollectionsPage() {
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
        <Link className="logo" href="/" aria-label="ONCOST home">
          ONCOST
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/bulk-orders">Bulk Orders</Link>
          <Link href="/contact">Contact</Link>
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
          <Link href="/account" aria-label="Account">
            <User size={20} />
          </Link>
        </div>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Browse occasions</p>
          <h1>Shop By Collection</h1>
          <p>
            Explore curated collections for every celebration and occasion.
          </p>
        </div>
        <Link className="button secondary" href="/shop">
          View All Products
        </Link>
      </section>

      <section className="section">
        <div className="collection-grid">
          {collections.map((collection) => (
            <Link
              href="/shop"
              className="collection-card"
              key={collection.name}
            >
              <span className={`collection-art ${collection.tone}`} />
              <strong>{collection.name}</strong>
              <span>{collection.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <h2>ONCOST</h2>
        <p>Premium gifting collections for every occasion</p>
        <nav aria-label="Footer navigation">
          <Link href="/shop">Shop</Link>
          <Link href="/bulk-orders">Bulk Orders</Link>
          <Link href="/account">Account</Link>
        </nav>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {mobileNav.map(({ label, icon: Icon }) => (
          <Link
            href={label === 'Home' ? '/' : `/${label.toLowerCase().replace(' ', '-')}`}
            key={label}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
