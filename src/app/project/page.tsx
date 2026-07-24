'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Link from 'next/link';

export default function ProjectOverviewPage() {
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
    return <LoadingScreen message="Loading project overview..." />;
  }

  // EMPTY STATE (Stage 1-4)
  if (stage < 5) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Project Not Activated
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your project tracker will be activated once your payment is confirmed and the operations team initiates the workflow.
        </p>
      </div>
    );
  }

  const isFullAccess = stage >= 6;

  const services = [
    { id: 1, name: 'Company Registration (DMCC)', status: 'In Progress', progress: 40, color: '#f59e0b' },
    { id: 2, name: 'Bank Account Opening', status: 'Pending', progress: 0, color: 'rgba(0,0,0,0.4)' },
    { id: 3, name: 'Visa Processing (x2)', status: 'Pending', progress: 0, color: 'rgba(0,0,0,0.4)' },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Clean Header Area */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Project Management
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Project Overview
            </h1>
          </div>
        </div>

        {/* Assigned Officer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px', border: `1px solid ${cardBorderColor}` }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryBg, fontWeight: 700, fontSize: '0.75rem', border: `1px solid ${accentColor}40` }}>
            MR
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)' }}>Assigned Ops Officer</p>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: primaryBg }}>Mohammed Rashid</p>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Overall Progress</h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>Estimated completion: August 15, 2026</p>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryBg }}>15% <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>Complete</span></span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-page)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '15%', height: '100%', background: accentColor, borderRadius: '4px', transition: 'width 1s ease' }}></div>
        </div>
      </div>

      {/* Services List */}
      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Booked Services</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {services.map((service) => {
            const CardWrapper = isFullAccess ? Link : 'div';
            
            return (
              <CardWrapper 
                key={service.id}
                href={isFullAccess ? `/project/tasks?service=${service.id}` : '#'}
                style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: isFullAccess ? '#ffffff' : '#fafafa',
                  border: `1px solid ${cardBorderColor}`,
                  borderRadius: '8px',
                  padding: '1.25rem 1.5rem',
                  cursor: isFullAccess ? 'pointer' : 'not-allowed',
                  transition: 'all 200ms ease',
                  opacity: isFullAccess ? 1 : 0.7,
                }}
                onMouseEnter={(e) => {
                  if (isFullAccess) {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFullAccess) {
                    e.currentTarget.style.borderColor = cardBorderColor;
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={!isFullAccess ? "Task details will be activated once our operations team begins work." : undefined}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: primaryBg }}>{service.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: service.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {service.status}
                    </span>
                    <div style={{ width: '120px', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${service.progress}%`, height: '100%', background: service.color, borderRadius: '2px' }}></div>
                    </div>
                  </div>
                </div>
                
                {isFullAccess && (
                  <div style={{ color: 'rgba(0,0,0,0.3)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                )}
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}
