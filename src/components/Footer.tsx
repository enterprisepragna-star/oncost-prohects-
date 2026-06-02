import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="site-footer">
        <h2>ONCOST</h2>
        <p>Premium gifting collections for every occasion</p>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link href="/products">Shop</Link>
          <Link href="/bulk">Bulk Orders</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/account">Account</Link>
        </nav>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/">
          <span>🏠</span>
          <span>Home</span>
        </Link>
        <Link href="/products">
          <span>🛍</span>
          <span>Shop</span>
        </Link>
        <Link href="/products">
          <span>⊞</span>
          <span>Categories</span>
        </Link>
        <Link href="/cart">
          <span>🛒</span>
          <span>Cart</span>
        </Link>
        <Link href="/account">
          <span>👤</span>
          <span>Account</span>
        </Link>
      </nav>
    </>
  );
}
