'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useSearchParams } from 'next/navigation';

function TaskStatusContent() {
  const { currentBrand } = usePermission();
  const searchParams = useSearchParams();
  const initialServiceId = parseInt(searchParams.get('service') || '1');
  
  const [stage, setStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialServiceId);

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
    return <LoadingScreen message="Loading live tasks..." />;
  }

  // EMPTY STATE (Stage 1-5)
  if (stage < 6) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Live Updates Pending
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Live task updates will appear here once your project is officially activated by our team.
        </p>
      </div>
    );
  }

  const services = [
    { id: 1, name: 'Company Registration' },
    { id: 2, name: 'Bank Account Opening' },
    { id: 3, name: 'Visa Processing' }
  ];

  const tasksData: Record<number, any[]> = {
    1: [
      { id: 101, title: 'Initial Name Approval', status: 'Completed', date: '2 hours ago', notes: 'Trade name "Example L.L.C." approved by DMCC authority.', ref: 'TN-491823' },
      { id: 102, title: 'Submission of MOA & Documents', status: 'In Progress', date: '15 mins ago', notes: 'Submitted to DMCC portal. Awaiting initial screening.', ref: 'APP-99812' },
      { id: 103, title: 'Government Approval (Security Check)', status: 'Pending', date: '-', notes: 'Expect 3-5 working days after screening.', ref: null },
      { id: 104, title: 'License Issuance', status: 'Pending', date: '-', notes: 'Final step. License will be available in the download section.', ref: null },
    ],
    2: [
      { id: 201, title: 'Preparation of Bank Forms', status: 'Pending', date: '-', notes: 'Pending company license issuance.', ref: null }
    ],
    3: [
      { id: 301, title: 'Establishment Card Registration', status: 'Pending', date: '-', notes: 'Requires active license.', ref: null }
    ]
  };

  const currentTasks = tasksData[activeTab] || [];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Completed': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'In Progress': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'Action Required': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { bg: 'rgba(0, 0, 0, 0.05)', color: 'rgba(0, 0, 0, 0.5)' };
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
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
              Task Status <span style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981', verticalAlign: 'middle', marginLeft: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>● LIVE</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${cardBorderColor}`, paddingBottom: '0.5rem' }}>
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            style={{
              padding: '0.5rem 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === s.id ? `2px solid ${accentColor}` : '2px solid transparent',
              color: activeTab === s.id ? primaryBg : 'rgba(0,0,0,0.5)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem', position: 'relative' }}>
        {/* Vertical line connecting tasks */}
        <div style={{ position: 'absolute', left: '23px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(0,0,0,0.05)', zIndex: 0 }}></div>

        {currentTasks.map((task, idx) => {
          const sStyle = getStatusStyle(task.status);
          const isDone = task.status === 'Completed';
          const isActive = task.status === 'In Progress' || task.status === 'Action Required';

          return (
            <div key={task.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
              {/* Stepper Node */}
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '50%', background: isDone ? '#10b981' : isActive ? accentColor : '#e5e5e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: `0 0 0 4px var(--bg-page)`
              }}>
                {isDone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>}
              </div>

              {/* Task Card */}
              <div style={{ flex: 1, background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: primaryBg }}>{task.title}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: sStyle.bg, color: sStyle.color }}>
                      {task.status}
                    </span>
                    <p style={{ margin: '0.375rem 0 0', fontSize: '0.6875rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>Updated: {task.date}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', background: 'var(--bg-page)', padding: '0.875rem', borderRadius: '6px' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.4)' }}>Ops Notes</p>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(0,0,0,0.8)' }}>{task.notes}</p>
                  </div>
                  
                  {task.ref && (
                    <div style={{ textAlign: 'right', borderLeft: `1px solid ${cardBorderColor}`, paddingLeft: '1rem' }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.4)' }}>Govt Reference</p>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(task.ref); alert('Copied to clipboard'); }}
                        style={{ margin: 0, padding: 0, border: 'none', background: 'transparent', fontSize: '0.875rem', color: primaryBg, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Click to copy"
                      >
                        {task.ref}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TaskStatusPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <TaskStatusContent />
    </Suspense>
  );
}
