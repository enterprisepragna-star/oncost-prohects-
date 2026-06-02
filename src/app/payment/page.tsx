"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/lib/data";

export default function PaymentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("oncostUser");
    if (!user) { router.push("/login?redirect=/payment"); return; }
    const params = new URLSearchParams(window.location.search);
    setProductId(params.get("id"));
    const cart: { id: string; qty: number }[] = JSON.parse(localStorage.getItem("oncostCart") || "[]");
    const total = cart.reduce((sum, item) => {
      const p = PRODUCTS.find((pr) => pr.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
    setCartTotal(total);
  }, [router]);

  if (!mounted) return null;

  const product = productId ? PRODUCTS.find((p) => p.id === productId) : null;
  const amount = product ? product.price : cartTotal;
  const label = product ? product.name : "Cart payment";

  return (
    <main>
      <section className="page-hero" aria-labelledby="payment-title">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 id="payment-title">Complete Payment</h1>
          <p>Review your order and proceed to payment. For bulk orders, request an invoice via enquiry first.</p>
        </div>
        <Link className="button secondary" href="/enquiry">Request Invoice</Link>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(260px,0.72fr)", gap: "28px", alignItems: "start" }}>

          <article className="detail-card">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "999px", background: "#edfbf2", color: "#1e6a3a", fontSize: "0.8rem", fontWeight: 900, marginBottom: "16px" }}>
              🔒 Secure Checkout
            </span>
            <p className="eyebrow">Payment gateway</p>
            <h1 style={{ color: "var(--burgundy)", fontFamily: "Georgia, serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", margin: "6px 0 12px" }}>
              Pay Now
            </h1>
            <p><strong style={{ color: "var(--ink)" }}>{label}</strong></p>
            <p className="price" style={{ fontSize: "1.4rem", marginBottom: "16px" }}>
              Estimated amount: Rs. {amount || 0}
            </p>

            <ul className="meta-list">
              <li>✓ Use this page for invoice payment or your preferred payment gateway checkout.</li>
              <li>✓ For production, the server will create an invoice/payment link and redirect securely.</li>
              <li>✓ This demo can request the invoice by email until payment credentials are connected.</li>
            </ul>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <a className="button pay" href={`https://oncost.shop/payment${productId ? `?id=${productId}` : ""}`} style={{ justifyContent: "center" }}>
                💳 Continue to Payment
              </a>
              <Link className="button secondary" href={`/enquiry${productId ? `?id=${productId}` : ""}`} style={{ justifyContent: "center" }}>
                📧 Request Invoice Instead
              </Link>
            </div>

            <div style={{ marginTop: "20px" }}>
              {[
                { icon: "📝", title: "Need a GST Invoice?", body: "Include your GSTIN in the bulk enquiry form for a compliant e-invoice." },
                { icon: "💬", title: "Payment confirmation", body: "After payment, share your receipt on WhatsApp for order processing." },
              ].map((row) => (
                <div key={row.title} style={{ display: "flex", gap: "12px", padding: "12px 14px", borderRadius: "8px", background: "#fff8ed", border: "1px solid var(--line)", marginBottom: "10px" }}>
                  <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{row.icon}</span>
                  <div>
                    <strong style={{ color: "var(--ink)", fontSize: "0.9rem" }}>{row.title}</strong>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.87rem" }}>{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside style={{ display: "grid", gap: "16px", position: "sticky", top: "94px" }}>
            <div className="card">
              <h3>Order Summary</h3>
              <p style={{ color: "var(--ink)", fontWeight: 800 }}>{label}</p>
              <p className="price" style={{ fontSize: "1.1rem" }}>Rs. {amount || 0}</p>
            </div>
            <div className="card">
              <h3>🚚 Delivery Info</h3>
              <p>✓ Pan India delivery available</p>
              <p>✓ 5–10 working days (standard)</p>
              <p>✓ Express delivery on request</p>
            </div>
            <div className="card">
              <h3>Need Help?</h3>
              <p>Our team is available on WhatsApp for payment support and order queries.</p>
              <a className="button primary" href="https://wa.me/917799791820" target="_blank" rel="noreferrer" style={{ justifyContent: "center", display: "flex", marginTop: "10px" }}>
                💬 WhatsApp Support
              </a>
            </div>
            <div className="card">
              <h3>GST E-Invoice Portal</h3>
              <p>Check if your GSTIN is enabled for e-invoicing before placing a bulk order.</p>
              <a className="button secondary" href="https://einvoice1.gst.gov.in/Others/EinvEnabled" target="_blank" rel="noreferrer" style={{ justifyContent: "center", display: "flex", marginTop: "10px" }}>
                Open GST Portal
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
