'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function RenewalSummaryPage() {
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
    return <LoadingScreen message="Loading renewals data..." />;
  }

  // EMPTY STATE
  if (stage < 7) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Renewal Summary Not Ready
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your renewal summary will appear here once your project is complete and your corporate documents are issued.
        </p>
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(amount);
  };

  const calculateUrgency = (days: number) => {
    if (days < 30) return { label: 'Urgent', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    if (days <= 90) return { label: 'Renew Soon', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
    return { label: 'Valid', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
  };

  const documents = [
    { id: 1, type: 'Tenancy Contract (Ejari)', issueDate: 'Jan 10, 2026', expiryDate: 'Jan 09, 2027', daysLeft: 17, fee: 15000 },
    { id: 2, type: 'Trade License', issueDate: 'Mar 15, 2026', expiryDate: 'Mar 14, 2027', daysLeft: 82, fee: 12500 },
    { id: 3, type: 'Establishment Card', issueDate: 'Apr 02, 2026', expiryDate: 'Apr 01, 2027', daysLeft: 100, fee: 4000 },
    { id: 4, type: 'Shareholder Visa', issueDate: 'May 20, 2026', expiryDate: 'May 19, 2028', daysLeft: 512, fee: 6500 },
  ].sort((a, b) => a.daysLeft - b.daysLeft); // Sorted by urgency

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Area */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
        paddingBottom: '0.75rem', borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Growth & Planning
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Renewal Summary
            </h1>
          </div>
        </div>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1rem', background: '#ffffff', color: primaryBg,
          border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 200ms ease'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </button>
      </div>

      <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-page)', borderBottom: `1px solid ${cardBorderColor}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Document Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Issue Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Expiry Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Renewal Fee</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, idx, arr) => {
              const urgency = calculateUrgency(doc.daysLeft);
              return (
                <tr key={doc.id} style={{ borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${cardBorderColor}` }}>
                  <td style={{ padding: '1.25rem 1rem', color: primaryBg, fontWeight: 600 }}>{doc.type}</td>
                  <td style={{ padding: '1.25rem 1rem', color: 'rgba(0,0,0,0.6)' }}>{doc.issueDate}</td>
                  <td style={{ padding: '1.25rem 1rem', color: primaryBg, fontWeight: 500 }}>{doc.expiryDate}</td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', 
                        background: urgency.bg, color: urgency.color 
                      }}>
                        {urgency.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: urgency.color, fontWeight: 600 }}>
                        {doc.daysLeft} days left
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: primaryBg }}>{formatMoney(doc.fee)}</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                    <button style={{
                      padding: '0.5rem 0.75rem', background: primaryBg, color: '#ffffff',
                      border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'opacity 200ms ease'
                    }}>
                      Request Renewal
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
