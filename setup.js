#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function createFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  console.log(`✓ ${rel}`);
}

// Common header
const header = `      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>ONCOST</div>
          <nav style={styles.nav}>
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/collections">Collections</a>
            <a href="/contact">Contact</a>
            <a href="/account">Account</a>
          </nav>
        </div>
      </header>`;

const footer = `      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>ONCOST</h4>
            <p>Premium ethnic wear collection</p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li><a href="/about">About Us</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
            </ul>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Contact</h4>
            <p>📞 +91-9876543210</p>
            <p>📧 info@oncost.com</p>
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
  formContainer: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formGroup: { marginBottom: '1.5rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#8b2e3b', fontWeight: '500' },
  input: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', border: '2px solid #d4af37', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit', minHeight: '120px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#8b2e3b', color: '#f9f7f4', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.3s ease' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  footer: { backgroundColor: '#8b2e3b', color: '#f9f7f4', marginTop: 'auto', padding: '3rem 1rem 1rem' },
  footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  footerSection: { textAlign: 'center' },
  footerTitle: { color: '#d4af37', marginBottom: '0.5rem' },
  footerLinks: { listStyle: 'none' },
  footerBottom: { textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.3)' },
};`;

console.log('\n📝 Creating ONCOST Website Structure...\n');

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
  const cats = [{ id: 'all', label: 'All' }, { id: 'sarees', label: 'Sarees' }, { id: 'lehengas', label: 'Lehengas' }, { id: 'kurtas', label: 'Kurtas' }, { id: 'suits', label: 'Salwar Suits' }, { id: 'bridal', label: 'Bridal' }, { id: 'casual', label: 'Casual' }];
  const filtered = selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory);
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; text-decoration: none; } a:hover { text-decoration: underline; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Premium Collection</h1>
        <p style={styles.heroSubtitle}>Discover exquisite traditional and modern wear</p>
      </section>
      <section style={styles.mainContent}>
        <h2 style={styles.sectionTitle}>Shop by Category</h2>
        <div style={styles.filters}>
          {cats.map(cat => <button key={cat.id} style={{...styles.filterButton, ...(selectedCategory === cat.id ? styles.filterButtonActive : {})}} onClick={() => setSelectedCategory(cat.id)}>{cat.label}</button>)}
        </div>
        <div style={styles.productsGrid}>
          {filtered.map(p => <div key={p.id} style={styles.productCard}><div style={styles.productImage}>{p.image}</div><h3 style={styles.productName}>{p.name}</h3><p style={styles.productPrice}>₹{p.price.toLocaleString()}</p><button style={styles.addButton} onClick={() => { setCart([...cart, p]); alert(\`\${p.name} added!\`); }}>Add to Cart</button></div>)}
        </div>
      </section>
      ${footer}
    </div>
  );
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
export { styles };`);

// COLLECTIONS PAGE
createFile(path.join(baseDir, 'src/app/collections/page.tsx'), `'use client';
import React, { useState } from 'react';
export default function CollectionsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const collections = [
    { id: 'ethnic', name: 'Ethnic', desc: 'Traditional Indian', icon: '🎨' },
    { id: 'modern', name: 'Modern Fusion', desc: 'Contemporary', icon: '✨' },
    { id: 'seasonal', name: 'Seasonal', desc: 'Latest trends', icon: '🌸' },
    { id: 'bridal', name: 'Bridal Wear', desc: 'Special occasion', icon: '💍' },
    { id: 'casual', name: 'Casual', desc: 'Daily wear', icon: '👕' },
    { id: 'festive', name: 'Festive', desc: 'Festival specials', icon: '🎉' },
  ];
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; } a:hover { text-decoration: underline; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Collections</h1>
        <p style={styles.heroSubtitle}>Curated for every occasion</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.collectionsGrid}>
          {collections.map(c => <div key={c.id} style={{...styles.collectionCard, ...(selected === c.id ? styles.collectionCardActive : {})}} onClick={() => setSelected(selected === c.id ? null : c.id)}><div style={styles.collectionIcon}>{c.icon}</div><h3 style={styles.collectionName}>{c.name}</h3><p style={styles.collectionDesc}>{c.desc}</p><p style={styles.collectionLink}>→ Explore</p></div>)}
        </div>
      </section>
      ${footer}
    </div>
  );
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
export { styles };`);

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
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Create Account</h1>
        <p style={styles.heroSubtitle}>Join ONCOST</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          {success && <div style={styles.successMsg}>Account created!</div>}
          <form onSubmit={handleSubmit}>
            {['name', 'email', 'phone', 'password', 'confirmPassword'].map(f => <div key={f} style={styles.formGroup}><label style={styles.label}>{f === 'confirmPassword' ? 'Confirm Password' : f.charAt(0).toUpperCase() + f.slice(1)}</label><input type={f.includes('password') ? 'password' : f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'} name={f} value={form[f as keyof typeof form]} onChange={handleChange} style={styles.input} placeholder={f === 'email' ? 'your@email.com' : f === 'phone' ? '1234567890' : ''} />{errors[f] && <p style={styles.error}>{errors[f]}</p>}</div>)}
            {errors.submit && <p style={styles.error}>{errors.submit}</p>}
            <button type="submit" style={styles.button}>Create Account</button>
          </form>
          <p style={styles.centerText}>Have account? <a href="/login">Login</a></p>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  centerText: { textAlign: 'center', marginTop: '1rem', color: '#666' },
};
export { styles };`);

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
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome Back</h1>
        <p style={styles.heroSubtitle}>Login to ONCOST</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} style={styles.input} placeholder="your@email.com" />{errors.email && <p style={styles.error}>{errors.email}</p>}</div>
            <div style={styles.formGroup}><label style={styles.label}>Password</label><input type="password" name="password" value={form.password} onChange={handleChange} style={styles.input} placeholder="Password" />{errors.password && <p style={styles.error}>{errors.password}</p>}</div>
            {errors.submit && <p style={styles.error}>{errors.submit}</p>}
            <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          <div style={styles.links}>
            <p><a href="/forgot-password">Forgot password?</a></p>
            <p>No account? <a href="/signup">Sign up</a></p>
          </div>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  links: { textAlign: 'center', marginTop: '1.5rem' },
};
export { styles };`);

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
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Reset Password</h1>
        <p style={styles.heroSubtitle}>Enter email to receive recovery link</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          {message && <div style={styles.successMsg}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="your@email.com" /></div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Sending...' : 'Send Link'}</button>
          </form>
          <p style={styles.centerText}><a href="/login">Back to login</a></p>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
  centerText: { textAlign: 'center', marginTop: '1rem' },
};
export { styles };`);

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
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      ${header}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Us</h1>
        <p style={styles.heroSubtitle}>We'd love to hear from you</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.contactWrapper}>
          <div style={styles.contactInfo}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>
            <div style={styles.infoItem}><p style={styles.infoLabel}>📍 Address</p><p>123 Fashion Street, New Delhi</p></div>
            <div style={styles.infoItem}><p style={styles.infoLabel}>📞 Phone</p><p>+91-9876543210</p></div>
            <div style={styles.infoItem}><p style={styles.infoLabel}>📧 Email</p><p>info@oncost.com</p></div>
            <div style={styles.infoItem}><p style={styles.infoLabel}>🕐 Hours</p><p>Mon-Sat: 10AM - 6PM</p></div>
          </div>
          <form style={styles.contactForm} onSubmit={handleSubmit}>
            {success && <div style={styles.successMsg}>Message sent!</div>}
            {['name', 'email', 'subject'].map(f => <div key={f} style={styles.formGroup}><label style={styles.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label><input type={f === 'email' ? 'email' : 'text'} name={f} value={form[f as keyof typeof form]} onChange={handleChange} style={styles.input} />{errors[f] && <p style={styles.error}>{errors[f]}</p>}</div>)}
            <div style={styles.formGroup}><label style={styles.label}>Message</label><textarea name="message" value={form.message} onChange={handleChange} style={styles.textarea} />{errors.message && <p style={styles.error}>{errors.message}</p>}</div>
            <button type="submit" style={styles.button}>Send</button>
          </form>
        </div>
      </section>
      ${footer}
    </div>
  );
}
${baseStyles}
  contactWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' },
  contactInfo: { padding: '1rem' },
  infoItem: { marginBottom: '2rem' },
  infoLabel: { fontWeight: 'bold', color: '#8b2e3b', marginBottom: '0.5rem' },
  contactForm: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
};
export { styles };`);

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
  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI'; background: #f9f7f4; } a { color: #8b2e3b; }\`}</style>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>ONCOST</div>
          <nav style={styles.nav}><a href="/">Home</a><a href="/shop">Shop</a><a href="/account" style={{ color: '#d4af37', fontWeight: 'bold' }}>Account</a></nav>
        </div>
      </header>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>My Account</h1>
        <p style={styles.heroSubtitle}>Manage your profile</p>
      </section>
      <section style={styles.mainContent}>
        <div style={styles.accountCard}>
          <h2 style={styles.sectionTitle}>Welcome, {user?.name}!</h2>
          <div style={styles.profileInfo}>
            <div style={styles.infoRow}><span style={styles.label}>Name:</span><span>{user?.name}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Email:</span><span>{user?.email}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Phone:</span><span>{user?.phone}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Member Since:</span><span>{user?.joinDate}</span></div>
          </div>
          <button style={styles.button} onClick={handleLogout}>Logout</button>
        </div>
      </section>
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}><h4 style={styles.footerTitle}>ONCOST</h4><p>Premium ethnic wear</p></div>
        </div>
        <div style={styles.footerBottom}><p>&copy; 2024 ONCOST</p></div>
      </footer>
    </div>
  );
}
${baseStyles}
  accountCard: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  profileInfo: { marginBottom: '2rem' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' },
};
export { styles };`);

console.log('\\n✓ Core pages created successfully!');
console.log('\\nNow run: node scripts/create-remaining-pages.js');
