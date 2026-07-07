/* eslint-disable */
'use client';

import React, { useState } from 'react';

interface ReportItem {
  id: string;
  name: string;
  desc: string;
  type: string;
  typeBg: string;
  typeColor: string;
  client: string;
  period: string;
  generatedOn: string;
  status: 'Completed' | 'Failed';
  generatedBy: string;
  generatedByInitials: string;
  icon: React.ReactNode;
  iconBg: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: '1',
    name: 'Profit & Loss Statement',
    desc: 'Income and expense summary',
    type: 'P&L',
    typeBg: '#EFF6FF',
    typeColor: '#1E3A8A',
    client: 'ABC Trading LLC',
    period: 'Apr 2026',
    generatedOn: '07 May 2026, 10:30 AM',
    status: 'Completed',
    generatedBy: 'Mahesh Maddu',
    generatedByInitials: 'MM',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '2',
    name: 'Balance Sheet',
    desc: 'Assets, liabilities and equity',
    type: 'Balance Sheet',
    typeBg: '#ECFDF5',
    typeColor: '#065F46',
    client: 'XYZ Holdings Limited',
    period: 'Apr 2026',
    generatedOn: '07 May 2026, 09:15 AM',
    status: 'Completed',
    generatedBy: 'Priya Nair',
    generatedByInitials: 'PN',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '3',
    name: 'VAT Return Report',
    desc: 'VAT return for Apr 2026',
    type: 'VAT',
    typeBg: '#F3E8FF',
    typeColor: '#581C87',
    client: 'Alpha Tech FZCO',
    period: 'Q1 2026',
    generatedOn: '06 May 2026, 06:45 PM',
    status: 'Completed',
    generatedBy: 'Sneha Iyer',
    generatedByInitials: 'SI',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '4',
    name: 'Cash Flow Statement',
    desc: 'Cash flow summary',
    type: 'Cash Flow',
    typeBg: '#FEF3C7',
    typeColor: '#92400E',
    client: 'Delta Properties FZCO',
    period: 'Apr 2026',
    generatedOn: '06 May 2026, 04:20 PM',
    status: 'Completed',
    generatedBy: 'Rohit Sharma',
    generatedByInitials: 'RS',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '5',
    name: 'Corporate Tax Report',
    desc: 'Tax computation FY 2025',
    type: 'Corporate Tax',
    typeBg: '#F0F6FC',
    typeColor: '#1E3A8A',
    client: 'Beta Industries LLC',
    period: 'FY 2025',
    generatedOn: '05 May 2026, 11:10 AM',
    status: 'Completed',
    generatedBy: 'Mahesh Maddu',
    generatedByInitials: 'MM',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '6',
    name: 'General Ledger Report',
    desc: 'Detailed ledger transactions',
    type: 'General Ledger',
    typeBg: '#FAF8F5',
    typeColor: '#2A1628',
    client: 'Gamma Solutions FZCO',
    period: 'Apr 2026',
    generatedOn: '05 May 2026, 09:40 AM',
    status: 'Completed',
    generatedBy: 'Priya Nair',
    generatedByInitials: 'PN',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '7',
    name: 'VAT Audit Report',
    desc: 'VAT audit for Jan - Mar 2026',
    type: 'VAT Audit',
    typeBg: '#F8F1F9',
    typeColor: '#581C87',
    client: 'Nova Hospitality LLC',
    period: 'Q1 2026',
    generatedOn: '04 May 2026, 03:30 PM',
    status: 'Failed',
    generatedBy: 'Sneha Iyer',
    generatedByInitials: 'SI',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    iconBg: '#FAF2EC'
  },
  {
    id: '8',
    name: 'Trial Balance',
    desc: 'Trial balance summary',
    type: 'Trial Balance',
    typeBg: '#F1F3F4',
    typeColor: '#5F6368',
    client: 'Prime Consultants FZCO',
    period: 'Apr 2026',
    generatedOn: '04 May 2026, 01:20 PM',
    status: 'Completed',
    generatedBy: 'Rohit Sharma',
    generatedByInitials: 'RS',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    iconBg: '#FAF2EC'
  }
];
export default function ReportsTab() {
  // Reports data state
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  // Generate Report Modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    reportName: '',
    client: 'ABC Trading LLC',
    generatedBy: 'Mahesh Maddu',
    generatedByInitials: 'MM',
    period: 'Apr 2026',
    status: 'Completed' as 'Completed' | 'Failed'
  });
  
  const [genClientDropdownOpen, setGenClientDropdownOpen] = useState(false);
  const [genByDropdownOpen, setGenByDropdownOpen] = useState(false);
  const [genPeriodDropdownOpen, setGenPeriodDropdownOpen] = useState(false);
  const [genStatusDropdownOpen, setGenStatusDropdownOpen] = useState(false);

  // Modal open states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [newReportOpen, setNewReportOpen] = useState(false);

  // New report form states
  const [newReportForm, setNewReportForm] = useState({
    client: 'ABC Trading LLC',
    type: 'Profit & Loss Statement',
    period: 'Apr 2026',
    format: 'xlsx'
  });
  const [modalClientOpen, setModalClientOpen] = useState(false);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [modalPeriodOpen, setModalPeriodOpen] = useState(false);
  
  // Schedule modal state
  const [scheduleFrequency, setScheduleFrequency] = useState('Every Monday');
  const [modalFrequencyOpen, setModalFrequencyOpen] = useState(false);

  // Date picker states
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-07');
  const [tempStartDate, setTempStartDate] = useState('2026-05-01');
  const [tempEndDate, setTempEndDate] = useState('2026-05-07');

  const [filters, setFilters] = useState({
    type: 'All',
    client: 'All',
    status: 'All'
  });

  const filterOptions = {
    type: ['All', 'P&L', 'Balance Sheet', 'VAT', 'Cash Flow', 'Corporate Tax', 'General Ledger'],
    client: ['All', 'ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC'],
    status: ['All', 'Completed', 'Failed']
  };

  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const toggleSelectAll = () => {
    if (selectedRows.length === reports.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(reports.map(r => r.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(x => x !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const formatDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1];
        const year = parts[0];
        return `${day} ${month} ${year}`;
      }
    } catch (e) {}
    return dStr;
  };

  const filteredReports = reports.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesType = filters.type === 'All' || item.type === filters.type;
    const matchesClient = filters.client === 'All' || item.client === filters.client;
    const matchesStatus = filters.status === 'All' || item.status === filters.status;
    return matchesSearch && matchesType && matchesClient && matchesStatus;
  });

  return (
    <div style={{
      color: '#2A1628',
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      background: 'transparent',
    }}>
      
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
              Accounting &gt; Reports
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
            Reports <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Generate, view and export financial and compliance reports for your clients.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#2A1628',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Report Settings
          </button>
          
          <button
            onClick={() => setScheduleOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#2A1628',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedule Report
          </button>
        </div>
      </div>

      {/* ── METRICS GRID (5 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total Reports', value: '268', sub: '+18 this month', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Generated This Month', value: '86', sub: '+12 vs last month', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Scheduled Reports', value: '24', sub: 'Active schedules', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Report Downloads', value: '142', sub: 'This month', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Failed Reports', value: '3', sub: 'View errors', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>, bg: '#FEF2F2', border: '#FECACA' },
        ].map((card, i) => (
          <div key={i} style={{
            background: '#ffffff',
            border: '1px solid rgba(42,22,40,0.06)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
            minHeight: '105px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2, flex: 1, marginRight: '0.5rem' }}>{card.label}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: card.bg,
                border: `1px solid ${card.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8760A',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2A1628', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(42,22,40,0.06)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(42,22,40,0.01)'
      }}>
        {/* Search box */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.35)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search reports by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', fontSize: '0.8125rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box' }}
          />
        </div>

        {/* Custom filter dropdowns */}
        {['type', 'client', 'status'].map((key) => {
          const isOpen = activeDropdown === key;
          const selectedVal = filters[key as keyof typeof filters];
          const options = filterOptions[key as keyof typeof filterOptions];
          const label = key === 'type' ? 'Report Type' : key === 'client' ? 'Client' : 'Status';

          return (
            <div key={key} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(isOpen ? null : key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.8125rem',
                  border: '1px solid #DDD0C4',
                  borderRadius: '8px',
                  background: '#FAF8F5',
                  color: '#2A1628',
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                  justifyContent: 'space-between',
                  minWidth: key === 'type' ? '140px' : key === 'client' ? '130px' : '110px'
                }}
              >
                <span>{label}: {selectedVal}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div 
                  className="hide-scrollbar"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    background: '#ffffff',
                    border: '1px solid #DDD0C4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(42,22,40,0.08)',
                    zIndex: 30,
                    minWidth: '100%',
                    padding: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                  {options.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setFilters({ ...filters, [key]: option });
                        setActiveDropdown(null);
                      }}
                      style={{
                        padding: '0.4rem 0.625rem',
                        fontSize: '0.75rem',
                        color: '#2A1628',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: selectedVal === option ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                        fontWeight: selectedVal === option ? 600 : 400,
                        transition: 'all 100ms ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(232, 118, 10, 0.06)';
                        e.currentTarget.style.color = '#E8760A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedVal === option ? 'rgba(232, 118, 10, 0.06)' : 'transparent';
                        e.currentTarget.style.color = '#2A1628';
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Date range picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDatePickerOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAF8F5', border: '1px solid #DDD0C4', padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.8125rem', color: '#2A1628', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            {formatDate(startDate)} – {formatDate(endDate)}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(42,22,40,0.4)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          
          {datePickerOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(42,22,40,0.12)',
              zIndex: 30,
              padding: '1rem',
              width: '260px',
              fontFamily: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Start Date</label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={tempStartDate}
                  onChange={e => setTempStartDate(e.target.value)}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0.4rem 0.5rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>End Date</label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={tempEndDate}
                  onChange={e => setTempEndDate(e.target.value)}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0.4rem 0.5rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  onClick={() => { setTempStartDate(startDate); setTempEndDate(endDate); setDatePickerOpen(false); }}
                  style={{ flex: 1, padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', background: '#fff', color: '#2A1628', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setStartDate(tempStartDate); setEndDate(tempEndDate); setDatePickerOpen(false); }}
                  style={{ flex: 1, padding: '0.45rem', border: 'none', borderRadius: '6px', background: '#E8760A', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 6px rgba(232,118,10,0.2)' }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setFilters({ type: 'All', client: 'All', status: 'All' })}
          style={{
            padding: '0.55rem 1.25rem',
            fontSize: '0.8125rem',
            border: '1px solid #DDD0C4',
            borderRadius: '8px',
            background: '#FAF8F5',
            color: 'rgba(42,22,40,0.6)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 150ms ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#E8760A';
            e.currentTarget.style.borderColor = '#E8760A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FAF8F5';
            e.currentTarget.style.color = 'rgba(42,22,40,0.6)';
            e.currentTarget.style.borderColor = '#DDD0C4';
          }}
        >
          Reset
        </button>
      </div>

      {/* ── POPULAR REPORTS ROW ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Popular Reports</h3>
          <a href="#" style={{ fontSize: '0.75rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All Reports →</a>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          {[
            { title: 'Profit & Loss Statement', desc: 'View income, expenses and net profit for a period.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, bg: '#FAF2EC' },
            { title: 'Balance Sheet', desc: 'View assets, liabilities and equity as of a date.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, bg: '#FAF2EC' },
            { title: 'Cash Flow Statement', desc: 'Track cash inflows and outflows.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>, bg: '#FAF2EC' },
            { title: 'VAT Return Report', desc: 'Detailed VAT summary for returns and submissions.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>, bg: '#FAF2EC' },
            { title: 'Corporate Tax Report', desc: 'Tax computation and compliance summary.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>, bg: '#FAF2EC' },
            { title: 'General Ledger', desc: 'Detailed general ledger transactions.', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, bg: '#FAF2EC' }
          ].map((report, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid rgba(42,22,40,0.06)',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 4px 12px rgba(42,22,40,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '180px'
            }}>
              <div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: report.bg,
                  border: '1px solid #F3DEC9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E8760A',
                  marginBottom: '0.75rem'
                }}>
                  {report.icon}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', marginBottom: '0.35rem', lineHeight: 1.2 }}>{report.title}</div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.5)', lineHeight: 1.3 }}>{report.desc}</div>
              </div>
              <button 
                onClick={() => {
                  setGenerateForm({
                    reportName: report.title,
                    client: '',
                    generatedBy: '',
                    generatedByInitials: '',
                    period: '',
                    status: '' as any
                  });
                  setGenerateModalOpen(true);
                }}
                style={{
                  background: '#FAF8F5',
                  border: '1px solid #DDD0C4',
                  color: '#2A1628',
                  borderRadius: '6px',
                  padding: '0.4rem 0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2A1628';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#2A1628';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FAF8F5';
                  e.currentTarget.style.color = '#2A1628';
                  e.currentTarget.style.borderColor = '#DDD0C4';
                }}
              >
                Generate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── ALL REPORTS LIST TABLE ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>All Reports</h3>
        </div>

        <div className="client-table-scroll" style={{
          background: '#ffffff',
          border: '1px solid rgba(42,22,40,0.06)',
          borderRadius: '16px',
          overflowX: 'auto',
          boxShadow: '0 4px 12px rgba(42,22,40,0.01)'
        }}>
          <style>{`
            .client-table-scroll::-webkit-scrollbar { height: 6px; }
            .client-table-scroll::-webkit-scrollbar-track { background: rgba(42,22,40,0.03); border-radius: 4px; }
            .client-table-scroll::-webkit-scrollbar-thumb { background: rgba(42,22,40,0.15); border-radius: 4px; }
            .client-table-scroll::-webkit-scrollbar-thumb:hover { background: rgba(42,22,40,0.25); }
          `}</style>
          <table style={{ width: '100%', minWidth: '1350px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <th style={{ 
                  padding: '1rem 0.75rem', 
                  width: '48px', 
                  textAlign: 'center', 
                  position: 'sticky', 
                  left: 0, 
                  background: '#FAF8F5', 
                  zIndex: 10 
                }}>
                  <div 
                    onClick={toggleSelectAll}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: selectedRows.length === INITIAL_REPORTS.length ? '1px solid #E8760A' : '1px solid #DDD0C4',
                      background: selectedRows.length === INITIAL_REPORTS.length ? '#E8760A' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 150ms ease',
                      margin: '0 auto'
                    }}
                  >
                    {selectedRows.length === INITIAL_REPORTS.length && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </th>
                <th style={{ 
                  padding: '1rem', 
                  position: 'sticky', 
                  left: '48px', 
                  background: '#FAF8F5', 
                  zIndex: 10, 
                  borderRight: '1px solid #DDD0C4' 
                }}>REPORT NAME</th>
                <th style={{ padding: '1rem' }}>REPORT TYPE</th>
                <th style={{ padding: '1rem' }}>CLIENT / COMPANY</th>
                <th style={{ padding: '1rem' }}>PERIOD</th>
                <th style={{ padding: '1rem' }}>GENERATED ON</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>GENERATED BY</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item, idx) => (
                <tr key={item.id} style={{
                  borderBottom: idx < filteredReports.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                  background: selectedRows.includes(item.id) ? 'rgba(232,118,10,0.02)' : 'transparent'
                }}>
                  <td style={{ 
                    padding: '1rem 0.75rem', 
                    textAlign: 'center',
                    position: 'sticky',
                    left: 0,
                    background: selectedRows.includes(item.id) ? '#FAF4EE' : '#ffffff',
                    zIndex: 9
                  }}>
                    <div 
                      onClick={() => handleSelectOne(item.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: selectedRows.includes(item.id) ? '1px solid #E8760A' : '1px solid #DDD0C4',
                        background: selectedRows.includes(item.id) ? '#E8760A' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all 150ms ease',
                        margin: '0 auto'
                      }}
                    >
                      {selectedRows.includes(item.id) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </td>
                  
                  {/* Report Name details */}
                  <td style={{ 
                    padding: '1rem',
                    position: 'sticky',
                    left: '48px',
                    background: selectedRows.includes(item.id) ? '#FAF4EE' : '#ffffff',
                    zIndex: 9,
                    borderRight: '1px solid #DDD0C4',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#FAF2EC',
                        border: '1px solid #F3DEC9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E8760A',
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{item.desc}</div>
                      </div>
                    </div>
                  </td>

                  {/* Report Type Badge */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: item.typeBg,
                      color: item.typeColor,
                      border: `1px solid ${item.typeColor}20`
                    }}>{item.type}</span>
                  </td>

                  {/* Client company */}
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>
                    {item.client}
                  </td>

                  {/* Period */}
                  <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.8)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.period}
                  </td>

                  {/* Generated On */}
                  <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.generatedOn}
                  </td>

                  {/* Status badge */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.status === 'Completed' ? 'rgba(4, 120, 87, 0.08)' : 'rgba(196, 105, 90, 0.08)',
                      color: item.status === 'Completed' ? '#047857' : '#C4695A'
                    }}>
                      {item.status}
                    </span>
                  </td>

                  {/* Generated By */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(232, 118, 10, 0.08)',
                        color: '#E8760A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {item.generatedByInitials}
                      </div>
                      <span style={{ fontWeight: 500, color: '#2A1628' }}>{item.generatedBy}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', opacity: 0.6, display: 'flex', padding: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      </button>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', opacity: 0.6, display: 'flex', padding: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION FOOTER ── */}
        <div style={{
          background: '#FAF8F5',
          border: '1px solid rgba(42,22,40,0.06)',
          borderRadius: '0 0 16px 16px',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'rgba(42,22,40,0.6)',
          marginTop: '-1px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Rows per page:</span>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRowsPerPageOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  border: '1px solid #DDD0C4', borderRadius: '6px',
                  padding: '0.2rem 0.5rem', background: '#fff',
                  fontSize: '0.75rem', color: '#2A1628', cursor: 'pointer',
                  fontFamily: 'var(--font-sans), Inter, sans-serif'
                }}
              >
                {rowsPerPage}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {rowsPerPageOpen && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 4px)', left: 0,
                  background: '#fff', border: '1px solid #DDD0C4',
                  borderRadius: '8px', boxShadow: '0 4px 16px rgba(42,22,40,0.1)',
                  zIndex: 100, minWidth: '60px', overflow: 'hidden'
                }}>
                  {[10, 20, 50].map(n => (
                    <div
                      key={n}
                      onClick={() => { setRowsPerPage(n); setRowsPerPageOpen(false); }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        color: rowsPerPage === n ? '#E8760A' : '#2A1628',
                        background: rowsPerPage === n ? 'rgba(232,118,10,0.06)' : 'transparent',
                        fontWeight: rowsPerPage === n ? 600 : 400
                      }}
                      onMouseEnter={e => { if (rowsPerPage !== n) (e.currentTarget as HTMLDivElement).style.background = 'rgba(232,118,10,0.04)'; }}
                      onMouseLeave={e => { if (rowsPerPage !== n) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}>◀</button>
            <button style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>1</button>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>2</button>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>3</button>
            <span style={{ padding: '0 0.25rem' }}>...</span>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>27</button>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>▶</button>
          </div>
        </div>
      </div>

      {/* ── 1. REPORT SETTINGS MODAL ── */}
      {settingsOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '440px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Report Settings</h3>
              </div>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Auto-export on completion</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Compress generated zip archives</span>
                <input type="checkbox" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Include audit trails in headers</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setSettingsOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { alert('Settings saved successfully!'); setSettingsOpen(false); }} style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. SCHEDULE REPORT MODAL ── */}
      {scheduleOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '440px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Schedule Auto-Report</h3>
              </div>
              <button onClick={() => setScheduleOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Frequency</label>
                <button
                  onClick={() => setModalFrequencyOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {scheduleFrequency}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalFrequencyOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Every Monday', '1st of Every Month', 'Quarterly'].map(f => (
                      <div
                        key={f}
                        onClick={() => {
                          setScheduleFrequency(f);
                          setModalFrequencyOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: scheduleFrequency === f ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: scheduleFrequency === f ? 600 : 400
                        }}
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Email Recipients</label>
                <input type="text" placeholder="recipients@company.com" style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setScheduleOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { alert('Schedule established successfully!'); setScheduleOpen(false); }} style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Establish Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. NEW REPORT MODAL ── */}
      {newReportOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '480px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Generate New Report</h3>
              </div>
              <button onClick={() => setNewReportOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Select report details to build a new financial log.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Client Selector */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Client / Company</label>
                <button
                  onClick={() => setModalClientOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {newReportForm.client}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalClientOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px',
                    maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {['ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC'].map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          setNewReportForm({ ...newReportForm, client: c });
                          setModalClientOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: newReportForm.client === c ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: newReportForm.client === c ? 600 : 400
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Type Selector */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Report Type</label>
                <button
                  onClick={() => setModalTypeOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {newReportForm.type}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalTypeOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Profit & Loss Statement', 'Balance Sheet', 'Cash Flow Statement', 'VAT Return Report', 'Corporate Tax Report'].map(t => (
                      <div
                        key={t}
                        onClick={() => {
                          setNewReportForm({ ...newReportForm, type: t });
                          setModalTypeOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: newReportForm.type === t ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: newReportForm.type === t ? 600 : 400
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Period Selector */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Period</label>
                <button
                  onClick={() => setModalPeriodOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {newReportForm.period}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalPeriodOpen && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 -4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Apr 2026', 'Q1 2026', 'FY 2025'].map(p => (
                      <div
                        key={p}
                        onClick={() => {
                          setNewReportForm({ ...newReportForm, period: p });
                          setModalPeriodOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: newReportForm.period === p ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: newReportForm.period === p ? 600 : 400
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Format selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Output Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {['xlsx', 'pdf', 'csv'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setNewReportForm({ ...newReportForm, format: fmt })}
                      style={{
                        padding: '0.55rem', borderRadius: '8px', border: `1px solid ${newReportForm.format === fmt ? '#E8760A' : '#DDD0C4'}`,
                        background: newReportForm.format === fmt ? 'rgba(232,118,10,0.04)' : '#ffffff',
                        color: newReportForm.format === fmt ? '#E8760A' : '#2A1628', fontWeight: 600,
                        fontSize: '0.8125rem', cursor: 'pointer', textTransform: 'uppercase',
                        fontFamily: 'inherit', transition: 'all 150ms ease'
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setNewReportOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { alert('New report generation queued successfully!'); setNewReportOpen(false); }} style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}>Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. POPULAR REPORT GENERATOR MODAL ── */}
      {generateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '460px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Generate {generateForm.reportName}</h3>
              </div>
              <button onClick={() => setGenerateModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Report Type Display */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Selected Report</label>
                <input
                  type="text"
                  readOnly
                  value={generateForm.reportName}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
                />
              </div>

              {/* Company selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Company Name</label>
                <button
                  onClick={() => setGenClientDropdownOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: generateForm.client ? '#2A1628' : 'rgba(42,22,40,0.4)', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {generateForm.client || 'Select Company...'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {genClientDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC'].map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          setGenerateForm({ ...generateForm, client: c });
                          setGenClientDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: generateForm.client === c ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: generateForm.client === c ? 600 : 400
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Generated By Selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Generated By</label>
                <button
                  onClick={() => setGenByDropdownOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: generateForm.generatedBy ? '#2A1628' : 'rgba(42,22,40,0.4)', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {generateForm.generatedBy || 'Select User...'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {genByDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {[
                      { name: 'Mahesh Maddu', init: 'MM' },
                      { name: 'Priya Nair', init: 'PN' },
                      { name: 'Sneha Iyer', init: 'SI' },
                      { name: 'Rohit Sharma', init: 'RS' }
                    ].map(u => (
                      <div
                        key={u.name}
                        onClick={() => {
                          setGenerateForm({ ...generateForm, generatedBy: u.name, generatedByInitials: u.init });
                          setGenByDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: generateForm.generatedBy === u.name ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: generateForm.generatedBy === u.name ? 600 : 400
                        }}
                      >
                        {u.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Period selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Period</label>
                <button
                  onClick={() => setGenPeriodDropdownOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: generateForm.period ? '#2A1628' : 'rgba(42,22,40,0.4)', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {generateForm.period || 'Select Period...'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {genPeriodDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Apr 2026', 'Q1 2026', 'FY 2025'].map(p => (
                      <div
                        key={p}
                        onClick={() => {
                          setGenerateForm({ ...generateForm, period: p });
                          setGenPeriodDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: generateForm.period === p ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: generateForm.period === p ? 600 : 400
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status selection */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Filing Status</label>
                <button
                  onClick={() => setGenStatusDropdownOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: generateForm.status ? '#2A1628' : 'rgba(42,22,40,0.4)', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {generateForm.status || 'Select Status...'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {genStatusDropdownOpen && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 -4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Completed', 'Failed'].map(s => (
                      <div
                        key={s}
                        onClick={() => {
                          setGenerateForm({ ...generateForm, status: s as 'Completed' | 'Failed' });
                          setGenStatusDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: generateForm.status === s ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: generateForm.status === s ? 600 : 400
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setGenerateModalOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button 
                onClick={() => {
                  // Determine appropriate icon/badge details
                  let shortType = 'P&L';
                  let tColor = '#1E3A8A';
                  let tBg = '#EFF6FF';
                  let iconNode = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
                  
                  if (generateForm.reportName.includes('Balance Sheet')) {
                    shortType = 'Balance Sheet';
                    tColor = '#065F46';
                    tBg = '#ECFDF5';
                    iconNode = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
                  } else if (generateForm.reportName.includes('Cash Flow')) {
                    shortType = 'Cash Flow';
                    tColor = '#92400E';
                    tBg = '#FEF3C7';
                    iconNode = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>;
                  } else if (generateForm.reportName.includes('VAT')) {
                    shortType = 'VAT';
                    tColor = '#581C87';
                    tBg = '#F3E8FF';
                    iconNode = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
                  } else if (generateForm.reportName.includes('Corporate Tax')) {
                    shortType = 'Corporate Tax';
                    tColor = '#1E3A8A';
                    tBg = '#F0F6FC';
                    iconNode = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
                  } else if (generateForm.reportName.includes('Ledger')) {
                    shortType = 'General Ledger';
                    tColor = '#2A1628';
                    tBg = '#FAF8F5';
                    iconNode = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
                  }

                  const newReportItem: ReportItem = {
                    id: String(reports.length + 1),
                    name: generateForm.reportName,
                    desc: `${generateForm.reportName.replace(' Report', '').replace(' Statement', '')} summary`,
                    type: shortType,
                    typeBg: tBg,
                    typeColor: tColor,
                    client: generateForm.client,
                    period: generateForm.period,
                    generatedOn: new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                    status: generateForm.status,
                    generatedBy: generateForm.generatedBy,
                    generatedByInitials: generateForm.generatedByInitials,
                    icon: iconNode,
                    iconBg: '#FAF2EC'
                  };

                  setReports([newReportItem, ...reports]);
                  setGenerateModalOpen(false);
                }}
                style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
