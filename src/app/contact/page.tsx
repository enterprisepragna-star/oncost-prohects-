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
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'Categories', href: '/collections', icon: Boxes },
  { label: 'Cart', href: '/shop', icon: ShoppingCart },
  { label: 'Account', href: '/account', icon: User },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: 'general', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', category: 'general', message: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            a message and we'll follow up within 24 hours.
          </p>
        </div>
        <Link className="button secondary" href="/shop">
          Browse Products
        </Link>
      </section>

      <section className="section">
        <style jsx>{`
          .contact-form-container { max-width: 520px; margin: 0 auto; }
          .form-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(139, 46, 59, 0.1); }
          .form-group { margin-bottom: 24px; }
          .form-label { display: block; font-size: 12px; font-weight: 700; color: #2C2C2C; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
          .form-input, .form-textarea, .form-select { width: 100%; padding: 12px 16px; border: 1.5px solid #E8E8E8; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; font-family: inherit; transition: all 0.3s; }
          .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: #8B2E3B; box-shadow: 0 0 0 3px rgba(139, 46, 59, 0.1); }
          .form-textarea { resize: vertical; min-height: 120px; }
          .success-msg { background-color: #E8F5E9; color: #2E7D32; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; border: 1px solid #C8E6C9; display: flex; align-items: center; gap: 8px; }
          .error-msg { background-color: #FEE5E5; color: #C33; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; border: 1px solid #FCC; display: flex; align-items: center; gap: 8px; }
          .btn-submit { width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #8B2E3B 0%, #A83A4B 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .btn-submit:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(139, 46, 59, 0.3); }
          .btn-submit:disabled { opacity: 0.8; }
        `}</style>
        
        <div className="contact-form-container">
          <div className="form-card">
            {success && (
              <div className="success-msg">
                <span>✓</span> Thank you! We've received your message. Our team will get back to you within 24 hours.
              </div>
            )}
            {error && (
              <div className="error-msg">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required className="form-input" />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="customer@example.com" required className="form-input" />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9999999999 (optional)" className="form-input" />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Enquiry Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                  <option value="general">General Inquiry</option>
                  <option value="bulk">Bulk Order Request</option>
                  <option value="product">Product Question</option>
                  <option value="customization">Customization Request</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your inquiry, bulk order needs, or any questions..." required className="form-textarea" />
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? '📤 Sending...' : '📧 Send Message'}
              </button>
            </form>
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
        {mobileNav.map(({ label, href, icon: Icon }) => (
          <Link href={href} key={label}>
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}