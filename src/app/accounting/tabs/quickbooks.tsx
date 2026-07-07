'use client';

import React, { useState } from 'react';

interface SyncLogItem {
  company: string;
  id: string;
  type: string;
  time: string;
  duration: string;
  status: 'Success' | 'Partial' | 'Failed';
  records: string;
}

const INITIAL_LOGS: SyncLogItem[] = [
  { company: 'ABC Trading LLC', id: '1234567890', type: 'Full Sync', time: '07 May 2026, 09:42 AM', duration: '02m 34s', status: 'Success', records: '12,548' },
  { company: 'XYZ Holdings Limited', id: '1234567890', type: 'Invoice Sync', time: '07 May 2026, 09:15 AM', duration: '01m 12s', status: 'Success', records: '2,145' },
  { company: 'Delta Properties FZCO', id: '1234567890', type: 'Bank Sync', time: '07 May 2026, 08:32 AM', duration: '03m 46s', status: 'Partial', records: '8,756' },
  { company: 'Alpha Tech FZCO', id: '1234567890', type: 'Bill Sync', time: '07 May 2026, 07:50 AM', duration: '01m 05s', status: 'Success', records: '1,245' },
  { company: 'Beta Industries LLC', id: '1234567890', type: 'Full Sync', time: '07 May 2026, 07:10 AM', duration: '04m 22s', status: 'Failed', records: '0' }
];

export default function QuickBooksTab() {
  const [logs, setLogs] = useState<SyncLogItem[]>(INITIAL_LOGS);
  
  // Modal open states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  // Connect company form states
  const [connectForm, setConnectForm] = useState({
    company: 'ABC Trading LLC',
    environment: 'Production',
    apiVersion: 'v3'
  });
  const [modalCompanyOpen, setModalCompanyOpen] = useState(false);
  const [modalEnvOpen, setModalEnvOpen] = useState(false);

  return (
    <div style={{
      color: '#2A1628',
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      background: 'transparent',
    }}>
      
      {/* ── HEADER SECTION ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '1rem',
        borderBottom: '1px solid #DDD0C4',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              Accounting &gt; QuickBooks
            </p>
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 300,
            color: '#2A1628',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-serif), Georgia, serif'
          }}>
            QuickBooks <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Integration</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Manage your QuickBooks connection, sync data and monitor integration health.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#2A1628',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            QB Settings
          </button>
          
          <button
            onClick={() => setSyncOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#2A1628',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Sync Now
          </button>

          <button
            onClick={() => setConnectOpen(true)}
            style={{
              background: '#2A1628',
              color: '#ffffff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(42,22,40,0.15)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Connect Company
          </button>
        </div>
      </div>

      {/* ── METRICS GRID (5 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Connected Companies', value: '5', sub: 'Active Integrations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Last Sync', value: '7 mins ago', sub: 'All Companies', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Successful Syncs', value: '1,248', sub: 'This Month  ↑ 18%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Failed Syncs', value: '12', sub: 'This Month  ↑ 3%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>, bg: '#FEF2F2', border: '#FECACA' },
          { label: 'Data Synced', value: '98,542', sub: 'Transactions  ↑ 12%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: '1px solid rgba(42,22,40,0.06)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
            minHeight: '105px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2, flex: 1, marginRight: '0.5rem' }}>{card.label}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: card.bg,
                border: `1px solid ${card.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8760A',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2A1628', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── INTEGRATION STATUS & OVERVIEW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
        
        {/* Connection status */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)', display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', borderRight: '1px solid rgba(42,22,40,0.06)', paddingRight: '1.5rem' }}>
            <div style={{ background: '#2A1628', border: '1px solid rgba(42,22,40,0.1)', padding: '1rem', borderRadius: '12px', textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#E8760A', fontFamily: 'var(--font-serif), Georgia, serif', letterSpacing: '-0.02em' }}>QuickBooks</span>
            </div>
            <div style={{ margin: '1rem 0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(4, 120, 87, 0.08)', color: '#047857' }}>Connected</span>
              <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.5rem', fontWeight: 500 }}>Since 15 Jan 2026</div>
            </div>
            <button style={{ background: 'transparent', border: '1px solid #C4695A', color: '#C4695A', padding: '0.5rem 1.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: 'inherit', transition: 'all 150ms ease' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,105,90,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>Disconnect</button>
          </div>
          <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}>
            {[
              { label: 'Account', value: 'inc.hub.qbo@intuit.com' },
              { label: 'Realm ID', value: '1234567890' },
              { label: 'Environment', value: 'Production' },
              { label: 'Web Connector', value: 'Active' },
              { label: 'API Version', value: 'v3' },
              { label: 'Last Sync', value: '07 May 2026, 09:42' }
            ].map((info, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(42,22,40,0.03)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'rgba(42,22,40,0.5)', fontWeight: 500 }}>{info.label}</span>
                <span style={{ fontWeight: 600, color: '#2A1628' }}>{info.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Overview Donut Chart */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Sync Overview <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'rgba(42,22,40,0.4)' }}>(This Month)</span></h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '120px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeDasharray="100" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.2" strokeDasharray="89 11" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E0A370" strokeWidth="3" strokeDasharray="2 98" strokeDashoffset="-89" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A1628" strokeWidth="3.4" strokeDasharray="9 91" strokeDashoffset="-91" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2A1628', lineHeight: 1 }}>1,260</div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Syncs</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, marginLeft: '1.5rem', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}><span style={{ color: '#E8760A', marginRight: '0.25rem' }}>●</span>Successful</span><strong style={{ color: '#2A1628' }}>1,248</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}><span style={{ color: '#C4695A', marginRight: '0.25rem' }}>●</span>Failed</span><strong style={{ color: '#2A1628' }}>12</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}><span style={{ color: '#E0A370', marginRight: '0.25rem' }}>●</span>Partial</span><strong style={{ color: '#2A1628' }}>25</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}><span style={{ color: '#2A1628', marginRight: '0.25rem' }}>●</span>Skipped</span><strong style={{ color: '#2A1628' }}>35</strong></div>
            </div>
          </div>
        </div>

        {/* Data Sync Summary Mini Cards */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Data Sync Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            {[
              { name: 'Invoices', count: '18,542', pct: '↑ 15%', color: '#047857' },
              { name: 'Bills', count: '7,682', pct: '↑ 10%', color: '#047857' },
              { name: 'Payments', count: '12,856', pct: '↑ 18%', color: '#047857' },
              { name: 'Bank Tx', count: '59,462', pct: '↑ 12%', color: '#047857' }
            ].map((sync, idx) => (
              <div key={idx} style={{ background: '#FAF8F5', border: '1px solid #DDD0C4', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <div style={{ color: 'rgba(42,22,40,0.5)', fontSize: '0.65rem', fontWeight: 600 }}>{sync.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2A1628' }}>{sync.count}</span>
                  <span style={{ color: sync.color, fontSize: '0.65rem', fontWeight: 700 }}>{sync.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── SPLIT LAYOUT (LEFT CONTENT, RIGHT SIDEBAR) ── */}
      {/* ── ROW 1: ACTIVITY & CONNECTED COMPANIES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.25rem' }}>
        
        {/* Recent Sync Activity Table */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Recent Sync Activity</h3>
            <button style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>View All Logs</button>
          </div>
          
          <div className="client-table-scroll" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.4)', fontWeight: 600 }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>COMPANY</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>SYNC TYPE</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>STARTED AT</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>DURATION</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>RECORDS</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((sync, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#2A1628' }}>{sync.company}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)' }}>Company ID: {sync.id}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}>{sync.type}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}>{sync.time}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}>{sync.duration}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        background: sync.status === 'Success' ? 'rgba(4, 120, 87, 0.08)' : sync.status === 'Partial' ? 'rgba(184, 137, 42, 0.08)' : 'rgba(196, 105, 90, 0.08)',
                        color: sync.status === 'Success' ? '#047857' : sync.status === 'Partial' ? '#B8892A' : '#C4695A'
                      }}>{sync.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#2A1628' }}>{sync.records}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', opacity: 0.6, display: 'inline-flex', padding: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Connected Companies list */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Connected Companies</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
            {[
              { name: 'ABC Trading LLC', id: '1234567890' },
              { name: 'XYZ Holdings Limited', id: '1234567890' },
              { name: 'Delta Properties FZCO', id: '1234567890' },
              { name: 'Alpha Tech FZCO', id: '1234567890' },
              { name: 'Beta Industries LLC', id: '1234567890' }
            ].map((comp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.4rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#2A1628' }}>{comp.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem' }}>Company ID: {comp.id}</div>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'rgba(4, 120, 87, 0.08)', color: '#047857' }}>Connected</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ROW 2: SYNC ERRORS & QUICK ACTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.25rem' }}>
        
        {/* Recent Sync Errors */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Recent Sync Errors <span style={{ background: 'rgba(196, 105, 90, 0.08)', color: '#C4695A', fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '9999px', marginLeft: '0.5rem', fontWeight: 700 }}>3</span></h3>
            <button style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>View All Errors</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
            {[
              { company: 'Beta Industries LLC', msg: 'Authentication failed. Please reconnect your account.', time: '07 May 2026, 07:10 AM' },
              { company: 'Delta Properties FZCO', msg: 'Some transactions were skipped due to duplicate reference.', time: '07 May 2026, 08:32 AM' },
              { company: 'Alpha Tech FZCO', msg: 'Tax rate mapping missing for 5 transactions.', time: '06 May 2026, 11:20 AM' }
            ].map((err, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4695A" strokeWidth="2.5" style={{ marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2A1628' }}>{err.company}</div>
                    <div style={{ color: 'rgba(42,22,40,0.6)', marginTop: '0.125rem' }}>{err.msg}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(42,22,40,0.4)', fontSize: '0.7rem' }}>{err.time}</span>
                  <a href="#" style={{ color: '#E8760A', fontWeight: 700, textDecoration: 'none' }}>View</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(42,22,40,0.06)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          boxShadow: '0 4px 12px rgba(42,22,40,0.02)',
          minHeight: '190px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem', flex: 1, justifyContent: 'space-between' }}>
            {[
              { title: 'Sync All Companies', desc: 'Start full sync for connected accounts.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg> },
              { title: 'Update Data Mapping', desc: 'Review and update field mappings.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
              { title: 'Download Web Connector', desc: 'Configure QuickBooks connector.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> }
            ].map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: idx < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#FAF2EC',
                  border: '1px solid #F3DEC9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E8760A',
                  flexShrink: 0
                }}>{act.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#2A1628' }}>{act.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.1rem' }}>{act.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 1. QUICKBOOKS SETTINGS MODAL ── */}
      {settingsOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '440px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Integration Settings</h3>
              </div>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Auto-sync bank transactions daily</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Import historical logs on connection</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Send error notifications via email</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setSettingsOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { alert('Settings saved successfully!'); setSettingsOpen(false); }} style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. SYNC NOW MODAL ── */}
      {syncOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '440px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Sync QuickBooks Data</h3>
              </div>
              <button onClick={() => setSyncOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Triggers a direct API fetch cycle to download all fresh journals, invoices, and ledgers.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setSyncOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
              <button onClick={() => { alert('Sync cycle queued successfully!'); setSyncOpen(false); }} style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}>Trigger Sync</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. CONNECT COMPANY MODAL ── */}
      {connectOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '460px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Connect New QBO Entity</h3>
              </div>
              <button onClick={() => setConnectOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Authorize a new entity by linking its Intuit Sandbox or Production Realm ID.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Company Selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Select Company</label>
                <button
                  onClick={() => setModalCompanyOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {connectForm.company}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalCompanyOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px',
                    maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {['ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC'].map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          setConnectForm({ ...connectForm, company: c });
                          setModalCompanyOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: connectForm.company === c ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: connectForm.company === c ? 600 : 400
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Environment Selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Environment</label>
                <button
                  onClick={() => setModalEnvOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {connectForm.environment}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalEnvOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Production', 'Sandbox'].map(env => (
                      <div
                        key={env}
                        onClick={() => {
                          setConnectForm({ ...connectForm, environment: env });
                          setModalEnvOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: connectForm.environment === env ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: connectForm.environment === env ? 600 : 400
                        }}
                      >
                        {env}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Version Display */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>QBO API Version</label>
                <input
                  type="text"
                  readOnly
                  value={connectForm.apiVersion}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: 'rgba(42,22,40,0.55)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setConnectOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button
                onClick={() => {
                  const newLogItem: SyncLogItem = {
                    company: connectForm.company,
                    id: '1234567890',
                    type: 'Initial Sync',
                    time: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                    duration: '01m 20s',
                    status: 'Success',
                    records: '4,560'
                  };
                  setLogs([newLogItem, ...logs]);
                  setConnectOpen(false);
                }}
                style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}
              >
                Initiate Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
