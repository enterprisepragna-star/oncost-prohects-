import Link from "next/link";
import type { Product } from "@/lib/data";

interface Props {
  product: Product;
  protected?: boolean;
}

export default function ProductCard({ product, protected: isProtected = true }: Props) {
  const href = `/products/${product.id}`;

  return (
    <article className="product-card">
      <Link href={href} aria-label={`View ${product.name}`}>
        <div className="product-image">
          <span>{product.badge}</span>
        </div>
        <div className="product-copy">
          <h3>{product.name}</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "4px" }}>
            {product.collection}
          </p>
          <p className="price">From Rs. {product.price}</p>
        </div>
      </Link>
    </article>
  );
}
