'use client';

import React, { useEffect, useState } from 'react';

interface ActivityLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'running' | 'success' | 'queued';
  details: string;
}

export default function ContactsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: '1', timestamp: '13:45:12', event: 'Registry Sync', status: 'success', details: 'Updated 14 enterprise firmographic profiles.' },
    { id: '2', timestamp: '13:46:04', event: 'AI Lead Enrichment', status: 'running', details: 'Scanning LinkedIn APIs for newly promoted decision-makers.' },
    { id: '3', timestamp: '13:47:20', event: 'Behavioral Scoring', status: 'queued', details: 'Recalculating conversion probabilities based on Q2 metrics.' },
  ]);

  const [activeDots, setActiveDots] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDots(prev => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: '#2C1A0E' }}>
      {/* Header */}
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          Customer Relationship Management • Corporate Services
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.02em', fontFamily: 'Cormorant, serif' }}>
          Contacts <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Automation</span> Hub
        </h1>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        
        {/* Left Side: System status & visual logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Status Panel */}
          <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(44, 26, 14, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE7D8', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#B8892A', transition: 'opacity 0.5s ease', opacity: activeDots ? 1 : 0.4 }} />
                <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2C1A0E' }}>
                  ACTIVE COGNITIVE DIRECTORY ENGINE
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#B8892A', background: 'rgba(184, 137, 42, 0.08)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                SYSTEM HEALTH: OPTIMAL
              </span>
            </div>

            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: '0.9375rem', lineHeight: '1.85', color: 'rgba(44,26,14,0.85)', margin: '0 0 1.5rem 0' }}>
              The directory uses <strong style={{ fontWeight: 600 }}>IncHub Cognitive Agents</strong> to automatically monitor, clean, and enrich contact entities dynamically. Client-side state hydration is synchronized in real-time, eliminating manual records updates and minimizing data stale rates to under 0.2%.
            </p>

            {/* Simulated Live Processes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F6F1E8', border: '1px solid #DDD4BE', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', width: '60px' }}>
                      {log.timestamp}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#2C1A0E' }}>
                        {log.event}
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', marginTop: '0.15rem' }}>
                        {log.details}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: log.status === 'success' ? '#10B981' : log.status === 'running' ? '#B8892A' : '#6B3F22'
                    }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: log.status === 'success' ? '#0F766E' : log.status === 'running' ? '#B8892A' : 'rgba(44,26,14,0.6)' }}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Key Stats & Quick Configurations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#EDE7D8', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A2E1A' }}>
              DIRECTORY METRICS
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.01em' }}>14,208</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>Analyzed Records</div>
              </div>
              <div style={{ width: '100%', height: '1px', background: '#DDD4BE' }} />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.01em' }}>98.4%</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>Enrichment Accuracy</div>
              </div>
              <div style={{ width: '100%', height: '1px', background: '#DDD4BE' }} />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.01em' }}>42,911</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>Metadata Tags Generated</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A2E1A' }}>
              AGENT CONFIGURATION
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#2C1A0E', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#B8892A' }} />
                AUTO-RESOLVE DUPLICATES
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#2C1A0E', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#B8892A' }} />
                REAL-TIME API RE-HYDRATION
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#2C1A0E', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#B8892A' }} />
                EXPORT SYNC TO SALESFORCE
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

