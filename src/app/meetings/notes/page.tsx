'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Link from 'next/link';

interface TenantProfile {
  onboarding_stage?: number;
}

const MOCK_MEETING_NOTES = [
  {
    id: 1,
    meetingId: 1,
    meetingTitle: 'Initial Consultation',
    date: '2026-06-25T14:00:00Z',
    keyPoints: [
      'Client seeks to incorporate in Meydan Free Zone with a trading license.',
      'Required minimum of 2 visas for the executive team.',
      'Corporate bank account setup is a priority (targeting Emirates NBD).'
    ],
    actionItems: [
      { id: 101, desc: 'Send customized proposal and Engagement Letter', owner: 'IncHub', status: 'Done' },
      { id: 102, desc: 'Upload passport copies and initial KYC documents', owner: 'Client', status: 'In Progress' },
      { id: 103, desc: 'Draft initial business plan for bank compliance', owner: 'IncHub', status: 'Pending' }
    ],
    queries: [
      { id: 201, question: 'Will the physical office space be mandatory for this license type?', answer: 'No, a flexi-desk agreement is sufficient for Meydan Free Zone up to 3 visas.', status: 'Answered' }
    ]
  },
  {
    id: 2,
    meetingId: 2,
    meetingTitle: 'Follow-up Call',
    date: '2026-07-02T10:30:00Z',
    keyPoints: [
      'Reviewed the Engagement Letter clauses.',
      'Clarified the UBO structure and holding company requirements.'
    ],
    actionItems: [
      { id: 104, desc: 'Sign the Engagement Letter via portal', owner: 'Client', status: 'Pending' },
      { id: 105, desc: 'Process initial retainer payment', owner: 'Client', status: 'Pending' }
    ],
    queries: [
      { id: 202, question: 'How long does the UBO registry update take?', answer: 'Typically 3-5 business days after final submission.', status: 'Answered' },
      { id: 203, question: 'Can we add a 3rd visa later without upgrading the license?', answer: null, status: 'Pending Review' }
    ]
  }
];

export default function MeetingNotesPage() {
  const { currentBrand } = usePermission();
  const [stage, setStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get<{ success: boolean; data: TenantProfile }>('/bookkeeping/profile');
        if (res?.success && res.data?.onboarding_stage) {
          setStage(res.data.onboarding_stage);
        } else {
          setStage(1);
        }
      } catch (e) {
        setStage(1);
      } finally {
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
    return <LoadingScreen message="Loading meeting notes..." />;
  }

  // EMPTY STATE: Stage < 2
  if (stage !== null && stage < 2) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>Notes & Action Items</h1>
        <p style={{ margin: '0 0 2rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, sans-serif' }}>Track commitments and next steps from our discussions.</p>
        
        <div style={{ background: '#ffffff', borderRadius: 12, border: `1px dashed ${accentColor}`, padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryBg, marginBottom: '1.5rem', border: `1px solid ${cardBorderColor}` }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: primaryBg, margin: '0 0 0.5rem' }}>No Notes Available</h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.875rem', maxWidth: '400px' }}>
            Notes from your meetings will appear here after your first consultation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Executive Clean Header Area */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(44, 26, 14, 0.5)', fontFamily: 'Inter, sans-serif' }}>
            Meetings & Consultations
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.25rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Notes & Action Items
            </h1>
          </div>
        </div>
      </div>

      <p style={{ margin: '-0.5rem 0 0.5rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, sans-serif' }}>
        Your official record of meeting outcomes, commitments, and pending items. This log is maintained by your Relationship Manager.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {MOCK_MEETING_NOTES.map((note) => {
          const dt = new Date(note.date);
          const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

          return (
            <div key={note.id} style={{
              background: '#ffffff',
              border: `1px solid ${cardBorderColor}`,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            }}>
              
              {/* Note Header */}
              <div style={{ background: 'var(--bg-page)', padding: '1rem 1.5rem', borderBottom: `1px solid ${cardBorderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg }}>{note.meetingTitle}</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)' }}>Meeting Date: {dateStr}</p>
                </div>
                <Link href="/meetings/history" style={{
                  fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: accentColor, textDecoration: 'none', padding: '0.5rem 0.75rem', border: `1px solid ${accentColor}`,
                  borderRadius: '6px', transition: 'all 200ms'
                }}>
                  View History
                </Link>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Key Points */}
                <section>
                  <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryBg, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Key Discussion Points
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(0,0,0,0.8)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {note.keyPoints.map((kp, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{kp}</li>
                    ))}
                  </ul>
                </section>

                {/* Action Items */}
                <section>
                  <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryBg, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                    Action Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {note.actionItems.map(act => (
                      <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', border: `1px solid ${cardBorderColor}`, borderRadius: '6px', background: '#fafafa', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                           <div style={{
                             width: 16, height: 16, borderRadius: '4px', border: `2px solid ${act.status === 'Done' ? '#10b981' : cardBorderColor}`,
                             background: act.status === 'Done' ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                           }}>
                             {act.status === 'Done' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                           </div>
                           <span style={{ fontSize: '0.875rem', color: act.status === 'Done' ? 'rgba(0,0,0,0.5)' : primaryBg, textDecoration: act.status === 'Done' ? 'line-through' : 'none' }}>
                             {act.desc}
                           </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.375rem', borderRadius: '4px', background: act.owner === 'IncHub' ? `color-mix(in srgb, ${accentColor} 15%, transparent)` : 'var(--bg-page)', color: act.owner === 'IncHub' ? accentColor : primaryBg }}>
                            Owner: {act.owner}
                          </span>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: act.status === 'Done' ? '#10b981' : act.status === 'In Progress' ? '#f59e0b' : 'rgba(0,0,0,0.4)' }}>
                            {act.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Open Queries */}
                {note.queries.length > 0 && (
                  <section>
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryBg, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      Open Queries
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {note.queries.map(q => (
                        <div key={q.id} style={{ padding: '0.875rem', borderLeft: `3px solid ${q.status === 'Answered' ? '#10b981' : '#f59e0b'}`, background: '#fafafa', borderRadius: '0 6px 6px 0' }}>
                          <p style={{ margin: '0 0 0.375rem', fontSize: '0.875rem', fontWeight: 600, color: primaryBg }}>Q: {q.question}</p>
                          {q.answer ? (
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>
                              <strong style={{ color: '#10b981', marginRight: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answer:</strong>
                              {q.answer}
                            </p>
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              Pending Team Review
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
