'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Pagination from '@/components/ui/Pagination';
import {
  useGetQueueQuery, useGetStatsQuery, useGetAnalyticsQuery, useGetDrawerDetailsQuery, useGetMetadataQuery,
  usePostFileMutation, usePostAmendMutation, useAddCtReturnMutation, usePostBulkMutation, useImportReturnsMutation,
  usePostNoteMutation, usePostDocumentMutation,
} from '@/lib/ctApi';

// ============================================================================
// Types
// ============================================================================

interface CtReturnItem {
  id: string;
  client: string;
  trn: string;
  taxPeriod: string;
  financialYear: string;
  accountingProfit: number;
  taxableProfit: number;
  corporateTax: number;
  status: 'Draft' | 'Pending' | 'Ready To File' | 'Filed' | 'Overdue' | 'Exception' | 'Amended' | 'Archived';
  reviewer: string;
  manager: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  risk: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
  taxRate: number;
  entityType: 'Mainland' | 'Free Zone';
  tags: string[];
}

interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  oldVal: string;
  newVal: string;
  ip: string;
  system: string;
}

interface CtDocument {
  name: string;
  size: string;
  date: string;
  type: string;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_RETURNS: CtReturnItem[] = [
  {
    id: 'ct-1',
    client: 'ABC Trading LLC',
    trn: '100556789600003',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 4250000,
    taxableProfit: 4500000,
    corporateTax: 371250, // (4500000 - 375000) * 9%
    status: 'Overdue',
    reviewer: 'Priya Nair',
    manager: 'John Doe',
    priority: 'High',
    dueDate: '2026-05-28',
    risk: 'High',
    lastUpdated: '2026-05-26',
    taxRate: 9,
    entityType: 'Mainland',
    tags: ['Retail', 'Audit Required'],
  },
  {
    id: 'ct-2',
    client: 'XYZ Holdings Limited',
    trn: '100556789600004',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 2750000,
    taxableProfit: 2600000,
    corporateTax: 200250,
    status: 'Overdue',
    reviewer: 'Omar Haddad',
    manager: 'Mike Brown',
    priority: 'High',
    dueDate: '2026-05-28',
    risk: 'Medium',
    lastUpdated: '2026-05-25',
    taxRate: 9,
    entityType: 'Free Zone',
    tags: ['Consulting', 'Zero-Rated'],
  },
  {
    id: 'ct-3',
    client: 'Delta Properties FZCO',
    trn: '100987654300002',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 3980000,
    taxableProfit: 4100000,
    corporateTax: 335250,
    status: 'Filed',
    reviewer: 'Lucia Ferreira',
    manager: 'John Doe',
    priority: 'Medium',
    dueDate: '2026-04-28',
    risk: 'Low',
    lastUpdated: '2026-04-24',
    taxRate: 9,
    entityType: 'Free Zone',
    tags: ['Real Estate', 'Exempt Sales'],
  },
  {
    id: 'ct-4',
    client: 'Alpha Tech FZCO',
    trn: '100778899000005',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 1850000,
    taxableProfit: 1750000,
    corporateTax: 123750,
    status: 'Filed',
    reviewer: 'Kevin Park',
    manager: 'Sneha Iyer',
    priority: 'Low',
    dueDate: '2026-04-28',
    risk: 'Low',
    lastUpdated: '2026-04-23',
    taxRate: 9,
    entityType: 'Free Zone',
    tags: ['Software', 'Refund Pending'],
  },
  {
    id: 'ct-5',
    client: 'Beta Industries LLC',
    trn: '100445566100008',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 5600000,
    taxableProfit: 5800000,
    corporateTax: 488250,
    status: 'Ready To File',
    reviewer: 'Priya Nair',
    manager: 'John Doe',
    priority: 'Medium',
    dueDate: '2026-05-28',
    risk: 'Medium',
    lastUpdated: '2026-05-27',
    taxRate: 9,
    entityType: 'Mainland',
    tags: ['Manufacturing', 'R&D Credits'],
  },
  {
    id: 'ct-6',
    client: 'Gamma Solutions FZCO',
    trn: '100556789600008',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 1250000,
    taxableProfit: 1100000,
    corporateTax: 65250,
    status: 'Pending',
    reviewer: 'Lucia Ferreira',
    manager: 'Mike Brown',
    priority: 'Low',
    dueDate: '2026-05-28',
    risk: 'Medium',
    lastUpdated: '2026-05-24',
    taxRate: 9,
    entityType: 'Free Zone',
    tags: ['Tech Services'],
  },
  {
    id: 'ct-7',
    client: 'Nova Hospitality LLC',
    trn: '100556789600009',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 3100000,
    taxableProfit: 3250000,
    corporateTax: 258750,
    status: 'Draft',
    reviewer: 'Omar Haddad',
    manager: 'Sneha Iyer',
    priority: 'Medium',
    dueDate: '2026-06-15',
    risk: 'High',
    lastUpdated: '2026-05-26',
    taxRate: 9,
    entityType: 'Mainland',
    tags: ['Hotel', 'Exemptions Applied'],
  },
  {
    id: 'ct-8',
    client: 'Prime Consultants FZCO',
    trn: '100556789600010',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 350000,
    taxableProfit: 320000,
    corporateTax: 0, // Below AED 375,000 threshold
    status: 'Archived',
    reviewer: 'Kevin Park',
    manager: 'John Doe',
    priority: 'Low',
    dueDate: '2026-06-30',
    risk: 'Low',
    lastUpdated: '2026-05-20',
    taxRate: 9,
    entityType: 'Free Zone',
    tags: ['Consulting', 'Below Threshold'],
  },
  {
    id: 'ct-9',
    client: 'Sigma Services LLC',
    trn: '100556789600011',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 2420000,
    taxableProfit: 2500000,
    corporateTax: 191250,
    status: 'Exception',
    reviewer: 'Priya Nair',
    manager: 'Sneha Iyer',
    priority: 'High',
    dueDate: '2026-05-20',
    risk: 'High',
    lastUpdated: '2026-05-19',
    taxRate: 9,
    entityType: 'Mainland',
    tags: ['Services', 'Discrepancy'],
  },
  {
    id: 'ct-10',
    client: 'Vertex Enterprises LLC',
    trn: '100556789600012',
    taxPeriod: 'FY 2025',
    financialYear: '2025',
    accountingProfit: 6750000,
    taxableProfit: 7100000,
    corporateTax: 605250,
    status: 'Amended',
    reviewer: 'Lucia Ferreira',
    manager: 'John Doe',
    priority: 'Urgent',
    dueDate: '2026-05-28',
    risk: 'High',
    lastUpdated: '2026-05-27',
    taxRate: 9,
    entityType: 'Mainland',
    tags: ['Trading', 'Audit Completed'],
  }
];

const MOCK_DOCS: CtDocument[] = [
  { name: 'CT_Return_Draft_FY2025.pdf', size: '1.8 MB', date: '2026-06-08', type: 'PDF' },
  { name: 'CT_Adjustment_Workbook_2025.xlsx', size: '5.2 MB', date: '2026-06-05', type: 'XLSX' },
  { name: 'Trial_Balance_FY2025.pdf', size: '950 KB', date: '2026-06-01', type: 'PDF' },
  { name: 'Audited_Financial_Statements_2025.pdf', size: '3.4 MB', date: '2026-05-28', type: 'PDF' }
];

const MOCK_ACTIVITY: ActivityLog[] = [
  { timestamp: '2026-06-09 14:23', user: 'Priya Nair', action: 'Approved Return', oldVal: 'Pending', newVal: 'Ready To File', ip: '192.168.1.104', system: 'Chrome/macOS' },
  { timestamp: '2026-06-08 09:12', user: 'System Agent', action: 'Auto-Audited Ledger', oldVal: 'Draft', newVal: 'Pending', ip: '127.0.0.1', system: 'Auditbot v4.2' },
  { timestamp: '2026-06-01 16:30', user: 'Sneha Iyer', action: 'Created Return', oldVal: 'None', newVal: 'Draft', ip: '192.168.2.14', system: 'Firefox/Windows' }
];

const REVIEWERS = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park', 'Unassigned'];
const MANAGERS = ['John Doe', 'Mike Brown', 'Sneha Iyer'];
const YEARS = ['2025', '2024', '2026'];
const PERIODS = ['FY 2025', 'FY 2024', 'Q1-Q4 2025'];

// ============================================================================
// Focus Trap Utility
// ============================================================================

interface FocusTrapProps {
  children: React.ReactNode;
  onEscape: () => void;
}

function FocusTrap({ children, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);

  return <div ref={containerRef} style={{ display: 'contents' }}>{children}</div>;
}

// ============================================================================
// Custom Select / Pickers (Open Upwards)
// ============================================================================

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function CustomSelect({ value, onChange, options, placeholder = 'Select...', icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 0.75rem',
          paddingLeft: icon ? '2.25rem' : '0.75rem',
          borderRadius: '10px',
          border: isOpen ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
          background: '#ffffff',
          color: value ? '#2A1628' : 'rgba(42,22,40,0.4)',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {icon && (
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        )}
        <span style={{ flex: 1, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: 'rgba(42,22,40,0.45)', marginRight: '0.25rem' }}>{placeholder}:</span>
          <span style={{ color: '#2A1628', fontWeight: 600 }}>{value || 'All'}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            width: '100%',
            marginBottom: '4px',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            boxShadow: '0 -8px 24px rgba(42,22,40,0.1)',
            zIndex: 1000,
            maxHeight: '180px',
            overflowY: 'auto',
            boxSizing: 'border-box',
            padding: '4px 0',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: opt === value ? 'rgba(232,118,10,0.06)' : 'transparent',
                color: opt === value ? '#E8760A' : '#2A1628',
                fontSize: '0.8125rem',
                fontWeight: opt === value ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Modal Shell Component
// ============================================================================

interface ModalShellProps {
  onClose: () => void;
  eyebrow: string;
  titlePlain: string;
  titleAccent: string;
  maxWidth?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  bodyStyle?: React.CSSProperties;
}

function ModalShell({ onClose, eyebrow, titlePlain, titleAccent, maxWidth = '540px', footer, children, bodyStyle }: ModalShellProps) {
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <FocusTrap onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${titlePlain} ${titleAccent}`}
          onClick={(e) => e.stopPropagation()}
          style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
        >
          {/* Header */}
          <div style={{ padding: '2rem 2rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{eyebrow}</p>
              <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.625rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {titlePlain} <span style={{ fontStyle: 'italic', color: '#E8760A' }}>{titleAccent}</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{ background: 'rgba(42,22,40,0.04)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628', flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          
          <div style={{ width: '100%', height: '1px', background: 'rgba(42,22,40,0.06)' }} />

          {/* Body */}
          <div className="hide-scrollbar" style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1, ...bodyStyle }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid rgba(42,22,40,0.06)', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
              {footer}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
}

// ============================================================================
// Core Dashboard Component
// ============================================================================

export default function CorporateTaxTab() {
  const { data: queueRes, isLoading: queueLoading, refetch } = useGetQueueQuery({ limit: 1000 });
  const { data: statsRes } = useGetStatsQuery();
  const { data: analyticsRes } = useGetAnalyticsQuery();
  const { data: metaRes } = useGetMetadataQuery();
  const [fileReturn] = usePostFileMutation();
  const [addCtReturn] = useAddCtReturnMutation();
  const [postBulk] = usePostBulkMutation();
  const [importReturns] = useImportReturnsMutation();
  const [addNote] = usePostNoteMutation();
  const [addDocument] = usePostDocumentMutation();
  const dynamicReviewers = metaRes?.data?.reviewers?.length ? [...metaRes.data.reviewers, 'Unassigned'] : REVIEWERS;
  const dynamicManagers = metaRes?.data?.managers?.length ? metaRes.data.managers : MANAGERS;

  // Local state datasets
  const [data, setData] = useState<CtReturnItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: 'success' | 'danger' | 'info' | 'warning' }[]>([]);
  const nextIdRef = useRef(1);

  // Sync queueRes.data into local state when it updates
  const prevQueueDataRef = useRef<CtReturnItem[] | undefined>(undefined);
  if (queueRes?.data && queueRes.data !== prevQueueDataRef.current) {
    prevQueueDataRef.current = queueRes.data;
    setData(queueRes.data);
  }

  // Export Modal Configuration states
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('filtered');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'print'>('excel');

  // Popups State
  const [popup, setPopup] = useState<{
    type: 'import' | 'create' | 'export' | 'assign' | 'validation' | 'submit' | 'delete' | 'notes' | 'confirmDelete' | 'confirmArchive' | 'confirmSubmit' | null;
    tx?: CtReturnItem;
  }>({ type: null });

  // Drawer details state
  const [drawerTxId, setDrawerTxId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'financials' | 'adjustments' | 'computation' | 'validation' | 'timeline' | 'activity' | 'documents' | 'quickBooksSync' | 'notes'>('overview');

  // Filter bar states
  const [filterManager, setFilterManager] = useState('All');
  const [filterReviewer, setFilterReviewer] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterEntityType, setFilterEntityType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search input query
  const [searchQuery, setSearchQuery] = useState('');

  // Row selection checkbox IDs list
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Table columns definition list with order
  const [columns, setColumns] = useState<
    { key: keyof CtReturnItem | 'actions'; label: string; width: string; sortable: boolean; align?: 'left' | 'right' | 'center' }[]
  >([
    { key: 'client', label: 'CLIENT', width: '220px', sortable: true },
    { key: 'trn', label: 'TRN', width: '130px', sortable: true },
    { key: 'taxPeriod', label: 'TAX PERIOD', width: '110px', sortable: true },
    { key: 'financialYear', label: 'FINANCIAL YEAR', width: '110px', sortable: true },
    { key: 'accountingProfit', label: 'ACCOUNTING PROFIT', width: '140px', sortable: true, align: 'right' },
    { key: 'taxableProfit', label: 'TAXABLE PROFIT', width: '140px', sortable: true, align: 'right' },
    { key: 'corporateTax', label: 'CORPORATE TAX', width: '130px', sortable: true, align: 'right' },
    { key: 'status', label: 'FILING STATUS', width: '130px', sortable: true },
    { key: 'reviewer', label: 'REVIEWER', width: '120px', sortable: true },
    { key: 'dueDate', label: 'DUE DATE', width: '110px', sortable: true },
    { key: 'risk', label: 'RISK', width: '90px', sortable: true },
  ]);

  // Context Actions Menu state
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [menuItem, setMenuItem] = useState<CtReturnItem | null>(null);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // New return form state
  const [newFormClient, setNewFormClient] = useState('');
  const [newFormTrn, setNewFormTrn] = useState('');
  const [newFormPeriod, setNewFormPeriod] = useState(PERIODS[0]);
  const [newFormYear, setNewFormYear] = useState(YEARS[0]);
  const [newFormType, setNewFormType] = useState<'Mainland' | 'Free Zone'>('Mainland');
  const [newFormAccountingProfit, setNewFormAccountingProfit] = useState('');
  const [newFormTaxableProfit, setNewFormTaxableProfit] = useState('');
  const [newFormReviewer, setNewFormReviewer] = useState(REVIEWERS[0]);

  // Import form state
  const [importTab, setImportTab] = useState<'local' | 'gdrive' | 'onedrive'>('local');
  const [importFile, setImportFile] = useState('');
  const [importBase64, setImportBase64] = useState('');
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [importTrn, setImportTrn] = useState('');
  const [importPeriod, setImportPeriod] = useState('FY 2025');

  // Notes selection / assign selections
  const [assignedReviewerSelection, setAssignedReviewerSelection] = useState(REVIEWERS[0]);

  // Toast utility helper
  const pushToast = (message: string, tone: 'success' | 'danger' | 'info' | 'warning') => {
    const id = String(nextIdRef.current++);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleRefresh = () => {
    pushToast('Re-fetching Corporate Tax registry from FTA gateway...', 'info');
  };

  const dragKeyRef = useRef<string | null>(null);

  // Column reordering drag handler
  const handleColumnReorder = (draggedKey: string, targetKey: string) => {
    const fromIndex = columns.findIndex((c) => c.key === draggedKey);
    const toIndex = columns.findIndex((c) => c.key === targetKey);
    if (fromIndex !== -1 && toIndex !== -1) {
      const nextCols = [...columns];
      const [moved] = nextCols.splice(fromIndex, 1);
      nextCols.splice(toIndex, 0, moved);
      setColumns(nextCols);
      pushToast('Table column layout updated.', 'info');
    }
  };

  // Metrics dashboard summary calculations
  const stats = useMemo(() => {
    const mainlandCount = data.filter((x) => x.entityType === 'Mainland').length;
    const freezoneCount = data.filter((x) => x.entityType === 'Free Zone').length;
    const pending = data.filter((x) => x.status === 'Pending').length;
    const ready = data.filter((x) => x.status === 'Ready To File').length;
    const filed = data.filter((x) => x.status === 'Filed').length;
    const highRisk = data.filter((x) => x.risk === 'High').length;

    const totalPayable = data.reduce((s, x) => s + (x.corporateTax || 0), 0);
    const totalTaxable = data.reduce((s, x) => s + (x.taxableProfit || 0), 0);
    const totalAccounting = data.reduce((s, x) => s + (x.accountingProfit || 0), 0);

    return {
      mainlandCount,
      freezoneCount,
      pending,
      ready,
      filed,
      highRisk,
      payable: totalPayable,
      taxable: totalTaxable,
      accounting: totalAccounting,
    };
  }, [data]);

  // Tab count indicators
  const tabCounts = useMemo(() => {
    const map: Record<string, number> = { All: data.length };
    data.forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return map;
  }, [data]);

  // Filter returns based on search and parameters
  const filteredData = useMemo(() => {
    return data
      .filter((r) => {
        if (activeStatusTab !== 'All' && r.status !== activeStatusTab) return false;
        if (filterManager !== 'All' && r.manager !== filterManager) return false;
        if (filterReviewer !== 'All' && r.reviewer !== filterReviewer) return false;
        if (filterPeriod !== 'All' && r.taxPeriod !== filterPeriod) return false;
        if (filterYear !== 'All' && r.financialYear !== filterYear) return false;
        if (filterEntityType !== 'All' && r.entityType !== filterEntityType) return false;
        if (filterPriority !== 'All' && r.priority !== filterPriority) return false;
        if (filterRisk !== 'All' && r.risk !== filterRisk) return false;

        if (searchQuery.trim() !== '') {
          const s = searchQuery.toLowerCase();
          const matchClient = r.client.toLowerCase().includes(s);
          const matchTrn = r.trn.includes(s);
          const matchReviewer = r.reviewer.toLowerCase().includes(s);
          const matchManager = r.manager.toLowerCase().includes(s);
          return matchClient || matchTrn || matchReviewer || matchManager;
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortCol) return 0;
        const v1 = a[sortCol as keyof CtReturnItem];
        const v2 = b[sortCol as keyof CtReturnItem];

        if (typeof v1 === 'string') {
          return sortDir === 'asc'
            ? (v1 as string).localeCompare(v2 as string)
            : (v2 as string).localeCompare(v1 as string);
        }
        if (typeof v1 === 'number') {
          return sortDir === 'asc' ? (v1 as number) - (v2 as number) : (v2 as number) - (v1 as number);
        }
        return 0;
      });
  }, [
    data,
    activeStatusTab,
    filterManager,
    filterReviewer,
    filterPeriod,
    filterYear,
    filterEntityType,
    filterPriority,
    filterRisk,
    searchQuery,
    sortCol,
    sortDir,
  ]);

  // Simulate loading skeleton on filter and search state changes
  useEffect(() => {
    let active = true;
    const rafId = requestAnimationFrame(() => {
      if (active) setIsLoading(true);
    });
    const timer = setTimeout(() => {
      if (active) setIsLoading(false);
    }, 250);
    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [
    activeStatusTab,
    filterManager,
    filterReviewer,
    filterPeriod,
    filterYear,
    filterEntityType,
    filterPriority,
    filterRisk,
    searchQuery,
  ]);

  // Page split calculation
  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const { data: drawerDetailsRes } = useGetDrawerDetailsQuery(drawerTxId || '', { skip: !drawerTxId });
  const drawerComputation = drawerDetailsRes?.data?.computation || null;
  const drawerTransactions = drawerDetailsRes?.data?.transactions || [];
  const drawerTimeline = drawerDetailsRes?.data?.timeline || [];
  const drawerActivityLog = drawerDetailsRes?.data?.activityLog || [];
  const drawerValidationChecks = drawerDetailsRes?.data?.validationChecks || [];
  const drawerDocuments = drawerDetailsRes?.data?.documents || [];
  const drawerNotes = drawerDetailsRes?.data?.notes || [];
  const [quickCtNote, setQuickCtNote] = useState('');

  // Active drawer transaction details object
  const activeTx = useMemo(() => {
    return drawerDetailsRes?.data?.ctReturn || data.find((x) => x.id === drawerTxId) || null;
  }, [data, drawerTxId, drawerDetailsRes]);

  // Row selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Submit Action Form
  const handleCreateReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormClient || !newFormTrn) {
      pushToast('Please fill in required fields.', 'warning');
      return;
    }
    addCtReturn({
      client: newFormClient,
      trn: newFormTrn,
      taxPeriod: newFormPeriod,
      financialYear: newFormYear,
      entityType: newFormType,
      accountingProfit: Number(newFormAccountingProfit) || 0,
      taxableProfit: Number(newFormTaxableProfit) || 0,
      reviewer: newFormReviewer,
      dueDate: `${Number(newFormYear) + 1}-05-28`,
      taxRate: 9,
    })
      .unwrap()
      .then(() => {
        refetch();
        setPopup({ type: null });
        pushToast(`Corporate Tax filing created for ${newFormClient}.`, 'success');
        setNewFormClient(''); setNewFormTrn(''); setNewFormAccountingProfit(''); setNewFormTaxableProfit('');
      })
      .catch(() => pushToast('Failed to create Corporate Tax return.', 'danger'));
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importTab === 'local' && !importBase64) {
      pushToast('Please select a ledger report to upload.', 'warning');
      return;
    }
    if (importTab !== 'local') {
      pushToast('Cloud import is not connected yet — please use local upload.', 'info');
      return;
    }
    importReturns({ file: importBase64 })
      .unwrap()
      .then((res: any) => {
        refetch();
        setPopup({ type: null });
        pushToast(`Imported ${res?.data?.count ?? 0} Corporate Tax return(s) successfully.`, 'success');
      })
      .catch(() => pushToast('Failed to import Corporate Tax data.', 'danger'));
  };

  // Bulk actions triggers
  const triggerBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      pushToast('No items selected.', 'warning');
      return;
    }

    if (action === 'reviewer') {
      setPopup({ type: 'assign' });
      return;
    }
    if (action === 'export') {
      setPopup({ type: 'export' });
      return;
    }

    const actionMap: Record<string, string> = { ready: 'markReady', filed: 'markFiled', generate: 'generate' };
    const backendAction = actionMap[action] || action;
    postBulk({ ids: selectedIds, action: backendAction })
      .unwrap()
      .then(() => {
        refetch();
        if (action === 'generate') pushToast(`Generated UAE Corporate Tax Returns (Form CT-1) for ${selectedIds.length} companies.`, 'success');
        else pushToast(`Bulk action applied to ${selectedIds.length} records.`, 'success');
        setSelectedIds([]);
      })
      .catch(() => pushToast('Bulk action failed.', 'danger'));
  };

  // Assign Reviewer execution
  const applyAssignReviewer = () => {
    postBulk({ ids: selectedIds, action: 'assignReviewer', value: { reviewer: assignedReviewerSelection } })
      .unwrap()
      .then(() => {
        refetch();
        setPopup({ type: null });
        pushToast(`Assigned ${assignedReviewerSelection} as reviewer for ${selectedIds.length} records.`, 'success');
        setSelectedIds([]);
      })
      .catch(() => pushToast('Failed to assign reviewer.', 'danger'));
  };

  const handleMenuAction = (key: string) => {
    if (!menuItem) return;
    if (key === 'openDrawer') {
      setDrawerTxId(menuItem.id);
    } else if (key === 'viewSummary') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('financials');
    } else if (key === 'validate') {
      pushToast(`Pre-filing validation passed with 98% completeness.`, 'success');
    } else if (key === 'generate') {
      pushToast(`Form CT-1 XML structure compiled successfully.`, 'success');
    } else if (key === 'submit') {
      pushToast(`Submitted return to FTA portal.`, 'success');
    } else if (key === 'downloadPdf') {
      pushToast(`Corporate Tax Return PDF download started.`, 'info');
    } else if (key === 'downloadExcel') {
      pushToast(`Accounting Ledger Excel workbook exported.`, 'info');
    } else if (key === 'exportXml') {
      pushToast(`Form CT-1 XML file package compiled.`, 'info');
    } else if (key === 'viewTransactions') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('computation');
    } else if (key === 'auditLog') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('activity');
    } else if (key === 'notes') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('notes');
    } else if (key === 'openClient') {
      pushToast(`Navigating to Client profile: ${menuItem.client}...`, 'info');
    } else if (key === 'archive') {
      setPopup({ type: 'confirmArchive', tx: menuItem });
    } else if (key === 'delete') {
      setPopup({ type: 'confirmDelete', tx: menuItem });
    } else if (key === 'submit') {
      setPopup({ type: 'confirmSubmit', tx: menuItem });
    }
  };

  // Close context menu handler
  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.action-btn-trigger')) {
        return;
      }
      setMenuPos(null);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div style={{ color: '#2A1628', fontFamily: 'var(--font-sans), Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0 0.5rem' }}>
      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', pointerEvents: 'none' }}>
        {toasts.map((t) => {
          const bg = t.tone === 'success' ? '#E6F4EA' : t.tone === 'danger' ? '#FCE8E6' : t.tone === 'warning' ? '#FEF7E0' : '#E8F0FE';
          const color = t.tone === 'success' ? '#137333' : t.tone === 'danger' ? '#C5221F' : t.tone === 'warning' ? '#B06000' : '#1A73E8';
          const stroke = color;
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                background: bg,
                color: color,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(42,22,40,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: `1px solid ${color}20`,
                animation: 'slideIn 0.2s ease',
              }}
            >
              {t.tone === 'success' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {t.tone === 'danger' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="3">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* ── 1. BREADCRUMBS & HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A' }} />
            <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Accounting &gt; Corporate Tax Center
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif), Georgia, serif' }}>
            Corporate <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Tax Center</span>
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)' }}>
            Manage corporate tax provisions, taxable income calculations, deductions, adjustments, and electronic filings for your registered client entities.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            type="button"
            onClick={() => setPopup({ type: 'import' })}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              color: '#2A1628',
              borderRadius: '8px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Import CT Data
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'create' })}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              color: '#2A1628',
              borderRadius: '8px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create CT Return
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'export' })}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              color: '#2A1628',
              borderRadius: '8px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            Export Center
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              background: '#2A1628',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(42,22,40,0.15)',
              fontFamily: 'inherit',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. KPI CARDS CONTAINER (10 CARDS) ── */}
      <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { label: 'Corporate Tax Payable', value: `AED ${stats.payable.toLocaleString()}`, sub: 'Unfiled Provisions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Taxable Profit', value: `AED ${stats.taxable.toLocaleString()}`, sub: 'Adjusted CT Base', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Accounting Profit', value: `AED ${stats.accounting.toLocaleString()}`, sub: 'FY2025 Book Earnings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Tax Adjustments', value: `AED ${(stats.taxable - stats.accounting).toLocaleString()}`, sub: 'Net Non-Deductibles', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Tax Adjustments (Actual)', value: `AED ${(statsRes?.data?.taxAdjustments ?? (stats.taxable - stats.accounting)).toLocaleString()}`, sub: 'Taxable vs Accounting Delta', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Returns Pending', value: `${stats.pending} returns`, sub: 'Needs Internal Review', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Returns Filed', value: `${stats.filed} returns`, sub: 'FTA Gateway Approved', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Compliance Score', value: `${analyticsRes?.data?.accuracyTrend?.[analyticsRes.data.accuracyTrend.length - 1] ?? 100}%`, sub: 'On-time filing rate', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'High Risk Returns', value: `${stats.highRisk} items`, sub: 'Requires Director Sign-off', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Filing Deadline', value: statsRes?.data?.nextDeadline || 'None pending', sub: 'Next unfiled due date', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' }
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 10px rgba(42,22,40,0.02)',
              minHeight: '105px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>
                {card.label}
              </span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: card.bg, color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '0.9rem'
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. STATUS CHIPS TAB STRIP ── */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(42,22,40,0.04)' }} className="hide-scrollbar">
        {[
          { label: 'All', count: tabCounts.All },
          { label: 'Draft', count: tabCounts.Draft || 0 },
          { label: 'Pending', count: tabCounts.Pending || 0 },
          { label: 'Ready To File', count: tabCounts.ReadyToFile || tabCounts['Ready To File'] || 0 },
          { label: 'Filed', count: tabCounts.Filed || 0 },
          { label: 'Overdue', count: tabCounts.Overdue || 0 },
          { label: 'Amended', count: tabCounts.Amended || 0 },
          { label: 'Exception', count: tabCounts.Exception || 0 },
          { label: 'Archived', count: tabCounts.Archived || 0 }
        ].map((tab) => {
          const isActive = activeStatusTab === tab.label;
          const tabColors = {
            border: isActive ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
            bg: isActive ? 'rgba(232,118,10,0.06)' : '#ffffff',
            color: isActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
            badgeBg: isActive ? '#E8760A' : 'rgba(42,22,40,0.08)',
            badgeColor: isActive ? '#fff' : 'rgba(42,22,40,0.5)'
          };

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setActiveStatusTab(tab.label);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '20px',
                border: tabColors.border,
                background: tabColors.bg,
                color: tabColors.color,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
              <span style={{ fontSize: '0.675rem', padding: '0.1rem 0.35rem', borderRadius: '10px', background: tabColors.badgeBg, color: tabColors.badgeColor, fontWeight: 700 }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 4. BULK ACTION BAR ── */}
      {selectedIds.length > 0 && (
        <div
          className="no-scrollbar"
          style={{
            background: '#2A1628',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            overflowX: 'auto',
            width: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.25rem', flexShrink: 0 }}>
            {selectedIds.length} records selected
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'Assign Reviewer', ic: '👤', actionKey: 'reviewer' },
              { label: 'Mark Ready', ic: '⏳', actionKey: 'ready' },
              { label: 'Mark Filed', ic: '✅', actionKey: 'filed' },
              { label: 'Generate CT Return', ic: '⚡', actionKey: 'generate' },
              { label: 'Export Selected', ic: '📤', actionKey: 'export' },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => triggerBulkAction(btn.actionKey)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.6rem',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 120ms',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <span style={{ fontSize: '0.6rem' }}>{btn.ic}</span>
                {btn.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedIds([])}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
              flexShrink: 0,
              paddingLeft: '0.5rem',
            }}
          >
            ✕ Clear Selection
          </button>
        </div>
      )}

      {/* ── 5. FILTERS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem', borderRadius: '12px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search company, TRN, reviewer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              paddingLeft: '2.25rem',
              borderRadius: '10px',
              border: '1px solid #DDD0C4',
              fontSize: '0.8125rem',
              boxSizing: 'border-box',
              outline: 'none',
              fontFamily: 'inherit',
              color: '#2A1628',
            }}
          />
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        <CustomSelect value={filterManager} onChange={setFilterManager} options={['All', ...dynamicManagers]} placeholder="Manager" />
        <CustomSelect value={filterYear} onChange={setFilterYear} options={['All', ...YEARS]} placeholder="Year" />
        <CustomSelect value={filterPeriod} onChange={setFilterPeriod} options={['All', ...PERIODS]} placeholder="Period" />
        <CustomSelect value={filterReviewer} onChange={setFilterReviewer} options={['All', ...dynamicReviewers]} placeholder="Reviewer" />
        <CustomSelect value={filterRisk} onChange={setFilterRisk} options={['All', 'Low', 'Medium', 'High']} placeholder="Risk" />
        <CustomSelect value={filterEntityType} onChange={setFilterEntityType} options={['All', 'Mainland', 'Free Zone']} placeholder="Type" />
        <CustomSelect value={filterPriority} onChange={setFilterPriority} options={['All', 'Low', 'Medium', 'High', 'Urgent']} placeholder="Priority" />
      </div>

      {/* ── 6. MAIN CORPORATE TAX TABLE ── */}
      <div style={{ border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
        <div style={{ overflowX: 'auto', position: 'relative' }} className="hide-scrollbar">
          <table style={{ width: '100%', minWidth: '1350px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <th style={{ padding: '1rem 0.75rem', width: '48px', textAlign: 'center', position: 'sticky', left: 0, background: '#FAF8F5', zIndex: 10 }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                  />
                </th>
                {columns.map((col) => {
                  const isClient = col.key === 'client';
                  return (
                    <th
                      key={col.key}
                      draggable
                      onDragStart={() => { dragKeyRef.current = col.key; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragKeyRef.current && dragKeyRef.current !== col.key) {
                          handleColumnReorder(dragKeyRef.current, col.key);
                        }
                        dragKeyRef.current = null;
                      }}
                      onClick={() => {
                        if (col.sortable) {
                          setSortCol(col.key);
                          setSortDir(sortCol === col.key && sortDir === 'asc' ? 'desc' : 'asc');
                        }
                      }}
                      style={{
                        padding: '1rem',
                        position: isClient ? 'sticky' : undefined,
                        left: isClient ? '48px' : undefined,
                        background: '#FAF8F5',
                        zIndex: isClient ? 10 : undefined,
                        borderRight: isClient ? '1px solid #DDD0C4' : undefined,
                        cursor: col.sortable ? 'pointer' : 'grab',
                        userSelect: 'none',
                        textAlign: col.align,
                      }}
                    >
                      {col.label} {sortCol === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  );
                })}
                <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                    <td style={{ padding: '1rem' }}><div style={{ width: '16px', height: '16px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                    {columns.map((col, idx) => (
                      <td key={idx} style={{ padding: '1rem' }}><div style={{ width: col.key === 'client' ? '120px' : '60px', height: '12px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                    ))}
                    <td />
                  </tr>
                ))
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(42,22,40,0.4)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem', opacity: 0.3 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628' }}>No Corporate Tax Returns</div>
                    <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.75rem' }}>Create your first CT return or import ledger report to get started.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setPopup({ type: 'create' })}
                        style={{ padding: '0.5rem 1rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Create CT Return
                      </button>
                      <button
                        type="button"
                        onClick={() => setPopup({ type: 'import' })}
                        style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #DDD0C4', color: '#2A1628', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Import Ledger
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: idx < pagedData.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                        background: isSelected ? 'rgba(232,118,10,0.02)' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(42,22,40,0.01)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? 'rgba(232,118,10,0.02)' : 'transparent')}
                    >
                      <td
                        style={{ padding: '0.625rem 0.75rem', textAlign: 'center', position: 'sticky', left: 0, background: isSelected ? '#FAF4EE' : '#ffffff', zIndex: 9 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(item.id)} />
                      </td>

                      {columns.map((col) => {
                        const isClient = col.key === 'client';
                        const cellVal = item[col.key as keyof CtReturnItem];
                        let tdContent: React.ReactNode = String(cellVal ?? '');
                        let tdStyle: React.CSSProperties = {
                          padding: '0.625rem 1rem',
                          whiteSpace: 'nowrap',
                        };

                        if (col.key === 'client') {
                          tdStyle = {
                            padding: '0.625rem 1rem',
                            position: 'sticky',
                            left: '48px',
                            background: isSelected ? '#FAF4EE' : '#ffffff',
                            zIndex: 9,
                            borderRight: '1px solid rgba(42,22,40,0.06)',
                          };
                          tdContent = (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(232, 118, 10, 0.08)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                {item.client.split(' ').map((x) => x[0]).join('').substr(0, 2)}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 700, color: '#2A1628', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.client}</div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>{item.entityType}</div>
                              </div>
                            </div>
                          );
                        } else if (col.key === 'trn') {
                          tdStyle = { ...tdStyle, color: 'rgba(42,22,40,0.75)', fontWeight: 500 };
                        } else if (col.key === 'taxPeriod' || col.key === 'financialYear') {
                          tdStyle = { ...tdStyle, color: '#2A1628', fontWeight: 600, textAlign: 'center' };
                        } else if (col.key === 'accountingProfit' || col.key === 'taxableProfit' || col.key === 'corporateTax') {
                          tdStyle = { ...tdStyle, fontWeight: 600, color: '#2A1628' };
                          tdContent = typeof cellVal === 'number' ? `AED ${cellVal.toLocaleString()}` : 'AED 0';
                        } else if (col.key === 'status') {
                          tdStyle = { ...tdStyle, fontWeight: 700 };
                          tdContent = (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background:
                                  item.status === 'Filed'
                                    ? 'rgba(19,115,51,0.1)'
                                    : item.status === 'Overdue'
                                    ? 'rgba(197,34,31,0.1)'
                                    : item.status === 'Ready To File'
                                    ? 'rgba(26,115,232,0.1)'
                                    : 'rgba(42,22,40,0.08)',
                                color:
                                  item.status === 'Filed'
                                    ? '#137333'
                                    : item.status === 'Overdue'
                                    ? '#C5221F'
                                    : item.status === 'Ready To File'
                                    ? '#1A73E8'
                                    : '#2A1628',
                              }}
                            >
                              {item.status}
                            </span>
                          );
                        } else if (col.key === 'reviewer') {
                          tdStyle = { ...tdStyle, color: '#2A1628', fontWeight: 600 };
                        } else if (col.key === 'risk') {
                          tdStyle = { ...tdStyle, fontWeight: 700 };
                          tdContent = (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background:
                                  item.risk === 'High'
                                    ? 'rgba(185,28,28,0.1)'
                                    : item.risk === 'Medium'
                                    ? 'rgba(180,83,9,0.1)'
                                    : 'rgba(4,120,87,0.1)',
                                color:
                                  item.risk === 'High'
                                    ? '#b91c1c'
                                    : item.risk === 'Medium'
                                    ? '#b45309'
                                    : '#047857',
                              }}
                            >
                              {item.risk}
                            </span>
                          );
                        } else if (col.key === 'dueDate') {
                          const isPast = new Date(item.dueDate) < new Date() && item.status !== 'Filed';
                          tdStyle = { ...tdStyle, color: isPast ? '#C5221F' : 'inherit', fontWeight: isPast ? 700 : 500 };
                        }

                        return (
                          <td
                            key={col.key}
                            onClick={() => {
                              setDrawerTxId(item.id);
                              setDrawerTab('overview');
                            }}
                            style={{
                              ...tdStyle,
                              position: isClient ? 'sticky' : tdStyle.position,
                              left: isClient ? '48px' : tdStyle.left,
                              background: isClient ? (isSelected ? '#FAF4EE' : '#ffffff') : (isSelected ? 'rgba(232,118,10,0.02)' : undefined),
                              zIndex: isClient ? 8 : tdStyle.zIndex,
                              cursor: 'pointer',
                              textAlign: col.align || tdStyle.textAlign,
                            }}
                          >
                            {tdContent}
                          </td>
                        );
                      })}

                      {/* Actions context menu trigger */}
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="action-btn-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 6, left: rect.right });
                            setMenuItem(item);
                          }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.6)" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div style={{ margin: '0 -1px -1px -1px' }}>
          <Pagination
            totalItems={filteredData.length}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            itemLabel="entities"
          />
        </div>
      </div>

      {/* ── 6.5. SVG ANALYTICS DASHBOARD ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
        {/* Trend Area Chart */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Tax Liability Position & Trends</h3>
          <div style={{ display: 'flex', flexDirection: 'column', height: '220px', justifyContent: 'space-between', position: 'relative' }}>
            <svg width="100%" height="180px" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ct-gold-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8760A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#E8760A" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 100 L 0 80 L 80 65 L 160 55 L 245 40 L 330 30 L 415 15 L 500 5 Z" fill="url(#ct-gold-grad)" />
              <path d="M 0 80 L 80 65 L 160 55 L 245 40 L 330 30 L 415 15 L 500 5" fill="none" stroke="#E8760A" strokeWidth="2.5" />
              <circle cx="80" cy="65" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="160" cy="55" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="245" cy="40" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="330" cy="30" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="415" cy="15" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="500" cy="5" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>
              <span>Dec 2025</span>
              <span>Jan 2026</span>
              <span>Feb 2026</span>
              <span>Mar 2026</span>
              <span>Apr 2026</span>
              <span>May 2026</span>
              <span>Jun 2026</span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Compliance & Risk Score</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '180px' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="130" height="130" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FAF4EE" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3" strokeDasharray="98 2" />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2A1628', lineHeight: 1 }}>98.0%</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.45)', marginTop: '4px' }}>Clean Audits</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Passed Audits</span>
                <strong>98.0%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Warning Flags</span>
                <strong>1.5%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Filing Errors</span>
                <strong>0.5%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. ACTIONS POPUP CONTEXT MENU ── */}
      {menuPos && menuItem && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setMenuPos(null)} />
          <div
            style={{
              position: 'fixed',
              top: Math.min(menuPos.top, window.innerHeight - 320),
              left: Math.min(menuPos.left - 210, window.innerWidth - 220),
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              boxShadow: '0 8px 24px rgba(42,22,40,0.15)',
              borderRadius: '12px',
              padding: '4px',
              zIndex: 1000,
              minWidth: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {[
              { key: 'openDrawer', label: 'Open CT Drawer', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
              { key: 'viewSummary', label: 'View Tax Summary', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
              { key: 'validate', label: 'Validate Return', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { key: 'generate', label: 'Generate CT Return', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              { key: 'submit', label: 'Submit Return', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> },
              { key: 'downloadPdf', label: 'Download PDF', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> },
              { key: 'downloadExcel', label: 'Download Excel', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
              { key: 'exportXml', label: 'Export XML', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
              { key: 'viewTransactions', label: 'View Transactions', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> },
              { key: 'auditLog', label: 'Audit Log', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { key: 'notes', label: 'Notes', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { key: 'openClient', label: 'Open Client', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg> },
              { key: 'archive', label: 'Archive', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8v13H3V8M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
              { key: 'delete', label: 'Delete Return', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>, danger: true }
            ].map((mi, idx) => (
              <div
                key={idx}
                onClick={() => {
                  handleMenuAction(mi.key);
                  setMenuPos(null);
                }}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  color: mi.danger ? '#EF4444' : '#2A1628',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 550,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = mi.danger ? 'rgba(239,68,68,0.06)' : 'rgba(232,118,10,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', color: mi.danger ? '#EF4444' : '#E8760A' }}>{mi.icon}</span>
                {mi.label}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 8. RIGHT DETAILS DRAWER ── */}
      {activeTx && (
        <div
          role="presentation"
          onClick={() => setDrawerTxId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(42,22,40,0.2)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            fontFamily: 'var(--font-sans), Inter, sans-serif',
          }}
        >
          <div
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '580px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-8px 0 32px rgba(42,22,40,0.15)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'drawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(42,22,40,0.06)', background: '#FAF8F5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#2A1628' }}>{activeTx.client}</h2>
                <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>TRN: {activeTx.trn}</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(42,22,40,0.3)' }} />
                  <span style={{ fontWeight: 700, color: '#E8760A' }}>Corporate Tax Return {activeTx.taxPeriod}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerTxId(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(42,22,40,0.4)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Tab strip */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 2rem', borderBottom: '1px solid rgba(42,22,40,0.06)', overflowX: 'auto', flexShrink: 0 }}>
              {[
                { key: 'overview' as const, label: 'Overview' },
                { key: 'financials' as const, label: 'Financial Statements' },
                { key: 'adjustments' as const, label: 'Tax Adjustments' },
                { key: 'computation' as const, label: 'Tax Computation' },
                { key: 'validation' as const, label: 'Validation' },
                { key: 'timeline' as const, label: 'Timeline' },
                { key: 'activity' as const, label: 'Activity' },
                { key: 'documents' as const, label: 'Documents' },
                { key: 'quickBooksSync' as const, label: 'QuickBooks Sync' },
                { key: 'notes' as const, label: 'Notes' },
              ].map((t) => {
                const isTab = drawerTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setDrawerTab(t.key)}
                    style={{
                      padding: '0.6rem 0',
                      border: 'none',
                      background: 'transparent',
                      color: isTab ? '#E8760A' : 'rgba(42,22,40,0.5)',
                      fontSize: '0.8125rem',
                      fontWeight: isTab ? 700 : 600,
                      cursor: 'pointer',
                      borderBottom: isTab ? '2px solid #E8760A' : 'none',
                      whiteSpace: 'nowrap',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Scroll */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="hide-scrollbar">
              {drawerTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(42,22,40,0.04)' }}>
                    {[
                      { label: 'Company', val: activeTx.client },
                      { label: 'TRN', val: activeTx.trn },
                      { label: 'Tax Period', val: activeTx.taxPeriod },
                      { label: 'Reviewer', val: activeTx.reviewer },
                      { label: 'Filing Status', val: activeTx.status },
                      { label: 'Due Date', val: activeTx.dueDate },
                      { label: 'Last Modified', val: activeTx.lastUpdated }
                    ].map((itm, idx) => (
                      <div key={idx}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>{itm.label}</span>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628', marginTop: '0.15rem' }}>{itm.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Card */}
                  <div style={{ padding: '1.25rem', border: '1px solid #F3DEC9', background: '#FAF2EC', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filing Position Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { label: 'Accounting Profit', val: activeTx.accountingProfit },
                        { label: 'Taxable Profit (Adjusted)', val: activeTx.taxableProfit },
                        { label: 'Corporate Tax Liability', val: activeTx.corporateTax, highlight: true }
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < 2 ? '1px dashed rgba(42,22,40,0.1)' : 'none', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500 }}>{item.label}</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: item.highlight ? '#E8760A' : '#2A1628' }}>
                            AED {item.val.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'financials' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628' }}>Profit &amp; Loss Statement</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    {[
                      { label: 'Revenue', val: activeTx.accountingProfit * 2.5 },
                      { label: 'Cost of Sales', val: activeTx.accountingProfit * 1.0 },
                      { label: 'Gross Profit', val: activeTx.accountingProfit * 1.5, bold: true },
                      { label: 'Operating Expenses', val: activeTx.accountingProfit * 0.4 },
                      { label: 'EBITDA', val: activeTx.accountingProfit * 1.1, bold: true },
                      { label: 'Net Profit', val: activeTx.accountingProfit, bold: true, highlight: true }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(42,22,40,0.04)', paddingBottom: '0.4rem', paddingLeft: item.bold ? 0 : '1rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: item.bold ? '#2A1628' : 'rgba(42,22,40,0.6)', fontWeight: item.bold ? 700 : 500 }}>{item.label}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: item.highlight ? '#E8760A' : '#2A1628' }}>
                          AED {Math.round(item.val).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'adjustments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628' }}>Corporate Tax Adjustments</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    {[
                      { label: 'Non-deductible Expenses', val: activeTx.accountingProfit * 0.05, type: 'Addback' },
                      { label: 'Depreciation Adjustments', val: activeTx.accountingProfit * 0.03, type: 'Addback' },
                      { label: 'Entertainment Expenses (50% limit)', val: activeTx.accountingProfit * 0.01, type: 'Addback' },
                      { label: 'Donations to Non-Approved Entities', val: activeTx.accountingProfit * 0.005, type: 'Addback' },
                      { label: 'Related Party Adjustments (Transfer Pricing)', val: activeTx.accountingProfit * 0.02, type: 'Addback' },
                      { label: 'Loss Relief Utilized', val: -activeTx.accountingProfit * 0.04, type: 'Deduction' },
                      { label: 'Exempt Income', val: -activeTx.accountingProfit * 0.015, type: 'Deduction' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(42,22,40,0.04)', paddingBottom: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', color: '#2A1628', fontWeight: 600 }}>{item.label}</div>
                          <span style={{ fontSize: '0.6rem', color: item.type === 'Addback' ? '#C5221F' : '#137333', fontWeight: 700, textTransform: 'uppercase' }}>{item.type}</span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: item.val > 0 ? '#C5221F' : '#137333' }}>
                          {item.val > 0 ? '+' : ''}AED {Math.round(item.val).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'computation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628' }}>Tax Liability Computation</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    {[
                      { label: 'Accounting Profit', val: drawerComputation?.accountingProfit ?? activeTx.accountingProfit },
                      { label: 'Total Adjustments (Net Addbacks)', val: drawerComputation?.netAdjustment ?? (activeTx.taxableProfit - activeTx.accountingProfit) },
                      { label: 'Adjusted Taxable Profit', val: drawerComputation?.taxableProfit ?? activeTx.taxableProfit, bold: true },
                      { label: 'Basic Tax-Free Threshold', val: -(drawerComputation?.thresholdExempt ?? 375000), type: 'Deduction' },
                      { label: 'Taxable Income Above Threshold', val: drawerComputation?.taxableAboveThreshold ?? Math.max(0, activeTx.taxableProfit - 375000), bold: true },
                      { label: 'Corporate Tax Rate', val: `${activeTx.taxRate}%`, rawVal: true },
                      { label: 'Corporate Tax Liability', val: drawerComputation?.corporateTax ?? activeTx.corporateTax, bold: true, highlight: true }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(42,22,40,0.04)', paddingBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: item.bold ? '#2A1628' : 'rgba(42,22,40,0.6)', fontWeight: item.bold ? 700 : 500 }}>{item.label}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: item.highlight ? '#E8760A' : '#2A1628' }}>
                          {item.rawVal ? item.val : `AED ${Math.round(Number(item.val)).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'validation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(() => {
                    const passed = drawerValidationChecks.filter((c: any) => c.status === 'pass').length;
                    const pct = drawerValidationChecks.length ? Math.round((passed / drawerValidationChecks.length) * 100) : 100;
                    return (
                      <div style={{ background: pct === 100 ? '#E6F4EA' : '#FFF7ED', padding: '0.75rem 1rem', borderRadius: '8px', color: pct === 100 ? '#137333' : '#c2410c', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Compliance Validation Summary: {pct}% Passed ({passed}/{drawerValidationChecks.length})
                      </div>
                    );
                  })()}
                  {drawerValidationChecks.map((chk: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', border: '1px solid rgba(42,22,40,0.05)', borderRadius: '10px', background: '#FAF8F5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.8125rem' }}>{chk.label}</strong>
                        <span style={{ fontSize: '0.65rem', background: chk.status === 'pass' ? '#E6F4EA' : chk.status === 'warning' ? '#FFF7ED' : '#FCE8E6', color: chk.status === 'pass' ? '#137333' : chk.status === 'warning' ? '#c2410c' : '#C5221F', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                          {chk.status.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>{chk.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem' }}>
                  {drawerTimeline.map((step: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                      {idx < drawerTimeline.length - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-20px', width: '1px', background: 'rgba(42,22,40,0.1)' }} />}
                      <div style={{ width: '23px', height: '23px', borderRadius: '50%', background: step.status === 'done' ? '#E8760A' : 'rgba(42,22,40,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, marginTop: '2px', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.8125rem', display: 'block' }}>{step.stage}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>by {step.actor || 'System'} • {step.timestamp ? String(step.timestamp).split('T')[0] : 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {drawerActivityLog.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No activity recorded yet.</p>}
                  {drawerActivityLog.map((act: any) => {
                    const isCreate = act.operation === 'INSERT';
                    const isDelete = act.operation === 'DELETE';
                    const badgeBg = isCreate ? '#E8F0FE' : isDelete ? '#FCE8E6' : '#FFF0E2';
                    const badgeColor = isCreate ? '#1A73E8' : isDelete ? '#C5221F' : '#E8760A';
                    return (
                      <div key={act.id} style={{ padding: '0.6rem 0.75rem', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.03)', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                          <span style={{ background: badgeBg, color: badgeColor, padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>
                            {String(act.tableName).replace(/_/g, ' ')} {act.operation}
                          </span>
                          <span style={{ color: 'rgba(42,22,40,0.45)' }}>{act.changedAt ? String(act.changedAt).replace('T', ' ').split('.')[0] : ''}</span>
                        </div>
                        <div style={{ marginTop: '0.35rem', color: 'rgba(42,22,40,0.6)' }}>By: {act.changedBy || 'System'}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {drawerTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const name = window.prompt('Document name (metadata only — no real file upload in this build):');
                      if (!name || !activeTx) return;
                      addDocument({ id: activeTx.id, name, type: 'Supporting Doc' })
                        .unwrap()
                        .then(() => pushToast('Document recorded.', 'success'))
                        .catch(() => pushToast('Failed to record document.', 'danger'));
                    }}
                    style={{ alignSelf: 'flex-start', padding: '0.4rem 0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', background: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    + Add Document
                  </button>
                  {drawerDocuments.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No documents recorded yet.</p>}
                  {drawerDocuments.map((doc: any) => (
                    <div key={doc.id} style={{ padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>{doc.type} • {doc.sizeKb} KB • Uploaded by {doc.uploadedBy || 'Unknown'} on {doc.createdAt ? String(doc.createdAt).split('T')[0] : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'quickBooksSync' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#166534' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#166534' }}>QuickBooks Status: Connected</div>
                      <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '0.1rem' }}>Last synced: 2026-06-09 14:23 by Priya Nair</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => pushToast('Corporate Tax data sync to QuickBooks started.', 'success')}
                    style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Sync to QuickBooks Online
                  </button>
                  <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Auto-sync configuration</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        'Automatically sync on return approval',
                        'Sync attached documents and adjustments journal entries',
                        'Map non-deductible items to specific tax accounts'
                      ].map((cfg, idx) => (
                        <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.7)', cursor: 'pointer' }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: '#E8760A' }} />
                          {cfg}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea
                      placeholder="Type a new internal corporate tax audit note..."
                      value={quickCtNote}
                      onChange={(e) => setQuickCtNote(e.target.value)}
                      style={{ width: '100%', minHeight: '80px', padding: '0.625rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <button
                      type="button"
                      disabled={!quickCtNote.trim()}
                      onClick={() => {
                        if (!activeTx || !quickCtNote.trim()) return;
                        addNote({ id: activeTx.id, body: quickCtNote })
                          .unwrap()
                          .then(() => { setQuickCtNote(''); pushToast('Note added successfully.', 'success'); })
                          .catch(() => pushToast('Failed to add note.', 'danger'));
                      }}
                      style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', width: 'fit-content', alignSelf: 'flex-end', fontSize: '0.75rem', fontWeight: 700, cursor: quickCtNote.trim() ? 'pointer' : 'not-allowed', opacity: quickCtNote.trim() ? 1 : 0.6, fontFamily: 'inherit' }}
                    >
                      Add Note
                    </button>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {drawerNotes.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No notes yet.</p>}
                    {drawerNotes.map((note: any) => (
                      <div key={note.id} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(42,22,40,0.5)', marginBottom: '0.25rem', fontSize: '0.7rem' }}>
                          <span style={{ fontWeight: 600 }}>{note.author || 'Unknown'}</span>
                          <span>{note.createdAt ? String(note.createdAt).split('T')[0] : ''}</span>
                        </div>
                        <div style={{ color: '#2A1628', lineHeight: 1.3 }}>{note.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(42,22,40,0.06)' }} />

            {/* Drawer Footer */}
            <div style={{ padding: '1.25rem 2rem 1.75rem', background: '#FAF8F5', display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  if (activeTx.status === 'Filed') {
                    pushToast('Corporate Tax Return PDF download started.', 'info');
                  } else {
                    fileReturn({ id: activeTx.id })
                      .unwrap()
                      .then(() => {
                        refetch();
                        setDrawerTxId(null);
                        pushToast(`Return marked as Filed.`, 'success');
                      })
                      .catch(() => pushToast('Failed to file Corporate Tax return.', 'danger'));
                  }
                }}
                style={{ flex: 1, padding: '0.6rem', background: activeTx.status === 'Filed' ? '#137333' : '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {activeTx.status === 'Filed' ? 'Download Filed Return' : 'Approve & File Return'}
              </button>
              <button
                type="button"
                onClick={() => setDrawerTxId(null)}
                style={{ padding: '0.6rem 1.25rem', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. MODALS ── */}
      {/* Import Modal */}
      {popup.type === 'import' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Import CT"
          titleAccent="Data"
          maxWidth="680px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit as unknown as React.MouseEventHandler}
                disabled={importTab === 'local' && !importFile}
                style={{
                  background: (importTab === 'local' && !importFile) ? 'rgba(42,22,40,0.12)' : '#2A1628',
                  color: (importTab === 'local' && !importFile) ? 'rgba(42,22,40,0.3)' : '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.625rem 1.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: (importTab === 'local' && !importFile) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Process Import
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(42,22,40,0.04)', borderRadius: '12px', padding: '4px' }}>
              {[
                { key: 'local' as const, label: 'Local Upload' },
                { key: 'gdrive' as const, label: 'Google Drive' },
                { key: 'onedrive' as const, label: 'OneDrive' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setImportTab(tab.key)}
                  style={{
                    flex: '1 1 auto',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.625rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: importTab === tab.key ? '#ffffff' : 'transparent',
                    color: importTab === tab.key ? '#2A1628' : 'rgba(42,22,40,0.5)',
                    boxShadow: importTab === tab.key ? '0 2px 8px rgba(42,22,40,0.05)' : 'none',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {importTab === 'local' ? (
              <div
                style={{
                  border: importFile ? '1.5px solid #047857' : '1.5px dashed #DDD0C4',
                  borderRadius: '12px',
                  minHeight: '240px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: importFile ? 'rgba(4,120,87,0.02)' : '#FAF8F5',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onClick={() => importFileInputRef.current?.click()}
              >
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = reader.result as string;
                      setImportBase64(result.split(',')[1] || '');
                      setImportFile(f.name);
                    };
                    reader.readAsDataURL(f);
                  }}
                />
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: importFile ? 'rgba(4,120,87,0.1)' : 'rgba(42,22,40,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: importFile ? '#047857' : '#2A1628'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                </div>
                {importFile ? (
                  <>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#047857' }}>{importFile}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)' }}>Click to change file</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#2A1628' }}>Click to upload ledger file</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)' }}>.xlsx, .csv · up to 50 MB</p>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div
                  style={{
                    border: '1.5px dashed #DDD0C4',
                    borderRadius: '12px',
                    padding: '2.5rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'center',
                    background: '#FAF8F5',
                    minHeight: '240px',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {importFile && (importTab === 'gdrive' || importTab === 'onedrive') ? (
                    <>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: importTab === 'gdrive' ? 'rgba(66,133,244,0.05)' : 'rgba(0,120,212,0.05)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {importTab === 'gdrive' ? (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#4285F4" />
                            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#34A853" />
                            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#FBBC05" />
                            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#EA4335" />
                          </svg>
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0078D4" />
                            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#00B7C3" />
                            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                          </svg>
                        )}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', fontWeight: 700, color: '#137333', background: '#E6F4EA', borderRadius: '999px', padding: '0.25rem 0.6rem' }}>
                        Account connected
                      </span>
                      <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#047857' }}>✓ {importFile}</p>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: importTab === 'gdrive' ? 'rgba(66,133,244,0.05)' : 'rgba(0,120,212,0.05)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {importTab === 'gdrive' ? (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#4285F4" />
                            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#34A853" />
                            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#FBBC05" />
                            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#EA4335" />
                          </svg>
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#0078D4" />
                            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#00B7C3" />
                            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#0078D4" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#2A1628' }}>
                          {importTab === 'gdrive' ? 'Connect Google Drive' : 'Connect OneDrive'}
                        </h4>
                        <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)', maxWidth: '300px', marginInline: 'auto' }}>
                          {importTab === 'gdrive'
                            ? 'Sign in with Google to browse and pick an Excel sheet from your Drive'
                            : 'Sign in with Microsoft to browse and pick an Excel sheet from your OneDrive'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImportFile(importTab === 'gdrive' ? 'Google_Drive_Import_2026.xlsx' : 'OneDrive_Import_2026.xlsx');
                          setImportTrn('100556789600999');
                          pushToast(importTab === 'gdrive' ? 'Google Drive connected.' : 'OneDrive connected.', 'success');
                        }}
                        style={{
                          background: importTab === 'gdrive' ? '#4285F4' : '#0078D4',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.625rem 1.5rem',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontFamily: 'inherit',
                          boxShadow: importTab === 'gdrive' ? '0 4px 12px rgba(66,133,244,0.2)' : '0 4px 12px rgba(0,120,212,0.2)'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                          <rect x="13" y="3" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                          <rect x="3" y="13" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                          <rect x="13" y="13" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                        </svg>
                        {importTab === 'gdrive' ? 'Sign in with Google' : 'Sign in with Microsoft'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TRN + Period — always shown for all tabs, side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Select Target TRN</label>
                <input
                  type="text"
                  placeholder="e.g. 100556789600003"
                  value={importTrn}
                  onChange={(e) => setImportTrn(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Filing Target Period</label>
                <CustomSelect
                  value={importPeriod}
                  onChange={setImportPeriod}
                  options={PERIODS}
                />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Create CT Return Modal */}
      {popup.type === 'create' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Create CT"
          titleAccent="Return"
          maxWidth="580px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newFormClient || !newFormTrn}
                onClick={handleCreateReturnSubmit as unknown as React.MouseEventHandler}
                style={{
                  background: (!newFormClient || !newFormTrn) ? 'rgba(42,22,40,0.12)' : '#2A1628',
                  color: (!newFormClient || !newFormTrn) ? 'rgba(42,22,40,0.3)' : '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.625rem 1.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: (!newFormClient || !newFormTrn) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Generate Filing
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Futtaim Group"
                  value={newFormClient}
                  onChange={(e) => setNewFormClient(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#2A1628' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>UAE TRN *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100556789600003"
                  value={newFormTrn}
                  onChange={(e) => setNewFormTrn(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#2A1628' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Filing Year</label>
                <CustomSelect value={newFormYear} onChange={setNewFormYear} options={YEARS} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Tax Period</label>
                <CustomSelect value={newFormPeriod} onChange={setNewFormPeriod} options={PERIODS} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Tax Zone</label>
                <CustomSelect value={newFormType} onChange={(val) => setNewFormType(val as 'Mainland' | 'Free Zone')} options={['Mainland', 'Free Zone']} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Accounting Profit (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newFormAccountingProfit}
                  onChange={(e) => setNewFormAccountingProfit(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#2A1628' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Taxable Profit (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newFormTaxableProfit}
                  onChange={(e) => setNewFormTaxableProfit(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#2A1628' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>Assigned Reviewer</label>
              <CustomSelect value={newFormReviewer} onChange={setNewFormReviewer} options={REVIEWERS} />
            </div>
          </div>
        </ModalShell>
      )}

      {/* Export Center Modal */}
      {popup.type === 'export' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Export"
          titleAccent="Returns"
          maxWidth="500px"
          bodyStyle={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)', fontWeight: 500 }}>
                Exporting as <strong style={{ color: '#2A1628' }}>.{exportFormat === 'excel' ? 'XLSX' : exportFormat.toUpperCase()}</strong>
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setPopup({ type: null })}
                  style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPopup({ type: null });
                    pushToast(`${exportFormat === 'excel' ? 'XLSX' : exportFormat.toUpperCase()} CT return registry export started.`, 'success');
                  }}
                  style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(232,118,10,0.25)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download Export
                </button>
              </div>
            </div>
          }
        >
          {/* Scope selection */}
          <div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Which returns to export?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { key: 'all' as const, label: 'All Returns', sublabel: 'Export all records in the CT center register', count: data.length },
                { key: 'filtered' as const, label: 'Filtered Results', sublabel: 'Only records matching current active filters', count: filteredData.length },
                { key: 'selected' as const, label: 'Selected Returns', sublabel: 'Only the returns you have checked', count: selectedIds.length }
              ].map((opt) => {
                const isSelected = exportScope === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => setExportScope(opt.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? '#E8760A' : '#DDD0C4'}`,
                      background: isSelected ? 'rgba(232,118,10,0.04)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Custom radio circle */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#E8760A' : '#DDD0C4'}`,
                      background: isSelected ? '#E8760A' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isSelected && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ffffff' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#2A1628' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.1rem' }}>{opt.sublabel}</div>
                    </div>
                    {/* Count badge */}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#E8760A' : 'rgba(42,22,40,0.4)', background: isSelected ? 'rgba(232,118,10,0.08)' : 'rgba(42,22,40,0.04)', borderRadius: '4px', padding: '0.15rem 0.5rem', whiteSpace: 'nowrap' }}>
                      {opt.count} returns
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Format selector */}
          <div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Select Format
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { key: 'excel' as const, label: '.XLSX' },
                { key: 'csv' as const, label: '.CSV' },
                { key: 'pdf' as const, label: '.PDF' },
                { key: 'print' as const, label: 'PRINT' }
              ].map((fmt) => {
                const isActive = exportFormat === fmt.key;
                return (
                  <button
                    key={fmt.key}
                    type="button"
                    onClick={() => setExportFormat(fmt.key)}
                    style={{
                      padding: '0.625rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${isActive ? '#E8760A' : '#DDD0C4'}`,
                      background: isActive ? 'rgba(232,118,10,0.04)' : '#ffffff',
                      color: isActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    {fmt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </ModalShell>
      )}

      {/* Assign Reviewer Modal */}
      {popup.type === 'assign' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Assign"
          titleAccent="Reviewer"
          maxWidth="440px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyAssignReviewer}
                style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Assign Reviewer
              </button>
            </>
          }
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>Select Reviewer</label>
            <CustomSelect
              value={assignedReviewerSelection}
              onChange={setAssignedReviewerSelection}
              options={REVIEWERS}
            />
          </div>
        </ModalShell>
      )}
      {/* Modal: Confirm Delete */}
      {popup.type === 'confirmDelete' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Delete"
          titleAccent="Filing"
          maxWidth="400px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  postBulk({ ids: [popup.tx!.id], action: 'delete' })
                    .unwrap()
                    .then(() => { refetch(); setPopup({ type: null }); pushToast('Filing record deleted.', 'danger'); })
                    .catch(() => pushToast('Failed to delete filing record.', 'danger'));
                }}
                style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Delete
              </button>
            </>
          }
        >
          <div style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to delete the Corporate Tax filing record for <strong>{popup.tx.client}</strong>? This action is permanent.
          </div>
        </ModalShell>
      )}

      {/* Modal: Confirm Archive */}
      {popup.type === 'confirmArchive' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Archive"
          titleAccent="Filing"
          maxWidth="400px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  postBulk({ ids: [popup.tx!.id], action: 'archive' })
                    .unwrap()
                    .then(() => { refetch(); setPopup({ type: null }); pushToast('Filing record archived.', 'warning'); })
                    .catch(() => pushToast('Failed to archive filing record.', 'danger'));
                }}
                style={{ background: '#B06000', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Archive
              </button>
            </>
          }
        >
          <div style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to archive the Corporate Tax filing record for <strong>{popup.tx.client}</strong>?
          </div>
        </ModalShell>
      )}

      {/* Modal: Confirm Submit */}
      {popup.type === 'confirmSubmit' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Corporate Tax Center"
          titlePlain="Submit to"
          titleAccent="FTA Portal"
          maxWidth="440px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  fileReturn({ id: popup.tx!.id })
                    .unwrap()
                    .then(() => { refetch(); setPopup({ type: null }); pushToast('Submitted return to FTA portal.', 'success'); })
                    .catch(() => pushToast('Failed to submit return.', 'danger'));
                }}
                style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Confirm Submit
              </button>
            </>
          }
        >
          <div style={{ padding: '0.5rem 0', fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            You are about to officially submit the Form CT-1 Corporate Tax filing package for <strong>{popup.tx.client}</strong> to the Federal Tax Authority.
          </div>
        </ModalShell>
      )}

      {/* Styled JSX injected for dynamic animations */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        @keyframes drawerSlide {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
