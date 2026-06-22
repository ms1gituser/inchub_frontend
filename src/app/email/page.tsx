'use client';

import React from 'react';
import { usePermission } from '@/context/PermissionContext';

export default function EmailPage() {
  const { currentBrand } = usePermission();
  const isFinancial = currentBrand === 'financial';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: 'var(--color-primary)' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          System Tools • Secure Communication Gateway ({isFinancial ? 'Financial Services' : 'Corporate Services'})
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.02em', fontFamily: 'Cormorant, serif' }}>
          Email <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Smart</span> Dispatcher
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(44,26,14,0.5)', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary)', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>EMAIL DISPATCHER</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '380px', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
          Coming Soon
        </p>
      </div>
    </div>
  );
}
