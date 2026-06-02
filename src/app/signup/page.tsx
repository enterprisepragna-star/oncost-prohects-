'use client';

import Link from 'next/link';
import { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, Loader, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed');
        return;
      }

      setSuccess('✓ Account created successfully!');
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
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
        .field-icon { color: #8B2E3B; }
        .field:focus { border-color: #8B2E3B; box-shadow: 0 0 0 3px rgba(139, 46, 59, 0.1); }
        .btn-primary { background: linear-gradient(135deg, #8B2E3B 0%, #A83A4B 100%); }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(139, 46, 59, 0.3); }
      `}</style>

      <div style={{ maxWidth: '420px', width: '100%' }}>
        {/* Header Card */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInUp 0.6s ease-out' }}>
          <Link href="/" style={{ fontSize: '32px', fontWeight: '900', textDecoration: 'none', color: '#8B2E3B', marginBottom: '24px', display: 'inline-block', letterSpacing: '-1px' }}>
            ONCOST
          </Link>
          <p style={{ color: '#A83A4B', fontSize: '12px', letterSpacing: '2px', marginBottom: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Create Account</p>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2C2C2C', margin: '0 0 12px' }}>Start Premium Gifting</h1>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0', maxWidth: '340px' }}>Join us to explore curated collections, manage orders, and unlock exclusive bulk benefits</p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ backgroundColor: 'white', padding: '40px 32px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(139, 46, 59, 0.1)' }}>
          {error && (
            <div style={{ backgroundColor: '#FEE5E5', color: '#C33', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', border: '1px solid #FCC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', border: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', color: '#8B2E3B', opacity: 0.6 }} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1.5px solid #E8E8E8', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }} className="field" />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', color: '#8B2E3B', opacity: 0.6 }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="customer@example.com" required style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1.5px solid #E8E8E8', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }} className="field" />
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Phone Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', color: '#8B2E3B', opacity: 0.6 }} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9999999999" required style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1.5px solid #E8E8E8', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }} className="field" />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#8B2E3B', opacity: 0.6 }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" required style={{ width: '100%', padding: '12px 44px 12px 44px', border: '1.5px solid #E8E8E8', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }} className="field" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#8B2E3B', opacity: 0.6 }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Confirm Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', color: '#8B2E3B', opacity: 0.6 }} />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required style={{ width: '100%', padding: '12px 44px 12px 44px', border: '1.5px solid #E8E8E8', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box' }} className="field" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#8B2E3B', opacity: 0.6 }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 16px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s', opacity: loading ? 0.8 : 1 }} className="btn-primary">
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Divider */}
          <div style={{ margin: '28px 0', position: 'relative' }}>
            <div style={{ height: '1px', background: '#E8E8E8' }}></div>
            <span style={{ position: 'absolute', left: '50%', top: '-10px', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '0 12px', color: '#999', fontSize: '12px', fontWeight: '600' }}>OR</span>
          </div>

          {/* Login Link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', margin: '0' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#8B2E3B', fontWeight: '700', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}