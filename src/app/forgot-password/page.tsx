'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mail, ArrowRight, Loader, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Request failed');
        return;
      }

      setSuccess(data.message);
      setEmail('');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f9f7f4 0%, #f0e8e0 100%)', padding: '20px' }}>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .card { animation: fadeInUp 0.6s ease-out; }
        .field:focus { border-color: #8B2E3B; box-shadow: 0 0 0 3px rgba(139, 46, 59, 0.1); }
        .btn-primary { background: linear-gradient(135deg, #8B2E3B 0%, #A83A4B 100%); }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(139, 46, 59, 0.3); }
      `}</style>

      <div style={{ maxWidth: '420px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.6s ease-out' }}>
          <Link href="/" style={{ fontSize: '32px', fontWeight: '900', textDecoration: 'none', color: '#8B2E3B', marginBottom: '24px', display: 'inline-block', letterSpacing: '-1px' }}>
            ONCOST
          </Link>
          <p style={{ color: '#A83A4B', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Reset Password</p>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2C2C2C', margin: '0 0 12px' }}>Forgot Password?</h1>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>Enter your email and we'll send you a link to reset your password</p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ backgroundColor: 'white', padding: '40px 32px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(139, 46, 59, 0.1)' }}>
          {error && (
            <div style={{ backgroundColor: '#FEE5E5', color: '#C33', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', border: '1px solid #FCC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', border: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#8B2E3B', opacity: 0.6 }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" required style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1.5px solid #E8E8E8', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }} className="field" />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 16px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s', opacity: loading ? 0.8 : 1 }} className="btn-primary">
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Sending...' : 'Send Reset Link'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Back to Login */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link href="/login" style={{ color: '#8B2E3B', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}