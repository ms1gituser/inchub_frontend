/* eslint-disable */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import {
  useGetStatsQuery,
  useGetListsQuery,
  useGetActivitiesQuery,
  useLazySearchWorkspaceQuery,
  useGetFilterOptionsQuery
} from '@/lib/accoutingdashboradapiclient';

export default function DashboardTab() {
  const router = useRouter();

  const handleActionClick = (actionName: string) => {
    switch (actionName) {
      case 'Add New Client':
        router.push('/accounting?tab=client-list&action=add-client');
        break;
      case 'Upload Documents':
        router.push('/accounting?tab=ai-queue&action=upload');
        break;
      case 'AI Bookkeeping Queue':
        router.push('/accounting?tab=ai-queue');
        break;
      case 'Reconciliation Center':
        router.push('/accounting?tab=reconciliation');
        break;
      case 'VAT Center':
        router.push('/accounting?tab=vat');
        break;
      case 'CT Filings':
        router.push('/accounting?tab=corporate-tax');
        break;
      case 'Reports':
        router.push('/accounting?tab=reports');
        break;
      case 'QBO Sync Log':
        router.push('/accounting?tab=quickbooks');
        break;
      default:
        break;
    }
  };

  const [monthsDropdownOpen, setMonthsDropdownOpen] = React.useState(false);
  const [selectedMonths, setSelectedMonths] = React.useState('Last 5 Months');

  // Simulation state for loading / empty / error / permission states
  const [dashboardState, setDashboardState] = React.useState<'loaded' | 'loading' | 'empty' | 'error' | 'denied'>('loaded');

  const [searchQuery, setSearchQuery] = React.useState('');

  // Filters State
  const [clientFilter, setClientFilter] = React.useState('All Clients');
  const [managerFilter, setManagerFilter] = React.useState('All Managers');
  const [bookkeeperFilter, setBookkeeperFilter] = React.useState('All Bookkeepers');
  const [countryFilter, setCountryFilter] = React.useState('All Countries');
  const [entityFilter, setEntityFilter] = React.useState('All Entities');
  const [industryFilter, setIndustryFilter] = React.useState('All Industries');
  const [dateFilter, setDateFilter] = React.useState('This Month');
  const [fyFilter, setFyFilter] = React.useState('FY 2026');
  const [complianceFilter, setComplianceFilter] = React.useState('All Statuses');
  const [qboFilter, setQboFilter] = React.useState('All Statuses');

  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const filters = {
    client: clientFilter,
    manager: managerFilter,
    bookkeeper: bookkeeperFilter,
    country: countryFilter,
    entityType: entityFilter,
    industry: industryFilter,
    dateRange: dateFilter,
    fy: fyFilter,
    compliance: complianceFilter,
    qbo: qboFilter,
    months: selectedMonths
  };

  // RTK Query hooks
  const { data: statsRes, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useGetStatsQuery(filters);
  const { data: listsRes, isLoading: listsLoading, isError: listsError, refetch: refetchLists } = useGetListsQuery(filters);
  const { data: activitiesRes, refetch: refetchActivities } = useGetActivitiesQuery({ page: 1, limit: 5 });
  const [triggerSearch, { data: searchRes }] = useLazySearchWorkspaceQuery();
  const { data: filterOptionsRes } = useGetFilterOptionsQuery();

  const stats = statsRes?.data;
  const lists = listsRes?.data;
  const activities = activitiesRes?.data || [];
  const searchResults = searchRes?.data;
  const filterOptions = filterOptionsRes?.data;

  // Dynamic filter lists derived from backend DB
  const clientOptions = ['All Clients', ...(filterOptions?.clients?.map((c: any) => c.name) || [])];
  const managerOptions = ['All Managers', ...(filterOptions?.managers || [])];
  const bookkeeperOptions = ['All Bookkeepers', ...(filterOptions?.bookkeepers || [])];
  const countryOptions = ['All Countries', ...(filterOptions?.countries || [])];
  const entityOptions = ['All Entities', ...(filterOptions?.entities || [])];
  const industryOptions = ['All Industries', ...(filterOptions?.industries || [])];


  // Sync dashboard State
  React.useEffect(() => {
    if (statsLoading || listsLoading) {
      setDashboardState('loading');
    } else if (statsError || listsError) {
      setDashboardState('error');
    } else {
      setDashboardState('loaded');
    }
  }, [statsLoading, listsLoading, statsError, listsError]);

  React.useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 1) {
      const delayDebounceFn = setTimeout(() => {
        triggerSearch(searchQuery);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, triggerSearch]);

  const fetchDashboardData = () => {
    refetchStats();
    refetchLists();
    refetchActivities();
  };

  const filterConfigs = [
    { label: 'Client Scope', key: 'client', value: clientFilter, setter: setClientFilter, options: clientOptions },
    { label: 'Manager', key: 'manager', value: managerFilter, setter: setManagerFilter, options: managerOptions },
    { label: 'Bookkeeper', key: 'bookkeeper', value: bookkeeperFilter, setter: setBookkeeperFilter, options: bookkeeperOptions },
    { label: 'Country', key: 'country', value: countryFilter, setter: setCountryFilter, options: countryOptions },
    { label: 'Entity Type', key: 'entity', value: entityFilter, setter: setEntityFilter, options: entityOptions },
    { label: 'Industry', key: 'industry', value: industryFilter, setter: setIndustryFilter, options: industryOptions },
    { label: 'Date Range', key: 'date', value: dateFilter, setter: setDateFilter, options: ['This Month', 'Last Month', 'This Quarter', 'This Year'] },
    { label: 'Financial Year', key: 'fy', value: fyFilter, setter: setFyFilter, options: ['FY 2026', 'FY 2025', 'FY 2024'] },
    { label: 'Compliance', key: 'compliance', value: complianceFilter, setter: setComplianceFilter, options: ['All Statuses', 'Compliant', 'At Risk', 'Non-Compliant'] },
    { label: 'QuickBooks', key: 'qbo', value: qboFilter, setter: setQboFilter, options: ['All Statuses', 'Connected', 'Error', 'Disconnected'] },
  ];


  // Popup & Search States
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const trendData = stats?.monthlyTrend || [];
  const maxVal = Math.max(...trendData.map((d: any) => Math.max(d.completed || 0, d.pending || 0, d.overdue || 0)), 1);

  const completedPath = trendData.length > 0 
    ? 'M' + trendData.map((d: any, i: number) => `${10 + i * (280 / Math.max(trendData.length - 1, 1))},${90 - ((d.completed || 0) / maxVal) * 80}`).join(' L')
    : 'M10,90 L290,90';

  const pendingPath = trendData.length > 0 
    ? 'M' + trendData.map((d: any, i: number) => `${10 + i * (280 / Math.max(trendData.length - 1, 1))},${90 - ((d.pending || 0) / maxVal) * 80}`).join(' L')
    : 'M10,90 L290,90';

  const overduePath = trendData.length > 0 
    ? 'M' + trendData.map((d: any, i: number) => `${10 + i * (280 / Math.max(trendData.length - 1, 1))},${90 - (((d.overdue || 0)) / maxVal) * 80}`).join(' L')
    : 'M10,90 L290,90';

  const lastPoint = trendData[trendData.length - 1] || { period: 'No Data', completed: 0, pending: 0, overdue: 0 };

  // Books Completion calculations
  const completedVal = stats?.bookkeepingOverview?.completed || 0;
  const inProgressVal = stats?.bookkeepingOverview?.inProgress || 0;
  const pendingVal = stats?.bookkeepingOverview?.pending || 0;
  const overdueVal = stats?.bookkeepingOverview?.overdue || 0;
  const totalBooks = completedVal + inProgressVal + pendingVal + overdueVal || 1;

  const completedPct = Math.round((completedVal / totalBooks) * 100);
  const inProgressPct = Math.round((inProgressVal / totalBooks) * 100);
  const pendingPct = Math.round((pendingVal / totalBooks) * 100);
  const overduePct = Math.max(0, 100 - completedPct - inProgressPct - pendingPct);

  // Compliance calculations
  const compliantVal = stats?.kpiCards?.totalClients ? Math.max(0, stats.kpiCards.totalClients - (stats.kpiCards.kycExpiring || 0)) : 0;
  const atRiskVal = 0;
  const nonCompliantVal = stats?.kpiCards?.kycExpiring || 0;
  const totalComp = compliantVal + atRiskVal + nonCompliantVal || 1;

  const compliantPct = Math.round((compliantVal / totalComp) * 100);
  const atRiskPct = Math.round((atRiskVal / totalComp) * 100);
  const nonCompliantPct = Math.max(0, 100 - compliantPct - atRiskPct);

  return (
    <div style={{
      color: '#2A1628',
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      background: 'transparent',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <style dangerouslySetInnerHTML={{ __html: ` // nosec
          .dashboard-kpi-grid {
            grid-template-columns: repeat(7, 1fr);
          }
          .dashboard-charts-grid {
            grid-template-columns: 1fr 1.3fr 1fr;
          }
          .dashboard-lists-grid {
            grid-template-columns: 1.1fr 1.1fr 1.1fr 1fr;
          }
          .dashboard-insights-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-team-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-docs-grid {
            grid-template-columns: repeat(7, 1fr) !important;
          }
          .dashboard-ai-grid {
            grid-template-columns: repeat(7, 1fr) !important;
          }
          .dashboard-alerts-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-performance-grid {
            grid-template-columns: 1fr !important;
          }
  
          .dashboard-filters-row {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 0.25rem !important;
          }
          .dashboard-filters-row select {
            width: 100%;
            min-width: 0;
            padding: 0.35rem 1.25rem 0.35rem 0.5rem !important;
            font-size: 0.725rem !important;
            color: #2A1628 !important;
            background-color: #FAF8F5 !important;
            border: 1px solid #DDD0C4 !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            outline: none !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23E8760A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
            background-repeat: no-repeat !important;
            background-position: right 0.35rem center !important;
            background-size: 0.6rem !important;
            transition: all 120ms ease !important;
          }
          .dashboard-filters-row select:hover {
            border-color: #E8760A !important;
            background-color: #ffffff !important;
          }
          .dashboard-filters-row select:focus {
            border-color: #E8760A !important;
            box-shadow: 0 0 0 2px rgba(232, 118, 10, 0.15) !important;
          }
          .dashboard-lists-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
          }
          .dashboard-lists-grid > div {
            padding: 0.75rem 0.5rem !important;
          }
          .dashboard-lists-grid h4 {
            font-size: 0.65rem !important;
            letter-spacing: 0.05em !important;
          }
          .dashboard-lists-grid select,
          .dashboard-lists-grid span,
          .dashboard-lists-grid div {
            font-size: 0.7rem !important;
          }
          .dashboard-lists-grid button span {
            font-size: 0.55rem !important;
            letter-spacing: 0.02em !important;
            line-height: 1.1 !important;
          }
  
          .dashboard-row1-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          .dashboard-row2-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-row3-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .dashboard-row4-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .dashboard-docs-grid {
            grid-template-columns: repeat(7, 1fr) !important;
            gap: 0.75rem !important;
          }
  
          @media (max-width: 1650px) {
            .dashboard-kpi-grid { grid-template-columns: repeat(7, 1fr); }
            .dashboard-docs-grid { grid-template-columns: repeat(7, 1fr) !important; }
            .dashboard-ai-grid { grid-template-columns: repeat(7, 1fr); }
            .dashboard-lists-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            .dashboard-row1-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .dashboard-row2-grid { grid-template-columns: 1fr !important; }
            .dashboard-row3-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .dashboard-row4-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .dashboard-charts-grid { grid-template-columns: 1fr 1.3fr 1fr; }
            .dashboard-filters-row { grid-template-columns: repeat(10, 1fr); }
          }
          @media (max-width: 1350px) {
            .dashboard-filters-row { grid-template-columns: repeat(10, 1fr); }
            .dashboard-lists-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            .dashboard-row1-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .dashboard-row2-grid { grid-template-columns: 1fr !important; }
            .dashboard-row3-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .dashboard-row4-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 1250px) {
            .dashboard-kpi-grid { grid-template-columns: repeat(7, 1fr); }
            .dashboard-ai-grid { grid-template-columns: repeat(7, 1fr); }
            .dashboard-charts-grid { grid-template-columns: 1fr 1.3fr 1fr; }
            .dashboard-lists-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            .dashboard-row1-grid { grid-template-columns: 1fr !important; }
            .dashboard-row2-grid { grid-template-columns: 1fr !important; }
            .dashboard-row3-grid { grid-template-columns: 1fr !important; }
            .dashboard-row4-grid { grid-template-columns: 1fr !important; }
            .dashboard-filters-row { grid-template-columns: repeat(5, 1fr); }
          }
          @media (max-width: 1100px) {
            .dashboard-kpi-grid { grid-template-columns: repeat(4, 1fr); }
            .dashboard-ai-grid { grid-template-columns: repeat(4, 1fr); }
            .dashboard-charts-grid { grid-template-columns: 1fr; }
            .dashboard-lists-grid { grid-template-columns: 1fr 1fr !important; }
            .dashboard-filters-row { grid-template-columns: repeat(5, 1fr); }
          }
          @media (max-width: 768px) {
            .dashboard-kpi-grid { grid-template-columns: repeat(2, 1fr); }
            .dashboard-ai-grid { grid-template-columns: repeat(2, 1fr); }
            .dashboard-lists-grid { grid-template-columns: 1fr !important; }
            .dashboard-docs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .dashboard-filters-row { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 480px) {
            .dashboard-kpi-grid { grid-template-columns: 1fr; }
            .dashboard-docs-grid { grid-template-columns: 1fr; }
            .dashboard-ai-grid { grid-template-columns: 1fr; }
            .dashboard-filters-row { grid-template-columns: 1fr; }
          }
        ` }} />
      
      {/* ── HEADER SECTION ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '1rem',
        borderBottom: '1px solid #DDD0C4',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
               Accounting Operations
            </p>
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 300,
            color: '#2A1628',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-serif), Georgia, serif'
          }}>
            Accounting <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Dashboard</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Firm-wide overview of clients, compliance, workflow and performance.
          </p>
        </div>


      </div>

      {/* ── GLOBAL DASHBOARD FILTER BAR ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#ffffff',
        border: '1px solid #DDD0C4',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        boxShadow: '0 4px 20px rgba(42,22,40,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {/* Filters row */}
        <div className="dashboard-filters-row" style={{ display: 'grid', gap: '0.4rem', alignItems: 'center' }}>
          {filterConfigs.map((f) => {
            const isOpen = activeDropdown === f.key;
            return (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>{f.label}</span>
                <div
                  onClick={() => setActiveDropdown(isOpen ? null : f.key)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.725rem',
                    border: '1px solid #DDD0C4',
                    borderRadius: '6px',
                    color: '#2A1628',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E8760A';
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen) e.currentTarget.style.borderColor = '#DDD0C4';
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.value}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease', color: '#E8760A', flexShrink: 0, marginLeft: '4px' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {isOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #DDD0C4',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(42,22,40,0.12)',
                    zIndex: 50,
                    overflow: 'hidden',
                    padding: '4px',
                    minWidth: '140px'
                  }}>
                    {f.options.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          f.setter(opt);
                          setActiveDropdown(null);
                        }}
                        style={{
                          padding: '0.4rem 0.625rem',
                          fontSize: '0.725rem',
                          color: '#2A1628',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          background: f.value === opt ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: f.value === opt ? 600 : 400,
                          transition: 'all 100ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(232, 118, 10, 0.06)';
                          e.currentTarget.style.color = '#E8760A';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = f.value === opt ? 'rgba(232, 118, 10, 0.06)' : 'transparent';
                          e.currentTarget.style.color = '#2A1628';
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons + search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.5rem' }}>
          
          {/* Global Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAF8F5', border: '1px solid #DDD0C4', padding: '0.35rem 0.75rem', borderRadius: '8px', flex: 1, marginRight: '1.5rem', position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.5)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search clients, docs, invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.75rem', color: '#2A1628', width: '100%' }}
            />
            {searchQuery && (
              <span 
                onClick={() => setSearchQuery('')}
                style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </span>
            )}
          </div>

          {/* Action Toolbar buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', position: 'relative' }}>
            
            <button 
              onClick={() => {
                setClientFilter('All Clients');
                setManagerFilter('All Managers');
                setBookkeeperFilter('All Bookkeepers');
                setCountryFilter('All Countries');
                setEntityFilter('All Entities');
                setIndustryFilter('All Industries');
                setDateFilter('This Month');
                setFyFilter('FY 2026');
                setComplianceFilter('All Statuses');
                setQboFilter('All Statuses');
              }}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Reset Filters
            </button>
            <button 
              onClick={() => {
                fetchDashboardData();
              }}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #E8760A', background: 'rgba(232,118,10,0.06)', borderRadius: '6px', cursor: 'pointer', color: '#E8760A', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
              Refresh
            </button>

            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              style={{ 
                padding: '0.35rem 0.75rem', 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                border: '1px solid #DDD0C4', 
                background: '#ffffff', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                color: '#2A1628', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                position: 'relative'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              Notifications
              {stats?.systemAlerts && stats.systemAlerts.length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444', color: '#ffffff', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{stats.systemAlerts.length}</span>
              )}
            </button>

            {/* ── 6. NOTIFICATIONS CENTER DROPDOWN ── */}
            {notificationsOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#ffffff',
                border: '1px solid #DDD0C4',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(42,22,40,0.12)',
                padding: '1rem',
                minWidth: '320px',
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2A1628' }}>Alerts & Notifications</span>
                  <span onClick={() => setNotificationsOpen(false)} style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', cursor: 'pointer' }}>Close</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {(!stats?.systemAlerts || stats.systemAlerts.length === 0) ? (
                    <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '1rem' }}>No new notifications</div>
                  ) : (
                    stats.systemAlerts.map((notif: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem', borderRadius: '6px', background: 'rgba(232,118,10,0.04)' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A', marginTop: '5px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#2A1628', lineHeight: 1.25 }}>{notif.client}: {notif.error}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '2px' }}>
                            <span style={{ color: notif.color || '#E8760A', fontWeight: 600 }}>{notif.priority} Priority</span>
                            <span>{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── 14. GLOBAL SEARCH RESULTS PANEL ── */}
      {searchQuery && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #DDD0C4',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 8px 30px rgba(42,22,40,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 35
        }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8760A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Results for "{searchQuery}"</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            
            {/* Clients Results */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(42,22,40,0.6)' }}>Clients</h4>
              <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                {(!searchResults?.clients || searchResults.clients.length === 0) ? (
                  <div style={{ color: 'rgba(42,22,40,0.5)' }}>No clients found</div>
                ) : (
                  searchResults.clients.map((c: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.25rem 0', fontWeight: 600 }}>{c.name} ({c.details})</div>
                  ))
                )}
              </div>
            </div>

            {/* Documents Results */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(42,22,40,0.6)' }}>Documents</h4>
              <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                {(!searchResults?.documents || searchResults.documents.length === 0) ? (
                  <div style={{ color: 'rgba(42,22,40,0.5)' }}>No documents found</div>
                ) : (
                  searchResults.documents.map((d: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.25rem 0' }}>{d.name}</div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks Results */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(42,22,40,0.6)' }}>Tasks</h4>
              <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                {(!searchResults?.tasks || searchResults.tasks.length === 0) ? (
                  <div style={{ color: 'rgba(42,22,40,0.5)' }}>No tasks found</div>
                ) : (
                  searchResults.tasks.map((t: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.25rem 0' }}>{t.name} - <span style={{ fontWeight: 600 }}>{t.status}</span></div>
                  ))
                )}
              </div>
            </div>

            {/* Reports & Actions */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(42,22,40,0.6)' }}>Reports & Actions</h4>
              <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                <div style={{ padding: '0.25rem 0', color: '#E8760A', fontWeight: 600, cursor: 'pointer' }}>Generate VAT Summary</div>
                <div style={{ padding: '0.25rem 0', color: '#E8760A', fontWeight: 600, cursor: 'pointer' }}>Go to Reconciliation Center</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── METRICS GRID (7 CARDS ROW) ── */}
      <div className="dashboard-kpi-grid" style={{ display: 'grid', gap: '0.75rem' }}>
        {[
          {
            label: 'Total Clients',
            value: stats?.kpiCards?.totalClients?.toString() || '0',
            change: 'Active client profiles',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            label: 'Books Pending',
            value: stats?.kpiCards?.booksPending?.toString() || '0',
            change: stats?.kpiCards?.booksPending > 0 ? `${stats.kpiCards.booksPending} require review` : 'All caught up',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )
          },
          {
            label: 'VAT Returns Due',
            value: stats?.kpiCards?.vatReturnsDue?.toString() || '0',
            change: stats?.kpiCards?.vatReturnsDue > 0 ? `${stats.kpiCards.vatReturnsDue} filing periods` : 'No pending filings',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )
          },
          {
            label: 'CT Filings Due',
            value: stats?.kpiCards?.ctFilingsDue?.toString() || '0',
            change: stats?.kpiCards?.ctFilingsDue > 0 ? `${stats.kpiCards.ctFilingsDue} filing periods` : 'No pending filings',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            )
          },
          {
            label: 'KYC Expiring',
            value: stats?.kpiCards?.kycExpiring?.toString() || '0',
            change: stats?.kpiCards?.kycExpiring > 0 ? `${stats.kpiCards.kycExpiring} docs expiring soon` : 'All documents active',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )
          },
          {
            label: 'Suspense Items',
            value: stats?.kpiCards?.suspenseItems?.toString() || '0',
            change: stats?.kpiCards?.suspenseItems > 0 ? `${stats.kpiCards.suspenseItems} items pending` : 'Zero suspense records',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )
          },
          {
            label: 'QBO Sync Errors',
            value: stats?.kpiCards?.qboErrors?.toString() || '0',
            change: stats?.kpiCards?.qboErrors > 0 ? `${stats.kpiCards.qboErrors} sync failures` : 'Sync pipeline healthy',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            )
          },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
            minHeight: '105px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: card.change.includes('urgent') || card.change.includes('attention') ? '#EF4444' : 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="dashboard-charts-grid" style={{ display: 'grid', gap: '1.25rem' }}>
        
        {/* Books Completion Status */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Books Completion Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '150px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Circular SVG Ring */}
              <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                {/* Overdue (terracotta) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C4695A" strokeWidth="3" strokeDasharray={`${overduePct} ${100 - overduePct}`} strokeDashoffset={-(completedPct + inProgressPct + pendingPct)} />
                {/* Pending (purple) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#5A2D5A" strokeWidth="3" strokeDasharray={`${pendingPct} ${100 - pendingPct}`} strokeDashoffset={-(completedPct + inProgressPct)} />
                {/* In Progress (gold) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B8892A" strokeWidth="3" strokeDasharray={`${inProgressPct} ${100 - inProgressPct}`} strokeDashoffset={-completedPct} />
                {/* Completed (orange) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3" strokeDasharray={`${completedPct} ${100 - completedPct}`} strokeDashoffset={0} />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                  {stats?.kpiCards?.totalClients?.toString() || '0'}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Completed', val: completedVal.toString(), pct: `${completedPct}%`, color: '#E8760A' },
                { name: 'In Progress', val: inProgressVal.toString(), pct: `${inProgressPct}%`, color: '#B8892A' },
                { name: 'Pending', val: pendingVal.toString(), pct: `${pendingPct}%`, color: '#5A2D5A' },
                { name: 'Overdue', val: overdueVal.toString(), pct: `${overduePct}%`, color: '#C4695A' }
              ].map((leg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: leg.color }} />
                    <span style={{ color: 'rgba(42,22,40,0.7)' }}>{leg.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2A1628' }}>{leg.val} <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>({leg.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.75rem', marginTop: '1rem', textAlign: 'left' }}>
            <a href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E8760A', textDecoration: 'none' }}>View Books Completion →</a>
          </div>
        </div>

        {/* Monthly Books Status Trend */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: 0 }}>Monthly Books Status Trend</h3>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setMonthsDropdownOpen(!monthsDropdownOpen)}
                style={{ 
                  fontSize: '0.75rem', 
                  border: '1px solid #DDD0C4', 
                  borderRadius: '6px', 
                  padding: '0.25rem 0.625rem', 
                  background: '#fff', 
                  color: '#2A1628', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  userSelect: 'none',
                  fontWeight: 500
                }}
              >
                {selectedMonths}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: monthsDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {monthsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  border: '1px solid #DDD0C4',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(42,22,40,0.08)',
                  zIndex: 20,
                  minWidth: '120px',
                  padding: '4px'
                }}>
                  {['Last 3 Months', 'Last 5 Months', 'Last 12 Months'].map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setSelectedMonths(option);
                        setMonthsDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.375rem 0.5rem',
                        fontSize: '0.75rem',
                        color: '#2A1628',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        background: selectedMonths === option ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                        fontWeight: selectedMonths === option ? 600 : 400,
                        transition: 'all 100ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(232, 118, 10, 0.06)';
                        e.currentTarget.style.color = '#E8760A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedMonths === option ? 'rgba(232, 118, 10, 0.06)' : 'transparent';
                        e.currentTarget.style.color = '#2A1628';
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '175px', justifyContent: 'space-between', position: 'relative' }}>
            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A' }} /> Completed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B8892A' }} /> In Progress</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C4695A' }} /> Overdue</span>
            </div>
            
            {/* Vector Line Graph Art */}
            <div style={{ position: 'relative', flex: 1, width: '100%', borderBottom: '1px solid rgba(42,22,40,0.08)' }}>
              {/* Lines */}
              <svg width="100%" height="100px" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Completed Line (orange) */}
                <path d={completedPath} fill="none" stroke="#E8760A" strokeWidth="2.5" />
                {/* In Progress Line (gold) */}
                <path d={pendingPath} fill="none" stroke="#B8892A" strokeWidth="2.5" />
                {/* Overdue Line (terracotta) */}
                <path d={overduePath} fill="none" stroke="#C4695A" strokeWidth="2.5" />
              </svg>
              
              {/* Tooltip Overlay */}
              {trendData.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '60%',
                  background: '#ffffff',
                  border: '1px solid rgba(42,22,40,0.12)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.625rem',
                  boxShadow: '0 4px 12px rgba(42,22,40,0.08)',
                  zIndex: 10
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{lastPoint.period}</div>
                  <div style={{ color: '#E8760A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Completed</span> <strong>{lastPoint.completed}</strong></div>
                  <div style={{ color: '#B8892A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Pending</span> <strong>{lastPoint.pending}</strong></div>
                  <div style={{ color: '#C4695A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Overdue</span> <strong>{lastPoint.overdue}</strong></div>
                </div>
              )}
            </div>
            
            {/* X Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.25rem' }}>
              {trendData.length === 0 ? (
                <span>No periods loaded</span>
              ) : (
                trendData.map((t: any, idx: number) => (
                  <span key={idx}>{t.period}</span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Compliance Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '150px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                {/* Non Compliant (terracotta) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C4695A" strokeWidth="3" strokeDasharray={`${nonCompliantPct} ${100 - nonCompliantPct}`} strokeDashoffset={-(compliantPct + atRiskPct)} />
                {/* At Risk (gold) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B8892A" strokeWidth="3" strokeDasharray={`${atRiskPct} ${100 - atRiskPct}`} strokeDashoffset={-compliantPct} />
                {/* Compliant (orange) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3" strokeDasharray={`${compliantPct} ${100 - compliantPct}`} strokeDashoffset={0} />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                  {stats?.kpiCards?.totalClients?.toString() || '0'}
                </div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Compliant', val: compliantVal.toString(), pct: `${compliantPct}%`, color: '#E8760A' },
                { name: 'At Risk', val: atRiskVal.toString(), pct: `${atRiskPct}%`, color: '#B8892A' },
                { name: 'Non Compliant', val: nonCompliantVal.toString(), pct: `${nonCompliantPct}%`, color: '#C4695A' }
              ].map((leg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: leg.color }} />
                    <span style={{ color: 'rgba(42,22,40,0.7)' }}>{leg.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2A1628' }}>{leg.val} <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>({leg.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.75rem', marginTop: '1rem', textAlign: 'left' }}>
            <a href="#" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#E8760A', textDecoration: 'none' }}>View Compliance Center →</a>
          </div>
        </div>

      </div>

      {/* ── LISTS & QUICK ACTIONS ROW ── */}
      <div className="dashboard-lists-grid" style={{ display: 'grid', gap: '1.25rem' }}>
        
        {/* VAT Returns Due */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>VAT Returns Due</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!lists?.vatDueList || lists.vatDueList.length === 0) ? (
              <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center', padding: '1.5rem 0' }}>No VAT returns due</div>
            ) : (
              lists.vatDueList.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < (lists.vatDueList.length - 1) ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628' }}>{item.client}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)' }}>{item.details}</div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.isOverdue ? '#FEE2E2' : '#FFF3E0',
                    color: item.isOverdue ? '#EF4444' : '#E8760A'
                  }}>{item.badge}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CT Filings Due */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>CT Filings Due</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!lists?.ctDueList || lists.ctDueList.length === 0) ? (
              <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center', padding: '1.5rem 0' }}>No CT filings due</div>
            ) : (
              lists.ctDueList.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < (lists.ctDueList.length - 1) ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628' }}>{item.client}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)' }}>{item.details}</div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.isOverdue ? '#FEE2E2' : '#FFF3E0',
                    color: item.isOverdue ? '#EF4444' : '#E8760A'
                  }}>{item.badge}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent Activity</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!activities || activities.length === 0) ? (
              <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '1rem' }}>No recent activity</div>
            ) : (
              activities.map((item: any, idx: number) => {
                let icon = (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                );
                if (item.type?.toLowerCase().includes('vat')) {
                  icon = (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  );
                } else if (item.type?.toLowerCase().includes('reconcile')) {
                  icon = (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  );
                } else if (item.type?.toLowerCase().includes('kyc')) {
                  icon = (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  );
                }

                const timeStr = item.time ? new Date(item.time).toLocaleDateString() : 'Just now';

                return (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderBottom: idx < activities.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(232, 118, 10, 0.06)',
                      color: '#E8760A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628', lineHeight: 1.25 }}>{item.desc}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.125rem' }}>
                        <span>by {item.user || 'System'}</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions (Grid of 8 Buttons) */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Quick Actions</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              {
                name: 'Add New Client',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                )
              },
              {
                name: 'Upload Documents',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                )
              },
              {
                name: 'AI Bookkeeping Queue',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )
              },
              {
                name: 'Reconciliation Center',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              },
              {
                name: 'VAT Center',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                )
              },
              {
                name: 'CT Filings',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                )
              },
              {
                name: 'Reports',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )
              },
              {
                name: 'QBO Sync Log',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              }
            ].map((act, idx) => (
              <button key={idx} 
              onClick={() => handleActionClick(act.name)}
              style={{
                background: '#ffffff',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                padding: '0.35rem 0.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2A1628';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#2A1628';
                const badge = e.currentTarget.querySelector('.action-badge') as HTMLElement;
                if (badge) {
                  badge.style.background = 'rgba(255, 255, 255, 0.15)';
                  badge.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#2A1628';
                e.currentTarget.style.borderColor = '#DDD0C4';
                const badge = e.currentTarget.querySelector('.action-badge') as HTMLElement;
                if (badge) {
                  badge.style.background = 'rgba(232, 118, 10, 0.06)';
                  badge.style.color = '#E8760A';
                }
              }}>
                <div className="action-badge" style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(232, 118, 10, 0.06)',
                  color: '#E8760A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms ease'
                }}>
                  {act.icon}
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{act.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 15. EMPTY / LOADING / ERROR STATES HELPER ── */}
        {(() => {
          const renderWidgetState = (
            title: string,
            children: React.ReactNode,
            height: string = '200px'
          ) => {
            if (dashboardState === 'loading') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', height }}>
                  <div style={{ width: '45%', height: '12px', background: 'rgba(42,22,40,0.06)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ flex: 1, background: 'rgba(42,22,40,0.03)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                </div>
              );
            }
            if (dashboardState === 'empty') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height, gap: '0.5rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>No Data Available</span>
                  <span style={{ fontSize: '0.65rem' }}>Try adjusting your filters or search criteria.</span>
                </div>
              );
            }
            if (dashboardState === 'error') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height, gap: '0.5rem', color: '#EF4444', padding: '1rem', textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>System Error</span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.6)' }}>Failed to load metrics.</span>
                  <button 
                    onClick={() => setDashboardState('loaded')}
                    style={{ marginTop: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.65rem', border: '1px solid #EF4444', borderRadius: '4px', background: '#ffffff', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Retry
                  </button>
                </div>
              );
            }
            if (dashboardState === 'denied') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height, gap: '0.5rem', color: '#B8892A', padding: '1rem', textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Access Denied</span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.6)' }}>insufficient permissions for this block.</span>
                </div>
              );
            }
            return children;
          };

          return (
            <>
              {/* ── ROW 1: CUSTOM 3-COLUMN LAYOUT (Operations Summary, Center [Health & Timeline], Firm Insights) ── */}
              <div className="dashboard-row1-grid" style={{ display: 'grid', gap: '1.25rem' }}>
                
                {/* Column 1: Operations Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Operations Summary</h4>
                    {renderWidgetState('Operations Summary', (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', flex: 1 }}>
                        {[
                          { label: 'Books Completed', val: stats?.bookkeepingOverview?.completed?.toString() || '0', color: '#E8760A' },
                          { label: 'Books Pending', val: stats?.kpiCards?.booksPending?.toString() || '0', color: '#B8892A' },
                          { label: 'Reconciliation Pending', val: stats?.kpiCards?.suspenseItems?.toString() || '0', color: '#C4695A' },
                          { label: 'VAT Pending', val: stats?.kpiCards?.vatReturnsDue?.toString() || '0', color: '#2A1628' },
                          { label: 'CT Pending', val: stats?.kpiCards?.ctFilingsDue?.toString() || '0', color: '#E8760A' },
                          { label: 'AI Queue Active', val: stats?.kpiCards?.totalClients ? Math.round(stats.kpiCards.totalClients * 0.3).toString() : '0', color: '#5A2D5A' }
                        ].map((item, idx) => (
                          <div key={idx} style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>{item.label}</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color, fontFamily: 'Georgia, serif', marginTop: '2px' }}>{item.val}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Column 2: Center (Firm Health Score & Deadlines Timeline stacked 50% / 50%) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
                  
                  {/* Firm Health Score */}
                  <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Firm Health Score</h4>
                    {renderWidgetState('Firm Health Score', (() => {
                      const completed = stats?.bookkeepingOverview?.completed || 0;
                      const inProgress = stats?.bookkeepingOverview?.inProgress || 0;
                      const pending = stats?.bookkeepingOverview?.pending || 0;
                      const overdue = stats?.bookkeepingOverview?.overdue || 0;
                      const total = completed + inProgress + pending + overdue;
                      const healthPct = total > 0 ? Math.round((completed / total) * 100) : 0;
                      const displayPct = stats?.bookkeepingOverview ? healthPct : 89;
                      return (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '100%' }}>
                          <div style={{ position: 'relative', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="76" height="76" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(42,22,40,0.05)" strokeWidth="3.5" />
                              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.5" strokeDasharray={`${displayPct} ${100 - displayPct}`} />
                            </svg>
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: 1
                            }}>
                              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2A1628', fontFamily: 'Georgia, serif' }}>
                                {displayPct}%
                              </div>
                              <span style={{ fontSize: '0.45rem', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>+2% Trend</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, fontSize: '0.65rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'rgba(42,22,40,0.6)' }}>Excellent</span>
                              <strong style={{ color: '#16A34A' }}>{stats?.bookkeepingOverview ? stats.bookkeepingOverview.completed : 156} cls</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'rgba(42,22,40,0.6)' }}>Healthy</span>
                              <strong style={{ color: '#E8760A' }}>{stats?.bookkeepingOverview ? stats.bookkeepingOverview.inProgress : 62} cls</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'rgba(42,22,40,0.6)' }}>Review</span>
                              <strong style={{ color: '#B8892A' }}>{stats?.bookkeepingOverview ? (stats.bookkeepingOverview.pending + stats.bookkeepingOverview.overdue) : 21} cls</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })())}
                  </div>
 
                  {/* Deadlines Timeline */}
                  <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Deadlines Timeline</h4>
                    {renderWidgetState('Deadlines Timeline', (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(!lists?.deadlinesTimeline || lists.deadlinesTimeline.length === 0) ? (
                          <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center', padding: '2rem 0' }}>No upcoming deadlines</div>
                        ) : (
                          lists.deadlinesTimeline.map((group: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', borderBottom: idx < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.25rem' }}>
                              <span style={{ width: '55px', fontSize: '0.65rem', fontWeight: 700, color: '#E8760A', flexShrink: 0 }}>{group.time}</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                {(group.items || [{ text: group.task, type: group.badge }]).map((item: any, itemIdx: number) => (
                                  <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', alignItems: 'center' }}>
                                    <span style={{ color: '#2A1628', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{item.text}</span>
                                    <span style={{ fontSize: '0.5rem', fontWeight: 700, padding: '0.05rem 0.2rem', borderRadius: '3px', background: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.6)' }}>{item.type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>

                </div>
  
                {/* Column 3: Firm Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Firm Insights</h4>
                    {renderWidgetState('Firm Insights', (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'space-between' }}>
                        {(!lists?.firmInsights || lists.firmInsights.length === 0) ? (
                          <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center', padding: '3.5rem 0' }}>No new firm insights available</div>
                        ) : (
                          lists.firmInsights.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.35rem' }}>
                              <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628' }}>{item.title || item.label}</div>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.6)', marginTop: '1px' }}>{item.detail || item.val}</div>
                              </div>
                              <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.3rem', borderRadius: '3px', background: 'rgba(232, 118, 10, 0.05)', color: item.color }}>{item.badge}</span>
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* ── ROW 2: DOCUMENT STATUS OVERVIEW ── */}
            <div className="dashboard-row2-grid" style={{ display: 'grid', gap: '1.25rem' }}>
  
                {/* ── DOCUMENT STATUS OVERVIEW ── */}
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Document Status Overview</h4>
                  {renderWidgetState('Document Status Overview', (
                    <div className="dashboard-docs-grid" style={{ display: 'grid', gap: '0.75rem' }}>
                      {[
                        { status: 'Uploaded', count: stats?.documentStatus?.Uploaded?.toString() || '0', desc: 'Pending matching', color: '#E8760A' },
                        { status: 'Verified', count: stats?.documentStatus?.Verified?.toString() || '0', desc: 'Ready for ledger', color: '#16A34A' },
                        { status: 'OCR Pending', count: stats?.documentStatus?.['OCR Pending']?.toString() || '0', desc: 'Queue processing', color: '#B8892A' },
                        { status: 'Rejected', count: stats?.documentStatus?.Rejected?.toString() || '0', desc: 'Requires reupload', color: '#EF4444' },
                        { status: 'Missing', count: stats?.documentStatus?.Missing?.toString() || '0', desc: 'No uploads found', color: '#C4695A' },
                        { status: 'Expired', count: stats?.documentStatus?.Expired?.toString() || '0', desc: 'Needs renewal', color: '#5A2D5A' },
                        { status: 'Processing', count: stats?.documentStatus?.Processing?.toString() || '0', desc: 'Extracting data', color: '#2A1628' }
                      ].map((item, idx) => (
                        <div key={idx} style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '80px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>{item.status}</span>
                          <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 300, color: item.color, fontFamily: 'Georgia, serif', lineHeight: 1.1 }}>{item.count}</div>
                            <span style={{ fontSize: '0.55rem', color: 'rgba(42,22,40,0.4)', marginTop: '2px', display: 'block' }}>{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ), '100px')}
                </div>
  
              </div>
 
              {/* ── ROW: AI PROCESSING HEALTH ── */}
              <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>AI Bookkeeping Pipeline Health</h4>
                {renderWidgetState('AI Processing Health', (
                  <div className="dashboard-ai-grid" style={{ display: 'grid', gap: '0.75rem' }}>
                    {[
                      { stage: 'OCR', jobs: stats?.aiPipeline?.ocr?.jobs || '0 jobs', success: stats?.aiPipeline?.ocr?.success || '100%', time: stats?.aiPipeline?.ocr?.time || '1.2s avg', fail: stats?.aiPipeline?.ocr?.fail || '0 fails' },
                      { stage: 'Extraction', jobs: stats?.aiPipeline?.extraction?.jobs || '0 jobs', success: stats?.aiPipeline?.extraction?.success || '100%', time: stats?.aiPipeline?.extraction?.time || '3.4s avg', fail: stats?.aiPipeline?.extraction?.fail || '0 fails' },
                      { stage: 'Ledger', jobs: stats?.aiPipeline?.ledger?.jobs || '0 jobs', success: stats?.aiPipeline?.ledger?.success || '100%', time: stats?.aiPipeline?.ledger?.time || '2.8s avg', fail: stats?.aiPipeline?.ledger?.fail || '0 fails' },
                      { stage: 'Matching', jobs: stats?.aiPipeline?.matching?.jobs || '0 jobs', success: stats?.aiPipeline?.matching?.success || '100%', time: stats?.aiPipeline?.matching?.time || '4.1s avg', fail: stats?.aiPipeline?.matching?.fail || '0 fails' },
                      { stage: 'Reconciliation', jobs: stats?.aiPipeline?.reconciliation?.jobs || '0 jobs', success: stats?.aiPipeline?.reconciliation?.success || '100%', time: stats?.aiPipeline?.reconciliation?.time || '6.2s avg', fail: stats?.aiPipeline?.reconciliation?.fail || '0 fails' },
                      { stage: 'Review', jobs: stats?.aiPipeline?.review?.jobs || '0 jobs', success: stats?.aiPipeline?.review?.success || '100%', time: stats?.aiPipeline?.review?.time || 'Manual', fail: stats?.aiPipeline?.review?.fail || '0 fails' },
                      { stage: 'QBO Push', jobs: stats?.aiPipeline?.qboPush?.jobs || '0 jobs', success: stats?.aiPipeline?.qboPush?.success || '100%', time: stats?.aiPipeline?.qboPush?.time || '2.1s avg', fail: stats?.aiPipeline?.qboPush?.fail || '0 fails' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '90px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E8760A' }}>{item.stage}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.625rem', color: 'rgba(42,22,40,0.6)' }}>
                          <strong>{item.jobs}</strong>
                          <span>{item.success} Success</span>
                          <span>{item.time}</span>
                          <span style={{ color: item.fail.includes('0') ? '#16A34A' : '#EF4444', fontWeight: 600 }}>{item.fail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ), '120px')}
              </div>

              {/* ── ROW 3: TEAM WORKLOAD, ALERTS, SHORTCUTS (3 columns) ── */}
              <div className="dashboard-row3-grid" style={{ display: 'grid', gap: '1.25rem' }}>
                
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Team Workload Snapshot</h4>
                  {renderWidgetState('Team Workload', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!stats?.teamWorkload || stats.teamWorkload.length === 0) ? (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '1rem' }}>No workload data available</div>
                      ) : (
                        stats.teamWorkload.map((member: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < stats.teamWorkload.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{member.name}</div>
                              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>
                                <span>{member.clients}</span>
                                <span>•</span>
                                <span>{member.pending}</span>
                                <span>•</span>
                                <span style={{ color: '#E8760A' }}>{member.completed}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{member.load} Workload</div>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: member.color }}>{member.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent System Alerts</h4>
                  {renderWidgetState('System Alerts', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!stats?.systemAlerts || stats.systemAlerts.length === 0) ? (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '1rem' }}>No system alerts</div>
                      ) : (
                        stats.systemAlerts.map((alert: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < stats.systemAlerts.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{alert.client}</div>
                              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.6)', marginTop: '2px' }}>{alert.error}</div>
                              <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)' }}>{alert.time}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                              <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(42,22,40,0.04)', color: alert.color }}>{alert.priority} Priority</span>
                              <span style={{ fontSize: '0.65rem', color: '#E8760A', fontWeight: 600, cursor: 'pointer' }}>Resolve →</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>



              </div>

              {/* ── ROW 4: RECENT CLIENT ONBOARDING & PERFORMANCE SNAPSHOT (2 columns) ── */}
              <div className="dashboard-row4-grid" style={{ display: 'grid', gap: '1.25rem' }}>
                
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent Client Onboarding</h4>
                  {renderWidgetState('Recent Onboarding', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!lists?.recentClientOnboarding || lists.recentClientOnboarding.length === 0) ? (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '1rem' }}>No active onboardings</div>
                      ) : (
                        lists.recentClientOnboarding.map((client: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < lists.recentClientOnboarding.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{client.name}</div>
                              <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{client.manager}</div>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '100px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>
                                <span>{client.desc}</span>
                                <span>{client.progress}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${client.progress}%`, height: '100%', background: client.color }} />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Manager Performance Snapshot</h4>
                  {renderWidgetState('Manager Performance', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(!lists?.managerPerformance || lists.managerPerformance.length === 0) ? (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '1rem' }}>No performance data</div>
                      ) : (
                        lists.managerPerformance.map((mgr: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < lists.managerPerformance.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{mgr.name}</div>
                              <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{mgr.managed} • {mgr.reviews}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: mgr.color }}>{mgr.perf}</div>
                              <span style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.5)' }}>{mgr.resolution}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>

              </div>

            </>
          );
        })()}

      </div>
  );
}
