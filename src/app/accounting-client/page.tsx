'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

const TrendArrow = ({ up }: { up: boolean }) => (
  <span style={{ color: up ? '#10b981' : '#ef4444', display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem' }}>
    {up ? '▲' : '▼'}
  </span>
);

export default function AccountingDashboardPage() {
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
          setStage(7); // FORCED FOR UI REVIEW
        }
      } catch (e) {
        setStage(7); // FORCED FOR UI REVIEW
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
    return <LoadingScreen message="Loading financial data..." />;
  }

  // EMPTY STATE (Stage 1-6)
  if (stage < 7) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '1536px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '1rem'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        </div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: primaryBg }}>
          Accounting Not Initiated
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your accounting dashboard will be activated here once your first monthly reporting cycle is completed by the team.
        </p>
      </div>
    );
  }

  // Financial Formatting Utility
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(amount);
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
            Accounting & Finance
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
              Accounting Dashboard
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select style={{
            padding: '0.625rem 1rem', background: 'var(--bg-page)', color: primaryBg,
            border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', outline: 'none'
          }}>
            <option>June 2026</option>
            <option>May 2026</option>
            <option>April 2026</option>
          </select>
          
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

      {/* Key Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)' }}>Transaction Count</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: primaryBg }}>142</p>
            <TrendArrow up={true} />
          </div>
        </div>
        
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)' }}>Monthly Turnover</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: primaryBg, fontFamily: 'monospace' }}>{formatMoney(315000)}</p>
            <TrendArrow up={true} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)' }}>Net P&L (Monthly)</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#10b981', fontFamily: 'monospace' }}>+{formatMoney(84500)}</p>
            <TrendArrow up={false} />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)' }}>Fees Received Status</p>
          <p style={{ margin: 0 }}>
            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              Paid
            </span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '1.5rem' }}>
        {/* P&L Statement Table */}
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '1.25rem', borderBottom: `1px solid ${cardBorderColor}`, background: 'var(--bg-page)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Profit & Loss Summary</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <tbody>
              {/* Revenue */}
              <tr>
                <td colSpan={2} style={{ padding: '1rem', fontWeight: 700, color: primaryBg, background: 'rgba(0,0,0,0.02)' }}>Revenue</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Sales / Services</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: primaryBg }}>{formatMoney(315000)}</td>
              </tr>
              <tr style={{ borderBottom: `2px solid ${cardBorderColor}` }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: primaryBg }}>Total Revenue</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: primaryBg }}>{formatMoney(315000)}</td>
              </tr>
              
              {/* Expenses */}
              <tr>
                <td colSpan={2} style={{ padding: '1rem', fontWeight: 700, color: primaryBg, background: 'rgba(0,0,0,0.02)' }}>Expenses</td>
              </tr>
              <tr style={{ borderBottom: `1px dashed ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Cost of Goods Sold (COGS)</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(0,0,0,0.8)' }}>{formatMoney(120000)}</td>
              </tr>
              <tr style={{ borderBottom: `1px dashed ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Payroll & Salaries</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(0,0,0,0.8)' }}>{formatMoney(85000)}</td>
              </tr>
              <tr style={{ borderBottom: `1px dashed ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Operating Expenses</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(0,0,0,0.8)' }}>{formatMoney(25500)}</td>
              </tr>
              <tr style={{ borderBottom: `2px solid ${cardBorderColor}` }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: primaryBg }}>Total Expenses</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: primaryBg }}>{formatMoney(230500)}</td>
              </tr>

              {/* Net Profit */}
              <tr style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: primaryBg, fontSize: '1rem' }}>Net Profit</td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#10b981', fontSize: '1.125rem' }}>{formatMoney(84500)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Compliance Filings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>VAT Filing Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-page)', borderRadius: '6px', border: `1px solid ${cardBorderColor}` }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: primaryBg }}>Q2 2026 (Apr - Jun)</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Due Date: July 28, 2026</p>
              </div>
              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                Pending
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: `1px solid ${cardBorderColor}` }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: primaryBg }}>Q1 2026 (Jan - Mar)</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Filed on: April 15, 2026</p>
              </div>
              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                Filed
              </span>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Corporate Tax Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-page)', borderRadius: '6px', border: `1px solid ${cardBorderColor}` }}>
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: primaryBg }}>FY 2025</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Due Date: September 30, 2026</p>
              </div>
              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                In Preparation
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
