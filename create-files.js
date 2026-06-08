const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\hp\\Documents\\ONCOST WEBSITE';

// Create directory recursively
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Write file
function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  createDir(dir);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filePath}`);
}

// Shop Page
const shopPage = `'use client';

import React, { useState } from 'react';

const ShopPage = () => {
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

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    alert(\`\${product.name} added to cart!\`);
  };

  return (
    <div style={styles.container}>
      <style>{\`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f7f4; color: #333; }
        a { color: #8b2e3b; text-decoration: none; }
        a:hover { text-decoration: underline; }
      \`}</style>

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>ONCOST</div>
          <nav style={styles.nav}>
            <a href="/">Home</a>
            <a href="/shop" style={{ color: '#d4af37', fontWeight: 'bold' }}>Shop</a>
            <a href="/collections">Collections</a>
            <a href="/contact">Contact</a>
            <a href="/account">Account</a>
          </nav>
          <div style={styles.cartIcon}>🛒 ({cart.length})</div>
        </div>
      </header>

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Premium Collection</h1>
        <p style={styles.heroSubtitle}>Discover exquisite traditional and modern wear</p>
      </section>

      <section style={styles.filtersSection}>
        <h2 style={styles.sectionTitle}>Shop by Category</h2>
        <div style={styles.filters}>
          {[
            { id: 'all', label: 'All Products' },
            { id: 'sarees', label: 'Sarees' },
            { id: 'lehengas', label: 'Lehengas' },
            { id: 'kurtas', label: 'Kurtas' },
            { id: 'suits', label: 'Salwar Suits' },
            { id: 'bridal', label: 'Bridal' },
            { id: 'casual', label: 'Casual' },
          ].map((category) => (
            <button
              key={category.id}
              style={{
                ...styles.filterButton,
                ...(selectedCategory === category.id ? styles.filterButtonActive : {}),
              }}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.productsSection}>
        <div style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <div style={styles.productImage}>{product.image}</div>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productPrice}>₹{product.price.toLocaleString()}</p>
              <button style={styles.addButton} onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

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
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
            </ul>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Follow Us</h4>
            <p>📱 Facebook | Instagram | Twitter</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2024 ONCOST. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f7f4' },
  header: { backgroundColor: '#8b2e3b', color: '#f9f7f4', padding: '1rem 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', color: '#d4af37' },
  nav: { display: 'flex', gap: '2rem', flex: 1, justifyContent: 'center' },
  cartIcon: { fontSize: '1.2rem', cursor: 'pointer' },
  hero: { backgroundColor: '#d4af37', color: '#8b2e3b', padding: '3rem 1rem', textAlign: 'center' },
  heroTitle: { fontSize: '2.5rem', marginBottom: '0.5rem' },
  heroSubtitle: { fontSize: '1.1rem' },
  filtersSection: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', width: '100%' },
  sectionTitle: { color: '#8b2e3b', marginBottom: '1.5rem', fontSize: '1.8rem' },
  filters: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' },
  filterButton: { padding: '0.75rem 1.5rem', border: '2px solid #d4af37', backgroundColor: '#f9f7f4', color: '#8b2e3b', borderRadius: '25px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.3s ease' },
  filterButtonActive: { backgroundColor: '#d4af37', color: '#8b2e3b' },
  productsSection: { maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 2rem', width: '100%' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' },
  productCard: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease' },
  productImage: { fontSize: '3rem', marginBottom: '1rem' },
  productName: { color: '#8b2e3b', marginBottom: '0.5rem' },
  productPrice: { fontSize: '1.3rem', color: '#d4af37', fontWeight: 'bold', marginBottom: '1rem' },
  addButton: { backgroundColor: '#8b2e3b', color: '#f9f7f4', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'background-color 0.3s ease' },
  footer: { backgroundColor: '#8b2e3b', color: '#f9f7f4', marginTop: 'auto', padding: '3rem 1rem 1rem' },
  footerContent: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  footerSection: { textAlign: 'center' },
  footerTitle: { color: '#d4af37', marginBottom: '0.5rem' },
  footerLinks: { listStyle: 'none' },
  footerBottom: { textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(212, 175, 55, 0.3)' },
};

export default ShopPage;
`;

writeFile(path.join(baseDir, 'src\\app\\shop\\page.tsx'), shopPage);

console.log('Setup complete!');
