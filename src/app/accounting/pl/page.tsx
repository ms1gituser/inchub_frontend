'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AnnualPlPage() {
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
    return <LoadingScreen message="Loading annual summary..." />;
  }

  // EMPTY STATE
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
          Annual P&L Not Available
        </h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.5 }}>
          Your annual P&L summary will appear here after your corporate tax return is submitted and finalized for the financial year.
        </p>
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(amount);
  };

  // Mock monthly data for CSS chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = [120, 150, 180, 140, 210, 250, 230, 280, 260, 310, 340, 390]; // scaled
  const expenseData = [80, 90, 110, 95, 120, 140, 135, 160, 150, 180, 200, 220]; // scaled
  const maxVal = 400; // arbitrary max for scaling

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
              Annual P&L Summary
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select style={{
            padding: '0.625rem 1rem', background: 'var(--bg-page)', color: primaryBg,
            border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', outline: 'none'
          }}>
            <option>FY 2025</option>
            <option>FY 2024</option>
          </select>
          
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1rem', background: '#ffffff', color: primaryBg,
            border: `1px solid ${cardBorderColor}`, borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 200ms ease'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Annual PDF
          </button>
        </div>
      </div>

      {/* CT Confirmation Banner */}
      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#047857', fontWeight: 500 }}>
          <strong>Corporate Tax Filing Confirmed:</strong> Filed on October 12, 2026. Ref No: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>CT-982133</span>. This P&L represents the final, authoritative view for FY 2025.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '1.5rem' }}>
        
        {/* Consolidated P&L Statement Table */}
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '1.25rem', borderBottom: `1px solid ${cardBorderColor}`, background: 'var(--bg-page)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>FY 2025 Profit & Loss Summary</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <tbody>
              {/* Revenue */}
              <tr>
                <td colSpan={2} style={{ padding: '1rem', fontWeight: 700, color: primaryBg, background: 'rgba(0,0,0,0.02)' }}>Revenue</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Sales / Services</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: primaryBg }}>{formatMoney(2860000)}</td>
              </tr>
              <tr style={{ borderBottom: `2px solid ${cardBorderColor}` }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: primaryBg }}>Total Revenue</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: primaryBg }}>{formatMoney(2860000)}</td>
              </tr>
              
              {/* Expenses */}
              <tr>
                <td colSpan={2} style={{ padding: '1rem', fontWeight: 700, color: primaryBg, background: 'rgba(0,0,0,0.02)' }}>Expenses</td>
              </tr>
              <tr style={{ borderBottom: `1px dashed ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Cost of Goods Sold (COGS)</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(0,0,0,0.8)' }}>{formatMoney(1050000)}</td>
              </tr>
              <tr style={{ borderBottom: `1px dashed ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Payroll & Salaries</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(0,0,0,0.8)' }}>{formatMoney(620000)}</td>
              </tr>
              <tr style={{ borderBottom: `1px dashed ${cardBorderColor}` }}>
                <td style={{ padding: '0.75rem 1rem 0.75rem 2rem', color: 'rgba(0,0,0,0.7)' }}>Operating Expenses</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'monospace', color: 'rgba(0,0,0,0.8)' }}>{formatMoney(245000)}</td>
              </tr>
              <tr style={{ borderBottom: `2px solid ${cardBorderColor}` }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: primaryBg }}>Total Expenses</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: primaryBg }}>{formatMoney(1915000)}</td>
              </tr>

              {/* Net Profit */}
              <tr style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: primaryBg, fontSize: '1rem' }}>Net Profit (Subject to Tax)</td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#10b981', fontSize: '1.125rem' }}>{formatMoney(945000)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CSS Bar Chart */}
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: 600, color: primaryBg, fontFamily: 'var(--font-serif)' }}>Revenue vs Expenses Trend</h3>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', position: 'relative', paddingBottom: '2rem' }}>
            {/* Y-axis lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ position: 'absolute', bottom: `${(i / 4) * 100}%`, left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.05)', zIndex: 0 }}></div>
            ))}
            
            {months.map((month, idx) => {
              const revHeight = (revenueData[idx] / maxVal) * 100;
              const expHeight = (expenseData[idx] / maxVal) * 100;
              return (
                <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', zIndex: 1, height: '200px', justifyContent: 'flex-end', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100%' }}>
                    <div style={{ width: '8px', height: `${revHeight}%`, background: primaryBg, borderRadius: '2px 2px 0 0' }}></div>
                    <div style={{ width: '8px', height: `${expHeight}%`, background: accentColor, borderRadius: '2px 2px 0 0' }}></div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>{month}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${cardBorderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: primaryBg, borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: accentColor, borderRadius: '2px' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>Expenses</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
