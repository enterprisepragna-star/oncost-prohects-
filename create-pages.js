#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  console.log(`✓ ${rel}`);
}

const header = `      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>ONCOST</div>
          <nav style={styles.nav}>
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/collections">Collections</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </div>
      </header>`;

const footer = `      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>ONCOST</h4>
            <p>Premium ethnic wear</p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Links</h4>
            <ul style={styles.footerLinks}>
              <li><a href="/about">About</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2024 ONCOST</p>
        </div>
      </footer>`;

const baseStyles = `const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f7f4' },
  header: { backgroundColor: '#8b2e3b', color: '#f9f7f4', padding: '1rem 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#d4af37' },
  nav: { display: 'flex', gap: '2rem', flex: 1, justifyContent: 'center' },
  hero: { backgroundColor: '#d4af37', color: '#8b2e3b', padding: '3rem 1rem', textAlign: 'center' },
  heroTitle: { fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' },
  heroSubtitle: { fontSize: '1.1rem' },
  mainContent: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', width: '100%', flex: 1 },
  sectionTitle: { color: '#8b2e3b', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: 'bold' },
  textContent: { lineHeight: '1.8', color: '#555', marginBottom: '2rem', fontSize: '1rem' },
  footer: { backgroundColor: '#8b2e3b', color: '#f9f7f4', marginTop: 'auto', padding: '3rem 1rem 1rem' },
  footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  footerSection: { textAlign: 'center' },
  footerTitle: { color: '#d4af37', marginBottom: '0.5rem' },
  footerLinks: { listStyle: 'none' },
  footerBottom: { textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.3)' },
};`;

console.log('\n📝 Creating remaining pages...\n');

// BULK ORDERS PAGE
createFile(path.join(baseDir, 'src/app/bulk-orders/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function BulkOrdersPage() {
  const [form, setForm] = useState({ name: '', email: '', quantity: '', details: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); };
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Bulk Orders</h1>
        <p style={styles.heroSubtitle}>Special rates for large orders</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <div style={styles.info}>
            <h2 style={styles.sectionTitle}>Why Bulk Order?</h2>
            <ul style={styles.listItems}>
              <li>🎯 Special pricing for bulk purchases</li>
              <li>📦 Free shipping on orders above 50 units</li>
              <li>👔 Customization available</li>
              <li>📅 Fast turnaround time</li>
              <li>💼 Dedicated account manager</li>
            </ul>
          </div>
          <form style={styles.form} onSubmit={handleSubmit}>
            {submitted && <p style={styles.success}>Inquiry submitted! We'll contact you soon.</p>}
            <div style={styles.formGroup}><label style={styles.label}>Name</label><input type="text" name="name" value={form.name} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Quantity</label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Details</label><textarea name="details" value={form.details} onChange={handleChange} style={styles.textarea} /></div>
            <button type="submit" style={styles.button}>Submit Inquiry</button>
          </form>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  contentWrapper: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' },
  info: { padding: '1rem' },
  listItems: { listStyle: 'none', color: '#666' },
  form: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#8b2e3b', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', minHeight: '100px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  success: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
};
export { styles };`);

// ABOUT PAGE
createFile(path.join(baseDir, 'src/app/about/page.tsx'), `'use client';
import React from 'react';
export default function AboutPage() {
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>About ONCOST</h1>
        <p style={styles.heroSubtitle}>Crafting timeless elegance</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.aboutWrapper}>
          <div style={styles.aboutSection}>
            <h2 style={styles.sectionTitle}>Our Story</h2>
            <p style={styles.text}>ONCOST was founded with a mission to bring authentic, high-quality ethnic wear to customers worldwide. We blend traditional craftsmanship with contemporary design to create pieces that celebrate culture and style.</p>
          </div>
          <div style={styles.aboutSection}>
            <h2 style={styles.sectionTitle}>Our Mission</h2>
            <p style={styles.text}>To provide exquisite ethnic wear that empowers individuals to express their cultural identity with pride and sophistication.</p>
          </div>
          <div style={styles.aboutSection}>
            <h2 style={styles.sectionTitle}>Our Values</h2>
            <ul style={styles.list}>
              <li>✨ Quality: Premium fabrics and craftsmanship</li>
              <li>🌍 Sustainability: Eco-friendly practices</li>
              <li>💝 Customer First: Your satisfaction matters</li>
              <li>🎨 Innovation: Modern designs with traditional roots</li>
            </ul>
          </div>
          <div style={styles.aboutSection}>
            <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
            <p style={styles.text}>With over 15 years of experience, ONCOST has served thousands of satisfied customers. We maintain strict quality standards, offer competitive pricing, and provide exceptional customer service.</p>
          </div>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  aboutWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  aboutSection: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  text: { color: '#555', lineHeight: '1.8', marginBottom: '1rem' },
  list: { listStyle: 'none', color: '#666' },
};
export { styles };`);

// PRIVACY PAGE
createFile(path.join(baseDir, 'src/app/privacy/page.tsx'), `'use client';
import React from 'react';
export default function PrivacyPage() {
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Privacy Policy</h1>
        <p style={styles.heroSubtitle}>Your privacy matters to us</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.policyWrapper}>
          <div style={styles.policySection}>
            <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
            <p style={styles.text}>We collect information you provide including name, email, phone number, and address. We also collect usage data through cookies and analytics.</p>
          </div>
          <div style={styles.policySection}>
            <h2 style={styles.sectionTitle}>2. How We Use Your Information</h2>
            <p style={styles.text}>Your information is used to process orders, improve our services, send updates, and provide customer support. We never sell your data to third parties.</p>
          </div>
          <div style={styles.policySection}>
            <h2 style={styles.sectionTitle}>3. Data Security</h2>
            <p style={styles.text}>We implement industry-standard security measures to protect your personal information from unauthorized access and misuse.</p>
          </div>
          <div style={styles.policySection}>
            <h2 style={styles.sectionTitle}>4. Your Rights</h2>
            <p style={styles.text}>You have the right to access, modify, or delete your personal data. Contact us at privacy@oncost.com for any requests.</p>
          </div>
          <div style={styles.policySection}>
            <h2 style={styles.sectionTitle}>5. Contact Us</h2>
            <p style={styles.text}>For privacy-related inquiries, please contact us at info@oncost.com or call +91-9876543210.</p>
          </div>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  policyWrapper: { maxWidth: '900px', margin: '0 auto' },
  policySection: { backgroundColor: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  text: { color: '#555', lineHeight: '1.8' },
};
export { styles };`);

// TERMS PAGE
createFile(path.join(baseDir, 'src/app/terms/page.tsx'), `'use client';
import React from 'react';
export default function TermsPage() {
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Terms & Conditions</h1>
        <p style={styles.heroSubtitle}>Please read carefully</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.termsWrapper}>
          <div style={styles.termsSection}>
            <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p style={styles.text}>By accessing our website, you agree to comply with these terms and conditions. If you disagree, please do not use our services.</p>
          </div>
          <div style={styles.termsSection}>
            <h2 style={styles.sectionTitle}>2. Product Information</h2>
            <p style={styles.text}>All product descriptions, prices, and availability are subject to change without notice. We strive for accuracy but do not guarantee it.</p>
          </div>
          <div style={styles.termsSection}>
            <h2 style={styles.sectionTitle}>3. Pricing & Payment</h2>
            <p style={styles.text}>Prices are in Indian Rupees (INR). Payment must be made through our accepted payment methods before order confirmation.</p>
          </div>
          <div style={styles.termsSection}>
            <h2 style={styles.sectionTitle}>4. Shipping & Delivery</h2>
            <p style={styles.text}>We ship within India. Delivery typically takes 5-7 business days. Delays beyond our control are not our responsibility.</p>
          </div>
          <div style={styles.termsSection}>
            <h2 style={styles.sectionTitle}>5. Returns & Refunds</h2>
            <p style={styles.text}>Items can be returned within 30 days of purchase if unused and in original packaging. Refunds are processed within 7-10 business days.</p>
          </div>
          <div style={styles.termsSection}>
            <h2 style={styles.sectionTitle}>6. Limitation of Liability</h2>
            <p style={styles.text}>ONCOST is not liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
          </div>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  termsWrapper: { maxWidth: '900px', margin: '0 auto' },
  termsSection: { backgroundColor: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  text: { color: '#555', lineHeight: '1.8' },
};
export { styles };`);

// SERVICES PAGE
createFile(path.join(baseDir, 'src/app/services/page.tsx'), `'use client';
import React from 'react';
export default function ServicesPage() {
  const services = [
    { title: 'Custom Design', desc: 'Create bespoke pieces tailored to your preferences', icon: '🎨' },
    { title: 'Alterations', desc: 'Professional fitting and alteration services', icon: '✂️' },
    { title: 'Corporate Orders', desc: 'Bulk orders for companies and organizations', icon: '💼' },
    { title: 'Wedding Packages', desc: 'Complete wedding wear collections', icon: '💍' },
    { title: 'Gift Wrapping', desc: 'Elegant packaging for gifting', icon: '🎁' },
    { title: 'Personal Styling', desc: 'Get expert fashion advice', icon: '👔' },
  ];
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Services</h1>
        <p style={styles.heroSubtitle}>More than just clothing</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.servicesGrid}>
          {services.map((service, idx) => (
            <div key={idx} style={styles.serviceCard}>
              <div style={styles.serviceIcon}>{service.icon}</div>
              <h3 style={styles.serviceTitle}>{service.title}</h3>
              <p style={styles.serviceDesc}>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  serviceCard: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  serviceIcon: { fontSize: '3rem', marginBottom: '1rem' },
  serviceTitle: { color: '#8b2e3b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  serviceDesc: { color: '#666', lineHeight: '1.6' },
};
export { styles };`);

// CAREERS PAGE
createFile(path.join(baseDir, 'src/app/careers/page.tsx'), `'use client';
import React from 'react';
export default function CareersPage() {
  const jobs = [
    { title: 'Fashion Designer', level: 'Senior', type: 'Full-time' },
    { title: 'Content Creator', level: 'Junior', type: 'Full-time' },
    { title: 'Customer Service', level: 'Entry', type: 'Full-time' },
    { title: 'Supply Chain Manager', level: 'Senior', type: 'Full-time' },
  ];
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Join Our Team</h1>
        <p style={styles.heroSubtitle}>Be part of something special</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.careersWrapper}>
          <div style={styles.aboutCareers}>
            <h2 style={styles.sectionTitle}>Why Join ONCOST?</h2>
            <ul style={styles.list}>
              <li>🌟 Dynamic work environment</li>
              <li>💼 Competitive compensation</li>
              <li>📈 Career growth opportunities</li>
              <li>🎯 Meaningful work</li>
              <li>🤝 Collaborative culture</li>
            </ul>
          </div>
          <div style={styles.jobsSection}>
            <h2 style={styles.sectionTitle}>Open Positions</h2>
            <div style={styles.jobsList}>
              {jobs.map((job, idx) => (
                <div key={idx} style={styles.jobCard}>
                  <div style={styles.jobHeader}>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <div style={styles.jobMeta}><span style={styles.badge}>{job.level}</span><span style={styles.badge}>{job.type}</span></div>
                  </div>
                  <button style={styles.applyBtn}>Apply Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  careersWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' },
  aboutCareers: { padding: '1rem' },
  list: { listStyle: 'none', color: '#666' },
  jobsSection: { padding: '1rem' },
  jobsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  jobCard: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  jobHeader: { marginBottom: '1rem' },
  jobTitle: { color: '#8b2e3b', marginBottom: '0.5rem', fontSize: '1.1rem' },
  jobMeta: { display: 'flex', gap: '0.5rem' },
  badge: { backgroundColor: '#d4af37', color: '#8b2e3b', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  applyBtn: { backgroundColor: '#8b2e3b', color: '#f9f7f4', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
};
export { styles };`);

console.log('\\n✓ Additional pages created successfully!');
console.log('\\nNow create API endpoints by running: node scripts/create-api-endpoints.js');
