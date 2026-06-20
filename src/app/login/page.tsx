'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { persistTokens, resolveToken, post } from '@/lib/apiClient';

/**
 * Milestone 1 Login Screen.
 * Styled with Slate & Primary Blue corporate CRM palette.
 * Authenticates user mock-tokens and redirects to the CRM Dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, skip login
  useEffect(() => {
    const token = resolveToken();
    if (token) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await post<{ success: boolean; token: string }>('/auth/login', {
        email: email.trim(),
        password: password,
      });

      if (response.success && response.token) {
        persistTokens(response.token);
        router.replace('/');
      } else {
        setErrorMsg('Invalid response from authentication server.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F6F1E8',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(184, 137, 42, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(44, 26, 14, 0.03) 0%, transparent 50%)',
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
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          boxShadow: '0 24px 48px -12px rgba(44, 26, 14, 0.08), 0 8px 16px -8px rgba(44, 26, 14, 0.04)',
          overflow: 'hidden',
          border: '1px solid rgba(221, 212, 190, 0.6)',
        }}
      >
        <div style={{ padding: '3rem 2.5rem' }}>
          
          {/* Brand header */}
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <img
              src="/logo_page_3.svg"
              alt="IncHub Logo"
              style={{
                width: 56,
                height: 56,
                objectFit: 'contain',
                marginBottom: '1.25rem',
                filter: 'drop-shadow(0 4px 8px rgba(184, 137, 42, 0.15))',
              }}
            />
            <h1
              style={{
                fontSize: '1.625rem',
                fontWeight: 600,
                color: '#2C1A0E',
                margin: 0,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-serif), Georgia, serif',
              }}
            >
              IncHub CRM Console
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#57534e', marginTop: '0.5rem', fontWeight: 500 }}>
              Sign in to access your business workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#44403c', marginBottom: '0.5rem' }}
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
                  border: '1px solid #d6d3d1',
                  padding: '0 0.875rem',
                  fontSize: '0.875rem',
                  color: '#2C1A0E',
                  outline: 'none',
                  background: '#fafaf9',
                  transition: 'all 150ms',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#B8892A';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 137, 42, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d6d3d1';
                  e.currentTarget.style.background = '#fafaf9';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
 
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#44403c' }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.8125rem', color: '#B8892A', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid #d6d3d1',
                  padding: '0 0.875rem',
                  fontSize: '0.875rem',
                  color: '#2C1A0E',
                  outline: 'none',
                  background: '#fafaf9',
                  transition: 'all 150ms',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#B8892A';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 137, 42, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d6d3d1';
                  e.currentTarget.style.background = '#fafaf9';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
 
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 40,
                background: 'linear-gradient(135deg, #B8892A 0%, #2C1A0E 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(184, 137, 42, 0.2)',
                transition: 'all 150ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.opacity = '1';
              }}
            >
              {loading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite' }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="30 30" />
                  </svg>
                  <span>Securing compliance session...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

        </div>
      </div>
      
      {/* Dynamic spinner keyframes styling */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      `}</style>
    </div>
  );
}
