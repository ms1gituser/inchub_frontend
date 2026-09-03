'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Pagination from '@/components/ui/Pagination';
import {
  useGetQueueQuery, useGetStatsQuery, useGetAnalyticsQuery, useGetDrawerDetailsQuery, useGetMetadataQuery,
  usePostConnectMutation, usePostBulkMutation, usePostNoteMutation, usePostDocumentMutation,
} from '@/lib/qboConnectionsApi';

// ============================================================================
// Types
// ============================================================================

interface QboConnectionItem {
  id: string;
  company: string;
  qboCompanyId: string;
  connectionStatus: 'Connected' | 'Disconnected' | 'Pending Sync' | 'Syncing' | 'Failed' | 'Paused' | 'Archived';
  syncType: 'Full Sync' | 'Invoice Sync' | 'Payment Sync' | 'Journal Sync' | 'Tax Sync';
  lastSync: string;
  invoicesCount: number;
  paymentsCount: number;
  journalEntriesCount: number;
  syncErrorsCount: number;
  successRate: number;
  manager: string;
  updated: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  realmId: string;
  apiVersion: string;
  environment: 'Production' | 'Sandbox';
  connectedUser: string;
  scopes: string[];
  autoSync: boolean;
  syncFrequency: string;
}

// Type interfaces are inline or inferred for mock data elements.

interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'danger' | 'info' | 'warning';
}

// ============================================================================
// Mock Data
// ============================================================================

const INITIAL_CONNECTIONS: QboConnectionItem[] = [
  {
    id: 'qbo-1',
    company: 'ABC Trading LLC',
    qboCompanyId: '901927384',
    connectionStatus: 'Connected',
    syncType: 'Full Sync',
    lastSync: '7 mins ago',
    invoicesCount: 1450,
    paymentsCount: 1280,
    journalEntriesCount: 520,
    syncErrorsCount: 0,
    successRate: 100,
    manager: 'John Doe',
    updated: '2026-05-07',
    priority: 'High',
    realmId: '901927384',
    apiVersion: 'v3',
    environment: 'Production',
    connectedUser: 'inc.hub.qbo@intuit.com',
    scopes: ['com.intuit.quickbooks.accounting', 'com.intuit.quickbooks.payment'],
    autoSync: true,
    syncFrequency: 'Daily'
  },
  {
    id: 'qbo-2',
    company: 'XYZ Holdings Limited',
    qboCompanyId: '901927385',
    connectionStatus: 'Connected',
    syncType: 'Invoice Sync',
    lastSync: '2 hours ago',
    invoicesCount: 890,
    paymentsCount: 820,
    journalEntriesCount: 310,
    syncErrorsCount: 0,
    successRate: 100,
    manager: 'Mike Brown',
    updated: '2026-05-07',
    priority: 'High',
    realmId: '901927385',
    apiVersion: 'v3',
    environment: 'Production',
    connectedUser: 'xyz.qbo@holdings.com',
    scopes: ['com.intuit.quickbooks.accounting'],
    autoSync: true,
    syncFrequency: 'Daily'
  },
  {
    id: 'qbo-3',
    company: 'Delta Properties FZCO',
    qboCompanyId: '901927386',
    connectionStatus: 'Pending Sync',
    syncType: 'Journal Sync',
    lastSync: '1 day ago',
    invoicesCount: 2100,
    paymentsCount: 1980,
    journalEntriesCount: 850,
    syncErrorsCount: 3,
    successRate: 98.4,
    manager: 'John Doe',
    updated: '2026-05-06',
    priority: 'Medium',
    realmId: '901927386',
    apiVersion: 'v3',
    environment: 'Sandbox',
    connectedUser: 'delta.qbo@properties.com',
    scopes: ['com.intuit.quickbooks.accounting', 'com.intuit.quickbooks.payment'],
    autoSync: false,
    syncFrequency: 'Manual'
  },
  {
    id: 'qbo-4',
    company: 'Alpha Tech FZCO',
    qboCompanyId: '901927387',
    connectionStatus: 'Connected',
    syncType: 'Tax Sync',
    lastSync: '3 days ago',
    invoicesCount: 420,
    paymentsCount: 410,
    journalEntriesCount: 150,
    syncErrorsCount: 0,
    successRate: 100,
    manager: 'Sneha Iyer',
    updated: '2026-05-04',
    priority: 'Low',
    realmId: '901927387',
    apiVersion: 'v3',
    environment: 'Production',
    connectedUser: 'alpha.qbo@tech.com',
    scopes: ['com.intuit.quickbooks.accounting'],
    autoSync: true,
    syncFrequency: 'Weekly'
  },
  {
    id: 'qbo-5',
    company: 'Beta Industries LLC',
    qboCompanyId: '901927388',
    connectionStatus: 'Failed',
    syncType: 'Full Sync',
    lastSync: '1 week ago',
    invoicesCount: 3100,
    paymentsCount: 2950,
    journalEntriesCount: 1100,
    syncErrorsCount: 12,
    successRate: 94.2,
    manager: 'John Doe',
    updated: '2026-05-01',
    priority: 'Urgent',
    realmId: '901927388',
    apiVersion: 'v3',
    environment: 'Production',
    connectedUser: 'beta.qbo@industries.com',
    scopes: ['com.intuit.quickbooks.accounting', 'com.intuit.quickbooks.payment'],
    autoSync: true,
    syncFrequency: 'Daily'
  }
];

const MANAGERS = ['John Doe', 'Mike Brown', 'Sneha Iyer', 'Priya Nair'];
const CONNECTION_STATUSES = ['All', 'Connected', 'Disconnected', 'Pending Sync', 'Syncing', 'Failed', 'Paused', 'Archived'];
const SYNC_TYPES = ['All', 'Full Sync', 'Invoice Sync', 'Payment Sync', 'Journal Sync', 'Tax Sync'];
const ENVIRONMENTS = ['All', 'Production', 'Sandbox'];

// FocusTrap helper
interface FocusTrapProps {
  children: React.ReactNode;
  onEscape: () => void;
}

function FocusTrap({ children, onEscape }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
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



// ── HIGH FIDELITY QBO IMPORT MODAL ──
interface QboImportModalProps {
  onClose: () => void;
  onImport: (fileName: string, companyId: string) => void;
}

function QboImportModal({ onClose, onImport }: QboImportModalProps) {
  const [importTab, setImportTab] = useState<'local' | 'gdrive' | 'onedrive'>('local');
  const [importFile, setImportFile] = useState('');
  const [importRealm, setImportRealm] = useState('');
  const [importSyncScope, setImportSyncScope] = useState('All Records');

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="QuickBooks Center"
      titlePlain="Import QBO"
      titleAccent="Ledger"
      maxWidth="800px"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onImport(importFile || 'Cloud_Sync_QBO.xlsx', importRealm || '901927384')}
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
            Import QBO Ledger
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
            onClick={() => {
              setImportFile('QuickBooks_Ledger_Extract_Q1.xlsx');
              setImportRealm('901927384');
            }}
          >
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
                {importFile ? importFile : 'Drag & drop your QuickBooks Excel ledger database here'}
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
                      ? 'Sign in with Google to browse and select a QuickBooks backup file from your Drive'
                      : 'Sign in with Microsoft to browse and select a QuickBooks backup file from your OneDrive'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImportFile(importTab === 'gdrive' ? 'Google_Drive_QBO_Import.xlsx' : 'OneDrive_QBO_Import.xlsx');
                    setImportRealm('901927384');
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
          Supported ledger columns: <span style={{ color: 'rgba(42,22,40,0.45)' }}>Account, Txn Type, Date, Ref No., Name, Memo, Debit, Credit</span>. <span style={{ color: '#E8760A', fontWeight: 600, cursor: 'pointer' }}>Download template schema →</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>Sync Scope</label>
            <CustomSelect
              value={importSyncScope}
              onChange={setImportSyncScope}
              options={['All Records', 'Invoices Only', 'Payments Only', 'Journal Entries Only']}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>QuickBooks Realm ID</label>
            <input
              type="text"
              placeholder="e.g. 901927384"
              value={importRealm}
              onChange={(e) => setImportRealm(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box', fontFamily: 'inherit', height: '38px' }}
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ── HIGH FIDELITY QBO EXPORT MODAL ──
interface QboExportModalProps {
  onClose: () => void;
  onExport: (format: string, scope: string) => void;
}

function QboExportModal({ onClose, onExport }: QboExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'print'>('excel');
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('filtered');

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="QuickBooks Center"
      titlePlain="Export"
      titleAccent="Compilations"
      maxWidth="520px"
      bodyStyle={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500 }}>
            Exporting as <strong style={{ color: '#2A1628' }}>.{exportFormat === 'excel' ? 'XLSX' : exportFormat.toUpperCase()}</strong>
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onExport(exportFormat, exportScope)}
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
          WHICH RETURNS TO EXPORT?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { key: 'all' as const, title: 'All Compilations', desc: 'Export all records in the Reports center register', badge: '5 companies' },
            { key: 'filtered' as const, title: 'Filtered Results', desc: 'Only records matching current active filters', badge: '5 companies' },
            { key: 'selected' as const, title: 'Selected Returns', desc: 'Only the returns you have checked', badge: '0 companies' },
          ].map((scopeOption) => {
            const isSel = exportScope === scopeOption.key;
            return (
              <div
                key={scopeOption.key}
                onClick={() => setExportScope(scopeOption.key)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: isSel ? '1.5px solid #E8760A' : '1px solid rgba(42,22,40,0.06)',
                  background: isSel ? 'rgba(232,118,10,0.02)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: isSel ? '5px solid #E8760A' : '1px solid #DDD0C4',
                    background: '#ffffff', boxSizing: 'border-box'
                  }} />
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>{scopeOption.title}</span>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>
                      {scopeOption.desc}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(42,22,40,0.04)', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>
                  {scopeOption.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem' }}>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          SELECT FORMAT
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { key: 'excel' as const, label: '.XLSX' },
            { key: 'csv' as const, label: '.CSV' },
            { key: 'pdf' as const, label: '.PDF' },
            { key: 'print' as const, label: 'PRINT' }
          ].map((fmt) => {
            const isFmtSel = exportFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                type="button"
                onClick={() => setExportFormat(fmt.key)}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '10px',
                  border: isFmtSel ? '1.5px solid #E8760A' : '1px solid rgba(42,22,40,0.06)',
                  background: isFmtSel ? 'rgba(232,118,10,0.02)' : '#ffffff',
                  color: isFmtSel ? '#E8760A' : '#2A1628',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem'
                }}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      </div>
    </ModalShell>
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
          height: '38px',
          lineHeight: '1.2',
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform 0.15s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [openUpward ? 'bottom' : 'top']: 'calc(100% + 4px)',
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(42,22,40,0.12)',
            zIndex: 110,
            padding: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
          className="hide-scrollbar"
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                color: '#2A1628',
                cursor: 'pointer',
                borderRadius: '8px',
                background: value === opt ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                fontWeight: value === opt ? 700 : 500,
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = value === opt ? 'rgba(232, 118, 10, 0.06)' : 'rgba(42,22,40,0.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = value === opt ? 'rgba(232, 118, 10, 0.06)' : 'transparent')}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuickBooksTab() {
  const { data: queueRes, isLoading: queueLoading, refetch } = useGetQueueQuery({ limit: 1000 });
  const { data: statsRes } = useGetStatsQuery();
  const { data: analyticsRes } = useGetAnalyticsQuery();
  const { data: metaRes } = useGetMetadataQuery();
  const [postConnect] = usePostConnectMutation();
  const [postBulk] = usePostBulkMutation();
  const [addNote] = usePostNoteMutation();
  const [addDocument] = usePostDocumentMutation();
  const dynamicManagers = metaRes?.data?.managers?.length ? metaRes.data.managers : MANAGERS;
  const dynamicClients = metaRes?.data?.clients || [];

  const [data, setData] = useState<QboConnectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const nextIdRef = useRef(100);

  // Sync queueRes.data into local state when it updates
  const prevQueueDataRef = useRef<QboConnectionItem[] | undefined>(undefined);
  if (queueRes?.data && queueRes.data !== prevQueueDataRef.current) {
    prevQueueDataRef.current = queueRes.data;
    setData(queueRes.data);
  }

  // Filter bar states
  const [filterManager, setFilterManager] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSyncType, setFilterSyncType] = useState('All');
  const [filterEnvironment, setFilterEnvironment] = useState('All');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Row selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Drawer layout trigger
  const [drawerTxId, setDrawerTxId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'connection' | 'mappings' | 'journalEntries' | 'invoices' | 'payments' | 'syncLogs' | 'validation' | 'timeline' | 'activity' | 'documents' | 'settings' | 'notes'>('overview');

  // Sub levels tab states
  const [mappingSubTab, setMappingSubTab] = useState<'accounts' | 'taxCodes' | 'customers' | 'vendors'>('accounts');
  const [drawerNoteTag, setDrawerNoteTag] = useState<'all' | 'internal' | 'ai' | 'audit' | 'pinned' | 'reviewer'>('all');

  // Modal open triggers
  const [popup, setPopup] = useState<{
    type: 'connect' | 'confirmDisconnect' | 'confirmReconnect' | 'confirmSync' | 'confirmPause' | 'confirmArchive' | 'confirmDelete' | 'confirmRetry' | 'confirmDeleteLogs' | 'import' | 'export' | null;
    tx?: QboConnectionItem;
  }>({ type: null });

  // Connect wizard states
  const [newCompany, setNewCompany] = useState('ABC Trading LLC');
  const [newRealmId, setNewRealmId] = useState('');
  const [newEnv, setNewEnv] = useState<'Production' | 'Sandbox'>('Production');
  const [newManager, setNewManager] = useState('John Doe');

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = (message: string, tone: 'success' | 'danger' | 'info' | 'warning') => {
    const id = String(nextIdRef.current++);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleRealConnect = async () => {
    try {
      pushToast('Connecting to QuickBooks...', 'info');
      const token = localStorage.getItem('crm_access_token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/bookkeeping/integrations/quickbooks/auth`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.authorizationUrl) {
        window.location.assign(data.authorizationUrl);
      } else {
        pushToast('Failed to initiate QuickBooks connection', 'danger');
      }
    } catch (err) {
      console.error(err);
      pushToast('Network error while connecting', 'danger');
    }
  };

  // Drag columns
  const dragKeyRef = useRef<string | null>(null);
  const [columns, setColumns] = useState<
    { key: keyof QboConnectionItem | 'actions'; label: string; width: string; sortable: boolean; align?: 'left' | 'right' | 'center' }[]
  >([
    { key: 'company', label: 'COMPANY', width: '200px', sortable: true },
    { key: 'qboCompanyId', label: 'QBO COMPANY ID', width: '130px', sortable: true },
    { key: 'connectionStatus', label: 'STATUS', width: '120px', sortable: true },
    { key: 'syncType', label: 'SYNC TYPE', width: '120px', sortable: true },
    { key: 'lastSync', label: 'LAST SYNC', width: '110px', sortable: true },
    { key: 'invoicesCount', label: 'INVOICES', width: '90px', sortable: true, align: 'right' },
    { key: 'paymentsCount', label: 'PAYMENTS', width: '90px', sortable: true, align: 'right' },
    { key: 'journalEntriesCount', label: 'JOURNALS', width: '90px', sortable: true, align: 'right' },
    { key: 'syncErrorsCount', label: 'ERRORS', width: '80px', sortable: true, align: 'right' },
    { key: 'successRate', label: 'SUCCESS %', width: '100px', sortable: true, align: 'right' },
    { key: 'manager', label: 'MANAGER', width: '110px', sortable: true },
  ]);

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

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      pushToast('QuickBooks connections successfully refreshed.', 'success');
    }, 400);
  };

  // Stats
  const stats = useMemo(() => {
    const connected = data.filter((x) => x.connectionStatus === 'Connected').length;
    const failed = data.filter((x) => x.connectionStatus === 'Failed').length;
    const errors = data.reduce((s, x) => s + x.syncErrorsCount, 0);
    const journals = data.reduce((s, x) => s + x.journalEntriesCount, 0);
    const invoices = data.reduce((s, x) => s + x.invoicesCount, 0);
    const payments = data.reduce((s, x) => s + x.paymentsCount, 0);
    return { connected, failed, errors, journals, invoices, payments };
  }, [data]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const map: Record<string, number> = { All: data.length };
    data.forEach((r) => {
      map[r.connectionStatus] = (map[r.connectionStatus] || 0) + 1;
    });
    return map;
  }, [data]);

  // Filter returns
  const filteredData = useMemo(() => {
    return data
      .filter((r) => {
        if (activeStatusTab !== 'All' && r.connectionStatus !== activeStatusTab) return false;
        if (filterManager !== 'All' && r.manager !== filterManager) return false;
        if (filterStatus !== 'All' && r.connectionStatus !== filterStatus) return false;
        if (filterSyncType !== 'All' && r.syncType !== filterSyncType) return false;
        if (filterEnvironment !== 'All' && r.environment !== filterEnvironment) return false;

        if (searchQuery.trim() !== '') {
          const s = searchQuery.toLowerCase();
          const matchCompany = r.company.toLowerCase().includes(s);
          const matchId = r.qboCompanyId.includes(s);
          const matchManager = r.manager.toLowerCase().includes(s);
          return matchCompany || matchId || matchManager;
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortCol) return 0;
        const v1 = a[sortCol as keyof QboConnectionItem];
        const v2 = b[sortCol as keyof QboConnectionItem];

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
  }, [data, activeStatusTab, filterManager, filterStatus, filterSyncType, filterEnvironment, searchQuery, sortCol, sortDir]);

  // Simulate loading skeleton
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
  }, [activeStatusTab, filterManager, filterStatus, filterSyncType, filterEnvironment, searchQuery]);

  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const { data: drawerDetailsRes } = useGetDrawerDetailsQuery(drawerTxId || '', { skip: !drawerTxId });
  const drawerMappings = drawerDetailsRes?.data?.mappings || [];
  const drawerJournalEntries = drawerDetailsRes?.data?.journalEntries || [];
  const drawerInvoices = drawerDetailsRes?.data?.invoices || [];
  const drawerPayments = drawerDetailsRes?.data?.payments || [];
  const drawerSyncLogs = drawerDetailsRes?.data?.syncLogs || [];
  const drawerValidationChecks = drawerDetailsRes?.data?.validationChecks || [];
  const drawerTimeline = drawerDetailsRes?.data?.timeline || [];
  const drawerActivityLog = drawerDetailsRes?.data?.activityLog || [];
  const drawerDocuments = drawerDetailsRes?.data?.documents || [];
  const drawerNotes = drawerDetailsRes?.data?.notes || [];
  const [quickQboNote, setQuickQboNote] = useState('');

  const activeTx = useMemo(() => {
    return drawerDetailsRes?.data?.connection || data.find((x) => x.id === drawerTxId) || null;
  }, [data, drawerTxId, drawerDetailsRes]);

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

  const triggerBulkAction = (action: string) => {
    if (selectedIds.length === 0) { pushToast('No connections selected.', 'warning'); return; }
    const actionMap: Record<string, string> = { delete: 'deleteConnections', sync: 'startSync', pause: 'pauseSync' };
    const backendAction = actionMap[action] || action;
    postBulk({ ids: selectedIds, action: backendAction })
      .unwrap()
      .then(() => {
        refetch();
        if (action === 'delete') pushToast(`${selectedIds.length} QuickBooks connections removed.`, 'danger');
        else if (action === 'sync') pushToast(`Triggered QuickBooks sync jobs for ${selectedIds.length} companies.`, 'success');
        else if (action === 'pause') pushToast(`Synchronization paused for ${selectedIds.length} companies.`, 'warning');
        setSelectedIds([]);
      })
      .catch(() => pushToast('Bulk action failed.', 'danger'));
  };

  // Context Actions Menu state
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [menuItem, setMenuItem] = useState<QboConnectionItem | null>(null);

  const handleMenuAction = (actionKey: string) => {
    if (!menuItem) return;
    if (actionKey === 'sync') {
      setPopup({ type: 'confirmSync', tx: menuItem });
    } else if (actionKey === 'pause') {
      setPopup({ type: 'confirmPause', tx: menuItem });
    } else if (actionKey === 'reconnect') {
      setPopup({ type: 'confirmReconnect', tx: menuItem });
    } else if (actionKey === 'disconnect') {
      setPopup({ type: 'confirmDisconnect', tx: menuItem });
    } else if (actionKey === 'delete') {
      setPopup({ type: 'confirmDelete', tx: menuItem });
    } else if (actionKey === 'archive') {
      setPopup({ type: 'confirmArchive', tx: menuItem });
    } else if (actionKey === 'drawer') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('overview');
    } else if (actionKey === 'openClient') {
      pushToast(`Opening client profile for ${menuItem.company}...`, 'info');
    } else if (actionKey === 'auditLog') {
      pushToast(`Loading QBO Audit logs for ${menuItem.company}...`, 'info');
    } else if (actionKey === 'downloadLogs') {
      pushToast(`Preparing API logs download for ${menuItem.company}...`, 'success');
    } else if (actionKey === 'exportData') {
      setPopup({ type: 'export', tx: menuItem });
    } else if (actionKey === 'viewSyncLogs') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('syncLogs');
    }
  };

  // Connection Submit — real OAuth: opens the QuickBooks authorization URL for the selected client
  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    postConnect({ company: newCompany })
      .unwrap()
      .then((res: any) => {
        setPopup({ type: null });
        if (res?.data?.authUrl && typeof window !== 'undefined') {
          window.open(res.data.authUrl, '_blank', 'noopener,noreferrer');
        }
        refetch();
        pushToast(`Redirecting to QuickBooks authorization for ${newCompany}...`, 'success');
      })
      .catch(() => pushToast('Failed to start QuickBooks connection.', 'danger'));
  };

  return (
    <div style={{ color: '#2A1628', fontFamily: 'var(--font-sans), Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'transparent' }}>
      
      {/* ── TOAST NOTIFICATIONS PORTAL ── */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10001 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: '#ffffff',
              boxShadow: '0 12px 32px rgba(42,22,40,0.12)',
              borderLeft: `4px solid ${t.tone === 'success' ? '#137333' : t.tone === 'danger' ? '#C5221F' : t.tone === 'warning' ? '#E8760A' : '#2A1628'}`,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#2A1628',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minWidth: '280px',
              animation: 'slideIn 0.3s ease forwards',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.tone === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              ) : t.tone === 'danger' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5221F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              ) : t.tone === 'warning' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              )}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── 1. HEADER SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #DDD0C4', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: '#E8760A', display: 'inline-block' }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              QuickBooks Center
            </p>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif', letterSpacing: '-0.02em' }}>
            QuickBooks <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Integration Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
            Manage QuickBooks Online connections, accounting synchronization, journal exports, invoice synchronization, payment mapping, reconciliation status, and audit synchronization.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleRealConnect}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Connect QuickBooks
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'import' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Import QBO
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'export' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export QBO
          </button>
          <button
            type="button"
            onClick={handleRefresh}
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

      {/* ── 2. KPI DASHBOARD (10 CARDS) ── */}
      <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { label: 'Connected Companies', value: stats.connected, sub: 'Active Integrations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18.36 6.64a9 9 0 0 1 0 12.73M6.01 7.97a5 5 0 0 1 0 8.06M12 2v20M17 12h5M2 12h5" /></svg> },
          { label: 'Pending Sync Jobs', value: data.filter(x => x.connectionStatus === 'Pending Sync').length, sub: 'Queued API Queue', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
          { label: 'Successful Sync Today', value: statsRes?.data?.syncedToday ?? 0, sub: 'Jobs Synced Today', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> },
          { label: 'Failed Sync Jobs', value: stats.failed, sub: 'Requires Authentication', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> },
          { label: 'Total Journal Entries', value: (statsRes?.data?.totalJournalEntries ?? stats.journals).toLocaleString(), sub: 'Double-entry Logs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5V4.5z" /></svg> },
          { label: 'Synced Invoices', value: (statsRes?.data?.syncedInvoices ?? stats.invoices).toLocaleString(), sub: 'Receivables Synced', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
          { label: 'Synced Payments', value: (statsRes?.data?.syncedPayments ?? stats.payments).toLocaleString(), sub: 'Settlements Reconciled', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
          { label: 'Last Sync Time', value: statsRes?.data?.lastSyncTime ? new Date(statsRes.data.lastSyncTime).toLocaleString() : 'Never', sub: 'Most Recent Sync', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
          { label: 'Sync Success Rate', value: `${statsRes?.data?.syncSuccessRate ?? 100}%`, sub: 'API Call Quality Ratio', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> },
          { label: 'Active API Connections', value: statsRes?.data?.activeApiConnections ?? stats.connected, sub: 'OAuth 2.0 Client Tokens', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5l-3-3" /></svg> },
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

      {/* ── 3. STATUS CHIPS TAB STRIP ── */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(42,22,40,0.04)' }} className="hide-scrollbar">
        {[
          { label: 'All', count: tabCounts.All },
          { label: 'Connected', count: tabCounts.Connected || 0 },
          { label: 'Disconnected', count: tabCounts.Disconnected || 0 },
          { label: 'Pending Sync', count: tabCounts['Pending Sync'] || 0 },
          { label: 'Syncing', count: tabCounts.Syncing || 0 },
          { label: 'Failed', count: tabCounts.Failed || 0 },
          { label: 'Paused', count: tabCounts.Paused || 0 },
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
              { label: 'Start Sync', ic: '🔄', actionKey: 'sync' },
              { label: 'Pause Sync', ic: '⏸️', actionKey: 'pause' },
              { label: 'Delete Connections', ic: '🗑️', actionKey: 'delete' },
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

      {/* ── 5. ENTERPRISE FILTERS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem', borderRadius: '12px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search company, QBO ID, manager..."
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
              height: '38px',
            }}
          />
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <CustomSelect value={filterManager} onChange={setFilterManager} options={['All', ...dynamicManagers]} placeholder="Manager" />
        <CustomSelect value={filterStatus} onChange={setFilterStatus} options={CONNECTION_STATUSES} placeholder="Status" />
        <CustomSelect value={filterSyncType} onChange={setFilterSyncType} options={SYNC_TYPES} placeholder="Sync Type" />
        <CustomSelect value={filterEnvironment} onChange={setFilterEnvironment} options={ENVIRONMENTS} placeholder="Environment" />
      </div>

      {/* ── 6. MAIN ENTERPRISE TABLE ── */}
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
                  const isCompany = col.key === 'company';
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
                        position: isCompany ? 'sticky' : undefined,
                        left: isCompany ? '48px' : undefined,
                        background: '#FAF8F5',
                        zIndex: isCompany ? 10 : undefined,
                        borderRight: isCompany ? '1px solid #DDD0C4' : undefined,
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
                      <td key={idx} style={{ padding: '1rem' }}><div style={{ width: col.key === 'company' ? '120px' : '60px', height: '12px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                    ))}
                    <td />
                  </tr>
                ))
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} style={{ padding: '4rem 3rem', textAlign: 'center', color: 'rgba(42,22,40,0.4)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2A1628', marginBottom: '0.25rem' }}>No connections found</div>
                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>Connect your first QuickBooks Online account to synchronize accounting data.</p>
                    <button
                      type="button"
                      onClick={handleRealConnect}
                      style={{ padding: '0.5rem 1rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Connect QuickBooks
                    </button>
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
                        const isCompany = col.key === 'company';
                        const cellVal = item[col.key as keyof QboConnectionItem];
                        let tdContent: React.ReactNode = String(cellVal ?? '');
                        let tdStyle: React.CSSProperties = {
                          padding: '0.625rem 1rem',
                          whiteSpace: 'nowrap',
                        };

                        if (col.key === 'company') {
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
                                {item.company.split(' ').map((x) => x[0]).join('').substr(0, 2)}
                              </div>
                              <div style={{ fontWeight: 700, color: '#2A1628' }}>{item.company}</div>
                            </div>
                          );
                        } else if (col.key === 'qboCompanyId') {
                          tdStyle = { ...tdStyle, color: 'rgba(42,22,40,0.75)', fontWeight: 500 };
                        } else if (col.key === 'connectionStatus') {
                          tdStyle = { ...tdStyle, fontWeight: 700 };
                          tdContent = (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background:
                                  item.connectionStatus === 'Connected'
                                    ? 'rgba(19,115,51,0.1)'
                                    : item.connectionStatus === 'Failed'
                                    ? 'rgba(197,34,31,0.1)'
                                    : 'rgba(42,22,40,0.08)',
                                color:
                                  item.connectionStatus === 'Connected'
                                    ? '#137333'
                                    : item.connectionStatus === 'Failed'
                                    ? '#C5221F'
                                    : '#2A1628',
                              }}
                            >
                              {item.connectionStatus}
                            </span>
                          );
                        } else if (col.key === 'successRate') {
                          tdStyle = { ...tdStyle, fontWeight: 700, color: item.successRate === 100 ? '#137333' : '#E8760A', textAlign: 'right' };
                          tdContent = `${item.successRate}%`;
                        } else if (col.key === 'invoicesCount' || col.key === 'paymentsCount' || col.key === 'journalEntriesCount' || col.key === 'syncErrorsCount') {
                          tdStyle = { ...tdStyle, textAlign: 'right', fontWeight: 600, color: col.key === 'syncErrorsCount' && item.syncErrorsCount > 0 ? '#C5221F' : '#2A1628' };
                          tdContent = typeof cellVal === 'number' ? cellVal.toLocaleString() : '0';
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
                              position: isCompany ? 'sticky' : tdStyle.position,
                              left: isCompany ? '48px' : tdStyle.left,
                              background: isCompany ? (isSelected ? '#FAF4EE' : '#ffffff') : (isSelected ? 'rgba(232,118,10,0.02)' : undefined),
                              zIndex: isCompany ? 8 : tdStyle.zIndex,
                              cursor: 'pointer',
                              textAlign: col.align || tdStyle.textAlign,
                            }}
                          >
                            {tdContent}
                          </td>
                        );
                      })}

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
                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
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
        <Pagination totalItems={filteredData.length} currentPage={currentPage} rowsPerPage={rowsPerPage} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} itemLabel="connections" />
      </div>

      {/* ── 6.5 EXECUTIVE ANALYTICS SECTION ── */}
      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: '#E8760A', display: 'inline-block' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            QuickBooks API Sync Health &amp; Analytics
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {/* Chart 1: Revenue Synced Trend */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Revenue Synced Trend</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Q1–Q4 Comparison</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 45 Q25 20 50 35 T100 10" fill="none" stroke="#E8760A" strokeWidth="1.5" />
              <path d="M0 48 Q25 38 50 42 T100 30" fill="none" stroke="#2A1628" strokeWidth="1.2" strokeDasharray="2 1" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#E8760A' }}>● Revenue</span>
              <span style={{ color: '#2A1628' }}>● Cost Sync</span>
            </div>
          </div>

          {/* Chart 2: Sync Activity Log */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Daily Sync Volume</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Sync executions counts</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <rect x="5" y="15" width="10" height="35" fill="#E8760A" rx="1" />
              <rect x="25" y="5" width="10" height="45" fill="#2A1628" rx="1" />
              <rect x="45" y="25" width="10" height="25" fill="#E8760A" rx="1" />
              <rect x="65" y="10" width="10" height="40" fill="#137333" rx="1" />
              <rect x="85" y="18" width="10" height="32" fill="#E8760A" rx="1" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#E8760A' }}>● Batches</span>
              <span style={{ color: '#137333' }}>● Success Peak</span>
            </div>
          </div>

          {/* Chart 3: Sync Success Rate */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Sync Success Rate</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Ratio distribution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '80px' }}>
              <svg width="60" height="60" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#DDD0C4" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="4" strokeDasharray="98.6 1.4" strokeDashoffset="25" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem', fontWeight: 600 }}>
                <span style={{ color: '#E8760A' }}>98.6% Completed</span>
                <span style={{ color: '#C5221F' }}>1.4% Blocked</span>
              </div>
            </div>
          </div>

          {/* Chart 4: QuickBooks API Health */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>QBO Gateway Health</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Latency rate (ms)</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 40 L10 40 L20 20 L30 45 L40 40 L50 10 L60 40 L70 42 L80 15 L90 40 L100 40" fill="none" stroke="#137333" strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#137333' }}>● 125ms Gateway Stable</span>
            </div>
          </div>

          {/* Chart 5: API Success Trend */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>API Success Trend</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Requests performance</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 10 L25 15 L50 8 L75 12 L100 5" fill="none" stroke="#137333" strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#137333' }}>● 99.8% Success Peak</span>
            </div>
          </div>

          {/* Chart 6: Sync Duration Trend */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Sync Duration Trend</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Average job runtime</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 45 L20 30 L40 38 L60 20 L80 25 L100 12" fill="none" stroke="#E8760A" strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#E8760A' }}>● Avg 48s runtime</span>
            </div>
          </div>

          {/* Chart 7: Gateway Latency Distribution */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Gateway Latency</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Response time jitter</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d="M0 25 Q25 45 50 15 T100 25" fill="none" stroke="#2A1628" strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#2A1628' }}>● Stable latency</span>
            </div>
          </div>

          {/* Chart 8: Daily API Calls */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 12px rgba(42,22,40,0.01)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>Daily API Calls</h4>
              <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Intuit backend requests</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
              <rect x="5" y="25" width="12" height="25" fill="#137333" rx="1" />
              <rect x="25" y="15" width="12" height="35" fill="#E8760A" rx="1" />
              <rect x="45" y="5" width="12" height="45" fill="#2A1628" rx="1" />
              <rect x="65" y="20" width="12" height="30" fill="#E8760A" rx="1" />
              <rect x="85" y="10" width="12" height="40" fill="#137333" rx="1" />
            </svg>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', fontWeight: 600 }}>
              <span style={{ color: '#137333' }}>● 15K req/day avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. ROW ACTIONS CONTEXT MENU ── */}
      {menuPos && menuItem && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setMenuPos(null)} />
          <div
            style={{
              position: 'fixed',
              top: Math.min(menuPos.top, window.innerHeight - 340),
              left: Math.min(menuPos.left - 210, window.innerWidth - 220),
              background: '#ffffff',
              border: '1px solid #DDD0C4',
              boxShadow: '0 8px 24px rgba(42,22,40,0.15)',
              borderRadius: '12px',
              padding: '4px',
              zIndex: 1000,
              minWidth: '220px',
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              maxHeight: '320px',
              overflowY: 'auto'
            }}
          >
            {[
              { key: 'drawer', label: 'Open Integration Drawer', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
              { key: 'openClient', label: 'Open Client Profile', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { key: 'sync', label: 'Start Sync Sync', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> },
              { key: 'pause', label: 'Pause Sync', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg> },
              { key: 'reconnect', label: 'Reconnect Token', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5l-3-3" /></svg> },
              { key: 'disconnect', label: 'Disconnect Account', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 0 1 0 12.73M6.01 7.97a5 5 0 0 1 0 8.06M12 2v20M17 12h5M2 12h5" /></svg> },
              { key: 'auditLog', label: 'View Audit Log', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
              { key: 'downloadLogs', label: 'Download API Logs', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
              { key: 'exportData', label: 'Export Ledger Data', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> },
              { key: 'viewSyncLogs', label: 'View Sync History', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { key: 'archive', label: 'Archive Connection', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
              { key: 'delete', label: 'Delete Connection', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>, danger: true }
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

      {/* ── 8. INTEGRATION DRAWER ── */}
      {drawerTxId && activeTx && (
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
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>QuickBooks connection details</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#2A1628' }}>
                  {activeTx.company}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#E8760A', fontWeight: 600, marginTop: '0.15rem' }}>
                  QBO Integration Center
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

            {/* Tab switchers header strip */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 2rem', borderBottom: '1px solid rgba(42,22,40,0.06)', overflowX: 'auto', flexShrink: 0 }}>
              {[
                { key: 'overview' as const, label: 'Overview' },
                { key: 'connection' as const, label: 'Connection' },
                { key: 'mappings' as const, label: 'Mappings' },
                { key: 'journalEntries' as const, label: 'Journal Entries' },
                { key: 'invoices' as const, label: 'Invoices' },
                { key: 'payments' as const, label: 'Payments' },
                { key: 'syncLogs' as const, label: 'Sync Logs' },
                { key: 'validation' as const, label: 'Validation' },
                { key: 'timeline' as const, label: 'Timeline' },
                { key: 'activity' as const, label: 'Activity' },
                { key: 'documents' as const, label: 'Documents' },
                { key: 'settings' as const, label: 'Settings' },
                { key: 'notes' as const, label: 'Notes' }
              ].map((tab) => {
                const isTabActive = drawerTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDrawerTab(tab.key)}
                    style={{
                      padding: '0.6rem 0',
                      border: 'none',
                      background: 'transparent',
                      color: isTabActive ? '#E8760A' : 'rgba(42,22,40,0.5)',
                      fontSize: '0.8125rem',
                      fontWeight: isTabActive ? 700 : 600,
                      cursor: 'pointer',
                      borderBottom: isTabActive ? '2px solid #E8760A' : 'none',
                      whiteSpace: 'nowrap',
                      fontFamily: 'inherit',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
              {drawerTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { lbl: 'Company Name', val: activeTx.company },
                      { lbl: 'QBO Company ID', val: activeTx.qboCompanyId },
                      { lbl: 'Filing Status', val: activeTx.connectionStatus, highlight: true },
                      { lbl: 'Last Sync Time', val: activeTx.lastSync },
                      { lbl: 'Account Manager', val: activeTx.manager },
                      { lbl: 'Sync Frequency', val: activeTx.syncFrequency },
                      { lbl: 'API Version Key', val: activeTx.apiVersion },
                      { lbl: 'Active Env', val: activeTx.environment }
                    ].map((row, idx) => (
                      <div key={idx}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>{row.lbl}</label>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: row.highlight
                            ? (activeTx.connectionStatus === 'Connected' ? '#047857' : '#E8760A')
                            : '#2A1628',
                          marginTop: '0.2rem'
                        }}>
                          {row.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(42,22,40,0.06)' }} />

                  {/* Summary Box */}
                  <div style={{ background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.12)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>Sync Records Summary</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                      <div><strong style={{ fontSize: '1.15rem', color: '#2A1628', display: 'block' }}>{activeTx.invoicesCount}</strong><span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Invoices Synced</span></div>
                      <div><strong style={{ fontSize: '1.15rem', color: '#2A1628', display: 'block' }}>{activeTx.paymentsCount}</strong><span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Payments Synced</span></div>
                      <div><strong style={{ fontSize: '1.15rem', color: '#2A1628', display: 'block' }}>{activeTx.journalEntriesCount}</strong><span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Journal Entries</span></div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'connection' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid #DDD0C4', borderRadius: '12px', background: '#FAF8F5' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>OAuth 2.0 Credentials Status</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.85)', lineHeight: 1.6 }}>
                      <li>Access Token Status: <span style={{ color: '#137333', fontWeight: 700 }}>Active</span></li>
                      <li>Environment: <strong>{activeTx.environment}</strong></li>
                      <li>Realm ID: <strong>{activeTx.realmId}</strong></li>
                      <li>Connected user account: <strong>{activeTx.connectedUser}</strong></li>
                    </ul>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setPopup({ type: 'confirmReconnect', tx: activeTx })} style={{ flex: 1, background: '#2A1628', color: '#fff', border: 'none', padding: '0.625rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Reconnect QBO Token</button>
                    <button type="button" onClick={() => setPopup({ type: 'confirmDisconnect', tx: activeTx })} style={{ flex: 1, background: '#fff', border: '1px solid #C5221F', color: '#C5221F', padding: '0.625rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Disconnect Company</button>
                  </div>
                </div>
              )}

              {drawerTab === 'mappings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(42,22,40,0.06)', paddingBottom: '0.5rem' }}>
                    {[
                      { key: 'accounts' as const, label: 'Accounts' },
                      { key: 'taxCodes' as const, label: 'Tax Codes' },
                      { key: 'customers' as const, label: 'Customers' },
                      { key: 'vendors' as const, label: 'Vendors' }
                    ].map((sub) => {
                      const isSubActive = mappingSubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => setMappingSubTab(sub.key)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            border: 'none',
                            background: isSubActive ? 'rgba(232,118,10,0.08)' : 'transparent',
                            color: isSubActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Local ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>QuickBooks ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawerMappings
                        .filter((m: any) => {
                          const typeMap: Record<string, string[]> = { accounts: ['Account'], taxCodes: ['TaxCode'], customers: ['Customer'], vendors: ['Vendor'] };
                          return (typeMap[mappingSubTab] || []).includes(m.entityType);
                        })
                        .map((mapRow: any) => (
                          <tr key={mapRow.id} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 600 }}>{String(mapRow.localId).slice(0, 8)}</td>
                            <td style={{ padding: '0.5rem' }}>{mapRow.qboId || '—'}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}><span style={{ color: mapRow.lastSyncStatus === 'Synced' ? '#137333' : '#C5221F', background: mapRow.lastSyncStatus === 'Synced' ? 'rgba(19,115,51,0.08)' : 'rgba(197,34,31,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>{mapRow.lastSyncStatus}</span></td>
                          </tr>
                        ))}
                      {drawerMappings.length === 0 && <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'rgba(42,22,40,0.45)' }}>No mappings recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {drawerTab === 'journalEntries' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search/Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input
                      type="text"
                      placeholder="Search journals..."
                      style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit' }}
                    />
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Filter
                    </button>
                    <button onClick={() => pushToast('Journals exported.', 'success')} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Export
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Local ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>QBO ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Sync Version</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawerJournalEntries.map((jv: any) => (
                        <tr key={jv.id} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{String(jv.localId).slice(0, 8)}</td>
                          <td style={{ padding: '0.5rem' }}>{jv.qboId || '—'}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>{jv.syncVersion}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}><span style={{ color: jv.lastSyncStatus === 'Synced' ? '#137333' : '#C5221F', fontWeight: 700 }}>{jv.lastSyncStatus}</span></td>
                        </tr>
                      ))}
                      {drawerJournalEntries.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'rgba(42,22,40,0.45)' }}>No journal entries synced yet.</td></tr>}
                    </tbody>
                  </table>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.25rem' }}>Showing {drawerJournalEntries.length} journal entr{drawerJournalEntries.length === 1 ? 'y' : 'ies'}</div>
                </div>
              )}

              {drawerTab === 'invoices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search/Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit' }}
                    />
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Filter
                    </button>
                    <button onClick={() => pushToast('Invoices exported.', 'success')} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Export
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Local ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>QBO ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Entity Type</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawerInvoices.map((inv: any) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{String(inv.localId).slice(0, 8)}</td>
                          <td style={{ padding: '0.5rem' }}>{inv.qboId || '—'}</td>
                          <td style={{ padding: '0.5rem' }}>{inv.entityType}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}><span style={{ color: inv.lastSyncStatus === 'Synced' ? '#137333' : '#C5221F', background: inv.lastSyncStatus === 'Synced' ? 'rgba(19,115,51,0.08)' : 'rgba(197,34,31,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>{inv.lastSyncStatus}</span></td>
                        </tr>
                      ))}
                      {drawerInvoices.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'rgba(42,22,40,0.45)' }}>No invoices synced yet.</td></tr>}
                    </tbody>
                  </table>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.25rem' }}>Showing {drawerInvoices.length} invoice{drawerInvoices.length === 1 ? '' : 's'}</div>
                </div>
              )}

              {drawerTab === 'payments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search/Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input
                      type="text"
                      placeholder="Search payments..."
                      style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit' }}
                    />
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Filter
                    </button>
                    <button onClick={() => pushToast('Payments exported.', 'success')} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Export
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Local ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Entity Type</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>QBO ID</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawerPayments.map((pay: any) => (
                        <tr key={pay.id} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{String(pay.localId).slice(0, 8)}</td>
                          <td style={{ padding: '0.5rem' }}>{pay.entityType}</td>
                          <td style={{ padding: '0.5rem' }}>{pay.qboId || '—'}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}><span style={{ color: pay.lastSyncStatus === 'Synced' ? '#137333' : '#C5221F', fontWeight: 700 }}>{pay.lastSyncStatus}</span></td>
                        </tr>
                      ))}
                      {drawerPayments.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'rgba(42,22,40,0.45)' }}>No payments synced yet.</td></tr>}
                    </tbody>
                  </table>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.25rem' }}>Showing {drawerPayments.length} payment{drawerPayments.length === 1 ? '' : 's'}</div>
                </div>
              )}

              {drawerTab === 'syncLogs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search/Filter Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input
                      type="text"
                      placeholder="Search sync logs..."
                      style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.75rem', fontFamily: 'inherit' }}
                    />
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Filter
                    </button>
                    <button onClick={() => pushToast('Logs exported.', 'success')} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'inherit', color: '#2A1628' }}>
                      Export
                    </button>
                  </div>

                  {drawerSyncLogs.map((logItem: any) => (
                    <div key={logItem.id} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(42,22,40,0.5)', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700 }}>{logItem.entityType} — {logItem.syncStatus}</span>
                        <span>{logItem.lastAttemptAt ? String(logItem.lastAttemptAt).replace('T', ' ').split('.')[0] : 'Not attempted'}</span>
                      </div>
                      <div style={{ color: '#2A1628' }}>{logItem.failureReason || `Retry count: ${logItem.retryCount}`}</div>
                    </div>
                  ))}
                  {drawerSyncLogs.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No sync log entries yet.</p>}
                </div>
              )}

              {drawerTab === 'validation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {drawerValidationChecks.map((chk: any) => (
                    <div key={chk.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#2A1628', fontWeight: 550 }}>{chk.label}</span>
                        <span style={{ color: chk.status === 'pass' ? '#137333' : chk.status === 'warning' ? '#c2410c' : '#C5221F', fontWeight: 700 }}>{chk.status.toUpperCase()}</span>
                      </div>
                      <span style={{ color: 'rgba(42,22,40,0.5)' }}>{chk.detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid rgba(232,118,10,0.2)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                  {drawerTimeline.map((tl: any, idx: number) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: 'calc(-1rem - 6px)',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: tl.status === 'done' ? '#137333' : '#DDD0C4',
                        border: '2px solid #fff'
                      }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>{tl.stage}</div>
                        <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: tl.status === 'done' ? 'rgba(19,115,51,0.08)' : 'rgba(42,22,40,0.06)', color: tl.status === 'done' ? '#137333' : 'rgba(42,22,40,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>{tl.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', margin: '0.2rem 0' }}>
                        <span>{tl.actor || 'System'}</span>
                        <span>•</span>
                        <span>{tl.timestamp ? String(tl.timestamp).replace('T', ' ').split('.')[0] : 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                  {drawerTimeline.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No timeline events yet.</p>}
                </div>
              )}

              {drawerTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {drawerActivityLog.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No activity recorded yet.</p>}
                  {drawerActivityLog.map((actItem: any) => (
                    <div key={actItem.id} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: '#2A1628' }}>{actItem.changedBy || 'System'}</span>
                        <span style={{ fontSize: '0.6rem', background: 'rgba(42,22,40,0.08)', color: '#2A1628', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>{actItem.operation}</span>
                      </div>
                      <div style={{ color: '#2A1628', fontWeight: 550, marginBottom: '0.35rem' }}>{String(actItem.tableName).replace(/_/g, ' ')} updated</div>
                      <div style={{ color: 'rgba(42,22,40,0.45)', fontSize: '0.65rem' }}>{actItem.changedAt ? String(actItem.changedAt).replace('T', ' ').split('.')[0] : ''}</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* File Upload Zone */}
                  <div
                    onClick={() => {
                      const name = window.prompt('Document name (metadata only — no real file upload in this build):');
                      if (!name || !activeTx) return;
                      addDocument({ id: activeTx.id, name, type: 'Supporting Doc' })
                        .unwrap()
                        .then(() => pushToast('Document recorded.', 'success'))
                        .catch(() => pushToast('Failed to record document.', 'danger'));
                    }}
                    style={{ border: '1.5px dashed #DDD0C4', borderRadius: '12px', padding: '1rem', textAlign: 'center', background: '#FAF8F5', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8760A' }}>+ Add Document</span>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>Metadata record — supports PDF, XLSX, PNG</p>
                  </div>

                  {drawerDocuments.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No documents recorded yet.</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {drawerDocuments.map((doc: any) => (
                      <div key={doc.id} style={{ padding: '1rem', border: '1px solid #DDD0C4', borderRadius: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <div>
                          <strong style={{ color: '#2A1628', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc.name}</strong>
                          <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span>Type: {doc.type}</span>
                            <span>Uploaded by: {doc.uploadedBy || 'Unknown'}</span>
                            <span>Date: {doc.createdAt ? String(doc.createdAt).split('T')[0] : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Automatic sync execution enabled</span>
                    <input type="checkbox" defaultChecked={activeTx.autoSync} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Send webhook failure notifications</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <button type="button" onClick={() => pushToast('QuickBooks configurations saved.', 'success')} style={{ background: '#2A1628', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Save Settings</button>
                </div>
              )}

              {drawerTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea
                      placeholder="Write review summary notes here..."
                      value={quickQboNote}
                      onChange={(e) => setQuickQboNote(e.target.value)}
                      style={{ width: '100%', minHeight: '80px', padding: '0.625rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        disabled={!quickQboNote.trim()}
                        onClick={() => {
                          if (!activeTx || !quickQboNote.trim()) return;
                          addNote({ id: activeTx.id, body: quickQboNote })
                            .unwrap()
                            .then(() => { setQuickQboNote(''); pushToast('Note added successfully.', 'success'); })
                            .catch(() => pushToast('Failed to add note.', 'danger'));
                        }}
                        style={{ background: '#E8760A', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: quickQboNote.trim() ? 'pointer' : 'not-allowed', opacity: quickQboNote.trim() ? 1 : 0.6, fontFamily: 'inherit' }}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {drawerNotes.length === 0 && <p style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No notes yet.</p>}
                    {drawerNotes.map((note: any) => (
                      <div key={note.id} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem', position: 'relative' }}>
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
          </div>
        </div>
      )}

      {/* ── 9. CONFIRMATION POPUPS / MODALS ── */}
      {popup.type === 'connect' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="QuickBooks Settings"
          titlePlain="Connect"
          titleAccent="QBO Company"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleConnectSubmit} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Connect Company</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Select Target Company</label>
              <CustomSelect value={newCompany} onChange={setNewCompany} options={dynamicClients.length ? dynamicClients.map((c: any) => c.name) : ['ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC']} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Realm ID / Company ID</label>
              <input type="text" placeholder="e.g. 901927384" value={newRealmId} onChange={(e) => setNewRealmId(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Environment</label>
                <CustomSelect value={newEnv} onChange={(val) => setNewEnv(val as 'Production' | 'Sandbox')} options={['Production', 'Sandbox']} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Assign Manager</label>
                <CustomSelect value={newManager} onChange={setNewManager} options={MANAGERS} />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal: Import QBO Data */}
      {popup.type === 'import' && (
        <QboImportModal
          onClose={() => setPopup({ type: null })}
          onImport={(file, trn) => {
            setPopup({ type: null });
            pushToast(`Successfully imported ledgers from file: ${file} (Realm: ${trn})`, 'success');
          }}
        />
      )}

      {/* Modal: Export QBO Data */}
      {popup.type === 'export' && (
        <QboExportModal
          onClose={() => setPopup({ type: null })}
          onExport={(format, scope) => {
            setPopup({ type: null });
            pushToast(`Export started in ${format.toUpperCase()} format for ${scope} connection scope.`, 'success');
          }}
        />
      )}

      {popup.type === 'confirmDisconnect' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="QuickBooks Center"
          titlePlain="Disconnect"
          titleAccent={popup.tx.company}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'disconnect' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('QuickBooks Online company disconnected.', 'danger'); })
                  .catch(() => pushToast('Failed to disconnect.', 'danger'));
              }} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Disconnect</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to disconnect <strong>{popup.tx.company}</strong>? You will need to re-authenticate with QBO to sync future transactions.
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmReconnect' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="QuickBooks Center"
          titlePlain="Reconnect"
          titleAccent={popup.tx.company}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postConnect({ tenantId: popup.tx!.id })
                  .unwrap()
                  .then((res: any) => {
                    setPopup({ type: null });
                    if (res?.data?.authUrl && typeof window !== 'undefined') window.open(res.data.authUrl, '_blank', 'noopener,noreferrer');
                    refetch();
                    pushToast('Redirecting to QuickBooks re-authorization...', 'success');
                  })
                  .catch(() => pushToast('Failed to start reconnection.', 'danger'));
              }} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Reconnect</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Triggers authorization token regeneration cycle with QuickBooks Online OAuth Gateway.
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmSync' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Sync Center"
          titlePlain="Sync"
          titleAccent={popup.tx.company}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'startSync' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('Sync job completed successfully.', 'success'); })
                  .catch(() => pushToast('Sync job failed.', 'danger'));
              }} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Start Sync</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Triggers raw API replication cycle for <strong>{popup.tx.company}</strong> database.
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmPause' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Sync Center"
          titlePlain="Pause Sync"
          titleAccent={popup.tx.company}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Keep Syncing</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'pauseSync' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('Automatic sync jobs paused.', 'warning'); })
                  .catch(() => pushToast('Failed to pause sync.', 'danger'));
              }} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Pause Sync</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to pause auto-sync for <strong>{popup.tx.company}</strong>?
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmDelete' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="QuickBooks settings"
          titlePlain="Delete"
          titleAccent={popup.tx.company}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'deleteConnections' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('QuickBooks Online link successfully removed.', 'danger'); })
                  .catch(() => pushToast('Failed to remove connection.', 'danger'));
              }} style={{ background: '#DC2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to permanently delete integration mapping link for <strong>{popup.tx.company}</strong>?
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmArchive' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="QuickBooks settings"
          titlePlain="Archive"
          titleAccent={popup.tx.company}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                postBulk({ ids: [popup.tx!.id], action: 'archive' })
                  .unwrap()
                  .then(() => { refetch(); setPopup({ type: null }); pushToast('QuickBooks connection archived.', 'info'); })
                  .catch(() => pushToast('Failed to archive connection.', 'danger'));
              }} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Archive</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Moves QBO credential settings to the archives list. Auto sync tasks will stop.
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
        @keyframes slideIn {
          from { transform: translateY(-1rem); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
