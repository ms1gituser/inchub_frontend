'use client';

import React, { useState } from 'react';

interface ReconTransaction {
  id: string;
  date: string;
  descTitle: string;
  descSub: string;
  client: string;
  account: string;
  source: 'Bank' | 'Credit Card';
  matchType: 'Exact Match' | 'Partial Match' | 'No Match';
  matchStatus: 'Matched' | 'Partially Matched' | 'Unmatched' | 'Needs Review';
  matchPercent?: number;
  amount: string;
  difference: string;
  isDiffRed: boolean;
}

const INITIAL_TRANSACTIONS: ReconTransaction[] = [
  {
    id: '1',
    date: '07 May 2026',
    descTitle: 'Office Rent - May 2026',
    descSub: 'INV-2026-045',
    client: 'ABC Trading LLC',
    account: 'Rent Expense',
    source: 'Bank',
    matchType: 'Exact Match',
    matchStatus: 'Matched',
    amount: '12,000.00',
    difference: '0.00',
    isDiffRed: false
  },
  {
    id: '2',
    date: '07 May 2026',
    descTitle: 'Payment from XYZ Corp',
    descSub: 'PMT-2026-231',
    client: 'XYZ Holdings Limited',
    account: 'Accounts Receivable',
    source: 'Bank',
    matchType: 'Exact Match',
    matchStatus: 'Matched',
    amount: '25,000.00',
    difference: '0.00',
    isDiffRed: false
  },
  {
    id: '3',
    date: '06 May 2026',
    descTitle: 'Etisalat - Internet Bill',
    descSub: 'BILL-2026-098',
    client: 'Delta Properties FZCO',
    account: 'Utilities Expense',
    source: 'Bank',
    matchType: 'Partial Match',
    matchStatus: 'Partially Matched',
    matchPercent: 70,
    amount: '1,250.00',
    difference: '120.00',
    isDiffRed: true
  },
  {
    id: '4',
    date: '06 May 2026',
    descTitle: 'Amazon Services',
    descSub: 'AMZ-884211',
    client: 'Alpha Tech FZCO',
    account: 'Software Expense',
    source: 'Credit Card',
    matchType: 'No Match',
    matchStatus: 'Unmatched',
    amount: '3,450.00',
    difference: '3,450.00',
    isDiffRed: true
  },
  {
    id: '5',
    date: '05 May 2026',
    descTitle: 'Customer Payment',
    descSub: 'PMT-2026-229',
    client: 'Beta Industries LLC',
    account: 'Accounts Receivable',
    source: 'Bank',
    matchType: 'Exact Match',
    matchStatus: 'Matched',
    amount: '8,500.00',
    difference: '0.00',
    isDiffRed: false
  },
  {
    id: '6',
    date: '05 May 2026',
    descTitle: 'DEWA Bill - Office',
    descSub: 'BILL-2026-122',
    client: 'Gamma Solutions FZCO',
    account: 'Utilities Expense',
    source: 'Bank',
    matchType: 'Partial Match',
    matchStatus: 'Partially Matched',
    matchPercent: 60,
    amount: '980.00',
    difference: '200.00',
    isDiffRed: true
  },
  {
    id: '7',
    date: '04 May 2026',
    descTitle: 'Vendor Payment - Supplies',
    descSub: 'PMT-2026-210',
    client: 'Nova Hospitality LLC',
    account: 'Supplies Expense',
    source: 'Bank',
    matchType: 'No Match',
    matchStatus: 'Needs Review',
    amount: '2,750.00',
    difference: '2,750.00',
    isDiffRed: true
  },
  {
    id: '8',
    date: '04 May 2026',
    descTitle: 'Stripe Payout',
    descSub: 'STR-2026-1882',
    client: 'Prime Consultants FZCO',
    account: 'Service Income',
    source: 'Bank',
    matchType: 'Exact Match',
    matchStatus: 'Matched',
    amount: '6,300.00',
    difference: '0.00',
    isDiffRed: false
  },
  {
    id: '9',
    date: '03 May 2026',
    descTitle: 'Salary Account Transfer',
    descSub: 'TRF-2026-551',
    client: 'Sigma Services LLC',
    account: 'Salary Expense',
    source: 'Bank',
    matchType: 'Exact Match',
    matchStatus: 'Matched',
    amount: '15,000.00',
    difference: '0.00',
    isDiffRed: false
  },
  {
    id: '10',
    date: '03 May 2026',
    descTitle: 'Noon Purchase',
    descSub: 'NOON-772199',
    client: 'Vertex Enterprises LLC',
    account: 'Office Supplies',
    source: 'Credit Card',
    matchType: 'Partial Match',
    matchStatus: 'Partially Matched',
    matchPercent: 80,
    amount: '420.00',
    difference: '80.00',
    isDiffRed: true
  }
];

export default function ReconciliationTab() {
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [newReconOpen, setNewReconOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected' | 'custom'>('all');
  const [exportCustomCount, setExportCustomCount] = useState('10');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const [newReconForm, setNewReconForm] = useState({
    date: '07 May 2026',
    descTitle: '',
    descSub: '',
    client: 'ABC Trading LLC',
    account: 'Rent Expense',
    source: 'Bank',
    matchType: 'Exact Match',
    matchStatus: 'Matched',
    amount: '',
    difference: '0.00',
    isDiffRed: false
  });

  const [modalClientOpen, setModalClientOpen] = useState(false);
  const [modalAccountOpen, setModalAccountOpen] = useState(false);
  const [modalSourceOpen, setModalSourceOpen] = useState(false);
  const [modalMatchTypeOpen, setModalMatchTypeOpen] = useState(false);
  const [modalMatchStatusOpen, setModalMatchStatusOpen] = useState(false);

  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-07');
  const [tempStartDate, setTempStartDate] = useState('2026-05-01');
  const [tempEndDate, setTempEndDate] = useState('2026-05-07');
  const [filters, setFilters] = useState({
    client: 'All',
    account: 'All',
    source: 'All',
    matchType: 'All'
  });

  const filterOptions = {
    client: ['All', 'ABC Trading LLC', 'XYZ Holdings Limited', 'Delta Properties FZCO', 'Alpha Tech FZCO', 'Beta Industries LLC', 'Gamma Solutions FZCO', 'Nova Hospitality LLC', 'Prime Consultants FZCO', 'Sigma Services LLC'],
    account: ['All', 'Rent Expense', 'Accounts Receivable', 'Utilities Expense', 'Software Expense', 'Supplies Expense', 'Service Income', 'Salary Expense'],
    source: ['All', 'Bank', 'Credit Card'],
    matchType: ['All', 'Exact Match', 'Partial Match', 'No Match']
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(INITIAL_TRANSACTIONS.map(t => t.id));
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${day} ${months[monthIdx]} ${year}`;
  };

  const filteredTransactions = INITIAL_TRANSACTIONS.filter(item => {
    const matchesSearch = item.descTitle.toLowerCase().includes(search.toLowerCase()) || item.descSub.toLowerCase().includes(search.toLowerCase());
    const matchesClient = filters.client === 'All' || item.client === filters.client;
    const matchesAccount = filters.account === 'All' || item.account === filters.account;
    const matchesSource = filters.source === 'All' || item.source === filters.source;
    const matchesMatchType = filters.matchType === 'All' || item.matchType === filters.matchType;
    return matchesSearch && matchesClient && matchesAccount && matchesSource && matchesMatchType;
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
              Accounting &gt; Reconciliation Center
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
            Reconciliation <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Match, review and reconcile transactions to keep your books accurate and clean.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button style={{
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
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}>
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          
          <button
            onClick={() => setExportOpen(true)}
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
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Export Report
          </button>

          <button
            onClick={() => setNewReconOpen(true)}
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
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Reconciliation
          </button>
        </div>
      </div>

      {/* ── METRICS GRID (7 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total Items', value: '362', sub: '+18 vs yesterday', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Matched', value: '198', sub: '55%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Partially Matched', value: '64', sub: '18%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Unmatched', value: '78', sub: '22%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Needs Review', value: '22', sub: '6%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Auto-Matched (AI)', value: '156', sub: '43%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
          { label: 'Reconciled', value: '164', sub: '+12 vs yesterday', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9' },
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
            placeholder="Search transactions, description, ref no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', fontSize: '0.8125rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box' }}
          />
        </div>

        {/* Custom filter dropdowns */}
        {[
          { label: 'Client', key: 'client' },
          { label: 'Account', key: 'account' },
          { label: 'Source', key: 'source' },
          { label: 'Match Type', key: 'matchType' }
        ].map((f) => {
          const isOpen = activeDropdown === f.key;
          const selectedVal = filters[f.key as keyof typeof filters];
          const options = filterOptions[f.key as keyof typeof filterOptions];

          return (
            <div key={f.key} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveDropdown(isOpen ? null : f.key)}
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
                  minWidth: f.key === 'client' ? '150px' : f.key === 'account' ? '160px' : '110px'
                }}
              >
                <span>{f.label}: {selectedVal}</span>
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
                  overflowY: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  {options.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setFilters({ ...filters, [f.key]: option });
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
          onClick={() => setFilters({ client: 'All', account: 'All', source: 'All', matchType: 'All' })}
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

      {/* ── RECONCILIATION DATA TABLE ── */}
      <div className="client-table-scroll" style={{
        background: '#ffffff',
        border: '1px solid rgba(42,22,40,0.06)',
        borderRadius: '16px 16px 0 0',
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
                <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === INITIAL_TRANSACTIONS.length} />
              </th>
              <th style={{ 
                padding: '1rem', 
                position: 'sticky', 
                left: '48px', 
                background: '#FAF8F5', 
                zIndex: 10, 
                borderRight: '1px solid #DDD0C4' 
              }}>DATE</th>
              <th style={{ padding: '1rem' }}>DESCRIPTION</th>
              <th style={{ padding: '1rem' }}>CLIENT / ACCOUNT</th>
              <th style={{ padding: '1rem' }}>SOURCE</th>
              <th style={{ padding: '1rem' }}>MATCH TYPE</th>
              <th style={{ padding: '1rem' }}>MATCH STATUS</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>AMOUNT (AED)</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>DIFFERENCE (AED)</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item, idx) => (
              <tr key={item.id} style={{
                borderBottom: idx < filteredTransactions.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
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
                
                {/* Date */}
                <td style={{ 
                  padding: '1rem', 
                  whiteSpace: 'nowrap', 
                  position: 'sticky',
                  left: '48px',
                  background: selectedRows.includes(item.id) ? '#FAF4EE' : '#ffffff',
                  zIndex: 9,
                  borderRight: '1px solid #DDD0C4',
                  color: 'rgba(42,22,40,0.8)', 
                  fontWeight: 600 
                }}>
                  {item.date}
                </td>

                {/* Description */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.descTitle}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{item.descSub}</div>
                </td>

                {/* Client / Account */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.client}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{item.account}</div>
                </td>

                {/* Source Badge */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.source === 'Bank' ? '#F1F3F4' : '#F3E8FF',
                    color: item.source === 'Bank' ? '#5F6368' : '#8B5CF6'
                  }}>
                    {item.source === 'Bank' ? 'Bank' : 'Credit Card'}
                  </span>
                </td>

                {/* Match Type Badge */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.matchType === 'Exact Match' ? '#E6F4EA' : item.matchType === 'Partial Match' ? '#FFF3E0' : '#FEE2E2',
                    color: item.matchType === 'Exact Match' ? '#137333' : item.matchType === 'Partial Match' ? '#E65100' : '#D32F2F'
                  }}>{item.matchType}</span>
                </td>

                {/* Match Status text & tag */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.matchStatus === 'Matched' ? '#E6F4EA'
                      : item.matchStatus === 'Partially Matched' ? '#FFF3E0'
                      : item.matchStatus === 'Needs Review' ? '#FEFCE8' : '#FEE2E2',
                    color: item.matchStatus === 'Matched' ? '#137333'
                      : item.matchStatus === 'Partially Matched' ? '#D97706'
                      : item.matchStatus === 'Needs Review' ? '#A16207' : '#D32F2F',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {item.matchStatus === 'Matched' && 'Matched'}
                    {item.matchStatus === 'Partially Matched' && `Partially Matched ${item.matchPercent}%`}
                    {item.matchStatus === 'Needs Review' && 'Needs Review'}
                    {item.matchStatus === 'Unmatched' && 'Unmatched'}
                  </span>
                </td>

                {/* Amount */}
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>
                  {item.amount}
                </td>

                {/* Difference */}
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: item.isDiffRed ? '#D32F2F' : '#2A1628', whiteSpace: 'nowrap' }}>
                  {item.difference}
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
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>4</button>
          <span style={{ padding: '0 0.25rem' }}>...</span>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>37</button>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>▶</button>
        </div>
      </div>

      {/* ── FOOTER ANALYTICS PANELS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
        
        {/* Reconciliation Summary Donut Chart */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Reconciliation Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A1628" strokeWidth="3" strokeDasharray="100 0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A1829A" strokeWidth="3.2" strokeDasharray="94 6" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E0A370" strokeWidth="3.4" strokeDasharray="73 27" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.6" strokeDasharray="55 45" />
              </svg>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#E8760A', fontWeight: 600 }}>● Matched</span> <strong>198 (55%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#E0A370', fontWeight: 600 }}>● Partially Matched</span> <strong>64 (18%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#2A1628', fontWeight: 600 }}>● Unmatched</span> <strong>78 (22%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#A1829A', fontWeight: 600 }}>● Needs Review</span> <strong>22 (6%)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Unmatched by Reason Progress Bars */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Unmatched by Reason</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'No Matching Transaction', count: '48 (61.5%)', pct: 61.5, color: '#E8760A' },
              { label: 'Amount Difference', count: '18 (23.1%)', pct: 23.1, color: '#2A1628' },
              { label: 'Date Difference', count: '8 (10.3%)', pct: 10.3, color: '#E0A370' },
              { label: 'Other', count: '4 (5.1%)', pct: 5.1, color: '#A1829A' }
            ].map((reason, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 500 }}>
                  <span style={{ color: 'rgba(42,22,40,0.7)' }}>{reason.label}</span>
                  <span style={{ fontWeight: 600 }}>{reason.count}</span>
                </div>
                <div style={{ height: '6px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${reason.pct}%`, height: '100%', background: reason.color, borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Unreconciled Clients List */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>Top Unreconciled Clients</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.75rem' }}>
            {[
              { name: 'ABC Trading LLC', items: '28 items', amount: 'AED 8,650' },
              { name: 'Alpha Tech FZCO', items: '16 items', amount: 'AED 4,230' },
              { name: 'Delta Properties FZCO', items: '14 items', amount: 'AED 3,890' },
              { name: 'Beta Industries LLC', items: '9 items', amount: 'AED 2,750' },
              { name: 'Prime Consultants FZCO', items: '7 items', amount: 'AED 1,950' }
            ].map((cli, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: '#2A1628' }}>{cli.name}</span>
                <div style={{ display: 'flex', gap: '1rem', color: 'rgba(42,22,40,0.6)' }}>
                  <span>{cli.items}</span>
                  <span style={{ fontWeight: 600, color: '#2A1628' }}>{cli.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── NEW RECONCILIATION MODAL ── */}
      {newReconOpen && (
        <div
          onClick={() => setNewReconOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
          >
            {/* Header */}
            <div style={{ background: '#FAF8F5', padding: '1.25rem 1.75rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Reconciliation</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>New <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Reconciliation</span></h2>
              </div>
              <button onClick={() => setNewReconOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }} className="hide-scrollbar">
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Transaction Date</label>
                <input
                  type="text" placeholder="e.g. 07 May 2026"
                  value={newReconForm.date}
                  onChange={e => setNewReconForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Description Title</label>
                <input
                  type="text" placeholder="e.g. Office Rent - May 2026"
                  value={newReconForm.descTitle}
                  onChange={e => setNewReconForm(f => ({ ...f, descTitle: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Ref / Invoice Subtitle</label>
                <input
                  type="text" placeholder="e.g. INV-2026-045"
                  value={newReconForm.descSub}
                  onChange={e => setNewReconForm(f => ({ ...f, descSub: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Client</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setModalClientOpen(o => !o); setModalAccountOpen(false); setModalSourceOpen(false); setModalMatchTypeOpen(false); setModalMatchStatusOpen(false); }}
                      style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      {newReconForm.client}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {modalClientOpen && (
                      <div className="hide-scrollbar" style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, overflowY: 'auto', maxHeight: '160px', padding: '4px' }}>
                        {filterOptions.client.filter(x => x !== 'All').map(opt => (
                          <div key={opt} onClick={() => { setNewReconForm(f => ({ ...f, client: opt })); setModalClientOpen(false); }}
                            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: newReconForm.client === opt ? '#E8760A' : '#2A1628', background: newReconForm.client === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: newReconForm.client === opt ? 600 : 400, borderRadius: '6px' }}
                            onMouseEnter={e => { if (newReconForm.client !== opt) { e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; e.currentTarget.style.color = '#E8760A'; } }}
                            onMouseLeave={e => { if (newReconForm.client !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2A1628'; } }}
                          >{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Account</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setModalAccountOpen(o => !o); setModalClientOpen(false); setModalSourceOpen(false); setModalMatchTypeOpen(false); setModalMatchStatusOpen(false); }}
                      style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      {newReconForm.account}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {modalAccountOpen && (
                      <div className="hide-scrollbar" style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, overflowY: 'auto', maxHeight: '160px', padding: '4px' }}>
                        {filterOptions.account.filter(x => x !== 'All').map(opt => (
                          <div key={opt} onClick={() => { setNewReconForm(f => ({ ...f, account: opt })); setModalAccountOpen(false); }}
                            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: newReconForm.account === opt ? '#E8760A' : '#2A1628', background: newReconForm.account === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: newReconForm.account === opt ? 600 : 400, borderRadius: '6px' }}
                            onMouseEnter={e => { if (newReconForm.account !== opt) { e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; e.currentTarget.style.color = '#E8760A'; } }}
                            onMouseLeave={e => { if (newReconForm.account !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2A1628'; } }}
                          >{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Source</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setModalSourceOpen(o => !o); setModalClientOpen(false); setModalAccountOpen(false); setModalMatchTypeOpen(false); setModalMatchStatusOpen(false); }}
                      style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      {newReconForm.source}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {modalSourceOpen && (
                      <div className="hide-scrollbar" style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, padding: '4px' }}>
                        {['Bank', 'Credit Card'].map(opt => (
                          <div key={opt} onClick={() => { setNewReconForm(f => ({ ...f, source: opt })); setModalSourceOpen(false); }}
                            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: newReconForm.source === opt ? '#E8760A' : '#2A1628', background: newReconForm.source === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: newReconForm.source === opt ? 600 : 400, borderRadius: '6px' }}
                            onMouseEnter={e => { if (newReconForm.source !== opt) { e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; e.currentTarget.style.color = '#E8760A'; } }}
                            onMouseLeave={e => { if (newReconForm.source !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2A1628'; } }}
                          >{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Match Type</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setModalMatchTypeOpen(o => !o); setModalClientOpen(false); setModalAccountOpen(false); setModalSourceOpen(false); setModalMatchStatusOpen(false); }}
                      style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      {newReconForm.matchType}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {modalMatchTypeOpen && (
                      <div className="hide-scrollbar" style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, padding: '4px' }}>
                        {['Exact Match', 'Partial Match', 'No Match'].map(opt => (
                          <div key={opt} onClick={() => { setNewReconForm(f => ({ ...f, matchType: opt })); setModalMatchTypeOpen(false); }}
                            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: newReconForm.matchType === opt ? '#E8760A' : '#2A1628', background: newReconForm.matchType === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: newReconForm.matchType === opt ? 600 : 400, borderRadius: '6px' }}
                            onMouseEnter={e => { if (newReconForm.matchType !== opt) { e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; e.currentTarget.style.color = '#E8760A'; } }}
                            onMouseLeave={e => { if (newReconForm.matchType !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2A1628'; } }}
                          >{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Amount (AED)</label>
                  <input
                    type="text" placeholder="e.g. 12,000.00"
                    value={newReconForm.amount}
                    onChange={e => setNewReconForm(f => ({ ...f, amount: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Difference (AED)</label>
                  <input
                    type="text" placeholder="e.g. 0.00"
                    value={newReconForm.difference}
                    onChange={e => setNewReconForm(f => ({ ...f, difference: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.1rem 1.75rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setNewReconOpen(false)} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}>Cancel</button>
              <button
                onClick={() => { alert('Transaction Added to Reconciliation Center!'); setNewReconOpen(false); }}
                style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT REPORT MODAL ── */}
      {exportOpen && (
        <div
          onClick={() => setExportOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
          >
            {/* Header */}
            <div style={{ background: '#FAF8F5', padding: '1.5rem 1.75rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Reconciliation</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>Export <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Report</span></h2>
              </div>
              <button onClick={() => setExportOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Scope */}
              <div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Which transactions to export?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {([
                    { id: 'all', label: 'All Transactions', sub: 'Export all transactions in this ledger', count: '362' },
                    { id: 'filtered', label: 'Filtered Transactions', sub: 'Only transactions matching filters', count: String(filteredTransactions.length) },
                    { id: 'selected', label: 'Selected Transactions', sub: 'Only selected checkboxes', count: String(selectedRows.length) },
                    { id: 'custom', label: 'Custom Count', sub: 'Specify exactly how many to export', count: null }
                  ] as const).map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => setExportScope(opt.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', border: `1.5px solid ${exportScope === opt.id ? '#E8760A' : '#DDD0C4'}`, background: exportScope === opt.id ? 'rgba(232,118,10,0.04)' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${exportScope === opt.id ? '#E8760A' : '#DDD0C4'}`, background: exportScope === opt.id ? '#E8760A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {exportScope === opt.id && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#2A1628' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.1rem' }}>{opt.sub}</div>
                      </div>
                      {opt.count !== null && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: exportScope === opt.id ? '#E8760A' : 'rgba(42,22,40,0.4)', background: exportScope === opt.id ? 'rgba(232,118,10,0.08)' : 'rgba(42,22,40,0.04)', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>{opt.count} rows</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom count input */}
                {exportScope === 'custom' && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, whiteSpace: 'nowrap' }}>Number of rows:</label>
                    <input
                      type="number" min="1" max="1000"
                      value={exportCustomCount}
                      onChange={e => setExportCustomCount(e.target.value)}
                      style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.45rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', width: '90px', fontFamily: 'inherit' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>top rows</span>
                  </div>
                )}
              </div>

              {/* Format */}
              <div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>File Format</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['xlsx', 'csv'] as const).map(fmt => (
                    <button key={fmt} onClick={() => setExportFormat(fmt)}
                      style={{ flex: 1, padding: '0.6rem', border: `1.5px solid ${exportFormat === fmt ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: exportFormat === fmt ? 'rgba(232,118,10,0.04)' : '#fff', color: exportFormat === fmt ? '#E8760A' : '#2A1628', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      .{fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.1rem 1.75rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>
                Exporting as <strong style={{ color: '#2A1628' }}>.{exportFormat.toUpperCase()}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setExportOpen(false)} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}>Cancel</button>
                <button
                  onClick={() => { alert(`Exporting ${exportScope === 'custom' ? exportCustomCount : exportScope} rows as .${exportFormat}`); setExportOpen(false); }}
                  style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(232,118,10,0.25)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
