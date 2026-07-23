'use client';

import React, { useState } from 'react';
import { usePermission } from '@/context/PermissionContext';

export default function FeedbackBugsPage() {
  const { currentBrand } = usePermission();

  const isFinancial = currentBrand === 'financial';
  const primaryBg = isFinancial ? '#2A1628' : '#2C1A0E';
  const accentColor = isFinancial ? '#E8760A' : '#B8892A';
  const cardBorderColor = 'var(--border-subtle)';

  const initialBugs = [
    { id: 'BUG-042', title: 'Calendar date selection is off by one day in Safari', severity: 'High', status: 'Resolved', date: 'July 21, 2026' },
    { id: 'BUG-045', title: 'Proposal PDF download button lacks loading state', severity: 'Low', status: 'Open', date: 'July 22, 2026' },
    { id: 'BUG-046', title: 'Project Tracker progress bar animation is jittery', severity: 'Medium', status: 'In Progress', date: 'July 23, 2026' },
  ];

  const [bugs, setBugs] = useState(initialBugs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getSeverityStyle = (sev: string) => {
    switch(sev) {
      case 'High': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'Medium': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.6)' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Resolved': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'In Progress': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      default: return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    }
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
              Feedback & Bugs
            </h1>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1rem', background: primaryBg, color: '#ffffff',
            border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 200ms ease'
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Report a Bug
        </button>
      </div>

      {/* Bugs Table */}
      <div style={{
        background: '#ffffff',
        border: `1px solid ${cardBorderColor}`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-page)', borderBottom: `1px solid ${cardBorderColor}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Ticket ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Issue Summary</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Severity</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date Reported</th>
            </tr>
          </thead>
          <tbody>
            {bugs.map((bug) => {
              const sev = getSeverityStyle(bug.severity);
              const stat = getStatusStyle(bug.status);
              
              return (
                <tr key={bug.id} style={{ borderBottom: `1px solid ${cardBorderColor}` }}>
                  <td style={{ padding: '1rem', color: primaryBg, fontWeight: 700, fontFamily: 'monospace' }}>{bug.id}</td>
                  <td style={{ padding: '1rem', color: 'rgba(0,0,0,0.8)', fontWeight: 500 }}>{bug.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: sev.bg, color: sev.color }}>
                      {bug.severity}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: stat.bg, color: stat.color }}>
                      {bug.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'rgba(0,0,0,0.5)' }}>{bug.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', width: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Report a Bug</h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)' }}>This is a mockup. In the real app, this will open a Jira/Linear ticket submission form.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '0.5rem 1rem', background: 'var(--bg-page)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, color: primaryBg }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
