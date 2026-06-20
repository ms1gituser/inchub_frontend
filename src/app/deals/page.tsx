'use client';

export default function DealsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>Customer Relationship Management</p>
        <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#2C1A0E', letterSpacing: '-0.02em' }}>
          Deals Board
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(44,26,14,0.4)', background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B8892A', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2C1A0E', margin: 0 }}>Deals Mockup Workspace</h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '360px', lineHeight: 1.5 }}>
          This interface is scheduled for subsequent system iterations. SPA client-side routing is active (no full-page browser reloads).
        </p>
      </div>
    </div>
  );
}
