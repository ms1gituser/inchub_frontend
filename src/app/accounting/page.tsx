'use client';

import React from 'react';

export default function AccountingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: '#2A1628' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          UAE Compliance Workspace • Financial Services
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'Cormorant, serif' }}>
          Accounting Operations & <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>AI Bookkeeping</span>
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(42,22,40,0.5)', background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F6F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8760A', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A1628', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Accounting & Bookkeeping Workspace
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '380px', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
          Coming Soon
        </p>
      </div>
    </div>
  );
}
