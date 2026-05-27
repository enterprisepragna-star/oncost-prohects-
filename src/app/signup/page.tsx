'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const [activeForm, setActiveForm] = useState('email');
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Demo signup submitted');
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
            <p className="eyebrow">Create account</p>
            <h2>Start gifting with ONCOST</h2>
            <p>
              Create a demo customer account to unlock products and cart modules.
            </p>
          </div>
          <label>
            Name{' '}
            <input
              className="field"
              required
              name="name"
              placeholder="Your name"
            />
          </label>
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
            Phone{' '}
            <input
              className="field"
              required
              name="phone"
              placeholder="Mobile number"
            />
          </label>
          <label>
            Password{' '}
            <input
              className="field"
              required
              type="password"
              name="password"
              placeholder="Create password"
            />
          </label>
          <button className="button primary" type="submit">
            Create Account
          </button>
          <p>
            Already registered?{' '}
            <Link href="/login">
              <strong>Login</strong>
            </Link>
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => setActiveForm('otp')}
            style={{ marginTop: '10px' }}
          >
            Sign up with OTP instead
          </button>
        </form>
      )}

      {activeForm === 'otp' && (
        <form className="auth-card form-grid" onSubmit={handleSubmit}>
          <Link className="logo" href="/">
            ONCOST
          </Link>
          <div>
            <p className="eyebrow">OTP signup</p>
            <h2>Sign up with Mobile</h2>
            <p>
              Enter your mobile number to receive a demo OTP and quickly create
              an account (no SMS integration).
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
              Verify & Create
            </button>
          </div>
          <p>Or use the form above for name and email signup.</p>
          <button
            type="button"
            className="button secondary"
            onClick={() => setActiveForm('email')}
            style={{ marginTop: '10px' }}
          >
            Back to email signup
          </button>
        </form>
      )}
    </main>
  );
}
