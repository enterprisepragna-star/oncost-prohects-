"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export default function LoginPage() {
  const [tab, setTab] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    const user = { name: email.split("@")[0] || "Customer", email, phone: "" };
    localStorage.setItem("oncostUser", JSON.stringify(user));
    window.location.href = "/account";
  }

  function handleSendOtp(e: React.MouseEvent) {
    e.preventDefault();
    if (!phone) { setError("Enter your mobile number first."); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`oncostOtp:${phone}`, JSON.stringify({ code, expires: Date.now() + 5 * 60 * 1000 }));
    alert(`Demo OTP for ${phone}: ${code}`);
    setOtpSent(true);
    setError("");
  }

  function handleOtpLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const raw = sessionStorage.getItem(`oncostOtp:${phone}`);
    if (!raw) { setError("No OTP found. Request a new one."); return; }
    try {
      const data = JSON.parse(raw);
      if (data.code !== otp || data.expires < Date.now()) { setError("Invalid or expired OTP."); return; }
      const user = { name: `user_${phone.slice(-4)}`, email: `phone+${phone}@oncost.local`, phone };
      localStorage.setItem("oncostUser", JSON.stringify(user));
      window.location.href = "/account";
    } catch { setError("Something went wrong. Try again."); }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card form-grid">
        <Link className="logo" href="/" aria-label="ONCOST home">ONCOST</Link>

        <div>
          <p className="eyebrow">Customer login</p>
          <h2 style={{ margin: "0 0 6px", color: "var(--burgundy)", fontFamily: "Georgia, serif" }}>
            Welcome back
          </h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
            Login to view products, manage your cart, and submit enquiries.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "8px", overflow: "hidden" }}>
          {(["email", "otp"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1,
                padding: "11px",
                border: "none",
                background: tab === t ? "var(--burgundy)" : "#fff",
                color: tab === t ? "#fff" : "var(--muted)",
                fontSize: "0.88rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {t === "email" ? "Email Login" : "Mobile OTP"}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ margin: 0, color: "#c41e3a", fontSize: "0.88rem", fontWeight: 800 }}>{error}</p>
        )}

        {tab === "email" ? (
          <form className="form-grid" onSubmit={handleEmailLogin} noValidate>
            <label>
              Email address
              <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" autoComplete="email" />
            </label>
            <label>
              Password
              <input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
            </label>
            <button className="button primary" type="submit" style={{ justifyContent: "center" }}>
              Login to ONCOST
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleOtpLogin} noValidate>
            <label>
              Mobile number
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }}>
                <input className="field" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" autoComplete="tel" />
                <button className="button secondary" onClick={handleSendOtp} style={{ minWidth: "100px", borderRadius: "8px" }} type="button">
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </label>
            <label>
              Enter OTP
              <input className="field" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" inputMode="numeric" maxLength={6} />
            </label>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.82rem" }}>
              Demo mode — OTP appears as an alert. No SMS is sent.
            </p>
            <button className="button primary" type="submit" style={{ justifyContent: "center" }}>
              Verify &amp; Login
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.9rem", margin: 0, paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
          New customer?{" "}
          <Link href="/signup" style={{ color: "var(--burgundy)", fontWeight: 900 }}>
            Create a free account
          </Link>
        </p>
      </div>
    </main>
  );
}
