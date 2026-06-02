import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ShoppingCart, MessageCircle, CreditCard } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();

  const related = PRODUCTS.filter((p) => p.id !== id).slice(0, 4);

  return (
    <main>
      <section className="section" aria-labelledby="product-title">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--muted)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          <Link href="/" style={{ color: "var(--burgundy)" }}>Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" style={{ color: "var(--burgundy)" }}>Shop</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="detail-layout">
          {/* Product visual */}
          <div className="detail-visual" aria-label={`${product.name} preview`} />

          {/* Product info */}
          <article className="detail-card">
            <p className="eyebrow">{product.collection}</p>
            <h1 id="product-title">{product.name}</h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: "16px" }}>
              {product.description}
            </p>
            <p className="price" style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
              From Rs. {product.price} per piece
            </p>

            <ul className="meta-list">
              <li>✓ Bulk quantity customization available</li>
              <li>✓ Packaging options discussed on enquiry</li>
              <li>✓ Pan India delivery support</li>
              <li>✓ GST invoice available on request</li>
            </ul>

            <div className="action-stack">
              <Link className="button primary" href={`/cart?add=${product.id}`}>
                <ShoppingCart size={18} /> Add to Cart
              </Link>
              <Link className="button secondary" href={`/enquiry?id=${product.id}`}>
                <MessageCircle size={18} /> Enquire Now
              </Link>
              <Link className="button pay" href={`/payment?id=${product.id}`}>
                <CreditCard size={18} /> Pay Now
              </Link>
            </div>

            {/* Trust row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid var(--line)",
              }}
            >
              {["Pan India delivery", "Bulk ready", "GST invoice", "WhatsApp support"].map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "#fff8ed",
                    border: "1px solid var(--line)",
                    color: "var(--muted)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Related products */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="related-title">
        <h2
          id="related-title"
          style={{
            color: "var(--burgundy)",
            fontFamily: "Georgia, serif",
            fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
            marginBottom: "20px",
          }}
        >
          You Might Also Like
        </h2>
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
