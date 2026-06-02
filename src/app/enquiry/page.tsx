"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS, LEAD_EMAIL } from "@/lib/data";

export default function EnquiryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", gstin: "",
    eventType: "Birthday", quantity: "", eventDate: "", budget: "", message: "",
  });

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("oncostUser");
    if (!user) { router.push("/login?redirect=/enquiry"); return; }
    const u = JSON.parse(user);
    setForm((f) => ({ ...f, name: u.name || "", email: u.email || "", phone: u.phone || "" }));
    const params = new URLSearchParams(window.location.search);
    setProductId(params.get("id"));
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("oncostUser") || "{}");
    const product = productId ? PRODUCTS.find((p) => p.id === productId) : null;
    const summary = [
      "ONCOST Customer Lead",
      "",
      `Source: Website enquiry form`,
      `Customer Name: ${form.name}`,
      `Customer Email: ${form.email}`,
      `Customer Phone: ${form.phone || "Not provided"}`,
      `Customer GSTIN: ${form.gstin || "Not provided"}`,
      "",
      product ? `Selected Product: ${product.name}` : "Selected Product: General bulk enquiry",
      product ? `Collection: ${product.collection}` : "",
      product ? `Starting Price: Rs. ${product.price}` : "",
      "",
      `Event Type: ${form.eventType}`,
      `Quantity: ${form.quantity || "Not provided"}`,
      `Event Date: ${form.eventDate || "Not provided"}`,
      `Budget: ${form.budget || "Not provided"}`,
      "",
      `Message: ${form.message || "Not provided"}`,
    ].filter(Boolean).join("\n");

    const lead = { id: Date.now(), createdAt: new Date().toISOString(), productId: product?.id || "general", summary };
    const leads = JSON.parse(localStorage.getItem("oncostLeads") || "[]");
    leads.unshift(lead);
    localStorage.setItem("oncostLeads", JSON.stringify(leads));
    setSubmitted(true);

    const subject = product ? `ONCOST Lead - ${product.name}` : "ONCOST Lead - Bulk Enquiry";
    window.location.href = `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  if (!mounted) return null;

  const product = productId ? PRODUCTS.find((p) => p.id === productId) : null;

  return (
    <main>
      <section className="page-hero" aria-labelledby="enquiry-title">
        <div>
          <p className="eyebrow">Customer lead</p>
          <h1 id="enquiry-title">{product ? `Enquire for ${product.name}` : "Bulk Enquiry"}</h1>
          <p>Share your event type, quantity, and packaging needs. The ONCOST team will follow up with a personalised quote.</p>
        </div>
        <Link className="button secondary" href="/products">Browse Products</Link>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(260px,0.9fr)", gap: "28px", alignItems: "start" }}>

          <form className="form-grid" onSubmit={handleSubmit} noValidate>
            {submitted && (
              <div className="notice show">
                ✓ Enquiry saved. Your email app will open to send the lead to {LEAD_EMAIL}.
              </div>
            )}

            <div className="summary-strip">
              {product
                ? `${product.name} | ${product.collection} | From Rs. ${product.price}`
                : "General bulk or cart enquiry"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label>
                Your name
                <input className="field" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
              </label>
              <label>
                Email address
                <input className="field" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="customer@example.com" />
              </label>
              <label>
                Mobile number
                <input className="field" type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" />
              </label>
              <label>
                GSTIN (optional)
                <input className="field" value={form.gstin} onChange={(e) => update("gstin", e.target.value)} placeholder="For GST invoice" />
              </label>
              <label>
                Event type
                <select className="select" value={form.eventType} onChange={(e) => update("eventType", e.target.value)}>
                  {["Birthday","Pooja","Wedding","Naming Ceremony","Corporate","School Event","Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Quantity needed
                <input className="field" type="number" min="1" required value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="e.g. 100" />
              </label>
              <label>
                Event date
                <input className="field" type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
              </label>
              <label>
                Budget per piece
                <input className="field" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="e.g. Rs. 150 per piece" />
              </label>
            </div>

            <label>
              Additional message
              <textarea
                className="field"
                rows={4}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Packaging preferences, delivery city, or special requirements"
                style={{ resize: "vertical" }}
              />
            </label>

            <button className="button primary" type="submit" style={{ justifyContent: "center" }}>
              💬 Submit Enquiry
            </button>
            <a
              className="button secondary"
              href="https://einvoice1.gst.gov.in/Others/EinvEnabled"
              target="_blank"
              rel="noreferrer"
              style={{ justifyContent: "center" }}
            >
              Check GSTIN E-Invoice Status
            </a>
          </form>

          {/* Sidebar */}
          <aside style={{ display: "grid", gap: "16px", position: "sticky", top: "94px" }}>
            <div className="card">
              <h3>How it works</h3>
              {[
                "Fill in your event details and quantity.",
                "Submit — your email app opens with the lead pre-filled.",
                "ONCOST team replies with a custom quote within 24 hours.",
                "Confirm and place your bulk order.",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", color: "var(--muted)", fontSize: "0.88rem" }}>
                  <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "var(--burgundy)", color: "#fff", fontSize: "0.75rem", fontWeight: 900 }}>
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
            <div className="card">
              <h3>💬 WhatsApp Instead?</h3>
              <p>Prefer a quick chat? Message us directly for faster support.</p>
              <a className="button primary" href="https://wa.me/917799791820" target="_blank" rel="noreferrer" style={{ justifyContent: "center", display: "flex", marginTop: "10px" }}>
                Open WhatsApp
              </a>
            </div>
            <div className="card">
              <h3>🎁 Bulk Order Benefits</h3>
              {["Volume discounts from 50+ pieces", "Custom packaging and branding", "GST invoice available", "Pan India delivery"].map((b) => (
                <p key={b} style={{ margin: "4px 0" }}>✓ {b}</p>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
