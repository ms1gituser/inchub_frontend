'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ArchivePage() {
  const { currentBrand } = usePermission();
  const [stage, setStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get<{ success: boolean; data: any }>('/bookkeeping/profile');
        if (res?.success && res.data?.onboarding_stage) {
          setStage(res.data.onboarding_stage);
        } else {
          setStage(7); // FORCED FOR UI REVIEW
        }
      } catch (e) {
        setStage(7); // FORCED FOR UI REVIEW
      } finally {
        setStage(7); // FORCED FOR UI REVIEW
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const isFinancial = currentBrand === 'financial';
  const primaryBg = isFinancial ? '#2A1628' : '#2C1A0E';
  const accentColor = isFinancial ? '#E8760A' : '#B8892A';
  const cardBorderColor = 'var(--border-subtle)';

  if (loading || stage === null) {
    return <LoadingScreen message="Loading document archive..." />;
  }

  // EMPTY STATE
  if (stage < 7) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Archive Not Available
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your year-end document archive will appear here after your corporate tax return is officially filed and closed.
        </p>
      </div>
    );
  }

  const archiveDocs = [
    { id: 1, year: 'FY 2025', name: 'CT Return Confirmation', date: 'Oct 12, 2026', format: 'PDF', status: 'Available' },
    { id: 2, year: 'FY 2025', name: 'CT Payment Receipt', date: 'Oct 15, 2026', format: 'PDF', status: 'Available' },
    { id: 3, year: 'FY 2025', name: 'Full-Year Unaudited Financials', date: 'Sep 30, 2026', format: 'PDF', status: 'Available' },
    { id: 4, year: 'FY 2025', name: 'Audited Financials', date: '-', format: 'PDF', status: 'Pending' },
    { id: 5, year: 'FY 2025', name: '12 Monthly P&L Reports (Combined)', date: 'Sep 30, 2026', format: 'ZIP', status: 'Available' },
    { id: 6, year: 'FY 2025', name: '12 Monthly Invoices (Combined)', date: 'Sep 30, 2026', format: 'ZIP', status: 'Available' },
    
    { id: 7, year: 'FY 2024', name: 'CT Return Confirmation', date: 'Oct 05, 2025', format: 'PDF', status: 'Available' },
    { id: 8, year: 'FY 2024', name: 'CT Payment Receipt', date: 'Oct 07, 2025', format: 'PDF', status: 'Available' },
    { id: 9, year: 'FY 2024', name: 'Audited Financials', date: 'Nov 12, 2025', format: 'PDF', status: 'Available' },
  ];

  const groupedDocs = archiveDocs.reduce((acc, doc) => {
    if (!acc[doc.year]) acc[doc.year] = [];
    acc[doc.year].push(doc);
    return acc;
  }, {} as Record<string, typeof archiveDocs>);

  const years = Object.keys(groupedDocs).sort().reverse();

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Area */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
        paddingBottom: '0.75rem', borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Accounting & Finance
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Year-End Document Archive
            </h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.375rem 0.75rem', borderRadius: '6px', border: `1px solid ${cardBorderColor}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search documents..." 
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: primaryBg, width: '200px' }}
          />
        </div>
      </div>

      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#047857', fontWeight: 500 }}>
          <strong>Permanent Record Vault</strong> — These official financial documents never expire from your portal and are securely available for download at any time.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {years.map((year, idx) => {
          const isLatest = idx === 0; // Assume first is latest because of reverse sort
          return (
            <div key={year} style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
              
              <div style={{ 
                padding: '1.25rem', background: 'var(--bg-page)', borderBottom: `1px solid ${cardBorderColor}`, 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
              }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>{year}</h2>
                {!isLatest && (
                  <span style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}>Expand ▼</span>
                )}
              </div>

              {/* Show documents only for the latest year for dummy purposes, to simulate accordion */}
              {(isLatest) && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: `1px solid ${cardBorderColor}` }}>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Document Name</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Upload Date</th>
                      <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedDocs[year].map((doc, i, arr) => (
                      <tr key={doc.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${cardBorderColor}` }}>
                        <td style={{ padding: '1.25rem', color: primaryBg, fontWeight: 600 }}>{doc.name}</td>
                        <td style={{ padding: '1.25rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', 
                            background: doc.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                            color: doc.status === 'Available' ? '#10b981' : '#f59e0b' 
                          }}>
                            {doc.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem', color: 'rgba(0,0,0,0.6)' }}>{doc.date}</td>
                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                          {doc.status === 'Available' ? (
                            <button style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                              padding: '0.5rem 0.75rem', background: '#ffffff', color: primaryBg,
                              border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                              cursor: 'pointer', transition: 'all 200ms ease'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              Download {doc.format}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>Awaiting Upload</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
