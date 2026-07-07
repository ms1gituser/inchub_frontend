'use client';

import React from 'react';

export default function DashboardTab() {
  const [monthsDropdownOpen, setMonthsDropdownOpen] = React.useState(false);
  const [selectedMonths, setSelectedMonths] = React.useState('Last 5 Months');

  return (
    <div style={{
      color: '#2A1628',
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
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
              Accounting Operations
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
            Accounting <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Dashboard</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Firm-wide overview of clients, compliance, workflow and performance.
          </p>
        </div>
      </div>

      {/* ── METRICS GRID (7 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
        {[
          {
            label: 'Total Clients',
            value: '248',
            change: '+12 this week',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            label: 'Books Pending',
            value: '18',
            change: '+4 urgent',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )
          },
          {
            label: 'VAT Returns Due',
            value: '9',
            change: '+3 this week',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )
          },
          {
            label: 'CT Filings Due',
            value: '4',
            change: '+1 this week',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            )
          },
          {
            label: 'KYC Expiring',
            value: '11',
            change: 'within 30 days',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )
          },
          {
            label: 'Suspense Items',
            value: '36',
            change: '+8 new',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )
          },
          {
            label: 'QBO Sync Errors',
            value: '5',
            change: 'requires attention',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            )
          },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
            minHeight: '105px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: card.change.includes('urgent') || card.change.includes('attention') ? '#EF4444' : 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.25rem' }}>
        
        {/* Books Completion Status */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Books Completion Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '150px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Circular SVG Ring */}
              <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C4695A" strokeWidth="3" strokeDasharray="100 0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#5A2D5A" strokeWidth="3.2" strokeDasharray="93 7" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B8892A" strokeWidth="3.4" strokeDasharray="80 20" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.6" strokeDasharray="48 52" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1, fontFamily: 'var(--font-serif), Georgia, serif' }}>248</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Completed', val: '120', pct: '48%', color: '#E8760A' },
                { name: 'In Progress', val: '78', pct: '31%', color: '#B8892A' },
                { name: 'Pending', val: '32', pct: '13%', color: '#5A2D5A' },
                { name: 'Overdue', val: '18', pct: '7%', color: '#C4695A' }
              ].map((leg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: leg.color }} />
                    <span style={{ color: 'rgba(42,22,40,0.7)' }}>{leg.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2A1628' }}>{leg.val} <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>({leg.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.75rem', marginTop: '1rem', textAlign: 'left' }}>
            <a href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E8760A', textDecoration: 'none' }}>View Books Completion →</a>
          </div>
        </div>

        {/* Monthly Books Status Trend */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: 0 }}>Monthly Books Status Trend</h3>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setMonthsDropdownOpen(!monthsDropdownOpen)}
                style={{ 
                  fontSize: '0.75rem', 
                  border: '1px solid #DDD0C4', 
                  borderRadius: '6px', 
                  padding: '0.25rem 0.625rem', 
                  background: '#fff', 
                  color: '#2A1628', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  userSelect: 'none',
                  fontWeight: 500
                }}
              >
                {selectedMonths}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: monthsDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {monthsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  border: '1px solid #DDD0C4',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(42,22,40,0.08)',
                  zIndex: 20,
                  minWidth: '120px',
                  padding: '4px'
                }}>
                  {['Last 3 Months', 'Last 5 Months', 'Last 12 Months'].map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setSelectedMonths(option);
                        setMonthsDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.375rem 0.5rem',
                        fontSize: '0.75rem',
                        color: '#2A1628',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        background: selectedMonths === option ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                        fontWeight: selectedMonths === option ? 600 : 400,
                        transition: 'all 100ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(232, 118, 10, 0.06)';
                        e.currentTarget.style.color = '#E8760A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedMonths === option ? 'rgba(232, 118, 10, 0.06)' : 'transparent';
                        e.currentTarget.style.color = '#2A1628';
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '175px', justifyContent: 'space-between', position: 'relative' }}>
            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A' }} /> Completed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B8892A' }} /> In Progress</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C4695A' }} /> Overdue</span>
            </div>
            
            {/* Vector Line Graph Art */}
            <div style={{ position: 'relative', flex: 1, width: '100%', borderBottom: '1px solid rgba(42,22,40,0.08)' }}>
              {/* Lines */}
              <svg width="100%" height="100px" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Completed Line (orange) */}
                <path d="M10,60 Q50,40 100,50 T200,30 T290,10" fill="none" stroke="#E8760A" strokeWidth="2.5" />
                {/* In Progress Line (gold) */}
                <path d="M10,80 Q50,75 100,82 T200,68 T290,55" fill="none" stroke="#B8892A" strokeWidth="2.5" />
                {/* Overdue Line (terracotta) */}
                <path d="M10,95 Q50,90 100,92 T200,88 T290,85" fill="none" stroke="#C4695A" strokeWidth="2.5" />
              </svg>
              
              {/* Tooltip Overlay */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: '60%',
                background: '#ffffff',
                border: '1px solid rgba(42,22,40,0.12)',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.625rem',
                boxShadow: '0 4px 12px rgba(42,22,40,0.08)',
                zIndex: 10
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Apr 2026</div>
                <div style={{ color: '#E8760A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Completed</span> <strong>132</strong></div>
                <div style={{ color: '#B8892A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>In Progress</span> <strong>68</strong></div>
                <div style={{ color: '#C4695A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Overdue</span> <strong>16</strong></div>
              </div>
            </div>
            
            {/* X Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.25rem' }}>
              <span>Jan 2026</span>
              <span>Feb 2026</span>
              <span>Mar 2026</span>
              <span>Apr 2026</span>
              <span>May 2026</span>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Compliance Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '150px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C4695A" strokeWidth="3" strokeDasharray="100 0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B8892A" strokeWidth="3.2" strokeDasharray="88 12" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.5" strokeDasharray="63 37" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1, fontFamily: 'var(--font-serif), Georgia, serif' }}>248</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Compliant', val: '156', pct: '63%', color: '#E8760A' },
                { name: 'At Risk', val: '62', pct: '25%', color: '#B8892A' },
                { name: 'Non Compliant', val: '30', pct: '12%', color: '#C4695A' }
              ].map((leg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: leg.color }} />
                    <span style={{ color: 'rgba(42,22,40,0.7)' }}>{leg.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2A1628' }}>{leg.val} <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>({leg.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.75rem', marginTop: '1rem', textAlign: 'left' }}>
            <a href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E8760A', textDecoration: 'none' }}>View Compliance Center →</a>
          </div>
        </div>

      </div>

      {/* ── LISTS & QUICK ACTIONS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1.1fr 1fr', gap: '1.25rem' }}>
        
        {/* VAT Returns Due */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>VAT Returns Due</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { client: 'ABC Trading LLC', details: 'VAT Return - Q1 2026', badge: '2 Days Overdue', isOverdue: true },
              { client: 'XYZ Holdings', details: 'VAT Return - Apr 2026', badge: '3 Days Left', isOverdue: false },
              { client: 'Alpha Tech FZCO', details: 'VAT Return - Apr 2026', badge: '5 Days Left', isOverdue: false },
              { client: 'Beta Industries', details: 'VAT Return - Apr 2026', badge: '7 Days Left', isOverdue: false },
              { client: 'Gamma Solutions', details: 'VAT Return - Mar 2026', badge: '10 Days Left', isOverdue: false }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628' }}>{item.client}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)' }}>{item.details}</div>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: item.isOverdue ? '#FEE2E2' : '#FFF3E0',
                  color: item.isOverdue ? '#EF4444' : '#E8760A'
                }}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CT Filings Due */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>CT Filings Due</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { client: 'ABC Trading LLC', details: 'CT Return - FY 2025', badge: '5 Days Overdue', isOverdue: true },
              { client: 'Delta Properties', details: 'CT Return - FY 2025', badge: '2 Days Left', isOverdue: false },
              { client: 'XYZ Holdings', details: 'CT Return - FY 2025', badge: '6 Days Left', isOverdue: false },
              { client: 'Prime Consultants', details: 'CT Return - FY 2025', badge: '12 Days Left', isOverdue: false },
              { client: 'Nova Logistics', details: 'CT Return - FY 2025', badge: '18 Days Left', isOverdue: false }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628' }}>{item.client}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)' }}>{item.details}</div>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  background: item.isOverdue ? '#FEE2E2' : '#FFF3E0',
                  color: item.isOverdue ? '#EF4444' : '#E8760A'
                }}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent Activity</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                desc: 'Books completed for ABC Trading LLC',
                user: 'by John Doe',
                time: '2h ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )
              },
              {
                desc: 'VAT return filed for XYZ Holdings',
                user: 'by Sarah Khan',
                time: '4h ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                )
              },
              {
                desc: 'Reconciliation completed for Alpha Tech',
                user: 'by Mike Brown',
                time: '6h ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              },
              {
                desc: 'KYC document verified for Beta Industries',
                user: 'by Priya Nair',
                time: '1d ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                )
              },
              {
                desc: 'QBO sync successful for Gamma Solutions',
                user: 'by System',
                time: '1d ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(232, 118, 10, 0.06)',
                  color: '#E8760A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628', lineHeight: 1.25 }}>{item.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.125rem' }}>
                    <span>{item.user}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Grid of 8 Buttons) */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Quick Actions</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', height: 'calc(100% - 1.5rem)' }}>
            {[
              {
                name: 'Add New Client',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                )
              },
              {
                name: 'Upload Documents',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )
              },
              {
                name: 'AI Bookkeeping Queue',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )
              },
              {
                name: 'Reconciliation Center',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              },
              {
                name: 'VAT Center',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                )
              },
              {
                name: 'CT Filings',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                )
              },
              {
                name: 'Reports',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )
              },
              {
                name: 'QBO Sync Log',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              }
            ].map((act, idx) => (
              <button key={idx} style={{
                background: '#ffffff',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2A1628';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#2A1628';
                const badge = e.currentTarget.querySelector('.action-badge') as HTMLElement;
                if (badge) {
                  badge.style.background = 'rgba(255, 255, 255, 0.15)';
                  badge.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#2A1628';
                e.currentTarget.style.borderColor = '#DDD0C4';
                const badge = e.currentTarget.querySelector('.action-badge') as HTMLElement;
                if (badge) {
                  badge.style.background = 'rgba(232, 118, 10, 0.06)';
                  badge.style.color = '#E8760A';
                }
              }}>
                <div className="action-badge" style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(232, 118, 10, 0.06)',
                  color: '#E8760A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms ease'
                }}>
                  {act.icon}
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{act.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
