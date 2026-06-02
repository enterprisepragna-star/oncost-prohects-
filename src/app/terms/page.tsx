'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main>
      <div className="topbar">
        <span>📋 Terms & Conditions</span>
      </div>

      <header className="site-header">
        <Link className="logo" href="/">ONCOST</Link>
        <nav className="desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Terms & Conditions</p>
          <h1>Our Terms of Service</h1>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', color: '#666' }}>
          <h2>Terms & Conditions</h2>
          <p><strong>Last Updated: June 2024</strong></p>

          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using ONCOST, you accept and agree to be bound by these terms and conditions. If you do not agree, please do not use our website.</p>

          <h3>2. Use License</h3>
          <p>Permission is granted to temporarily download one copy of materials (information or software) from ONCOST for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            <ul style={{ marginLeft: '20px' }}>
              <li>Modify or copy the materials</li>
              <li>Use materials for commercial purposes or for any public display</li>
              <li>Attempt to reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer materials to another person or "mirror" materials</li>
            </ul>
          </p>

          <h3>3. Product Information</h3>
          <p>We strive to provide accurate product descriptions and pricing. However, ONCOST does not warrant that product descriptions, pricing, or other content is accurate or complete. We reserve the right to correct any errors or omissions.</p>

          <h3>4. Pricing & Availability</h3>
          <p>
            <ul style={{ marginLeft: '20px' }}>
              <li>All prices are in Indian Rupees (INR)</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to limit quantities</li>
              <li>Products are subject to availability</li>
            </ul>
          </p>

          <h3>5. Shipping & Delivery</h3>
          <p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Shipping timelines are estimates and not guaranteed</li>
              <li>Risk of loss passes to customer upon delivery</li>
              <li>Delivery delays due to force majeure are not our responsibility</li>
              <li>Customers must verify address before checkout</li>
            </ul>
          </p>

          <h3>6. Returns & Refunds</h3>
          <p>Returns must be initiated within 7 days of delivery. Products must be unused and in original packaging. Refunds will be processed within 10 business days.</p>

          <h3>7. Limitation of Liability</h3>
          <p>ONCOST shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, resulting from any use or inability to use the materials or services.</p>

          <h3>8. Governing Law</h3>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>

          <h3>9. Contact Us</h3>
          <p>For questions about these terms, contact: <strong>legal@oncost.shop</strong></p>
        </div>
      </section>

      <footer className="site-footer">
        <h2>ONCOST</h2>
        <nav>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}