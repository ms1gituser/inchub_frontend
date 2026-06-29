'use client';

import React from 'react';
import { usePermission } from '@/context/PermissionContext';

export default function TasksPage() {
  const { currentBrand } = usePermission();
  const isFinancial = currentBrand === 'financial';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: 'var(--color-primary)' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          Customer Relationship Management • {isFinancial ? 'Financial Services' : 'Corporate Services'}
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>
          Cognitive <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Priority</span> Queue
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(44,26,14,0.5)', background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary)', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>TASKS QUEUE</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '380px', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
          Coming Soon
        </p>
      </div>
    </div>
  );
}
