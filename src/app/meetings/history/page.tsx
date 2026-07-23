'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface TenantProfile {
  onboarding_stage?: number;
}

const MOCK_MEETINGS = [
  {
    id: 1,
    date: '2026-06-25T14:00:00Z',
    duration: '45 mins',
    type: 'Initial Consultation',
    summary: 'Discussed business setup requirements in Meydan Free Zone and outlined the timeline for visa processing.',
    attendees: [
      { name: 'Client Rep', init: 'CR' },
      { name: 'Aisha Sultan', init: 'AS', role: 'IncHub' }
    ]
  },
  {
    id: 2,
    date: '2026-07-02T10:30:00Z',
    duration: '30 mins',
    type: 'Follow-up Call',
    summary: 'Reviewed the drafted Engagement Letter and clarified compliance questions regarding Ultimate Beneficial Owner (UBO) registration.',
    attendees: [
      { name: 'Client Rep', init: 'CR' },
      { name: 'Aisha Sultan', init: 'AS', role: 'IncHub' },
      { name: 'Legal Team', init: 'LT', role: 'IncHub' }
    ]
  }
];

export default function MeetingHistoryPage() {
  const { currentBrand } = usePermission();
  const [stage, setStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

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
    return <LoadingScreen message="Loading meeting history..." />;
  }

  // EMPTY STATE: Stage < 2
  if (stage !== null && stage < 2) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>Meeting History</h1>
        <p style={{ margin: '0 0 2rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, sans-serif' }}>Review your past meetings and discussions.</p>
        
        <div style={{ background: '#ffffff', borderRadius: 12, border: `1px dashed ${accentColor}`, padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryBg, marginBottom: '1.5rem', border: `1px solid ${cardBorderColor}` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: primaryBg, margin: '0 0 0.5rem' }}>No Meetings Yet</h2>
          <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.875rem', maxWidth: '400px' }}>
            Your meeting history will appear here after your first consultation with our team.
          </p>
        </div>
      </div>
    );
  }

  const sortedMeetings = [...MOCK_MEETINGS].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

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
              Meeting History
            </h1>
          </div>
        </div>
        
        {/* Sort Filter - Custom Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.5)' }}>Sort By</span>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.75rem', borderRadius: '6px', border: `1px solid ${cardBorderColor}`,
                background: '#ffffff', color: primaryBg, fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', minWidth: '140px', outline: 'none', gap: '0.5rem'
              }}
            >
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            {isSortOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '0.25rem',
                background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 10, width: '100%',
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}>
                <button 
                  onClick={() => { setSortOrder('newest'); setIsSortOpen(false); }}
                  style={{
                    padding: '0.625rem 0.75rem', background: sortOrder === 'newest' ? 'var(--bg-page)' : '#ffffff',
                    border: 'none', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600,
                    color: primaryBg, cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = sortOrder === 'newest' ? 'var(--bg-page)' : '#ffffff'}
                >Newest First</button>
                <button 
                  onClick={() => { setSortOrder('oldest'); setIsSortOpen(false); }}
                  style={{
                    padding: '0.625rem 0.75rem', background: sortOrder === 'oldest' ? 'var(--bg-page)' : '#ffffff',
                    border: 'none', textAlign: 'left', fontSize: '0.8125rem', fontWeight: 600,
                    color: primaryBg, cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = sortOrder === 'oldest' ? 'var(--bg-page)' : '#ffffff'}
                >Oldest First</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p style={{ margin: '-0.5rem 0 0.5rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, sans-serif' }}>
        A comprehensive record of all your past consultations and follow-ups.
      </p>

      {/* List View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedMeetings.map((mtg) => {
          const dt = new Date(mtg.date);
          const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
          const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          return (
            <div key={mtg.id} style={{
              background: '#ffffff',
              border: `1px solid ${cardBorderColor}`,
              borderRadius: '8px',
              padding: '1.25rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.0625rem', fontWeight: 600, color: primaryBg }}>{mtg.type}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {dateStr} at {timeStr} ({mtg.duration})
                  </p>
                </div>
                
                {/* Attendees */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {mtg.attendees.map((att, i) => (
                    <div key={i} title={att.name} style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: att.role === 'IncHub' ? primaryBg : 'var(--bg-page)',
                      color: att.role === 'IncHub' ? '#ffffff' : primaryBg,
                      border: `1px solid ${att.role === 'IncHub' ? primaryBg : cardBorderColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.5625rem', fontWeight: 700, marginLeft: i > 0 ? '-0.375rem' : 0,
                      position: 'relative', zIndex: mtg.attendees.length - i
                    }}>
                      {att.init}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--bg-page)', padding: '0.875rem 1rem', borderRadius: '6px', borderLeft: `3px solid ${accentColor}` }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.5 }}>
                  <strong style={{ color: primaryBg, marginRight: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary:</strong>
                  {mtg.summary}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
