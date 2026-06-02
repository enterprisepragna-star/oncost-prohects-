"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [tab, setTab] = useState<"email" | "otp">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone) { setError("Please fill in all required fields."); return; }
    const user = { name, email, phone };
    localStorage.setItem("oncostUser", JSON.stringify(user));
    window.location.href = "/products";
  }

  function handleSendOtp(e: React.MouseEvent) {
    e.preventDefault();
    if (!otpPhone) { setError("Enter your mobile number first."); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`oncostOtp:${otpPhone}`, JSON.stringify({ code, expires: Date.now() + 5 * 60 * 1000 }));
    alert(`Demo OTP for ${otpPhone}: ${code}`);
    setOtpSent(true);
    setError("");
  }

  function handleOtpSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const raw = sessionStorage.getItem(`oncostOtp:${otpPhone}`);
    if (!raw) { setError("No OTP found. Request a new one."); return; }
    try {
      const data = JSON.parse(raw);
      if (data.code !== otp || data.expires < Date.now()) { setError("Invalid or expired OTP."); return; }
      const user = { name: `user_${otpPhone.slice(-4)}`, email: `phone+${otpPhone}@oncost.local`, phone: otpPhone };
      localStorage.setItem("oncostUser", JSON.stringify(user));
      window.location.href = "/products";
    } catch { setError("Something went wrong. Try again."); }
  }

  const perks = [
    "Browse all 6 curated collections",
    "Add to cart and request bulk pricing",
    "Submit event enquiries directly",
  ];

  return (
    <main className="auth-shell">
      <div className="auth-card form-grid">
        <Link className="logo" href="/" aria-label="ONCOST home">ONCOST</Link>

        <div>
          <p className="eyebrow">Create account</p>
          <h2 style={{ margin: "0 0 8px", color: "var(--burgundy)", fontFamily: "Georgia, serif" }}>
            Start gifting with ONCOST
          </h2>
          <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: "0.92rem" }}>
            Join to unlock product details, cart, and bulk event enquiries.
          </p>
          <div style={{ display: "grid", gap: "6px" }}>
            {perks.map((p) => (
              <div key={p} style={{ display: "flex", gap: "8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--burgundy)", fontWeight: 900 }}>✓</span>
                {p}
              </div>
            ))}
          </div>
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
              {t === "email" ? "Email Signup" : "Mobile OTP"}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ margin: 0, color: "#c41e3a", fontSize: "0.88rem", fontWeight: 800 }}>{error}</p>
        )}

        {tab === "email" ? (
          <form className="form-grid" onSubmit={handleEmailSignup} noValidate>
            <label>
              Full name
              <input className="field" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" />
            </label>
            <label>
              Email address
              <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" autoComplete="email" />
            </label>
            <label>
              Mobile number
              <input className="field" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" autoComplete="tel" />
            </label>
            <label>
              Password
              <input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" autoComplete="new-password" />
            </label>
            <button className="button primary" type="submit" style={{ justifyContent: "center" }}>
              Create My Account
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleOtpSignup} noValidate>
            <label>
              Mobile number
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }}>
                <input className="field" type="tel" required value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)} placeholder="+91 9876543210" autoComplete="tel" />
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
              Verify &amp; Create Account
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.9rem", margin: 0, paddingTop: "14px", borderTop: "1px solid var(--line)" }}>
          Already registered?{" "}
          <Link href="/login" style={{ color: "var(--burgundy)", fontWeight: 900 }}>
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}
