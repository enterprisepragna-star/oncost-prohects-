"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Package, MessageSquare, HelpCircle, LogOut } from "lucide-react";
import { PRODUCTS } from "@/lib/data";

interface StoredUser {
  name: string;
  email: string;
  phone?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("oncostUser");
    if (!stored) { router.push("/login?redirect=/account"); return; }
    setUser(JSON.parse(stored));
    const cart: { id: string; qty: number }[] = JSON.parse(localStorage.getItem("oncostCart") || "[]");
    setCartCount(cart.reduce((s, i) => s + i.qty, 0));
    const leads: unknown[] = JSON.parse(localStorage.getItem("oncostLeads") || "[]");
    setLeadCount(leads.length);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("oncostUser");
    router.push("/");
  }

  if (!mounted) return null;
  if (!user) return null;

  const avatar = (user.name || "U").charAt(0).toUpperCase();

  const cards = [
    {
      icon: <ShoppingBag size={22} />,
      title: "Orders",
      body: "No placed orders yet. Cart and enquiries are saved locally for this demo.",
      action: null,
    },
    {
      icon: <Package size={22} />,
      title: "Cart",
      body: cartCount
        ? `${cartCount} item${cartCount !== 1 ? "s" : ""} in your cart. Review and send a bulk enquiry.`
        : "Your cart is empty. Browse products and add gifts for your event.",
      action: { label: "View Cart", href: "/cart" },
    },
    {
      icon: <MessageSquare size={22} />,
      title: "Enquiries",
      body: `${leadCount} enquiry lead${leadCount !== 1 ? "s" : ""} saved in this browser.`,
      action: { label: "New Enquiry", href: "/enquiry" },
    },
    {
      icon: <HelpCircle size={22} />,
      title: "Support",
      body: "Use bulk enquiry for event quantities, packaging, and delivery discussion.",
      action: { label: "WhatsApp Us", href: "https://wa.me/917799791820" },
    },
  ];

  return (
    <main>
      {/* Page hero */}
      <section className="page-hero" aria-labelledby="account-title">
        <div>
          <p className="eyebrow">Customer area</p>
          <h1 id="account-title">My Account</h1>
          <p>Manage your profile, orders, event enquiries, and gifting preferences.</p>
        </div>
        <Link className="button secondary" href="/products">Browse Gifts</Link>
      </section>

      <section className="section">
        {/* Profile strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            padding: "22px 24px",
            borderRadius: "12px",
            background: "linear-gradient(120deg, var(--burgundy), #a33050)",
            color: "#fff",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              fontSize: "1.6rem",
              fontWeight: 900,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#fff", margin: "0 0 3px", fontSize: "1.2rem" }}>{user.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.82)", margin: "0 0 6px", fontSize: "0.9rem" }}>{user.email}</p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.18)",
                fontSize: "0.75rem",
                fontWeight: 900,
                color: "#fff",
              }}
            >
              ✓ Verified Customer
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-label="Logout"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Info cards */}
        <div className="module-grid">
          {cards.map((card) => (
            <div className="card" key={card.title}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "rgba(122,31,53,0.1)",
                  color: "var(--burgundy)",
                  marginBottom: "12px",
                }}
              >
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              {card.action && (
                <Link
                  href={card.action.href}
                  target={card.action.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.action.href.startsWith("http") ? "noreferrer" : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginTop: "12px",
                    padding: "8px 16px",
                    borderRadius: "999px",
                    background: "var(--burgundy)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 900,
                  }}
                >
                  {card.action.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bulk + WhatsApp CTAs */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card">
            <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>📦</div>
            <h3>Bulk Orders</h3>
            <p>Need 50+ pieces for a birthday, pooja, wedding, or corporate event? Send a bulk enquiry for a personalised quote.</p>
            <Link
              href="/bulk"
              style={{ display: "inline-flex", marginTop: "12px", padding: "9px 18px", borderRadius: "999px", background: "var(--gold)", color: "#27190b", fontSize: "0.85rem", fontWeight: 900 }}
            >
              Send Bulk Enquiry
            </Link>
          </div>
          <div className="card">
            <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>💬</div>
            <h3>WhatsApp Us</h3>
            <p>Quick questions about a product or event? Reach ONCOST directly on WhatsApp for fast responses.</p>
            <a
              href="https://wa.me/917799791820"
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", marginTop: "12px", padding: "9px 18px", borderRadius: "999px", background: "var(--burgundy)", color: "#fff", fontSize: "0.85rem", fontWeight: 900 }}
            >
              Open WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
