"use client";

import { useState } from "react";
import Link from "next/link";
import { LEAD_EMAIL } from "@/lib/data";

const faqs = [
  { q: "What is the minimum bulk order quantity?", a: "Our minimum bulk order quantity is 50 pieces. For smaller quantities, browse the standard product listing and add to cart." },
  { q: "Can I get a GST invoice?", a: "Yes. Include your GSTIN in the enquiry form and we'll generate a GST-compliant e-invoice for your order." },
  { q: "Do you offer custom packaging?", a: "Absolutely. We offer branded boxes, pouches, and carry bags. Mention your packaging preference in the enquiry form." },
  { q: "How long does delivery take?", a: "Standard delivery is 5–10 working days after order confirmation. Express delivery is available for urgent events at an additional charge." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Product enquiry", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const summary = [
      "ONCOST Contact Message",
      "",
      `From: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "Not provided"}`,
      `Subject: ${form.subject}`,
      "",
      "Message:",
      form.message,
    ].join("\n");

    try {
      const leads = JSON.parse(localStorage.getItem("oncostLeads") || "[]");
      leads.unshift({ id: Date.now(), createdAt: new Date().toISOString(), productId: "contact", summary });
      localStorage.setItem("oncostLeads", JSON.stringify(leads));
    } catch {}

    setSubmitted(true);
    const subject = encodeURIComponent(`ONCOST Contact: ${form.subject}`);
    window.location.href = `mailto:${LEAD_EMAIL}?subject=${subject}&body=${encodeURIComponent(summary)}`;
  }

  return (
    <main>
      <section className="page-hero" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h1 id="contact-title">Contact ONCOST</h1>
          <p>Questions about products, bulk orders, packaging, or delivery? Send a message or reach us on WhatsApp.</p>
        </div>
        <Link className="button secondary" href="/bulk">Bulk Enquiry</Link>
      </section>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.85fr)", gap: "28px", alignItems: "start" }}>

          <form className="auth-card form-grid" onSubmit={handleSubmit} noValidate>
            {submitted && (
              <div className="notice show">✓ Message ready. Your email app will open to send the message to ONCOST.</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label>
                Your name
                <input className="field" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
              </label>
              <label>
                Email address
                <input className="field" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="customer@example.com" />
              </label>
            </div>
            <label>
              Mobile number
              <input className="field" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" />
            </label>
            <label>
              Subject
              <select className="select" value={form.subject} onChange={(e) => update("subject", e.target.value)}>
                {["Product enquiry","Bulk order","Delivery query","Payment query","Return / exchange","Other"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Your message
              <textarea className="field" rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Write your message or question..." style={{ resize: "vertical" }} />
            </label>
            <button className="button primary" type="submit" style={{ justifyContent: "center" }}>
              Send Message
            </button>
          </form>

          <aside style={{ display: "grid", gap: "16px" }}>
            {/* WhatsApp banner */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "14px", padding: "20px", borderRadius: "12px", background: "linear-gradient(120deg, #25d366, #128c7e)", color: "#fff" }}>
              <div>
                <h3 style={{ color: "#fff", margin: "0 0 4px", fontFamily: "Georgia, serif" }}>💬 Chat on WhatsApp</h3>
                <p style={{ color: "rgba(255,255,255,0.88)", margin: 0, fontSize: "0.88rem" }}>Fastest way to reach us. Replies within minutes.</p>
              </div>
              <a href="https://wa.me/917799791820" target="_blank" rel="noreferrer" style={{ padding: "10px 18px", borderRadius: "999px", background: "#fff", color: "#128c7e", fontWeight: 900, fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                Chat Now
              </a>
            </div>

            <div className="card">
              <h3>📧 Email</h3>
              <a href={`mailto:${LEAD_EMAIL}`} style={{ color: "var(--burgundy)", fontWeight: 800 }}>{LEAD_EMAIL}</a>
              <p style={{ marginTop: "6px" }}>We reply within 24 hours on business days.</p>
            </div>

            <div className="card">
              <h3>📦 Bulk Orders</h3>
              <p>For orders of 50+ pieces, use the dedicated bulk enquiry form for faster processing.</p>
              <Link href="/bulk" style={{ color: "var(--burgundy)", fontWeight: 900, fontSize: "0.9rem" }}>
                Go to Bulk Enquiry →
              </Link>
            </div>

            {/* FAQ */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ marginBottom: "14px" }}>Common Questions</h3>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid var(--line)" : "none", paddingBottom: i < faqs.length - 1 ? "12px" : 0, marginBottom: i < faqs.length - 1 ? "12px" : 0 }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "var(--burgundy)", fontWeight: 800, fontSize: "0.9rem", display: "flex", justifyContent: "space-between", gap: "8px" }}
                  >
                    {faq.q}
                    <span>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && (
                    <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: "0.87rem", lineHeight: 1.6 }}>{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
