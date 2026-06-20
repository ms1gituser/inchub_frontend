'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Milestone 1 Password Recovery page.
 * Styled with Slate & Primary Blue corporate CRM theme.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // Mock latency
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2E1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ padding: '2.5rem 2.25rem' }}>

          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#F6F1E8',
                color: '#B8892A',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2C1A0E', margin: 0, letterSpacing: '-0.025em' }}>
              Reset CRM Password
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.375rem' }}>
              Recover access to your CBUAE-isolated portal.
            </p>
          </div>

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 10,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>📩</span>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#065f46' }}>Email Transmitted</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#047857', lineHeight: 1.5 }}>
                  A secure password reset link has been dispatched to <strong>{email}</strong>.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                style={{
                  width: '100%',
                  height: 40,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              >
                Back to Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@inchcrm.com"
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    padding: '0 0.875rem',
                    fontSize: '0.875rem',
                    color: '#2C1A0E',
                    outline: 'none',
                    background: '#f8fafc',
                    transition: 'all 150ms',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#B8892A';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 40,
                  background: 'linear-gradient(135deg, #2C1A0E 0%, #B8892A 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(44, 26, 14, 0.25)',
                  transition: 'opacity 150ms',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = '1'; }}
              >
                {loading ? 'Transmitting link...' : 'Send reset link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <Link
                  href="/login"
                  style={{ fontSize: '0.8125rem', color: '#B8892A', fontWeight: 600, textDecoration: 'none' }}
                >
                  Back to Sign in
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
