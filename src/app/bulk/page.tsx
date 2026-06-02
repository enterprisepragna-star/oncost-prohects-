import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Orders",
  description: "Order 50+ customised return gifts for birthdays, weddings, poojas, and corporate events at ONCOST.",
};

const features = [
  { icon: "🎁", title: "Custom Packaging", body: "Choose from standard or branded packaging — boxes, pouches, and carry bags for every event style." },
  { icon: "📦", title: "Volume Discounts", body: "The more you order, the better the price. Tiered pricing from 50 pieces — ask for a custom quote." },
  { icon: "🚚", title: "Pan India Delivery", body: "We deliver to all major cities and towns. Express delivery available for urgent events." },
  { icon: "📋", title: "GST Invoice", body: "Get a GST-compliant invoice for corporate orders and tax-deductible gifting budgets." },
  { icon: "✏️", title: "Personalisation", body: "Add names, event dates, or custom messages to select products." },
  { icon: "💬", title: "Dedicated Support", body: "WhatsApp support for every bulk order — from product selection to delivery confirmation." },
];

const events = [
  { icon: "🎂", title: "Birthdays", body: "Return gifts, favor boxes, and themed party packs" },
  { icon: "💍", title: "Weddings", body: "Thambulam sets, Haldi Kumkum, and premium keepsakes" },
  { icon: "🪔", title: "Poojas", body: "Brass diyas, German silver, and festive pooja gifting" },
  { icon: "🎓", title: "School Events", body: "Affordable favors for prize distributions and competitions" },
  { icon: "🏢", title: "Corporate", body: "Branded gifting with GST invoice for bulk employee gifting" },
  { icon: "🎉", title: "Festivals", body: "Diwali, Navratri, and seasonal festive gifting collections" },
];

const steps = [
  { num: "1", title: "Browse & Select", body: "Pick products from our collections that fit your event theme." },
  { num: "2", title: "Submit Enquiry", body: "Fill in quantity, event date, and packaging preferences." },
  { num: "3", title: "Get Quote", body: "ONCOST team sends a personalised price quote within 24 hours." },
  { num: "4", title: "Confirm & Pay", body: "Confirm the order and pay securely. Delivery tracked to your door." },
];

export default function BulkPage() {
  return (
    <main>
      <section className="page-hero" aria-labelledby="bulk-page-title">
        <div>
          <p className="eyebrow">Event gifting</p>
          <h1 id="bulk-page-title">Bulk Orders</h1>
          <p>
            Customise gifts, packaging, and quantities for birthdays, weddings, poojas,
            school events, and corporate celebrations — starting from 50 pieces.
          </p>
        </div>
        <Link className="button secondary" href="/products">Browse Gift Options</Link>
      </section>

      {/* Features */}
      <section className="section" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="eyebrow">Why choose ONCOST bulk</p>
          <h2 id="features-title">Everything Included</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((f) => (
            <div key={f.title} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{f.icon}</div>
              <h3 style={{ marginBottom: "8px" }}>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="events-title">
        <div className="section-heading">
          <p className="eyebrow">Perfect for every occasion</p>
          <h2 id="events-title">We Cover All Events</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
          {events.map((ev) => (
            <div
              key={ev.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "18px",
                borderRadius: "12px",
                border: "1px solid var(--line)",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(76,24,37,0.05)",
              }}
            >
              <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{ev.icon}</span>
              <div>
                <h3 style={{ margin: "0 0 4px", color: "var(--burgundy)", fontFamily: "Georgia, serif", fontSize: "0.95rem" }}>{ev.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.82rem" }}>{ev.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="process-title">
        <div className="section-heading">
          <p className="eyebrow">Simple ordering process</p>
          <h2 id="process-title">How to Place a Bulk Order</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                textAlign: "center",
                padding: "20px 14px",
                borderRadius: "12px",
                background: "#fff8ed",
                border: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--burgundy)",
                  color: "#fff",
                  fontWeight: 900,
                  marginBottom: "10px",
                }}
              >
                {s.num}
              </div>
              <h3 style={{ margin: "0 0 6px", color: "var(--burgundy)", fontFamily: "Georgia, serif", fontSize: "0.95rem" }}>{s.title}</h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.82rem" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "20px",
            padding: "28px 32px",
            borderRadius: "12px",
            background: "var(--burgundy)",
            color: "#fff",
          }}
        >
          <div>
            <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: "1.4rem", fontFamily: "Georgia, serif" }}>
              Ready to Place Your Bulk Order?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.82)", margin: 0, fontSize: "0.92rem" }}>
              Submit a detailed enquiry or reach us instantly on WhatsApp.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="button secondary" href="/enquiry">Submit Enquiry</Link>
            <a
              className="button"
              href="https://wa.me/917799791820"
              target="_blank"
              rel="noreferrer"
              style={{ background: "#fff", color: "var(--burgundy)" }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
