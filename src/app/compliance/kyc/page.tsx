'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function KycDocumentsPage() {
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
    return <LoadingScreen message="Loading KYC compliance data..." />;
  }

  // EMPTY STATE (Stage 1-4)
  if (stage < 5) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          KYC Documents Pending
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your KYC compliance documents will be visible here once your project is active and payment is confirmed.
        </p>
      </div>
    );
  }

  const kycDocs = [
    { id: 1, name: 'Trade License Copy', status: 'Expired', expiry: 'July 15, 2026', formats: 'PDF (Max 5MB)' },
    { id: 2, name: 'Shareholder Passport', status: 'On File', expiry: 'Oct 22, 2030', formats: 'PDF, JPG' },
    { id: 3, name: 'Emirates ID', status: 'Expiring Soon', expiry: 'Aug 10, 2026', formats: 'PDF, JPG (Max 5MB)' },
    { id: 4, name: 'MOA / AOA', status: 'On File', expiry: 'N/A', formats: 'PDF (Max 10MB)' },
    { id: 5, name: 'Tenancy Contract (Ejari)', status: 'Missing', expiry: '-', formats: 'PDF (Max 5MB)' },
  ];

  // Derive overall status: RED if any Missing/Expired, AMBER if Expiring Soon, GREEN if all On File
  const hasCritical = kycDocs.some(d => d.status === 'Missing' || d.status === 'Expired');
  const hasWarning = kycDocs.some(d => d.status === 'Expiring Soon');
  
  const overallStatus = hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Compliant';
  const statusColor = overallStatus === 'Compliant' ? '#10b981' : overallStatus === 'Warning' ? '#f59e0b' : '#ef4444';
  const statusBg = overallStatus === 'Compliant' ? 'rgba(16, 185, 129, 0.1)' : overallStatus === 'Warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  const getDocStyle = (status: string) => {
    switch(status) {
      case 'On File': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'Under Review': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'Expiring Soon': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }; // Missing, Expired, Rejected
    }
  };

  const getExpiryStyle = (status: string) => {
    if (status === 'Expired') return { color: '#ef4444', fontWeight: 700 };
    if (status === 'Expiring Soon') return { color: '#f59e0b', fontWeight: 700 };
    return { color: 'rgba(0,0,0,0.6)', fontWeight: 500 };
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Area */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
        paddingBottom: '0.75rem', borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Compliance & Regulation
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              KYC Compliance Status
            </h1>
          </div>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div style={{ 
        background: statusBg, border: `1px solid ${statusColor}40`, 
        borderRadius: '8px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' 
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          {overallStatus === 'Compliant' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>}
          {overallStatus === 'Warning' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
          {overallStatus === 'Critical' && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
        </div>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {overallStatus === 'Compliant' ? 'All Documents On File' : overallStatus === 'Warning' ? 'Attention Required' : 'Action Required — Account Blocked'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.8)', fontWeight: 500, lineHeight: 1.5 }}>
            {overallStatus === 'Compliant' 
              ? 'Your compliance profile is fully up to date. No further action is required at this time.'
              : overallStatus === 'Warning'
              ? 'Some documents are expiring soon. Please upload renewed versions to prevent any interruption to your services.'
              : '2 documents are missing or expired. Please upload them immediately to avoid delays in your monthly accounting cycle.'}
          </p>
        </div>
      </div>

      {/* KYC Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: '0', fontSize: '1rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Required KYC Documents</h3>
        
        {kycDocs.map((doc) => {
          const sStyle = getDocStyle(doc.status);
          const eStyle = getExpiryStyle(doc.status);
          const needsUpload = doc.status !== 'On File' && doc.status !== 'Under Review';
          
          return (
            <div key={doc.id} style={{ 
              background: '#ffffff', border: `1px solid ${doc.status === 'Missing' || doc.status === 'Expired' ? '#ef4444' : cardBorderColor}`, 
              borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: primaryBg }}>{doc.name}</h4>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: sStyle.bg, color: sStyle.color }}>
                      {doc.status}
                    </span>
                    {doc.status === 'On File' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Approved by team
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Expiry Date: <span style={eStyle}>{doc.expiry}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Accepted: {doc.formats}
                    </p>
                  </div>
                </div>
                
                {needsUpload && (
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 1rem', background: primaryBg, color: '#ffffff',
                    border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'opacity 200ms ease', flexShrink: 0
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    {doc.status === 'Missing' ? 'Upload File' : 'Re-Upload Renewed'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <div style={{ marginTop: '0.5rem', background: 'var(--bg-page)', border: `1px solid ${cardBorderColor}`, padding: '1.25rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
          <strong>Why is KYC required?</strong> KYC (Know Your Customer) documents are mandatory under UAE corporate regulation. They must be kept current at all times. A complete and active KYC profile is required for our team to proceed with your monthly accounting, tax filing, and compliance workflows without interruption.
        </p>
      </div>

    </div>
  );
}
