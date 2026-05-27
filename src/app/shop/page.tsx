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
import { useState } from 'react';

const collections = [
  'Brass Collection',
  'Birthday Collection',
  'Return Gifts',
  'Tin Boxes',
  'German Silver',
  'Thambulam Sets',
];

const mobileNav = [
  { label: 'Home', icon: Home },
  { label: 'Shop', icon: ShoppingBag },
  { label: 'Categories', icon: Boxes },
  { label: 'Cart', icon: ShoppingCart },
  { label: 'Account', icon: User },
];

export default function ShopPage() {
  const [selectedCollection, setSelectedCollection] = useState('all');

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
          <p className="eyebrow">Shop ONCOST</p>
          <h1>Product Collections</h1>
          <p>
            Browse curated gifting options. Product details are available after
            customer login.
          </p>
        </div>
        <Link className="button secondary" href="/signup">
          Create Account
        </Link>
      </section>

      <section className="section">
        <div className="toolbar">
          <input
            className="field"
            placeholder="Search products or collections"
            type="text"
          />
          <select
            className="select"
            aria-label="Filter products"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div className="product-grid">
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
            Products will be loaded here. Log in to see product details.
          </p>
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
