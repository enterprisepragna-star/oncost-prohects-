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

const mobileNav = [
  { label: 'Home', icon: Home },
  { label: 'Shop', icon: ShoppingBag },
  { label: 'Categories', icon: Boxes },
  { label: 'Cart', icon: ShoppingCart },
  { label: 'Account', icon: User },
];

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <main>
      <div className="topbar" aria-label="Store highlights">
        <span>
          <Sparkles aria-hidden="true" size={16} /> Customer support
        </span>
        <span>
          <Truck aria-hidden="true" size={16} /> Enquiry follow-up
        </span>
        <span>
          <Gift aria-hidden="true" size={16} /> Bulk support
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
          <p className="eyebrow">Get in touch</p>
          <h1>Contact ONCOST</h1>
          <p>
            Questions about products, bulk orders, or custom packaging? Send us
            a message and we'll follow up.
          </p>
        </div>
        <Link className="button secondary" href="/shop">
          Browse Products
        </Link>
      </section>

      <section className="section">
        <form
          className="auth-card form-grid"
          onSubmit={handleSubmit}
          style={{ maxWidth: '500px' }}
        >
          {formSubmitted && (
            <p
              className="notice"
              style={{
                padding: '10px',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              Thank you! We'll get back to you soon.
            </p>
          )}
          <label>
            Name <input className="field" required name="name" />
          </label>
          <label>
            Email <input className="field" required type="email" name="email" />
          </label>
          <label>
            Phone <input className="field" name="phone" />
          </label>
          <label>
            Message
            <textarea className="field" rows={5} name="message" />
          </label>
          <button className="button primary" type="submit">
            Send Message
          </button>
        </form>
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
