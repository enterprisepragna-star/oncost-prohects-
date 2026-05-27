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
  MessageCircle,
} from 'lucide-react';

const mobileNav = [
  { label: 'Home', icon: Home },
  { label: 'Shop', icon: ShoppingBag },
  { label: 'Categories', icon: Boxes },
  { label: 'Cart', icon: ShoppingCart },
  { label: 'Account', icon: User },
];

export default function BulkOrdersPage() {
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
          <p className="eyebrow">Event gifting made simple</p>
          <h1>Need 50+ Pieces?</h1>
          <p>
            Customize gifts, packaging, and quantities for birthdays, weddings,
            poojas, school events, and corporate celebrations.
          </p>
        </div>
        <Link className="button secondary" href="/contact">
          Get in Touch
        </Link>
      </section>

      <section className="section">
        <div className="bulk-panel">
          <div>
            <h2>Bulk Order Benefits</h2>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
              <li>Custom branding and packaging options</li>
              <li>Volume discounts for large orders</li>
              <li>Flexible delivery timelines</li>
              <li>Dedicated account manager</li>
              <li>Pan-India delivery support</li>
            </ul>
            <Link className="button primary" href="/contact">
              <MessageCircle aria-hidden="true" size={18} /> Contact Sales
            </Link>
          </div>
          <div
            className="packaging-preview"
            aria-label="Gift packaging preview"
          >
            <Gift aria-hidden="true" size={44} />
            <span>Custom Packaging</span>
          </div>
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
