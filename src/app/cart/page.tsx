"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/lib/data";

interface CartItem { id: string; qty: number; }

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("oncostUser");
    if (!user) { router.push("/login?redirect=/cart"); return; }

    // Handle ?add= param from product page
    const params = new URLSearchParams(window.location.search);
    const addId = params.get("add");
    if (addId) {
      const existing: CartItem[] = JSON.parse(localStorage.getItem("oncostCart") || "[]");
      const idx = existing.findIndex((i) => i.id === addId);
      if (idx >= 0) existing[idx].qty += 1;
      else existing.push({ id: addId, qty: 1 });
      localStorage.setItem("oncostCart", JSON.stringify(existing));
      // Remove query param without reload
      window.history.replaceState({}, "", "/cart");
    }

    setCart(JSON.parse(localStorage.getItem("oncostCart") || "[]"));
  }, [router]);

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0);
      localStorage.setItem("oncostCart", JSON.stringify(next));
      return next;
    });
  }

  function removeItem(id: string) {
    setCart((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("oncostCart", JSON.stringify(next));
      return next;
    });
  }

  function clearCart() {
    if (confirm("Remove all items from your cart?")) {
      localStorage.removeItem("oncostCart");
      setCart([]);
    }
  }

  if (!mounted) return null;

  const total = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  return (
    <main>
      <section className="page-hero" aria-labelledby="cart-title">
        <div>
          <p className="eyebrow">Customer cart</p>
          <h1 id="cart-title">Your Cart</h1>
          <p>Review selected gifts and submit an enquiry for bulk pricing and delivery confirmation.</p>
        </div>
        <Link className="button secondary" href="/products">Continue Shopping</Link>
      </section>

      <section className="section">
        {cart.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "52px 20px" }}>
            <ShoppingBag size={48} style={{ color: "var(--line)", marginBottom: "16px" }} />
            <h3 style={{ marginBottom: "8px" }}>Your cart is empty</h3>
            <p>Browse products and add gifts for your event.</p>
            <Link className="button primary" href="/products" style={{ marginTop: "16px", justifyContent: "center", display: "inline-flex" }}>
              Shop Products
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, color: "var(--burgundy)", fontFamily: "Georgia, serif", fontSize: "1.4rem" }}>
                🛒 Cart Items
              </h2>
              <button
                onClick={clearCart}
                style={{ padding: "8px 16px", border: "1px solid var(--line)", borderRadius: "999px", background: "#fff", color: "var(--muted)", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
              >
                Clear Cart
              </button>
            </div>

            {cart.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.id);
              if (!product) return null;
              return (
                <div key={item.id} className="cart-row">
                  <div>
                    <strong style={{ color: "var(--ink)", fontSize: "1rem" }}>{product.name}</strong>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>{product.collection}</p>
                    <p style={{ margin: "2px 0 0", color: "var(--burgundy)", fontWeight: 900, fontSize: "0.9rem" }}>
                      Rs. {product.price} per piece
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: "1.1rem" }}>−</button>
                    <span style={{ fontWeight: 900, minWidth: "24px", textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: "1.1rem" }}>+</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <strong style={{ color: "var(--burgundy)", fontSize: "1rem" }}>Rs. {product.price * item.qty}</strong>
                    <button onClick={() => removeItem(item.id)} aria-label={`Remove ${product.name}`} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="cart-summary">
              <h3>Estimated total: Rs. {total}</h3>
              <p>Final bulk pricing and shipping confirmed by the ONCOST team.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link className="button primary" href="/enquiry" style={{ justifyContent: "center" }}>
                  Send Enquiry
                </Link>
                <Link className="button pay" href="/payment" style={{ justifyContent: "center" }}>
                  Pay Now
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Trust badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "24px" }}>
          {["Pan India delivery", "Custom packaging", "Bulk pricing on enquiry", "WhatsApp support"].map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 13px",
                borderRadius: "999px",
                background: "#fff8ed",
                border: "1px solid var(--line)",
                color: "var(--muted)",
                fontSize: "0.82rem",
                fontWeight: 800,
              }}
            >
              ✓ {t}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
