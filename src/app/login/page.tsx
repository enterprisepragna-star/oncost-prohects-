'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [activeForm, setActiveForm] = useState('email');
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Demo login submitted');
  };

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setOtp('1234');
    alert('Demo OTP generated: 1234');
  };

  return (
    <main className="auth-shell">
      {activeForm === 'email' && (
        <form className="auth-card form-grid" onSubmit={handleSubmit}>
          <Link className="logo" href="/">
            ONCOST
          </Link>
          <div>
            <p className="eyebrow">Customer login</p>
            <h2>Welcome back</h2>
            <p>
              Login to view product details, cart, account, and enquiry modules.
            </p>
          </div>
          <label>
            Email{' '}
            <input
              className="field"
              required
              type="email"
              name="email"
              placeholder="customer@example.com"
            />
          </label>
          <label>
            Password{' '}
            <input
              className="field"
              required
              type="password"
              name="password"
              placeholder="Enter password"
            />
          </label>
          <button className="button primary" type="submit">
            Login
          </button>
          <p>
            New customer?{' '}
            <Link href="/signup">
              <strong>Create an account</strong>
            </Link>
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => setActiveForm('otp')}
            style={{ marginTop: '10px' }}
          >
            Login with OTP instead
          </button>
        </form>
      )}

      {activeForm === 'otp' && (
        <form className="auth-card form-grid" onSubmit={handleSubmit}>
          <Link className="logo" href="/">
            ONCOST
          </Link>
          <div>
            <p className="eyebrow">OTP login</p>
            <h2>Login with Mobile</h2>
            <p>
              Enter your mobile number and request a demo OTP (no SMS
              integration).
            </p>
          </div>
          <label>
            Mobile{' '}
            <input
              className="field"
              required
              name="phone"
              placeholder="Mobile number"
            />
          </label>
          <label>
            OTP{' '}
            <input
              className="field"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="button primary"
              type="button"
              onClick={handleRequestOTP}
            >
              Request OTP
            </button>
            <button className="button secondary" type="submit">
              Verify & Login
            </button>
          </div>
          <p>Prefer email? Use the form above.</p>
          <button
            type="button"
            className="button secondary"
            onClick={() => setActiveForm('email')}
            style={{ marginTop: '10px' }}
          >
            Back to email login
          </button>
        </form>
      )}
    </main>
  );
}
