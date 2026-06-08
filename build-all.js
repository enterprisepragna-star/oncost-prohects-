const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = 'C:\\Users\\hp\\Documents\\ONCOST WEBSITE';

function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  createDir(dir);
  fs.writeFileSync(filePath, content, 'utf8');
  const relPath = filePath.replace(baseDir, '').replace(/\\/g, '/');
  console.log(`✓ ${relPath}`);
}

// ===== SHARED STYLES & COMPONENTS =====
const sharedHeader = `      <header style={styles.header}>
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

const sharedFooter = `      <footer style={styles.footer}>
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

const sharedStyles = `
const styles: { [key: string]: React.CSSProperties } = {
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

// ===== SHOP PAGE =====
const shopPage = `'use client';

import React, { useState } from 'react';

export default function ShopPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = [
    { id: 1, name: 'Premium Saree Collection', price: 4999, category: 'sarees', image: '👗' },
    { id: 2, name: 'Designer Lehenga', price: 6999, category: 'lehengas', image: '👕' },
    { id: 3, name: 'Silk Kurta Set', price: 2999, category: 'kurtas', image: '👔' },
    { id: 4, name: 'Cotton Salwar Suit', price: 1999, category: 'suits', image: '👗' },
    { id: 5, name: 'Bridal Collection', price: 12999, category: 'bridal', image: '✨' },
    { id: 6, name: 'Casual Wear Range', price: 1499, category: 'casual', image: '👕' },
  ];

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'sarees', label: 'Sarees' },
    { id: 'lehengas', label: 'Lehengas' },
    { id: 'kurtas', label: 'Kurtas' },
    { id: 'suits', label: 'Salwar Suits' },
    { id: 'bridal', label: 'Bridal' },
    { id: 'casual', label: 'Casual' },
  ];

  const filteredProducts = selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    alert(\`\${product.name} added to cart!\`);
  };

  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; } a { color: #8b2e3b; text-decoration: none; } a:hover { text-decoration: underline; }\`}</style>

      ${sharedHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Premium Collection</h1>
        <p style={styles.heroSubtitle}>Discover exquisite traditional and modern wear</p>
      </section>

      <section style={styles.mainContent}>
        <h2 style={styles.sectionTitle}>Shop by Category</h2>
        <div style={styles.filters}>
          {categories.map((category) => (
            <button key={category.id} style={{ ...styles.filterButton, ...(selectedCategory === category.id ? styles.filterButtonActive : {}) }} onClick={() => setSelectedCategory(category.id)}>
              {category.label}
            </button>
          ))}
        </div>

        <div style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <div style={styles.productImage}>{product.image}</div>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productPrice}>₹{product.price.toLocaleString()}</p>
              <button style={styles.addButton} onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      ${sharedFooter}
    </div>
  );
}

${sharedStyles}
  filters: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  filterButton: { padding: '0.75rem 1.5rem', border: '2px solid #d4af37', backgroundColor: '#f9f7f4', color: '#8b2e3b', borderRadius: '25px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.3s ease' },
  filterButtonActive: { backgroundColor: '#d4af37', color: '#8b2e3b' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' },
  productCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s ease' },
  productImage: { fontSize: '3rem', marginBottom: '1rem' },
  productName: { color: '#8b2e3b', marginBottom: '0.5rem' },
  productPrice: { fontSize: '1.3rem', color: '#d4af37', fontWeight: 'bold', marginBottom: '1rem' },
  addButton: { backgroundColor: '#8b2e3b', color: '#f9f7f4', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'background-color 0.3s ease' },
};
`;

// ===== COLLECTIONS PAGE =====
const collectionsPage = `'use client';

import React, { useState } from 'react';

export default function CollectionsPage() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const collections = [
    { id: 'ethnic', name: 'Ethnic Collection', desc: 'Traditional Indian wear', icon: '🎨' },
    { id: 'modern', name: 'Modern Fusion', desc: 'Contemporary designs', icon: '✨' },
    { id: 'seasonal', name: 'Seasonal', desc: 'Latest seasonal trends', icon: '🌸' },
    { id: 'bridal', name: 'Bridal Wear', desc: 'Special occasion collection', icon: '💍' },
    { id: 'casual', name: 'Casual Comfort', desc: 'Daily wear essentials', icon: '👕' },
    { id: 'festive', name: 'Festive', desc: 'Festival specials', icon: '🎉' },
  ];

  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; } a { color: #8b2e3b; text-decoration: none; } a:hover { text-decoration: underline; }\`}</style>

      ${sharedHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Collections</h1>
        <p style={styles.heroSubtitle}>Curated collections for every occasion</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.collectionsGrid}>
          {collections.map((collection) => (
            <div key={collection.id} style={{ ...styles.collectionCard, ...(selectedCollection === collection.id ? styles.collectionCardActive : {}) }} onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}>
              <div style={styles.collectionIcon}>{collection.icon}</div>
              <h3 style={styles.collectionName}>{collection.name}</h3>
              <p style={styles.collectionDesc}>{collection.desc}</p>
              <p style={styles.collectionLink}>→ Explore Collection</p>
            </div>
          ))}
        </div>
      </section>

      ${sharedFooter}
    </div>
  );
}

${sharedStyles}
  collectionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  collectionCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' },
  collectionCardActive: { backgroundColor: '#d4af37', transform: 'translateY(-4px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' },
  collectionIcon: { fontSize: '3rem', marginBottom: '1rem' },
  collectionName: { color: '#8b2e3b', marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' },
  collectionDesc: { color: '#666', marginBottom: '1rem' },
  collectionLink: { color: '#8b2e3b', fontWeight: 'bold' },
};
`;

// ===== SIGNUP PAGE =====
const signupPage = `'use client';

import React, { useState } from 'react';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\\d{10}$/.test(formData.phone.replace(/\\D/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be 6+ characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      }
    } catch (err) {
      setErrors({ submit: 'Error submitting form' });
    }
  };

  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; } a { color: #8b2e3b; text-decoration: none; } a:hover { text-decoration: underline; }\`}</style>

      ${sharedHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Create Account</h1>
        <p style={styles.heroSubtitle}>Join ONCOST for exclusive offers</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          {success && <div style={styles.successMsg}>Account created! Redirecting to login...</div>}
          <form onSubmit={handleSubmit}>
            {['name', 'email', 'phone', 'password', 'confirmPassword'].map((field) => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>{field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input type={field.includes('password') ? 'password' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} name={field} value={formData[field as keyof typeof formData]} onChange={handleChange} style={styles.input} placeholder={field === 'email' ? 'your@email.com' : field === 'phone' ? '1234567890' : ''} />
                {errors[field] && <p style={styles.error}>{errors[field]}</p>}
              </div>
            ))}
            {errors.submit && <p style={styles.error}>{errors.submit}</p>}
            <button type="submit" style={styles.button}>Create Account</button>
          </form>
          <p style={styles.centerText}>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </section>

      ${sharedFooter}
    </div>
  );
}

${sharedStyles}
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  centerText: { textAlign: 'center', marginTop: '1rem', color: '#666' },
};
`;

// ===== LOGIN PAGE =====
const loginPage = `'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!formData.email) setErrors(prev => ({ ...prev, email: 'Email is required' }));
    if (!formData.password) setErrors(prev => ({ ...prev, password: 'Password is required' }));
    if (!formData.email || !formData.password) return;

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/account';
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Error submitting form' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{\`* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; } a { color: #8b2e3b; text-decoration: none; } a:hover { text-decoration: underline; }\`}</style>

      ${sharedHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome Back</h1>
        <p style={styles.heroSubtitle}>Login to your ONCOST account</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} placeholder="your@email.com" />
              {errors.email && <p style={styles.error}>{errors.email}</p>}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} style={styles.input} placeholder="Enter your password" />
              {errors.password && <p style={styles.error}>{errors.password}</p>}
            </div>
            {errors.submit && <p style={styles.error}>{errors.submit}</p>}
            <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          <div style={styles.links}>
            <p><a href="/forgot-password">Forgot password?</a></p>
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          </div>
        </div>
      </section>

      ${sharedFooter}
    </div>
  );
}

${sharedStyles}
  links: { textAlign: 'center', marginTop: '1.5rem' },
};
`;

// Write all files
console.log('\\nCreating ONCOST website structure...\n');
writeFile(path.join(baseDir, 'src\\app\\shop\\page.tsx'), shopPage);
writeFile(path.join(baseDir, 'src\\app\\collections\\page.tsx'), collectionsPage);
writeFile(path.join(baseDir, 'src\\app\\signup\\page.tsx'), signupPage);
writeFile(path.join(baseDir, 'src\\app\\login\\page.tsx'), loginPage);

console.log('\\n✓ First batch of pages created!\\nContinuing with remaining pages...');
