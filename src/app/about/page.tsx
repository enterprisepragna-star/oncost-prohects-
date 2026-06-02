'use client';

import Link from 'next/link';
import { Gift, Truck, Users, Award } from 'lucide-react';

const features = [
  { icon: Gift, title: 'Curated Collections', desc: 'Handpicked premium gifting options' },
  { icon: Truck, title: 'Pan India Delivery', desc: 'Fast delivery across all regions' },
  { icon: Users, title: 'Bulk Support', desc: 'Expert guidance for corporate events' },
  { icon: Award, title: 'Quality Assured', desc: 'Premium products with guarantee' },
];

export default function AboutPage() {
  return (
    <main>
      <div className="topbar">
        <span>✨ About ONCOST</span>
        <span>🎁 Premium Gifting</span>
        <span>💎 Quality Assured</span>
      </div>

      <header className="site-header">
        <Link className="logo" href="/">ONCOST</Link>
        <nav className="desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Our Story</p>
          <h1>About ONCOST</h1>
          <p>Premium gifting for every occasion, from birthdays to corporate celebrations</p>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px' }}>Who We Are</h2>
          <p style={{ lineHeight: '1.8', color: '#666', marginBottom: '16px' }}>
            ONCOST is India's leading premium gifting platform, specializing in curated collections for every celebration. Since our inception, we've been committed to making gifting effortless and memorable.
          </p>
          <p style={{ lineHeight: '1.8', color: '#666', marginBottom: '32px' }}>
            Our mission is simple: deliver exceptional quality products with outstanding service to customers across India.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '24px', border: '1px solid #eee', borderRadius: '8px' }}>
                <f.icon size={32} style={{ color: '#8B2E3B', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <h2 style={{ marginBottom: '16px' }}>Why Choose Us?</h2>
          <ul style={{ lineHeight: '2', color: '#666', marginBottom: '32px' }}>
            <li>✓ Handpicked premium collections</li>
            <li>✓ Competitive pricing with bulk discounts</li>
            <li>✓ Pan India delivery within 2-7 days</li>
            <li>✓ Customization options for corporate gifts</li>
            <li>✓ Dedicated customer support</li>
            <li>✓ Quality guarantee on all products</li>
          </ul>

          <Link href="/shop" className="button primary" style={{ display: 'inline-block' }}>
            Explore Our Collections
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <h2>ONCOST</h2>
        <p>Premium gifting collections for every occasion</p>
        <nav>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}