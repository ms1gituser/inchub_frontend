/* eslint-disable */
'use client';

import React from 'react';

export default function DashboardTab() {
  const [monthsDropdownOpen, setMonthsDropdownOpen] = React.useState(false);
  const [selectedMonths, setSelectedMonths] = React.useState('Last 5 Months');

  // Simulation state for loading / empty / error / permission states
  const [dashboardState, setDashboardState] = React.useState<'loaded' | 'loading' | 'empty' | 'error' | 'denied'>('loaded');

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

  // Popup & Search States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [savedViews, setSavedViews] = React.useState<string[]>([]);

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
            padding: 0.2rem 0.15rem !important;
            font-size: 0.65rem !important;
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
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
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
            .dashboard-row3-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .dashboard-row4-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .dashboard-charts-grid { grid-template-columns: 1fr 1.3fr 1fr; }
            .dashboard-filters-row { grid-template-columns: repeat(10, 1fr); }
          }
          @media (max-width: 1350px) {
            .dashboard-filters-row { grid-template-columns: repeat(10, 1fr); }
            .dashboard-lists-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            .dashboard-row1-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .dashboard-row2-grid { grid-template-columns: 1fr !important; }
            .dashboard-row3-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
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

        {/* Simulation Controls */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(42,22,40,0.03)', padding: '0.375rem 0.5rem', borderRadius: '8px', border: '1px dashed #DDD0C4' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Simulate:</span>
          {(['loaded', 'loading', 'empty', 'error', 'denied'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setDashboardState(st)}
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: dashboardState === st ? '#E8760A' : '#DDD0C4',
                background: dashboardState === st ? '#E8760A' : '#ffffff',
                color: dashboardState === st ? '#ffffff' : '#2A1628',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 100ms ease'
              }}
            >
              {st}
            </button>
          ))}
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
          
          {/* Client Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Client Scope</span>
            <select 
              value={clientFilter} 
              onChange={(e) => setClientFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Clients">All Clients</option>
              <option value="ABC Trading LLC">ABC Trading LLC</option>
              <option value="XYZ Holdings">XYZ Holdings</option>
              <option value="Alpha Tech FZCO">Alpha Tech FZCO</option>
              <option value="Beta Industries">Beta Industries</option>
              <option value="Gamma Solutions">Gamma Solutions</option>
            </select>
          </div>

          {/* Manager Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Manager</span>
            <select 
              value={managerFilter} 
              onChange={(e) => setManagerFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Managers">All Managers</option>
              <option value="John Doe">John Doe</option>
              <option value="Sarah Khan">Sarah Khan</option>
              <option value="Mike Brown">Mike Brown</option>
              <option value="Priya Nair">Priya Nair</option>
            </select>
          </div>

          {/* Bookkeeper Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Bookkeeper</span>
            <select 
              value={bookkeeperFilter} 
              onChange={(e) => setBookkeeperFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Bookkeepers">All Bookkeepers</option>
              <option value="Alex Mercer">Alex Mercer</option>
              <option value="Emma Watson">Emma Watson</option>
              <option value="Liam Neeson">Liam Neeson</option>
            </select>
          </div>

          {/* Country Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Country</span>
            <select 
              value={countryFilter} 
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Countries">All Countries</option>
              <option value="UAE">UAE</option>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
            </select>
          </div>

          {/* Entity Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Entity Type</span>
            <select 
              value={entityFilter} 
              onChange={(e) => setEntityFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Entities">All Entities</option>
              <option value="LLC">LLC</option>
              <option value="FZCO">FZCO</option>
              <option value="Branch">Branch</option>
              <option value="Sole Proprietor">Sole Proprietor</option>
            </select>
          </div>

          {/* Industry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Industry</span>
            <select 
              value={industryFilter} 
              onChange={(e) => setIndustryFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Industries">All Industries</option>
              <option value="Trading">Trading</option>
              <option value="Holding">Holding</option>
              <option value="Tech">Tech</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Date Range</span>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {/* Financial Year */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Financial Year</span>
            <select 
              value={fyFilter} 
              onChange={(e) => setFyFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="FY 2026">FY 2026</option>
              <option value="FY 2025">FY 2025</option>
              <option value="FY 2024">FY 2024</option>
            </select>
          </div>

          {/* Compliance Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Compliance</span>
            <select 
              value={complianceFilter} 
              onChange={(e) => setComplianceFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="At Risk">At Risk</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </select>
          </div>

          {/* QuickBooks Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>QuickBooks</span>
            <select 
              value={qboFilter} 
              onChange={(e) => setQboFilter(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Connected">Connected</option>
              <option value="Error">Error</option>
              <option value="Disconnected">Disconnected</option>
            </select>
          </div>

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
                const viewName = prompt('Enter a name for this custom view:');
                if (viewName) {
                  setSavedViews([...savedViews, viewName]);
                  alert(`View "${viewName}" saved successfully!`);
                }
              }}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              Save View
            </button>

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
              onClick={() => setExportOpen(!exportOpen)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export
            </button>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Dashboard share link copied to clipboard!');
              }}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #DDD0C4', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              Share
            </button>

            <button 
              onClick={() => {
                setDashboardState('loading');
                setTimeout(() => setDashboardState('loaded'), 600);
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
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444', color: '#ffffff', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
            </button>

            {/* ── 16. EXPORT MENU DRAGDOWN ── */}
            {exportOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: '110px',
                background: '#ffffff',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(42,22,40,0.12)',
                padding: '0.5rem',
                minWidth: '150px',
                zIndex: 110,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {['Export as PDF', 'Export as Excel', 'Export as CSV', 'Print Dashboard', 'Email PDF Report'].map((opt) => (
                  <div 
                    key={opt} 
                    onClick={() => {
                      alert(`Successfully executed: ${opt}`);
                      setExportOpen(false);
                    }}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '4px', color: '#2A1628', transition: 'background 100ms' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232,118,10,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}

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
                  {[
                    { text: 'AI processing failed for ABC Trading invoice', time: '10 min ago', cat: 'AI', unread: true },
                    { text: 'VAT filing deadline approaching for XYZ Holdings', time: '1 hr ago', cat: 'Compliance', unread: true },
                    { text: 'QuickBooks sync error on Alpha Tech FZCO', time: '4 hr ago', cat: 'QuickBooks', unread: true },
                    { text: 'Passport expiring in 15 days for Priya Nair (Client Director)', time: 'Yesterday', cat: 'Compliance', unread: false }
                  ].map((notif, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem', borderRadius: '6px', background: notif.unread ? 'rgba(232,118,10,0.04)' : 'transparent' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: notif.unread ? '#E8760A' : 'transparent', marginTop: '5px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#2A1628', lineHeight: 1.25 }}>{notif.text}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '2px' }}>
                          <span style={{ color: '#B8892A', fontWeight: 600 }}>{notif.cat}</span>
                          <span>{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div style={{ padding: '0.25rem 0', fontWeight: 600 }}>ABC Trading LLC</div>
                <div style={{ padding: '0.25rem 0', fontWeight: 600 }}>Alpha Tech FZCO</div>
              </div>
            </div>

            {/* Documents Results */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(42,22,40,0.6)' }}>Documents</h4>
              <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                <div style={{ padding: '0.25rem 0' }}>invoice_40293.pdf</div>
                <div style={{ padding: '0.25rem 0' }}>bank_statement_april.pdf</div>
              </div>
            </div>

            {/* Transactions Results */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'rgba(42,22,40,0.6)' }}>Transactions & Vendors</h4>
              <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                <div style={{ padding: '0.25rem 0' }}>AED 12,500 - Office Rent</div>
                <div style={{ padding: '0.25rem 0' }}>AED 1,840 - Amazon Web Services</div>
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
            value: '248',
            change: '+12 this week',
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
            value: '18',
            change: '+4 urgent',
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
            value: '9',
            change: '+3 this week',
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
            value: '4',
            change: '+1 this week',
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
            value: '11',
            change: 'within 30 days',
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
            value: '36',
            change: '+8 new',
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
            value: '5',
            change: 'requires attention',
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
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C4695A" strokeWidth="3" strokeDasharray="100 0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#5A2D5A" strokeWidth="3.2" strokeDasharray="93 7" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B8892A" strokeWidth="3.4" strokeDasharray="80 20" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.6" strokeDasharray="48 52" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1, fontFamily: 'var(--font-serif), Georgia, serif' }}>248</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Completed', val: '120', pct: '48%', color: '#E8760A' },
                { name: 'In Progress', val: '78', pct: '31%', color: '#B8892A' },
                { name: 'Pending', val: '32', pct: '13%', color: '#5A2D5A' },
                { name: 'Overdue', val: '18', pct: '7%', color: '#C4695A' }
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
                <path d="M10,60 Q50,40 100,50 T200,30 T290,10" fill="none" stroke="#E8760A" strokeWidth="2.5" />
                {/* In Progress Line (gold) */}
                <path d="M10,80 Q50,75 100,82 T200,68 T290,55" fill="none" stroke="#B8892A" strokeWidth="2.5" />
                {/* Overdue Line (terracotta) */}
                <path d="M10,95 Q50,90 100,92 T200,88 T290,85" fill="none" stroke="#C4695A" strokeWidth="2.5" />
              </svg>
              
              {/* Tooltip Overlay */}
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
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Apr 2026</div>
                <div style={{ color: '#E8760A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Completed</span> <strong>132</strong></div>
                <div style={{ color: '#B8892A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>In Progress</span> <strong>68</strong></div>
                <div style={{ color: '#C4695A', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><span>Overdue</span> <strong>16</strong></div>
              </div>
            </div>
            
            {/* X Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.25rem' }}>
              <span>Jan 2026</span>
              <span>Feb 2026</span>
              <span>Mar 2026</span>
              <span>Apr 2026</span>
              <span>May 2026</span>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Compliance Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '150px' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#C4695A" strokeWidth="3" strokeDasharray="100 0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#B8892A" strokeWidth="3.2" strokeDasharray="88 12" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.5" strokeDasharray="63 37" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1, fontFamily: 'var(--font-serif), Georgia, serif' }}>248</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Compliant', val: '156', pct: '63%', color: '#E8760A' },
                { name: 'At Risk', val: '62', pct: '25%', color: '#B8892A' },
                { name: 'Non Compliant', val: '30', pct: '12%', color: '#C4695A' }
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
            {[
              { client: 'ABC Trading LLC', details: 'VAT Return - Q1 2026', badge: '2 Days Overdue', isOverdue: true },
              { client: 'XYZ Holdings', details: 'VAT Return - Apr 2026', badge: '3 Days Left', isOverdue: false },
              { client: 'Alpha Tech FZCO', details: 'VAT Return - Apr 2026', badge: '5 Days Left', isOverdue: false },
              { client: 'Beta Industries', details: 'VAT Return - Apr 2026', badge: '7 Days Left', isOverdue: false },
              { client: 'Gamma Solutions', details: 'VAT Return - Mar 2026', badge: '10 Days Left', isOverdue: false }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
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
            ))}
          </div>
        </div>

        {/* CT Filings Due */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>CT Filings Due</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { client: 'ABC Trading LLC', details: 'CT Return - FY 2025', badge: '5 Days Overdue', isOverdue: true },
              { client: 'Delta Properties', details: 'CT Return - FY 2025', badge: '2 Days Left', isOverdue: false },
              { client: 'XYZ Holdings', details: 'CT Return - FY 2025', badge: '6 Days Left', isOverdue: false },
              { client: 'Prime Consultants', details: 'CT Return - FY 2025', badge: '12 Days Left', isOverdue: false },
              { client: 'Nova Logistics', details: 'CT Return - FY 2025', badge: '18 Days Left', isOverdue: false }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
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
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent Activity</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                desc: 'Books completed for ABC Trading LLC',
                user: 'by John Doe',
                time: '2h ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )
              },
              {
                desc: 'VAT return filed for XYZ Holdings',
                user: 'by Sarah Khan',
                time: '4h ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                )
              },
              {
                desc: 'Reconciliation completed for Alpha Tech',
                user: 'by Mike Brown',
                time: '6h ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              },
              {
                desc: 'KYC document verified for Beta Industries',
                user: 'by Priya Nair',
                time: '1d ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                )
              },
              {
                desc: 'QBO sync successful for Gamma Solutions',
                user: 'by System',
                time: '1d ago',
                icon: (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                )
              }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
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
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628', lineHeight: 1.25 }}>{item.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.125rem' }}>
                    <span>{item.user}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
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
              <button key={idx} style={{
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
                          { label: 'Books Completed', val: '120', color: '#E8760A' },
                          { label: 'Books Pending', val: '18', color: '#B8892A' },
                          { label: 'Reconciliation Pending', val: '32', color: '#C4695A' },
                          { label: 'VAT Pending', val: '9', color: '#2A1628' },
                          { label: 'CT Pending', val: '4', color: '#E8760A' },
                          { label: 'AI Queue Active', val: '86', color: '#5A2D5A' }
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
                    {renderWidgetState('Firm Health Score', (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '100%' }}>
                        <div style={{ position: 'relative', width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="76" height="76" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(42,22,40,0.05)" strokeWidth="3.5" />
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.5" strokeDasharray="89 11" />
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
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2A1628', fontFamily: 'Georgia, serif' }}>89%</div>
                            <span style={{ fontSize: '0.45rem', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>+2% Trend</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, fontSize: '0.65rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(42,22,40,0.6)' }}>Excellent</span>
                            <strong style={{ color: '#16A34A' }}>156 cls</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(42,22,40,0.6)' }}>Healthy</span>
                            <strong style={{ color: '#E8760A' }}>62 cls</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'rgba(42,22,40,0.6)' }}>Review</span>
                            <strong style={{ color: '#B8892A' }}>21 cls</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Deadlines Timeline */}
                  <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Deadlines Timeline</h4>
                    {renderWidgetState('Deadlines Timeline', (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[
                          { time: 'Today', items: [{ text: 'VAT Return (ABC)', type: 'VAT' }] },
                          { time: 'Tomorrow', items: [{ text: 'Books Review', type: 'Books' }] },
                          { time: 'Next 7D', items: [{ text: 'CT Return (XYZ)', type: 'Tax' }] }
                        ].map((group, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.5rem', borderBottom: idx < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.25rem' }}>
                            <span style={{ width: '55px', fontSize: '0.65rem', fontWeight: 700, color: '#E8760A', flexShrink: 0 }}>{group.time}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                              {group.items.map((item, itemIdx) => (
                                <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', alignItems: 'center' }}>
                                  <span style={{ color: '#2A1628', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{item.text}</span>
                                  <span style={{ fontSize: '0.5rem', fontWeight: 700, padding: '0.05rem 0.2rem', borderRadius: '3px', background: 'rgba(42,22,40,0.05)', color: 'rgba(42,22,40,0.6)' }}>{item.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
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
                        {[
                          { title: 'Highest Performing Manager', detail: 'Sarah Khan (98%)', badge: 'Leader', color: '#E8760A' },
                          { title: 'Most Active Client', detail: 'ABC Trading (42 docs)', badge: 'Active', color: '#B8892A' },
                          { title: 'Most Delayed Client', detail: 'Beta Ind. (VAT overdue 9d)', badge: 'Action', color: '#C4695A' },
                          { title: 'Compliance Improvement', detail: '+14% compliant rate', badge: 'Improved', color: '#E8760A' }
                        ].map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.35rem' }}>
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628' }}>{item.title}</div>
                              <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.6)', marginTop: '1px' }}>{item.detail}</div>
                            </div>
                            <span style={{ fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.3rem', borderRadius: '3px', background: 'rgba(232, 118, 10, 0.05)', color: item.color }}>{item.badge}</span>
                          </div>
                        ))}
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
                        { status: 'Uploaded', count: '1,420', desc: 'Pending matching', color: '#E8760A' },
                        { status: 'Verified', count: '890', desc: 'Ready for ledger', color: '#16A34A' },
                        { status: 'OCR Pending', count: '48', desc: 'Queue processing', color: '#B8892A' },
                        { status: 'Rejected', count: '12', desc: 'Requires reupload', color: '#EF4444' },
                        { status: 'Missing', count: '36', desc: 'No uploads found', color: '#C4695A' },
                        { status: 'Expired', count: '9', desc: 'Needs renewal', color: '#5A2D5A' },
                        { status: 'Processing', count: '14', desc: 'Extracting data', color: '#2A1628' }
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
                      { stage: 'OCR', jobs: '142 jobs', success: '99.4%', time: '1.2s avg', fail: '0 fails' },
                      { stage: 'Extraction', jobs: '86 jobs', success: '97.2%', time: '3.4s avg', fail: '2 fails' },
                      { stage: 'Ledger', jobs: '64 jobs', success: '95.1%', time: '2.8s avg', fail: '3 fails' },
                      { stage: 'Matching', jobs: '42 jobs', success: '92.6%', time: '4.1s avg', fail: '3 fails' },
                      { stage: 'Reconciliation', jobs: '24 jobs', success: '91.3%', time: '6.2s avg', fail: '2 fails' },
                      { stage: 'Review', jobs: '18 jobs', success: '100%', time: 'Manual', fail: '0 fails' },
                      { stage: 'QBO Push', jobs: '12 jobs', success: '98.5%', time: '2.1s avg', fail: '1 fail' }
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
                
                {/* 3. TEAM WORKLOAD PANEL */}
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Team Workload Snapshot</h4>
                  {renderWidgetState('Team Workload', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { name: 'Alex Mercer (Bookkeeper)', clients: '42 clients', pending: '8 tasks', completed: '12 today', load: '92%', status: 'High Load', color: '#EF4444' },
                        { name: 'Emma Watson (Manager)', clients: '96 clients', pending: '3 reviews', completed: '8 today', load: '78%', status: 'Optimal', color: '#16A34A' },
                        { name: 'Liam Neeson (Compliance)', clients: '120 clients', pending: '14 alerts', completed: '24 today', load: '85%', status: 'Optimal', color: '#16A34A' },
                        { name: 'Sarah Khan (Senior Manager)', clients: '142 clients', pending: '2 reviews', completed: '14 today', load: '65%', status: 'Underloaded', color: '#B8892A' }
                      ].map((member, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{member.name}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>
                              <span>{member.clients}</span>
                              <span>•</span>
                              <span>{member.pending} pending</span>
                              <span>•</span>
                              <span style={{ color: '#E8760A' }}>{member.completed}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{member.load} Workload</div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: member.color }}>{member.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* 5. RECENT SYSTEM ALERTS */}
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent System Alerts</h4>
                  {renderWidgetState('System Alerts', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { client: 'ABC Trading LLC', error: 'AI Processing Failed - Invoice corrupted', time: '12 min ago', priority: 'High', color: '#EF4444' },
                        { client: 'XYZ Holdings', error: 'QBO Sync Error - Connection timeout', time: '40 min ago', priority: 'Medium', color: '#E8760A' },
                        { client: 'Alpha Tech FZCO', error: 'VAT Filing Overdue by 4 days', time: '2 hr ago', priority: 'High', color: '#EF4444' },
                        { client: 'Beta Industries', error: 'KYC Document Expiring in 5 days', time: '6 hr ago', priority: 'Low', color: '#B8892A' }
                      ].map((alert, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
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
                      ))}
                    </div>
                  ))}
                </div>

                {/* 13. QUICK NAVIGATION (Shortcuts) */}
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Quick Workspace ShortCuts</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {[
                      { name: 'Client List', desc: 'Manage CRM database', link: '#client-list' },
                      { name: 'AI Queue', desc: 'OCR & Extractor log', link: '#ai-queue' },
                      { name: 'Reconciliation', desc: 'Ledger discrepancy matching', link: '#reconciliation' },
                      { name: 'VAT Returns', desc: 'VAT Filing sheets', link: '#vat' },
                      { name: 'Corporate Tax', desc: 'CT returns center', link: '#corporate-tax' },
                      { name: 'Reports', desc: 'Accounting charts', link: '#reports' },
                      { name: 'QuickBooks', desc: 'Sync log status', link: '#quickbooks' },
                      { name: 'Vendors', desc: 'AP suppliers center', link: '#vendors' },
                      { name: 'Settings', desc: 'Pipelines & stages', link: '#settings' }
                    ].map((shortcut, idx) => (
                      <div 
                        key={idx} 
                        style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 150ms ease' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2A1628';
                          e.currentTarget.style.borderColor = '#2A1628';
                          const title = e.currentTarget.querySelector('.s-title') as HTMLElement;
                          const desc = e.currentTarget.querySelector('.s-desc') as HTMLElement;
                          if (title) title.style.color = '#ffffff';
                          if (desc) desc.style.color = 'rgba(255,255,255,0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FAF8F5';
                          e.currentTarget.style.borderColor = 'rgba(42,22,40,0.06)';
                          const title = e.currentTarget.querySelector('.s-title') as HTMLElement;
                          const desc = e.currentTarget.querySelector('.s-desc') as HTMLElement;
                          if (title) title.style.color = '#2A1628';
                          if (desc) desc.style.color = 'rgba(42,22,40,0.4)';
                        }}
                      >
                        <span className="s-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628', transition: 'color 100ms' }}>{shortcut.name}</span>
                        <span className="s-desc" style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.4)', marginTop: '4px', transition: 'color 100ms' }}>{shortcut.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── ROW 4: RECENT CLIENT ONBOARDING & PERFORMANCE SNAPSHOT (2 columns) ── */}
              <div className="dashboard-row4-grid" style={{ display: 'grid', gap: '1.25rem' }}>
                
                {/* 7. RECENT CLIENT ONBOARDING */}
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Recent Client Onboarding</h4>
                  {renderWidgetState('Recent Onboarding', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { company: 'Nova Technologies', manager: 'Sarah Khan', date: '2 days ago', progress: 85, status: 'Setting up QBO' },
                        { company: 'Gulf Marketing', manager: 'John Doe', date: '4 days ago', progress: 60, status: 'KYC Verification' },
                        { company: 'Apex Real Estate', manager: 'Priya Nair', date: '1 week ago', progress: 100, status: 'Active' },
                        { company: 'Prime Consultancy', manager: 'Mike Brown', date: '2 weeks ago', progress: 100, status: 'Active' }
                      ].map((client, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{client.company}</div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Manager: {client.manager} • Onboarded {client.date}</div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, marginBottom: '2px' }}>
                              <span>{client.status}</span>
                              <span>{client.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${client.progress}%`, height: '100%', background: client.progress === 100 ? '#16A34A' : '#E8760A' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* 8. MANAGER PERFORMANCE SNAPSHOT */}
                <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Manager Performance Snapshot</h4>
                  {renderWidgetState('Manager Performance', (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { name: 'Sarah Khan', clients: '42 clients', rate: '98%', reviews: '3 reviews', time: '1.2 days avg' },
                        { name: 'John Doe', clients: '36 clients', rate: '94%', reviews: '1 review', time: '1.8 days avg' },
                        { name: 'Priya Nair', clients: '32 clients', rate: '91%', reviews: '5 reviews', time: '2.1 days avg' },
                        { name: 'Mike Brown', clients: '28 clients', rate: '89%', reviews: '4 reviews', time: '2.5 days avg' }
                      ].map((mgr, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{mgr.name}</div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Manages {mgr.clients} • {mgr.reviews} pending review</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A' }}>{mgr.rate} Completed Books</div>
                            <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)' }}>Avg Resolution: {mgr.time}</span>
                          </div>
                        </div>
                      ))}
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
