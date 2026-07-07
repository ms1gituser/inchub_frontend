/* eslint-disable */
'use client';

import React, { useState } from 'react';

interface CtReturnItem {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  type: 'Mainland' | 'Free Zone';
  trn: string;
  taxYear: string;
  status: 'Filed On Time' | 'Overdue' | 'In Review' | 'Filed Late' | 'Not Required';
  dueDate: string;
  dueWarning: string;
  isWarningRed: boolean;
  taxableIncome: string;
  taxPayable: string;
  taxPaid: string;
  isPaidGreen: boolean;
  outstanding: string;
  isOutRed: boolean;
  lastActivity: string;
}

const INITIAL_RETURNS: CtReturnItem[] = [
  {
    id: '1',
    initials: 'AB',
    avatarBg: '#7C2D12',
    name: 'ABC Trading LLC',
    type: 'Mainland',
    trn: '100556789600003',
    taxYear: '2024',
    status: 'Filed On Time',
    dueDate: '28 May 2025',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '4,250,000',
    taxPayable: '102,000',
    taxPaid: '102,000',
    isPaidGreen: true,
    outstanding: '0',
    isOutRed: false,
    lastActivity: '28 Apr 2025'
  },
  {
    id: '2',
    initials: 'XY',
    avatarBg: '#1E3A8A',
    name: 'XYZ Holdings Limited',
    type: 'Free Zone',
    trn: '100556789600004',
    taxYear: '2024',
    status: 'Overdue',
    dueDate: '28 May 2025',
    dueWarning: 'Due in 2 Days',
    isWarningRed: true,
    taxableIncome: '2,750,000',
    taxPayable: '66,000',
    taxPaid: '0',
    isPaidGreen: false,
    outstanding: '66,600',
    isOutRed: true,
    lastActivity: '25 Apr 2025'
  },
  {
    id: '3',
    initials: 'DP',
    avatarBg: '#14532D',
    name: 'Delta Properties FZCO',
    type: 'Free Zone',
    trn: '100556789600005',
    taxYear: '2024',
    status: 'In Review',
    dueDate: '15 Jun 2025',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '3,980,000',
    taxPayable: '95,520',
    taxPaid: '-',
    isPaidGreen: false,
    outstanding: '95,520',
    isOutRed: true,
    lastActivity: '30 Apr 2025'
  },
  {
    id: '4',
    initials: 'AT',
    avatarBg: '#3B0764',
    name: 'Alpha Tech FZCO',
    type: 'Free Zone',
    trn: '100556789600006',
    taxYear: '2024',
    status: 'Filed Late',
    dueDate: '28 Apr 2025',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '1,850,000',
    taxPayable: '44,400',
    taxPaid: '44,400',
    isPaidGreen: true,
    outstanding: '0',
    isOutRed: false,
    lastActivity: '15 Apr 2025'
  },
  {
    id: '5',
    initials: 'BI',
    avatarBg: '#052E16',
    name: 'Beta Industries LLC',
    type: 'Mainland',
    trn: '100556789600007',
    taxYear: '2024',
    status: 'Filed On Time',
    dueDate: '28 May 2025',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '5,600,000',
    taxPayable: '134,400',
    taxPaid: '134,400',
    isPaidGreen: true,
    outstanding: '0',
    isOutRed: false,
    lastActivity: '27 Apr 2025'
  },
  {
    id: '6',
    initials: 'GS',
    avatarBg: '#1e1b4b',
    name: 'Gamma Solutions FZCO',
    type: 'Free Zone',
    trn: '100556789600008',
    taxYear: '2024',
    status: 'Overdue',
    dueDate: '28 May 2025',
    dueWarning: 'Due in 2 Days',
    isWarningRed: true,
    taxableIncome: '1,250,000',
    taxPayable: '30,000',
    taxPaid: '0',
    isPaidGreen: false,
    outstanding: '30,000',
    isOutRed: true,
    lastActivity: '22 Apr 2025'
  },
  {
    id: '7',
    initials: 'NH',
    avatarBg: '#7C2D12',
    name: 'Nova Hospitality LLC',
    type: 'Mainland',
    trn: '100556789600009',
    taxYear: '2024',
    status: 'In Review',
    dueDate: '15 Jun 2025',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '3,100,000',
    taxPayable: '74,400',
    taxPaid: '-',
    isPaidGreen: false,
    outstanding: '74,400',
    isOutRed: true,
    lastActivity: '29 Apr 2025'
  },
  {
    id: '8',
    initials: 'PC',
    avatarBg: '#1E3A8A',
    name: 'Prime Consultants FZCO',
    type: 'Free Zone',
    trn: '100556789600010',
    taxYear: '2024',
    status: 'Not Required',
    dueDate: '-',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '-',
    taxPayable: '-',
    taxPaid: '-',
    isPaidGreen: false,
    outstanding: '-',
    isOutRed: false,
    lastActivity: '10 Apr 2025'
  },
  {
    id: '9',
    initials: 'SS',
    avatarBg: '#14532D',
    name: 'Sigma Services LLC',
    type: 'Mainland',
    trn: '100556789600011',
    taxYear: '2024',
    status: 'Filed Late',
    dueDate: '20 Apr 2025',
    dueWarning: '',
    isWarningRed: false,
    taxableIncome: '2,420,000',
    taxPayable: '58,080',
    taxPaid: '58,080',
    isPaidGreen: true,
    outstanding: '0',
    isOutRed: false,
    lastActivity: '18 Apr 2025'
  },
  {
    id: '10',
    initials: 'TE',
    avatarBg: '#3B0764',
    name: 'Vertex Enterprises LLC',
    type: 'Mainland',
    trn: '100556789600012',
    taxYear: '2024',
    status: 'Overdue',
    dueDate: '28 May 2025',
    dueWarning: 'Due in 2 Days',
    isWarningRed: true,
    taxableIncome: '6,750,000',
    taxPayable: '162,000',
    taxPaid: '20,000',
    isPaidGreen: false,
    outstanding: '142,000',
    isOutRed: true,
    lastActivity: '26 Apr 2025'
  }
];

export default function CorporateTaxTab() {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Date states
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-07');
  const [tempStartDate, setTempStartDate] = useState('2026-05-01');
  const [tempEndDate, setTempEndDate] = useState('2026-05-07');

  const [trendRange, setTrendRange] = useState('Last 6 Months');
  const [trendRangeOpen, setTrendRangeOpen] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [newReturnOpen, setNewReturnOpen] = useState(false);

  // New return form state
  const [newReturnForm, setNewReturnForm] = useState({
    client: 'ABC Trading LLC',
    trn: '100556789600003',
    taxYear: '2024',
    dueDate: '28 May 2025',
    status: 'Draft',
    payable: '',
    paid: '',
    taxableIncome: ''
  });
  const [modalClientOpen, setModalClientOpen] = useState(false);
  const [modalYearOpen, setModalYearOpen] = useState(false);
  const [modalStatusOpen, setModalStatusOpen] = useState(false);

  // Reports form state
  const [reportType, setReportType] = useState('Filing Summary');
  const [reportFormat, setReportFormat] = useState('xlsx');
  const [reportDateRange, setReportDateRange] = useState('Last 6 Months');
  const [modalReportTypeOpen, setModalReportTypeOpen] = useState(false);
  const [modalReportRangeOpen, setModalReportRangeOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: 'All',
    taxYear: 'All',
    type: 'All',
    manager: 'All'
  });

  const filterOptions = {
    status: ['All', 'Overdue', 'Filed On Time', 'Filed Late', 'In Review', 'Not Required'],
    taxYear: ['All', '2024', '2023'],
    type: ['All', 'Mainland', 'Free Zone'],
    manager: ['All', 'John Doe', 'Priya Nair', 'Mike Brown', 'Sneha Iyer']
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(INITIAL_RETURNS.map(r => r.id));
    } else {
      setSelectedRows([]);
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

  // Filter returns based on search and parameters
  const filteredReturns = INITIAL_RETURNS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.trn.includes(search);
    const matchesStatus = filters.status === 'All' || item.status === filters.status;
    const matchesYear = filters.taxYear === 'All' || item.taxYear === filters.taxYear;
    const matchesType = filters.type === 'All' || item.type === filters.type;
    return matchesSearch && matchesStatus && matchesYear && matchesType;
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
              Accounting &gt; Corporate Tax
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
            Corporate <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Tax</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Track corporate tax obligations, filings, payments and compliance for all clients.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setCalendarOpen(true)}
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
            CT Calendar
          </button>
          
          <button
            onClick={() => setReportsOpen(true)}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            CT Reports
          </button>

          <button
            onClick={() => setNewReturnOpen(true)}
            style={{
              background: '#2A1628',
              color: '#ffffff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(42,22,40,0.15)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New CT Filing
          </button>
        </div>
      </div>

      {/* ── METRICS GRID (7 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'CT Filings Due', value: '4', sub: '+1 this week', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Returns Overdue', value: '2', sub: '-1 vs last week', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Filed This Year', value: '18', sub: '+4 vs last year', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'In Review', value: '6', sub: '6 active', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Total Tax Payable', value: 'AED 2.14M', sub: 'This Year', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Total Tax Paid', value: 'AED 1.28M', sub: 'This Year', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Potential Exposure', value: 'AED 312K', sub: 'Estimated', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
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
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2A1628', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.25rem' }}>
        
        {/* Filing Status Overview Donut */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Filing Status Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '150px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FAF8F5" strokeWidth="3.2" strokeDasharray="100 0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A1829A" strokeWidth="3" strokeDasharray="8 92" strokeDashoffset="-92" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B6D83" strokeWidth="3" strokeDasharray="11 89" strokeDashoffset="-81" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A1628" strokeWidth="3.2" strokeDasharray="15 85" strokeDashoffset="-66" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E0A370" strokeWidth="3.4" strokeDasharray="18 82" strokeDashoffset="-48" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.6" strokeDasharray="48 52" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2A1628', lineHeight: 1 }}>248</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Clients</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, marginLeft: '1.5rem' }}>
              {[
                { name: 'Filed On Time', val: '120', pct: '48%', color: '#E8760A' },
                { name: 'Filed Late', val: '45', pct: '18%', color: '#E0A370' },
                { name: 'Overdue', val: '36', pct: '15%', color: '#2A1628' },
                { name: 'In Review', val: '28', pct: '11%', color: '#8B6D83' },
                { name: 'Not Required', val: '19', pct: '8%', color: '#A1829A' }
              ].map((leg, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: leg.color }} />
                    <span style={{ color: 'rgba(42,22,40,0.7)', fontWeight: 500 }}>{leg.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2A1628' }}>{leg.val} <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>({leg.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Corporate Tax Payable Trend Line Chart */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Corporate Tax Payable Trend</h3>
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setTrendRangeOpen(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  border: '1px solid #DDD0C4',
                  borderRadius: '6px',
                  background: '#ffffff',
                  color: '#2A1628',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'inherit'
                }}
              >
                {trendRange}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {trendRangeOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                  background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(42,22,40,0.08)', zIndex: 10, minWidth: '120px'
                }}>
                  {['Last 3 Months', 'Last 6 Months', 'Year to Date'].map((t) => (
                    <div
                      key={t}
                      onClick={() => { setTrendRange(t); setTrendRangeOpen(false); }}
                      style={{
                        padding: '0.4rem 0.625rem', fontSize: '0.75rem', color: '#2A1628',
                        cursor: 'pointer', background: trendRange === t ? '#FAF8F5' : 'transparent',
                        fontWeight: trendRange === t ? 600 : 400
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF8F5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = trendRange === t ? '#FAF8F5' : 'transparent'; }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '150px', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'relative', flex: 1, width: '100%', borderBottom: '1px solid rgba(42,22,40,0.05)', marginTop: '0.5rem' }}>
              <svg width="100%" height="110px" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path d="M10,65 L60,40 L120,55 L180,35 L240,48 L290,20" fill="none" stroke="#E8760A" strokeWidth="2" />
                <circle cx="10" cy="65" r="3" fill="#E8760A" stroke="#fff" strokeWidth="1" />
                <circle cx="60" cy="40" r="3" fill="#E8760A" stroke="#fff" strokeWidth="1" />
                <circle cx="120" cy="55" r="3" fill="#E0A370" stroke="#fff" strokeWidth="1" />
                <circle cx="180" cy="35" r="3" fill="#2A1628" stroke="#fff" strokeWidth="1" />
                <circle cx="240" cy="48" r="3" fill="#E8760A" stroke="#fff" strokeWidth="1" />
                <circle cx="290" cy="20" r="3" fill="#E8760A" stroke="#fff" strokeWidth="1" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.25rem' }}>
              <span>Dec 2024</span>
              <span>Jan 2025</span>
              <span>Feb 2025</span>
              <span>Mar 2025</span>
              <span>Apr 2025</span>
              <span>May 2025</span>
            </div>
          </div>
        </div>

        {/* Tax Year Summary */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Tax Year 2024 Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
            {[
              { name: 'Total Tax Payable', val: 'AED 2,145,300', color: '#2A1628' },
              { name: 'Total Tax Paid', val: 'AED 1,286,750', color: '#2A1628' },
              { name: 'Outstanding Tax', val: 'AED 858,550', color: '#E8760A', isBold: true },
              { name: 'Overpayments', val: 'AED 42,000', color: '#E0A370', isBold: true },
              { name: 'Potential Exposure', val: 'AED 312,450', color: '#2A1628', isBold: true }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, color: 'rgba(42,22,40,0.8)' }}>{item.name}</span>
                <span style={{ fontWeight: item.isBold ? 700 : 500, color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

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
            placeholder="Search client or TRN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', fontSize: '0.8125rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box' }}
          />
        </div>

        {/* Custom filter dropdowns */}
        {['status', 'taxYear', 'type', 'manager'].map((key) => {
          const isOpen = activeDropdown === key;
          const selectedVal = filters[key as keyof typeof filters];
          const options = filterOptions[key as keyof typeof filterOptions];
          const label = key === 'status' ? 'Status' : key === 'taxYear' ? 'Tax Year' : key === 'type' ? 'Zone' : 'Manager';

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
                  minWidth: key === 'status' ? '120px' : key === 'taxYear' ? '110px' : key === 'type' ? '110px' : '120px'
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
          onClick={() => setFilters({ status: 'All', taxYear: 'All', type: 'All', manager: 'All' })}
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

      {/* ── TABLE SECTION ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>Showing 1 to 10 of {filteredReturns.length} CT returns</span>
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
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === INITIAL_RETURNS.length} />
                </th>
                <th style={{ 
                  padding: '1rem', 
                  position: 'sticky', 
                  left: '48px', 
                  background: '#FAF8F5', 
                  zIndex: 10, 
                  borderRight: '1px solid #DDD0C4' 
                }}>CLIENT / COMPANY</th>
                <th style={{ padding: '1rem' }}>TRN / VAT NO.</th>
                <th style={{ padding: '1rem' }}>TAX YEAR</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>FILING DUE DATE</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>TAXABLE INCOME (AED)</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>TAX PAYABLE (AED)</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>TAX PAID (AED)</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>OUTSTANDING (AED)</th>
                <th style={{ padding: '1rem' }}>LAST ACTIVITY</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((item, idx) => (
                <tr key={item.id} style={{
                  borderBottom: idx < filteredReturns.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
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
                    <input type="checkbox" checked={selectedRows.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                  </td>
                  
                  {/* Client company info */}
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
                        background: 'rgba(232, 118, 10, 0.08)',
                        color: '#E8760A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {item.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{item.type}</div>
                      </div>
                    </div>
                  </td>

                  {/* TRN */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: '#2A1628', fontWeight: 500 }}>
                    {item.trn}
                  </td>

                  {/* Tax Year */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: '#2A1628', fontWeight: 500 }}>
                    {item.taxYear}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: item.status === 'Filed On Time' ? 'rgba(4, 120, 87, 0.08)' : item.status === 'Overdue' ? 'rgba(196, 105, 90, 0.08)' : 'rgba(184, 137, 42, 0.08)',
                      color: item.status === 'Filed On Time' ? '#047857' : item.status === 'Overdue' ? '#C4695A' : '#B8892A'
                    }}>{item.status}</span>
                  </td>

                  {/* Filing Due Date */}
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: item.isWarningRed ? '#C4695A' : '#2A1628' }}>{item.dueDate}</div>
                    {item.dueWarning && (
                      <div style={{ fontSize: '0.65rem', color: '#C4695A', fontWeight: 700, marginTop: '0.125rem' }}>{item.dueWarning}</div>
                    )}
                  </td>

                  {/* Taxable Income */}
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>
                    {item.taxableIncome}
                  </td>

                  {/* Tax Payable */}
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>
                    {item.taxPayable}
                  </td>

                  {/* Tax Paid */}
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: item.isPaidGreen ? '#047857' : '#2A1628', whiteSpace: 'nowrap' }}>
                    {item.taxPaid}
                  </td>

                  {/* Outstanding */}
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: item.isOutRed ? '#C4695A' : '#2A1628', whiteSpace: 'nowrap' }}>
                    {item.outstanding}
                  </td>

                  {/* Last Activity */}
                  <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.lastActivity}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', opacity: 0.6, display: 'flex', padding: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
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
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>25</button>
            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>▶</button>
          </div>
        </div>
      </div>

      {/* ── FOOTER WIDGETS ROW (BELOW TABLE) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
        
        {/* Upcoming Deadlines */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: 0, fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Upcoming Deadlines</h4>
            <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
            {[
              { name: 'ABC Trading LLC', returnPeriod: '28 May 2025', date: 'Due in 2 Days', overdue: true },
              { name: 'XYZ Holdings Limited', returnPeriod: '28 May 2025', date: 'Due in 2 Days', overdue: true },
              { name: 'Gamma Solutions FZCO', returnPeriod: '28 May 2025', date: 'Due in 2 Days', overdue: true },
              { name: 'Vertex Enterprises LLC', returnPeriod: '28 May 2025', date: 'Due in 2 Days', overdue: true },
              { name: 'Delta Properties FZCO', returnPeriod: '15 Jun 2025', date: 'Due in 20 Days', overdue: false }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.4rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#2A1628', fontSize: '0.7rem' }}>{item.returnPeriod}</div>
                  <div style={{ fontSize: '0.65rem', color: item.overdue ? '#C4695A' : '#E8760A', fontWeight: 700, marginTop: '0.125rem' }}>{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Tax Compliance Health Gauge */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>CT Compliance Health</h4>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '200px', height: '110px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                <svg width="200" height="200" viewBox="0 0 36 36" style={{ transform: 'rotate(-180deg)', position: 'absolute', top: 0 }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A1628" strokeWidth="3" strokeDasharray="50 50" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E0A370" strokeWidth="3.2" strokeDasharray="44 56" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.5" strokeDasharray="38 62" />
                </svg>
                <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2A1628', lineHeight: 1 }}>76%</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)', marginTop: '4px', fontWeight: 500 }}>Compliant</div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#E8760A', fontWeight: 600, marginTop: '0.75rem', textAlign: 'center' }}>
                +8% vs last month
              </div>
            </div>
            <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E8760A' }} />
                  <span style={{ color: '#2A1628', fontWeight: 500 }}>Compliant</span>
                </div>
                <strong style={{ color: '#2A1628', fontWeight: 600 }}>156 <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>(63%)</span></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E0A370' }} />
                  <span style={{ color: '#2A1628', fontWeight: 500 }}>At Risk</span>
                </div>
                <strong style={{ color: '#2A1628', fontWeight: 600 }}>62 <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>(25%)</span></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2A1628' }} />
                  <span style={{ color: '#2A1628', fontWeight: 500 }}>Non Compliant</span>
                </div>
                <strong style={{ color: '#2A1628', fontWeight: 600 }}>40 <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 400 }}>(16%)</span></strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 1. CT CALENDAR MODAL ── */}
      {calendarOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '580px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Corporate Tax Calendar</h3>
              </div>
              <button
                onClick={() => setCalendarOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Next filing dates and upcoming compliance deadlines for active entities.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {[
                { name: 'ABC Trading LLC', trn: '100556789600003', period: 'Tax Year 2024', due: '28 May 2025', status: 'Pending', color: '#E8760A' },
                { name: 'XYZ Holdings Limited', trn: '100556789600004', period: 'Tax Year 2024', due: '28 May 2025', status: 'Overdue', color: '#C4695A' },
                { name: 'Delta Properties FZCO', trn: '100556789600005', period: 'Tax Year 2024', due: '15 Jun 2025', status: 'In Review', color: 'rgba(42,22,40,0.5)' },
                { name: 'Alpha Tech FZCO', trn: '100556789600006', period: 'Tax Year 2024', due: '28 Apr 2025', status: 'Filed', color: '#047857' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '0.9rem', borderRadius: '10px',
                  background: item.status === 'Overdue' ? 'rgba(196, 105, 90, 0.04)' : '#FAF8F5',
                  border: `1px solid ${item.status === 'Overdue' ? 'rgba(196, 105, 90, 0.15)' : 'rgba(42,22,40,0.04)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2A1628', fontSize: '0.85rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>TRN: {item.trn} • {item.period}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>Due: {item.due}</div>
                    <span style={{
                      display: 'inline-block', fontSize: '0.625rem', fontWeight: 700,
                      padding: '0.15rem 0.4rem', borderRadius: '4px', marginTop: '0.25rem',
                      background: item.status === 'Filed' ? 'rgba(4, 120, 87, 0.08)' : item.status === 'Overdue' ? 'rgba(196, 105, 90, 0.08)' : 'rgba(232, 118, 10, 0.08)',
                      color: item.color
                    }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => setCalendarOpen(false)}
                style={{
                  padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                  background: '#ffffff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CT REPORTS MODAL ── */}
      {reportsOpen && (
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Generate Corporate Tax Reports</h3>
              </div>
              <button
                onClick={() => setReportsOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Select report parameters to export formatted summaries.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Report Type */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Report Type</label>
                <button
                  onClick={() => setModalReportTypeOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {reportType}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalReportTypeOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Filing Summary', 'Liabilities & Refunds', 'Payment History', 'Audit Logs'].map(t => (
                      <div
                        key={t}
                        onClick={() => { setReportType(t); setModalReportTypeOpen(false); }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: reportType === t ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: reportType === t ? 600 : 400
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Filing Period</label>
                <button
                  onClick={() => setModalReportRangeOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {reportDateRange}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalReportRangeOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Last 3 Months', 'Last 6 Months', 'Year to Date', 'Custom Range'].map(t => (
                      <div
                        key={t}
                        onClick={() => { setReportDateRange(t); setModalReportRangeOpen(false); }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: reportDateRange === t ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: reportDateRange === t ? 600 : 400
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Format selection buttons */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Output Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {['xlsx', 'pdf', 'csv'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setReportFormat(fmt)}
                      style={{
                        padding: '0.55rem', borderRadius: '8px', border: `1px solid ${reportFormat === fmt ? '#E8760A' : '#DDD0C4'}`,
                        background: reportFormat === fmt ? 'rgba(232,118,10,0.04)' : '#ffffff',
                        color: reportFormat === fmt ? '#E8760A' : '#2A1628', fontWeight: 600,
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
              <button
                onClick={() => setReportsOpen(false)}
                style={{
                  padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                  background: '#ffffff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { alert('Export started successfully!'); setReportsOpen(false); }}
                style={{
                  padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px',
                  background: '#2A1628', color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)'
                }}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. NEW CT FILING MODAL ── */}
      {newReturnOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '500px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Add New Corporate Tax Return</h3>
              </div>
              <button
                onClick={() => setNewReturnOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Log a new corporate tax filing cycle details for compliance tracking.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              
              {/* Client Selection */}
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
                  {newReturnForm.client}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalClientOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px',
                    maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {['ABC Trading LLC', 'XYZ Holdings Limited', 'Delta Properties FZCO', 'Alpha Tech FZCO', 'Beta Industries LLC'].map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          let nextTrn = '100556789600003';
                          if (c.includes('XYZ')) nextTrn = '100556789600004';
                          if (c.includes('Delta')) nextTrn = '100556789600005';
                          if (c.includes('Alpha')) nextTrn = '100556789600006';
                          if (c.includes('Beta')) nextTrn = '100556789600007';
                          setNewReturnForm({ ...newReturnForm, client: c, trn: nextTrn });
                          setModalClientOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: newReturnForm.client === c ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: newReturnForm.client === c ? 600 : 400
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TRN Display */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>TRN / VAT No.</label>
                <input
                  type="text"
                  readOnly
                  value={newReturnForm.trn}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: 'rgba(42,22,40,0.55)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Flex row for Tax Year and Due Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Year */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Tax Year</label>
                  <button
                    onClick={() => setModalYearOpen(o => !o)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                      background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 500
                    }}
                  >
                    {newReturnForm.taxYear}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {modalYearOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                      background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                    }}>
                      {['2024', '2023'].map(y => (
                        <div
                          key={y}
                          onClick={() => {
                            let nextDue = '28 May 2025';
                            if (y === '2023') nextDue = '28 May 2024';
                            setNewReturnForm({ ...newReturnForm, taxYear: y, dueDate: nextDue });
                            setModalYearOpen(false);
                          }}
                          style={{
                            padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                            cursor: 'pointer', borderRadius: '6px',
                            background: newReturnForm.taxYear === y ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                            fontWeight: newReturnForm.taxYear === y ? 600 : 400
                          }}
                        >
                          {y}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Filing Due Date</label>
                  <input
                    type="text"
                    value={newReturnForm.dueDate}
                    onChange={e => setNewReturnForm({ ...newReturnForm, dueDate: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Taxable Income */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Taxable Income (AED)</label>
                <input
                  type="text"
                  value={newReturnForm.taxableIncome}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/,/g, '');
                    let payableCalculated = '';
                    if (!isNaN(Number(cleanVal)) && cleanVal !== '') {
                      payableCalculated = String(Math.max(0, Math.floor(Number(cleanVal) * 0.09)));
                    }
                    setNewReturnForm({ ...newReturnForm, taxableIncome: e.target.value, payable: payableCalculated });
                  }}
                  placeholder="0.00"
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Flex row for Payable and Paid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Tax Payable (AED)</label>
                  <input
                    type="text"
                    value={newReturnForm.payable}
                    onChange={e => setNewReturnForm({ ...newReturnForm, payable: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Tax Paid (AED)</label>
                  <input
                    type="text"
                    value={newReturnForm.paid}
                    onChange={e => setNewReturnForm({ ...newReturnForm, paid: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Status */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Filing Status</label>
                <button
                  onClick={() => setModalStatusOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {newReturnForm.status}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {modalStatusOpen && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 -4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['Draft', 'Filed On Time', 'Filed Late', 'Overdue'].map(s => (
                      <div
                        key={s}
                        onClick={() => { setNewReturnForm({ ...newReturnForm, status: s }); setModalStatusOpen(false); }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: newReturnForm.status === s ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: newReturnForm.status === s ? 600 : 400
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
              <button
                onClick={() => setNewReturnOpen(false)}
                style={{
                  padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                  background: '#ffffff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { alert('Filing record logged successfully!'); setNewReturnOpen(false); }}
                style={{
                  padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px',
                  background: '#2A1628', color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)'
                }}
              >
                Create Filing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
