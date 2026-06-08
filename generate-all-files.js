const fs = require('fs');
const path = require('path');

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
  console.log(`✓ Created: ${filePath.replace(baseDir, '')}`);
}

// Common header/footer component code
const commonHeader = `
      <header style={styles.header}>
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
      </header>
`;

const commonFooter = `
      <footer style={styles.footer}>
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
      </footer>
`;

const commonStyles = `
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
  buttonHover: { backgroundColor: '#6b1f2b' },
  link: { color: '#8b2e3b', textDecoration: 'none', fontWeight: '500' },
  footer: { backgroundColor: '#8b2e3b', color: '#f9f7f4', marginTop: 'auto', padding: '3rem 1rem 1rem' },
  footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  footerSection: { textAlign: 'center' },
  footerTitle: { color: '#d4af37', marginBottom: '0.5rem' },
  footerLinks: { listStyle: 'none' },
  footerBottom: { textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.3)' },
};
`;

// ==================== COLLECTIONS PAGE ====================
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
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      ${commonHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Collections</h1>
        <p style={styles.heroSubtitle}>Curated collections for every occasion</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.collectionsGrid}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                ...styles.collectionCard,
                ...(selectedCollection === collection.id ? styles.collectionCardActive : {}),
              }}
              onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}
            >
              <div style={styles.collectionIcon}>{collection.icon}</div>
              <h3 style={styles.collectionName}>{collection.name}</h3>
              <p style={styles.collectionDesc}>{collection.desc}</p>
              <p style={styles.collectionLink}>→ Explore Collection</p>
            </div>
          ))}
        </div>
      </section>

      ${commonFooter}
    </div>
  );
}

${commonStyles}
  collectionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  collectionCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' },
  collectionCardActive: { backgroundColor: '#d4af37', transform: 'translateY(-4px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' },
  collectionIcon: { fontSize: '3rem', marginBottom: '1rem' },
  collectionName: { color: '#8b2e3b', marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 'bold' },
  collectionDesc: { color: '#666', marginBottom: '1rem' },
  collectionLink: { color: '#8b2e3b', fontWeight: 'bold' },
};
`;

// ==================== SIGNUP PAGE ====================
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
      } else {
        setErrors({ submit: 'Signup failed. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'Error submitting form' });
    }
  };

  return (
    <div style={styles.container}>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      ${commonHeader}

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
                <label style={styles.label}>
                  {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder={field === 'email' ? 'your@email.com' : field === 'phone' ? '1234567890' : ''}
                />
                {errors[field] && <p style={styles.error}>{errors[field]}</p>}
              </div>
            ))}
            {errors.submit && <p style={styles.error}>{errors.submit}</p>}
            <button type="submit" style={styles.button}>Create Account</button>
          </form>
          <p style={styles.centerText}>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </section>

      ${commonFooter}
    </div>
  );
}

${commonStyles}
  formContainer: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  centerText: { textAlign: 'center', marginTop: '1rem', color: '#666' },
};
`;

// ==================== LOGIN PAGE ====================
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
    } catch {
      setErrors({ submit: 'Error submitting form' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      ${commonHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome Back</h1>
        <p style={styles.heroSubtitle}>Login to your ONCOST account</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="your@email.com"
              />
              {errors.email && <p style={styles.error}>{errors.email}</p>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your password"
              />
              {errors.password && <p style={styles.error}>{errors.password}</p>}
            </div>

            {errors.submit && <p style={styles.error}>{errors.submit}</p>}

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={styles.links}>
            <p><a href="/forgot-password">Forgot password?</a></p>
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          </div>
        </div>
      </section>

      ${commonFooter}
    </div>
  );
}

${commonStyles}
  formContainer: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  links: { textAlign: 'center', marginTop: '1.5rem' },
};
`;

// ==================== FORGOT PASSWORD PAGE ====================
const forgotPasswordPage = `'use client';

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

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMessage('Recovery link sent to your email. Please check your inbox.');
        setEmail('');
      } else {
        setError('Failed to send recovery link. Please try again.');
      }
    } catch {
      setError('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      ${commonHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Reset Your Password</h1>
        <p style={styles.heroSubtitle}>Enter your email to receive recovery link</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.formContainer}>
          {message && <div style={styles.successMsg}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="your@email.com"
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </form>
          <p style={styles.centerText}><a href="/login">Back to login</a></p>
        </div>
      </section>

      ${commonFooter}
    </div>
  );
}

${commonStyles}
  formContainer: { maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
  centerText: { textAlign: 'center', marginTop: '1rem' },
};
`;

// ==================== CONTACT PAGE ====================
const contactPage = `'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    if (Object.keys(newErrors).length === 0) {
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div style={styles.container}>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      ${commonHeader}

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Us</h1>
        <p style={styles.heroSubtitle}>We'd love to hear from you</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.contactWrapper}>
          <div style={styles.contactInfo}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>
            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>📍 Address</p>
              <p>123 Fashion Street, New Delhi, India</p>
            </div>
            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>📞 Phone</p>
              <p>+91-9876543210</p>
            </div>
            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>📧 Email</p>
              <p>info@oncost.com</p>
            </div>
            <div style={styles.infoItem}>
              <p style={styles.infoLabel}>🕐 Hours</p>
              <p>Mon-Sat: 10:00 AM - 6:00 PM<br/>Sun: Closed</p>
            </div>
          </div>

          <form style={styles.contactForm} onSubmit={handleSubmit}>
            {success && <div style={styles.successMsg}>Message sent successfully! We'll get back to you soon.</div>}
            
            {['name', 'email', 'subject'].map((field) => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  style={styles.input}
                />
                {errors[field] && <p style={styles.error}>{errors[field]}</p>}
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.label}>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={styles.textarea}
              />
              {errors.message && <p style={styles.error}>{errors.message}</p>}
            </div>

            <button type="submit" style={styles.button}>Send Message</button>
          </form>
        </div>
      </section>

      ${commonFooter}
    </div>
  );
}

${commonStyles}
  contactWrapper: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '2rem' },
  contactInfo: { padding: '1rem' },
  infoItem: { marginBottom: '2rem' },
  infoLabel: { fontWeight: 'bold', color: '#8b2e3b', marginBottom: '0.5rem' },
  contactForm: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  successMsg: { backgroundColor: '#d4f1d4', color: '#1f6b1f', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' },
  error: { color: '#c41e3a', fontSize: '0.85rem', marginTop: '0.25rem' },
};
`;

// ==================== ACCOUNT PAGE ====================
const accountPage = `'use client';

import React, { useEffect, useState } from 'react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setUser({ name: 'John Doe', email: 'john@example.com', phone: '9876543210', joinDate: '2024-01-15' });
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>ONCOST</div>
          <nav style={styles.nav}>
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/account" style={{ color: '#d4af37', fontWeight: 'bold' }}>Account</a>
          </nav>
        </div>
      </header>

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>My Account</h1>
        <p style={styles.heroSubtitle}>Manage your profile and preferences</p>
      </section>

      <section style={styles.mainContent}>
        <div style={styles.accountCard}>
          <h2 style={styles.sectionTitle}>Welcome, {user?.name}!</h2>
          <div style={styles.profileInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Name:</span>
              <span>{user?.name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Email:</span>
              <span>{user?.email}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Phone:</span>
              <span>{user?.phone}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Member Since:</span>
              <span>{user?.joinDate}</span>
            </div>
          </div>
          <button style={styles.button} onClick={handleLogout}>Logout</button>
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>ONCOST</h4>
            <p>Premium ethnic wear collection</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2024 ONCOST. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

${commonStyles}
  accountCard: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  profileInfo: { marginBottom: '2rem' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' },
  label: { fontWeight: 'bold', color: '#8b2e3b' },
};
`;

// Write all files
writeFile(path.join(baseDir, 'src\\app\\collections\\page.tsx'), collectionsPage);
writeFile(path.join(baseDir, 'src\\app\\signup\\page.tsx'), signupPage);
writeFile(path.join(baseDir, 'src\\app\\login\\page.tsx'), loginPage);
writeFile(path.join(baseDir, 'src\\app\\forgot-password\\page.tsx'), forgotPasswordPage);
writeFile(path.join(baseDir, 'src\\app\\contact\\page.tsx'), contactPage);
writeFile(path.join(baseDir, 'src\\app\\account\\page.tsx'), accountPage);

console.log('\\n✓ Core pages created successfully!');
