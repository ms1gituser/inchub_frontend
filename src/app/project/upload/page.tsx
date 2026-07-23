'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function UploadDocumentsPage() {
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
    return <LoadingScreen message="Loading document checklists..." />;
  }

  // EMPTY STATE (Stage 1-5)
  if (stage < 6) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Uploads Not Yet Required
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Document upload checklists will be available here once your project officially begins.
        </p>
      </div>
    );
  }

  const checklist = [
    { id: 1, service: 'Company Registration', name: 'Passport Copy', desc: 'Clear color scan of passport data page. Ensure all 4 corners are visible.', formats: 'PDF, JPG (Max 5MB)', status: 'Approved', reason: null },
    { id: 2, service: 'Company Registration', name: 'NOC Letter', desc: 'No Objection Certificate from current sponsor, stamped and signed.', formats: 'PDF (Max 2MB)', status: 'Pending', reason: null },
    { id: 3, service: 'Visa Processing', name: 'Passport Size Photo', desc: 'White background, high resolution, no glasses.', formats: 'JPG, PNG (Max 2MB)', status: 'Uploaded', reason: null },
    { id: 4, service: 'Visa Processing', name: 'Emirates ID (Front & Back)', desc: 'Scanned copy of your previous Emirates ID.', formats: 'PDF, JPG (Max 5MB)', status: 'Rejected', reason: 'Back side is blurry. Please re-scan and upload clearly.' },
  ];

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.service]) acc[item.service] = [];
    acc[item.service].push(item);
    return acc;
  }, {} as Record<string, typeof checklist>);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Approved': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'Uploaded': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      case 'Rejected': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }; // Pending
    }
  };

  const total = checklist.length;
  const done = checklist.filter(c => c.status === 'Approved' || c.status === 'Uploaded').length;
  const progressPercent = Math.round((done / total) * 100);

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
              Upload Documents
            </h1>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Document Checklist Progress</h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>{done} of {total} required documents uploaded</p>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryBg }}>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-page)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: accentColor, borderRadius: '4px', transition: 'width 1s ease' }}></div>
        </div>
      </div>

      {/* Checklists Grouped by Service */}
      {Object.keys(groupedChecklist).map((serviceName) => (
        <div key={serviceName}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>{serviceName}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {groupedChecklist[serviceName].map((item) => {
              const sStyle = getStatusStyle(item.status);
              
              return (
                <div key={item.id} style={{ 
                  background: '#ffffff', border: `1px solid ${item.status === 'Rejected' ? '#ef4444' : cardBorderColor}`, 
                  borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: primaryBg }}>{item.name}</h4>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: sStyle.bg, color: sStyle.color }}>
                          {item.status}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>{item.desc}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted: {item.formats}</p>
                    </div>
                    
                    {item.status !== 'Approved' && (
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.625rem 1rem', background: primaryBg, color: '#ffffff',
                        border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'opacity 200ms ease'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        {item.status === 'Rejected' ? 'Re-Upload' : 'Upload File'}
                      </button>
                    )}
                  </div>
                  
                  {item.status === 'Rejected' && item.reason && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.875rem', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#b91c1c' }}>{item.reason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}
