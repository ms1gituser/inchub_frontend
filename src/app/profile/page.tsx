'use client';

import React from 'react';

export default function ProfilePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: '#2C1A0E' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          System Settings • User Identity
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 300, color: '#2C1A0E', letterSpacing: '-0.02em', fontFamily: 'Cormorant, serif' }}>
          Identity & <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Security</span> Credentials
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(44,26,14,0.5)', background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8892A', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#2C1A0E', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase' }}>USER PROFILE</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '380px', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
          Coming Soon
        </p>
      </div>
    </div>
  );
}
