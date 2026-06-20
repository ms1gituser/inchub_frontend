'use client';

import React, { useEffect, useState } from 'react';

interface PipelineLog {
  id: string;
  source: string;
  score: number;
  status: 'routed' | 'evaluating' | 'flagged';
  details: string;
}

export default function LeadsPage() {
  const [activeDots, setActiveDots] = useState(true);
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([
    { id: '1', source: 'Web Form A', score: 94, status: 'routed', details: 'Assigned to Enterprise Sales Desk (Corporate Division).' },
    { id: '2', source: 'Inbound API Callback', score: 87, status: 'evaluating', details: 'Analyzing company size and revenue metrics for tier assessment.' },
    { id: '3', source: 'Cold Outreach Hook', score: 41, status: 'flagged', details: 'Low firmographic alignment. Parked for automated drip campaign.' },
  ]);

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
          Leads <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Pipeline</span> Engine
        </h1>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        
        {/* Left Side: Pipeline Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Pipeline Status */}
          <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(44, 26, 14, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE7D8', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#B8892A', transition: 'opacity 0.5s ease', opacity: activeDots ? 1 : 0.4 }} />
                <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2C1A0E' }}>
                  PREDICTIVE PIPELINE ORCHESTRATOR
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#B8892A', background: 'rgba(184, 137, 42, 0.08)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TELEMETRY: ONLINE
              </span>
            </div>

            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: '0.9375rem', lineHeight: '1.85', color: 'rgba(44,26,14,0.85)', margin: '0 0 1.5rem 0' }}>
              The lead ingest pipeline runs on <strong style={{ fontWeight: 600 }}>IncHub LeadIntelligence ML models</strong>. Incoming records are scored, enriched, and routed dynamically to division agents. High-intent signals trigger direct Slack/Email webhooks, keeping response cycles below 4 minutes.
            </p>

            {/* Ingest Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pipelineLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F6F1E8', border: '1px solid #DDD4BE', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '6px', background: '#EDE7D8', border: '1px solid #DDD4BE' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', fontWeight: 600, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase' }}>SCORE</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem', fontWeight: 700, color: '#2C1A0E' }}>{log.score}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#2C1A0E' }}>
                        Source: {log.source}
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
                      background: log.status === 'routed' ? '#10B981' : log.status === 'evaluating' ? '#B8892A' : '#EF4444'
                    }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: log.status === 'routed' ? '#0F766E' : log.status === 'evaluating' ? '#B8892A' : '#B91C1C' }}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Pipelines Statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#EDE7D8', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A2E1A' }}>
              PIPELINE PERFORMANCE
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.01em' }}>427</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>Leads Processed (Today)</div>
              </div>
              <div style={{ width: '100%', height: '1px', background: '#DDD4BE' }} />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.01em' }}>3.2 min</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>Avg routing Latency</div>
              </div>
              <div style={{ width: '100%', height: '1px', background: '#DDD4BE' }} />
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.01em' }}>89.2%</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>SQL Conversion Rating</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A2E1A' }}>
              ROUTING GATEWAYS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#2C1A0E', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#B8892A' }} />
                WEBHOOK NOTIFICATIONS
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#2C1A0E', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#B8892A' }} />
                PREDICTIVE INTENT FILTERING
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#2C1A0E', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#B8892A' }} />
                A/B ROUTING OPTIMIZATION
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

