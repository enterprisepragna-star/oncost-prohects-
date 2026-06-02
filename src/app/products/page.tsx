"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MessageCircle, Gift } from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const ALL = "all";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState(ALL);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchQuery =
        query.trim() === "" ||
        `${p.name} ${p.collection}`.toLowerCase().includes(query.toLowerCase());
      const matchCollection =
        activeCollection === ALL || p.collection === activeCollection;
      return matchQuery && matchCollection;
    });
  }, [query, activeCollection]);

  return (
    <main>
      {/* HERO */}
      <section className="page-hero" aria-labelledby="products-page-title">
        <div>
          <p className="eyebrow">Browse ONCOST</p>
          <h1 id="products-page-title">Gift Collections</h1>
          <p>
            Curated return gifts for every celebration. Create an account to view
            full details and add items to your cart.
          </p>
        </div>
        <Link className="button secondary" href="/signup">
          Create Account
        </Link>
      </section>

      {/* FILTERS */}
      <section className="section" aria-label="Product listing">
        {/* Search + dropdown */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "340px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                pointerEvents: "none",
              }}
            />
            <input
              className="field"
              style={{ paddingLeft: "40px" }}
              placeholder="Search products or collections"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <select
            className="select"
            style={{ minWidth: "200px", flex: "0 0 auto" }}
            value={activeCollection}
            onChange={(e) => setActiveCollection(e.target.value)}
            aria-label="Filter by collection"
          >
            <option value={ALL}>All Collections</option>
            {COLLECTIONS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Collection tabs */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}
          role="tablist"
          aria-label="Quick collection filter"
        >
          {[{ name: "All", slug: ALL }, ...COLLECTIONS.map((c) => ({ name: c.name, slug: c.name }))].map(
            (tab) => (
              <button
                key={tab.slug}
                role="tab"
                aria-selected={activeCollection === tab.slug}
                onClick={() => setActiveCollection(tab.slug)}
                style={{
                  padding: "7px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: "999px",
                  background: activeCollection === tab.slug ? "var(--burgundy)" : "#fff",
                  color: activeCollection === tab.slug ? "#fff" : "var(--ink)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 150ms",
                }}
              >
                {tab.name === "All" ? "All" : tab.name.replace(" Collection", "").replace(" Sets", "")}
              </button>
            )
          )}
        </div>

        <p style={{ color: "var(--muted)", fontSize: "0.88rem", fontWeight: 800, marginBottom: "20px" }}>
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length > 0 ? (
          <div className="product-grid" aria-live="polite">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--muted)",
              border: "1px dashed var(--line)",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎁</div>
            <p>No products match your search. Try a different term or browse all collections.</p>
            <button
              onClick={() => { setQuery(""); setActiveCollection(ALL); }}
              className="button secondary"
              style={{ marginTop: "16px" }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* BULK CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="bulk-panel">
          <div>
            <p className="eyebrow">Event gifting made simple</p>
            <h2>Need 50+ Pieces?</h2>
            <p>
              Custom quantities, packaging, and delivery for birthdays, weddings,
              poojas, and corporate events.
            </p>
            <Link className="button primary" href="/bulk">
              <MessageCircle size={18} /> WhatsApp Us
            </Link>
          </div>
          <div className="packaging-preview" aria-label="Gift packaging preview">
            <Gift size={44} />
            <span>Custom Gift Packaging</span>
          </div>
        </div>
      </section>
    </main>
  );
}
