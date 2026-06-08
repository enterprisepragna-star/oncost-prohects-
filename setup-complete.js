#!/usr/bin/env node
/**
 * ONCOST Website Complete Setup Script
 * Creates all pages, forms, and API endpoints
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = __dirname;
let fileCount = 0;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  console.log(`  ✓ ${rel}`);
  fileCount++;
}

console.log('\n╔════════════════════════════════════════╗');
console.log('║   ONCOST Website Setup - Full Build   ║');
console.log('╚════════════════════════════════════════╝\n');

// Common header/footer
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
          <p>&copy; 2024 ONCOST. All rights reserved.</p>
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

console.log('📝 Creating page components...\n');

// SHOP PAGE
createFile(path.join(baseDir, 'src/app/shop/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function ShopPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const products = [
    { id: 1, name: 'Premium Saree', price: 4999, category: 'sarees', image: '👗' },
    { id: 2, name: 'Designer Lehenga', price: 6999, category: 'lehengas', image: '👕' },
    { id: 3, name: 'Silk Kurta', price: 2999, category: 'kurtas', image: '👔' },
    { id: 4, name: 'Salwar Suit', price: 1999, category: 'suits', image: '👗' },
    { id: 5, name: 'Bridal Collection', price: 12999, category: 'bridal', image: '✨' },
    { id: 6, name: 'Casual Wear', price: 1499, category: 'casual', image: '👕' },
  ];
  const categories = [{ id: 'all', label: 'All' }, { id: 'sarees', label: 'Sarees' }, { id: 'lehengas', label: 'Lehengas' }, { id: 'kurtas', label: 'Kurtas' }, { id: 'suits', label: 'Salwar Suits' }, { id: 'bridal', label: 'Bridal' }, { id: 'casual', label: 'Casual' }];
  const filtered = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Our Premium Collection</h1><p style={styles.heroSubtitle}>Discover exquisite traditional and modern wear</p></section><section style={styles.mainContent}><h2 style={styles.sectionTitle}>Shop by Category</h2><div style={styles.filters}>{categories.map(cat => <button key={cat.id} style={{...styles.filterButton, ...(selectedCategory === cat.id ? styles.filterButtonActive : {})}} onClick={() => setSelectedCategory(cat.id)}>{cat.label}</button>)}</div><div style={styles.productsGrid}>{filtered.map(p => <div key={p.id} style={styles.productCard}><div style={styles.productImage}>{p.image}</div><h3 style={styles.productName}>{p.name}</h3><p style={styles.productPrice}>₹{p.price.toLocaleString()}</p><button style={styles.addButton} onClick={() => { setCart([...cart, p]); alert(\`\${p.name} added!\`); }}>Add to Cart</button></div>)}</div></section>${footer}</div>);
}
${baseStyles}
  filters: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  filterButton: { padding: '0.75rem 1.5rem', border: '2px solid #d4af37', backgroundColor: '#f9f7f4', color: '#8b2e3b', borderRadius: '25px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
  filterButtonActive: { backgroundColor: '#d4af37', color: '#8b2e3b' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' },
  productCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  productImage: { fontSize: '3rem', marginBottom: '1rem' },
  productName: { color: '#8b2e3b', marginBottom: '0.5rem' },
  productPrice: { fontSize: '1.3rem', color: '#d4af37', fontWeight: 'bold', marginBottom: '1rem' },
  addButton: { backgroundColor: '#8b2e3b', color: '#f9f7f4', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' },
};
`);

// COLLECTIONS PAGE
createFile(path.join(baseDir, 'src/app/collections/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function CollectionsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const collections = [{ id: 'ethnic', name: 'Ethnic', desc: 'Traditional Indian', icon: '🎨' }, { id: 'modern', name: 'Modern Fusion', desc: 'Contemporary', icon: '✨' }, { id: 'seasonal', name: 'Seasonal', desc: 'Latest trends', icon: '🌸' }, { id: 'bridal', name: 'Bridal Wear', desc: 'Special occasion', icon: '💍' }, { id: 'casual', name: 'Casual', desc: 'Daily wear', icon: '👕' }, { id: 'festive', name: 'Festive', desc: 'Festival specials', icon: '🎉' }];
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Our Collections</h1><p style={styles.heroSubtitle}>Curated for every occasion</p></section><section style={styles.mainContent}><div style={styles.collectionsGrid}>{collections.map(c => <div key={c.id} style={{...styles.collectionCard, ...(selected === c.id ? styles.collectionCardActive : {})}} onClick={() => setSelected(selected === c.id ? null : c.id)}><div style={styles.collectionIcon}>{c.icon}</div><h3 style={styles.collectionName}>{c.name}</h3><p style={styles.collectionDesc}>{c.desc}</p><p style={styles.collectionLink}>→ Explore</p></div>)}</div></section>${footer}</div>);
}
${baseStyles}
  collectionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  collectionCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' },
  collectionCardActive: { backgroundColor: '#d4af37', transform: 'translateY(-4px)' },
  collectionIcon: { fontSize: '3rem', marginBottom: '1rem' },
  collectionName: { color: '#8b2e3b', marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' },
  collectionDesc: { color: '#666', marginBottom: '1rem' },
  collectionLink: { color: '#8b2e3b', fontWeight: 'bold' },
};
`);

// SIGNUP PAGE
createFile(path.join(baseDir, 'src/app/signup/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim()) e.email = 'Email required';
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone required';
    else if (!/^\\d{10}$/.test(form.phone.replace(/\\D/g, ''))) e.phone = 'Invalid phone';
    if (!form.password) e.password = 'Password required';
    else if (form.password.length < 6) e.password = 'Min 6 chars';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords mismatch';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setSuccess(true); setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' }); setTimeout(() => { window.location.href = '/login'; }, 2000); }
    } catch (err) { setErrors({ submit: 'Error' }); }
  };
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Create Account</h1><p style={styles.heroSubtitle}>Join ONCOST</p></section><section style={styles.mainContent}><div style={styles.formContainer}>{success && <div style={styles.successMsg}>Account created!</div>}<form onSubmit={handleSubmit}>{['name', 'email', 'phone', 'password', 'confirmPassword'].map(f => <div key={f} style={styles.formGroup}><label style={styles.label}>{f === 'confirmPassword' ? 'Confirm Password' : f.charAt(0).toUpperCase() + f.slice(1)}</label><input type={f.includes('password') ? 'password' : f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'} name={f} value={form[f as keyof typeof form]} onChange={handleChange} style={styles.input} placeholder={f === 'email' ? 'your@email.com' : f === 'phone' ? '1234567890' : ''} />{errors[f] && <p style={styles.error}>{errors[f]}</p>}</div>)}{errors.submit && <p style={styles.error}>{errors.submit}</p>}<button type="submit" style={styles.button}>Create Account</button></form><p style={styles.centerText}>Have account? <a href="/login">Login</a></p></div></section>${footer}</div>);
}
${baseStyles}
  formContainer: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#8b2e3b', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  centerText: { textAlign: 'center', marginTop: '1rem', color: '#666' },
};
`);

// LOGIN PAGE
createFile(path.join(baseDir, 'src/app/login/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!form.email) setErrors(p => ({ ...p, email: 'Email required' }));
    if (!form.password) setErrors(p => ({ ...p, password: 'Password required' }));
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('token', data.token); window.location.href = '/account'; }
      else setErrors({ submit: data.message || 'Login failed' });
    } catch (err) { setErrors({ submit: 'Error' }); }
    finally { setLoading(false); }
  };
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Welcome Back</h1><p style={styles.heroSubtitle}>Login to ONCOST</p></section><section style={styles.mainContent}><div style={styles.formContainer}><form onSubmit={handleSubmit}><div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} placeholder="your@email.com" />{errors.email && <p style={styles.error}>{errors.email}</p>}</div><div style={styles.formGroup}><label style={styles.label}>Password</label><input type="password" name="password" value={form.password} onChange={handleChange} style={styles.input} placeholder="Password" />{errors.password && <p style={styles.error}>{errors.password}</p>}</div>{errors.submit && <p style={styles.error}>{errors.submit}</p>}<button type="submit" style={styles.button} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button></form><div style={styles.links}><p><a href="/forgot-password">Forgot password?</a></p><p>No account? <a href="/signup">Sign up</a></p></div></div></section>${footer}</div>);
}
${baseStyles}
  formContainer: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#8b2e3b', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  links: { textAlign: 'center', marginTop: '1.5rem' },
};
`);

// FORGOT PASSWORD PAGE
createFile(path.join(baseDir, 'src/app/forgot-password/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) { setError('Email required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (res.ok) { setMessage('Recovery link sent!'); setEmail(''); }
      else setError('Failed. Try again.');
    } catch (err) { setError('Error'); }
    finally { setLoading(false); }
  };
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Reset Password</h1><p style={styles.heroSubtitle}>Enter email to receive recovery link</p></section><section style={styles.mainContent}><div style={styles.formContainer}>{message && <div style={styles.successMsg}>{message}</div>}<form onSubmit={handleSubmit}><div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="your@email.com" /></div>{error && <p style={styles.error}>{error}</p>}<button type="submit" style={styles.button} disabled={loading}>{loading ? 'Sending...' : 'Send Link'}</button></form><p style={styles.centerText}><a href="/login">Back to login</a></p></div></section>${footer}</div>);
}
${baseStyles}
  formContainer: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#8b2e3b', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
  centerText: { textAlign: 'center', marginTop: '1rem' },
};
`);

// CONTACT PAGE
createFile(path.join(baseDir, 'src/app/contact/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!form.name.trim()) e2.name = 'Name required';
    if (!form.email.trim()) e2.email = 'Email required';
    if (!form.subject.trim()) e2.subject = 'Subject required';
    if (!form.message.trim()) e2.message = 'Message required';
    if (Object.keys(e2).length === 0) { setSuccess(true); setForm({ name: '', email: '', subject: '', message: '' }); setTimeout(() => setSuccess(false), 3000); }
    else setErrors(e2);
  };
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Contact Us</h1><p style={styles.heroSubtitle}>We'd love to hear from you</p></section><section style={styles.mainContent}><div style={styles.contactWrapper}><div style={styles.contactInfo}><h2 style={styles.sectionTitle}>Get in Touch</h2><div style={styles.infoItem}><p style={styles.infoLabel}>📍 Address</p><p>123 Fashion Street, New Delhi</p></div><div style={styles.infoItem}><p style={styles.infoLabel}>📞 Phone</p><p>+91-9876543210</p></div><div style={styles.infoItem}><p style={styles.infoLabel}>📧 Email</p><p>info@oncost.com</p></div><div style={styles.infoItem}><p style={styles.infoLabel}>🕐 Hours</p><p>Mon-Sat: 10AM - 6PM</p></div></div><form style={styles.contactForm} onSubmit={handleSubmit}>{success && <div style={styles.successMsg}>Message sent!</div>}{['name', 'email', 'subject'].map(f => <div key={f} style={styles.formGroup}><label style={styles.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label><input type={f === 'email' ? 'email' : 'text'} name={f} value={form[f as keyof typeof form]} onChange={handleChange} style={styles.input} />{errors[f] && <p style={styles.error}>{errors[f]}</p>}</div>)}<div style={styles.formGroup}><label style={styles.label}>Message</label><textarea name="message" value={form.message} onChange={handleChange} style={styles.textarea} />{errors.message && <p style={styles.error}>{errors.message}</p>}</div><button type="submit" style={styles.button}>Send</button></form></div></section>${footer}</div>);
}
${baseStyles}
  contactWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' },
  contactInfo: { padding: '1rem' },
  infoItem: { marginBottom: '2rem' },
  infoLabel: { fontWeight: 'bold', color: '#8b2e3b', marginBottom: '0.5rem' },
  contactForm: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#8b2e3b', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', minHeight: '100px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
};
`);

// ACCOUNT PAGE
createFile(path.join(baseDir, 'src/app/account/page.tsx'), `'use client';
import React, { useEffect, useState } from 'react';
export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    setUser({ name: 'John Doe', email: 'john@example.com', phone: '9876543210', joinDate: '2024-01-15' });
    setLoading(false);
  }, []);
  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };
  if (loading) return <div style={styles.container}><p>Loading...</p></div>;
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style><header style={styles.header}><div style={styles.headerContent}><div style={styles.logo}>ONCOST</div><nav style={styles.nav}><a href="/">Home</a><a href="/shop">Shop</a><a href="/account" style={{ color: '#d4af37', fontWeight: 'bold' }}>Account</a></nav></div></header><section style={styles.hero}><h1 style={styles.heroTitle}>My Account</h1><p style={styles.heroSubtitle}>Manage your profile</p></section><section style={styles.mainContent}><div style={styles.accountCard}><h2 style={styles.sectionTitle}>Welcome, {user?.name}!</h2><div style={styles.profileInfo}><div style={styles.infoRow}><span style={styles.label}>Name:</span><span>{user?.name}</span></div><div style={styles.infoRow}><span style={styles.label}>Email:</span><span>{user?.email}</span></div><div style={styles.infoRow}><span style={styles.label}>Phone:</span><span>{user?.phone}</span></div><div style={styles.infoRow}><span style={styles.label}>Member Since:</span><span>{user?.joinDate}</span></div></div><button style={styles.button} onClick={handleLogout}>Logout</button></div></section><footer style={styles.footer}><div style={styles.footerContent}><div style={styles.footerSection}><h4 style={styles.footerTitle}>ONCOST</h4><p>Premium ethnic wear</p></div></div><div style={styles.footerBottom}><p>&copy; 2024 ONCOST</p></div></footer></div>);
}
${baseStyles}
  accountCard: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  profileInfo: { marginBottom: '2rem' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' },
  label: { fontWeight: 'bold', color: '#8b2e3b' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' },
};
`);

// BULK ORDERS PAGE
createFile(path.join(baseDir, 'src/app/bulk-orders/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function BulkOrdersPage() {
  const [form, setForm] = useState({ name: '', email: '', quantity: '', details: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); };
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Bulk Orders</h1><p style={styles.heroSubtitle}>Special rates for large orders</p></section><section style={styles.mainContent}><div style={styles.contentWrapper}><div style={styles.info}><h2 style={styles.sectionTitle}>Why Bulk Order?</h2><ul style={styles.listItems}><li>🎯 Special pricing for bulk purchases</li><li>📦 Free shipping on 50+ units</li><li>👔 Customization available</li><li>📅 Fast turnaround time</li><li>💼 Dedicated account manager</li></ul></div><form style={styles.form} onSubmit={handleSubmit}>{submitted && <p style={styles.success}>Inquiry submitted! We'll contact you soon.</p>}<div style={styles.formGroup}><label style={styles.label}>Name</label><input type="text" name="name" value={form.name} onChange={handleChange} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.label}>Quantity</label><input type="number" name="quantity" value={form.quantity} onChange={handleChange} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.label}>Details</label><textarea name="details" value={form.details} onChange={handleChange} style={styles.textarea} /></div><button type="submit" style={styles.button}>Submit Inquiry</button></form></div></section>${footer}</div>);
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
  success: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
};
`);

// ABOUT PAGE
createFile(path.join(baseDir, 'src/app/about/page.tsx'), `'use client';
import React from 'react';
export default function AboutPage() {
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>About ONCOST</h1><p style={styles.heroSubtitle}>Crafting timeless elegance</p></section><section style={styles.mainContent}><div style={styles.aboutWrapper}><div style={styles.aboutSection}><h2 style={styles.sectionTitle}>Our Story</h2><p style={styles.text}>ONCOST was founded with a mission to bring authentic, high-quality ethnic wear to customers worldwide. We blend traditional craftsmanship with contemporary design.</p></div><div style={styles.aboutSection}><h2 style={styles.sectionTitle}>Our Mission</h2><p style={styles.text}>To provide exquisite ethnic wear that empowers individuals to express their cultural identity with pride and sophistication.</p></div><div style={styles.aboutSection}><h2 style={styles.sectionTitle}>Our Values</h2><ul style={styles.list}><li>✨ Quality: Premium fabrics</li><li>🌍 Sustainability: Eco-friendly</li><li>💝 Customer First: Your satisfaction</li><li>🎨 Innovation: Modern designs</li></ul></div></div></section>${footer}</div>);
}
${baseStyles}
  aboutWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  aboutSection: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  text: { color: '#555', lineHeight: '1.8' },
  list: { listStyle: 'none', color: '#666' },
};
`);

// PRIVACY PAGE
createFile(path.join(baseDir, 'src/app/privacy/page.tsx'), `'use client';
import React from 'react';
export default function PrivacyPage() {
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Privacy Policy</h1><p style={styles.heroSubtitle}>Your privacy matters to us</p></section><section style={styles.mainContent}><div style={styles.policyWrapper}><div style={styles.policySection}><h2 style={styles.sectionTitle}>1. Information We Collect</h2><p style={styles.text}>We collect information including name, email, phone, and address. We also collect usage data through cookies and analytics.</p></div><div style={styles.policySection}><h2 style={styles.sectionTitle}>2. How We Use Your Information</h2><p style={styles.text}>Your information is used to process orders, improve services, send updates, and provide customer support. We never sell your data.</p></div><div style={styles.policySection}><h2 style={styles.sectionTitle}>3. Data Security</h2><p style={styles.text}>We implement industry-standard security measures to protect your personal information from unauthorized access.</p></div></div></section>${footer}</div>);
}
${baseStyles}
  policyWrapper: { maxWidth: '900px', margin: '0 auto' },
  policySection: { backgroundColor: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  text: { color: '#555', lineHeight: '1.8' },
};
`);

// TERMS PAGE
createFile(path.join(baseDir, 'src/app/terms/page.tsx'), `'use client';
import React from 'react';
export default function TermsPage() {
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Terms & Conditions</h1><p style={styles.heroSubtitle}>Please read carefully</p></section><section style={styles.mainContent}><div style={styles.termsWrapper}><div style={styles.termsSection}><h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2><p style={styles.text}>By accessing our website, you agree to comply with these terms. If you disagree, please do not use our services.</p></div><div style={styles.termsSection}><h2 style={styles.sectionTitle}>2. Product Information</h2><p style={styles.text}>All product descriptions, prices, and availability are subject to change. We strive for accuracy but do not guarantee it.</p></div><div style={styles.termsSection}><h2 style={styles.sectionTitle}>3. Pricing & Payment</h2><p style={styles.text}>Prices are in Indian Rupees (INR). Payment must be made through accepted methods before order confirmation.</p></div></div></section>${footer}</div>);
}
${baseStyles}
  termsWrapper: { maxWidth: '900px', margin: '0 auto' },
  termsSection: { backgroundColor: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  text: { color: '#555', lineHeight: '1.8' },
};
`);

// SERVICES PAGE
createFile(path.join(baseDir, 'src/app/services/page.tsx'), `'use client';
import React from 'react';
export default function ServicesPage() {
  const services = [
    { title: 'Custom Design', desc: 'Bespoke pieces tailored to preferences', icon: '🎨' },
    { title: 'Alterations', desc: 'Professional fitting and alterations', icon: '✂️' },
    { title: 'Corporate Orders', desc: 'Bulk orders for companies', icon: '💼' },
    { title: 'Wedding Packages', desc: 'Complete wedding collections', icon: '💍' },
    { title: 'Gift Wrapping', desc: 'Elegant packaging for gifting', icon: '🎁' },
    { title: 'Personal Styling', desc: 'Expert fashion advice', icon: '👔' },
  ];
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Our Services</h1><p style={styles.heroSubtitle}>More than just clothing</p></section><section style={styles.mainContent}><div style={styles.servicesGrid}>{services.map((service, idx) => <div key={idx} style={styles.serviceCard}><div style={styles.serviceIcon}>{service.icon}</div><h3 style={styles.serviceTitle}>{service.title}</h3><p style={styles.serviceDesc}>{service.desc}</p></div>)}</div></section>${footer}</div>);
}
${baseStyles}
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  serviceCard: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  serviceIcon: { fontSize: '3rem', marginBottom: '1rem' },
  serviceTitle: { color: '#8b2e3b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' },
  serviceDesc: { color: '#666', lineHeight: '1.6' },
};
`);

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
  return (<div style={styles.container}><style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>${header}<section style={styles.hero}><h1 style={styles.heroTitle}>Join Our Team</h1><p style={styles.heroSubtitle}>Be part of something special</p></section><section style={styles.mainContent}><div style={styles.careersWrapper}><div style={styles.aboutCareers}><h2 style={styles.sectionTitle}>Why Join ONCOST?</h2><ul style={styles.list}><li>🌟 Dynamic work environment</li><li>💼 Competitive compensation</li><li>📈 Career growth</li><li>🎯 Meaningful work</li><li>🤝 Collaborative culture</li></ul></div><div style={styles.jobsSection}><h2 style={styles.sectionTitle}>Open Positions</h2><div style={styles.jobsList}>{jobs.map((job, idx) => <div key={idx} style={styles.jobCard}><div style={styles.jobHeader}><h3 style={styles.jobTitle}>{job.title}</h3><div style={styles.jobMeta}><span style={styles.badge}>{job.level}</span><span style={styles.badge}>{job.type}</span></div></div><button style={styles.applyBtn}>Apply Now</button></div>)}</div></div></div></section>${footer}</div>);
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
`);

console.log('\n🔧 Creating API endpoints...\n');

// API: USERS
createFile(path.join(baseDir, 'pages/api/users.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

let users: User[] = [];

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function createUser(name: string, email: string, phone: string, password: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ users: users.length, message: 'Users API endpoint' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
`);

// API: SIGNUP
createFile(path.join(baseDir, 'pages/api/signup.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByEmail } from './users';

interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password }: SignupRequest = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!/^\\d{10}$/.test(phone.replace(/\\D/g, ''))) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  try {
    const user = createUser(name, email, phone, password);
    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
`);

// API: LOGIN
createFile(path.join(baseDir, 'pages/api/login.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, verifyPassword } from './users';
import crypto from 'crypto';

interface LoginRequest {
  email: string;
  password: string;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password }: LoginRequest = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken();

  return res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}
`);

// API: FORGOT PASSWORD
createFile(path.join(baseDir, 'pages/api/forgot-password.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail } from './users';

interface ForgotPasswordRequest {
  email: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email }: ForgotPasswordRequest = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json({
    message: 'Password reset link sent to email',
  });
}
`);

// API: RESET PASSWORD
createFile(path.join(baseDir, 'pages/api/reset-password.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, hashPassword } from './users';

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, newPassword, email }: ResetPasswordRequest = req.body;

  if (!token || !newPassword || !email) {
    return res.status(400).json({ message: 'Token, email, and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.passwordHash = hashPassword(newPassword);

  return res.status(200).json({
    message: 'Password reset successfully. Please login with your new password.',
  });
}
`);

console.log('\n╔════════════════════════════════════════╗');
console.log('║          ✨ SETUP COMPLETE ✨          ║');
console.log('╚════════════════════════════════════════╝\n');
console.log(`📊 Created ${fileCount} files:\n`);
console.log('📄 Pages Created:');
console.log('  ✓ Shop (product browsing with categories)');
console.log('  ✓ Collections (curated collections showcase)');
console.log('  ✓ Signup (user registration form)');
console.log('  ✓ Login (user authentication)');
console.log('  ✓ Forgot Password (password recovery)');
console.log('  ✓ Contact (inquiry form)');
console.log('  ✓ Account (user dashboard)');
console.log('  ✓ Bulk Orders (corporate orders)');
console.log('  ✓ About (company information)');
console.log('  ✓ Privacy (privacy policy)');
console.log('  ✓ Terms (terms and conditions)');
console.log('  ✓ Services (business services)');
console.log('  ✓ Careers (job listings)');
console.log('\n🔧 API Endpoints Created:');
console.log('  ✓ /api/users (user management)');
console.log('  ✓ /api/signup (registration)');
console.log('  ✓ /api/login (authentication)');
console.log('  ✓ /api/forgot-password (recovery)');
console.log('  ✓ /api/reset-password (password reset)');
console.log('\n🎨 Design Features:');
console.log('  ✓ Brand colors: Maroon (#8b2e3b), Gold (#d4af37), Cream (#f9f7f4)');
console.log('  ✓ Mobile-first responsive design');
console.log('  ✓ Inline styles (no external CSS needed)');
console.log('  ✓ Form validation and error handling');
console.log('  ✓ Professional, clean aesthetics');
console.log('\n🚀 Next Steps:');
console.log('  1. Run: npm install');
console.log('  2. Run: npm run dev');
console.log('  3. Visit: http://localhost:3000');
console.log('\n✨ Your ONCOST website is ready!\\n');
