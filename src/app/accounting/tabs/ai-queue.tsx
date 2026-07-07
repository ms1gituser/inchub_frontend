'use client';

import React, { useState } from 'react';

interface QueueItem {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  trn: string;
  workflowId: string;
  workflowTime: string;
  stage: 'OCR Processing' | 'Ledger Construction' | 'Matching' | 'Reconciliation' | 'Suspense Review' | 'QBO Push Ready';
  stageColor: string;
  progress: number;
  progressColor: string;
  documents: string;
  bookkeeper: string;
  bookkeeperAvatar: string;
  priority: 'High' | 'Medium' | 'Low';
  dueEta: string;
  isDueToday: boolean;
  lastActivity: string;
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: '1',
    initials: 'AB',
    avatarBg: '#7C2D12',
    name: 'ABC Trading LLC',
    trn: 'TRN: 100556789600003',
    workflowId: 'WF-250507-0001',
    workflowTime: '07 May 2026, 10:24 AM',
    stage: 'OCR Processing',
    stageColor: '#F97316',
    progress: 45,
    progressColor: '#F97316',
    documents: '12 docs',
    bookkeeper: 'John Doe',
    bookkeeperAvatar: '👨‍💼',
    priority: 'High',
    dueEta: 'Today, 5:00 PM',
    isDueToday: true,
    lastActivity: '10 min ago'
  },
  {
    id: '2',
    initials: 'XY',
    avatarBg: '#1E3A8A',
    name: 'XYZ Holdings Limited',
    trn: 'TRN: 100556789600004',
    workflowId: 'WF-250507-0002',
    workflowTime: '07 May 2026, 09:40 AM',
    stage: 'Ledger Construction',
    stageColor: '#10B981',
    progress: 60,
    progressColor: '#10B981',
    documents: '18 docs',
    bookkeeper: 'Priya Nair',
    bookkeeperAvatar: '👩‍💼',
    priority: 'Medium',
    dueEta: 'Tomorrow, 11:00 AM',
    isDueToday: false,
    lastActivity: '25 min ago'
  },
  {
    id: '3',
    initials: 'DP',
    avatarBg: '#14532D',
    name: 'Delta Properties FZCO',
    trn: 'TRN: 100556789600005',
    workflowId: 'WF-250507-0003',
    workflowTime: '07 May 2026, 09:15 AM',
    stage: 'Matching',
    stageColor: '#3B82F6',
    progress: 75,
    progressColor: '#3B82F6',
    documents: '24 docs',
    bookkeeper: 'Mike Brown',
    bookkeeperAvatar: '👨‍💻',
    priority: 'High',
    dueEta: 'Today, 3:00 PM',
    isDueToday: true,
    lastActivity: '15 min ago'
  },
  {
    id: '4',
    initials: 'AT',
    avatarBg: '#3B0764',
    name: 'Alpha Tech FZCO',
    trn: 'TRN: 100556789600006',
    workflowId: 'WF-250507-0004',
    workflowTime: '07 May 2026, 08:50 AM',
    stage: 'Reconciliation',
    stageColor: '#F59E0B',
    progress: 30,
    progressColor: '#F59E0B',
    documents: '31 docs',
    bookkeeper: 'Sneha Iyer',
    bookkeeperAvatar: '👩‍💻',
    priority: 'Medium',
    dueEta: '08 May 2026',
    isDueToday: false,
    lastActivity: '1 hr ago'
  },
  {
    id: '5',
    initials: 'BI',
    avatarBg: '#052E16',
    name: 'Beta Industries LLC',
    trn: 'TRN: 100556789600007',
    workflowId: 'WF-250507-0005',
    workflowTime: '07 May 2026, 08:10 AM',
    stage: 'Suspense Review',
    stageColor: '#EF4444',
    progress: 50,
    progressColor: '#EF4444',
    documents: '9 docs',
    bookkeeper: 'John Doe',
    bookkeeperAvatar: '👨‍💼',
    priority: 'High',
    dueEta: 'Today, 6:00 PM',
    isDueToday: true,
    lastActivity: '20 min ago'
  },
  {
    id: '6',
    initials: 'GS',
    avatarBg: '#1e1b4b',
    name: 'Gamma Solutions FZCO',
    trn: 'TRN: 100556789600008',
    workflowId: 'WF-250507-0006',
    workflowTime: '07 May 2026, 07:45 AM',
    stage: 'QBO Push Ready',
    stageColor: '#8B5CF6',
    progress: 90,
    progressColor: '#8B5CF6',
    documents: '15 docs',
    bookkeeper: 'Priya Nair',
    bookkeeperAvatar: '👩‍💼',
    priority: 'Low',
    dueEta: '07 May 2026',
    isDueToday: false,
    lastActivity: '30 min ago'
  },
  {
    id: '7',
    initials: 'NH',
    avatarBg: '#7C2D12',
    name: 'Nova Hospitality LLC',
    trn: 'TRN: 100556789600009',
    workflowId: 'WF-250507-0007',
    workflowTime: '07 May 2026, 07:20 AM',
    stage: 'OCR Processing',
    stageColor: '#F97316',
    progress: 20,
    progressColor: '#F97316',
    documents: '7 docs',
    bookkeeper: 'Mike Brown',
    bookkeeperAvatar: '👨‍💻',
    priority: 'Medium',
    dueEta: '08 May 2026',
    isDueToday: false,
    lastActivity: '45 min ago'
  },
  {
    id: '8',
    initials: 'PC',
    avatarBg: '#1E3A8A',
    name: 'Prime Consultants FZCO',
    trn: 'TRN: 100556789600010',
    workflowId: 'WF-250507-0008',
    workflowTime: '07 May 2026, 07:05 AM',
    stage: 'Ledger Construction',
    stageColor: '#10B981',
    progress: 40,
    progressColor: '#10B981',
    documents: '22 docs',
    bookkeeper: 'Sneha Iyer',
    bookkeeperAvatar: '👩‍💻',
    priority: 'Low',
    dueEta: '09 May 2026',
    isDueToday: false,
    lastActivity: '2 hr ago'
  },
  {
    id: '9',
    initials: 'SS',
    avatarBg: '#14532D',
    name: 'Sigma Services LLC',
    trn: 'TRN: 100556789600011',
    workflowId: 'WF-250507-0009',
    workflowTime: '07 May 2026, 06:30 AM',
    stage: 'Reconciliation',
    stageColor: '#F59E0B',
    progress: 10,
    progressColor: '#F59E0B',
    documents: '11 docs',
    bookkeeper: 'John Doe',
    bookkeeperAvatar: '👨‍💼',
    priority: 'High',
    dueEta: 'Today, 2:00 PM',
    isDueToday: true,
    lastActivity: '1 hr ago'
  },
  {
    id: '10',
    initials: 'TE',
    avatarBg: '#3B0764',
    name: 'Vertex Enterprises LLC',
    trn: 'TRN: 100556789600012',
    workflowId: 'WF-250507-0010',
    workflowTime: '07 May 2026, 06:10 AM',
    stage: 'Suspense Review',
    stageColor: '#EF4444',
    progress: 65,
    progressColor: '#EF4444',
    documents: '6 docs',
    bookkeeper: 'Priya Nair',
    bookkeeperAvatar: '👩‍💼',
    priority: 'Medium',
    dueEta: '08 May 2026',
    isDueToday: false,
    lastActivity: '50 min ago'
  }
];

export default function AiQueueTab() {
  const [search, setSearch] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [addQueueOpen, setAddQueueOpen] = useState(false);
  const [exportQueueOpen, setExportQueueOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected' | 'custom'>('all');
  const [exportCustomCount, setExportCustomCount] = useState('10');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  
  const [addQueueForm, setAddQueueForm] = useState({
    companyName: '',
    stage: 'OCR Processing',
    progress: '45',
    documents: '12 docs',
    bookkeeper: 'John Doe',
    priority: 'High',
    dueEta: 'Today, 5:00 PM'
  });
  
  const [modalStageOpen, setModalStageOpen] = useState(false);
  const [modalPriorityOpen, setModalPriorityOpen] = useState(false);

  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-05-07');
  const [tempStartDate, setTempStartDate] = useState('2026-05-01');
  const [tempEndDate, setTempEndDate] = useState('2026-05-07');
  const [filters, setFilters] = useState({
    client: 'All',
    stage: 'All',
    priority: 'All',
    bookkeeper: 'All'
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Format YYYY-MM-DD to "DD MMM YYYY" manually to avoid timezone shifting
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    return `${day} ${months[monthIdx]} ${year}`;
  };

  const filterOptions = {
    client: ['All', 'ABC Trading LLC', 'XYZ Holdings Limited', 'Delta Properties FZCO', 'Alpha Tech FZCO', 'Beta Industries LLC', 'Global Logistics Dubai', 'Vertex Enterprises LLC'],
    stage: ['All', 'OCR Processing', 'Ledger Construction', 'Matching', 'Reconciliation', 'Suspense Review', 'QBO Push Ready'],
    priority: ['All', 'High', 'Medium', 'Low'],
    bookkeeper: ['All', 'John Doe', 'Priya Nair', 'Mike Brown', 'Sneha Iyer']
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedWorkflows(INITIAL_QUEUE.map(w => w.id));
    } else {
      setSelectedWorkflows([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedWorkflows.includes(id)) {
      setSelectedWorkflows(selectedWorkflows.filter(x => x !== id));
    } else {
      setSelectedWorkflows([...selectedWorkflows, id]);
    }
  };

  const filteredQueue = INITIAL_QUEUE.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.workflowId.toLowerCase().includes(search.toLowerCase());
    const matchesClient = filters.client === 'All' || item.name === filters.client;
    const matchesStage = filters.stage === 'All' || item.stage === filters.stage;
    const matchesPriority = filters.priority === 'All' || item.priority === filters.priority;
    const matchesBookkeeper = filters.bookkeeper === 'All' || item.bookkeeper === filters.bookkeeper;
    return matchesSearch && matchesClient && matchesStage && matchesPriority && matchesBookkeeper;
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
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
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
              Accounting &gt; AI Bookkeeping Queue
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
            AI Bookkeeping <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Queue</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Monitor and manage all client bookkeeping workflows processed by AI.
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
            onClick={() => setExportQueueOpen(true)}
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
            Export Queue
          </button>

          <button
            onClick={() => setAddQueueOpen(true)}
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
            gap: '0.375rem',
            boxShadow: '0 4px 12px rgba(42,22,40,0.15)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add to Queue
          </button>
        </div>
      </div>

      {/* ── METRICS GRID (7 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total in Queue', value: '24', sub: '+6 vs yesterday', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
          { label: 'OCR Processing', value: '6', sub: '25%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
          { label: 'Ledger Construction', value: '5', sub: '21%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
          { label: 'Matching', value: '4', sub: '17%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
          { label: 'Reconciliation', value: '3', sub: '12%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
          { label: 'Suspense Review', value: '4', sub: '17%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
          { label: 'QBO Ready', value: '2', sub: '8%', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>, bg: '#FAF2EC', border: '#F3DEC9', iconColor: '#E8760A' },
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
                width: '28px', height: '28px', borderRadius: '6px',
                background: card.bg, border: `1px solid ${card.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.iconColor, flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2A1628', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
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
            placeholder="Search in queue"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.25rem', fontSize: '0.8125rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box' }}
          />
        </div>

        {/* Styled filter dropdowns */}
        {[
          { label: 'Client', key: 'client' },
          { label: 'Stage', key: 'stage' },
          { label: 'Priority', key: 'priority' },
          { label: 'Bookkeeper', key: 'bookkeeper' }
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
                  minWidth: f.key === 'client' ? '150px' : f.key === 'stage' ? '160px' : '110px'
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

        {/* Date range */}
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
      </div>


      {/* ── AI QUEUE DATA TABLE ── */}
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
                <input type="checkbox" onChange={handleSelectAll} checked={selectedWorkflows.length === INITIAL_QUEUE.length} />
              </th>
              <th style={{ 
                padding: '1rem', 
                position: 'sticky', 
                left: '48px', 
                background: '#FAF8F5', 
                zIndex: 10, 
                borderRight: '1px solid #DDD0C4' 
              }}>CLIENT / COMPANY</th>
              <th style={{ padding: '1rem' }}>WORKFLOW ID</th>
              <th style={{ padding: '1rem' }}>STAGE</th>
              <th style={{ padding: '1rem', width: '140px' }}>PROGRESS</th>
              <th style={{ padding: '1rem' }}>DOCUMENTS</th>
              <th style={{ padding: '1rem' }}>BOOKKEEPER</th>
              <th style={{ padding: '1rem' }}>PRIORITY</th>
              <th style={{ padding: '1rem' }}>DUE / ETA</th>
              <th style={{ padding: '1rem' }}>LAST ACTIVITY</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.map((item, idx) => (
              <tr key={item.id} style={{
                borderBottom: idx < filteredQueue.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                background: selectedWorkflows.includes(item.id) ? 'rgba(232,118,10,0.02)' : 'transparent'
              }}>
                <td style={{ 
                  padding: '1rem 0.75rem', 
                  textAlign: 'center',
                  position: 'sticky',
                  left: 0,
                  background: selectedWorkflows.includes(item.id) ? '#FAF4EE' : '#ffffff',
                  zIndex: 9
                }}>
                  <input type="checkbox" checked={selectedWorkflows.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                </td>
                
                {/* Client Company info */}
                <td style={{ 
                  padding: '1rem', 
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  left: '48px',
                  background: selectedWorkflows.includes(item.id) ? '#FAF4EE' : '#ffffff',
                  zIndex: 9,
                  borderRight: '1px solid #DDD0C4'
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
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{item.trn}</div>
                    </div>
                  </div>
                </td>

                {/* Workflow ID */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.workflowId}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)' }}>{item.workflowTime}</div>
                </td>

                {/* Stage */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.stage === 'OCR Processing' ? '#FAF2EC'
                      : item.stage === 'Ledger Construction' ? '#E6F4EA'
                      : item.stage === 'Matching' ? '#E8F0FE'
                      : item.stage === 'Reconciliation' ? '#FFF3E0'
                      : item.stage === 'Suspense Review' ? '#FEE2E2'
                      : '#F3E8FF',
                    color: item.stage === 'OCR Processing' ? '#E8760A'
                      : item.stage === 'Ledger Construction' ? '#137333'
                      : item.stage === 'Matching' ? '#1A73E8'
                      : item.stage === 'Reconciliation' ? '#E65100'
                      : item.stage === 'Suspense Review' ? '#D32F2F'
                      : '#8B5CF6',
                    display: 'inline-block'
                  }}>
                    {item.stage}
                  </span>
                </td>

                {/* Progress bar */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', background: item.progress === 100 ? '#047857' : '#E8760A', borderRadius: '9999px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>{item.progress}%</span>
                  </div>
                </td>

                {/* Documents count */}
                <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {item.documents}
                </td>

                {/* Bookkeeper */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(42,22,40,0.05)', color: '#2A1628',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 600
                    }}>
                      {item.bookkeeper.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontWeight: 500, color: '#2A1628' }}>{item.bookkeeper}</span>
                  </div>
                </td>

                {/* Priority */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: item.priority === 'High' ? '#FEE2E2' : item.priority === 'Medium' ? '#FFF3E0' : '#E6F4EA',
                    color: item.priority === 'High' ? '#D32F2F' : item.priority === 'Medium' ? '#E65100' : '#137333'
                  }}>{item.priority}</span>
                </td>

                {/* Due / ETA */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontWeight: 600,
                    color: item.isDueToday ? '#D32F2F' : 'rgba(42,22,40,0.7)'
                  }}>{item.dueEta}</span>
                </td>

                {/* Last Activity */}
                <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500, whiteSpace: 'nowrap' }}>
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
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '24px', height: '24px' }}>10</button>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>▶</button>
        </div>
      </div>

      {/* ── ADD TO QUEUE MODAL ── */}
      {addQueueOpen && (
        <div
          onClick={() => setAddQueueOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '540px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
          >
            {/* Header */}
            <div style={{ background: '#FAF8F5', padding: '1.25rem 1.75rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Bookkeeping</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>Add to <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Queue</span></h2>
              </div>
              <button onClick={() => setAddQueueOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Company / Client Name</label>
                <input
                  type="text" placeholder="e.g. Acme Trading FZCO"
                  value={addQueueForm.companyName}
                  onChange={e => setAddQueueForm(f => ({ ...f, companyName: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Stage</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setModalStageOpen(o => !o); setModalPriorityOpen(false); }}
                      style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      {addQueueForm.stage}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {modalStageOpen && (
                      <div className="hide-scrollbar" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, overflowY: 'auto', maxHeight: '160px', padding: '4px' }}>
                        {['OCR Processing', 'Ledger Construction', 'Matching', 'Reconciliation', 'Suspense Review', 'QBO Push Ready'].map(opt => (
                          <div key={opt} onClick={() => { setAddQueueForm(f => ({ ...f, stage: opt })); setModalStageOpen(false); }}
                            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: addQueueForm.stage === opt ? '#E8760A' : '#2A1628', background: addQueueForm.stage === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: addQueueForm.stage === opt ? 600 : 400, borderRadius: '6px' }}
                            onMouseEnter={e => { if (addQueueForm.stage !== opt) { e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; e.currentTarget.style.color = '#E8760A'; } }}
                            onMouseLeave={e => { if (addQueueForm.stage !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2A1628'; } }}
                          >{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Priority</label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setModalPriorityOpen(o => !o); setModalStageOpen(false); }}
                      style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                    >
                      {addQueueForm.priority}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {modalPriorityOpen && (
                      <div className="hide-scrollbar" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, padding: '4px' }}>
                        {['High', 'Medium', 'Low'].map(opt => (
                          <div key={opt} onClick={() => { setAddQueueForm(f => ({ ...f, priority: opt })); setModalPriorityOpen(false); }}
                            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: addQueueForm.priority === opt ? '#E8760A' : '#2A1628', background: addQueueForm.priority === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: addQueueForm.priority === opt ? 600 : 400, borderRadius: '6px' }}
                            onMouseEnter={e => { if (addQueueForm.priority !== opt) { e.currentTarget.style.background = 'rgba(232,118,10,0.04)'; e.currentTarget.style.color = '#E8760A'; } }}
                            onMouseLeave={e => { if (addQueueForm.priority !== opt) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2A1628'; } }}
                          >{opt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Progress (%)</label>
                  <input
                    type="number" min="0" max="100" placeholder="e.g. 45"
                    value={addQueueForm.progress}
                    onChange={e => setAddQueueForm(f => ({ ...f, progress: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Documents Count</label>
                  <input
                    type="text" placeholder="e.g. 12 docs"
                    value={addQueueForm.documents}
                    onChange={e => setAddQueueForm(f => ({ ...f, documents: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Assigned Bookkeeper</label>
                  <input
                    type="text" placeholder="e.g. John Doe"
                    value={addQueueForm.bookkeeper}
                    onChange={e => setAddQueueForm(f => ({ ...f, bookkeeper: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Due / ETA</label>
                  <input
                    type="text" placeholder="e.g. Today, 5:00 PM"
                    value={addQueueForm.dueEta}
                    onChange={e => setAddQueueForm(f => ({ ...f, dueEta: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.1rem 1.75rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setAddQueueOpen(false)} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}>Cancel</button>
              <button
                onClick={() => { alert('Added to Bookkeeping Queue!'); setAddQueueOpen(false); }}
                style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT QUEUE MODAL ── */}
      {exportQueueOpen && (
        <div
          onClick={() => setExportQueueOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
          >
            {/* Header */}
            <div style={{ background: '#FAF8F5', padding: '1.5rem 1.75rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Bookkeeping</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>Export <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Queue</span></h2>
              </div>
              <button onClick={() => setExportQueueOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Scope */}
              <div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Which workflows to export?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {([
                    { id: 'all', label: 'All Workflows', sub: 'Export all bookkeeping tasks in queue', count: '24' },
                    { id: 'filtered', label: 'Filtered Workflows', sub: 'Only workflows matching current filters', count: String(filteredQueue.length) },
                    { id: 'selected', label: 'Selected Workflows', sub: 'Only selected checkboxes', count: String(selectedWorkflows.length) },
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
                <button onClick={() => setExportQueueOpen(false)} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}>Cancel</button>
                <button
                  onClick={() => { alert(`Exporting ${exportScope === 'custom' ? exportCustomCount : exportScope} rows as .${exportFormat}`); setExportQueueOpen(false); }}
                  style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(232,118,10,0.25)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
