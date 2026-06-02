import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 200px)",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        background: "linear-gradient(135deg, rgba(122,31,53,0.06), rgba(212,175,55,0.14)), var(--cream)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "480px" }}>
        <div
          style={{
            fontSize: "clamp(5rem, 18vw, 9rem)",
            fontWeight: 900,
            fontFamily: "Georgia, serif",
            color: "var(--burgundy)",
            lineHeight: 1,
            margin: "0 0 8px",
            opacity: 0.16,
          }}
          aria-hidden="true"
        >
          404
        </div>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
            fontFamily: "Georgia, serif",
            color: "var(--burgundy)",
            margin: "0 0 12px",
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: "24px" }}>
          The page you were looking for doesn&apos;t exist or may have been moved.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          <Link className="button primary" href="/">Back to Home</Link>
          <Link className="button secondary" href="/products">Browse Products</Link>
        </div>
      </div>
    </main>
  );
}
