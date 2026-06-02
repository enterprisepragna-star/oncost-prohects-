'use client';

import Link from 'next/link';
import { Zap, Users, Gift, Customize } from 'lucide-react';

const services = [
  {
    icon: Gift,
    title: 'Individual Gifting',
    desc: 'Perfect gifts for birthdays, anniversaries, and personal celebrations',
    features: ['Wide collection', 'Same-day delivery available', 'Personalized packaging'],
  },
  {
    icon: Users,
    title: 'Corporate Gifting',
    desc: 'Bulk orders for corporate events, employee rewards, and client appreciation',
    features: ['Volume discounts', 'Dedicated account manager', 'Custom branding'],
  },
  {
    icon: Customize,
    title: 'Custom Collections',
    desc: 'Create custom gift sets tailored to your specific needs',
    features: ['Fully customizable', 'Your branding', 'Minimum order: 50 units'],
  },
  {
    icon: Zap,
    title: 'Event Solutions',
    desc: 'Complete gifting solutions for weddings, events, and celebrations',
    features: ['End-to-end management', 'Flexible packaging', 'Quality guarantee'],
  },
];

export default function ServicesPage() {
  return (
    <main>
      <div className="topbar">
        <span>💼 Our Services</span>
        <span>🎯 Customized Solutions</span>
        <span>🚀 Bulk Support</span>
      </div>

      <header className="site-header">
        <Link className="logo" href="/">ONCOST</Link>
        <nav className="desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/bulk-orders">Bulk Orders</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Our Solutions</p>
          <h1>Premium Gifting Services</h1>
          <p>Tailored gifting solutions for every occasion and scale</p>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {services.map((service, i) => (
              <div key={i} style={{
                padding: '32px 24px',
                border: '2px solid #f0e8e0',
                borderRadius: '12px',
                backgroundColor: '#fefdfb',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8B2E3B';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 46, 59, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f0e8e0';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <service.icon size={40} style={{ color: '#8B2E3B', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{service.title}</h3>
                <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>{service.desc}</p>
                <ul style={{ fontSize: '13px', color: '#666', lineHeight: '1.8', marginLeft: '0' }}>
                  {service.features.map((f, j) => (
                    <li key={j} style={{ listStyle: 'none', paddingLeft: '20px', position: 'relative', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: '0' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: '#f9f7f4' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Ready to Get Started?</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Contact our team for customized quotes and solutions</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="button primary">Contact Us</Link>
            <Link href="/shop" className="button secondary">Browse Products</Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <h2>ONCOST</h2>
        <p>Premium gifting collections for every occasion</p>
        <nav>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}