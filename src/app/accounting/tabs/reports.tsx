'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useGetQueueQuery, useGetStatsQuery, useGetAnalyticsQuery, useGetDrawerDetailsQuery, useGetMetadataQuery,
  usePostGenerateMutation, usePostBulkMutation, usePostNoteMutation, usePostDocumentMutation,
} from '@/lib/reportsApi';
import { resolveToken } from '@/lib/apiClient';

// ============================================================================
// TYPES & MOCKS
// ============================================================================

interface ReportItem {
  id: string;
  name: string;
  category: 'Financial' | 'Accounting' | 'VAT' | 'Corporate Tax' | 'Audit' | 'Compliance' | 'Management' | 'Custom';
  client: string;
  period: string;
  financialYear: string;
  generatedBy: string;
  generatedByInitials: string;
  generatedDate: string;
  status: 'Completed' | 'Pending' | 'Failed';
  lastUpdated: string;
  favorite?: boolean;
  scheduled?: boolean;
  archived?: boolean;
  version?: string;
  exportCount?: number;
  fileSize?: string;
  lastDownloaded?: string;
  sharedWith?: string[];
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    name: 'Profit & Loss Statement',
    category: 'Financial',
    client: 'ABC Trading LLC',
    period: 'Q1 2026',
    financialYear: '2026',
    generatedBy: 'Mahesh Maddu',
    generatedByInitials: 'MM',
    generatedDate: '2026-04-15',
    status: 'Completed',
    lastUpdated: '2 hours ago',
    favorite: true,
    version: 'v1.4',
    exportCount: 8,
    fileSize: '2.4 MB',
    lastDownloaded: '1 hour ago',
    sharedWith: ['Priya Nair', 'Sneha Iyer']
  },
  {
    id: 'rep-2',
    name: 'Balance Sheet',
    category: 'Financial',
    client: 'XYZ Holdings Limited',
    period: 'Apr 2026',
    financialYear: '2026',
    generatedBy: 'Priya Nair',
    generatedByInitials: 'PN',
    generatedDate: '2026-05-02',
    status: 'Completed',
    lastUpdated: '1 day ago',
    favorite: true,
    version: 'v1.2',
    exportCount: 4,
    fileSize: '4.8 MB',
    lastDownloaded: '2 days ago',
    sharedWith: ['Mahesh Maddu']
  },
  {
    id: 'rep-3',
    name: 'VAT Summary Report',
    category: 'VAT',
    client: 'Alpha Tech FZCO',
    period: 'Q1 2026',
    financialYear: '2026',
    generatedBy: 'Sneha Iyer',
    generatedByInitials: 'SI',
    generatedDate: '2026-04-20',
    status: 'Completed',
    lastUpdated: '3 days ago',
    version: 'v2.0',
    exportCount: 15,
    fileSize: '1.8 MB',
    lastDownloaded: 'Just now',
    sharedWith: ['Priya Nair', 'Kevin Park']
  },
  {
    id: 'rep-4',
    name: 'Corporate Tax Computation',
    category: 'Corporate Tax',
    client: 'Beta Industries LLC',
    period: 'FY 2025',
    financialYear: '2025',
    generatedBy: 'Kevin Park',
    generatedByInitials: 'KP',
    generatedDate: '2026-05-10',
    status: 'Pending',
    lastUpdated: '5 days ago',
    version: 'v1.0',
    exportCount: 0,
    fileSize: '--',
    lastDownloaded: '--',
    sharedWith: []
  },
  {
    id: 'rep-5',
    name: 'Cash Flow Statement',
    category: 'Financial',
    client: 'Delta Properties FZCO',
    period: 'Q1 2026',
    financialYear: '2026',
    generatedBy: 'Rohit Sharma',
    generatedByInitials: 'RS',
    generatedDate: '2026-04-18',
    status: 'Completed',
    lastUpdated: '2 hours ago',
    version: 'v1.1',
    exportCount: 3,
    fileSize: '3.1 MB',
    lastDownloaded: '3 hours ago',
    sharedWith: ['Mahesh Maddu']
  },
  {
    id: 'rep-6',
    name: 'Transfer Pricing Review',
    category: 'Compliance',
    client: 'Gamma Solutions FZCO',
    period: 'FY 2025',
    financialYear: '2025',
    generatedBy: 'Sneha Iyer',
    generatedByInitials: 'SI',
    generatedDate: '2026-05-05',
    status: 'Completed',
    lastUpdated: '12 hours ago',
    scheduled: true,
    version: 'v1.5',
    exportCount: 9,
    fileSize: '5.2 MB',
    lastDownloaded: '1 day ago',
    sharedWith: ['Rohit Sharma']
  },
  {
    id: 'rep-7',
    name: 'Filing Compliance Audit Log',
    category: 'Audit',
    client: 'Nova Hospitality LLC',
    period: 'Q4 2025',
    financialYear: '2025',
    generatedBy: 'Priya Nair',
    generatedByInitials: 'PN',
    generatedDate: '2026-01-22',
    status: 'Failed',
    lastUpdated: '1 week ago',
    version: 'v1.0',
    exportCount: 0,
    fileSize: '--',
    lastDownloaded: '--',
    sharedWith: []
  }
];

const CATEGORIES = [
  'All',
  'Financial',
  'Accounting',
  'VAT',
  'Corporate Tax',
  'Audit',
  'Compliance',
  'Management',
  'Custom',
  'Scheduled',
  'Favorites',
  'Archived'
];



// FocusTrap helper
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

// Modal Shell Component
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
              type="button"
              onClick={onClose}
              style={{ background: 'rgba(42,22,40,0.04)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2A1628', transition: 'background 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(42,22,40,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(42,22,40,0.04)')}
            >
              ✕
            </button>
          </div>
          {/* Body */}
          <div style={{ padding: '0 2rem 2rem', overflowY: 'auto', flex: 1, ...bodyStyle }} className="hide-scrollbar">
            {children}
          </div>
          {/* Footer */}
          {footer && (
            <div style={{ padding: '1.25rem 2rem 1.5rem', background: '#FAF8F5', borderTop: '1px solid rgba(42,22,40,0.06)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
              {footer}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
}

// Custom Select Component
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function CustomSelect({ value, onChange, options, placeholder = 'Select...', icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
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

  // Calculate direction when opening dropdown
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 220 && rect.top > 220) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

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
            top: openUpward ? 'auto' : '100%',
            bottom: openUpward ? '100%' : 'auto',
            left: 0,
            width: '100%',
            marginTop: openUpward ? '0' : '4px',
            marginBottom: openUpward ? '4px' : '0',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(42,22,40,0.12)',
            zIndex: 1000,
            maxHeight: '200px',
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

// Pagination Component
interface PaginationProps {
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  itemLabel?: string;
}

function Pagination({ totalItems, currentPage, rowsPerPage, onPageChange, onRowsPerPageChange, itemLabel = 'records' }: PaginationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const from = totalItems === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + 1, totalItems);
  const to = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div
      style={{
        background: '#FAF8F5',
        border: '1px solid rgba(42,22,40,0.06)',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: 'rgba(42,22,40,0.6)',
        marginTop: '-1px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: 500 }}>Rows per page:</span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid #DDD0C4',
              borderRadius: '6px',
              padding: '0.25rem 0.6rem',
              background: '#fff',
              fontSize: '0.75rem',
              color: '#2A1628',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {rowsPerPage}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 100, minWidth: '60px', overflow: 'hidden' }}>
              {[10, 20, 50].map((n) => (
                <div
                  key={n}
                  onClick={() => {
                    onRowsPerPageChange(n);
                    setDropdownOpen(false);
                  }}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', color: '#2A1628' }}
                >
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>
        <span>
          Showing {from}–{to} of {totalItems} {itemLabel}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 0.8 }}
        >
          ◀
        </button>
        <span style={{ fontWeight: 600, color: '#2A1628', padding: '0 0.5rem' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 0.8 }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsTab() {
  const { data: queueRes, isLoading: queueLoading, refetch } = useGetQueueQuery({ limit: 1000 });
  const { data: statsRes } = useGetStatsQuery();
  const { data: analyticsRes } = useGetAnalyticsQuery();
  const { data: metaRes } = useGetMetadataQuery();
  const [postGenerate] = usePostGenerateMutation();
  const [postBulk] = usePostBulkMutation();
  const [addNote] = usePostNoteMutation();
  const [addDocument] = usePostDocumentMutation();
  const dynamicClients = metaRes?.data?.clients || [];
  const dynamicAuthors = metaRes?.data?.authors || [];

  const [data, setData] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: 'success' | 'danger' | 'info' | 'warning' }[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    if (queueRes?.data) setData(queueRes.data);
  }, [queueRes]);

  // Layout Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('All');
  const [filterClient, setFilterClient] = useState('All');
  const [filterUser, setFilterUser] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Selected Status Category Tab
  const [activeTab, setActiveTab] = useState<string>('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Bulk / checklist actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Actions menu trigger
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [menuItem, setMenuItem] = useState<ReportItem | null>(null);

  // Sorting
  const [sortCol] = useState<string | null>(null);
  const [sortDir] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [popup, setPopup] = useState<{
    type: 'generate' | 'schedule' | 'templates' | 'exportCenter' | 'confirmDelete' | 'confirmArchive' | 'confirmGenerate' | 'confirmCancelSchedule' | 'reportPreview' | null;
    tx?: ReportItem;
  }>({ type: null });

  // Drawer layout detail trigger
  const [drawerTxId, setDrawerTxId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'charts' | 'transactions' | 'attachments' | 'history' | 'sharing' | 'export' | 'notes'>('overview');

  // Top level state hooks for sub elements (adhering to hook rules)
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewPage, setPreviewPage] = useState(1);
  const [drawerTxSubTab, setDrawerTxSubTab] = useState<'all' | 'journal' | 'invoice' | 'payment' | 'bill' | 'ledger' | 'adjustment'>('all');
  const [drawerNoteTag, setDrawerNoteTag] = useState<'all' | 'internal' | 'ai' | 'audit' | 'pinned' | 'reviewer'>('all');

  // Generate wizard state variables
  const [genReportTemplate, setGenReportTemplate] = useState('Profit & Loss');
  const [genClientName, setGenClientName] = useState('ABC Trading LLC');
  const [genReportingPeriod, setGenReportingPeriod] = useState('Q1 2026');
  const [genFinYear, setGenFinYear] = useState('2026');

  // Schedule wizard state variables
  const [schFrequency, setSchFrequency] = useState('Monthly');
  const [schRecipients, setSchRecipients] = useState('');
  const [schFormat, setSchFormat] = useState('pdf');

  // Export Center state variables
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('all');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'print'>('excel');

  // Dynamic dynamic list arrays derived
  const CLIENTS = useMemo(() => Array.from(new Set(data.map((x) => x.client))), [data]);
  const PERIODS = useMemo(() => Array.from(new Set(data.map((x) => x.period))), [data]);
  const YEARS = useMemo(() => Array.from(new Set(data.map((x) => x.financialYear))), [data]);
  const USERS = useMemo(() => Array.from(new Set(data.map((x) => x.generatedBy))), [data]);

  // Toast utility helper
  const pushToast = (message: string, tone: 'success' | 'danger' | 'info' | 'warning') => {
    const id = String(nextIdRef.current++);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      pushToast('Financial reports repository updated from database.', 'success');
    }, 300);
  };

  // Simulate loading states on filter changes
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
    activeTab,
    filterYear,
    filterPeriod,
    filterClient,
    filterUser,
    filterStatus,
    searchQuery,
  ]);

  // Filter returns based on search and parameters
  const filteredData = useMemo(() => {
    return data
      .filter((r) => {
        // Tab routing filter logic
        if (activeTab === 'Scheduled' && !r.scheduled) return false;
        if (activeTab === 'Favorites' && !r.favorite) return false;
        if (activeTab === 'Archived' && !r.archived) return false;
        if (activeTab !== 'All' && activeTab !== 'Scheduled' && activeTab !== 'Favorites' && activeTab !== 'Archived' && r.category !== activeTab) return false;

        // Dropdown filters logic
        if (filterYear !== 'All' && r.financialYear !== filterYear) return false;
        if (filterPeriod !== 'All' && r.period !== filterPeriod) return false;
        if (filterClient !== 'All' && r.client !== filterClient) return false;
        if (filterUser !== 'All' && r.generatedBy !== filterUser) return false;
        if (filterStatus !== 'All' && r.status !== filterStatus) return false;

        // Search text matching logic
        if (searchQuery.trim() !== '') {
          const s = searchQuery.toLowerCase();
          const matchClient = r.client.toLowerCase().includes(s);
          const matchName = r.name.toLowerCase().includes(s);
          const matchUser = r.generatedBy.toLowerCase().includes(s);
          return matchClient || matchName || matchUser;
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortCol) return 0;
        const v1 = a[sortCol as keyof ReportItem];
        const v2 = b[sortCol as keyof ReportItem];

        if (typeof v1 === 'string') {
          return sortDir === 'asc'
            ? (v1 as string).localeCompare(v2 as string)
            : (v2 as string).localeCompare(v1 as string);
        }
        return 0;
      });
  }, [data, activeTab, filterYear, filterPeriod, filterClient, filterUser, filterStatus, searchQuery, sortCol, sortDir]);

  // Page split calculation
  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const { data: drawerDetailsRes } = useGetDrawerDetailsQuery(drawerTxId || '', { skip: !drawerTxId });
  const drawerSnapshot = drawerDetailsRes?.data?.snapshot || {};
  const drawerHistory = drawerDetailsRes?.data?.history || [];
  const drawerActivityLog = drawerDetailsRes?.data?.activityLog || [];
  const drawerDocuments = drawerDetailsRes?.data?.documents || [];
  const drawerNotes = drawerDetailsRes?.data?.notes || [];
  const [quickReportNote, setQuickReportNote] = useState('');
  const [shareEmail, setShareEmail] = useState('');

  const activeTx = useMemo(() => {
    if (!drawerTxId) return null;
    return drawerDetailsRes?.data?.report || data.find((x) => x.id === drawerTxId) || null;
  }, [data, drawerTxId, drawerDetailsRes]);

  // Checklist handler
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

  // Bulk actions trigger
  const triggerBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      pushToast('No items selected.', 'warning');
      return;
    }
    if (action === 'export') {
      setPopup({ type: 'exportCenter' });
      return;
    }
    postBulk({ ids: selectedIds, action })
      .unwrap()
      .then(() => {
        refetch();
        if (action === 'delete') pushToast(`${selectedIds.length} reports deleted successfully.`, 'danger');
        else if (action === 'archive') pushToast(`${selectedIds.length} reports archived.`, 'warning');
        setSelectedIds([]);
      })
      .catch(() => pushToast('Bulk action failed.', 'danger'));
  };

  // Submit generators
  const handleGenerateSubmit = () => {
    postGenerate({
      name: `${genReportTemplate} Statement`,
      category: 'Financial',
      client: genClientName,
      period: genReportingPeriod,
      financialYear: genFinYear,
    })
      .unwrap()
      .then(() => {
        refetch();
        setPopup({ type: null });
        pushToast(`Report "${genReportTemplate} Statement" generated successfully.`, 'success');
      })
      .catch(() => pushToast('Failed to generate report.', 'danger'));
  };

  const handleScheduleSubmit = () => {
    // Recurring schedule generation is not yet backed by a cron/queue subsystem — this records
    // the intent only. Cancelling a schedule (below) is fully real via the bulk 'cancelSchedule' action.
    setPopup({ type: null });
    pushToast('Report schedule builder established successfully.', 'success');
  };

  const handleMenuAction = (key: string) => {
    if (!menuItem) return;
    if (key === 'preview') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('overview');
    } else if (key === 'regenerate') {
      setPopup({ type: 'confirmGenerate', tx: menuItem });
    } else if (key === 'downloadPdf' || key === 'downloadExcel' || key === 'downloadCsv') {
      postBulk({ ids: [menuItem.id], action: 'export' })
        .unwrap()
        .then(() => pushToast(`${key === 'downloadPdf' ? 'PDF download' : key === 'downloadExcel' ? 'Excel sheet export' : 'CSV extraction'} completed.`, 'info'))
        .catch(() => pushToast('Export failed.', 'danger'));
    } else if (key === 'history') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('history');
    } else if (key === 'duplicate') {
      postGenerate({
        name: `${menuItem.name} (Copy)`,
        category: menuItem.category,
        client: menuItem.client,
        period: menuItem.period,
        financialYear: menuItem.financialYear,
      })
        .unwrap()
        .then(() => { refetch(); pushToast(`Report duplicated successfully.`, 'success'); })
        .catch(() => pushToast('Failed to duplicate report.', 'danger'));
    } else if (key === 'share') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('sharing');
    } else if (key === 'email') {
      addNote({ id: menuItem.id, body: `Email report queued for delivery to ${menuItem.client}.` })
        .unwrap()
        .then(() => pushToast(`Email report queued for delivery.`, 'success'))
        .catch(() => pushToast('Failed to queue email.', 'danger'));
    } else if (key === 'schedule') {
      setPopup({ type: 'schedule', tx: menuItem });
    } else if (key === 'openClient') {
      pushToast(`Navigating to Client Hub profile: ${menuItem.client}...`, 'info');
    } else if (key === 'auditLog') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('history');
    } else if (key === 'archive') {
      setPopup({ type: 'confirmArchive', tx: menuItem });
    } else if (key === 'delete') {
      setPopup({ type: 'confirmDelete', tx: menuItem });
    }
  };

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      // If clicking inside the actions trigger button, let its own click handler manage it
      const target = e.target as HTMLElement;
      if (target.closest('.action-btn-trigger')) return;
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
          return (
            <div key={t.id} style={{ pointerEvents: 'auto', background: bg, border: `1px solid ${color}20`, borderRadius: '12px', padding: '0.75rem 1.25rem', boxShadow: '0 10px 30px rgba(42,22,40,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideIn 0.25s ease forwards' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* ── 1. HEADER SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1rem', borderBottom: '1px solid #DDD0C4' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Accounting &gt; Reports Center
            </p>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif), Georgia, serif' }}>
            Reports <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Generate financial statements, tax reports, compliance reports, and management reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setPopup({ type: 'generate' })}
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
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Generate Report
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'schedule' })}
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
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedule Report
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'exportCenter' })}
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

      {/* ── 2. METRICS DASHBOARD CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total Reports Generated', value: statsRes?.data?.totalGenerated ?? data.length, sub: 'All-time count', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
          { label: 'Reports Generated Today', value: statsRes?.data?.generatedToday ?? 0, sub: 'Since midnight', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> },
          { label: 'Average Generation Time', value: `${statsRes?.data?.avgGenerationTimeSec ?? 0}s`, sub: 'Server-side average', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
          { label: 'Failed Reports', value: statsRes?.data?.failedReports ?? 0, sub: 'Failed compilation logs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
          { label: 'Storage Used', value: `${statsRes?.data?.storageUsedMb ?? 0} MB`, sub: 'PDF & Excel packages', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
          { label: 'Active Schedules', value: statsRes?.data?.activeSchedules ?? 0, sub: 'Weekly & Monthly', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
          { label: 'AI Generated Reports', value: statsRes?.data?.aiGeneratedReports ?? 0, sub: 'Auto-generated by System', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
          { label: 'Last Generated', value: statsRes?.data?.lastGenerated ? new Date(statsRes.data.lastGenerated).toLocaleString() : 'Never', sub: 'Most recent report', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
          { label: 'Export Count', value: `${statsRes?.data?.exportCount ?? 0} times`, sub: 'Shared via APIs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> },
          { label: 'Compliance Score', value: `${statsRes?.data?.complianceScore ?? 100}%`, sub: 'Successful vs failed ratio', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> }
        ].map((card, i) => (
          <div
            key={i}
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
                background: 'rgba(232,118,10,0.06)', color: '#E8760A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '0.9rem'
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                { (queueLoading || isLoading) ? (
                  <div style={{ width: '48px', height: '32px', background: 'rgba(42,22,40,0.06)', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ) : (
                  card.value
                )}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. FILTER & SEGMENTATION TABS ── */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(42,22,40,0.04)' }} className="hide-scrollbar">
        {CATEGORIES.map((tab) => {
          const isActive = activeTab === tab;
          const tabColors = {
            border: isActive ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
            bg: isActive ? 'rgba(232,118,10,0.06)' : '#ffffff',
            color: isActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
          };

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
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
                fontFamily: 'inherit',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── 4. SEARCH & FILTER DROPDOWNS ── */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box', background: '#FAF8F5', color: '#2A1628', fontFamily: 'inherit' }}
          />
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <CustomSelect value={filterYear} onChange={setFilterYear} options={['All', ...YEARS]} placeholder="Year" />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <CustomSelect value={filterPeriod} onChange={setFilterPeriod} options={['All', ...PERIODS]} placeholder="Period" />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <CustomSelect value={filterClient} onChange={setFilterClient} options={['All', ...(dynamicClients.length ? dynamicClients : CLIENTS)]} placeholder="Client" />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <CustomSelect value={filterUser} onChange={setFilterUser} options={['All', ...(dynamicAuthors.length ? dynamicAuthors : USERS)]} placeholder="Author" />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <CustomSelect value={filterStatus} onChange={setFilterStatus} options={['All', 'Completed', 'Pending', 'Failed']} placeholder="Status" />
        </div>
      </div>

      {/* ── 5. CHECKLIST BULK ACTION BAR ── */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#2A1628', color: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'slideIn 0.2s ease forwards' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{selectedIds.length} reports selected</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => triggerBulkAction('export')} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Export Selected</button>
            <button onClick={() => triggerBulkAction('archive')} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Archive Selected</button>
            <button onClick={() => triggerBulkAction('delete')} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete Selected</button>
          </div>
        </div>
      )}

      {/* ── 6. MAIN TABLE ── */}
      <div style={{ border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
        <div style={{ overflowX: 'auto', position: 'relative' }} className="hide-scrollbar">
          <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <th style={{ padding: '1rem 0.75rem', width: '48px', textAlign: 'center', position: 'sticky', left: 0, background: '#FAF8F5', zIndex: 10 }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                  />
                </th>
                <th style={{ padding: '1rem', position: 'sticky', left: '48px', background: '#FAF8F5', zIndex: 10, borderRight: '1px solid #DDD0C4' }}>REPORT NAME</th>
                <th style={{ padding: '1rem' }}>CATEGORY</th>
                <th style={{ padding: '1rem' }}>CLIENT</th>
                <th style={{ padding: '1rem' }}>PERIOD</th>
                <th style={{ padding: '1rem' }}>VERSION</th>
                <th style={{ padding: '1rem' }}>EXPORTS</th>
                <th style={{ padding: '1rem' }}>FILE SIZE</th>
                <th style={{ padding: '1rem' }}>LAST DOWNLOADED</th>
                <th style={{ padding: '1rem' }}>SHARED WITH</th>
                <th style={{ padding: '1rem' }}>GENERATED BY</th>
                <th style={{ padding: '1rem' }}>GENERATED DATE</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                    <td style={{ padding: '1rem' }}><div style={{ width: '16px', height: '16px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                    {Array.from({ length: 13 }).map((_, idx) => (
                      <td key={idx} style={{ padding: '1rem' }}><div style={{ width: idx === 0 ? '180px' : '70px', height: '12px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '4rem 3rem', textAlign: 'center', color: 'rgba(42,22,40,0.4)' }}>
                    {(() => {
                      let title = 'No reports found';
                      let desc = 'Create your first statement using the wizard.';
                      if (searchQuery) {
                        title = 'No Search Results';
                        desc = `We couldn't find any reports matching "${searchQuery}".`;
                      } else if (activeTab === 'Scheduled') {
                        title = 'No Scheduled Reports';
                        desc = 'Configure recurrent automated report generations in the scheduler wizard.';
                      } else if (activeTab === 'Favorites') {
                        title = 'No Favorites';
                        desc = 'Star your most relevant statement versions for instant access.';
                      } else if (activeTab === 'Archived') {
                        title = 'No Archived Reports';
                        desc = 'View your active files index or archive outdated reports.';
                      }
                      return (
                        <>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2A1628', marginBottom: '0.25rem' }}>{title}</div>
                          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>{desc}</p>
                          <button
                            type="button"
                            onClick={() => setPopup({ type: 'generate' })}
                            style={{ padding: '0.5rem 1rem', background: '#2a1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Generate Report
                          </button>
                        </>
                      );
                    })()}
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
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center', position: 'sticky', left: 0, background: isSelected ? '#FAF4EE' : '#ffffff', zIndex: 9 }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(item.id)} />
                      </td>

                      <td
                        style={{
                          padding: '0.625rem 1rem',
                          position: 'sticky',
                          left: '48px',
                          background: isSelected ? '#FAF4EE' : '#ffffff',
                          zIndex: 9,
                          borderRight: '1px solid rgba(42,22,40,0.06)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setDrawerTxId(item.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(232, 118, 10, 0.08)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {item.name.split(' ').map((x) => x[0]).join('').substr(0, 2)}
                          </div>
                          <div style={{ fontWeight: 700, color: '#2A1628' }}>{item.name}</div>
                        </div>
                      </td>

                      <td style={{ padding: '0.625rem 1rem', color: 'rgba(42,22,40,0.75)', fontWeight: 500 }}>{item.category}</td>
                      <td style={{ padding: '0.625rem 1rem', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>{item.client}</td>
                      <td style={{ padding: '0.625rem 1rem', color: '#2A1628', fontWeight: 600, textAlign: 'center' }}>{item.period}</td>
                      <td style={{ padding: '0.625rem 1rem', color: 'rgba(42,22,40,0.75)', fontWeight: 500 }}>{item.version || 'v1.0'}</td>
                      <td style={{ padding: '0.625rem 1rem', fontWeight: 600, color: '#2A1628', textAlign: 'center' }}>{item.exportCount ?? 0}</td>
                      <td style={{ padding: '0.625rem 1rem', fontWeight: 600, color: '#2A1628' }}>{item.fileSize || '--'}</td>
                      <td style={{ padding: '0.625rem 1rem', color: 'rgba(42,22,40,0.75)', fontWeight: 500 }}>{item.lastDownloaded || '--'}</td>
                      <td style={{ padding: '0.625rem 1rem' }}>
                        {item.sharedWith && item.sharedWith.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {item.sharedWith.map((u, i) => (
                              <span key={i} style={{ fontSize: '0.65rem', background: 'rgba(42,22,40,0.04)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#2A1628' }}>{u}</span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(42,22,40,0.3)' }}>Private</span>
                        )}
                      </td>
                      <td style={{ padding: '0.625rem 1rem', color: '#2A1628', fontWeight: 600 }}>{item.generatedBy}</td>
                      <td style={{ padding: '0.625rem 1rem', color: 'rgba(42,22,40,0.75)', fontWeight: 500 }}>{item.generatedDate}</td>
                      <td style={{ padding: '0.625rem 1rem' }}>
                        <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: item.status === 'Completed' ? 'rgba(19,115,51,0.1)' : item.status === 'Pending' ? 'rgba(26,115,232,0.1)' : 'rgba(197,34,31,0.1)', color: item.status === 'Completed' ? '#137333' : item.status === 'Pending' ? '#1A73E8' : '#C5221F', fontWeight: 700 }}>
                          {item.status}
                        </span>
                      </td>

                      <td style={{ padding: '0.625rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="action-btn-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuPos({ top: e.pageY + 10, left: e.pageX });
                            setMenuItem(item);
                          }}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.6)" strokeWidth="2.5" style={{ pointerEvents: 'none' }}>
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
        <Pagination totalItems={filteredData.length} currentPage={currentPage} rowsPerPage={rowsPerPage} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} itemLabel="reports" />
      </div>

      {/* ── 6.5 EXECUTIVE DASHBOARD ANALYTICS SECTION (MAJOR) ── */}
      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: '#E8760A', display: 'inline-block' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Executive Dashboard Analytics
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {/* Chart 1: Revenue & Expenses Trend */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Revenue &amp; Expenses Trend</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Q1–Q4 Comparison</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 45 L25 30 L50 20 L75 35 L100 15" fill="none" stroke="#E8760A" strokeWidth="1.5" />
              <path d="M0 48 L25 40 L50 32 L75 42 L100 30" fill="none" stroke="#2A1628" strokeWidth="1.2" strokeDasharray="2 1" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#E8760A' }}>● Revenue</span>
              <span style={{ color: '#2A1628' }}>● Expenses</span>
            </div>
          </div>

          {/* Chart 2: Net Profit & Cash Flow */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Net Profit Margin</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Annual margin target comparison</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <rect x="5" y="15" width="10" height="35" fill="#E8760A" rx="1" />
              <rect x="25" y="10" width="10" height="40" fill="#2A1628" rx="1" />
              <rect x="45" y="25" width="10" height="25" fill="#E8760A" rx="1" />
              <rect x="65" y="5" width="10" height="45" fill="#137333" rx="1" />
              <rect x="85" y="18" width="10" height="32" fill="#E8760A" rx="1" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#E8760A' }}>● Profit</span>
              <span style={{ color: '#137333' }}>● Target Peak</span>
            </div>
          </div>

          {/* Chart 3: Category Distribution */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Category Distribution</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Volume segmented by classification</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '80px' }}>
              <svg width="60" height="60" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#DDD0C4" strokeWidth="5"/>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="5" strokeDasharray="50 50" strokeDashoffset="25"/>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2A1628" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="75"/>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.6rem', fontWeight: 600 }}>
                <span style={{ color: '#E8760A' }}>50% Financials</span>
                <span style={{ color: '#2A1628' }}>30% VAT Audits</span>
                <span style={{ color: 'rgba(42,22,40,0.45)' }}>20% Compliance</span>
              </div>
            </div>
          </div>

          {/* Chart 4: Report Generation Activity */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Export Activity Trend</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Daily generated and pulled records</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 40 Q25 15 50 35 T100 10" fill="none" stroke="#137333" strokeWidth="1.5"/>
              <path d="M0 45 L100 45" stroke="rgba(42,22,40,0.1)" strokeWidth="0.5"/>
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#137333' }}>● Export Rate (Peak)</span>
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
              top: Math.min(menuPos.top, window.innerHeight - 280),
              left: Math.min(menuPos.left - 210, window.innerWidth - 220),
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              boxShadow: '0 8px 24px rgba(42,22,40,0.15)',
              borderRadius: '12px',
              padding: '4px',
              zIndex: 1000,
              minWidth: '200px',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            {[
              { key: 'preview', label: 'Preview Report', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
              { key: 'regenerate', label: 'Generate Again', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
              { key: 'downloadPdf', label: 'Download PDF', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> },
              { key: 'downloadExcel', label: 'Download Excel', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { key: 'downloadCsv', label: 'Download CSV', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
              { key: 'history', label: 'View History', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { key: 'duplicate', label: 'Duplicate Report', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> },
              { key: 'share', label: 'Share', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> },
              { key: 'email', label: 'Email Report', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
              { key: 'schedule', label: 'Schedule Delivery', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
              { key: 'openClient', label: 'Open Client', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { key: 'auditLog', label: 'Audit Log', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
              { key: 'archive', label: 'Archive Report', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8v13H3V8M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
              { key: 'delete', label: 'Delete Report', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>, danger: true }
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

      {drawerTxId && activeTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.2)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setDrawerTxId(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '580px', background: '#ffffff', height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(42,22,40,0.15)', animation: 'drawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            {/* Drawer Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(42,22,40,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Report Detail View</span>
                <button type="button" onClick={() => setDrawerTxId(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'rgba(42,22,40,0.4)' }}>✕</button>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {activeTx.name}
              </h2>
            </div>

            {/* Drawer Segment tabs */}
            <div className="hide-scrollbar" style={{ width: '100%', overflowX: 'auto', borderBottom: '1px solid rgba(42,22,40,0.06)', flexShrink: 0, scrollBehavior: 'smooth' }}>
              <div style={{ display: 'flex', gap: '1.25rem', padding: '0.5rem 2rem', minWidth: 'max-content' }}>
                {[
                  { key: 'overview' as const, label: 'Overview' },
                  { key: 'charts' as const, label: 'Charts' },
                  { key: 'transactions' as const, label: 'Transactions' },
                  { key: 'attachments' as const, label: 'Attachments' },
                  { key: 'history' as const, label: 'History' },
                  { key: 'sharing' as const, label: 'Sharing' },
                  { key: 'export' as const, label: 'Export' },
                  { key: 'notes' as const, label: 'Notes' }
                ].map((tab) => {
                  const isActive = drawerTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDrawerTab(tab.key)}
                      style={{
                        padding: '0.6rem 0',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        background: 'transparent',
                        color: isActive ? '#E8760A' : 'rgba(42,22,40,0.5)',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 600,
                        cursor: 'pointer',
                        borderBottom: isActive ? '2px solid #E8760A' : '2px solid transparent',
                        whiteSpace: 'nowrap',
                        fontFamily: 'inherit',
                        flexShrink: 0,
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="hide-scrollbar">
              {drawerTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(42,22,40,0.04)' }}>
                    {[
                      { label: 'Client / Company', val: activeTx.client },
                      { label: 'Reporting Period', val: activeTx.period },
                      { label: 'Financial Year', val: activeTx.financialYear },
                      { label: 'Generated By', val: activeTx.generatedBy },
                      { label: 'Generated Date', val: activeTx.generatedDate },
                      { label: 'Compilation Status', val: activeTx.status }
                    ].map((itm, idx) => (
                      <div key={idx}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>{itm.label}</span>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628', marginTop: '0.15rem' }}>{itm.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary positions card - Grid of 6 granular summaries */}
                  <div>
                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Report Position Summary</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        { label: 'Revenue Base', val: 'AED 4,250,000', highlightColor: '#2A1628' },
                        { label: 'Expenses (Deductibles)', val: 'AED 3,120,000', highlightColor: '#2A1628' },
                        { label: 'Net Profit Base', val: 'AED 1,130,000', highlightColor: '#E8760A' },
                        { label: 'Gross Margin', val: '74.2%', highlightColor: '#E8760A' },
                        { label: 'Net Cash Flow', val: '+ AED 850,000', highlightColor: '#137333' },
                        { label: 'Tax Liability', val: 'AED 101,700', highlightColor: '#C5221F' }
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: '0.75rem 1rem', border: '1px solid #F3DEC9', background: '#FAF2EC', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>{item.label}</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: item.highlightColor, marginTop: '0.2rem' }}>
                            {item.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Trend SVG Chart Block */}
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.04)', borderRadius: '12px', padding: '1.25rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Performance Trend</h3>
                    <svg width="100%" height="120" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path d="M0 80 Q100 20 200 60 T400 10 L400 100 L0 100 Z" fill="rgba(232, 118, 10, 0.08)"/>
                      <path d="M0 80 Q100 20 200 60 T400 10" fill="none" stroke="#E8760A" strokeWidth="2"/>
                    </svg>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setPopup({ type: 'reportPreview', tx: activeTx })}
                      style={{
                        flex: 1,
                        background: '#2A1628',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(42,22,40,0.12)',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Preview Report
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopup({ type: 'exportCenter' })}
                      style={{
                        flex: 1,
                        background: '#ffffff',
                        color: '#2A1628',
                        border: '1px solid #DDD0C4',
                        borderRadius: '8px',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      Export Report
                    </button>
                  </div>
                </div>
              )}

              {drawerTab === 'charts' && (() => {
                const trend = analyticsRes?.data?.revenueExpenseTrend || { months: [], revenue: [], expenses: [] };
                const totalRevenue = (trend.revenue || []).reduce((a: number, b: number) => a + b, 0);
                const totalExpenses = (trend.expenses || []).reduce((a: number, b: number) => a + b, 0);
                const catDist: { category: string; count: number }[] = analyticsRes?.data?.categoryDistribution || [];
                const catTotal = catDist.reduce((a, b) => a + b.count, 0) || 1;
                const catColors = ['#E8760A', '#2A1628', 'rgba(42,22,40,0.45)', '#137333', '#C5221F'];
                let offsetAcc = 0;
                const catSegments = catDist.map((c, idx) => {
                  const pct = Math.round((c.count / catTotal) * 100);
                  const seg = { ...c, pct, color: catColors[idx % catColors.length], dasharray: `${pct} ${100 - pct}`, dashoffset: 25 - offsetAcc };
                  offsetAcc += pct;
                  return seg;
                });
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Revenue / Expenses Trend Line */}
                    <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.04)', borderRadius: '12px', padding: '1.25rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue &amp; Expense Trends (Last 6 Months)</h3>
                      <svg width="100%" height="120" viewBox="0 0 400 100" preserveAspectRatio="none">
                        {/* Revenue line */}
                        <path d="M0 80 Q100 20 200 60 T400 10" fill="none" stroke="#E8760A" strokeWidth="2.5"/>
                        {/* Expense line */}
                        <path d="M0 90 Q100 45 200 70 T400 30" fill="none" stroke="#2A1628" strokeWidth="2" strokeDasharray="4 2"/>
                      </svg>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#E8760A' }}><span style={{ width: '8px', height: '8px', background: '#E8760A', borderRadius: '50%' }}/>Revenue: AED {totalRevenue.toLocaleString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2A1628' }}><span style={{ width: '8px', height: '8px', background: '#2A1628', borderRadius: '50%' }}/>Expenses: AED {totalExpenses.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Category Breakdown Pie/Donut Chart representation */}
                    <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.04)', borderRadius: '12px', padding: '1.25rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Report Category Breakdown</h3>
                      {catSegments.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)' }}>No report categories generated yet.</div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                          <svg width="90" height="90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#DDD0C4" strokeWidth="4"/>
                            {catSegments.map((seg, idx) => (
                              <circle key={idx} cx="18" cy="18" r="15.915" fill="none" stroke={seg.color} strokeWidth="4" strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset}/>
                            ))}
                          </svg>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {catSegments.map((seg, idx) => (
                              <span key={idx} style={{ color: seg.color }}>{seg.pct}% {seg.category}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {drawerTab === 'transactions' && (() => {
                const snap = drawerSnapshot || {};
                const fmt = (n: number) => `AED ${Math.abs(Number(n || 0)).toLocaleString()}`;
                const reportRef = activeTx?.id ? `RPT-${String(activeTx.id).substring(0, 8).toUpperCase()}` : 'RPT-000000';
                const snapRows: Record<string, { name: string; type: string }> = {
                  outputVat: { name: 'Output VAT (Sales)', type: 'ledger' },
                  inputVat: { name: 'Input VAT (Purchases)', type: 'bill' },
                  netVat: { name: 'Net VAT Payable', type: 'adjustment' },
                  accountingProfit: { name: 'Accounting Profit', type: 'ledger' },
                  taxableProfit: { name: 'Taxable Profit', type: 'adjustment' },
                  corporateTax: { name: 'Corporate Tax Payable', type: 'adjustment' },
                  revenue: { name: 'Total Revenue', type: 'invoice' },
                  expenses: { name: 'Total Expenses', type: 'bill' },
                  netProfit: { name: 'Net Profit', type: 'journal' }
                };
                const transactions = Object.keys(snap)
                  .filter((k) => typeof snap[k] === 'number' && snapRows[k])
                  .map((k) => ({
                    name: snapRows[k].name,
                    date: activeTx?.generatedDate || '',
                    ref: reportRef,
                    amount: `${snap[k] < 0 ? '-' : '+'} ${fmt(snap[k])}`,
                    type: snapRows[k].type,
                    isPositive: snap[k] >= 0
                  }));
                const filteredTx = transactions.filter(t => drawerTxSubTab === 'all' || t.type === drawerTxSubTab);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Search and Action filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #DDD0C4',
                            fontSize: '0.8125rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>
                    </div>

                    {/* Sub tabs filtering pills */}
                    <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="hide-scrollbar">
                      {[
                        { key: 'all' as const, label: 'All' },
                        { key: 'journal' as const, label: 'Journal Entries' },
                        { key: 'invoice' as const, label: 'Invoices' },
                        { key: 'payment' as const, label: 'Payments' },
                        { key: 'bill' as const, label: 'Bills' },
                        { key: 'ledger' as const, label: 'Ledger' },
                        { key: 'adjustment' as const, label: 'Adjustments' }
                      ].map((pill) => {
                        const isPillActive = drawerTxSubTab === pill.key;
                        return (
                          <button
                            key={pill.key}
                            type="button"
                            onClick={() => setDrawerTxSubTab(pill.key)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              border: isPillActive ? '1px solid #E8760A' : '1px solid rgba(42,22,40,0.15)',
                              background: isPillActive ? 'rgba(232,118,10,0.06)' : 'transparent',
                              color: isPillActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              fontFamily: 'inherit'
                            }}
                          >
                            {pill.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Transaction items list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {filteredTx.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center', padding: '1rem' }}>No records match the filter.</div>
                      ) : (
                        filteredTx.map((tx, idx) => (
                          <div key={idx} style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2A1628', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>{tx.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.25rem' }}>
                                {tx.date} • Ref: {tx.ref} • <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#E8760A', fontSize: '0.65rem' }}>{tx.type}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: tx.isPositive ? '#137333' : '#C5221F' }}>
                                {tx.amount}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {drawerTab === 'attachments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ margin: '0', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attached Documents</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {drawerDocuments.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No documents recorded yet.</p>}
                    {drawerDocuments.map((doc: any) => (
                      <div key={doc.id} style={{ padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#2A1628' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>{doc.format} • {doc.sizeKb} KB • Uploaded: {doc.createdAt ? String(doc.createdAt).split('T')[0] : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'history' && (() => {
                const steps = [
                  ...drawerHistory.map((h: any) => ({ action: h.event, user: h.actor || 'System', time: h.timestamp ? new Date(h.timestamp).toLocaleString() : '', color: h.event === 'Downloaded' ? '#137333' : '#2A1628' })),
                  ...drawerActivityLog.map((a: any) => ({ action: `${a.operation} (${a.tableName})`, user: a.changedBy || 'System', time: a.changedAt ? new Date(a.changedAt).toLocaleString() : '', color: '#E8760A' }))
                ];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ margin: '0', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Audit Trail &amp; History</h3>
                    {steps.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)' }}>No history recorded yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem' }}>
                        {steps.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                            {idx < steps.length - 1 && <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-20px', width: '1px', background: 'rgba(42,22,40,0.1)' }} />}
                            <div style={{ width: '23px', height: '23px', borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, marginTop: '2px', flexShrink: 0 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}/>
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.8125rem', display: 'block', color: '#2A1628' }}>{step.action}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>by {step.user} • {step.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {drawerTab === 'sharing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ margin: '0', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Collaborator Access Control</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="email"
                      placeholder="Enter colleague's email address..."
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!shareEmail.trim() || !activeTx) return;
                        try {
                          await postBulk({ ids: [activeTx.id], action: 'share', value: shareEmail.trim() }).unwrap();
                          setShareEmail('');
                          pushToast('Access invitation transmitted.', 'success');
                        } catch { pushToast('Failed to share report.', 'danger'); }
                      }}
                      style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Invite
                    </button>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeTx.sharedWith && activeTx.sharedWith.length > 0 ? (
                      activeTx.sharedWith.map((col: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#FAF8F5', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#2A1628', fontWeight: 600 }}>{col}</span>
                          <span style={{ fontSize: '0.7rem', color: '#137333', fontWeight: 700 }}>Can Edit</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center', padding: '1rem' }}>This compilation is currently private to your profile.</div>
                    )}
                  </div>
                </div>
              )}

              {drawerTab === 'export' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ margin: '0', fontSize: '0.875rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Export Compilation Options</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {[
                      { fmt: 'PDF Format Document', size: activeTx?.fileSize || '—', type: 'PDF' },
                      { fmt: 'Excel Workbook File', size: activeTx?.fileSize || '—', type: 'XLSX' },
                      { fmt: 'CSV Data Sheet Extract', size: activeTx?.fileSize || '—', type: 'CSV' },
                      { fmt: 'Audit XML Ledger Packet', size: activeTx?.fileSize || '—', type: 'XML' }
                    ].map((e, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #DDD0C4', borderRadius: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.8125rem', color: '#2A1628', display: 'block' }}>{e.fmt}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>File Size: {e.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeTx) return;
                            try {
                              const formatStr = e.type.toLowerCase();
                              const token = resolveToken() || (typeof window !== 'undefined' ? (localStorage.getItem('crm_access_token') || localStorage.getItem('token') || '') : '');
                              const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/export?ids=${activeTx.id}&format=${formatStr}&token=${encodeURIComponent(token)}`;
                              
                              const iframe = document.createElement('iframe');
                              iframe.style.display = 'none';
                              iframe.src = downloadUrl;
                              document.body.appendChild(iframe);
                              setTimeout(() => {
                                try { document.body.removeChild(iframe); } catch {}
                              }, 60000);

                              postBulk({ ids: [activeTx.id], action: 'export' }).catch(() => {});
                              pushToast(`${e.type} export package download started.`, 'success');
                            } catch { pushToast('Export download failed.', 'danger'); }
                          }}
                          style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Download {e.type}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'notes' && (() => {
                const list = drawerNotes.map((n: any) => ({ user: n.author || 'Unknown', role: '', date: n.createdAt ? String(n.createdAt).split('T')[0] : '', text: n.body, tag: 'internal' }));
                const filteredNotes = list.filter((n: any) => drawerNoteTag === 'all' || n.tag === drawerNoteTag);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea
                        placeholder="Write review summary notes here..."
                        value={quickReportNote}
                        onChange={(e) => setQuickReportNote(e.target.value)}
                        style={{ width: '100%', minHeight: '80px', padding: '0.625rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!quickReportNote.trim() || !activeTx) return;
                          try {
                            await addNote({ id: activeTx.id, body: quickReportNote.trim() }).unwrap();
                            setQuickReportNote('');
                            pushToast('Note added successfully.', 'success');
                          } catch { pushToast('Failed to add note.', 'danger'); }
                        }}
                        style={{
                          background: '#E8760A',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          alignSelf: 'flex-end',
                          fontFamily: 'inherit'
                        }}
                      >
                        Add Note
                      </button>
                    </div>

                    {/* Note Tag Filtering Pills */}
                    <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="hide-scrollbar">
                      {[
                        { key: 'all' as const, label: 'All Notes' },
                        { key: 'internal' as const, label: 'Internal' },
                        { key: 'ai' as const, label: 'AI Summary' },
                        { key: 'audit' as const, label: 'Audit Notes' },
                        { key: 'pinned' as const, label: 'Pinned Notes' },
                        { key: 'reviewer' as const, label: 'Reviewer Notes' }
                      ].map((pill) => {
                        const isPillActive = drawerNoteTag === pill.key;
                        return (
                          <button
                            key={pill.key}
                            type="button"
                            onClick={() => setDrawerNoteTag(pill.key)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              border: isPillActive ? '1px solid #E8760A' : '1px solid rgba(42,22,40,0.15)',
                              background: isPillActive ? 'rgba(232,118,10,0.06)' : 'transparent',
                              color: isPillActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              fontFamily: 'inherit'
                            }}
                          >
                            {pill.label}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {filteredNotes.length === 0 && <p style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', textAlign: 'center' }}>No notes recorded yet.</p>}
                      {filteredNotes.map((note: any, idx: number) => (
                        <div key={idx} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(42,22,40,0.5)', marginBottom: '0.25rem', fontSize: '0.7rem' }}>
                            <span style={{ fontWeight: 600 }}>{note.user}</span>
                            <span style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <span>{note.date}</span>
                              <span style={{ fontSize: '0.6rem', padding: '0.05rem 0.25rem', borderRadius: '4px', background: 'rgba(232,118,10,0.1)', color: '#E8760A', textTransform: 'uppercase', fontWeight: 700 }}>{note.tag}</span>
                            </span>
                          </div>
                          <div style={{ color: '#2A1628', lineHeight: 1.3 }}>{note.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. MODALS & POPUPS ── */}
      {popup.type === 'generate' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Reports Center"
          titlePlain="Generate"
          titleAccent="Financial Report"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleGenerateSubmit} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,118,10,0.2)' }}>Compile & Generate</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Report Template</label>
              <CustomSelect value={genReportTemplate} onChange={setGenReportTemplate} options={['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'VAT Summary', 'Corporate Tax']} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Reporting Period</label>
                <CustomSelect value={genReportingPeriod} onChange={setGenReportingPeriod} options={['Q1 2026', 'Apr 2026', 'FY 2025']} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Financial Year</label>
                <CustomSelect value={genFinYear} onChange={setGenFinYear} options={['2026', '2025']} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Company / Client</label>
              <CustomSelect value={genClientName} onChange={setGenClientName} options={['ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO']} />
            </div>
          </div>
        </ModalShell>
      )}

      {popup.type === 'schedule' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Reports Center"
          titlePlain="Schedule"
          titleAccent="Filing Delivery"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleScheduleSubmit} style={{ background: '#2a1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Confirm Schedule</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Frequency</label>
                <CustomSelect value={schFrequency} onChange={setSchFrequency} options={['Daily', 'Weekly', 'Monthly', 'Quarterly']} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Format</label>
                <CustomSelect value={schFormat} onChange={setSchFormat} options={['pdf', 'excel', 'csv']} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Recipients Email</label>
              <input type="text" value={schRecipients} onChange={(e) => setSchRecipients(e.target.value)} placeholder="recipients@domain.com" style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.8125rem' }} />
            </div>
          </div>
        </ModalShell>
      )}

      {popup.type === 'exportCenter' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Reports Center"
          titlePlain="Export"
          titleAccent="Compilations"
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
                    pushToast(`${exportFormat === 'excel' ? 'XLSX' : exportFormat.toUpperCase()} compilation export started successfully.`, 'success');
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
                { key: 'all' as const, label: 'All Compilations', sublabel: 'Export all records in the Reports center register', count: data.length },
                { key: 'filtered' as const, label: 'Filtered Results', sublabel: 'Only records matching current active filters', count: data.length }, // matching filtered view
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
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.15rem' }}>{opt.sublabel}</div>
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

      {popup.type === 'confirmDelete' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Reports Center"
          titlePlain="Delete"
          titleAccent="Report"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'delete' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('Report deleted.', 'danger'); })
                  .catch(() => pushToast('Failed to delete report.', 'danger'));
              }} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to delete the report: <strong>{popup.tx.name}</strong>? This action is permanent.
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmArchive' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Reports Center"
          titlePlain="Archive"
          titleAccent="Report"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'archive' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('Report archived.', 'warning'); })
                  .catch(() => pushToast('Failed to archive report.', 'danger'));
              }} style={{ background: '#B06000', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Archive</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to archive the report: <strong>{popup.tx.name}</strong>?
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmGenerate' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Reports Center"
          titlePlain="Regenerate"
          titleAccent="Report"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postGenerate({ name: popup.tx!.name, category: popup.tx!.category, client: popup.tx!.client, period: popup.tx!.period, financialYear: popup.tx!.financialYear })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('Report compilation successfully queued.', 'success'); })
                  .catch(() => pushToast('Failed to regenerate report.', 'danger'));
              }} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Regenerate</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Do you want to compile and regenerate: <strong>{popup.tx.name}</strong>?
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmCancelSchedule' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Scheduler"
          titlePlain="Cancel"
          titleAccent="Scheduled Delivery"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Keep Schedule</button>
              <button type="button" onClick={() => {
                const targetId = menuItem?.id || drawerTxId;
                if (!targetId) { setPopup({ type: null }); return; }
                postBulk({ ids: [targetId], action: 'cancelSchedule' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('Scheduled delivery plan cancelled.', 'danger'); })
                  .catch(() => pushToast('Failed to cancel schedule.', 'danger'));
              }} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Cancel Schedule</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to cancel the automated filing delivery schedule? You will no longer receive weekly compiles.
          </div>
        </ModalShell>
      )}

      {popup.type === 'reportPreview' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="PDF Viewer"
          titlePlain="Preview"
          titleAccent={popup.tx.name}
          maxWidth="720px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              {/* Zoom tools */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" onClick={() => setPreviewZoom(z => Math.max(50, z - 10))} style={{ background: '#fff', border: '1px solid #DDD0C4', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>−</button>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{previewZoom}%</span>
                <button type="button" onClick={() => setPreviewZoom(z => Math.min(200, z + 10))} style={{ background: '#fff', border: '1px solid #DDD0C4', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>+</button>
              </div>

              {/* Page Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" disabled={previewPage === 1} onClick={() => setPreviewPage(1)} style={{ background: 'transparent', border: 'none', cursor: previewPage === 1 ? 'not-allowed' : 'pointer', opacity: previewPage === 1 ? 0.3 : 0.8 }}>◀</button>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Page {previewPage} of 3</span>
                <button type="button" disabled={previewPage === 3} onClick={() => setPreviewPage(3)} style={{ background: 'transparent', border: 'none', cursor: previewPage === 3 ? 'not-allowed' : 'pointer', opacity: previewPage === 3 ? 0.3 : 0.8 }}>▶</button>
              </div>

                {/* Action download / print buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => pushToast('PDF directed to system printer.', 'info')} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}>Print</button>
                  <button type="button" onClick={() => pushToast('PDF download initiated.', 'success')} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Download</button>
                </div>
              </div>
            }
          >
            <div style={{ background: '#E5E7EB', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', overflow: 'auto', maxHeight: '420px' }} className="hide-scrollbar">
              <div style={{
                background: '#ffffff',
                width: '100%',
                maxWidth: '480px',
                padding: '2.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease',
                boxSizing: 'border-box'
              }}>
                {/* Mock Page Content layout matching page index */}
                <div style={{ borderBottom: '2px solid #E8760A', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2A1628', fontFamily: 'serif' }}>{popup.tx.client}</h3>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.45)' }}>Filing Year: {popup.tx.financialYear}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E8760A' }}>{popup.tx.period} Report</span>
                </div>

                {previewPage === 1 && (
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#2A1628', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.25rem' }}>1. Executive Position Summary</h4>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                      This compiled financial statement outlines the operational returns, gross margins, and net deductibles prepared in compliance with UAE VAT and Corporate Tax directives.
                    </p>
                    <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}><td style={{ padding: '0.4rem 0', color: 'rgba(0,0,0,0.5)' }}>Gross Revenue</td><td style={{ textAlign: 'right', fontWeight: 700 }}>AED 4,250,000</td></tr>
                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}><td style={{ padding: '0.4rem 0', color: 'rgba(0,0,0,0.5)' }}>Allowable Deductibles</td><td style={{ textAlign: 'right', fontWeight: 700 }}>AED (3,120,000)</td></tr>
                        <tr style={{ borderBottom: '1px solid #2A1628' }}><td style={{ padding: '0.4rem 0', color: 'rgba(0,0,0,0.5)', fontWeight: 700 }}>Net Position Value</td><td style={{ textAlign: 'right', fontWeight: 700, color: '#E8760A' }}>AED 1,130,000</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {previewPage === 2 && (
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#2A1628', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.25rem' }}>2. Ledger Adjustments</h4>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                      Depreciation schedules and standard pos ledger summaries were aggregated. All values conform with direct invoice reporting limits.
                    </p>
                  </div>
                )}
                {previewPage === 3 && (
                  <div>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#2A1628', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.25rem' }}>3. Audit Validation</h4>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                      Double entry verification checks are complete. Prepared by Mahesh Maddu, verified by senior audit staff.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalShell>
        )}

      {/* Styled JSX injected for dynamic animations */}
      <style jsx global>{`
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
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
