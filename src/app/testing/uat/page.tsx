'use client';

import React, { useState } from 'react';
import { usePermission } from '@/context/PermissionContext';

export default function UatChecklistPage() {
  const { currentBrand } = usePermission();

  const isFinancial = currentBrand === 'financial';
  const primaryBg = isFinancial ? '#2A1628' : '#2C1A0E';
  const accentColor = isFinancial ? '#E8760A' : '#B8892A';
  const cardBorderColor = 'var(--border-subtle)';

  const initialTests = [
    { id: 1, module: 'Meetings Module', desc: 'Custom time picker allows valid time selection and updates Confirm button', status: 'Passed' },
    { id: 2, module: 'Meetings Module', desc: 'Meeting History dropdown styles match premium theme (not native browser)', status: 'Passed' },
    { id: 3, module: 'Proposal & Payments', desc: 'Proposal document renders as an HTML view, not raw PDF', status: 'Failed' },
    { id: 4, module: 'Proposal & Payments', desc: 'Edit Proposal button is visible BEFORE approval, hidden AFTER', status: 'Passed' },
    { id: 5, module: 'Project Tracker', desc: 'Stage < 5 correctly shows "Project Not Activated" empty state', status: 'Passed' },
    { id: 6, module: 'Project Tracker', desc: 'Clicking a service block in Stage 6 routes to Task Status Timeline', status: 'Pending' },
    { id: 7, module: 'Compliance', desc: 'Missing KYC docs correctly trigger RED "Action Required" banner', status: 'Passed' },
    { id: 8, module: 'Compliance', desc: 'Uploaded documents transition to "Under Review" state', status: 'Pending' },
  ];

  const [tests, setTests] = useState(initialTests);

  const total = tests.length;
  const passed = tests.filter(t => t.status === 'Passed').length;
  const progressPercent = Math.round((passed / total) * 100);

  const grouped = tests.reduce((acc, t) => {
    if (!acc[t.module]) acc[t.module] = [];
    acc[t.module].push(t);
    return acc;
  }, {} as Record<string, typeof tests>);

  const handleStatusChange = (id: number, newStatus: string) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
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
            Testing & QA
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              UAT Checklist
            </h1>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Test Execution Progress</h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>{passed} of {total} test cases passed</p>
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: primaryBg }}>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-page)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>

      {/* Checklist grouped by module */}
      {Object.keys(grouped).map(moduleName => (
        <div key={moduleName} style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {moduleName}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {grouped[moduleName].map(test => {
              const isPassed = test.status === 'Passed';
              const isFailed = test.status === 'Failed';
              
              return (
                <div key={test.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                  background: '#ffffff', border: `1px solid ${isFailed ? '#ef4444' : cardBorderColor}`, 
                  borderRadius: '6px', padding: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: primaryBg, fontWeight: 500, lineHeight: 1.5 }}>
                      {test.desc}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleStatusChange(test.id, 'Passed')}
                      style={{
                        padding: '0.375rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid transparent', cursor: 'pointer', transition: 'all 200ms ease',
                        background: isPassed ? '#10b981' : 'var(--bg-page)', color: isPassed ? '#fff' : 'rgba(0,0,0,0.5)'
                      }}>
                      Pass
                    </button>
                    <button 
                      onClick={() => handleStatusChange(test.id, 'Failed')}
                      style={{
                        padding: '0.375rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid transparent', cursor: 'pointer', transition: 'all 200ms ease',
                        background: isFailed ? '#ef4444' : 'var(--bg-page)', color: isFailed ? '#fff' : 'rgba(0,0,0,0.5)'
                      }}>
                      Fail
                    </button>
                    <button 
                      onClick={() => handleStatusChange(test.id, 'Pending')}
                      style={{
                        padding: '0.375rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid transparent', cursor: 'pointer', transition: 'all 200ms ease',
                        background: test.status === 'Pending' ? 'rgba(0,0,0,0.2)' : 'var(--bg-page)', color: test.status === 'Pending' ? '#fff' : 'rgba(0,0,0,0.5)'
                      }}>
                      Pending
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}
