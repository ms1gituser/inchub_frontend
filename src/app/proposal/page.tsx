'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProposalPage() {
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
    return <LoadingScreen message="Loading your proposal..." />;
  }

  // EMPTY STATE (Stage 1-2)
  if (stage < 3) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Proposal Pending
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your personalised proposal will appear here once it has been prepared and sent to you following our consultation.
        </p>
      </div>
    );
  }

  const isApproved = stage >= 4;

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
            Proposal & Payments
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Your Proposal
            </h1>
            <span style={{
              padding: '0.375rem 0.625rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: isApproved ? '#10b981' : '#f59e0b',
              border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
            }}>
              {isApproved ? 'Approved' : 'Sent — Awaiting Approval'}
            </span>
          </div>
        </div>
        
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isApproved && (
            <>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1rem', background: 'transparent', color: primaryBg,
                border: `1px solid ${primaryBg}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 200ms ease'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Edit Proposal
              </button>
            </>
          )}
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1rem', background: '#ffffff', color: primaryBg,
            border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 200ms ease'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download PDF
          </button>
        </div>
      </div>

      <p style={{ margin: '-0.5rem 0 0.5rem', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)', fontFamily: 'Inter, sans-serif' }}>
        {isApproved 
          ? 'This proposal was approved on June 27, 2026. A permanently archived copy is available for download.'
          : 'Please review the personalized services and fees proposed for your business setup.'}
      </p>

      {/* Document View */}
      <div style={{
        background: '#ffffff',
        border: `1px solid ${cardBorderColor}`,
        borderRadius: '8px',
        padding: '3rem 4rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        {/* Doc Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${primaryBg}`, paddingBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Engagement Letter</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'rgba(0,0,0,0.6)' }}>Reference: EL-2026-0626</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: primaryBg }}>IncHub Advisory</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>Dubai, United Arab Emirates</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)' }}>Date: June 26, 2026</p>
          </div>
        </div>

        {/* Services Included */}
        <section>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryBg }}>
            1. Services Included
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(0,0,0,0.8)', fontSize: '0.9375rem', lineHeight: 1.8 }}>
            <li>Company Registration and Licensing in DMCC Free Zone.</li>
            <li>Drafting of Memorandum and Articles of Association (MOA/AOA).</li>
            <li>Assistance with Corporate Bank Account opening (Emirates NBD).</li>
            <li>Processing of 2 UAE Residency Visas (Investor & Employee).</li>
            <li>12 months of local registered address and flexi-desk facility.</li>
          </ul>
        </section>

        {/* Fee Breakdown */}
        <section>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryBg }}>
            2. Fee Breakdown
          </h4>
          <div style={{ border: `1px solid ${cardBorderColor}`, borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: `1px solid ${cardBorderColor}` }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: primaryBg }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: primaryBg }}>Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${cardBorderColor}` }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'rgba(0,0,0,0.8)' }}>DMCC License & Registration Fees</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(0,0,0,0.8)' }}>20,000</td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${cardBorderColor}` }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'rgba(0,0,0,0.8)' }}>IncHub Professional Service Fee</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(0,0,0,0.8)' }}>5,000</td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${cardBorderColor}` }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'rgba(0,0,0,0.8)' }}>Visa Processing (x2)</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'rgba(0,0,0,0.8)' }}>8,000</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ background: '#fafafa' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: primaryBg, textAlign: 'right' }}>Total (excluding VAT)</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: primaryBg, fontSize: '1rem' }}>AED 33,000</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Terms */}
        <section>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: primaryBg }}>
            3. Terms & Validity
          </h4>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
            This proposal is valid for 14 days from the date of issue (until July 10, 2026). Standard government fees are subject to change without prior notice. 
            By approving this proposal, you agree to IncHub&apos;s standard terms of service.
          </p>
        </section>

      </div>
    </div>
  );
}
