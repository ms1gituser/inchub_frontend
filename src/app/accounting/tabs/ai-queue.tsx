'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import {
  useGetQueueQuery,
  useGetQueueKpisQuery,
  useGetQueueAnalyticsQuery,
  useGetQueueDrawerDetailsQuery,
  useAddQueueItemMutation,
  useUpdateQueueItemMutation,
  useBulkUpdateQueueMutation,
  useImportQueueMutation,
} from '@/lib/aiqueueapi';

// Type definitions
interface QueueItem {
  id: string;
  initials: string;
  avatarBg: string;
  email: string;
  name: string;
  trn: string;
  documentName: string;
  documentType: 'Invoice' | 'Receipt' | 'Bank Statement' | 'Tax Invoice';
  uploadDate: string;
  stage: 'Uploaded' | 'OCR Processing' | 'AI Extraction' | 'Ledger Mapping' | 'Review Required' | 'Approved' | 'Rejected' | 'Exceptions' | 'Ready For Reconciliation' | 'Completed';
  aiConfidence: number;
  ocrStatus: 'Success' | 'Failed' | 'Warning' | 'Pending';
  validationStatus: 'Passed' | 'Failed' | 'Pending' | 'Warning';
  reviewer: string;
  priority: 'High' | 'Medium' | 'Low';
  currentStep: string;
  processingTime: string;
  qbStatus: 'Connected' | 'Error' | 'Disconnected' | 'Syncing';
  lastUpdated: string;
  exceptionType: 'None' | 'Failed OCR' | 'Duplicate Documents' | 'Missing Pages' | 'Unreadable Files' | 'Low AI Confidence' | 'Validation Errors' | 'QuickBooks Errors';
  
  // Filtering & Detail Fields
  manager: string;
  bookkeeper: string;
  industry: string;
  entityType: string;
  country: string;
  financialYear: string;
  uploader: string;
  pages: number;
  size: string;
  ocrText: string;
  ocrConfidence: number;
  detectedLanguage: string;
  ocrWarnings: string[];
  missingFields: string[];
  
  // AI Extracted Values
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxAmount: string;
  vat: string;
  subtotal: string;
  total: string;
  paymentTerms: string;
  category: string;
  glAccountSuggestion: string;

  // Ledger Entries
  ledgerDebit: string;
  ledgerCredit: string;
  suggestedAccount: string;
  accountMapping: string;
  journalPreview: string;
  ledgerStatus: string;
}

// Initial full enterprise queue data


interface CustomSelectProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid #DDD0C4',
          borderRadius: '8px',
          background: '#ffffff',
          fontSize: '0.75rem',
          color: '#2A1628',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        <span>{value}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.15s ease', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1001 }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            marginTop: '4px',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(42,22,40,0.1)',
            zIndex: 1002,
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '4px 0'
          }}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem',
                  border: 'none',
                  background: value === opt ? 'rgba(232,118,10,0.06)' : 'transparent',
                  color: value === opt ? '#E8760A' : '#2A1628',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: value === opt ? 700 : 500,
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  if (value !== opt) e.currentTarget.style.background = '#FAF8F5';
                }}
                onMouseLeave={(e) => {
                  if (value !== opt) e.currentTarget.style.background = 'transparent';
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AiQueueTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [currentTab, setCurrentTab] = useState<'All Jobs' | 'Uploaded' | 'OCR Processing' | 'AI Extraction' | 'Ledger Mapping' | 'Review Required' | 'Approved' | 'Rejected' | 'Exceptions' | 'Ready For Reconciliation' | 'Completed'>('All Jobs');
  
  const [filters, setFilters] = useState({
    client: 'All',
    manager: 'All',
    bookkeeper: 'All',
    industry: 'All',
    entityType: 'All',
    country: 'All',
    financialYear: 'All',
    priority: 'All',
    stage: 'All',
    documentType: 'All',
    aiConfidence: 'All',
    processingStatus: 'All',
    reviewer: 'All',
    qbStatus: 'All',
    exceptionType: 'All',
  });

  const { data: queueRes, isLoading: queueLoading } = useGetQueueQuery({
    page: currentPage,
    limit: rowsPerPage,
    search,
    filters: {
      ...filters,
      stage: currentTab === 'All Jobs' ? undefined : currentTab
    }
  });

  const { data: kpisRes } = useGetQueueKpisQuery();
  const { data: analyticsRes } = useGetQueueAnalyticsQuery();

  const queueList = queueRes?.data || [];
  const totalItems = queueRes?.meta?.total || queueList.length || 0;

  const kpis = kpisRes?.data || {
    totalDocuments: 0,
    averageConfidence: 0,
    exceptionRate: '0%',
    qbSyncErrors: 0
  };

  const analytics = analyticsRes?.data || {
    pipelineFunnel: [],
    operationalDiagnostics: [],
    exceptionsCenter: [],
    queueHealth: [],
    engineDiagnostics: { languages: [], ocrStatus: [] },
    recentExceptions: []
  };

  const [addQueueItem] = useAddQueueItemMutation();
  const [updateQueueItem] = useUpdateQueueItemMutation();
  const [bulkUpdateQueue] = useBulkUpdateQueueMutation();
  const [importQueue] = useImportQueueMutation();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [viewState, setViewState] = useState<'standard' | 'empty' | 'loading' | 'error' | 'success'>('standard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'document' | 'ocr' | 'ai' | 'ledger' | 'validation' | 'timeline' | 'activity'>('overview');
  const { data: drawerDetailsRes } = useGetQueueDrawerDetailsQuery(selectedItem?.id || '', { skip: !selectedItem });
  const drawerDetails = drawerDetailsRes?.data || { ocrText: '', ocrConfidence: 0, aiConfidence: 0, ocrWarnings: [], missingFields: [], timeline: [] };
  
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [uploadOpen, setUploadOpen] = useState(actionParam === 'upload');
  // const [uploadSource, setUploadSource] = useState<'local' | 'drive'>('local');
  // const [hasFileSelected, setHasFileSelected] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkModal, setBulkModal] = useState<{ type: 'reviewer' | 'notes' | null; title: string }>({ type: null, title: '' });
  const [bulkValue, setBulkValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | null }>({ message: '', type: null });

  // Enterprise Upload Modal States
  const [uploadState, setUploadState] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [selectedUploadClients, setSelectedUploadClients] = useState<string[]>(['ABC Trading LLC']);
  const [clientSearch, setClientSearch] = useState('');
  const [uploadedFilesList, setUploadedFilesList] = useState<{ name: string; size: string; pages: number; progress: number }[]>([]);
  const [selectedClassification, setSelectedClassification] = useState<string>('Invoice');
  const [processingOptions, setProcessingOptions] = useState<string[]>([
    'OCR', 'AI Extraction', 'Ledger Mapping', 'Duplicate Detection', 'Tax Validation', 'Auto Categorization', 'QuickBooks Preparation'
  ]);
  const [assignManager, setAssignManager] = useState('Mahesh Maddu');
  const [assignBookkeeper, setAssignBookkeeper] = useState('John Doe');
  const [assignReviewer, setAssignReviewer] = useState('Alex Mercer');
  const [assignPriority, setAssignPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [dueDate, setDueDate] = useState('2026-07-15');
  const [notesText, setNotesText] = useState('');

  // Create Batch Modal States
  const [batchState, setBatchState] = useState<'form' | 'success'>('form');
  const [batchName, setBatchName] = useState('');
  const batchRefCode = 'BAT-2026-Q3-0892';
  const [batchDesc, setBatchDesc] = useState('');
  const [batchFinancialYear, setBatchFinancialYear] = useState('2026');
  const [batchPeriod, setBatchPeriod] = useState('Q3');
  const [batchDepartment, setBatchDepartment] = useState('Corporate Finance');
  const [batchPriority, setBatchPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [selectedBatchClients, setSelectedBatchClients] = useState<string[]>(['ABC Trading LLC']);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>(['Purchase Invoices', 'Receipts', 'Bank Statements']);
  const [batchPipelineOptions, setBatchPipelineOptions] = useState<string[]>([
    'OCR', 'AI Extraction', 'Ledger Mapping', 'Duplicate Detection', 'Tax Validation'
  ]);
  const [batchManager, setBatchManager] = useState('Mahesh Maddu');
  const [batchBookkeeper, setBatchBookkeeper] = useState('John Doe');
  const [batchReviewer, setBatchReviewer] = useState('Alex Mercer');
  const [batchDueDate, setBatchDueDate] = useState('2026-07-20');
  const [batchSla, setBatchSla] = useState('24 Hours');
  const [batchNotes, setBatchNotes] = useState('');
  const [batchIndustryFilter, setBatchIndustryFilter] = useState('All Industries');
  const [batchCountryFilter, setBatchCountryFilter] = useState('All Countries');

  // Export Modal States
  const [exportState, setExportState] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [exportScope, setExportScope] = useState<'entire' | 'filtered' | 'selected' | 'stage'>('entire');
  const [exportStageVal, setExportStageVal] = useState('Uploaded');
  const [exportFields, setExportFields] = useState<string[]>([
    'Client Information', 'Document Information', 'OCR Results', 'AI Extracted Fields',
    'Ledger Mapping', 'Validation Results', 'Reviewer Information', 'Processing Timeline', 'Queue Status'
  ]);
  const [exportDateRange, setExportDateRange] = useState('This Month');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'pdf' | 'print' | 'json'>('xlsx');
  const [exportOptions, setExportOptions] = useState<string[]>(['Include Summary']);

  // Custom Toast helper
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  // Filter list options
  const filterOptions = {
    client: ['All', 'ABC Trading LLC', 'XYZ Holdings Limited', 'Delta Properties FZCO', 'Alpha Tech FZCO', 'Beta Industries LLC', 'Gamma Solutions FZCO'],
    manager: ['All', 'Mahesh Maddu', 'Priya Nair', 'Rohit Sharma', 'Sneha Iyer'],
    bookkeeper: ['All', 'John Doe', 'Emma Watson', 'Alex Mercer', 'Liam Neeson', 'Sarah Khan'],
    industry: ['All', 'Trading & Retail', 'Technology', 'Real Estate', 'Manufacturing', 'Logistics'],
    entityType: ['All', 'LLC', 'FZCO', 'FZE'],
    country: ['All', 'UAE', 'Saudi Arabia'],
    financialYear: ['All', '2026', '2025'],
    priority: ['All', 'High', 'Medium', 'Low'],
    stage: ['All', 'Uploaded', 'OCR Processing', 'AI Extraction', 'Ledger Mapping', 'Review Required', 'Approved', 'Rejected', 'Exceptions', 'Ready For Reconciliation', 'Completed'],
    documentType: ['All', 'Invoice', 'Receipt', 'Bank Statement', 'Tax Invoice'],
    aiConfidence: ['All', 'High (>80%)', 'Medium (50-80%)', 'Low (<50%)'],
    processingStatus: ['All', 'Success', 'Warning', 'Failed', 'Pending'],
    reviewer: ['All', 'Alex Mercer', 'Emma Watson', 'Liam Neeson', 'Sarah Khan', 'John Doe'],
    qbStatus: ['All', 'Connected', 'Error', 'Disconnected', 'Syncing'],
    exceptionType: ['All', 'None', 'Failed OCR', 'Duplicate Documents', 'Missing Pages', 'Unreadable Files', 'Low AI Confidence', 'Validation Errors', 'QuickBooks Errors']
  };

  // Main Filter Handler
  const filteredQueue = queueList;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredQueue.map((c: QueueItem) => c.id));
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

  // Row Action Functions
  const handleApprove = async (id: string) => {
    try {
      await updateQueueItem({ id, body: { stage: 'Approved', validationStatus: 'Passed' } }).unwrap();
      triggerToast('Bookkeeping job approved successfully!', 'success');
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to approve job', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateQueueItem({ id, body: { stage: 'Rejected', validationStatus: 'Failed' } }).unwrap();
      triggerToast('Bookkeeping job rejected.', 'error');
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to reject job', 'error');
    }
  };

  const handleMoveToRecon = async (id: string) => {
    try {
      await updateQueueItem({ id, body: { stage: 'Ready For Reconciliation' } }).unwrap();
      triggerToast('Moved job to Reconciliation Center.', 'success');
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to move job', 'error');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await updateQueueItem({ id, body: { stage: 'OCR Processing', ocrStatus: 'Pending', aiConfidence: 75 } }).unwrap();
      triggerToast('Retrying processing job...', 'info');
    } catch (err: any) {
      triggerToast(err?.data?.message || 'Failed to retry job', 'error');
    }
  };

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
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .grid-funnel-step {
          position: relative;
          background: #FAF8F5;
          border: 1px solid rgba(42,22,40,0.06);
          border-radius: 8px;
          padding: 0.625rem;
          text-align: center;
          font-weight: 700;
          font-size: 0.75rem;
          color: #2A1628;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        @keyframes rotate-spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── BREADCRUMB & HEADER SECTION ── */}
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
            Monitor, validate and manage AI-powered bookkeeping jobs across all clients.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setUploadOpen(true)} style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Documents
          </button>
          <button onClick={() => setBatchOpen(true)} style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
            Create Batch
          </button>
          <button onClick={() => setExportOpen(true)} style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Queue
          </button>
          <button onClick={() => { triggerToast('Workflow queue refreshed.', 'info'); }} style={{ background: '#2A1628', color: '#ffffff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Refresh
          </button>
        </div>
      </div>


      {/* ── EMAIL WEBHOOK INGESTION CARD ── */}
      <div style={{
        background: '#FAF8F5',
        border: '1px solid #DDD0C4',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(42,22,40,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(232,118,10,0.1)', color: '#E8760A', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ margin: 'auto' }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Inbound Email Document Ingestion</h4>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>
              Forward receipts or PDF invoices to your workspace email to automatically feed the AI queue:
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
          <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8760A', fontFamily: 'monospace' }}>
            ocr-tenant-alpha@inchub-incoming.com
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText('ocr-tenant-alpha@inchub-incoming.com');
              triggerToast('Email address copied to clipboard!', 'success');
            }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(42,22,40,0.4)', padding: 0 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
        </div>
      </div>

      {/* ── TOP KPI CARDS ── */}
      <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { label: 'Uploaded Today', value: kpis.uploadedToday, sub: 'Last: 5m ago', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
          { label: 'Retries Triggered', value: kpis.retriesTriggered, sub: 'Recalculated OCR', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> },
          { label: 'Manual Reviews', value: kpis.manualReviews, sub: 'Awaiting approval', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: 'Failed Jobs', value: kpis.failedJobs, sub: 'OCR/Ledger errors', color: '#EF4444', bg: 'rgba(239,68,68,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
          { label: 'Duplicate Docs', value: kpis.duplicateDocs, sub: 'Identical uploads', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg> },
          { label: 'Avg Processing Time', value: kpis.avgProcessingTime, sub: 'Queue throughput', color: '#047857', bg: 'rgba(4,120,87,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: 'Waiting For Review', value: kpis.waitingForReview, sub: 'High Priority focus', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label: 'Approved Today', value: kpis.approvedToday, sub: 'Auto-posted QBO', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Ledger Ready', value: kpis.ledgerReady, sub: 'Accounts mapped', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5V4.5z"/></svg> },
          { label: 'Reconciliation Ready', value: kpis.reconciliationReady, sub: 'Pushed to center', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
          { label: 'QuickBooks Ready', value: kpis.quickbooksReady, sub: 'Sync endpoints', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> },
          { label: 'Urgent Exceptions', value: kpis.urgentExceptions, sub: 'Review required', color: '#E8760A', bg: 'rgba(232,118,10,0.06)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/></svg> }
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
            minWidth: '160px',
            minHeight: '105px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color, flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QUEUE STATUS TABS ── */}
      <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'All Jobs', label: 'All Jobs', count: queueList.length },
          { id: 'Uploaded', label: 'Uploaded', count: queueList.filter((c: QueueItem) => c.stage === 'Uploaded').length },
          { id: 'OCR Processing', label: 'OCR Processing', count: queueList.filter((c: QueueItem) => c.stage === 'OCR Processing').length },
          { id: 'AI Extraction', label: 'AI Extraction', count: queueList.filter((c: QueueItem) => c.stage === 'AI Extraction').length },
          { id: 'Ledger Mapping', label: 'Ledger Mapping', count: queueList.filter((c: QueueItem) => c.stage === 'Ledger Mapping').length },
          { id: 'Review Required', label: 'Review Required', count: queueList.filter((c: QueueItem) => c.stage === 'Review Required').length },
          { id: 'Approved', label: 'Approved', count: queueList.filter((c: QueueItem) => c.stage === 'Approved').length },
          { id: 'Rejected', label: 'Rejected', count: queueList.filter((c: QueueItem) => c.stage === 'Rejected').length },
          { id: 'Exceptions', label: 'Exceptions', count: queueList.filter((c: QueueItem) => c.stage === 'Exceptions').length },
          { id: 'Ready For Reconciliation', label: 'Ready For Reconciliation', count: queueList.filter((c: QueueItem) => c.stage === 'Ready For Reconciliation').length },
          { id: 'Completed', label: 'Completed', count: queueList.filter((c: QueueItem) => c.stage === 'Completed').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as 'All Jobs' | 'Uploaded' | 'OCR Processing' | 'AI Extraction' | 'Ledger Mapping' | 'Review Required' | 'Approved' | 'Rejected' | 'Exceptions' | 'Ready For Reconciliation' | 'Completed')}
            style={{ padding: '0.375rem 0.875rem', borderRadius: '20px', border: currentTab === tab.id ? '1.5px solid #E8760A' : '1px solid #DDD0C4', background: currentTab === tab.id ? 'rgba(232,118,10,0.06)' : '#ffffff', color: currentTab === tab.id ? '#E8760A' : 'rgba(42,22,40,0.6)', fontWeight: currentTab === tab.id ? 700 : 500, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 150ms ease', fontFamily: 'Inter, sans-serif' }}
          >
            {tab.label}
            <span style={{ background: currentTab === tab.id ? '#E8760A' : 'rgba(42,22,40,0.08)', color: currentTab === tab.id ? '#fff' : 'rgba(42,22,40,0.5)', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', lineHeight: 1.5 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── SMART FILTER BAR ── */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {/* Global search */}
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.35)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search client name, doc ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '0.45rem 1rem 0.45rem 2.25rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', outline: 'none', color: '#2A1628', boxSizing: 'border-box' }} />
          </div>

          {/* Filter keys */}
          {([
            { label: 'Client', key: 'client' },
            { label: 'Manager', key: 'manager' },
            { label: 'Bookkeeper', key: 'bookkeeper' },
            { label: 'Priority', key: 'priority' },
            { label: 'Doc Type', key: 'documentType' },
            { label: 'Confidence', key: 'aiConfidence' },
            { label: 'Reviewer', key: 'reviewer' },
            { label: 'Exception', key: 'exceptionType' },
          ] as const).map((f) => {
            const isOpen = activeDropdown === f.key;
            const selectedVal = filters[f.key];
            const options = filterOptions[f.key];
            return (
              <div key={f.key} style={{ position: 'relative' }}>
                <button onClick={() => setActiveDropdown(isOpen ? null : f.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${selectedVal !== 'All' ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: selectedVal !== 'All' ? 'rgba(232,118,10,0.04)' : '#FAF8F5', color: selectedVal !== 'All' ? '#E8760A' : '#2A1628', cursor: 'pointer', fontWeight: selectedVal !== 'All' ? 700 : 500, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                  <span>{f.label}: {selectedVal}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {isOpen && (
                   <div className="no-scrollbar" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 8px 24px rgba(42,22,40,0.08)', zIndex: 100, minWidth: '160px', padding: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                    {options.map((opt) => (
                      <div key={opt} onClick={() => { setFilters({ ...filters, [f.key]: opt }); setActiveDropdown(null); }} style={{ padding: '0.4rem 0.625rem', fontSize: '0.75rem', color: '#2A1628', cursor: 'pointer', borderRadius: '6px', background: selectedVal === opt ? 'rgba(232, 118, 10, 0.06)' : 'transparent', fontWeight: selectedVal === opt ? 600 : 400 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 118, 10, 0.06)'; e.currentTarget.style.color = '#E8760A'; }} onMouseLeave={e => { e.currentTarget.style.background = selectedVal === opt ? 'rgba(232, 118, 10, 0.06)' : 'transparent'; e.currentTarget.style.color = '#2A1628'; }}>{opt}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          <button onClick={() => { setSearch(''); setFilters({ client: 'All', manager: 'All', bookkeeper: 'All', industry: 'All', entityType: 'All', country: 'All', financialYear: 'All', priority: 'All', stage: 'All', documentType: 'All', aiConfidence: 'All', processingStatus: 'All', reviewer: 'All', qbStatus: 'All', exceptionType: 'All' }); }} style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#FAF8F5', color: 'rgba(42,22,40,0.5)', cursor: 'pointer', fontWeight: 600 }}>Reset Filters</button>
          <button onClick={() => { triggerToast('Smart View saved to toolbar.', 'success'); }} style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', border: '1px solid #E8760A', borderRadius: '8px', background: 'rgba(232,118,10,0.06)', color: '#E8760A', cursor: 'pointer', fontWeight: 700, marginLeft: 'auto' }}>Save View</button>
        </div>
      </div>

      {/* ── BULK ACTIONS TOOLBAR ── */}
      {selectedRows.length > 1 && (
        <div className="no-scrollbar" style={{ background: '#2A1628', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.25rem', flexShrink: 0 }}>
            {selectedRows.length} jobs selected
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'Assign Reviewer', ic: '👤', onClick: () => setBulkModal({ type: 'reviewer', title: 'Assign Reviewer' }) },
              { label: 'Approve Selected', ic: '✅', onClick: async () => { try { await bulkUpdateQueue({ ids: selectedRows, action: 'stage', value: 'Approved' }).unwrap(); setSelectedRows([]); triggerToast('Approved selected jobs!', 'success'); } catch (e) {} } },
              { label: 'Reject Selected', ic: '❌', onClick: async () => { try { await bulkUpdateQueue({ ids: selectedRows, action: 'stage', value: 'Rejected' }).unwrap(); setSelectedRows([]); triggerToast('Rejected selected jobs.', 'error'); } catch (e) {} } },
              { label: 'Retry OCR', ic: '🔄', onClick: async () => { try { await bulkUpdateQueue({ ids: selectedRows, action: 'stage', value: 'OCR Processing' }).unwrap(); setSelectedRows([]); triggerToast('Retrying processing for selected files.', 'info'); } catch (e) {} } },
              { label: 'Move to Recon', ic: '📤', onClick: async () => { try { await bulkUpdateQueue({ ids: selectedRows, action: 'stage', value: 'Ready For Reconciliation' }).unwrap(); setSelectedRows([]); triggerToast('Pushed selected items to Reconciliation.', 'success'); } catch (e) {} } },
              { label: 'Export Batch', ic: '📥', onClick: () => { triggerToast('Export batch prepared.', 'success'); } },
              { label: 'Archive', ic: '🗄️', onClick: async () => { try { await bulkUpdateQueue({ ids: selectedRows, action: 'delete' }).unwrap(); setSelectedRows([]); triggerToast('Archived selected rows.', 'info'); } catch (e) {} } },
              { label: 'Delete', ic: '🗑️', onClick: async () => { try { await bulkUpdateQueue({ ids: selectedRows, action: 'delete' }).unwrap(); setSelectedRows([]); triggerToast('Deleted selected rows.', 'error'); } catch (e) {} } },
              { label: 'AI Review Run', ic: '🤖', onClick: () => { triggerToast('Triggered bulk AI validation review.', 'info'); } },
              { label: 'Add Notes', ic: '📝', onClick: () => setBulkModal({ type: 'notes', title: 'Add Bulk Notes' }) }
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.3rem 0.6rem', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif', transition: 'background 120ms', whiteSpace: 'nowrap', flexShrink: 0 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                <span style={{ fontSize: '0.6rem' }}>{btn.ic}</span>{btn.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedRows([])} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', flexShrink: 0, paddingLeft: '0.5rem' }}>✕ Clear</button>
        </div>
      )}

      {/* ── PRESENTATION VIEW STATES ── */}
      {viewState === 'empty' && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '300px' }}>
          <div style={{ fontSize: '3rem', color: '#E8760A', marginBottom: '1rem' }}>📥</div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#2A1628' }}>No Bookkeeping Jobs Found</h3>
          <p style={{ margin: '0.5rem 0 1.5rem', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)', maxWidth: '360px' }}>Upload trade invoices, expense receipts or bank records to start the AI ledger creation pipeline.</p>
          <button onClick={() => setUploadOpen(true)} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Upload First Document</button>
        </div>
      )}

      {(viewState === 'loading' || queueLoading) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ height: '80px', background: 'linear-gradient(90deg, #f5f5f5 25%, #e9e9e9 37%, #f5f5f5 63%)', backgroundSize: '400% 100%', animation: 'skeleton-load 1.4s ease infinite', borderRadius: '12px' }} />
            ))}
          </div>
          <div style={{ height: '300px', background: 'linear-gradient(90deg, #f5f5f5 25%, #e9e9e9 37%, #f5f5f5 63%)', backgroundSize: '400% 100%', animation: 'skeleton-load 1.4s ease infinite', borderRadius: '16px' }} />
          <style>{`
            @keyframes skeleton-load {
              0% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
        </div>
      )}

      {viewState === 'error' && (
        <div style={{ background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: '#EF4444', marginBottom: '0.75rem' }}>⚠️</div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#991B1B' }}>Workflow Pipeline Offline</h3>
          <p style={{ margin: '0.5rem 0 1.25rem', fontSize: '0.8125rem', color: '#B91C1C', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>The OCR Engine or LLM token validation endpoint reported a handshake failure (Exit code 503). Retrying the queue may resolve connection issues.</p>
          <button onClick={() => { setViewState('standard'); triggerToast('System status check passed.', 'success'); }} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Retry Connection</button>
        </div>
      )}

      {viewState === 'success' && (
        <div style={{ background: '#E6F4EA', border: '1px solid rgba(4,120,87,0.2)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#047857', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', animation: 'success-pop 300ms ease' }}>✓</div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#137333' }}>All Batches Fully Processed!</h3>
          <p style={{ margin: '0.5rem 0 1.25rem', fontSize: '0.8125rem', color: '#137333', maxWidth: '360px' }}>AI bookkeeping extraction has finished with zero errors or validation warnings. QuickBooks sync completed successfully.</p>
          <button onClick={() => setViewState('standard')} style={{ background: '#137333', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Return to Dashboard</button>
          <style>{`
            @keyframes success-pop {
              0% { transform: scale(0.6); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* ── STANDARD DATA TABLE VIEW ── */}
      {(viewState === 'standard' && !queueLoading) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Full-Width Table */}
          <style>{`
            .client-table-scroll::-webkit-scrollbar {
              height: 6px;
            }
            .client-table-scroll::-webkit-scrollbar-track {
              background: #FAF8F5;
              border-radius: 10px;
            }
            .client-table-scroll::-webkit-scrollbar-thumb {
              background: #DDD0C4;
              border-radius: 10px;
            }
            .client-table-scroll::-webkit-scrollbar-thumb:hover {
              background: #C4B5A8;
            }
          `}</style>
          <div className="client-table-scroll" style={{ overflowX: 'auto', background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px 16px 0 0', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <table style={{ width: '100%', minWidth: '1600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <th style={{ padding: '1rem', width: '48px', textAlign: 'center' }}>
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === filteredQueue.length && filteredQueue.length > 0} />
                  </th>
                  <th style={{ padding: '1rem' }}>CLIENT / COMPANY</th>
                  <th style={{ padding: '1rem' }}>DOCUMENT</th>
                  <th style={{ padding: '1rem' }}>DOC TYPE</th>
                  <th style={{ padding: '1rem' }}>UPLOAD DATE</th>
                  <th style={{ padding: '1rem' }}>QUEUE STAGE</th>
                  <th style={{ padding: '1rem' }}>AI CONFIDENCE</th>
                  <th style={{ padding: '1rem' }}>OCR STATUS</th>
                  <th style={{ padding: '1rem' }}>VALIDATION</th>
                  <th style={{ padding: '1rem' }}>ASSIGNED REVIEWER</th>
                  <th style={{ padding: '1rem' }}>PRIORITY</th>
                  <th style={{ padding: '1rem' }}>CURRENT STEP</th>
                  <th style={{ padding: '1rem' }}>TIME</th>
                  <th style={{ padding: '1rem' }}>QUICKBOOKS</th>
                  <th style={{ padding: '1rem' }}>LAST UPDATED</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={16} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(42,22,40,0.45)' }}>No bookkeeping workflows matching filter query.</td>
                  </tr>
                ) : (
                  filteredQueue.map((item: QueueItem, idx: number) => (
                    <tr key={item.id} style={{ borderBottom: idx < filteredQueue.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', background: selectedRows.includes(item.id) ? 'rgba(232,118,10,0.02)' : 'transparent', whiteSpace: 'nowrap' }}>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedRows.includes(item.id)} onChange={() => handleSelectOne(item.id)} />
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(232, 118, 10, 0.08)',
                            color: '#E8760A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {item.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#2A1628' }}>{item.name}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'rgba(42,22,40,0.45)', marginTop: '2px' }}>{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#E8760A', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {item.documentName}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.documentType}</td>
                      <td style={{ padding: '1rem', color: '#2A1628', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.uploadDate}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          background: (item.stage as string) === 'OCR Processing' ? '#FAF2EC'
                            : (item.stage as string) === 'Ledger Mapping' || (item.stage as string) === 'Ledger Construction' || (item.stage as string) === 'Approved' ? '#E6F4EA'
                            : (item.stage as string) === 'AI Extraction' || (item.stage as string) === 'Matching' ? '#E8F0FE'
                            : (item.stage as string) === 'Ready For Reconciliation' || (item.stage as string) === 'Reconciliation' ? '#FFF3E0'
                            : (item.stage as string) === 'Exceptions' || (item.stage as string) === 'Review Required' || (item.stage as string) === 'Rejected' ? '#FEE2E2'
                            : '#F3E8FF',
                          color: (item.stage as string) === 'OCR Processing' ? '#E8760A'
                            : (item.stage as string) === 'Ledger Mapping' || (item.stage as string) === 'Ledger Construction' || (item.stage as string) === 'Approved' ? '#137333'
                            : (item.stage as string) === 'AI Extraction' || (item.stage as string) === 'Matching' ? '#1A73E8'
                            : (item.stage as string) === 'Ready For Reconciliation' || (item.stage as string) === 'Reconciliation' ? '#E65100'
                            : (item.stage as string) === 'Exceptions' || (item.stage as string) === 'Review Required' || (item.stage as string) === 'Rejected' ? '#D32F2F'
                            : '#8B5CF6'
                        }}>{item.stage}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <div style={{ width: '36px', height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.aiConfidence}%`, height: '100%', background: item.aiConfidence > 80 ? '#047857' : item.aiConfidence > 50 ? '#E8760A' : '#EF4444' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: item.aiConfidence > 80 ? '#047857' : item.aiConfidence > 50 ? '#E8760A' : '#EF4444' }}>{item.aiConfidence}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: item.ocrStatus === 'Success' ? '#047857' : item.ocrStatus === 'Warning' ? '#E8760A' : '#EF4444', fontWeight: 700 }}>{item.ocrStatus}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: item.validationStatus === 'Passed' ? 'rgba(4,120,87,0.08)' : 'rgba(239,68,68,0.08)', color: item.validationStatus === 'Passed' ? '#047857' : '#EF4444' }}>{item.validationStatus}</span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.reviewer}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: item.priority === 'High' ? 'rgba(239,68,68,0.08)' : item.priority === 'Medium' ? 'rgba(232,118,10,0.08)' : 'rgba(42,22,40,0.06)', color: item.priority === 'High' ? '#EF4444' : item.priority === 'Medium' ? '#E8760A' : 'rgba(42,22,40,0.6)' }}>{item.priority}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#2A1628', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.currentStep}</td>
                      <td style={{ padding: '1rem', color: '#2A1628', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.processingTime}</td>
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: item.qbStatus === 'Connected' ? 'rgba(4,120,87,0.08)'
                            : item.qbStatus === 'Syncing' ? 'rgba(232,118,10,0.08)'
                            : 'rgba(239,68,68,0.08)',
                          color: item.qbStatus === 'Connected' ? '#047857'
                            : item.qbStatus === 'Syncing' ? '#E8760A'
                            : '#EF4444'
                        }}>{item.qbStatus}</span>
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.lastUpdated}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button onClick={() => setActiveDropdown(activeDropdown === `row-${item.id}` ? null : `row-${item.id}`)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2A1628', padding: '0.25rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                          </button>
                          {activeDropdown === `row-${item.id}` && (
                            <div className="no-scrollbar" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 32px rgba(42,22,40,0.15)', zIndex: 100, minWidth: '180px', padding: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                              {[
                                { label: 'Open Queue Details', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('overview'); setDrawerOpen(true); } },
                                { label: 'Preview Document', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('document'); setDrawerOpen(true); } },
                                { label: 'View OCR Extraction', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('ocr'); setDrawerOpen(true); } },
                                { label: 'View AI Fields', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('ai'); setDrawerOpen(true); } },
                                { label: 'View Ledger Mapping', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('ledger'); setDrawerOpen(true); } },
                                { label: 'Check Validation', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('validation'); setDrawerOpen(true); } },
                                { label: 'Approve Job', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, onClick: () => handleApprove(item.id) },
                                { label: 'Reject Job', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>, danger: true, onClick: () => handleReject(item.id) },
                                { label: 'Push to Recon', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>, onClick: () => handleMoveToRecon(item.id) },
                                { label: 'Retry OCR Processing', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>, onClick: () => handleRetry(item.id) },
                                { label: 'Audit Log Trail', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, onClick: () => { setSelectedItem(item); setDrawerTab('activity'); setDrawerOpen(true); } }
                              ].map((act, aIdx) => (
                                <div
                                  key={aIdx}
                                  onClick={() => { act.onClick(); setActiveDropdown(null); }}
                                  style={{
                                    padding: '0.45rem 0.75rem',
                                    fontSize: '0.75rem',
                                    color: act.danger ? '#EF4444' : '#2A1628',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 500,
                                    transition: 'background 150ms ease'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = act.danger ? 'rgba(239,68,68,0.06)' : 'rgba(232,118,10,0.06)'; e.currentTarget.style.color = act.danger ? '#EF4444' : '#E8760A'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = act.danger ? '#EF4444' : '#2A1628'; }}
                                >
                                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', color: act.danger ? '#EF4444' : '#E8760A' }}>{act.icon}</span>
                                  {act.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={filteredQueue.length}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            itemLabel="jobs"
          />

          {/* Three Summary Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
            {/* Queue Health Card */}
            <div style={{ background: '#2A1628', color: '#fff', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Queue Health</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 300, fontFamily: 'Georgia, serif' }}>{analytics.queueHealth[0]?.value || '94.2%'} <span style={{ fontSize: '0.75rem', color: '#047857' }}>Excellent</span></div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: analytics.queueHealth[0]?.value || '94%', height: '100%', background: '#E8760A' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>Today&apos;s Throughput: <strong>86 invoices/hr</strong></div>
            </div>

            {/* AI Engine Accuracy Card */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Engine Diagnostics</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>AI Accuracy Score</span>
                <strong style={{ fontSize: '0.8125rem', color: '#2A1628' }}>{analytics.engineDiagnostics?.accuracyScore || '98.1%'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>Manual Review Rate</span>
                <strong style={{ fontSize: '0.8125rem', color: '#E8760A' }}>{analytics.engineDiagnostics?.manualReviewRate || '6.4%'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>OCR Fail Rate</span>
                <strong style={{ fontSize: '0.8125rem', color: '#EF4444' }}>{analytics.engineDiagnostics?.ocrFailRate || '0.82%'}</strong>
              </div>
            </div>

            {/* Queue Distribution */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>Recent Exceptions</div>
              {(analytics.recentExceptions || []).map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '0.5rem', borderBottom: i === 0 && analytics.recentExceptions.length > 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>{item.name}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '2px' }}>
                    <span>Code: {item.code}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EXCEPTION CENTER ── */}
      <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700 }}>!</div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Exception Resolution Command Center</div>
            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.55)' }}>Fix failed OCR, low confidence extractions, validation mismatches or QuickBooks endpoint errors.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => { triggerToast('Initiated batch retry of exception jobs.', 'info'); }} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Retry Exception Queue</button>
        </div>
      </div>

      {/* ── ANALYTICS SECTION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
        {/* Processing Funnel */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>AI Bookkeeping Pipeline Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(analytics.pipelineFunnel || []).map((st: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.04)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '24px', height: '24px', borderRadius: '50%', background: st.color || '#2A1628', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>{st.step}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '1px' }}>{st.count}</div>
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: st.color || '#2A1628' }}>{st.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Charts Mockup */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>Operational Queue Diagnostics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Stage Distribution Chart */}
            <div style={{ border: '1px solid rgba(42,22,40,0.04)', borderRadius: '10px', padding: '0.75rem', background: '#FAF8F5' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Queue Stage Distribution</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {(analytics.operationalDiagnostics || []).map((item: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#2A1628', fontWeight: 500 }}>
                      <span>{item.name}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '10px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${item.val}%`, height: '100%', background: item.color || '#2A1628' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Confidence Distribution */}
            <div style={{ border: '1px solid rgba(42,22,40,0.04)', borderRadius: '10px', padding: '0.75rem', background: '#FAF8F5' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Confidence Yield</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {(analytics.confidenceYield || [
                  { name: 'High Confidence (>90%)', val: 78, color: '#047857' },
                  { name: 'Medium Confidence (60-90%)', val: 16, color: '#E8760A' },
                  { name: 'Needs Manual Review (<60%)', val: 6, color: '#EF4444' }
                ]).map((item: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#2A1628', fontWeight: 500 }}>
                      <span>{item.name}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '10px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${item.val}%`, height: '100%', background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUEUE DETAILS DRAWER ── */}
      {drawerOpen && selectedItem && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.3)', zIndex: 1020, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '560px', maxWidth: '100vw', background: '#ffffff', zIndex: 1021, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(42,22,40,0.18)', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ background: '#FAF8F5', padding: '1.25rem 1.5rem', borderBottom: '1px solid #DDD0C4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: selectedItem.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>{selectedItem.initials}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#2A1628' }}>{selectedItem.name}</h3>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '2px' }}>{selectedItem.documentName} · ID: {selectedItem.id}</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="no-scrollbar" style={{ display: 'flex', borderBottom: '1px solid #DDD0C4', padding: '0 1rem', flexShrink: 0, overflowX: 'auto' }}>
              {(['overview', 'document', 'ocr', 'ai', 'ledger', 'validation', 'timeline', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setDrawerTab(tab)} style={{ padding: '0.75rem 0.65rem', background: 'transparent', border: 'none', borderBottom: drawerTab === tab ? '2px solid #E8760A' : '2px solid transparent', color: drawerTab === tab ? '#E8760A' : 'rgba(42,22,40,0.5)', fontWeight: drawerTab === tab ? 700 : 500, fontSize: '0.7rem', cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif' }}>{tab === 'ai' ? 'AI Extraction' : tab}</button>
              ))}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* OVERVIEW TAB */}
              {drawerTab === 'overview' && (<>
                {/* SLA Tracking Dashboard */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Queue SLA Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'rgba(42,22,40,0.6)', display: 'block', marginBottom: '2px' }}>Processing SLA Target</span>
                      <strong style={{ color: '#2A1628' }}>24 Hours</strong>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(42,22,40,0.6)', display: 'block', marginBottom: '2px' }}>SLA Status</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: selectedItem.priority === 'High' ? 'rgba(239,68,68,0.08)' : 'rgba(4,120,87,0.08)', color: selectedItem.priority === 'High' ? '#EF4444' : '#047857' }}>
                        {selectedItem.priority === 'High' ? '⚠️ Over SLA (Urgent)' : '✓ Within SLA'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(42,22,40,0.6)', display: 'block', marginBottom: '2px' }}>Expected Finish</span>
                      <strong style={{ color: '#2A1628' }}>2026-05-08 10:15 AM</strong>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(42,22,40,0.6)', display: 'block', marginBottom: '2px' }}>Priority Deadline</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: selectedItem.priority === 'High' ? 'rgba(239,68,68,0.08)' : 'rgba(232,118,10,0.08)', color: selectedItem.priority === 'High' ? '#EF4444' : '#E8760A' }}>
                        {selectedItem.priority} Setting
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Workflow Parameters</div>
                  {[
                    { label: 'Client Company', val: selectedItem.name },
                    { label: 'Queue Stage', val: selectedItem.stage },
                    { label: 'AI Confidence Score', val: `${selectedItem.aiConfidence}%` },
                    { label: 'Assigned Reviewer', val: selectedItem.reviewer },
                    { label: 'Processing Duration', val: selectedItem.processingTime },
                    { label: 'QuickBooks Endpoint', val: selectedItem.qbStatus },
                    { label: 'Exceptions Identified', val: selectedItem.exceptionType },
                    { label: 'Priority Setting', val: selectedItem.priority },
                    { label: 'Business Health Index', val: '96% Positive Standing' }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: i < 8 ? '1px solid rgba(42,22,40,0.04)' : 'none', fontSize: '0.75rem' }}>
                      <span style={{ color: 'rgba(42,22,40,0.6)', fontWeight: 500 }}>{item.label}</span>
                      <strong style={{ color: '#2A1628' }}>{item.val}</strong>
                    </div>
                  ))}
                </div>
              </>)}

              {/* DOCUMENT TAB */}
              {drawerTab === 'document' && (<>
                <div style={{ background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ height: '240px', background: '#fff', border: '1px dashed #DDD0C4', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(42,22,40,0.45)', fontSize: '0.8125rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '0.5rem', color: '#E8760A' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>High Fidelity Document Preview Panel</span>
                    <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>{selectedItem.documentName}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {['Download File', 'Replace Document', 'Rotate Right', 'Zoom In'].map((lbl, idx) => (
                      <button key={idx} onClick={() => triggerToast(`${lbl} executed`, 'info')} style={{ background: '#fff', border: '1px solid #DDD0C4', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628' }}>{lbl}</button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.75rem' }}>
                    <div>Filename: <strong>{selectedItem.documentName}</strong></div>
                    <div>Upload Date: <strong>{selectedItem.uploadDate}</strong></div>
                    <div>Uploader Source: <strong>{selectedItem.uploader}</strong></div>
                    <div>Page Count: <strong>{selectedItem.pages} pages</strong></div>
                    <div>File Size: <strong>{selectedItem.size}</strong></div>
                  </div>
                </div>
              </>)}

              {/* OCR TAB */}
              {drawerTab === 'ocr' && (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Detailed Confidence Score Matrix */}
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Confidence Score Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        { label: 'OCR Character Confidence', val: selectedItem.ocrConfidence, color: '#E8760A' },
                        { label: 'Extraction Parsing Confidence', val: selectedItem.aiConfidence, color: '#2A1628' },
                        { label: 'Validation Rule Confidence', val: 95, color: '#047857' },
                        { label: 'Ledger Mapping Confidence', val: 88, color: '#E8760A' },
                        { label: 'Overall Composite Confidence', val: Math.round((selectedItem.ocrConfidence + selectedItem.aiConfidence + 95 + 88) / 4), color: '#2A1628', bold: true }
                      ].map((item, idx) => (
                        <div key={idx} style={{ paddingBottom: idx < 4 ? '4px' : '0', borderBottom: idx === 3 ? '1px solid rgba(42,22,40,0.08)' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: item.bold ? 700 : 500, color: '#2A1628', marginBottom: '2px' }}>
                            <span>{item.label}</span>
                            <span>{item.val}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.val}%`, height: '100%', background: item.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#E8760A' }}>{selectedItem.ocrConfidence}%</div>
                      <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>OCR Confidence</div>
                    </div>
                    <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2A1628' }}>{selectedItem.detectedLanguage}</div>
                      <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Detected Language</div>
                    </div>
                  </div>

                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Raw Extracted Characters</div>
                    <pre style={{ margin: 0, padding: '0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.7rem', color: 'rgba(42,22,40,0.85)', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '180px' }}>{selectedItem.ocrText}</pre>
                  </div>

                  {/* OCR Warnings */}
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Missing Fields & Warnings</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {selectedItem.ocrWarnings.map((w, idx) => (
                        <div key={idx} style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 600 }}>⚠️ {w}</div>
                      ))}
                      {selectedItem.missingFields.map((f, idx) => (
                        <div key={idx} style={{ fontSize: '0.7rem', color: '#E8760A', fontWeight: 600 }}>ℹ️ Missing Field: {f}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </>)}

              {/* AI EXTRACTION TAB */}
              {drawerTab === 'ai' && (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* AI Summary & Recommendations */}
                  <div style={{ background: 'rgba(232, 118, 10, 0.03)', border: '1px solid rgba(232, 118, 10, 0.15)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#E8760A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>AI Summary & Recommendations</div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#2A1628', lineHeight: 1.4 }}>
                      Document identified as a standard trade payable invoice from <strong style={{ color: '#E8760A' }}>{selectedItem.vendor}</strong>. Subtotal of <strong>{selectedItem.currency} {selectedItem.subtotal}</strong> plus VAT rate of <strong>{selectedItem.vat}</strong> matches the total sum exactly.
                    </p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)' }}>
                      <strong>AI Recommendation:</strong> Post to expense category <em>{selectedItem.category}</em> under GL Account <em>{selectedItem.glAccountSuggestion}</em>.
                    </div>
                  </div>

                  {/* Risk Analysis & Confidence Explanation */}
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Anomalies & Risk Analysis</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#047857', fontWeight: 600 }}>✓ TRN Format Check</span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Valid TRN verified</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#E8760A', fontWeight: 600 }}>⚠️ Duplicate Detection</span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Similar total exists from 12 days ago</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: '#047857', fontWeight: 600 }}>✓ Bank Account Details Match</span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Matched registered vendor ledger profile</span>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Corrections & Smart Actions */}
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Suggested Corrections & Smart Actions</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => {
                        updateQueueItem({ id: selectedItem.id, body: { category: 'Utilities', glAccountSuggestion: '5010-UTIL' } });
                        triggerToast('Smart suggestion applied: Utilities', 'success');
                      }} style={{ flex: 1, padding: '0.45rem', background: 'rgba(232,118,10,0.08)', color: '#E8760A', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Map to Utilities</button>
                      <button onClick={() => {
                        updateQueueItem({ id: selectedItem.id, body: { category: 'Software Licences', glAccountSuggestion: '5020-SaaS' } });
                        triggerToast('Smart suggestion applied: Software SaaS', 'success');
                      }} style={{ flex: 1, padding: '0.45rem', background: 'rgba(42,22,40,0.06)', color: '#2A1628', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Map to SaaS</button>
                    </div>
                  </div>

                  {/* Extracted Schema Fields */}
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Extracted Schema Fields</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { key: 'vendor', label: 'Vendor Entity', val: selectedItem.vendor },
                      { key: 'invoiceNumber', label: 'Invoice No.', val: selectedItem.invoiceNumber },
                      { key: 'invoiceDate', label: 'Invoice Date', val: selectedItem.invoiceDate },
                      { key: 'dueDate', label: 'Due Date', val: selectedItem.dueDate },
                      { key: 'currency', label: 'Currency', val: selectedItem.currency },
                      { key: 'taxAmount', label: 'Tax Amount', val: selectedItem.taxAmount },
                      { key: 'vat', label: 'VAT Rate', val: selectedItem.vat },
                      { key: 'subtotal', label: 'Subtotal', val: selectedItem.subtotal },
                      { key: 'total', label: 'Total Amount', val: selectedItem.total },
                      { key: 'paymentTerms', label: 'Payment Terms', val: selectedItem.paymentTerms },
                      { key: 'category', label: 'Accounting Category', val: selectedItem.category },
                      { key: 'glAccountSuggestion', label: 'Suggested GL Code', val: selectedItem.glAccountSuggestion }
                    ].map((fld) => (
                      <div key={fld.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.45)' }}>
                          <span>{fld.label}</span>
                          <span style={{ color: '#047857' }}>Confidence: {selectedItem.ocrConfidence}%</span>
                        </div>
                        <input type="text" defaultValue={fld.val} onChange={e => {
                          updateQueueItem({ id: selectedItem.id, body: { [fld.key]: e.target.value } });
                        }} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #DDD0C4', fontSize: '0.75rem', color: '#2A1628', outline: 'none' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </>)}

              {/* LEDGER TAB */}
              {drawerTab === 'ledger' && (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Suggested Account Mapping</div>
                    <div style={{ fontSize: '0.75rem', color: '#2A1628' }}>
                      <div>GL Code Suggestion: <strong>{selectedItem.glAccountSuggestion}</strong></div>
                      <div style={{ marginTop: '0.4rem' }}>Mapping Rule: <strong style={{ color: '#047857' }}>{selectedItem.accountMapping}</strong></div>
                    </div>
                  </div>

                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Journal Entries Preview</div>
                    <div style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '0.25rem', marginBottom: '0.35rem' }}>
                        <span>Account</span>
                        <span>Debit</span>
                        <span>Credit</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#2A1628', padding: '2px 0' }}>
                        <span>{selectedItem.glAccountSuggestion || 'Expenses'}</span>
                        <span>AED {selectedItem.subtotal || '0.00'}</span>
                        <span>-</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#2A1628', padding: '2px 0' }}>
                        <span>VAT Input Account</span>
                        <span>AED {selectedItem.taxAmount || '0.00'}</span>
                        <span>-</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#2A1628', padding: '2px 0' }}>
                        <span>Accounts Payable (Creditors)</span>
                        <span>-</span>
                        <span>AED {selectedItem.total || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>)}

              {/* VALIDATION TAB */}
              {drawerTab === 'validation' && (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Checklist Validation */}
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Checklist Validation</div>
                    {[
                      { item: 'VAT TRN Check Digit Matches', done: true },
                      { item: 'Subtotal plus Tax matches Invoice Total', done: true },
                      { item: 'Duplicate Invoice Check Passed', done: true },
                      { item: 'Purchase Order Linked Reference Validated', done: false }
                    ].map((chk, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}>
                        <input type="checkbox" checked={chk.done} readOnly style={{ accentColor: '#E8760A' }} />
                        <span style={{ fontSize: '0.75rem', color: chk.done ? '#2A1628' : '#EF4444', fontWeight: chk.done ? 500 : 600 }}>{chk.item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Exception Resolution Panel */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Exception Details & Suggested Fix</div>
                    <div style={{ fontSize: '0.75rem', color: '#2A1628', lineHeight: 1.4, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        <strong>Failure Reason:</strong> <span style={{ color: '#EF4444' }}>PO Reference Not Found</span>
                      </div>
                      <div>
                        <strong>AI Explanation:</strong> The uploader did not attach the reference Purchase Order. An active PO search suggests a possible match for <code>PO-2026-891</code> based on vendor name and billing amount.
                      </div>
                      <div>
                        <strong>Suggested Fix:</strong> Auto-link PO reference to match with vendor profiles.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button onClick={() => {
                        triggerToast('Purchase Order linked successfully. Retrying validation...', 'success');
                      }} style={{ flex: 1, padding: '0.45rem', background: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Link PO & Retry</button>
                      <button onClick={() => {
                        triggerToast('Manual Override: Validation marked as PASSED.', 'info');
                      }} style={{ flex: 1, padding: '0.45rem', background: '#E8760A', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Manual Override</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <button onClick={() => { handleApprove(selectedItem.id); setDrawerOpen(false); }} style={{ flex: 1, padding: '0.625rem 1.5rem', background: '#047857', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'inherit' }}>Approve Ledger</button>
                    <button onClick={() => { handleReject(selectedItem.id); setDrawerOpen(false); }} style={{ flex: 1, padding: '0.625rem 1.5rem', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'inherit' }}>Reject Job</button>
                    <button onClick={() => { triggerToast('Changes requested from uploader.', 'info'); setDrawerOpen(false); }} style={{ flex: 1, padding: '0.625rem 1.5rem', background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'inherit' }}>Request Changes</button>
                  </div>
                </div>
              </>)}

              {/* TIMELINE TAB */}
              {drawerTab === 'timeline' && (<>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Processing Pipeline Funnel</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: '#2A1628' }}>
                      <span style={{ color: '#047857' }}>OCR</span>
                      <span>➔</span>
                      <span style={{ color: '#047857' }}>AI</span>
                      <span>➔</span>
                      <span style={{ color: '#E8760A' }}>Ledger</span>
                      <span>➔</span>
                      <span style={{ color: 'rgba(42,22,40,0.4)' }}>Validation</span>
                      <span>➔</span>
                      <span style={{ color: 'rgba(42,22,40,0.4)' }}>Review</span>
                      <span>➔</span>
                      <span style={{ color: 'rgba(42,22,40,0.4)' }}>Recon</span>
                    </div>
                  </div>

                  {[
                    { title: 'Document Uploaded', desc: `Pushed by ${selectedItem.uploader}`, time: 'May 7, 2026, 10:12 AM', done: true },
                    { title: 'OCR Started', desc: 'OCR pipeline initialization complete. Duration: 0.8s', time: 'May 7, 2026, 10:13 AM', done: true },
                    { title: 'OCR Completed', desc: `Extracted text characters. Status: ${selectedItem.ocrStatus} (Confidence: ${selectedItem.ocrConfidence}%)`, time: 'May 7, 2026, 10:14 AM', done: true },
                    { title: 'AI Extraction', desc: `Category parsing confidence level: ${selectedItem.aiConfidence}%`, time: 'May 7, 2026, 10:15 AM', done: true },
                    { title: 'Ledger Mapping', desc: `Suggested category code: ${selectedItem.glAccountSuggestion} (${selectedItem.category})`, time: 'May 7, 2026, 10:15 AM', done: true },
                    { title: 'Validation Audit', desc: 'Running system rules. Check for duplicate invoices, TRN registration verification', time: 'May 7, 2026, 10:16 AM', done: true },
                    { title: 'Assigned Reviewer', desc: `Assigned to Senior Bookkeeper ${selectedItem.reviewer}`, time: 'May 7, 2026, 10:18 AM', done: true },
                    { title: 'Approved Signature', desc: `Verification check signature by ${selectedItem.reviewer}`, time: selectedItem.stage === 'Approved' ? 'May 7, 2026, 11:30 AM' : 'Pending Reviewer Action', done: selectedItem.stage === 'Approved' },
                    { title: 'Pushed to Reconciliation', desc: 'Sync state mapping uploaded to QuickBooks core sync endpoint', time: selectedItem.stage === 'Approved' ? 'May 7, 2026, 11:32 AM' : 'Awaiting confirmation', done: selectedItem.stage === 'Approved' }
                  ].map((evt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.85rem', paddingBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: evt.done ? '#047857' : 'rgba(42,22,40,0.06)', border: evt.done ? 'none' : '1px solid #DDD0C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {evt.done ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(42,22,40,0.3)' }} />
                          )}
                        </div>
                        {idx < 8 && <div style={{ width: '2px', flex: 1, background: evt.done ? '#047857' : 'rgba(42,22,40,0.06)', margin: '4px 0', minHeight: '24px' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: evt.done ? '#2A1628' : 'rgba(42,22,40,0.5)' }}>{evt.title}</div>
                        <div style={{ fontSize: '0.725rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{evt.desc}</div>
                        <div style={{ fontSize: '0.65rem', color: evt.done ? '#E8760A' : 'rgba(42,22,40,0.4)', marginTop: '2px', fontWeight: 600 }}>{evt.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>)}

              {/* ACTIVITY TAB */}
              {drawerTab === 'activity' && (<>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>System Audit Trail Log</div>
                    
                    <div className="client-table-scroll" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', color: '#2A1628', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #DDD0C4', color: 'rgba(42,22,40,0.5)' }}>
                            <th style={{ padding: '0.5rem 0.25rem', fontWeight: 700 }}>Timestamp</th>
                            <th style={{ padding: '0.5rem 0.25rem', fontWeight: 700 }}>User / Agent</th>
                            <th style={{ padding: '0.5rem 0.25rem', fontWeight: 700 }}>Action</th>
                            <th style={{ padding: '0.5rem 0.25rem', fontWeight: 700 }}>Old ➔ New Value</th>
                            <th style={{ padding: '0.5rem 0.25rem', fontWeight: 700 }}>System Meta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { time: '10m ago', actor: 'AI Engine v4.2', action: 'OCR Parsing', diff: 'Raw ➔ Text Extracted', meta: 'IP: 104.28.1.9 (System)' },
                            { time: '10m ago', actor: 'GL Rules Engine', action: 'Suggested GL Account', diff: 'Null ➔ 5010-UTIL', meta: 'IP: 104.28.1.12 (Rules)' },
                            { time: '8m ago', actor: 'Priya Nair (Mgr)', action: 'Assign Reviewer', diff: 'Unassigned ➔ Sneha Iyer', meta: 'IP: 192.168.1.84 (macOS)' },
                            { time: '5m ago', actor: 'Sneha Iyer (Rev)', action: 'Manual Review', diff: 'Pending ➔ In Progress', meta: 'IP: 192.168.1.99 (Windows)' },
                            { time: 'Just Now', actor: 'System Auto-SLA', action: 'SLA Status Check', diff: 'Active ➔ Within SLA', meta: 'System Daemon' }
                          ].map((act, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                              <td style={{ padding: '0.5rem 0.25rem', whiteSpace: 'nowrap', fontWeight: 600 }}>{act.time}</td>
                              <td style={{ padding: '0.5rem 0.25rem', whiteSpace: 'nowrap', color: '#E8760A', fontWeight: 600 }}>{act.actor}</td>
                              <td style={{ padding: '0.5rem 0.25rem' }}>{act.action}</td>
                              <td style={{ padding: '0.5rem 0.25rem', fontFamily: 'monospace', fontSize: '0.65rem' }}>{act.diff}</td>
                              <td style={{ padding: '0.5rem 0.25rem', color: 'rgba(42,22,40,0.5)', whiteSpace: 'nowrap' }}>{act.meta}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>)}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
              <button onClick={() => { handleApprove(selectedItem.id); setDrawerOpen(false); }} style={{ flex: 1, padding: '0.625rem 1.5rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'inherit' }}>Approve Ledger Map</button>
              <button onClick={() => setDrawerOpen(false)} style={{ flex: 1, padding: '0.625rem 1.5rem', background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'inherit' }}>Close Drawer</button>
            </div>
          </div>
        </>
      )}

      {/* ── BATCH MODALS & EXPORT POPOVERS ── */}
      {uploadOpen && (
        <div onClick={() => { setUploadOpen(false); setUploadState('form'); }} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '980px', height: '85vh', maxHeight: '720px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', flexShrink: 0 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#E8760A', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI Bookkeeping Queue</p>
                <h2 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#2A1628' }}>
                  Upload Documents
                </h2>
              </div>
              <button onClick={() => { setUploadOpen(false); setUploadState('form'); }} style={{ background: 'rgba(42,22,40,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Modal Contents based on State */}
            {uploadState === 'loading' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem' }}>
                  <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '80px', height: '80px', border: '6px solid rgba(232, 118, 10, 0.1)', borderRadius: '50%' }} />
                  <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '80px', height: '80px', border: '6px solid transparent', borderTopColor: '#E8760A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Processing Ingest Queue...</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(42,22,40,0.5)', maxWidth: '360px', margin: '0 auto 1.5rem auto' }}>Your files are being securely parsed, and AI metadata pipelines are starting.</p>
                <div style={{ width: '300px', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: '#047857' }}>✓ Uploading Files</span>
                    <strong style={{ color: '#2A1628' }}>100%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: '#E8760A' }}>🗲 OCR Initializing...</span>
                    <strong style={{ color: '#E8760A' }}>Pending</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: 'rgba(42,22,40,0.45)' }}>✦ Preparing AI Extraction</span>
                    <strong style={{ color: 'rgba(42,22,40,0.45)' }}>Waiting</strong>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '0.5rem', marginTop: '0.25rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center' }}>
                    Queue Position: <strong>#3</strong> in processing pipeline
                  </div>
                </div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : uploadState === 'success' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(4,120,87,0.08)', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Documents Uploaded Successfully</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)', maxWidth: '420px', margin: '0 0 2rem' }}>The selected accounting documents have been queued and are being processed by the AI Bookkeeping Engine.</p>
                
                <div style={{ width: '420px', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(42,22,40,0.05)', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>AI Queue ID</span>
                    <strong style={{ color: '#2A1628' }}>AQ-2026-9812A</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(42,22,40,0.05)', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>Estimated Completion Time</span>
                    <strong style={{ color: '#2A1628' }}>~45 seconds</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span style={{ marginBottom: '0.25rem' }}>Files Uploaded ({uploadedFilesList.length || 1})</span>
                    <div style={{ maxHeight: '80px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {uploadedFilesList.length > 0 ? uploadedFilesList.map((f, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#2A1628' }}>
                          <span>• {f.name}</span>
                          <span>{f.size}</span>
                        </div>
                      )) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#2A1628' }}>
                          <span>• inv_may_2209.pdf</span>
                          <span>1.8 MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => { setUploadOpen(false); setUploadState('form'); }} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>View Queue</button>
                  <button onClick={() => { setUploadState('form'); setUploadedFilesList([]); }} style={{ background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Upload More</button>
                  <button onClick={() => { setUploadOpen(false); setUploadState('form'); }} style={{ background: '#ffffff', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            ) : uploadState === 'error' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12.01" y2="19"/><line x1="12" y1="5" x2="12" y2="15"/></svg>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Upload Error</h3>
                <p style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 600, maxWidth: '420px', margin: '0 0 2rem' }}>Maximum Size Exceeded: File size must be under 50MB</p>
                
                <div style={{ width: '420px', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>Other Potential Errors Check List:</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.7)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>• <strong>Unsupported Format</strong>: Ensure extension is pdf, png, jpg, xlsx, csv, or zip</span>
                    <span>• <strong>Duplicate File</strong>: System checks if checksum already exists in queue</span>
                    <span>• <strong>Corrupted File</strong>: Unable to extract metadata headers</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setUploadState('form')} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Retry Upload</button>
                  <button onClick={() => { setUploadOpen(false); setUploadState('form'); }} style={{ background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              // Form State (Step-by-step layout)
              <>
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Left Column: Form Fields */}
                  <div className="client-table-scroll" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>
                      Upload accounting documents for one or multiple clients. Documents will enter the AI Bookkeeping Queue for OCR, AI extraction, ledger mapping and validation.
                    </p>

                    {/* STEP 1: Select Client */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', width: '20px', height: '20px', background: '#E8760A', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>1</span>
                        Select Client
                      </h3>
                      
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="text"
                            placeholder="Search client to select..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.75rem', outline: 'none' }}
                          />
                          <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.4)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                      </div>

                      {/* Recent Clients Checklist */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', alignSelf: 'center', marginRight: '0.25rem' }}>Recent:</span>
                        {['ABC Trading LLC', 'XYZ Holdings Limited', 'Delta Properties FZCO', 'Alpha Tech FZCO', 'Beta Industries LLC'].map(c => {
                          const isSel = selectedUploadClients.includes(c);
                          return (
                            <button
                              key={c}
                              onClick={() => {
                                if (isSel) {
                                  setSelectedUploadClients(selectedUploadClients.filter(x => x !== c));
                                } else {
                                  setSelectedUploadClients([...selectedUploadClients, c]);
                                }
                              }}
                              style={{
                                border: '1px solid',
                                borderColor: isSel ? '#E8760A' : '#DDD0C4',
                                background: isSel ? 'rgba(232, 118, 10, 0.08)' : '#ffffff',
                                color: isSel ? '#E8760A' : '#2A1628',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: isSel ? 700 : 500,
                                cursor: 'pointer'
                              }}
                            >
                              {isSel ? '✓ ' : ''}{c}
                            </button>
                          );
                        })}
                      </div>

                      {/* Display Info of Selected Clients */}
                      {selectedUploadClients.length > 0 && (
                        <div style={{ background: '#FAF8F5', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.04)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700 }}>SELECTED CLIENT METADATA:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {selectedUploadClients.map(c => (
                              <div key={c} style={{ fontSize: '0.7rem', color: '#2A1628', background: '#fff', border: '1px solid rgba(42,22,40,0.06)', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                                <strong>{c}</strong>
                                <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.45)', marginTop: '1px' }}>
                                  Manager: Mahesh Maddu · Bookkeeper: John Doe
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* STEP 2: Document Upload */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', width: '20px', height: '20px', background: '#E8760A', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>2</span>
                        Document Upload
                      </h3>

                      {/* Drag & Drop Area */}
                      <div
                        onClick={() => {
                          const mockFiles = [
                            { name: 'invoice_may_2209.pdf', size: '1.8 MB', pages: 4, progress: 100 },
                            { name: 'tax_rec_110.png', size: '840 KB', pages: 1, progress: 100 }
                          ];
                          setUploadedFilesList([...uploadedFilesList, ...mockFiles]);
                        }}
                        style={{
                          border: '1.5px dashed #DDD0C4',
                          borderRadius: '16px',
                          padding: '2rem 1.5rem',
                          background: '#FAF8F5',
                          textAlign: 'center',
                          cursor: 'pointer',
                          marginBottom: '1rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(232,118,10,0.08)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', display: 'block' }}>Drag & Drop Files Here</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', display: 'block', marginTop: '4px' }}>or click to browse local files</span>
                      </div>

                      {/* Google Drive, OneDrive, Dropbox Row */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['Google Drive', 'OneDrive', 'Dropbox'].map(src => (
                          <button
                            key={src}
                            onClick={() => {
                              triggerToast(`${src} files simulated linking.`, 'info');
                              setUploadedFilesList([...uploadedFilesList, { name: `${src.toLowerCase().replace(' ', '_')}_doc.pdf`, size: '1.2 MB', pages: 2, progress: 100 }]);
                            }}
                            style={{
                              flex: 1,
                              background: '#ffffff',
                              border: '1px solid #DDD0C4',
                              borderRadius: '8px',
                              padding: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              color: '#2A1628',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {src}
                          </button>
                        ))}
                      </div>

                      {/* Upload List & Progress */}
                      {uploadedFilesList.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                          {uploadedFilesList.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', gap: '0.5rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>
                                  <span>{f.name} ({f.pages} pgs)</span>
                                  <span>{f.size}</span>
                                </div>
                                <div style={{ width: '100%', height: '3px', background: 'rgba(42,22,40,0.06)', borderRadius: '10px', overflow: 'hidden', marginTop: '4px' }}>
                                  <div style={{ width: `${f.progress}%`, height: '100%', background: '#047857' }} />
                                </div>
                              </div>
                              <button
                                onClick={() => setUploadedFilesList(uploadedFilesList.filter((_, idx) => idx !== i))}
                                style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* File Restrictions Indicator */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>
                        <span>Allowed formats: PDF, JPG, PNG, JPEG, XLSX, CSV, ZIP</span>
                        <span>Max file size: 50MB | Max pages: 100 pgs</span>
                      </div>
                    </div>

                    {/* STEP 3: Document Classification */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ display: 'inline-flex', width: '20px', height: '20px', background: '#E8760A', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>3</span>
                          Document Classification
                        </h3>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(4,120,87,0.08)', color: '#047857', padding: '2px 8px', borderRadius: '10px' }}>
                          ✦ Auto Detect using AI Active
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                        {[
                          'Invoice', 'Receipt', 'Bank Statement', 'Purchase Invoice',
                          'Sales Invoice', 'Credit Note', 'Debit Note', 'VAT Document',
                          'Payroll', 'Corporate Tax', 'Trial Balance', 'General Ledger',
                          'Journal', 'Other'
                        ].map(type => {
                          const isSel = selectedClassification === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setSelectedClassification(type)}
                              style={{
                                background: isSel ? 'rgba(232, 118, 10, 0.08)' : '#ffffff',
                                border: '1px solid',
                                borderColor: isSel ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                color: isSel ? '#E8760A' : '#2A1628',
                                borderRadius: '10px',
                                padding: '0.6rem 0.75rem',
                                fontSize: '0.725rem',
                                fontWeight: isSel ? 700 : 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.15s ease',
                                boxShadow: isSel ? '0 2px 8px rgba(232,118,10,0.05)' : 'none'
                              }}
                            >
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isSel ? '#E8760A' : 'rgba(42,22,40,0.15)',
                                display: 'inline-block'
                              }} />
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STEP 4: Processing Options */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', width: '20px', height: '20px', background: '#E8760A', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>4</span>
                        Processing Options
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                          { name: 'OCR', desc: 'Extract raw text & characters' },
                          { name: 'AI Extraction', desc: 'Identify metadata & line items' },
                          { name: 'Ledger Mapping', desc: 'Auto-match to chart of accounts' },
                          { name: 'Duplicate Detection', desc: 'Prevent identical records in queue' },
                          { name: 'Tax Validation', desc: 'Verify tax rates & TRN matches' },
                          { name: 'Auto Categorization', desc: 'Group transactions automatically' },
                          { name: 'QuickBooks Preparation', desc: 'Format for one-click QuickBooks sync' },
                          { name: 'Notify Reviewer', desc: 'Email assignee upon ingestion' }
                        ].map(opt => {
                          const isChecked = processingOptions.includes(opt.name);
                          return (
                            <label
                              key={opt.name}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.625rem',
                                padding: '0.75rem',
                                background: isChecked ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                                border: '1px solid',
                                borderColor: isChecked ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: isChecked ? '0 2px 10px rgba(232, 118, 10, 0.04)' : 'none'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setProcessingOptions(processingOptions.filter(x => x !== opt.name));
                                  } else {
                                    setProcessingOptions([...processingOptions, opt.name]);
                                  }
                                }}
                                style={{ accentColor: '#E8760A', marginTop: '3px' }}
                              />
                              <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{opt.name}</span>
                                <span style={{ display: 'block', fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{opt.desc}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* STEP 5: Assignment */}
                    <div>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', width: '20px', height: '20px', background: '#E8760A', color: '#fff', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>5</span>
                        Assignment & Timeline
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <CustomSelect
                            label="Assign Manager"
                            value={assignManager}
                            options={['Mahesh Maddu', 'Priya Nair', 'Rohit Sharma']}
                            onChange={(val) => setAssignManager(val)}
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="Assign Bookkeeper"
                            value={assignBookkeeper}
                            options={['John Doe', 'Emma Watson', 'Sarah Khan']}
                            onChange={(val) => setAssignBookkeeper(val)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <CustomSelect
                            label="Assign Reviewer"
                            value={assignReviewer}
                            options={['Alex Mercer', 'Liam Neeson', 'Sarah Khan']}
                            onChange={(val) => setAssignReviewer(val)}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Due Date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Priority</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(['Low', 'Medium', 'High', 'Urgent'] as const).map(p => {
                            const isP = assignPriority === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setAssignPriority(p)}
                                style={{
                                  flex: 1,
                                  border: '1px solid',
                                  borderColor: isP ? '#E8760A' : '#DDD0C4',
                                  background: isP ? 'rgba(232,118,10,0.08)' : '#ffffff',
                                  color: isP ? '#E8760A' : '#2A1628',
                                  padding: '0.45rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: isP ? 700 : 500,
                                  cursor: 'pointer'
                                }}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Notes</label>
                        <textarea
                          placeholder="Provide specific notes or special compliance instructions..."
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '0.55rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Sticky Summary Panel */}
                  <div style={{ width: '320px', borderLeft: '1px solid #DDD0C4', background: '#FAF8F5', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                    <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#2A1628', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Summary</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Selected Client(s)</span>
                        <strong style={{ color: '#2A1628', textAlign: 'right' }}>{selectedUploadClients.length} Selected</strong>
                      </div>
                      {selectedUploadClients.length > 0 && (
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', alignSelf: 'flex-end', textAlign: 'right' }}>
                          {selectedUploadClients.join(', ')}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Files Uploaded</span>
                        <strong style={{ color: '#2A1628' }}>{uploadedFilesList.length} files</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Total Size</span>
                        <strong style={{ color: '#2A1628' }}>
                          {uploadedFilesList.length > 0 ? `${(uploadedFilesList.length * 1.3).toFixed(1)} MB` : '0 KB'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Estimated AI Time</span>
                        <strong style={{ color: '#E8760A' }}>
                          {uploadedFilesList.length > 0 ? `${uploadedFilesList.length * 6} seconds` : '0 seconds'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Estimated OCR Time</span>
                        <strong style={{ color: '#E8760A' }}>
                          {uploadedFilesList.length > 0 ? `${uploadedFilesList.length * 2.5} seconds` : '0 seconds'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Expected Queue Stage</span>
                        <strong style={{ color: '#2A1628' }}>
                          {processingOptions.includes('OCR') ? 'OCR Processing' : 'AI Extraction'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Upload Status</span>
                        <span style={{ color: uploadedFilesList.length > 0 ? '#047857' : 'rgba(42,22,40,0.4)', fontWeight: 700 }}>
                          {uploadedFilesList.length > 0 ? 'Ready to Process' : 'Draft / Empty'}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8760A' }}>Trigger Simulator States</span>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.3, marginBottom: '0.5rem' }}>Verify modal loading, error, or success layouts manually:</p>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => setUploadState('loading')} style={{ flex: 1, padding: '0.25rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>Loading</button>
                        <button onClick={() => setUploadState('success')} style={{ flex: 1, padding: '0.25rem', background: '#047857', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>Success</button>
                        <button onClick={() => setUploadState('error')} style={{ flex: 1, padding: '0.25rem', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}>Error</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '1rem 2rem', background: '#FAF8F5', borderTop: '1px solid #DDD0C4', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    onClick={() => { setUploadOpen(false); setUploadState('form'); }}
                    style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      triggerToast('Upload configuration saved as draft.', 'info');
                      setUploadOpen(false);
                    }}
                    style={{ background: '#ffffff', border: '1px solid #2A1628', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedUploadClients.length === 0) {
                        triggerToast('Please select at least one client.', 'error');
                        return;
                      }
                      setUploadState('loading');
                      try {
                        const fileName = uploadedFilesList[0]?.name || 'trade_invoice.pdf';
                        await addQueueItem({
                          documentName: fileName,
                          documentType: selectedClassification,
                          stage: 'Uploaded',
                          priority: assignPriority,
                          vendor: selectedUploadClients[0],
                          total: '1250.00',
                          currency: 'AED',
                          reviewer: assignReviewer
                        }).unwrap();
                        setUploadState('success');
                      } catch (err: any) {
                        setUploadState('error');
                      }
                    }}
                    style={{ background: '#E8760A', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Upload & Queue Later
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedUploadClients.length === 0) {
                        triggerToast('Please select at least one client.', 'error');
                        return;
                      }
                      setUploadState('loading');
                      try {
                        const fileName = uploadedFilesList[0]?.name || 'trade_invoice.pdf';
                        await addQueueItem({
                          documentName: fileName,
                          documentType: selectedClassification,
                          stage: 'OCR Processing',
                          priority: assignPriority,
                          vendor: selectedUploadClients[0],
                          total: '1250.00',
                          currency: 'AED',
                          reviewer: assignReviewer
                        }).unwrap();
                        setUploadState('success');
                      } catch (err: any) {
                        setUploadState('error');
                      }
                    }}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Upload & Start AI Processing
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {batchOpen && (
        <div onClick={() => { setBatchOpen(false); setBatchState('form'); }} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '980px', height: '85vh', maxHeight: '720px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', flexShrink: 0 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#E8760A', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI Bookkeeping Queue</p>
                <h2 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#2A1628' }}>
                  Create AI Bookkeeping Batch
                </h2>
              </div>
              <button onClick={() => { setBatchOpen(false); setBatchState('form'); }} style={{ background: 'rgba(42,22,40,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Content states */}
            {batchState === 'success' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(4,120,87,0.08)', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Batch Created Successfully</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)', maxWidth: '420px', margin: '0 0 2rem' }}>Your bookkeeping processing batch has been initiated and registered in the system database.</p>
                
                <div style={{ width: '420px', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(42,22,40,0.05)', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>Batch ID</span>
                    <strong style={{ color: '#2A1628' }}>BAT-2026-Q3-0892</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(42,22,40,0.05)', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>Clients Added</span>
                    <strong style={{ color: '#2A1628' }}>{selectedBatchClients.length} Clients</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>Processing Status</span>
                    <span style={{ color: '#047857', fontWeight: 700 }}>Ready / Waiting for Ingest</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => { setBatchOpen(false); setBatchState('form'); }} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Go To Batch</button>
                  <button onClick={() => { setBatchOpen(false); setUploadOpen(true); setBatchState('form'); }} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Upload Documents</button>
                  <button onClick={() => { setBatchOpen(false); setBatchState('form'); }} style={{ background: '#ffffff', color: 'rgba(42,22,40,0.5)', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Left Column: Form Fields */}
                  <div className="client-table-scroll" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
                    
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>
                      Create a processing batch to organize, assign and monitor accounting documents before entering the AI Bookkeeping Queue.
                    </p>

                    {/* SECTION 1: Batch Information */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        Batch Information
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Batch Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Q3_AUDIT_BATCH"
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Batch Reference Code (Auto Generated)</label>
                          <input
                            type="text"
                            value={batchRefCode}
                            disabled
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.75rem', background: '#FAF8F5', color: 'rgba(42,22,40,0.5)' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Description</label>
                        <textarea
                          placeholder="Describe the batch objectives or special scopes..."
                          value={batchDesc}
                          onChange={(e) => setBatchDesc(e.target.value)}
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <CustomSelect
                            label="Financial Year"
                            value={batchFinancialYear}
                            options={['2026', '2025', '2024']}
                            onChange={(val) => setBatchFinancialYear(val)}
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="Month / Quarter"
                            value={batchPeriod}
                            options={['Q3', 'Q2', 'Q1', 'May', 'June']}
                            onChange={(val) => setBatchPeriod(val)}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Department</label>
                          <input
                            type="text"
                            value={batchDepartment}
                            onChange={(e) => setBatchDepartment(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="Accounting Period"
                            value="Monthly"
                            options={['Monthly', 'Quarterly', 'Annually']}
                            onChange={() => {}}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Priority</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(['Low', 'Medium', 'High', 'Urgent'] as const).map(p => {
                            const isP = batchPriority === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setBatchPriority(p)}
                                style={{
                                  flex: 1,
                                  border: '1px solid',
                                  borderColor: isP ? '#E8760A' : '#DDD0C4',
                                  background: isP ? 'rgba(232,118,10,0.08)' : '#ffffff',
                                  color: isP ? '#E8760A' : '#2A1628',
                                  padding: '0.45rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: isP ? 700 : 500,
                                  cursor: 'pointer'
                                }}
                              >
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* SECTION 2: Client Selection */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        Client Selection
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="Search clients..."
                            style={{ width: '100%', padding: '0.45rem 0.5rem 0.45rem 1.8rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.75rem', outline: 'none' }}
                          />
                          <svg style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(42,22,40,0.4)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <CustomSelect
                          value={batchIndustryFilter}
                          options={['All Industries', 'Technology', 'Real Estate', 'Trading & Retail', 'Manufacturing', 'Logistics']}
                          onChange={(val) => setBatchIndustryFilter(val)}
                        />
                        <CustomSelect
                          value={batchCountryFilter}
                          options={['All Countries', 'UAE', 'Saudi Arabia']}
                          onChange={(val) => setBatchCountryFilter(val)}
                        />
                      </div>

                      {/* Multi Select Checklist */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {['ABC Trading LLC', 'XYZ Holdings Limited', 'Delta Properties FZCO', 'Alpha Tech FZCO', 'Beta Industries LLC', 'Gamma Solutions FZCO'].map(c => {
                          const isSel = selectedBatchClients.includes(c);
                          return (
                            <button
                              key={c}
                              onClick={() => {
                                if (isSel) {
                                  setSelectedBatchClients(selectedBatchClients.filter(x => x !== c));
                                } else {
                                  setSelectedBatchClients([...selectedBatchClients, c]);
                                }
                              }}
                              style={{
                                border: '1px solid',
                                borderColor: isSel ? '#E8760A' : '#DDD0C4',
                                background: isSel ? 'rgba(232, 118, 10, 0.08)' : '#ffffff',
                                color: isSel ? '#E8760A' : '#2A1628',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: isSel ? 700 : 500,
                                cursor: 'pointer'
                              }}
                            >
                              {isSel ? '✓ ' : ''}{c}
                            </button>
                          );
                        })}
                      </div>

                      <div style={{ background: '#FAF8F5', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.04)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700 }}>SELECTED CLIENTS ({selectedBatchClients.length}):</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {selectedBatchClients.map(c => (
                            <div key={c} style={{ fontSize: '0.7rem', color: '#2A1628', background: '#fff', border: '1px solid rgba(42,22,40,0.06)', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                              {c} <span style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.4)' }}>(Manager: Mahesh · Bookkeeper: John)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Document Scope */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        Document Scope
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                        {[
                          { name: 'Purchase Invoices', desc: 'Accounts payable' },
                          { name: 'Sales Invoices', desc: 'Accounts receivable' },
                          { name: 'Receipts', desc: 'Expense slips' },
                          { name: 'Bank Statements', desc: 'Bank reconciliation' },
                          { name: 'Credit Notes', desc: 'Vendor credit adjust' },
                          { name: 'Debit Notes', desc: 'Customer debit adjust' },
                          { name: 'VAT Documents', desc: 'Tax return records' },
                          { name: 'Payroll', desc: 'Salary ledger lines' },
                          { name: 'Corporate Tax', desc: 'Annual tax filing' },
                          { name: 'Trial Balance', desc: 'Period-end trial verification' },
                          { name: 'General Ledger', desc: 'Full journal ledger export' },
                          { name: 'Journal Entries', desc: 'Manual adjustments' },
                          { name: 'Other', desc: 'Miscellaneous support' }
                        ].map(opt => {
                          const isChecked = selectedDocTypes.includes(opt.name);
                          return (
                            <label
                              key={opt.name}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                padding: '0.6rem',
                                border: '1px solid',
                                borderColor: isChecked ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                background: isChecked ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                                borderRadius: '10px',
                                fontSize: '0.725rem',
                                color: '#2A1628',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedDocTypes(selectedDocTypes.filter(x => x !== opt.name));
                                  } else {
                                    setSelectedDocTypes([...selectedDocTypes, opt.name]);
                                  }
                                }}
                                style={{ accentColor: '#E8760A', marginTop: '2px' }}
                              />
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.725rem', color: '#2A1628' }}>{opt.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(42,22,40,0.45)' }}>{opt.desc}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 4: Processing Pipeline */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        Processing Pipeline Options
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                          { name: 'OCR', label: 'Enable OCR', desc: 'Extract raw text & characters' },
                          { name: 'AI Extraction', label: 'Enable AI Extraction', desc: 'Identify metadata & line items' },
                          { name: 'Ledger Mapping', label: 'Enable Ledger Mapping', desc: 'Auto-match to chart of accounts' },
                          { name: 'Duplicate Detection', label: 'Enable Duplicate Detection', desc: 'Prevent identical records in queue' },
                          { name: 'Tax Validation', label: 'Enable Tax Validation', desc: 'Verify tax rates & TRN matches' },
                          { name: 'Auto Categorization', label: 'Enable Auto Categorization', desc: 'Group transactions automatically' },
                          { name: 'QuickBooks Preparation', label: 'Enable QuickBooks Preparation', desc: 'Format for one-click QuickBooks sync' },
                          { name: 'AI Quality Review', label: 'Enable AI Quality Review', desc: 'High-accuracy human-in-the-loop audit' }
                        ].map(opt => {
                          const isChecked = batchPipelineOptions.includes(opt.name);
                          return (
                            <label
                              key={opt.name}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.625rem',
                                padding: '0.75rem',
                                background: isChecked ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                                border: '1px solid',
                                borderColor: isChecked ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: isChecked ? '0 2px 10px rgba(232, 118, 10, 0.04)' : 'none'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setBatchPipelineOptions(batchPipelineOptions.filter(x => x !== opt.name));
                                  } else {
                                    setBatchPipelineOptions([...batchPipelineOptions, opt.name]);
                                  }
                                }}
                                style={{ accentColor: '#E8760A', marginTop: '3px' }}
                              />
                              <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{opt.label}</span>
                                <span style={{ display: 'block', fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{opt.desc}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 5: Assignment */}
                    <div>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        Assignment & Timeline
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <CustomSelect
                            label="Assign Manager"
                            value={batchManager}
                            options={['Mahesh Maddu', 'Priya Nair', 'Rohit Sharma']}
                            onChange={(val) => setBatchManager(val)}
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="Assign Bookkeeper"
                            value={batchBookkeeper}
                            options={['John Doe', 'Emma Watson', 'Sarah Khan']}
                            onChange={(val) => setBatchBookkeeper(val)}
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="Assign Reviewer"
                            value={batchReviewer}
                            options={['Alex Mercer', 'Liam Neeson', 'Sarah Khan']}
                            onChange={(val) => setBatchReviewer(val)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Due Date</label>
                          <input
                            type="date"
                            value={batchDueDate}
                            onChange={(e) => setBatchDueDate(e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="SLA Target"
                            value={batchSla}
                            options={['12 Hours', '24 Hours', '48 Hours', '5 Days']}
                            onChange={(val) => setBatchSla(val)}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.35rem' }}>Internal Notes</label>
                        <textarea
                          placeholder="Provide specific notes or special compliance instructions..."
                          value={batchNotes}
                          onChange={(e) => setBatchNotes(e.target.value)}
                          rows={2}
                          style={{ width: '100%', padding: '0.55rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Sticky Summary Panel */}
                  <div style={{ width: '320px', borderLeft: '1px solid #DDD0C4', background: '#FAF8F5', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                    <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#2A1628', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch Preview</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Batch ID</span>
                        <strong style={{ color: '#2A1628' }}>BAT-2026-Q3-0892</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Selected Clients</span>
                        <strong style={{ color: '#2A1628' }}>{selectedBatchClients.length} Clients</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Doc Types</span>
                        <strong style={{ color: '#2A1628' }}>{selectedDocTypes.length} Types</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Estimated Docs</span>
                        <strong style={{ color: '#E8760A' }}>
                          {selectedBatchClients.length * selectedDocTypes.length * 15} docs
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Processing Time</span>
                        <strong style={{ color: '#E8760A' }}>
                          ~{(selectedBatchClients.length * selectedDocTypes.length * 1.5).toFixed(1)} mins
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>AI Credits Est.</span>
                        <strong style={{ color: '#2A1628' }}>
                          {selectedBatchClients.length * selectedDocTypes.length * 45} CR
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Queue Stage</span>
                        <strong style={{ color: '#2A1628' }}>OCR & Extraction</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Status</span>
                        <span style={{ color: '#047857', fontWeight: 700 }}>Ready</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8760A' }}>Verify Success Dialog</span>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.3, marginBottom: '0.5rem' }}>Jump directly to final success screen view:</p>
                      <button onClick={() => setBatchState('success')} style={{ width: '100%', padding: '0.35rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Show Success Layout</button>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '1rem 2rem', background: '#FAF8F5', borderTop: '1px solid #DDD0C4', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    onClick={() => { setBatchOpen(false); setBatchState('form'); }}
                    style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      triggerToast('Batch configurations saved as draft.', 'info');
                      setBatchOpen(false);
                    }}
                    style={{ background: '#ffffff', border: '1px solid #2A1628', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => {
                      if (!batchName.trim()) {
                        triggerToast('Validation Error: Batch Name Required', 'error');
                        return;
                      }
                      if (selectedBatchClients.length === 0) {
                        triggerToast('Validation Error: At least one Client Required', 'error');
                        return;
                      }
                      if (selectedDocTypes.length === 0) {
                        triggerToast('Validation Error: At least one Document Type Required', 'error');
                        return;
                      }
                      if (batchName.toLowerCase() === 'duplicate') {
                        triggerToast('Warning: Duplicate Batch Name Detected', 'error');
                        return;
                      }
                      setBatchState('success');
                    }}
                    style={{ background: '#E8760A', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Create Batch
                  </button>
                  <button
                    onClick={() => {
                      if (!batchName.trim()) {
                        triggerToast('Validation Error: Batch Name Required', 'error');
                        return;
                      }
                      if (selectedBatchClients.length === 0) {
                        triggerToast('Validation Error: At least one Client Required', 'error');
                        return;
                      }
                      if (selectedDocTypes.length === 0) {
                        triggerToast('Validation Error: At least one Document Type Required', 'error');
                        return;
                      }
                      setBatchState('success');
                    }}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Create & Upload Documents
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {exportOpen && (
        <div onClick={() => { setExportOpen(false); setExportState('form'); }} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '980px', height: '85vh', maxHeight: '720px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAF8F5', flexShrink: 0 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#E8760A', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI Bookkeeping Queue</p>
                <h2 style={{ margin: '0.15rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#2A1628' }}>
                  Export Queue Data
                </h2>
              </div>
              <button onClick={() => { setExportOpen(false); setExportState('form'); }} style={{ background: 'rgba(42,22,40,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Modal states */}
            {exportState === 'loading' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem' }}>
                  <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '80px', height: '80px', border: '6px solid rgba(232, 118, 10, 0.1)', borderRadius: '50%' }} />
                  <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '80px', height: '80px', border: '6px solid transparent', borderTopColor: '#E8760A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Preparing Export...</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(42,22,40,0.5)', maxWidth: '360px', margin: '0 auto 1.5rem' }}>Gathering job list records and compiling requested spreadsheets.</p>
                <div style={{ width: '320px', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: '#047857' }}>✓ Collecting Queue Data</span>
                    <strong style={{ color: '#2A1628' }}>Done</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: '#E8760A' }}>🗲 Generating Report...</span>
                    <strong style={{ color: '#E8760A' }}>65%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: 'rgba(42,22,40,0.45)' }}>✦ Compressing Files</span>
                    <strong style={{ color: 'rgba(42,22,40,0.45)' }}>Waiting</strong>
                  </div>
                </div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : exportState === 'success' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(4,120,87,0.08)', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Export Ready</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)', maxWidth: '420px', margin: '0 0 2rem' }}>Your bookkeeping jobs export file has been generated successfully and is ready for download.</p>
                
                <div style={{ width: '420px', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(42,22,40,0.05)', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>File Name</span>
                    <strong style={{ color: '#2A1628' }}>ai_bookkeeping_export_{exportDateRange.toLowerCase().replace(' ', '_')}.{exportFormat}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                    <span>Generated Time</span>
                    <strong style={{ color: '#2A1628' }}>Just Now</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => {
                    const token = localStorage.getItem('crm_access_token');
                    const format = exportFormat === 'csv' ? 'csv' : 'xlsx';
                    window.open(`http://localhost:5000/api/v1/ai-queue/export?token=${token}&format=${format}`, '_blank');
                    setExportOpen(false);
                    setExportState('form');
                    triggerToast('Download started.', 'success');
                  }} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Download</button>
                  <button onClick={() => triggerToast('Share link copied to clipboard.', 'info')} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Share</button>
                  <button onClick={() => { setExportOpen(false); setExportState('form'); }} style={{ background: '#ffffff', color: 'rgba(42,22,40,0.5)', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            ) : exportState === 'error' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.08)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12.01" y2="19"/><line x1="12" y1="5" x2="12" y2="15"/></svg>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2A1628', margin: '0 0 0.5rem 0' }}>Export Failed</h3>
                <p style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 600, maxWidth: '420px', margin: '0 0 2rem' }}>Error: Server connection timed out during file generation</p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setExportState('form')} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Retry Export</button>
                  <button onClick={() => { setExportOpen(false); setExportState('form'); }} style={{ background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {/* Left Column: Form Fields */}
                  <div className="client-table-scroll" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>
                      Export bookkeeping jobs, processing history and AI pipeline data for reporting, auditing or compliance.
                    </p>

                    {/* SECTION 1: WHAT TO EXPORT? */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        1. What to Export?
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          { key: 'entire', title: 'Entire Queue', desc: 'Export every bookkeeping job.', count: queueList.length },
                          { key: 'filtered', title: 'Filtered Results', desc: 'Export current filter results.', count: 4 },
                          { key: 'selected', title: 'Selected Jobs', desc: 'Export only selected rows.', count: selectedRows.length }
                        ].map(item => {
                          const isScope = exportScope === item.key;
                          return (
                            <label
                              key={item.key}
                              onClick={() => setExportScope(item.key as 'entire' | 'filtered' | 'selected' | 'stage')}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.625rem',
                                padding: '0.75rem',
                                background: isScope ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                                border: '1px solid',
                                borderColor: isScope ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="radio"
                                name="exportScope"
                                checked={isScope}
                                onChange={() => {}}
                                style={{ accentColor: '#E8760A', marginTop: '3px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <strong style={{ fontSize: '0.75rem', color: '#2A1628' }}>{item.title}</strong>
                                  <span style={{ fontSize: '0.65rem', background: 'rgba(42,22,40,0.06)', color: '#2A1628', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>{item.count}</span>
                                </div>
                                <span style={{ display: 'block', fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{item.desc}</span>
                              </div>
                            </label>
                          );
                        })}

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          background: exportScope === 'stage' ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                          border: '1px solid',
                          borderColor: exportScope === 'stage' ? '#E8760A' : 'rgba(42,22,40,0.08)',
                          borderRadius: '12px',
                          cursor: 'pointer'
                        }}
                          onClick={() => setExportScope('stage')}
                        >
                          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                            <input
                              type="radio"
                              name="exportScope"
                              checked={exportScope === 'stage'}
                              onChange={() => {}}
                              style={{ accentColor: '#E8760A' }}
                            />
                            <strong style={{ fontSize: '0.75rem', color: '#2A1628' }}>Queue Stage</strong>
                          </div>
                          <CustomSelect
                            value={exportStageVal}
                            options={['Uploaded', 'OCR', 'AI Extraction', 'Ledger Mapping', 'Review', 'Approved', 'Rejected', 'Exceptions', 'Ready For Reconciliation', 'Completed']}
                            onChange={(val) => { setExportScope('stage'); setExportStageVal(val); }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: EXPORT CONTENT */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        2. Export Content
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                        {[
                          'Client Information', 'Document Information', 'OCR Results', 'AI Extracted Fields',
                          'Ledger Mapping', 'Validation Results', 'Reviewer Information', 'Processing Timeline',
                          'Queue Status', 'AI Confidence Scores', 'Processing Time', 'Exception Details',
                          'Audit Trail', 'QuickBooks Status', 'Notes'
                        ].map(field => {
                          const isChecked = exportFields.includes(field);
                          return (
                            <label
                              key={field}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.6rem',
                                border: '1px solid',
                                borderColor: isChecked ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                background: isChecked ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                                borderRadius: '10px',
                                fontSize: '0.725rem',
                                color: '#2A1628',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setExportFields(exportFields.filter(x => x !== field));
                                  } else {
                                    setExportFields([...exportFields, field]);
                                  }
                                }}
                                style={{ accentColor: '#E8760A' }}
                              />
                              {field}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 3: DATE RANGE */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        3. Date Range
                      </h3>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range'].map(range => {
                          const isSel = exportDateRange === range;
                          return (
                            <button
                              key={range}
                              type="button"
                              onClick={() => setExportDateRange(range)}
                              style={{
                                border: '1px solid',
                                borderColor: isSel ? '#E8760A' : '#DDD0C4',
                                background: isSel ? 'rgba(232, 118, 10, 0.08)' : '#ffffff',
                                color: isSel ? '#E8760A' : '#2A1628',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: isSel ? 700 : 500,
                                cursor: 'pointer'
                              }}
                            >
                              {range}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 4: FILE FORMAT */}
                    <div style={{ borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '1.5rem' }}>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        4. File Format
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem' }}>
                        {[
                          { key: 'xlsx', name: 'Excel (.XLSX)', desc: 'Full worksheets' },
                          { key: 'csv', name: 'CSV', desc: 'Flat text records' },
                          { key: 'pdf', name: 'PDF Report', desc: 'Styled layout file' },
                          { key: 'print', name: 'Print', desc: 'Direct print layout' },
                          { key: 'json', name: 'JSON', desc: 'Raw metadata data' }
                        ].map(fmt => {
                          const isSel = exportFormat === fmt.key;
                          return (
                            <button
                              key={fmt.key}
                              type="button"
                              onClick={() => setExportFormat(fmt.key as 'xlsx' | 'csv' | 'pdf' | 'print' | 'json')}
                              style={{
                                background: isSel ? '#2A1628' : '#ffffff',
                                border: '1px solid',
                                borderColor: isSel ? '#2A1628' : '#DDD0C4',
                                color: isSel ? '#ffffff' : '#2A1628',
                                borderRadius: '10px',
                                padding: '0.75rem 0.5rem',
                                fontSize: '0.725rem',
                                fontWeight: isSel ? 700 : 500,
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                alignItems: 'center',
                                justifySelf: 'stretch'
                              }}
                            >
                              <strong style={{ fontSize: '0.725rem' }}>{fmt.name}</strong>
                              <span style={{ fontSize: '0.55rem', color: isSel ? 'rgba(255,255,255,0.7)' : 'rgba(42,22,40,0.45)' }}>{fmt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SECTION 5: EXPORT OPTIONS */}
                    <div>
                      <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#2a1628', borderLeft: '3px solid #E8760A', paddingLeft: '0.5rem' }}>
                        5. Export Options
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                        {[
                          'Include Charts', 'Include Summary', 'Include Audit Log', 'Password Protect PDF', 'Compress Files'
                        ].map(opt => {
                          const isChecked = exportOptions.includes(opt);
                          return (
                            <label
                              key={opt}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.6rem',
                                border: '1px solid',
                                borderColor: isChecked ? '#E8760A' : 'rgba(42,22,40,0.08)',
                                background: isChecked ? 'rgba(232, 118, 10, 0.04)' : '#ffffff',
                                borderRadius: '10px',
                                fontSize: '0.725rem',
                                color: '#2A1628',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setExportOptions(exportOptions.filter(x => x !== opt));
                                  } else {
                                    setExportOptions([...exportOptions, opt]);
                                  }
                                }}
                                style={{ accentColor: '#E8760A' }}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Sticky Summary Panel */}
                  <div style={{ width: '320px', borderLeft: '1px solid #DDD0C4', background: '#FAF8F5', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
                    <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#2A1628', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export Preview</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Scope</span>
                        <strong style={{ color: '#2A1628', textTransform: 'capitalize' }}>{exportScope}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Jobs</span>
                        <strong style={{ color: '#2A1628' }}>
                          {exportScope === 'entire' ? queueList.length : exportScope === 'selected' ? selectedRows.length : 4} jobs
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Clients</span>
                        <strong style={{ color: '#2A1628' }}>
                          {exportScope === 'entire' ? 6 : exportScope === 'selected' ? selectedRows.length || 1 : 2} Clients
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Fields Selected</span>
                        <strong style={{ color: '#2A1628' }}>{exportFields.length} Fields</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Format</span>
                        <strong style={{ color: '#E8760A', textTransform: 'uppercase' }}>{exportFormat}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Est. File Size</span>
                        <strong style={{ color: '#2A1628' }}>
                          {((exportFields.length * (exportScope === 'entire' ? queueList.length : 4) * 0.8) / 1024 + 0.1).toFixed(2)} MB
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem' }}>
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Generation Time</span>
                        <strong style={{ color: '#E8760A' }}>~2.5s</strong>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8760A' }}>Simulate Export Error</span>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.3, marginBottom: '0.5rem' }}>Jump directly to final error layout state:</p>
                      <button onClick={() => setExportState('error')} style={{ width: '100%', padding: '0.35rem', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Show Error Layout</button>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '1rem 2rem', background: '#FAF8F5', borderTop: '1px solid #DDD0C4', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    onClick={() => { setExportOpen(false); setExportState('form'); }}
                    style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      triggerToast('Export job has been scheduled in background.', 'info');
                      setExportOpen(false);
                    }}
                    style={{ background: '#ffffff', border: '1px solid #2A1628', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    Schedule Export
                  </button>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('crm_access_token');
                      const format = exportFormat === 'csv' ? 'csv' : 'xlsx';
                      window.open(`http://localhost:5000/api/v1/ai-queue/export?token=${token}&format=${format}`, '_blank');
                      setExportOpen(false);
                      triggerToast('Download started.', 'success');
                    }}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Download Export
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {bulkModal.type !== null && (
        <div onClick={() => setBulkModal({ type: null, title: '' })} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
            <div style={{ background: '#FAF8F5', padding: '1.25rem 1.5rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2A1628' }}>{bulkModal.title}</h3>
              <button onClick={() => setBulkModal({ type: null, title: '' })} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bulkModal.type === 'reviewer' && (
                <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem' }}>
                  <option value="">Select Reviewer...</option>
                  {filterOptions.reviewer.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
              {bulkModal.type === 'notes' && (
                <textarea placeholder="Type bulk comments..." value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ width: '100%', height: '80px', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', fontFamily: 'inherit' }} />
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setBulkModal({ type: null, title: '' })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628' }}>Cancel</button>
              <button onClick={async () => {
                try {
                  if (bulkModal.type === 'reviewer') {
                    await bulkUpdateQueue({ ids: selectedRows, action: 'reviewer', value: bulkValue }).unwrap();
                    triggerToast(`Assigned ${bulkValue} to selected jobs.`, 'success');
                  } else if (bulkModal.type === 'notes') {
                    await bulkUpdateQueue({ ids: selectedRows, action: 'notes', value: bulkValue }).unwrap();
                    triggerToast('Notes appended to selected jobs successfully.', 'success');
                  }
                } catch (err: any) {
                  triggerToast('Failed to apply bulk update', 'error');
                }
                setSelectedRows([]);
                setBulkModal({ type: null, title: '' });
                setBulkValue('');
              }} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM TOAST NOTIFICATION ── */}
      {toast.type !== null && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'success' ? '#047857' : toast.type === 'error' ? '#EF4444' : '#2A1628',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(42,22,40,0.15)',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }}>
          {toast.type === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          {toast.type === 'error' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {toast.type === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          {toast.message}
        </div>
      )}
    </div>
  );
}
