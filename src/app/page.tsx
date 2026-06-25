'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission, UserRole } from '@/context/PermissionContext';
import { useNotification } from '@/context/NotificationContext';
import ClientPortal from '@/components/portal/ClientPortal';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ── Interfaces ─────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  change: string | number;
  up: boolean;
  icon: React.ReactNode;
  accentColor: string;
  primaryBg: string;
}

interface TrendPoint    { period: string; revenue?: number; count?: number; }
interface StageItem     { stage: string; count: number; value: number; }
interface BudgetItem    { category: string; budget: number; actual: number; }
interface InvoiceItem   { id: string; client: string; service: string; value: string; date: string; }
interface AgingItem     { label: string; percentage: number; }
interface CustomerItem  { name: string; value?: number; amount?: number; }
interface ActivityItem  { actor: string; action: string; target: string; time: string; }
interface MeetingItem   { title: string; client: string; time: string; }
interface RepItem       { name: string; deals: number; value: number; }

interface DashboardStats {
  corporate: {
    kpiCards: Record<string, number>;
    salesGrowth: { opportunitiesByStage: StageItem[]; [k: string]: unknown };
    customerInsights: { topCustomers: CustomerItem[]; [k: string]: unknown };
    teamPerformance: { salespersonRanking: RepItem[]; [k: string]: unknown };
    activityCenter: {
      recentActivities: ActivityItem[];
      upcomingMeetings: MeetingItem[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  financial: {
    kpiCards: Record<string, number>;
    revenueAnalytics: {
      revenueTrend: TrendPoint[];
      revenueByCustomer: CustomerItem[];
      [k: string]: unknown;
    };
    collectionsPayments: {
      overdueInvoices: InvoiceItem[];
      agingReceivables: AgingItem[];
      collectionRate: number;
      [k: string]: unknown;
    };
    forecasting: { budgetVsActual: BudgetItem[]; [k: string]: unknown };
    extraExecutiveWidgets: Record<string, number | string>;
    [k: string]: unknown;
  };
}

export default function DashboardPage() {
  const { currentBrand, setCurrentBrand, role } = usePermission();
  const { showToast } = useNotification();

  const [kycAlert, setKycAlert] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    Promise.resolve().then(() =>
      setDateStr(
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).toUpperCase()
      )
    );
  }, []);

  // Fetch KYC Compliance
  useEffect(() => {
    let active = true;
    async function checkKyc() {
      try {
        interface KycItemLocal {
          name: string;
          status: string;
        }
        interface KycResponseLocal {
          success: boolean;
          data: KycItemLocal[];
        }
        const response = await get<KycResponseLocal>('/bookkeeping/kyc');
        if (active && response?.success && Array.isArray(response.data)) {
          const hasExpired = response.data.some((item) => item.status === 'expired');
          setKycAlert(hasExpired);
        }
      } catch (err) {
        console.warn('KYC check offline:', err);
      }
    }
    checkKyc();
    return () => {
      active = false;
    };
  }, []);

  // Fetch Dashboard Stats from Backend
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoadingStats(true);
        const res = await get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
        if (res?.success && res.data) {
          setStatsData(res.data);
        }
      } catch (err) {
        console.warn('Failed to load dashboard stats from backend, using fallbacks.', err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchDashboardStats();
  }, []);

  // Early return for client portal role
  if (role === UserRole.CLIENT) {
    return <ClientPortal />;
  }

  const viewMode = currentBrand;
  const setViewMode = setCurrentBrand;

  // Dual-brand theme selection
  const accentColor = viewMode === 'financial' ? 'var(--color-fs-accent)' : 'var(--color-cs-accent)';
  const primaryBg = viewMode === 'financial' ? 'var(--color-fs-primary)' : 'var(--color-cs-primary)';
  const cardBorderColor = viewMode === 'financial' ? 'var(--color-fs-border)' : 'var(--color-cs-border)';
  const brandBg = viewMode === 'financial' ? 'var(--color-fs-bg)' : 'var(--color-cs-bg)';

  // Static fallback if backend is offline
  const fallbackStats = {
    corporate: {
      kpiCards: {
        totalCustomers: 1248,
        activeCustomers: 1180,
        newCustomersThisMonth: 45,
        totalLeads: 2847,
        openOpportunities: 148,
        customerRetentionRate: 94.8,
        customerSatisfactionScore: 4.8,
        teamProductivity: 88.5,
      },
      salesGrowth: {
        salesPipelineValue: 1840000,
        leadConversionRate: 24.8,
        opportunitiesByStage: [
          { stage: 'Prospecting', count: 32, value: 420000 },
          { stage: 'Qualifying', count: 18, value: 680000 },
          { stage: 'Proposal', count: 11, value: 910000 },
          { stage: 'Negotiation', count: 6, value: 1250000 },
          { stage: 'Closing', count: 3, value: 1840000 },
        ],
        monthlyGrowthPct: 12.5,
        topPerformingTeams: [
          { team: 'Corporate Advisory A', score: 92 },
          { team: 'Licensing Team B', score: 87 },
          { team: 'PRO Relations C', score: 84 },
        ],
        customerAcquisitionTrend: [
          { period: 'Jan', count: 30 },
          { period: 'Feb', count: 35 },
          { period: 'Mar', count: 40 },
          { period: 'Apr', count: 45 },
          { period: 'May', count: 50 },
        ],
      },
      customerInsights: {
        customersByIndustry: [
          { industry: 'Technology', percentage: 35 },
          { industry: 'Logistics & Supply', percentage: 25 },
          { industry: 'Professional Services', percentage: 20 },
          { industry: 'E-commerce & Retail', percentage: 15 },
          { industry: 'Others', percentage: 5 },
        ],
        customersByRegion: [
          { region: 'DIFC Free Zone', percentage: 45 },
          { region: 'ADGM Free Zone', percentage: 28 },
          { region: 'Dubai Mainland', percentage: 18 },
          { region: 'Abu Dhabi Mainland', percentage: 9 },
        ],
        topCustomers: [
          { name: 'Sunrise Exports Providers', value: 145000 },
          { name: 'Al Jaber Group Holding', value: 120000 },
          { name: 'Silicon Oasis Technology Ltd', value: 85000 },
          { name: 'Vertex FZCO Advisory', value: 60000 },
        ],
        churnedCustomers: 12,
        customerSegmentation: [
          { segment: 'Enterprise', percentage: 15 },
          { segment: 'Mid-Market', percentage: 55 },
          { segment: 'SMB', percentage: 30 },
        ],
      },
      teamPerformance: {
        salespersonRanking: [
          { name: 'Ravi Mehta', deals: 15, value: 350000 },
          { name: 'Priya Sharma', deals: 12, value: 280000 },
          { name: 'Amit Desai', deals: 9, value: 210000 },
        ],
        tasksCompleted: 145,
        meetingsConducted: 58,
        callsMade: 342,
        activityTrend: [
          { date: 'Mon', count: 18 },
          { date: 'Tue', count: 24 },
          { date: 'Wed', count: 32 },
          { date: 'Thu', count: 28 },
          { date: 'Fri', count: 15 },
        ],
      },
      activityCenter: {
        recentActivities: [
          { actor: 'Ravi Mehta', action: 'created a new lead', target: 'TechSoft India', time: '5m ago' },
          { actor: 'Priya Sharma', action: 'moved deal to', target: 'Negotiation stage', time: '22m ago' },
          { actor: 'Amit Desai', action: 'completed task', target: 'Demo call with Acme', time: '1h ago' },
          { actor: 'Neha Kapoor', action: 'added contact', target: 'Suresh Nair at Zeon', time: '2h ago' },
        ],
        upcomingMeetings: [
          { title: 'VAT Pre-filing Session', client: 'Al Jaber Group', time: '11:00 AM - 11:45 AM' },
          { title: 'DIFC Corporate Licensing', client: 'Silicon Oasis Ltd', time: '1:30 PM - 2:15 PM' },
          { title: 'Weekly Progress Sync', client: 'Internal Team', time: '4:00 PM - 4:30 PM' },
        ],
        pendingTasks: [
          { task: 'Approve mainland MOA draft', assignee: 'Mahesh', deadline: 'Today' },
          { task: 'Upload audited statements', assignee: 'Priya Sharma', deadline: 'Tomorrow' },
          { task: 'Review tax computation checklist', assignee: 'Neha Kapoor', deadline: 'In 2 days' },
        ],
        importantNotifications: [
          { id: 'not-1', message: 'UBO declaration requires signature for Silicon Oasis', type: 'warning' },
          { id: 'not-2', message: 'Corporate tax deadline approaching for FY2025', type: 'info' },
        ],
      },
    },
    financial: {
      kpiCards: {
        totalRevenue: 1840000,
        revenueThisMonth: 240000,
        grossProfit: 1376000,
        netProfit: 964000,
        outstandingInvoicesCount: 18,
        accountsReceivable: 185000,
        accountsPayable: 65000,
        cashBalance: 1250000,
      },
      revenueAnalytics: {
        revenueTrend: [
          { period: 'Jan', revenue: 120000 },
          { period: 'Feb', revenue: 150000 },
          { period: 'Mar', revenue: 180000 },
          { period: 'Apr', revenue: 240000 },
        ],
        revenueByProduct: [
          { name: 'Licensing Fees', value: 45 },
          { name: 'Audit & Advisory Retainer', value: 30 },
          { name: 'Bookkeeping & Tax Support', value: 25 },
        ],
        revenueByCustomer: [
          { name: 'Al Jaber Group', amount: 120000 },
          { name: 'Sunrise Exports', amount: 45000 },
          { name: 'Silicon Oasis Technology', amount: 85000 },
          { name: 'Vertex FZCO', amount: 60000 },
        ],
        revenueByRegion: [
          { name: 'DIFC Free Zone', percentage: 50 },
          { name: 'ADGM Free Zone', percentage: 30 },
          { name: 'Dubai Mainland', percentage: 20 },
        ],
      },
      collectionsPayments: {
        overdueInvoices: [
          { id: 'INV-2026-042', client: 'Sunrise Exports', service: 'Jurisdiction Licensing Fee', value: 'AED 8,500.00', date: '15 June 2026' },
          { id: 'INV-2026-043', client: 'Al Jaber Group', service: 'VAT Return Filing (Q1)', value: 'AED 4,500.00', date: '14 June 2026' },
          { id: 'INV-2026-045', client: 'Vertex FZCO', service: 'Audit Engagement retainer', value: 'AED 7,500.00', date: '10 June 2026' },
        ],
        upcomingPayments: [
          { name: 'Du Telecom Services', amount: 1500, due: 'In 3 days' },
          { name: 'Office Rent Quarter Installment', amount: 45000, due: 'In 7 days' },
          { name: 'AWS Cloud Hosting', amount: 3200, due: 'In 12 days' },
        ],
        collectionRate: 92.4,
        agingReceivables: [
          { label: '0-30 Days', percentage: 70 },
          { label: '31-60 Days', percentage: 20 },
          { label: '61+ Days', percentage: 10 },
        ],
      },
      profitability: {
        grossMarginPct: 74.8,
        netMarginPct: 52.4,
        profitByCustomer: [
          { name: 'Sunrise Exports', profit: 330000 },
          { name: 'Al Jaber Group', profit: 90000 },
          { name: 'Silicon Oasis Ltd', profit: 64000 },
        ],
        profitByProduct: [
          { name: 'Licensing', profit: 410000 },
          { name: 'Advisory', profit: 280000 },
          { name: 'VAT/Bookkeeping', profit: 180000 },
        ],
      },
      forecasting: {
        revenueForecast: 650000,
        expectedCollections: 180000,
        budgetVsActual: [
          { category: 'Operating Expenses', budget: 50000, actual: 48000 },
          { category: 'Marketing & Ads', budget: 15000, actual: 16500 },
          { category: 'Software Licences', budget: 10000, actual: 9500 },
        ],
        targetsAchievement: 92,
      },
      extraExecutiveWidgets: {
        targetVsAchievement: 94,
        ebitda: 1067200,
        revenueForecastAccuracy: 95.8,
        yoyGrowth: 22.4,
        clv: 124000,
        averageDealSize: 45000,
        dso: 34,
        riskAlerts: [],
        strategicAccountsWatchlist: [
          { name: 'Al Jaber Group', health: 'Healthy' },
          { name: 'Sunrise Exports', health: 'Action Needed' },
        ],
      },
    },
  };

  const activeStats = statsData || fallbackStats;
  const isFinancial = viewMode === 'financial';
  const financialData = activeStats.financial;
  const corporateData = activeStats.corporate;
  // data is kept for KPI cards which exist on both branches
  const data = isFinancial ? activeStats.financial : activeStats.corporate;

  // Chart Global Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#2c1a0e',
        bodyColor: '#4a2e1a',
        borderColor: 'rgba(0,0,0,0.08)',
        borderWidth: 1,
        padding: 10,
        bodyFont: { family: 'Inter, sans-serif' },
        titleFont: { family: 'Inter, sans-serif', weight: 'bold' as const },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 10, family: 'Inter' } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.03)' },
        ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 10, family: 'Inter' } },
        border: { display: false }
      },
    },
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      color: primaryBg,
      transition: 'all 300ms ease',
      maxWidth: '1536px',
      margin: '0 auto',
      width: '100%',
    }}>

      {/* ── Executive Clean Header Area ── */}
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
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: isFinancial ? 'rgba(42, 22, 40, 0.5)' : 'rgba(44, 26, 14, 0.5)',
            fontFamily: 'Inter, sans-serif'
          }}>
            {dateStr || 'MONDAY, 16 JUNE 2026'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.25rem' }}>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              fontFamily: 'Cormorant, serif',
              color: 'var(--color-primary)'
            }}>
              Welcome, <span style={{ fontStyle: 'italic', color: accentColor }}>Mahesh</span>
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: kycAlert ? 'color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent)' : 'color-mix(in srgb, var(--color-success, #10b981) 10%, transparent)',
                border: `1px solid ${kycAlert ? 'color-mix(in srgb, var(--color-error, #ef4444) 20%, transparent)' : 'color-mix(in srgb, var(--color-success, #10b981) 20%, transparent)'}`,
                color: kycAlert ? 'var(--color-error, #b91c1c)' : 'var(--color-success, #047857)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: kycAlert ? 'var(--color-error, #ef4444)' : 'var(--color-success, #10b981)' }} />
              {kycAlert ? 'KYC Action Required' : 'KYC Compliant'}
            </span>
          </div>
        </div>

        {/* Dynamic Brand Tabs Switcher (aligned to right) */}
        {(role === UserRole.ADMIN || role === UserRole.CEO) && (
          <div style={{
            display: 'flex',
            background: 'var(--bg-topbar)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '0.25rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}>
            {([
              { mode: 'group', label: 'Group Overview', dot: '#B8892A' },
              { mode: 'corporate', label: 'Corporate Services', dot: '#B8892A' },
              { mode: 'financial', label: 'Financial Services', dot: '#E8760A' }
            ] as const).map(tab => (
              <button
                key={tab.mode}
                onClick={() => setViewMode(tab.mode)}
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewMode === tab.mode ? primaryBg : 'transparent',
                  color: viewMode === tab.mode ? '#ffffff' : 'var(--color-secondary)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 200ms ease',
                }}
              >
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: viewMode === tab.mode ? '#ffffff' : tab.dot,
                  display: 'inline-block'
                }} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Horizontal Quick CRM Actions Row ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-secondary)',
        }}>
          Quick CRM Actions:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { label: 'Create Lead', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> },
            { label: 'Add Contact', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
            { label: 'Log Call/Task', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> },
            { label: 'New Invoice', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
            { label: 'Compose Email', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> }
          ].map((act, i) => (
            <button
              key={i}
              onClick={() => showToast(`${act.label} widget window is coming soon.`, 'info')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.875rem',
                background: 'var(--bg-page)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = primaryBg;
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = primaryBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-page)';
                e.currentTarget.style.color = 'var(--color-primary)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              {act.icon}
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {loadingStats ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#ffffff', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: accentColor }}>Loading enterprise dashboard data...</p>
        </div>
      ) : isFinancial ? (
        /* ─── FINANCIAL SERVICES VIEW MODE ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { id: 'rev', label: 'Total Revenue', value: `AED ${(financialData.kpiCards.totalRevenue).toLocaleString()}`, change: '+22.1%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
              { id: 'prof', label: 'Gross Profit', value: `AED ${(financialData.kpiCards.grossProfit).toLocaleString()}`, change: '+18.5%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /><circle cx="12" cy="12" r="10" /></svg> },
              { id: 'ar', label: 'Accounts Receivable', value: `AED ${(financialData.kpiCards.accountsReceivable).toLocaleString()}`, change: '-5.2%', up: false, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="12" y1="4" x2="12" y2="20" /></svg> },
              { id: 'cash', label: 'Cash Balance', value: `AED ${(financialData.kpiCards.cashBalance).toLocaleString()}`, change: '+12.8%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg> }
            ].map(card => (
              <StatCard key={card.id} {...card} accentColor={accentColor} primaryBg={primaryBg} />
            ))}
          </div>

          {/* Row 2: Revenue Trend & Profit Trend (Proper Graphs) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: 260 }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Revenue Trend
              </h2>
              <div style={{ height: 180 }}>
                <Line
                  options={chartOptions}
                  data={{
                    labels: financialData.revenueAnalytics.revenueTrend.map((t: TrendPoint) => t.period),
                    datasets: [
                      {
                        fill: true,
                        label: 'Revenue',
                        data: financialData.revenueAnalytics.revenueTrend.map((t: TrendPoint) => t.revenue ?? 0),
                        borderColor: accentColor,
                        backgroundColor: 'rgba(232, 118, 10, 0.1)',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#ffffff',
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: 260 }}>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Profit Trend
              </h2>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#B8892A', display: 'inline-block' }} /> Gross Profit
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(232,118,10,0.75)', display: 'inline-block' }} /> Net Profit
                </span>
              </div>
              <div style={{ height: 155 }}>
                <Bar
                  options={chartOptions}
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                    datasets: [
                      {
                        label: 'Gross Profit',
                        data: [120000 * 0.74, 150000 * 0.74, 180000 * 0.74, 240000 * 0.74],
                        backgroundColor: '#B8892A',
                        borderRadius: 4,
                      },
                      {
                        label: 'Net Profit',
                        data: [120000 * 0.52, 150000 * 0.52, 180000 * 0.52, 240000 * 0.52],
                        backgroundColor: 'rgba(232, 118, 10, 0.75)',
                        borderRadius: 4,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Cash Flow & Budget vs Actual */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: 260 }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Cash Flow Forecast
              </h2>
              <div style={{ height: 180 }}>
                <Line
                  options={chartOptions}
                  data={{
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [
                      {
                        fill: true,
                        label: 'Cash Flow',
                        data: [1100000, 1350000, 1500000, 1840000],
                        borderColor: accentColor,
                        backgroundColor: 'rgba(232, 118, 10, 0.06)',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#ffffff',
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: 260 }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Budget vs Actual Expenses
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem', marginTop: '0.5rem' }}>
                {financialData.forecasting.budgetVsActual.map((item: BudgetItem, i: number) => {
                  const pct = Math.min((item.actual / item.budget) * 100, 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                        <span style={{ color: 'rgba(0,0,0,0.7)' }}>{item.category}</span>
                        <span style={{ color: primaryBg }}>AED {item.actual.toLocaleString()} / {item.budget.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-page)', borderRadius: 9, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct > 95 ? 'var(--color-error)' : accentColor, borderRadius: 9 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 4: Overdue Invoices & Collection Forecast */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Overdue Collections Registry
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>INVOICE ID</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>CLIENT</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>AMOUNT</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>DUE DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.collectionsPayments.overdueInvoices.map((inv: InvoiceItem, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--color-error)' }}>{inv.id}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{inv.client}</span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)' }}>{inv.service}</span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{inv.value}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-error)', fontWeight: 600 }}>{inv.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Receivables Aging & Collections
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-page)', padding: '0.75rem', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Collection Efficiency Rate</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-success)' }}>{financialData.collectionsPayments.collectionRate}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {financialData.collectionsPayments.agingReceivables.map((age: AgingItem, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(0,0,0,0.7)', marginRight: '1rem' }}>{age.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                        <div style={{ height: 6, width: 80, background: 'var(--bg-page)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${age.percentage}%`, background: accentColor }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, width: 30, textAlign: 'right' }}>{age.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Top Customers by Revenue */}
          <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
              Top Client Billings by Annual Revenue Contribution
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {financialData.revenueAnalytics.revenueByCustomer.map((cust: CustomerItem, idx: number) => (
                <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--bg-page)' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>Rank #{idx + 1}</span>
                  <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: primaryBg, margin: '0.25rem 0' }}>{cust.name}</span>
                  <span style={{ display: 'block', fontSize: '1.125rem', fontWeight: 300, color: accentColor, fontFamily: 'Cormorant, serif' }}>AED {(cust.amount ?? 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Executive Widgets Drawer */}
          <div style={{ background: brandBg, border: `1px dashed ${accentColor}`, borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
              Enterprise Performance Indicators (EBITDA &amp; CLV Console)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Operating EBITDA</span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700 }}>AED {financialData.extraExecutiveWidgets.ebitda.toLocaleString()}</p>
              </div>
              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>CLV (Customer Lifetime Value)</span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700 }}>AED {financialData.extraExecutiveWidgets.clv.toLocaleString()}</p>
              </div>
              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>YoY Growth</span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>+{financialData.extraExecutiveWidgets.yoyGrowth}%</p>
              </div>
              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>DSO (Days Sales Outstanding)</span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700 }}>{financialData.extraExecutiveWidgets.dso} Days</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ─── CORPORATE ADVISORY / GROUP SERVICES VIEW MODE ─── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {[
              { id: 'custs', label: 'Active Customers', value: corporateData.kpiCards.activeCustomers, change: '+12.5%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
              { id: 'leads', label: 'Total Leads', value: corporateData.kpiCards.totalLeads, change: '+4.3%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /></svg> },
              { id: 'opps', label: 'Open Opportunities', value: corporateData.kpiCards.openOpportunities, change: '+9.2%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /></svg> },
              { id: 'ret', label: 'Customer Retention Rate', value: `${corporateData.kpiCards.customerRetentionRate}%`, change: '+1.8% vs last Mo', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> }
            ].map(card => (
              <StatCard key={card.id} {...card} accentColor={accentColor} primaryBg={primaryBg} />
            ))}
          </div>

          {/* Row 2: Sales Funnel (Centred Funnel UI) & Customer Growth Trend (Proper Graphs) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Sales Funnel Conversion
              </h2>
              {/* Center aligned horizontal custom funnel to avoid text wrapping */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', alignItems: 'center', padding: '0.5rem 0' }}>
                {[
                  { stage: 'Prospecting', pct: 100, val: 'AED 420K' },
                  { stage: 'Qualifying', pct: 85, val: 'AED 680K' },
                  { stage: 'Proposal', pct: 70, val: 'AED 910K' },
                  { stage: 'Negotiation', pct: 55, val: 'AED 1.25M' },
                  { stage: 'Closing', pct: 35, val: 'AED 1.84M' }
                ].map((f, i) => (
                  <div key={i} style={{
                    width: `${f.pct}%`,
                    background: `linear-gradient(90deg, ${primaryBg} 0%, ${accentColor} 100%)`,
                    borderRadius: 6,
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    whiteSpace: 'nowrap',
                  }}>
                    <span>{f.stage}</span>
                    <span>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: 260 }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Customer Acquisition Growth
              </h2>
              <div style={{ height: 180 }}>
                <Line
                  options={chartOptions}
                  data={{
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [
                      {
                        label: 'Acquisition Growth',
                        data: [30, 48, 75, 110],
                        borderColor: accentColor,
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: accentColor,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Lead Sources & Opportunity Stages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: 260 }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Lead Intake Sources
              </h2>
              <div style={{ height: 180, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'right',
                        labels: { boxWidth: 10, font: { size: 9, family: 'Inter' } }
                      }
                    }
                  }}
                  data={{
                    labels: ['Website', 'LinkedIn', 'Referrals', 'Partners'],
                    datasets: [
                      {
                        data: [45, 28, 18, 9],
                        backgroundColor: ['#B8892A', '#E8760A', '#2C1A0E', '#6B3F22'],
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Opportunity Stages Distribution
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {corporateData.salesGrowth.opportunitiesByStage.map((opp: StageItem, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600 }}>{opp.stage}</span>
                    <div style={{ display: 'flex', gap: '1rem', color: 'rgba(0,0,0,0.5)' }}>
                      <span>{opp.count} deals</span>
                      <strong style={{ color: primaryBg }}>AED {opp.value.toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Top Customers & Team Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Strategic Accounts Watchlist
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>ACCOUNT NAME</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>CONTRIBUTED VALUE</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>RELATIONSHIP OWNER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {corporateData.customerInsights.topCustomers.map((cust: CustomerItem, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{cust.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>AED {(cust.value ?? 0).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(0,0,0,0.6)' }}>Ravi Mehta</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Sales Team Performance
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {corporateData.teamPerformance.salespersonRanking.map((rep: RepItem, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ width: 18, height: 18, background: accentColor, borderRadius: '50%', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>{idx+1}</span>
                      <span style={{ fontWeight: 600 }}>{rep.name}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{rep.deals} Deals</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Recent Activities & Upcoming Tasks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Operational Activity Stream
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {corporateData.activityCenter.recentActivities.map((act: ActivityItem, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid rgba(0,0,0,0.02)', paddingBottom: '0.5rem' }}>
                    <span>
                      <strong style={{ fontWeight: 600 }}>{act.actor}</strong> {act.action} <span style={{ color: accentColor, fontWeight: 600 }}>{act.target}</span>
                    </span>
                    <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
                Upcoming Briefings &amp; Tasks
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {corporateData.activityCenter.upcomingMeetings.map((meet: MeetingItem, idx: number) => (
                  <div key={idx} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-page)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{meet.title}</span>
                      <span style={{ color: accentColor }}>{meet.time}</span>
                    </div>
                    <div style={{ color: 'rgba(0,0,0,0.5)', marginTop: '0.15rem' }}>{meet.client}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/* ── KPI Stat Card Sub-Component ── */
function StatCard({ label, value, change, up, icon, accentColor, primaryBg }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: `1px solid var(--border-subtle)`,
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: hovered 
          ? `0 12px 24px -6px color-mix(in srgb, ${accentColor} 12%, transparent)`
          : '0 2px 8px rgba(0, 0, 0, 0.01)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        borderColor: hovered ? accentColor : 'var(--border-subtle)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: `color-mix(in srgb, ${accentColor} 6%, transparent)`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: up ? 'color-mix(in srgb, #276749 12%, transparent)' : 'color-mix(in srgb, #9B2C2C 12%, transparent)',
            color: up ? '#276749' : '#9B2C2C',
          }}
        >
          {change}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '1.875rem', fontWeight: 300, letterSpacing: '-0.02em', color: primaryBg, fontFamily: 'Cormorant, serif' }}>
          {value}
        </p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </p>
      </div>
    </div>
  );
}
