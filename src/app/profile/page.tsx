'use client';

import React, { useEffect, useState } from 'react';

export default function ProfilePage() {
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
          System Settings • User Identity
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 700, color: '#2C1A0E', letterSpacing: '-0.02em', fontFamily: 'Cormorant, serif' }}>
          Identity & <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>Security</span> Credentials
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        
        {/* Telemetry Panel */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(44, 26, 14, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EDE7D8', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#B8892A', transition: 'opacity 0.5s ease', opacity: activeDots ? 1 : 0.4 }} />
              <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2C1A0E' }}>
                IDENTITY & CRYPTOGRAPHIC ACCESS CONTROL
              </h3>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#B8892A', background: 'rgba(184, 137, 42, 0.08)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SESSION: VALIDATED
            </span>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: '0.9375rem', lineHeight: '1.85', color: 'rgba(44,26,14,0.85)', margin: '0 0 1.5rem 0' }}>
            User profiles are managed under <strong style={{ fontWeight: 600 }}>Zero-Trust Auth Endpoints</strong>. Security certificates, cryptographic tokens, and role-based permissions are synchronized in real-time to defend session cookies against token-theft and hijack attempts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#F6F1E8', border: '1px solid #DDD4BE', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)' }}>ENCRYPTED</div>
                <div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#2C1A0E' }}>Hardware Token Signature Key</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', marginTop: '0.15rem' }}>Verifying WebAuthn hardware parameters for current workstation.</div>
                </div>
              </div>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B8892A' }} />
            </div>
          </div>
        </div>

        {/* Side Stats */}
        <div style={{ background: '#EDE7D8', border: '1px solid #DDD4BE', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4A2E1A' }}>
            AUTHENTICATION LOGS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E' }}>256-bit</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AES Key Length</div>
            </div>
            <div style={{ width: '100%', height: '1px', background: '#DDD4BE' }} />
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#2C1A0E' }}>0 issues</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 500, color: 'rgba(44,26,14,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Security Alerts</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

