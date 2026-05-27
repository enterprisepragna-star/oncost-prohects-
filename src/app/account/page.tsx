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

const mobileNav = [
  { label: 'Home', icon: Home },
  { label: 'Shop', icon: ShoppingBag },
  { label: 'Categories', icon: Boxes },
  { label: 'Cart', icon: ShoppingCart },
  { label: 'Account', icon: User },
];

export default function AccountPage() {
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
          <p className="eyebrow">Your Account</p>
          <h1>Account & Orders</h1>
          <p>
            Manage your profile, view order history, and track bulk enquiries.
          </p>
        </div>
        <Link className="button secondary" href="/shop">
          Continue Shopping
        </Link>
      </section>

      <section className="section">
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            Please log in to view your account details, order history, and
            profile settings.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link className="button primary" href="/login">
              Login
            </Link>
            <Link className="button secondary" href="/signup">
              Create Account
            </Link>
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
