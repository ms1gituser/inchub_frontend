'use client';

import { useEffect } from 'react';

/**
 * Root Layout global error handler.
 * Next.js calls this when the main shell layout itself fails.
 */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Critical global CRM layout error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 460 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              margin: '0 0 0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            System Recovery Mode
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#64748b',
              lineHeight: 1.6,
              margin: '0 0 2rem',
            }}
          >
            A critical error occurred while initializing the layout chrome. We are ready to help you recover your active CRM session.
          </p>

          <button
            onClick={reset}
            style={{
              height: 42,
              padding: '0 1.5rem',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
              transition: 'opacity 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Re-initialize CRM Console
          </button>
        </div>
      </body>
    </html>
  );
}
