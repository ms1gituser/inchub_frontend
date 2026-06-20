'use client';

import { useEffect } from 'react';

/**
 * Global router Error boundary.
 * Catches runtime errors in dashboard pages and displays clean recovery actions.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, sync the stack trace to an APM monitoring service (e.g. Sentry)
    console.error('CRM Error boundary caught an exception:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.02em',
        }}
      >
        Application Error Occurred
      </h1>
      <p
        style={{
          fontSize: '0.875rem',
          color: '#64748b',
          maxWidth: 400,
          lineHeight: 1.5,
          margin: '0 0 1.5rem 0',
        }}
      >
        {error.message || 'We encountered a problem loading this section of the CRM. Please try again.'}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={reset}
          style={{
            height: 38,
            padding: '0 1rem',
            background: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          style={{
            height: 38,
            padding: '0 1rem',
            background: '#ffffff',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
