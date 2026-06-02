'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main>
      <div className="topbar">
        <span>🔒 Your Privacy Matters</span>
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
          <p className="eyebrow">Privacy Policy</p>
          <h1>Your Data is Safe with Us</h1>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', color: '#666' }}>
          <h2>Privacy Policy</h2>
          <p><strong>Last Updated: June 2024</strong></p>

          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as:
            <ul style={{ marginLeft: '20px' }}>
              <li>Name, email address, and phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information</li>
              <li>Order history and preferences</li>
            </ul>
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>We use collected information to:
            <ul style={{ marginLeft: '20px' }}>
              <li>Process and fulfill orders</li>
              <li>Send order updates and customer support</li>
              <li>Improve our services</li>
              <li>Send promotional emails (with opt-out option)</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </p>

          <h3>3. Data Security</h3>
          <p>We implement industry-standard security measures to protect your personal information. All payment processing is handled by secure, PCI-compliant gateways.</p>

          <h3>4. Third-Party Sharing</h3>
          <p>We do not sell your personal information. We may share information with:
            <ul style={{ marginLeft: '20px' }}>
              <li>Payment processors (for transactions)</li>
              <li>Shipping partners (for delivery)</li>
              <li>Service providers under confidentiality agreements</li>
            </ul>
          </p>

          <h3>5. Cookies</h3>
          <p>Our website uses cookies to enhance user experience. You can disable cookies in your browser settings.</p>

          <h3>6. Your Rights</h3>
          <p>You have the right to:
            <ul style={{ marginLeft: '20px' }}>
              <li>Access your personal data</li>
              <li>Request data deletion</li>
              <li>Opt-out of marketing communications</li>
              <li>Update your information</li>
            </ul>
          </p>

          <h3>7. Contact Us</h3>
          <p>For privacy concerns, contact us at: <strong>privacy@oncost.shop</strong></p>
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