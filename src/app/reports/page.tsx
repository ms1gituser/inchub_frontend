'use client';

export default function ReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>System Tools</p>
        <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#2C1A0E', letterSpacing: '-0.02em' }}>
          Reports Console
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(44,26,14,0.4)', background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8892A', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2C1A0E', margin: 0 }}>Reports Mockup Workspace</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '360px', lineHeight: 1.5 }}>
          This interface is scheduled for subsequent system iterations. SPA client-side routing is active (no full-page browser reloads).
        </p>
      </div>
    </div>
  );
}
