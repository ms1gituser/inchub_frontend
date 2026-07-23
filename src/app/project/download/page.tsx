'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function DownloadDocumentsPage() {
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
          setStage(1);
        }
      } catch (e) {
        setStage(7);
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
    return <LoadingScreen message="Loading issued documents..." />;
  }

  // EMPTY STATE (Stage 1-5)
  if (stage < 6) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          No Documents Issued Yet
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your completed documents will appear here as they are issued by the relevant authorities during the project lifecycle.
        </p>
      </div>
    );
  }

  const documents = [
    { id: 1, category: 'Licensing', name: 'Initial Approval Certificate', date: 'July 14, 2026', format: 'PDF', stage: 6 },
    { id: 2, category: 'Licensing', name: 'Trade License', date: 'July 20, 2026', format: 'PDF', stage: 7 },
    { id: 3, category: 'Immigration', name: 'Establishment Card', date: 'July 23, 2026', format: 'PDF', stage: 7 },
    { id: 4, category: 'Banking', name: 'Corporate Account Opening Forms', date: 'July 25, 2026', format: 'PDF', stage: 7 },
  ];

  // Stage 6 = Partial (only show earlier docs), Stage 7+ = Full
  const visibleDocs = documents.filter(d => d.stage <= stage);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Area */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
        paddingBottom: '0.75rem', borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Project Management
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Your Documents
            </h1>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#047857', fontWeight: 500 }}>
          <strong>Available anytime</strong> — these official documents never expire from your portal and can be downloaded securely at any time.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {visibleDocs.map((doc) => (
          <div key={doc.id} style={{
            background: '#ffffff',
            border: `1px solid ${cardBorderColor}`,
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
          }}>
            <div>
              <span style={{ 
                display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', 
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', 
                background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.5)', marginBottom: '0.75rem' 
              }}>
                {doc.category}
              </span>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, color: primaryBg }}>{doc.name}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Issued: {doc.date}</p>
            </div>
            
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%',
              padding: '0.625rem 1rem', background: '#ffffff', color: primaryBg,
              border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 200ms ease'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download {doc.format}
            </button>
          </div>
        ))}
        {visibleDocs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', border: `1px dashed ${cardBorderColor}`, borderRadius: '8px' }}>
            <p style={{ margin: 0, color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem' }}>Awaiting initial documents...</p>
          </div>
        )}
      </div>

    </div>
  );
}
