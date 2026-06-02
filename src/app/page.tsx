import Link from "next/link";
import type { Metadata } from "next";
import {
  PackageCheck,
  ChevronRight,
  MessageCircle,
  Gift,
} from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "ONCOST | Premium Return Gifts",
  description:
    "Curated return gifts for birthdays, poojas, weddings, and celebrations. Bulk orders from 50 pieces with Pan India delivery.",
};

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 4);

  return (
    <main>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Premium celebration gifting</p>
          <h1 id="hero-title">Curated Return Gifts &amp; Premium Collections</h1>
          <p>
            Thoughtfully designed gifts for birthdays, poojas, weddings, and
            family celebrations — with bulk-friendly choices for every guest list.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/products">
              Shop Now <ChevronRight aria-hidden="true" size={18} />
            </Link>
            <Link className="button secondary" href="/bulk">
              Bulk Enquiry
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-label="Premium gift preview">
          <div className="gift-stack gift-stack-one" />
          <div className="gift-stack gift-stack-two" />
          <div className="gift-stack gift-stack-three" />
          <div className="hero-badge">
            <PackageCheck aria-hidden="true" size={18} />
            Ready for bulk orders
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="section" aria-labelledby="collections-title">
        <div className="section-heading">
          <p className="eyebrow">Browse occasions</p>
          <h2 id="collections-title">Shop By Collection</h2>
        </div>
        <div className="collection-grid">
          {COLLECTIONS.map((collection) => (
            <Link
              href={`/products?collection=${encodeURIComponent(collection.slug)}`}
              className="collection-card"
              key={collection.name}
            >
              <span className={`collection-art ${collection.tone}`} />
              <strong>{collection.name}</strong>
              <span>{collection.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section loved" aria-labelledby="products-title">
        <div className="section-heading">
          <p className="eyebrow">Customer favorites</p>
          <h2 id="products-title">Most Loved Products</h2>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link className="button primary" href="/products">
            View All Products <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* BULK CTA */}
      <section className="section" aria-labelledby="bulk-title">
        <div className="bulk-panel">
          <div>
            <p className="eyebrow">Event gifting made simple</p>
            <h2 id="bulk-title">Need 50+ Pieces?</h2>
            <p>
              Customize gifts, packaging, and quantities for birthdays, weddings,
              poojas, school events, and corporate celebrations.
            </p>
            <Link className="button primary" href="/bulk">
              <MessageCircle aria-hidden="true" size={18} /> WhatsApp Us
            </Link>
          </div>
          <div className="packaging-preview" aria-label="Gift packaging preview">
            <Gift aria-hidden="true" size={44} />
            <span>Custom Gift Packaging</span>
          </div>
        </div>
      </section>
    </main>
  );
}
