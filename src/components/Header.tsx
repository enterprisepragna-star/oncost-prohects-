"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  Heart,
  Sparkles,
  Truck,
  Gift,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/products" },
  { label: "Bulk Orders", href: "/bulk" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      <div className="topbar" aria-label="Store highlights">
        <span>
          <Sparkles aria-hidden="true" size={14} /> Bulk Orders Available
        </span>
        <span>
          <Truck aria-hidden="true" size={14} /> Pan India Delivery
        </span>
        <span>
          <Gift aria-hidden="true" size={14} /> Premium Return Gifts
        </span>
      </div>

      <header className="site-header">
        <Link className="logo" href="/" aria-label="ONCOST home">
          ONCOST
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={
                pathname === link.href
                  ? { color: "var(--burgundy)", borderBottom: "2px solid var(--burgundy)", paddingBottom: "6px" }
                  : {}
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions" aria-label="Store tools">
          <Link className="icon-btn" href="/products" aria-label="Search">
            <Search size={19} />
          </Link>
          <Link className="icon-btn hide-mobile" href="/account" aria-label="Wishlist">
            <Heart size={19} />
          </Link>
          <Link className="icon-btn" href="/cart" aria-label="Cart">
            <ShoppingCart size={19} />
          </Link>
          <Link className="icon-btn" href="/account" aria-label="Account">
            <User size={19} />
          </Link>
        </div>
      </header>
    </>
  );
}
