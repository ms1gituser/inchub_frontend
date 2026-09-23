'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Pagination from '@/components/ui/Pagination';
import {
  useGetQueueQuery,
  useGetStatsQuery,
  useGetAnalyticsQuery,
  useGetDrawerDetailsQuery,
  useGetMetadataQuery,
  usePostFileMutation,
  usePostAmendMutation,
  useAddVatReturnMutation,
  usePostBulkMutation,
  useImportReturnsMutation,
  usePostNoteMutation,
  usePostDocumentMutation
} from '@/lib/vatApi';
import { useGetClientsQuery } from '@/lib/clientapi';

// ============================================================================
// Types
// ============================================================================

interface VatReturnItem {
  id: string;
  client: string;
  trn: string;
  quarter: string;
  year: string;
  country: string;
  vatType: 'Mainland' | 'Free Zone';
  outputVat: number;
  inputVat: number;
  netVat: number; // output - input
  status: 'Draft' | 'Pending' | 'Ready To File' | 'Filed' | 'Overdue' | 'Exception' | 'Amended' | 'Archived';
  reviewer: string;
  manager: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  risk: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
  taxRate: number;
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

interface VatTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: 'Sale' | 'Purchase';
  grossAmount: number;
  vatAmount: number;
  rate: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_RETURNS: VatReturnItem[] = [
  {
    id: 'vat-1',
    client: 'ABC Trading LLC',
    trn: '100556789600003',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 45000,
    inputVat: 29750,
    netVat: 15250,
    status: 'Overdue',
    reviewer: 'Priya Nair',
    manager: 'John Doe',
    priority: 'High',
    dueDate: '2026-05-28',
    risk: 'High',
    lastUpdated: '2026-05-26',
    taxRate: 5,
    tags: ['Retail', 'Audit Required'],
  },
  {
    id: 'vat-2',
    client: 'XYZ Holdings Limited',
    trn: '100556789600004',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Free Zone',
    outputVat: 28000,
    inputVat: 19250,
    netVat: 8750,
    status: 'Overdue',
    reviewer: 'Omar Haddad',
    manager: 'Mike Brown',
    priority: 'High',
    dueDate: '2026-05-28',
    risk: 'Medium',
    lastUpdated: '2026-05-25',
    taxRate: 5,
    tags: ['Consulting', 'Zero-Rated'],
  },
  {
    id: 'vat-3',
    client: 'Delta Properties FZCO',
    trn: '100987654300002',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Free Zone',
    outputVat: 82300,
    inputVat: 70000,
    netVat: 12300,
    status: 'Filed',
    reviewer: 'Lucia Ferreira',
    manager: 'John Doe',
    priority: 'Medium',
    dueDate: '2026-04-28',
    risk: 'Low',
    lastUpdated: '2026-04-24',
    taxRate: 5,
    tags: ['Real Estate', 'Exempt Sales'],
  },
  {
    id: 'vat-4',
    client: 'Alpha Tech FZCO',
    trn: '100778899000005',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Free Zone',
    outputVat: 14500,
    inputVat: 17150,
    netVat: -2650,
    status: 'Filed',
    reviewer: 'Kevin Park',
    manager: 'Sneha Iyer',
    priority: 'Low',
    dueDate: '2026-04-28',
    risk: 'Low',
    lastUpdated: '2026-04-23',
    taxRate: 5,
    tags: ['Software', 'Refund Pending'],
  },
  {
    id: 'vat-5',
    client: 'Beta Industries LLC',
    trn: '100445566100008',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 95400,
    inputVat: 73620,
    netVat: 21780,
    status: 'Filed',
    reviewer: 'Ahmed Zaid',
    manager: 'John Doe',
    priority: 'Medium',
    dueDate: '2026-04-28',
    risk: 'High',
    lastUpdated: '2026-05-05',
    taxRate: 5,
    tags: ['Manufacturing', 'Customs Entry'],
  },
  {
    id: 'vat-6',
    client: 'Gamma Solutions FZCO',
    trn: '100556789600008',
    quarter: 'Q4',
    year: '2025',
    country: 'UAE',
    vatType: 'Free Zone',
    outputVat: 34200,
    inputVat: 26300,
    netVat: 7900,
    status: 'Filed',
    reviewer: 'Lucia Ferreira',
    manager: 'Mike Brown',
    priority: 'Low',
    dueDate: '2026-03-28',
    risk: 'Low',
    lastUpdated: '2026-03-25',
    taxRate: 5,
    tags: ['Logistics'],
  },
  {
    id: 'vat-7',
    client: 'Nova Hospitality LLC',
    trn: '100556789600009',
    quarter: 'Q4',
    year: '2025',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 55600,
    inputVat: 46350,
    netVat: 9250,
    status: 'Filed',
    reviewer: 'Priya Nair',
    manager: 'Sneha Iyer',
    priority: 'Medium',
    dueDate: '2026-03-28',
    risk: 'Medium',
    lastUpdated: '2026-04-02',
    taxRate: 5,
    tags: ['Tourism', 'F&B'],
  },
  {
    id: 'vat-8',
    client: 'Prime Consultants FZCO',
    trn: '100556789600010',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Free Zone',
    outputVat: 12000,
    inputVat: 9500,
    netVat: 2500,
    status: 'Draft',
    reviewer: 'Omar Haddad',
    manager: 'John Doe',
    priority: 'Low',
    dueDate: '2026-06-28',
    risk: 'Low',
    lastUpdated: '2026-05-24',
    taxRate: 5,
    tags: ['Legal', 'Consultancy'],
  },
  {
    id: 'vat-9',
    client: 'Sigma Services LLC',
    trn: '100556789600011',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 0,
    inputVat: 0,
    netVat: 0,
    status: 'Archived',
    reviewer: 'Kevin Park',
    manager: 'Mike Brown',
    priority: 'Low',
    dueDate: '2026-06-28',
    risk: 'Low',
    lastUpdated: '2026-05-20',
    taxRate: 5,
    tags: ['Inactive'],
  },
  {
    id: 'vat-10',
    client: 'Vertex Enterprises LLC',
    trn: '100556789600012',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 48900,
    inputVat: 34100,
    netVat: 14800,
    status: 'Ready To File',
    reviewer: 'Ahmed Zaid',
    manager: 'Sneha Iyer',
    priority: 'Medium',
    dueDate: '2026-06-28',
    risk: 'Medium',
    lastUpdated: '2026-06-01',
    taxRate: 5,
    tags: ['General Trading'],
  },
  {
    id: 'vat-11',
    client: 'Falcon Logistics FZCO',
    trn: '100556789600101',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Free Zone',
    outputVat: 89000,
    inputVat: 62000,
    netVat: 27000,
    status: 'Exception',
    reviewer: 'Priya Nair',
    manager: 'John Doe',
    priority: 'Urgent',
    dueDate: '2026-06-28',
    risk: 'High',
    lastUpdated: '2026-06-05',
    taxRate: 5,
    tags: ['Shipping', 'TRN Exception'],
  },
  {
    id: 'vat-12',
    client: 'Horizon Medical LLC',
    trn: '100556789600102',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 120000,
    inputVat: 95000,
    netVat: 25000,
    status: 'Pending',
    reviewer: 'Kevin Park',
    manager: 'Mike Brown',
    priority: 'High',
    dueDate: '2026-06-28',
    risk: 'Medium',
    lastUpdated: '2026-06-08',
    taxRate: 5,
    tags: ['Healthcare', 'Zero-Rated Sales'],
  },
  {
    id: 'vat-13',
    client: 'Zenith Foodstuff Trading',
    trn: '100556789600103',
    quarter: 'Q1',
    year: '2026',
    country: 'UAE',
    vatType: 'Mainland',
    outputVat: 68500,
    inputVat: 54100,
    netVat: 14400,
    status: 'Amended',
    reviewer: 'Ahmed Zaid',
    manager: 'Sneha Iyer',
    priority: 'Medium',
    dueDate: '2026-06-28',
    risk: 'Low',
    lastUpdated: '2026-06-09',
    taxRate: 5,
    tags: ['F&B', 'Amended Return'],
  }
];

const MOCK_ACTIVITY: ActivityLog[] = [
  { timestamp: '2026-06-09 14:23:12', user: 'Priya Nair', action: 'Modified Status', oldVal: 'Draft', newVal: 'Pending', ip: '192.168.1.42', system: 'Chrome / Win10' },
  { timestamp: '2026-06-08 09:12:05', user: 'System Agent', action: 'VAT Verification Run', oldVal: 'Filing Logged', newVal: 'Compliance Passed', ip: '127.0.0.1', system: 'NextJS Internal' },
  { timestamp: '2026-06-05 11:45:00', user: 'John Doe', action: 'Assigned Reviewer', oldVal: 'Unassigned', newVal: 'Priya Nair', ip: '192.168.1.12', system: 'Safari / MacOS' },
  { timestamp: '2026-06-01 16:30:20', user: 'Sneha Iyer', action: 'Created Draft Return', oldVal: '-', newVal: 'Quarterly Return Form 201', ip: '192.168.2.89', system: 'Chrome / MacOS' }
];

const MOCK_TXS: VatTransaction[] = [
  { id: 'tx-101', date: '2026-05-15', description: 'Dubai Mall Retail Sales - POS 3 Summary', reference: 'POS-260515-03', type: 'Sale', grossAmount: 10500, vatAmount: 500, rate: 5 },
  { id: 'tx-102', date: '2026-05-16', description: 'Al Maya Wholesale Supplies Invoice', reference: 'INV-2026-5412', type: 'Sale', grossAmount: 31500, vatAmount: 1500, rate: 5 },
  { id: 'tx-103', date: '2026-05-17', description: 'Office Rental Lease Payment - JLT Sector', reference: 'EXP-JLT-8951', type: 'Purchase', grossAmount: 12600, vatAmount: 600, rate: 5 },
  { id: 'tx-104', date: '2026-05-18', description: 'Aramex International Freight Charges', reference: 'SHP-9982751', type: 'Purchase', grossAmount: 4200, vatAmount: 200, rate: 5 },
  { id: 'tx-105', date: '2026-05-20', description: 'Client Consulting Services Fee', reference: 'INV-2026-5413', type: 'Sale', grossAmount: 8000, vatAmount: 0, rate: 0 }
];

const MOCK_DOCS = [
  { name: 'VAT_Return_Draft_Q1_2026.pdf', size: '1.2 MB', date: '2026-06-08', type: 'PDF' },
  { name: 'Sales_Ledger_Extract_Q1_2026.xlsx', size: '4.8 MB', date: '2026-06-05', type: 'XLSX' },
  { name: 'VAT_Audit_Report_201.pdf', size: '890 KB', date: '2026-06-01', type: 'PDF' }
];

const REVIEWERS = ['Priya Nair', 'Omar Haddad', 'Lucia Ferreira', 'Ahmed Zaid', 'Kevin Park', 'Unassigned'];
const MANAGERS = ['John Doe', 'Mike Brown', 'Sneha Iyer'];
const YEARS = ['2026', '2025'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

// ============================================================================
// Focus Trap Utility
// ============================================================================

interface FocusTrapProps {
  children: React.ReactNode;
  onEscape?: () => void;
  active?: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function FocusTrap({ children, onEscape, active = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const container = containerRef.current;
    
    // Auto-focus only once when component mounts
    const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusable && focusable.length > 0 && !container?.contains(document.activeElement)) {
      focusable[0]?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscapeRef.current) {
        e.stopPropagation();
        onEscapeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return <div ref={containerRef} style={{ display: 'contents' }}>{children}</div>;
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
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
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {value || placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2A1628"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            flexShrink: 0,
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            marginBottom: '4px',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            boxShadow: '0 -8px 24px rgba(42,22,40,0.1)',
            zIndex: 1000,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: isSelected ? '#E8760A' : '#2A1628',
                  background: isSelected ? 'rgba(232,118,10,0.08)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(232,118,10,0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ============================================================================
// Core Dashboard Component
// ============================================================================

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? createPortal(children, document.body) : null;
}

export default function VatCenterTab() {
  const { data: queueRes, isLoading: queueLoading, refetch } = useGetQueueQuery({ limit: 1000 });
  const { data: clientsRes } = useGetClientsQuery({ limit: 100 });
  const [fileReturn, { isLoading: isFilingVat }] = usePostFileMutation();
  const [amendReturn] = usePostAmendMutation();
  const [addVatReturn] = useAddVatReturnMutation();
  const [postBulk] = usePostBulkMutation();
  const [importReturns] = useImportReturnsMutation();
  const { data: analyticsRes } = useGetAnalyticsQuery();
  const { data: metaRes } = useGetMetadataQuery();
  const dynamicReviewers = metaRes?.data?.reviewers ? [...metaRes.data.reviewers, 'Unassigned'] : REVIEWERS;
  const dynamicManagers = metaRes?.data?.managers ? [...metaRes.data.managers, 'Unassigned'] : ['Mahesh Maddu', 'Priya Nair', 'Rohit Sharma', 'Sneha Iyer', 'Unassigned'];

  // Local state datasets
  const [data, setData] = useState<VatReturnItem[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: 'success' | 'danger' | 'info' | 'warning' }[]>([]);

  const clientsList = useMemo(() => {
    const set = new Set<string>();
    if (clientsRes?.data?.clients) {
      clientsRes.data.clients.forEach((c: any) => {
        const name = c.company_name || c.name || c.client_name;
        if (name) set.add(name);
      });
    }
    data.forEach((d) => {
      if (d.client) set.add(d.client);
    });
    return Array.from(set).sort();
  }, [clientsRes, data]);

  // Sync queueRes.data into local state when it updates
  const prevQueueDataRef = useRef<VatReturnItem[] | undefined>(undefined);
  if (queueRes?.data && queueRes.data !== prevQueueDataRef.current) {
    prevQueueDataRef.current = queueRes.data;
    setData(queueRes.data);
  }

  // Export Modal Configuration states
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('filtered');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'print'>('excel');

  // Columns configuration state
  const [columns, setColumns] = useState([
    { key: 'client', label: 'CLIENT / COMPANY', align: 'left', sortable: true },
    { key: 'trn', label: 'VAT NUMBER', align: 'left', sortable: true },
    { key: 'quarter', label: 'VAT QUARTER', align: 'center', sortable: true },
    { key: 'year', label: 'FINANCIAL YEAR', align: 'center', sortable: true },
    { key: 'outputVat', label: 'OUTPUT VAT', align: 'right', sortable: true },
    { key: 'inputVat', label: 'INPUT VAT', align: 'right', sortable: true },
    { key: 'netVat', label: 'NET VAT', align: 'right', sortable: true },
    { key: 'status', label: 'FILING STATUS', align: 'left', sortable: false },
    { key: 'reviewer', label: 'REVIEWER', align: 'left', sortable: true },
    { key: 'dueDate', label: 'DUE DATE', align: 'left', sortable: true },
    { key: 'risk', label: 'RISK', align: 'left', sortable: false },
  ]);

  const dragKeyRef = useRef<string | null>(null);

  const handleColumnReorder = (sourceKey: string, targetKey: string) => {
    setColumns((prev) => {
      const sourceIdx = prev.findIndex((c) => c.key === sourceKey);
      const targetIdx = prev.findIndex((c) => c.key === targetKey);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(sourceIdx, 1);
      next.splice(targetIdx, 0, removed);
      return next;
    });
  };

  // Search, selection, active row actions
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [menuItem, setMenuItem] = useState<VatReturnItem | null>(null);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Popups State
  const [popup, setPopup] = useState<{
    type: 'import' | 'create' | 'export' | 'assign' | 'validation' | 'submit' | 'delete' | 'notes' | null;
    tx?: VatReturnItem;
  }>({ type: null });

  // Drawer details state
  const [drawerTxId, setDrawerTxId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'transactions' | 'breakdown' | 'validation' | 'timeline' | 'activity' | 'documents' | 'history' | 'notes' | 'quickBooksSync'>('overview');
  const vatDrawerTabRef = useRef<HTMLDivElement>(null);
  const scrollVatDrawerTabs = (dir: 'left' | 'right') => {
    if (vatDrawerTabRef.current) {
      vatDrawerTabRef.current.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  // Filter bar states
  const [filterClient, setFilterClient] = useState('All');
  const [filterManager, setFilterManager] = useState('All');
  const [filterReviewer, setFilterReviewer] = useState('All');
  const [filterQuarter, setFilterQuarter] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');

  // Popup form states
  const [newFormName, setNewFormName] = useState('');
  const [newFormTrn, setNewFormTrn] = useState('');
  const [newFormQuarter, setNewFormQuarter] = useState('Q1');
  const [newFormYear, setNewFormYear] = useState('2026');
  const [newFormType, setNewFormType] = useState<'Mainland' | 'Free Zone'>('Mainland');
  const [newFormOutput, setNewFormOutput] = useState('');
  const [newFormInput, setNewFormInput] = useState('');
  const [newFormReviewer, setNewFormReviewer] = useState('Alex Mercer');
  const [newFormManager, setNewFormManager] = useState('Mahesh Maddu');

  // Import form state
  const [importTab, setImportTab] = useState<'local' | 'gdrive' | 'onedrive'>('local');
  const [importFile, setImportFile] = useState('');
  const [importBase64, setImportBase64] = useState('');
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [importTrn, setImportTrn] = useState('');
  const [importQuarter, setImportQuarter] = useState('Q1');

  // Notes state
  const [assignedReviewerSelection, setAssignedReviewerSelection] = useState('Alex Mercer');

  // Toast utility helper
  const pushToast = (message: string, tone: 'success' | 'danger' | 'info' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Close menus when clicking anywhere
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.action-btn-trigger') || target.closest('.action-menu-portal')) {
        return;
      }
      setActiveMenuId(null);
    };
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  const filteredData = useMemo(() => {
    let list = data.filter((item) => {
      const matchSearch =
        item.client.toLowerCase().includes(search.toLowerCase()) ||
        item.trn.includes(search);
      const matchStatus =
        activeStatusTab === 'All' || item.status.toLowerCase() === activeStatusTab.toLowerCase();
      const matchClient = filterClient === 'All' || item.client === filterClient;
      const matchManager = filterManager === 'All' || item.manager === filterManager;
      const matchReviewer = filterReviewer === 'All' || item.reviewer === filterReviewer;
      const matchQuarter = filterQuarter === 'All' || item.quarter === filterQuarter;
      const matchYear = filterYear === 'All' || item.year === filterYear;
      const matchType = filterType === 'All' || item.vatType === filterType;
      const matchPriority = filterPriority === 'All' || item.priority === filterPriority;
      const matchRisk = filterRisk === 'All' || item.risk === filterRisk;
      const matchCountry = filterCountry === 'All' || item.country === filterCountry;
      return matchSearch && matchStatus && matchClient && matchManager && matchReviewer && matchQuarter && matchYear && matchType && matchPriority && matchRisk && matchCountry;
    });
    if (sortCol) {
      list = [...list].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortCol];
        const bVal = (b as unknown as Record<string, unknown>)[sortCol];
        const cmp = typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal ?? '').localeCompare(String(bVal ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [data, search, activeStatusTab, filterClient, filterManager, filterReviewer, filterQuarter, filterYear, filterType, filterPriority, filterRisk, filterCountry, sortCol, sortDir]);

  // Page split calculation
  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);


  // Drawer details query
  const { data: drawerDetailsRes } = useGetDrawerDetailsQuery(drawerTxId || '', { skip: !drawerTxId });
  const activeTx = drawerTxId ? (drawerDetailsRes?.data?.vatReturn || data.find((x) => x.id === drawerTxId) || null) : null;
  const drawerTransactions = drawerDetailsRes?.data?.transactions || [];
  const drawerTimeline = drawerDetailsRes?.data?.timeline || [];
  const drawerActivityLog = drawerDetailsRes?.data?.activityLog || [];
  const drawerBreakdown = drawerDetailsRes?.data?.breakdown || null;
  const drawerValidationChecks = drawerDetailsRes?.data?.validationChecks || [];
  const drawerDocuments = drawerDetailsRes?.data?.documents || [];
  const drawerNotes = drawerDetailsRes?.data?.notes || [];
  const [addVatNote] = usePostNoteMutation();
  const [addVatDocument] = usePostDocumentMutation();
  const [quickVatNote, setQuickVatNote] = useState('');

  // Row selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Actions execution
  const handleCreateReturn = () => {
    const outVal = parseFloat(newFormOutput) || 0;
    const inVal = parseFloat(newFormInput) || 0;
    addVatReturn({
      client: newFormName.trim() || undefined,
      trn: newFormTrn.trim() || '100556789600000',
      quarter: newFormQuarter,
      year: newFormYear,
      vatType: newFormType,
      outputVat: outVal,
      inputVat: inVal,
      reviewer: newFormReviewer,
      manager: newFormManager,
      dueDate: `${newFormYear}-06-28`,
    })
      .unwrap()
      .then(() => {
        refetch();
        setPopup({ type: null });
        pushToast('New VAT Return logged successfully.', 'success');
      })
      .catch(() => pushToast('Failed to create VAT return.', 'danger'));
  };

  const handleImportData = () => {
    if (!importBase64) {
      pushToast('Please select a file to import.', 'warning');
      return;
    }
    importReturns({ file: importBase64 })
      .unwrap()
      .then((res: any) => {
        refetch();
        setPopup({ type: null });
        pushToast(`Imported ${res?.data?.count ?? 0} VAT return(s) successfully.`, 'success');
      })
      .catch(() => pushToast('Failed to import VAT returns.', 'danger'));
  };

  const handleAssignReviewerBulk = () => {
    postBulk({ ids: selectedIds, action: 'assignReviewer', value: { reviewer: assignedReviewerSelection } })
      .unwrap()
      .then(() => {
        refetch();
        setSelectedIds([]);
        setPopup({ type: null });
        pushToast('Reviewer assigned to selected returns.', 'success');
      })
      .catch(() => pushToast('Failed to assign reviewer.', 'danger'));
  };

  const handleUpdateStatusBulk = (status: VatReturnItem['status']) => {
    const action = status === 'Ready To File' ? 'markReady' : status === 'Filed' ? 'markFiled' : status === 'Archived' ? 'archive' : null;
    if (!action) {
      pushToast(`Bulk update to status "${status}" is not supported.`, 'warning');
      return;
    }
    postBulk({ ids: selectedIds, action })
      .unwrap()
      .then(() => {
        refetch();
        setSelectedIds([]);
        pushToast(`Selected returns marked as ${status}.`, 'success');
      })
      .catch(() => pushToast('Failed to update status.', 'danger'));
  };

  const handleDeleteReturn = (id: string) => {
    postBulk({ ids: [id], action: 'delete' })
      .unwrap()
      .then(() => refetch())
      .catch(() => pushToast('Failed to delete VAT return.', 'danger'));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    if (drawerTxId === id) setDrawerTxId(null);
    setPopup({ type: null });
    pushToast('VAT Return deleted successfully.', 'success');
  };

  // Status statistics counts
  const stats = useMemo(() => {
    const results = {
      all: data.length,
      draft: 0,
      pending: 0,
      ready: 0,
      filed: 0,
      overdue: 0,
      exception: 0,
      amended: 0,
      archived: 0,
      payable: 0,
      receivable: 0,
      netPayable: 0,
      highRisk: 0,
      totalReturns: 0,
      outputVatTotal: 0,
      inputVatTotal: 0,
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
    };
    data.forEach((x) => {
      const statusLower = x.status.toLowerCase();
      if (statusLower === 'draft') results.draft++;
      else if (statusLower === 'pending') results.pending++;
      else if (statusLower === 'ready to file') results.ready++;
      else if (statusLower === 'filed') results.filed++;
      else if (statusLower === 'overdue') results.overdue++;
      else if (statusLower === 'exception') results.exception++;
      else if (statusLower === 'amended') results.amended++;
      else if (statusLower === 'archived') results.archived++;

      if (x.netVat > 0) results.payable += x.netVat;
      if (x.netVat < 0) results.receivable += Math.abs(x.netVat);
      results.outputVatTotal += x.outputVat;
      results.inputVatTotal += x.inputVat;
      if (x.risk === 'High') results.highRisk++;

      if (x.quarter === 'Q1') results.q1++;
      else if (x.quarter === 'Q2') results.q2++;
      else if (x.quarter === 'Q3') results.q3++;
      else if (x.quarter === 'Q4') results.q4++;
    });
    results.netPayable = results.payable - results.receivable;
    return results;
  }, [data]);

  return (
    <div
      style={{
        color: '#2A1628',
        fontFamily: 'var(--font-sans), Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        background: 'transparent',
        position: 'relative',
      }}
    >
      {/* ── TOAST MESSAGES PANEL ── */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1100 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(42,22,40,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background:
                t.tone === 'success'
                  ? '#047857'
                  : t.tone === 'danger'
                  ? '#b91c1c'
                  : t.tone === 'warning'
                  ? '#b45309'
                  : '#2A1628',
            }}
          >
            {t.tone === 'success' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            {t.message}
          </div>
        ))}
      </div>

      {/* ── 1. ENTERPRISE HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1rem', borderBottom: '1px solid #DDD0C4' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              Accounting &gt; VAT Center
            </p>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif), Georgia, serif' }}>
            VAT <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Consolidated UAE corporate VAT filings, compliance checklist auditing, and tax ledger imports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>

          <button
            type="button"
            onClick={() => setPopup({ type: 'import' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Import VAT Data
          </button>

          <button
            type="button"
            onClick={() => setPopup({ type: 'create' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Create VAT Return
          </button>

          <button
            type="button"
            onClick={() => setPopup({ type: 'export' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export Center
          </button>

          <button
            type="button"
            onClick={() => {
              refetch();
              pushToast('VAT registry dataset reloaded from database.', 'info');
            }}
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
              boxShadow: '0 4px 12px rgba(42,22,40,0.15)',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Refresh
          </button>
        </div>
      </div>

          {/* ── 2. KPI METRICS SECTION (10 CARDS) ── */}
      <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { label: 'VAT Payable', value: `AED ${stats.payable.toLocaleString()}`, sub: 'Output liabilities logged', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'VAT Receivable', value: `AED ${stats.receivable.toLocaleString()}`, sub: 'Input credits reclaimable', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Net VAT Position', value: `AED ${stats.netPayable.toLocaleString()}`, sub: 'Net payable balance', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Output VAT', value: `AED ${stats.outputVatTotal.toLocaleString()}`, sub: 'Sales tax logged', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Input VAT', value: `AED ${stats.inputVatTotal.toLocaleString()}`, sub: 'Purchase tax logged', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Returns Pending', value: `${stats.pending + stats.ready} returns`, sub: 'Needs review / Ready', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Returns Filed', value: `${stats.filed} returns`, sub: 'FTA portal confirmed', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Compliance Score', value: `${analyticsRes?.data?.accuracyTrend?.[analyticsRes.data.accuracyTrend.length - 1] || 98}%`, sub: 'Audit matching rate', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'High Risk Returns', value: `${stats.highRisk} returns`, sub: 'Require checklist audit', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
          { label: 'Filing Deadline', value: '28 Jul 2026', sub: 'Q2 Return Schedule', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, bg: 'rgba(232,118,10,0.06)', color: '#E8760A' },
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
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color, flexShrink: 0,
                fontSize: '0.9rem'
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{ queueLoading ? (
                  <div style={{ width: '48px', height: '32px', background: 'rgba(42,22,40,0.06)', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ) : (
                  card.value
                )}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. STATUS CHIPS ROW ── */}
      <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { label: 'All', count: stats.all },
          { label: 'Draft', count: stats.draft },
          { label: 'Pending', count: stats.pending },
          { label: 'Ready To File', count: stats.ready },
          { label: 'Filed', count: stats.filed },
          { label: 'Overdue', count: stats.overdue },
          { label: 'Exception', count: stats.exception },
          { label: 'Amended', count: stats.amended },
          { label: 'Archived', count: stats.archived },
        ].map((tab) => {
          const isActive = activeStatusTab === tab.label;

          const tabColors = {
            border: isActive ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
            bg: isActive ? 'rgba(232,118,10,0.06)' : '#ffffff',
            color: isActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
            badgeBg: isActive ? '#E8760A' : 'rgba(42,22,40,0.08)',
            badgeColor: isActive ? '#fff' : 'rgba(42,22,40,0.5)'
          };

          // Keep uniform active tab colors matching the orange UI theme

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
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 150ms ease',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab.label}
              <span
                style={{
                  background: tabColors.badgeBg,
                  color: tabColors.badgeColor,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '10px',
                  lineHeight: 1.5,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── BULK ACTIONS TOOLBAR ── */}
      {selectedIds.length > 0 && (
        <div className="no-scrollbar" style={{ background: '#2A1628', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.25rem', flexShrink: 0 }}>
            {selectedIds.length} returns selected
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'Assign Reviewer', ic: '👤', onClick: () => setPopup({ type: 'assign' }) },
              { label: 'Mark Ready', ic: '⏳', onClick: () => handleUpdateStatusBulk('Ready To File') },
              { label: 'Mark Filed', ic: '✅', onClick: () => handleUpdateStatusBulk('Filed') },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.3rem 0.6rem', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif', transition: 'background 120ms', whiteSpace: 'nowrap', flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                <span style={{ fontSize: '0.6rem' }}>{btn.ic}</span>{btn.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', flexShrink: 0, paddingLeft: '0.5rem' }}>✕ Clear Selection</button>
        </div>
      )}

      {/* ── 4. ENTERPRISE FILTERS BAR ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(42,22,40,0.06)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(42,22,40,0.01)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.35)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search Client Name or TRN Number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.25rem',
                fontSize: '0.8125rem',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                background: '#FAF8F5',
                outline: 'none',
                color: '#2A1628',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setFilterClient('All');
                setFilterManager('All');
                setFilterReviewer('All');
                setFilterQuarter('All');
                setFilterYear('All');
                setFilterType('All');
                setFilterPriority('All');
                setFilterRisk('All');
                setFilterCountry('All');
                setSearch('');
                setActiveStatusTab('All');
                setCurrentPage(1);
                pushToast('Filters cleared.', 'info');
              }}
              style={{ padding: '0.55rem 1rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: 'rgba(42,22,40,0.6)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Reset Filters
            </button>

            <button
              type="button"
              onClick={() => pushToast('Custom columns config saved.', 'success')}
              style={{ padding: '0.55rem 1rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: 'rgba(42,22,40,0.6)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Manage Columns
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          <div>
            <CustomSelect
              value={filterClient === 'All' ? '' : filterClient}
              onChange={(v) => { setFilterClient(v || 'All'); setCurrentPage(1); }}
              options={['All', ...clientsList]}
              placeholder="Client: All"
            />
          </div>
          <div>
            <CustomSelect
              value={filterManager === 'All' ? '' : filterManager}
              onChange={(v) => { setFilterManager(v || 'All'); setCurrentPage(1); }}
              options={['All', ...(metaRes?.data?.managers || MANAGERS)]}
              placeholder="Manager: All"
            />
          </div>
          <div>
            <CustomSelect
              value={filterQuarter === 'All' ? '' : filterQuarter}
              onChange={(v) => { setFilterQuarter(v || 'All'); setCurrentPage(1); }}
              options={['All', ...QUARTERS]}
              placeholder="Quarter: All"
            />
          </div>
          <div>
            <CustomSelect
              value={filterYear === 'All' ? '' : filterYear}
              onChange={(v) => { setFilterYear(v || 'All'); setCurrentPage(1); }}
              options={['All', ...YEARS]}
              placeholder="Year: All"
            />
          </div>
          <div>
            <CustomSelect
              value={filterType === 'All' ? '' : filterType}
              onChange={(v) => { setFilterType(v || 'All'); setCurrentPage(1); }}
              options={['All', 'Mainland', 'Free Zone']}
              placeholder="Type: All"
            />
          </div>
          <div>
            <CustomSelect
              value={filterPriority === 'All' ? '' : filterPriority}
              onChange={(v) => { setFilterPriority(v || 'All'); setCurrentPage(1); }}
              options={['All', 'Low', 'Medium', 'High', 'Urgent']}
              placeholder="Priority: All"
            />
          </div>
          <div>
            <CustomSelect
              value={filterRisk === 'All' ? '' : filterRisk}
              onChange={(v) => { setFilterRisk(v || 'All'); setCurrentPage(1); }}
              options={['All', 'Low', 'Medium', 'High']}
              placeholder="Risk: All"
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="client-table-scroll" style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', overflowX: 'auto', overflowY: 'visible', boxShadow: '0 4px 12px rgba(42,22,40,0.01)', position: 'relative' }}>
          <style>{`
            
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
.client-table-scroll::-webkit-scrollbar { height: 6px; }
            .client-table-scroll::-webkit-scrollbar-track { background: rgba(42,22,40,0.03); border-radius: 4px; }
            .client-table-scroll::-webkit-scrollbar-thumb { background: rgba(42,22,40,0.15); border-radius: 4px; }
            .client-table-scroll::-webkit-scrollbar-thumb:hover { background: rgba(42,22,40,0.25); }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
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
                        textAlign: col.align as 'left' | 'right' | 'center',
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
              {pagedData.map((item, idx) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => { setDrawerTxId(item.id); setDrawerTab('overview'); }}
                    style={{
                      borderBottom: idx < pagedData.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                      background: isSelected ? 'rgba(232,118,10,0.02)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(42,22,40,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? 'rgba(232,118,10,0.02)' : 'transparent')}
                  >
                    <td
                      style={{ padding: '0.625rem 0.75rem', textAlign: 'center', position: 'sticky', left: 0, background: isSelected ? '#FAF4EE' : '#ffffff', zIndex: 9 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </td>
                    {columns.map((col) => {
                      const isClient = col.key === 'client';
                      const cellVal = item[col.key as keyof VatReturnItem];
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
                              <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>{item.vatType}</div>
                            </div>
                          </div>
                        );
                      } else if (col.key === 'trn') {
                        tdStyle = { ...tdStyle, color: 'rgba(42,22,40,0.75)', fontWeight: 500 };
                      } else if (col.key === 'quarter') {
                        tdStyle = { ...tdStyle, textAlign: 'center' };
                        tdContent = (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '20px',
                            display: 'inline-block',
                            background:
                              item.quarter === 'Q1' ? '#E8F0FE'
                              : item.quarter === 'Q2' ? '#E6F4EA'
                              : item.quarter === 'Q3' ? 'rgba(124,58,237,0.08)'
                              : item.quarter === 'Q4' ? 'rgba(180,83,9,0.08)'
                              : 'rgba(42,22,40,0.06)',
                            color:
                              item.quarter === 'Q1' ? '#1A73E8'
                              : item.quarter === 'Q2' ? '#047857'
                              : item.quarter === 'Q3' ? '#7c3aed'
                              : item.quarter === 'Q4' ? '#b45309'
                              : '#2A1628',
                            border:
                              item.quarter === 'Q1' ? '1px solid rgba(26,115,232,0.2)'
                              : item.quarter === 'Q2' ? '1px solid rgba(4,120,87,0.2)'
                              : item.quarter === 'Q3' ? '1px solid rgba(124,58,237,0.2)'
                              : item.quarter === 'Q4' ? '1px solid rgba(180,83,9,0.2)'
                              : '1px solid rgba(42,22,40,0.08)',
                          }}>
                            {item.quarter}
                          </span>
                        );
                      } else if (col.key === 'year') {
                        tdStyle = { ...tdStyle, color: '#2A1628', fontWeight: 600, textAlign: 'center' };
                      } else if (col.key === 'outputVat') {
                        tdStyle = { ...tdStyle, textAlign: 'right', fontWeight: 600 };
                        tdContent = `AED ${item.outputVat.toLocaleString()}`;
                      } else if (col.key === 'inputVat') {
                        tdStyle = { ...tdStyle, textAlign: 'right', fontWeight: 600 };
                        tdContent = `AED ${item.inputVat.toLocaleString()}`;
                      } else if (col.key === 'netVat') {
                        tdStyle = { ...tdStyle, textAlign: 'right', fontWeight: 700, color: item.netVat >= 0 ? '#2A1628' : '#047857' };
                        tdContent = `AED ${item.netVat.toLocaleString()}`;
                      } else if (col.key === 'status') {
                        tdContent = (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background:
                              item.status === 'Filed'
                                ? '#E6F4EA'
                                : item.status === 'Overdue'
                                ? '#FEE2E2'
                                : item.status === 'Ready To File'
                                ? '#E8F0FE'
                                : '#F1F3F4',
                            color:
                              item.status === 'Filed'
                                ? '#137333'
                                : item.status === 'Overdue'
                                ? '#D32F2F'
                                : item.status === 'Ready To File'
                                ? '#1A73E8'
                                : '#5F6368',
                          }}>
                            {item.status}
                          </span>
                        );
                      } else if (col.key === 'reviewer') {
                        tdStyle = { ...tdStyle, color: '#2A1628', fontWeight: 600 };
                      } else if (col.key === 'dueDate') {
                        tdStyle = { ...tdStyle, fontWeight: 600 };
                      } else if (col.key === 'risk') {
                        tdContent = (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
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
                          }}>
                            {item.risk}
                          </span>
                        );
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
                            textAlign: col.align as 'left' | 'right' | 'center' || tdStyle.textAlign,
                          }}
                        >
                          {tdContent}
                        </td>
                      );
                    })}
                    <td
                      style={{ padding: '0.625rem 1rem', textAlign: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Three Dot Action Dropdown */}
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          type="button"
                          className="action-btn-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenuId === item.id) {
                              setActiveMenuId(null);
                              setMenuPos(null);
                              setMenuItem(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setActiveMenuId(item.id);
                              setMenuPos({ top: rect.bottom + 6, left: rect.right });
                              setMenuItem(item);
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'rgba(42,22,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(42,22,40,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {pagedData.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(42,22,40,0.4)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem', opacity: 0.3 }}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)' }}>No VAT returns found</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Try adjusting your filters or search query.</div>
            </div>
          )}
        </div>

        <Pagination
          totalItems={filteredData.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          itemLabel="returns"
        />
      </div>

      {/* ── 9. SVG ANALYTICS DASHBOARD ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
        {/* Trend Area Chart */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1.25rem' }}>Filing & Tax Position Trends</h3>
          <div style={{ display: 'flex', flexDirection: 'column', height: '220px', justifyContent: 'space-between', position: 'relative' }}>
            <svg width="100%" height="180px" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8760A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#E8760A" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 100 L 0 75 L 80 50 L 160 60 L 245 35 L 330 48 L 415 25 L 500 10 L 500 100 Z" fill="url(#gold-grad)" />
              <path d="M 0 75 L 80 50 L 160 60 L 245 35 L 330 48 L 415 25 L 500 10" fill="none" stroke="#E8760A" strokeWidth="2.5" />
              <circle cx="80" cy="50" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="160" cy="60" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="245" cy="35" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="330" cy="48" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="415" cy="25" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
              <circle cx="500" cy="10" r="3.5" fill="#E8760A" stroke="#ffffff" strokeWidth="1" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)' }}>
              <span>Dec 2025</span>
              <span>Jan 2026</span>
              <span>Feb 2026</span>
              <span>Mar 2026</span>
              <span>Apr 2026</span>
              <span>May 2026</span>
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
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3" strokeDasharray={`${analyticsRes?.data?.accuracyTrend?.[analyticsRes.data.accuracyTrend.length - 1] || 98} ${100 - (analyticsRes?.data?.accuracyTrend?.[analyticsRes.data.accuracyTrend.length - 1] || 98)}`} />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2A1628', lineHeight: 1 }}>{analyticsRes?.data?.accuracyTrend?.[analyticsRes.data.accuracyTrend.length - 1] || 98}%</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.45)', marginTop: '4px' }}>Audited Clean</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, marginLeft: '1.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Clean Filings</span>
                <strong>{analyticsRes?.data?.accuracyTrend?.[analyticsRes.data.accuracyTrend.length - 1] || 98}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Warning Flagged</span>
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

      {/* ── FLOATING ACTION MENU PORTAL ── */}
      {activeMenuId && menuPos && menuItem && (
        <Portal>
          {/* Invisible overlay to close on outside click */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
            onClick={() => { setActiveMenuId(null); setMenuPos(null); setMenuItem(null); }}
          />
          <div
            style={{
              position: 'fixed',
              top: Math.min(menuPos.top, window.innerHeight - 320),
              left: Math.min(menuPos.left - 210, window.innerWidth - 220),
              background: '#ffffff',
              border: '1px solid #E5DDD8',
              borderRadius: '12px',
              boxShadow: '0 16px 48px rgba(42,22,40,0.16)',
              zIndex: 99999,
              minWidth: '210px',
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '4px',
              fontFamily: 'Inter, sans-serif',
            }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { label: 'Open VAT Drawer', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>, action: () => setDrawerTxId(menuItem.id) },
              { label: 'View VAT Summary', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, action: () => pushToast('VAT Summary loaded.', 'info') },
              { label: 'Validate Return', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, action: () => setPopup({ type: 'validation', tx: menuItem }) },
              { label: 'Generate VAT Return', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, action: () => pushToast('VAT Return Generated.', 'success') },
              { label: 'Submit Return', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, action: () => setPopup({ type: 'submit', tx: menuItem }) },
              { label: 'Download PDF', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, action: () => pushToast('PDF download started.', 'info') },
              { label: 'Download Excel', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18M3 14h18"/></svg>, action: () => pushToast('Excel download started.', 'info') },
              { label: 'Export XML', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, action: () => pushToast('XML export started.', 'info') },
              { label: 'View Transactions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, action: () => { setDrawerTxId(menuItem.id); setDrawerTab('transactions'); } },
              { label: 'Audit Log', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, action: () => { setDrawerTxId(menuItem.id); setDrawerTab('activity'); } },
              { label: 'Notes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, action: () => setPopup({ type: 'notes', tx: menuItem }) },
              { label: 'Open Client', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, action: () => pushToast(`Opening client: ${menuItem.client}`, 'info') },
              { label: 'Archive', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, action: () => { handleUpdateStatusBulk('Archived'); pushToast('Return archived.', 'info'); } },
              { label: 'Delete Return', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>, action: () => setPopup({ type: 'delete', tx: menuItem }), danger: true },
            ].map((mi) => (
              <div
                key={mi.label}
                onClick={() => { mi.action(); setActiveMenuId(null); setMenuPos(null); setMenuItem(null); }}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  color: (mi as { danger?: boolean }).danger ? '#EF4444' : '#2A1628',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = (mi as { danger?: boolean }).danger ? 'rgba(239,68,68,0.06)' : 'rgba(232,118,10,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', color: (mi as { danger?: boolean }).danger ? '#EF4444' : '#E8760A' }}>{mi.icon}</span>
                {mi.label}
              </div>
            ))}
          </div>
        </Portal>
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
            zIndex: 950,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#ffffff',
              height: '100%',
              boxShadow: '-10px 0 40px rgba(42,22,40,0.15)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>VAT Return details</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#2A1628' }}>
                  {activeTx.client}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#E8760A', fontWeight: 600, marginTop: '0.15rem' }}>
                  VAT Return {activeTx.quarter} {activeTx.year}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerTxId(null)}
                style={{ background: 'rgba(42,22,40,0.04)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}
              >
                ✕
              </button>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(42,22,40,0.06)' }} />

            {/* Tab strip with scroll arrows */}
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', borderBottom: '1px solid rgba(42,22,40,0.06)', background: '#FAF8F5', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => scrollVatDrawerTabs('left')}
                title="Scroll left"
                style={{
                  background: '#ffffff',
                  border: 'none',
                  borderRight: '1px solid rgba(42,22,40,0.08)',
                  cursor: 'pointer',
                  padding: '0.6rem 0.6rem',
                  color: '#2A1628',
                  fontSize: '1rem',
                  fontWeight: 800,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '2px 0 6px rgba(0,0,0,0.04)'
                }}
              >
                ‹
              </button>

              <div
                ref={vatDrawerTabRef}
                className="client-table-scroll"
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.4rem 1rem',
                }}
              >
                {[
                  { key: 'overview' as const, label: 'Overview' },
                  { key: 'transactions' as const, label: 'Transactions' },
                  { key: 'breakdown' as const, label: 'Breakdown' },
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
                        padding: '0.5rem 0.25rem',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        background: 'transparent',
                        color: isTab ? '#E8760A' : 'rgba(42,22,40,0.6)',
                        fontSize: '0.8125rem',
                        fontWeight: isTab ? 700 : 600,
                        cursor: 'pointer',
                        borderBottom: isTab ? '2.5px solid #E8760A' : '2.5px solid transparent',
                        whiteSpace: 'nowrap',
                        fontFamily: 'inherit',
                        flexShrink: 0,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollVatDrawerTabs('right')}
                title="Scroll right"
                style={{
                  background: '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid rgba(42,22,40,0.08)',
                  cursor: 'pointer',
                  padding: '0.6rem 0.6rem',
                  color: '#2A1628',
                  fontSize: '1rem',
                  fontWeight: 800,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '-2px 0 6px rgba(0,0,0,0.04)'
                }}
              >
                ›
              </button>
            </div>

            {/* Tab Body */}
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
              {drawerTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Client Name</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>{activeTx.client}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>TRN Number</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>{activeTx.trn}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Filing Quarter</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>{activeTx.quarter} {activeTx.year}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Filing Status</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: activeTx.status === 'Filed' ? '#047857' : '#E8760A', marginTop: '0.2rem' }}>{activeTx.status}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Reviewer</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>{activeTx.reviewer}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Due Date</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>{activeTx.dueDate}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>Last Modified</label>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>2026-06-09 14:23</div>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(42,22,40,0.06)' }} />

                  {/* Summary Box */}
                  <div style={{ background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.12)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>Net VAT Payable</span>
                      <strong style={{ fontSize: '1rem', color: '#2A1628' }}>AED {activeTx.netVat.toLocaleString()}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', lineHeight: 1.3 }}>
                      This represents output liabilities minus Input credits logged during the filing quarter.
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'transactions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit' }}
                    />
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      Filter
                    </button>
                    <button onClick={() => pushToast('Transactions exported.', 'success')} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export
                    </button>
                  </div>

                  {drawerTransactions.map((tx: any) => (
                    <div key={tx.id} style={{ padding: '0.85rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.04)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{tx.description}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>{tx.date} • Ref: {tx.reference}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: tx.type === 'Sale' ? '#2A1628' : '#047857' }}>
                          {tx.type === 'Sale' ? '+' : '-'} AED {tx.grossAmount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>VAT: AED {tx.vatAmount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'breakdown' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Sales (from ledger transactions)</span>
                    <strong>AED {(drawerBreakdown?.sales ?? 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Purchases (from ledger transactions)</span>
                    <strong>AED {(drawerBreakdown?.purchases ?? 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Output VAT (from ledger transactions)</span>
                    <strong>AED {(drawerBreakdown?.outputVatFromTxs ?? 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Input VAT (from ledger transactions)</span>
                    <strong>AED {(drawerBreakdown?.inputVatFromTxs ?? 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Ledger Transaction Count</span>
                    <strong>{drawerBreakdown?.transactionCount ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Output VAT (Filed Return)</span>
                    <strong>AED {activeTx.outputVat.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(42,22,40,0.08)', paddingBottom: '0.5rem' }}>
                    <span>Input VAT (Filed Return)</span>
                    <strong>AED {activeTx.inputVat.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                    <span style={{ fontWeight: 700 }}>Net VAT Balance</span>
                    <strong style={{ color: '#E8760A', fontSize: '0.95rem' }}>AED {activeTx.netVat.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {drawerTab === 'validation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(() => {
                    const passed = drawerValidationChecks.filter((c: any) => c.status === 'pass').length;
                    const totalChecks = drawerValidationChecks.length || 1;
                    const pct = Math.round((passed / totalChecks) * 100);
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: pct === 100 ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${pct === 100 ? '#DCFCE7' : '#FED7AA'}`, borderRadius: '12px', padding: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: pct === 100 ? '#15803d' : '#c2410c' }}>{pct}%</div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: pct === 100 ? '#166534' : '#9a3412' }}>Rule checks passed</div>
                          <div style={{ fontSize: '0.7rem', color: pct === 100 ? '#15803d' : '#c2410c' }}>Passed {passed}/{drawerValidationChecks.length} checks</div>
                        </div>
                      </div>
                    );
                  })()}

                  {drawerValidationChecks.map((chk: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', border: '1px solid rgba(42,22,40,0.05)', borderRadius: '10px', background: '#FAF8F5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.8125rem' }}>{chk.label}</strong>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: chk.status === 'pass' ? '#047857' : chk.status === 'warning' ? '#c2410c' : '#C5221F' }}>{chk.status.toUpperCase()}</span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', lineHeight: 1.3 }}>{chk.detail}</p>
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
                        <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>by {step.actor || 'System'} • {step.timestamp ? step.timestamp.split('T')[0] : 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {drawerActivityLog.map((act: any, idx: number) => {
                    const actionText = String(act?.action || act?.act || 'Activity');
                    const isApproved = actionText.includes('Filed') || actionText.includes('Approved');
                    const isCreated = actionText.includes('Created') || actionText.includes('Imported');
                    const isRejected = actionText.includes('Rejected') || actionText.includes('Failed');
                    const badgeBg = isApproved ? '#E6F4EA' : isCreated ? '#E8F0FE' : isRejected ? '#FCE8E6' : '#FFF0E2';
                    const badgeColor = isApproved ? '#137333' : isCreated ? '#1A73E8' : isRejected ? '#C5221F' : '#E8760A';
                    return (
                      <div key={idx} style={{ padding: '0.6rem 0.75rem', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.03)', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
                          <span style={{ background: badgeBg, color: badgeColor, padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700 }}>
                            {actionText}
                          </span>
                          <span style={{ color: 'rgba(42,22,40,0.45)' }}>{act.timestamp ? act.timestamp.split('T')[0] : ''}</span>
                        </div>
                        <div style={{ marginTop: '0.35rem', color: 'rgba(42,22,40,0.6)' }}>
                          User: {act.user} • Old: &quot;{act.oldVal}&quot; • New: &quot;{act.newVal}&quot;
                        </div>
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
                      addVatDocument({ id: activeTx.id, name, type: 'Supporting Doc' })
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
                    onClick={() => pushToast('VAT Return data sync to QuickBooks started.', 'success')}
                    style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Sync to QuickBooks Online
                  </button>
                  <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem' }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Auto-sync configuration</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        'Automatically sync on return approval',
                        'Sync attached documents and audit logs',
                        'Map zero-rated categories to tax codes'
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
                      placeholder="Type a new internal audit note..."
                      value={quickVatNote}
                      onChange={(e) => setQuickVatNote(e.target.value)}
                      style={{ width: '100%', minHeight: '80px', padding: '0.625rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <button
                      type="button"
                      disabled={!quickVatNote.trim()}
                      onClick={() => {
                        if (!activeTx || !quickVatNote.trim()) return;
                        addVatNote({ id: activeTx.id, body: quickVatNote })
                          .unwrap()
                          .then(() => {
                            setQuickVatNote('');
                            pushToast('Note added successfully.', 'success');
                          })
                          .catch(() => pushToast('Failed to add note.', 'danger'));
                      }}
                      style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', width: 'fit-content', alignSelf: 'flex-end', fontSize: '0.75rem', fontWeight: 700, cursor: quickVatNote.trim() ? 'pointer' : 'not-allowed', opacity: quickVatNote.trim() ? 1 : 0.6, fontFamily: 'inherit' }}
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
                disabled={isFilingVat}
                onClick={() => {
                  if (activeTx.status === 'Filed') {
                    const apiHost = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:5000/api/v1';
                    const link = document.createElement('a');
                    link.href = `${apiHost}/vat/export?format=xlsx&ids=${activeTx.id}`;
                    link.download = `VAT_Return_${activeTx.client.replace(/\s+/g, '_')}_${activeTx.quarter}_${activeTx.year}.xlsx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    pushToast(`Downloading filed VAT Return statement for ${activeTx.client}...`, 'success');
                  } else {
                    fileReturn({ id: activeTx.id })
                      .unwrap()
                      .then(() => {
                        setDrawerTxId(null);
                        pushToast(`Return marked as Filed.`, 'success');
                      })
                      .catch(() => pushToast('Failed to file VAT return.', 'danger'));
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  background: isFilingVat ? 'rgba(232,118,10,0.7)' : (activeTx.status === 'Filed' ? '#137333' : '#E8760A'),
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: isFilingVat ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isFilingVat ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Filing Return...
                  </>
                ) : activeTx.status === 'Filed' ? (
                  'Download Filed Return'
                ) : (
                  'Approve & File Return'
                )}
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

      {/* ── 10. ENTERPRISE POPUPS (LOCAL MODALS) ── */}

      {/* ── 10. ENTERPRISE POPUPS (LOCAL MODALS) ── */}

      {/* Modal: Import VAT Data */}
      {popup.type === 'import' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="VAT Center"
          titlePlain="Import VAT"
          titleAccent="Ledger"
          maxWidth="800px"
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
                onClick={handleImportData}
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
                  fontFamily: 'inherit'
                }}
              >
                Import Ledger
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
                  padding: '2.5rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: importFile ? 'rgba(4,120,87,0.02)' : '#FAF8F5',
                  transition: 'all 0.15s ease'
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
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: '#2A1628' }}>
                    {importFile ? importFile : 'Drag & drop your VAT statement spreadsheet here'}
                  </strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: importFile ? '#047857' : 'rgba(42,22,40,0.45)', fontWeight: importFile ? 600 : 500 }}>
                    {importFile ? 'File selected — click to replace' : 'Supports XLS, XLSX, CSV formats'}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                border: '1.5px dashed #DDD0C4',
                borderRadius: '12px',
                padding: '2.5rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                background: '#FAF8F5'
              }}>
                {importFile ? (
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
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)', maxWidth: '300px' }}>
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
            )}

            <div style={{ background: '#FFFDF9', border: '1px solid #FFE7D0', borderRadius: '12px', padding: '1rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.7)', lineHeight: 1.4 }}>
              Supported columns required: <span style={{ color: 'rgba(42,22,40,0.45)' }}>Date, Description, Gross, VAT Amount, Rate, Type (Sale/Purchase)</span>. <span style={{ color: '#E8760A', fontWeight: 600, cursor: 'pointer' }}>Download template →</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>Filing Quarter</label>
                <CustomSelect
                  value={importQuarter}
                  onChange={setImportQuarter}
                  options={QUARTERS}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>TRN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 100556789600003"
                  value={importTrn}
                  onChange={(e) => setImportTrn(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal: Create VAT Return */}
      {popup.type === 'create' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="VAT Center"
          titlePlain="Create VAT"
          titleAccent="Return Cycle"
          maxWidth="800px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateReturn}
                style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Create Return
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. ABC Trading LLC"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>TRN / VAT No.</label>
                <input
                  type="text"
                  placeholder="e.g. 100556789600003"
                  value={newFormTrn}
                  onChange={(e) => setNewFormTrn(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Filing Quarter</label>
                <CustomSelect
                  value={newFormQuarter}
                  onChange={setNewFormQuarter}
                  options={QUARTERS}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Filing Year</label>
                <CustomSelect
                  value={newFormYear}
                  onChange={setNewFormYear}
                  options={YEARS}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>VAT Type</label>
                <CustomSelect
                  value={newFormType}
                  onChange={(val) => setNewFormType(val as 'Mainland' | 'Free Zone')}
                  options={['Mainland', 'Free Zone']}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Output VAT (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newFormOutput}
                  onChange={(e) => setNewFormOutput(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Input VAT (AED)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newFormInput}
                  onChange={(e) => setNewFormInput(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Assign Reviewer</label>
                <CustomSelect
                  value={newFormReviewer}
                  onChange={setNewFormReviewer}
                  options={dynamicReviewers}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Assign Manager</label>
                <CustomSelect
                  value={newFormManager}
                  onChange={setNewFormManager}
                  options={dynamicManagers}
                />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal: Export Center */}
      {popup.type === 'export' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="VAT Center"
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
                    const apiHost = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : 'http://localhost:5000/api/v1';
                    let idsQuery = '';
                    if (exportScope === 'selected' && selectedIds.length > 0) {
                      idsQuery = `&ids=${selectedIds.join(',')}`;
                    }
                    const fmt = exportFormat === 'csv' ? 'csv' : 'xlsx';
                    const link = document.createElement('a');
                    link.href = `${apiHost}/vat/export?format=${fmt}${idsQuery}`;
                    link.download = `VAT_Returns_Export.${fmt}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setPopup({ type: null });
                    pushToast(`VAT returns export downloaded (${fmt.toUpperCase()}).`, 'success');
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
          <div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Which returns to export?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { key: 'all' as const, label: 'All Returns', sublabel: 'Export all records in the VAT center register', count: stats.all },
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
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#E8760A' : 'rgba(42,22,40,0.4)', background: isSelected ? 'rgba(232,118,10,0.08)' : 'rgba(42,22,40,0.04)', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>
                      {opt.count} returns
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

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
                const isSelected = exportFormat === fmt.key;
                return (
                  <button
                    key={fmt.key}
                    type="button"
                    onClick={() => setExportFormat(fmt.key)}
                    style={{
                      padding: '0.625rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? '#E8760A' : '#DDD0C4'}`,
                      background: isSelected ? 'rgba(232,118,10,0.04)' : '#ffffff',
                      color: isSelected ? '#E8760A' : 'rgba(42,22,40,0.6)',
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

      {/* Modal: Assign Reviewer (Bulk) */}
      {popup.type === 'assign' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="VAT Center"
          titlePlain="Assign"
          titleAccent="Reviewer"
          maxWidth="500px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignReviewerBulk}
                style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Assign Reviewer
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Select Reviewer</label>
              <CustomSelect
                value={assignedReviewerSelection}
                onChange={setAssignedReviewerSelection}
                options={dynamicReviewers}
              />
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal: Validation Errors */}
      {popup.type === 'validation' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Filing Auditor"
          titlePlain="Validation"
          titleAccent="Checks Passed"
          maxWidth="640px"
          footer={
            <button
              type="button"
              onClick={() => setPopup({ type: null })}
              style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Acknowledge Audit
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#E6F4EA', border: '1px solid #A3D7A5', borderRadius: '12px', padding: '1rem', color: '#137333', fontSize: '0.8125rem', fontWeight: 600 }}>
              All 14 compliance audit checks passed successfully for {popup.tx.client}. Zero warnings flagged.
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal: Submit Return */}
      {popup.type === 'submit' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="FTA Filing"
          titlePlain="Submit VAT"
          titleAccent="Return Record"
          maxWidth="500px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  fileReturn({ id: popup.tx!.id })
                    .unwrap()
                    .then(() => {
                      pushToast('VAT Return submitted successfully to FTA portal.', 'success');
                      setPopup({ type: null });
                    })
                    .catch((err) => {
                      pushToast(err?.data?.message || 'Failed to submit VAT return.', 'danger');
                    });
                }}
                style={{ background: '#047857', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Submission
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
            <p style={{ margin: 0 }}>
              You are preparing to submit the Q1 2026 VAT Return for <strong>{popup.tx.client}</strong>. This record is marked as <strong>Ready To File</strong> and audit checks have completed.
            </p>
            <div style={{ padding: '0.75rem', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.04)' }}>
              Net VAT Liability: <strong>AED {popup.tx.netVat.toLocaleString()}</strong>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal: Delete Confirmation */}
      {popup.type === 'delete' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="VAT Center"
          titlePlain="Confirm"
          titleAccent="Deletion"
          maxWidth="500px"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPopup({ type: null })}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReturn(popup.tx!.id)}
                style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete Record
              </button>
            </>
          }
        >
          <div style={{ fontSize: '0.8125rem', color: '#2A1628' }}>
            Are you absolutely sure you want to delete the VAT return record for <strong>{popup.tx.client}</strong>? This action is permanent and cannot be undone.
          </div>
        </ModalShell>
      )}
    </div>
  );
}
