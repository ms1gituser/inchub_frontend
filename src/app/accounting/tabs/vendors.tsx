'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Pagination from '@/components/ui/Pagination';

// ============================================================================
// Types
// ============================================================================

interface VendorItem {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  categoryBg: string;
  categoryColor: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  terms: string;
  outstandingBalance: number;
  totalSpend: number;
  lastTransaction: string;
  complianceScore: number; // 0-100
  status: 'Active' | 'Pending' | 'Verified' | 'High Risk' | 'Blacklisted' | 'Archived';
  manager: string;
  vendorType: 'Local' | 'International';
  isPreferred: boolean;
}

interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'danger' | 'info' | 'warning';
}

// ============================================================================
// Mock Data
// ============================================================================

const INITIAL_VENDORS: VendorItem[] = [
  {
    id: 'vnd-1',
    vendorId: 'VND-00248',
    name: 'Alpha Digital LLC',
    category: 'IT Services',
    categoryBg: '#F0F6FC',
    categoryColor: '#1E3A8A',
    country: 'UAE',
    contactPerson: 'John Smith',
    email: 'john@alphadigital.com',
    phone: '+971 50 123 4567',
    terms: 'Net 30',
    outstandingBalance: 12500,
    totalSpend: 450000,
    lastTransaction: '2026-05-07',
    complianceScore: 98,
    status: 'Verified',
    manager: 'John Doe',
    vendorType: 'Local',
    isPreferred: true
  },
  {
    id: 'vnd-2',
    vendorId: 'VND-00247',
    name: 'Office Supplies Co.',
    category: 'Office Supplies',
    categoryBg: '#EFF6FF',
    categoryColor: '#1E3A8A',
    country: 'UAE',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@officesupplies.com',
    phone: '+971 4 987 6543',
    terms: 'Net 15',
    outstandingBalance: 3450,
    totalSpend: 89000,
    lastTransaction: '2026-05-06',
    complianceScore: 82,
    status: 'Active',
    manager: 'Mike Brown',
    vendorType: 'Local',
    isPreferred: false
  },
  {
    id: 'vnd-3',
    vendorId: 'VND-00246',
    name: 'Prime Workspace',
    category: 'Rent & Utilities',
    categoryBg: '#F3E8FF',
    categoryColor: '#581C87',
    country: 'UAE',
    contactPerson: 'Michael Brown',
    email: 'michael@primeworkspace.com',
    phone: '+971 52 456 7890',
    terms: 'Net 30',
    outstandingBalance: 45000,
    totalSpend: 540000,
    lastTransaction: '2026-05-01',
    complianceScore: 95,
    status: 'Verified',
    manager: 'John Doe',
    vendorType: 'Local',
    isPreferred: true
  },
  {
    id: 'vnd-4',
    vendorId: 'VND-00245',
    name: 'Tech Connect Solutions',
    category: 'IT Services',
    categoryBg: '#F0F6FC',
    categoryColor: '#1E3A8A',
    country: 'US',
    contactPerson: 'David Wilson',
    email: 'david@techconnect.com',
    phone: '+1 415 555 2671',
    terms: 'Net 45',
    outstandingBalance: 8900,
    totalSpend: 125000,
    lastTransaction: '2026-04-28',
    complianceScore: 48,
    status: 'High Risk',
    manager: 'Sneha Iyer',
    vendorType: 'International',
    isPreferred: false
  },
  {
    id: 'vnd-5',
    vendorId: 'VND-00244',
    name: 'Global Services LLC',
    category: 'Professional Services',
    categoryBg: '#FEF3C7',
    categoryColor: '#92400E',
    country: 'UK',
    contactPerson: 'Emma Davis',
    email: 'emma@globalservices.com',
    phone: '+44 20 7946 0958',
    terms: 'Net 30',
    outstandingBalance: 0,
    totalSpend: 310000,
    lastTransaction: '2026-04-25',
    complianceScore: 92,
    status: 'Verified',
    manager: 'Priya Nair',
    vendorType: 'International',
    isPreferred: true
  }
];

const CATEGORIES = ['All', 'IT Services', 'Office Supplies', 'Rent & Utilities', 'Professional Services', 'Logistics', 'Marketing'];
const COUNTRIES = ['All', 'UAE', 'US', 'UK', 'Saudi Arabia', 'Singapore'];
// const INDUSTRIES = ['All', 'Technology', 'Procurement', 'Real Estate', 'Logistics', 'Consulting'];
const TERMS_OPTIONS = ['All', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'];
// const MANAGERS = ['All', 'John Doe', 'Mike Brown', 'Sneha Iyer', 'Priya Nair'];
const RISK_LEVELS = ['All', 'Low', 'Medium', 'High'];
const STATUS_OPTIONS = ['All', 'Active', 'Pending', 'Verified', 'High Risk', 'Blacklisted', 'Archived'];
// const COMPLIANCE_OPTIONS = ['All', 'Excellent (>90)', 'Good (75-90)', 'Critical (<75)'];
// const VENDOR_TYPES = ['All', 'Local', 'International'];

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

// ── HIGH FIDELITY IMPORT MODAL ──
interface VendorImportModalProps {
  onClose: () => void;
  onImport: (fileName: string) => void;
  onToast: (message: string, tone: 'success' | 'danger' | 'info' | 'warning') => void;
}

function VendorImportModal({ onClose, onImport, onToast }: VendorImportModalProps) {
  const [importTab, setImportTab] = useState<'local' | 'gdrive' | 'onedrive'>('local');
  const [importFile, setImportFile] = useState('');

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Vendors Center"
      titlePlain="Import"
      titleAccent="Suppliers"
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
            onClick={() => onImport(importFile || 'Vendor_Ledger_Extract.xlsx')}
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
            Import Database
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
            onClick={() => setImportFile('IncHub_Vendors_Import_Q1.xlsx')}
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
                {importFile ? importFile : 'Drag & drop your CSV or Excel supplier spreadsheet here'}
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
                    setImportFile(importTab === 'gdrive' ? 'Google_Drive_Vendors_Registry.csv' : 'OneDrive_Vendors_Registry.csv');
                    onToast(importTab === 'gdrive' ? 'Google Drive connected.' : 'OneDrive connected.', 'success');
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
      </div>
    </ModalShell>
  );
}

// ── HIGH FIDELITY EXPORT MODAL ──
interface VendorExportModalProps {
  onClose: () => void;
  onExport: (format: string, scope: string) => void;
}

function VendorExportModal({ onClose, onExport }: VendorExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'print'>('excel');
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('filtered');

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Vendors Center"
      titlePlain="Export"
      titleAccent="Registry"
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
              style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}
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
          WHICH VENDORS TO EXPORT?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { key: 'all' as const, title: 'All Vendors', desc: 'Export all records in the vendors database', badge: '5 profiles' },
            { key: 'filtered' as const, title: 'Filtered Results', desc: 'Only records matching current active filters', badge: '5 profiles' },
            { key: 'selected' as const, title: 'Selected Vendors', desc: 'Only checked row items', badge: '0 profiles' },
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

// ── MAIN VENDORS TAB COMPONENT ──
export default function VendorsTab() {
  const [data, setData] = useState<VendorItem[]>(INITIAL_VENDORS);
  const [isLoading, setIsLoading] = useState(false);
  const nextIdRef = useRef(100);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  // const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterTerms] = useState('All');
  const [filterManager] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCompliance] = useState('All');
  const [filterVendorType] = useState('All');

  // Active status chips layout selection state
  const [activeChip, setActiveChip] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Checkbox row selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting variables
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Context Actions Menu state
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [menuItem, setMenuItem] = useState<VendorItem | null>(null);

  // Details drawer layout states
  const [drawerTxId, setDrawerTxId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'company' | 'contacts' | 'bank' | 'transactions' | 'po' | 'bills' | 'documents' | 'compliance' | 'timeline' | 'activity' | 'notes'>('overview');
  const [drawerNoteTag] = useState<'all' | 'internal' | 'finance' | 'compliance' | 'audit' | 'ai'>('all');

  // Modal display states
  const [popup, setPopup] = useState<{
    type: 'add' | 'import' | 'export' | 'confirmVerify' | 'confirmArchive' | 'confirmDelete' | null;
    tx?: VendorItem;
  }>({ type: null });

  // Add Vendor Wizard fields
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('IT Services');
  const [newCountry, setNewCountry] = useState('UAE');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone] = useState('');
  const [newTerms, setNewTerms] = useState('Net 30');
  const [newManager] = useState('John Doe');
  const [newStatus] = useState<'Active' | 'Pending' | 'Verified' | 'High Risk' | 'Blacklisted' | 'Archived'>('Active');
  const [newVendorType] = useState<'Local' | 'International'>('Local');
  const [newTaxId, setNewTaxId] = useState('');

  // Toast status alerts lists
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = (message: string, tone: 'success' | 'danger' | 'info' | 'warning') => {
    const id = String(nextIdRef.current++);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filter & Search Logic Execution
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = filterCategory === 'All' || item.category === filterCategory;
      const matchCountry = filterCountry === 'All' || item.country === filterCountry;
      const matchTerms = filterTerms === 'All' || item.terms === filterTerms;
      const matchManager = filterManager === 'All' || item.manager === filterManager;
      const matchStatus = filterStatus === 'All' || item.status === filterStatus;
      const matchType = filterVendorType === 'All' || item.vendorType === filterVendorType;

      let matchRisk = true;
      if (filterRisk === 'High') matchRisk = item.status === 'High Risk';
      else if (filterRisk === 'Medium') matchRisk = item.complianceScore < 85 && item.complianceScore >= 70;
      else if (filterRisk === 'Low') matchRisk = item.complianceScore >= 85;

      let matchComp = true;
      if (filterCompliance === 'Excellent (>90)') matchComp = item.complianceScore > 90;
      else if (filterCompliance === 'Good (75-90)') matchComp = item.complianceScore <= 90 && item.complianceScore >= 75;
      else if (filterCompliance === 'Critical (<75)') matchComp = item.complianceScore < 75;

      let matchChip = true;
      if (activeChip === 'Active') matchChip = item.status === 'Active' || item.status === 'Verified';
      else if (activeChip === 'Pending') matchChip = item.status === 'Pending';
      else if (activeChip === 'Verified') matchChip = item.status === 'Verified';
      else if (activeChip === 'High Risk') matchChip = item.status === 'High Risk';
      else if (activeChip === 'Blacklisted') matchChip = item.status === 'Blacklisted';
      else if (activeChip === 'Archived') matchChip = item.status === 'Archived';
      else if (activeChip === 'Local') matchChip = item.vendorType === 'Local';
      else if (activeChip === 'International') matchChip = item.vendorType === 'International';

      return matchSearch && matchCategory && matchCountry && matchTerms && matchManager && matchStatus && matchType && matchRisk && matchComp && matchChip;
    });
  }, [data, searchQuery, filterCategory, filterCountry, filterTerms, filterManager, filterStatus, filterVendorType, filterRisk, filterCompliance, activeChip]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortCol as keyof VendorItem];
      const bVal = b[sortCol as keyof VendorItem];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [filteredData, sortCol, sortDir]);

  // Pagination Slice
  const pagedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = data.length;
    const active = data.filter((x) => x.status === 'Active' || x.status === 'Verified').length;
    const pending = data.filter((x) => x.status === 'Pending').length;
    const highRisk = data.filter((x) => x.status === 'High Risk').length;
    const blocked = data.filter((x) => x.status === 'Blacklisted').length;
    const payables = data.reduce((sum, x) => sum + x.outstandingBalance, 0);
    const spend = data.reduce((sum, x) => sum + x.totalSpend, 0);
    const compliance = Math.round(data.reduce((sum, x) => sum + x.complianceScore, 0) / (total || 1));
    return { total, active, pending, highRisk, blocked, payables, spend, compliance };
  }, [data]);

  // Bulk Actions
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

  const triggerBulkAction = (actionKey: string) => {
    if (actionKey === 'delete') {
      setData((prev) => prev.filter((x) => !selectedIds.includes(x.id)));
      pushToast(`${selectedIds.length} vendor profiles deleted.`, 'danger');
      setSelectedIds([]);
    } else if (actionKey === 'archive') {
      setData((prev) => prev.map((x) => (selectedIds.includes(x.id) ? { ...x, status: 'Archived' } : x)));
      pushToast(`${selectedIds.length} vendor profiles archived.`, 'warning');
      setSelectedIds([]);
    } else if (actionKey === 'verify') {
      setData((prev) => prev.map((x) => (selectedIds.includes(x.id) ? { ...x, status: 'Verified' } : x)));
      pushToast(`${selectedIds.length} vendor profiles verified.`, 'success');
      setSelectedIds([]);
    } else {
      pushToast(`Triggered ${actionKey} action for ${selectedIds.length} selected vendors.`, 'info');
      setSelectedIds([]);
    }
  };

  // Row menu handler
  const handleMenuAction = (actionKey: string) => {
    if (!menuItem) return;
    if (actionKey === 'drawer') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('overview');
    } else if (actionKey === 'edit') {
      pushToast(`Editing profile details for ${menuItem.name}...`, 'info');
    } else if (actionKey === 'transactions') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('transactions');
    } else if (actionKey === 'po') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('po');
    } else if (actionKey === 'bills') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('bills');
    } else if (actionKey === 'upload') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('documents');
    } else if (actionKey === 'contact') {
      pushToast(`Initiating contact cycle for ${menuItem.name} (${menuItem.email})`, 'info');
    } else if (actionKey === 'auditLog') {
      setDrawerTxId(menuItem.id);
      setDrawerTab('activity');
    } else if (actionKey === 'archiveVendor') {
      setPopup({ type: 'confirmArchive', tx: menuItem });
    } else if (actionKey === 'deleteVendor') {
      setPopup({ type: 'confirmDelete', tx: menuItem });
    }
  };

  // Create Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      pushToast('Company Name is required.', 'warning');
      return;
    }
    const newObj: VendorItem = {
      id: `vnd-${nextIdRef.current++}`,
      vendorId: `VND-00${nextIdRef.current}`,
      name: newName,
      category: newCategory,
      categoryBg: '#F0F6FC',
      categoryColor: '#1E3A8A',
      country: newCountry,
      contactPerson: newContactPerson || 'N/A',
      email: newEmail || 'N/A',
      phone: newPhone || 'N/A',
      terms: newTerms,
      outstandingBalance: 0,
      totalSpend: 0,
      lastTransaction: 'Just now',
      complianceScore: 100,
      status: newStatus,
      manager: newManager,
      vendorType: newVendorType,
      isPreferred: false
    };

    setData([newObj, ...data]);
    setPopup({ type: null });
    pushToast(`Vendor profile for ${newName} successfully created.`, 'success');
  };

  const activeTx = data.find((x) => x.id === drawerTxId);

  return (
    <div style={{ color: '#2A1628', fontFamily: 'var(--font-sans), Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'transparent' }}>
      
      {/* Toast Portal Container */}
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 11000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              background: '#ffffff',
              boxShadow: '0 12px 32px rgba(42,22,40,0.12)',
              borderLeft: `4px solid ${t.tone === 'success' ? '#137333' : t.tone === 'danger' ? '#C5221F' : t.tone === 'warning' ? '#E8760A' : '#1A73E8'}`,
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
            <span style={{ fontSize: '1rem' }}>
              {t.tone === 'success' ? '✅' : t.tone === 'danger' ? '❌' : t.tone === 'warning' ? '⚠️' : 'ℹ️'}
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
              Procurement Center
            </p>
          </div>
          <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif', letterSpacing: '-0.02em' }}>
            Vendors <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
            Manage suppliers, vendor compliance, purchase history, payment tracking, contracts, and procurement activities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setPopup({ type: 'add' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Vendor
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'import' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Import Vendors
          </button>
          <button
            type="button"
            onClick={() => setPopup({ type: 'export' })}
            style={{ background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export Vendors
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                pushToast('Supplier directory sync complete.', 'success');
              }, 1200);
            }}
            style={{ background: '#2A1628', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#ffffff', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#ffffff' }}><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI CARDS GRID (12 CARDS) ── */}
      <div className="no-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          {
            label: 'Total Vendors',
            value: kpis.total,
            sub: 'Registered',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          },
          {
            label: 'Active Vendors',
            value: kpis.active,
            sub: 'Filing Live',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          },
          {
            label: 'Pending Verification',
            value: kpis.pending,
            sub: 'Requires Review',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          },
          {
            label: 'High Risk Vendors',
            value: kpis.highRisk,
            sub: 'Compliance Score <75',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          },
          {
            label: 'Blocked Vendors',
            value: kpis.blocked,
            sub: 'Restricted profiles',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
          },
          {
            label: 'Outstanding Payables',
            value: `AED ${kpis.payables.toLocaleString()}`,
            sub: 'Total bills liabilities',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
          },
          {
            label: 'Total Spend',
            value: `AED ${kpis.spend.toLocaleString()}`,
            sub: 'Purchases ledger total',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          },
          {
            label: 'This Month Purchases',
            value: 'AED 128,450',
            sub: 'Active procurement billing',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          },
          {
            label: 'Average Payment Time',
            value: '24.2 days',
            sub: 'Standard aging cycles',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 12" /></svg>
          },
          {
            label: 'Compliance Score',
            value: `${kpis.compliance}%`,
            sub: 'Average audit score',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          },
          {
            label: 'Contracts Expiring Soon',
            value: '3 contracts',
            sub: 'Expires within 30 days',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          },
          {
            label: 'Last Vendor Added',
            value: 'Alpha Digital',
            sub: 'Registered today',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          }
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
                background: 'rgba(232,118,10,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#E8760A', flexShrink: 0,
                fontSize: '0.9rem'
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. STATUS CHIPS SEGMENTED FILTERS ── */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', alignItems: 'center', justifyContent: 'center' }} className="hide-scrollbar">
        {[
          { key: 'All', label: 'All Vendors', count: data.length },
          { key: 'Active', label: 'Active', count: data.filter((x) => x.status === 'Active' || x.status === 'Verified').length },
          { key: 'Pending', label: 'Pending Approval', count: data.filter((x) => x.status === 'Pending').length },
          { key: 'Verified', label: 'Verified', count: data.filter((x) => x.status === 'Verified').length },
          { key: 'High Risk', label: 'High Risk', count: data.filter((x) => x.status === 'High Risk').length },
          { key: 'Blacklisted', label: 'Blacklisted', count: data.filter((x) => x.status === 'Blacklisted').length },
          { key: 'Archived', label: 'Archived', count: data.filter((x) => x.status === 'Archived').length },
          { key: 'Local', label: 'Local', count: data.filter((x) => x.vendorType === 'Local').length },
          { key: 'International', label: 'International', count: data.filter((x) => x.vendorType === 'International').length }
        ].map((tab) => {
          const isActive = activeChip === tab.key;

          let tabColors = {
            border: isActive ? '1.5px solid #E8760A' : '1px solid #DDD0C4',
            bg: isActive ? 'rgba(232,118,10,0.06)' : '#ffffff',
            color: isActive ? '#E8760A' : 'rgba(42,22,40,0.6)',
            badgeBg: isActive ? '#E8760A' : 'rgba(42,22,40,0.08)',
            badgeColor: isActive ? '#ffffff' : 'rgba(42,22,40,0.6)'
          };

          if (isActive) {
            tabColors = {
              border: '1.5px solid #E8760A',
              bg: 'rgba(232,118,10,0.06)',
              color: '#E8760A',
              badgeBg: '#E8760A',
              badgeColor: '#ffffff'
            };
          }

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveChip(tab.key)}
              style={{
                background: tabColors.bg,
                color: tabColors.color,
                border: tabColors.border,
                borderRadius: '999px',
                padding: '0.45rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
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
        <div style={{ background: '#2A1628', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.25rem' }}>
            {selectedIds.length} profiles selected
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'Verify Selected', action: 'verify' },
              { label: 'Archive Selected', action: 'archive' },
              { label: 'Send Email Outreach', action: 'email' },
              { label: 'Delete Records', action: 'delete' }
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => triggerBulkAction(btn.action)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.3rem 0.6rem', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setSelectedIds([])} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>✕ Clear</button>
        </div>
      )}

      {/* ── 5. ENTERPRISE FILTERS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', background: '#ffffff', border: '1px solid #DDD0C4', padding: '0.625rem', borderRadius: '12px' }}>
        <input
          type="text"
          placeholder="Search Vendor name, ID, contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box', fontFamily: 'inherit', height: '38px' }}
        />
        <CustomSelect placeholder="Category" value={filterCategory} onChange={setFilterCategory} options={CATEGORIES} />
        <CustomSelect placeholder="Country" value={filterCountry} onChange={setFilterCountry} options={COUNTRIES} />
        <CustomSelect placeholder="Risk" value={filterRisk} onChange={setFilterRisk} options={RISK_LEVELS} />
        <CustomSelect placeholder="Status" value={filterStatus} onChange={setFilterStatus} options={STATUS_OPTIONS} />
      </div>

      {/* ── 6. ENTERPRISE VENDORS TABLE ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="client-table-scroll" style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', overflowX: 'auto', overflowY: 'visible', boxShadow: '0 4px 12px rgba(42,22,40,0.01)', position: 'relative' }}>
          <style>{`
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
                  <input type="checkbox" onChange={handleSelectAll} checked={pagedData.length > 0 && selectedIds.length === filteredData.length} />
                </th>
                <th style={{ padding: '1rem', position: 'sticky', left: '48px', background: '#FAF8F5', zIndex: 10, borderRight: '1px solid #DDD0C4', cursor: 'pointer', userSelect: 'none' }} onClick={() => { setSortCol('name'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  VENDOR {sortCol === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ padding: '1rem', userSelect: 'none' }}>VENDOR ID</th>
                <th style={{ padding: '1rem', userSelect: 'none' }}>CATEGORY</th>
                <th style={{ padding: '1rem', userSelect: 'none' }}>COUNTRY</th>
                <th style={{ padding: '1rem', userSelect: 'none' }}>CONTACT</th>
                <th style={{ padding: '1rem', userSelect: 'none' }}>TERMS</th>
                <th style={{ padding: '1rem', textAlign: 'right', userSelect: 'none' }}>OUTSTANDING</th>
                <th style={{ padding: '1rem', textAlign: 'right', userSelect: 'none' }}>TOTAL SPEND</th>
                <th style={{ padding: '1rem', textAlign: 'center', userSelect: 'none' }}>COMPLIANCE</th>
                <th style={{ padding: '1rem', textAlign: 'center', userSelect: 'none' }}>STATUS</th>
                <th style={{ padding: '1rem', userSelect: 'none' }}>MANAGER</th>
                <th style={{ padding: '1rem', width: '50px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                    <td style={{ padding: '1rem' }}><div style={{ width: '16px', height: '16px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                    <td colSpan={12} style={{ padding: '1rem' }}><div style={{ width: '100%', height: '12px', background: '#F3F4F6', borderRadius: '4px' }} /></td>
                  </tr>
                ))
              ) : pagedData.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ padding: '4rem 3rem', textAlign: 'center', color: 'rgba(42,22,40,0.4)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2A1628', marginBottom: '0.25rem' }}>No vendors found</div>
                    <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem' }}>Try expanding your filter conditions.</p>
                  </td>
                </tr>
              ) : (
                pagedData.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: idx < pagedData.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none', background: isSelected ? 'rgba(232,118,10,0.02)' : 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(42,22,40,0.01)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? 'rgba(232,118,10,0.02)' : 'transparent')}
                    >
                      <td style={{ padding: '0.625rem 0.75rem', textAlign: 'center', position: 'sticky', left: 0, background: isSelected ? '#FAF4EE' : '#ffffff', zIndex: 9 }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(item.id)} />
                      </td>
                      <td style={{ padding: '0.625rem 1rem', position: 'sticky', left: '48px', background: isSelected ? '#FAF4EE' : '#ffffff', zIndex: 9, borderRight: '1px solid rgba(42,22,40,0.06)' }} onClick={() => { setDrawerTxId(item.id); setDrawerTab('overview'); }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(232, 118, 10, 0.08)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {item.name.split(' ').map((x) => x[0]).join('').substr(0, 2)}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, color: '#2A1628', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>{item.vendorType}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.625rem 1rem', color: 'rgba(42,22,40,0.75)', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.vendorId}</td>
                      <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: item.categoryBg, color: item.categoryColor, fontWeight: 700 }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>{item.country}</td>
                      <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{item.contactPerson}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>{item.email}</div>
                      </td>
                      <td style={{ padding: '0.625rem 1rem', whiteSpace: 'nowrap' }}>{item.terms}</td>
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: 600, color: item.outstandingBalance > 0 ? '#C5221F' : '#2A1628', whiteSpace: 'nowrap' }}>
                        AED {item.outstandingBalance.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        AED {item.totalSpend.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: item.complianceScore >= 90 ? '#137333' : item.complianceScore >= 75 ? '#E8760A' : '#C5221F' }}>
                          {item.complianceScore}%
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background:
                            item.status === 'Verified'
                              ? '#E6F4EA'
                              : item.status === 'High Risk'
                              ? '#FEE2E2'
                              : item.status === 'Pending'
                              ? '#E8F0FE'
                              : '#F1F3F4',
                          color:
                            item.status === 'Verified'
                              ? '#137333'
                              : item.status === 'High Risk'
                              ? '#D32F2F'
                              : item.status === 'Pending'
                              ? '#1A73E8'
                              : '#5F6368',
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.625rem 1rem', color: '#2A1628', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.manager}</td>
                      <td style={{ padding: '0.625rem 1rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="action-btn-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 6, left: rect.right });
                            setMenuItem(item);
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: 'rgba(42,22,40,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(42,22,40,0.06)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
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
        <Pagination totalItems={filteredData.length} currentPage={currentPage} rowsPerPage={rowsPerPage} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} itemLabel="vendors" />
      </div>

      {/* ── 6.5 EXECUTIVE ANALYTICS SECTION (8 CHARTS) ── */}
      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: '#E8760A', display: 'inline-block' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Vendors Center Spend &amp; Risk Analytics
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {[
            { title: 'Monthly Spend Trend', desc: 'Purchases compare Q1-Q4', path: 'M0 45 Q25 20 50 35 T100 10', stroke: '#E8760A', label: 'Spend' },
            { title: 'Outstanding Balance Trend', desc: 'Aging bills liabilities', path: 'M0 45 L20 30 L40 38 L60 20 L80 25 L100 12', stroke: '#C5221F', label: 'Liability' },
            { title: 'Compliance Score Trend', desc: 'Avg monthly risk index', path: 'M0 10 L25 15 L50 8 L75 12 L100 5', stroke: '#137333', label: 'Compliance' },
            { title: 'Purchase Volume', desc: 'Monthly checkout counts', path: 'M0 45 Q25 35 50 42 T100 20', stroke: '#2A1628', label: 'Volume' }
          ].map((chart, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>{chart.title}</h4>
                <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>{chart.desc}</span>
              </div>
              <svg width="100%" height="80" viewBox="0 0 100 50" preserveAspectRatio="none">
                <path d={chart.path} fill="none" stroke={chart.stroke} strokeWidth="1.5" />
              </svg>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', fontWeight: 600 }}>
                <span style={{ color: chart.stroke }}>● {chart.label}</span>
              </div>
            </div>
          ))}

          {[
            { title: 'Category Distribution', desc: 'Supplier types breakdown', labels: ['IT Services', 'Utilities', 'Supplies'] },
            { title: 'Country Distribution', desc: 'Region allocations mapping', labels: ['UAE Local', 'US Import', 'UK Import'] },
            { title: 'Payment Aging Breakout', desc: 'Liabilities over overdue cycles', labels: ['<30 days', '30-60 days', '>60 days'] },
            { title: 'AML Risk Distribution', desc: 'Compliance status grouping', labels: ['Low Risk', 'Audited', 'High Risk'] }
          ].map((chart, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>{chart.title}</h4>
                <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)' }}>{chart.desc}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '80px' }}>
                <svg width="50" height="50" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#DDD0C4" strokeWidth="6" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="6" strokeDasharray="70 30" strokeDashoffset="25" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.65rem', fontWeight: 600 }}>
                  {chart.labels.map((l, j) => (
                    <span key={j} style={{ color: j === 0 ? '#E8760A' : '#2A1628' }}>• {l}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
              maxHeight: '320px',
              overflowY: 'auto'
            }}
          >
            {[
              { key: 'drawer', label: 'Open Vendor Drawer', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
              { key: 'edit', label: 'Edit Vendor Profile', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
              { key: 'transactions', label: 'View Transactions', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { key: 'po', label: 'Purchase Orders', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { key: 'bills', label: 'Bills & Payments', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
              { key: 'upload', label: 'Upload Documents', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
              { key: 'contact', label: 'Contact Vendor', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
              { key: 'auditLog', label: 'View Audit Log', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
              { key: 'archiveVendor', label: 'Archive Vendor', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
              { key: 'deleteVendor', label: 'Delete Vendor', danger: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg> }
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
                  fontWeight: 500,
                  transition: 'background 150ms ease'
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

      {/* ── 8. DETAILED VENDOR DRAWER OVERLAY (12 TABS) ── */}
      {drawerTxId && activeTx && (
        <div
          role="presentation"
          onClick={() => setDrawerTxId(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.2)', backdropFilter: 'blur(3px)', zIndex: 950, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '560px', background: '#ffffff', height: '100%', boxShadow: '-10px 0 40px rgba(42,22,40,0.15)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans), Inter, sans-serif' }}
          >
            {/* Drawer Header */}
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vendor Profiles Database</p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#2A1628' }}>{activeTx.name}</h2>
                <div style={{ fontSize: '0.8rem', color: '#E8760A', fontWeight: 600, marginTop: '0.15rem' }}>{activeTx.vendorId} ({activeTx.vendorType})</div>
              </div>
              <button type="button" onClick={() => setDrawerTxId(null)} style={{ background: 'rgba(42,22,40,0.04)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(42,22,40,0.06)' }} />

            {/* Tab switchers header strip */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 2rem', borderBottom: '1px solid rgba(42,22,40,0.06)', overflowX: 'auto', flexShrink: 0 }}>
              {[
                { key: 'overview' as const, label: 'Overview' },
                { key: 'company' as const, label: 'Company Details' },
                { key: 'contacts' as const, label: 'Contacts' },
                { key: 'bank' as const, label: 'Bank Info' },
                { key: 'transactions' as const, label: 'Transactions' },
                { key: 'po' as const, label: 'Purchase Orders' },
                { key: 'bills' as const, label: 'Bills & Payments' },
                { key: 'documents' as const, label: 'Documents' },
                { key: 'compliance' as const, label: 'Compliance & KYC' },
                { key: 'timeline' as const, label: 'Timeline' },
                { key: 'activity' as const, label: 'Activity' },
                { key: 'notes' as const, label: 'Notes' }
              ].map((tab) => {
                const isTabActive = drawerTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDrawerTab(tab.key)}
                    style={{ padding: '0.6rem 0', border: 'none', background: 'transparent', color: isTabActive ? '#E8760A' : 'rgba(42,22,40,0.5)', fontSize: '0.8125rem', fontWeight: isTabActive ? 700 : 600, cursor: 'pointer', borderBottom: isTabActive ? '2px solid #E8760A' : 'none', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {[
                      { lbl: 'Vendor Name', val: activeTx.name },
                      { lbl: 'Vendor ID', val: activeTx.vendorId },
                      {
                        lbl: 'Risk Status',
                        val: (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background:
                              activeTx.status === 'Verified' ? '#E6F4EA' :
                              activeTx.status === 'High Risk' ? '#FEE2E2' :
                              activeTx.status === 'Pending' ? '#E8F0FE' :
                              activeTx.status === 'Active' ? '#E6F4EA' :
                              activeTx.status === 'Blacklisted' ? '#FEE2E2' : '#F1F3F4',
                            color:
                              activeTx.status === 'Verified' ? '#137333' :
                              activeTx.status === 'High Risk' ? '#D32F2F' :
                              activeTx.status === 'Pending' ? '#1A73E8' :
                              activeTx.status === 'Active' ? '#137333' :
                              activeTx.status === 'Blacklisted' ? '#D32F2F' : '#5F6368',
                          }}>
                            {activeTx.status}
                          </span>
                        )
                      },
                      { lbl: 'Compliance Score', val: `${activeTx.complianceScore}%` },
                      { lbl: 'Account Manager', val: activeTx.manager },
                      { lbl: 'Outstanding Balance', val: `AED ${activeTx.outstandingBalance.toLocaleString()}` },
                      { lbl: 'Vendor Since', val: '2023-04-12' },
                      { lbl: 'Last Payment', val: '2026-05-01 (AED 12,000)' },
                      { lbl: 'Total Purchase Orders', val: '18 Approved' },
                      { lbl: 'Last Invoice', val: 'INV-2026-0498' },
                      { lbl: 'Currency', val: 'AED (United Arab Emirates Dirham)' },
                      { lbl: 'Tax Number (TRN)', val: activeTx.name.includes('Alpha') ? '100556789600003' : '100556789600012' },
                      { lbl: 'Payment Method', val: 'Bank Wire Transfer' },
                      { lbl: 'Vendor Rating', val: '⭐⭐⭐⭐★ (4.8/5)' }
                    ].map((row, idx) => (
                      <div key={idx}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase' }}>{row.lbl}</label>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', marginTop: '0.2rem' }}>{row.val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(42,22,40,0.06)' }} />

                  {/* Summary Box */}
                  <div style={{ background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.12)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div><strong style={{ fontSize: '1.15rem', color: '#2A1628', display: 'block' }}>AED {activeTx.totalSpend.toLocaleString()}</strong><span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Total Spend</span></div>
                      <div><strong style={{ fontSize: '1.15rem', color: '#2A1628', display: 'block' }}>{activeTx.terms}</strong><span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Payment Terms</span></div>
                      <div><strong style={{ fontSize: '1.15rem', color: '#2A1628', display: 'block' }}>{activeTx.lastTransaction}</strong><span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Last Activity</span></div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'company' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid #DDD0C4', borderRadius: '12px', background: '#FAF8F5' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>Company Profile Details</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.85)', lineHeight: 1.6 }}>
                      <li>Registration Status: <span style={{ color: '#137333', fontWeight: 700 }}>Active</span></li>
                      <li>Region Location: <strong>{activeTx.country}</strong></li>
                      <li>Category Type: <strong>{activeTx.category}</strong></li>
                      <li>Trade License No: <strong>TL-239482-B</strong></li>
                      <li>Registered Address: <strong>Business Bay, Tower B, Office 1204, Dubai, UAE</strong></li>
                    </ul>
                  </div>
                </div>
              )}

              {drawerTab === 'contacts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628' }}>Primary Account Manager</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', marginTop: '0.25rem' }}>
                      Name: <strong>{activeTx.contactPerson}</strong><br />
                      Email: <strong>{activeTx.email}</strong><br />
                      Phone: <strong>{activeTx.phone}</strong>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'bank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628' }}>Corporate Bank Account</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', marginTop: '0.25rem' }}>
                      Bank: <strong>Emirates NBD</strong><br />
                      IBAN: <strong>AE23049823094820394820</strong><br />
                      SWIFT: <strong>EBILAEADXXX</strong>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'transactions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <input type="text" placeholder="Search transactions..." style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.75rem' }} />
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', color: '#2A1628' }}>Filter</button>
                    <button style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', color: '#2A1628' }}>Export</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Ref</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Debit</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                        <td style={{ padding: '0.5rem' }}>{activeTx.lastTransaction}</td>
                        <td style={{ padding: '0.5rem' }}>TXN-9982</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>AED {activeTx.totalSpend.toLocaleString()}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>AED 0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {drawerTab === 'po' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { poNum: 'PO-2026-0091', date: '2026-05-01', amount: 15400, status: 'Approved', delivery: 'Pending' },
                    { poNum: 'PO-2026-0042', date: '2026-04-12', amount: 8900, status: 'Delivered', delivery: 'Complete' }
                  ].map((p, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{p.poNum}</strong> • {p.date} • {p.delivery}<br />
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Amount: AED {p.amount.toLocaleString()}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: p.status === 'Approved' ? '#E6F4EA' : '#F1F3F4', color: p.status === 'Approved' ? '#137333' : '#5F6368', fontWeight: 700 }}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'bills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { billNum: 'BILL-4412', outstanding: activeTx.outstandingBalance, status: 'Overdue', due: '2026-06-15', method: 'Bank Wire' },
                    { billNum: 'BILL-4310', outstanding: 0, status: 'Paid', due: '2026-04-20', method: 'Corporate Card' }
                  ].map((b, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{b.billNum}</strong> • Due: {b.due} • {b.method}<br />
                        <span style={{ color: 'rgba(42,22,40,0.5)' }}>Outstanding: AED {b.outstanding.toLocaleString()}</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: b.status === 'Paid' ? '#E6F4EA' : '#FEE2E2', color: b.status === 'Paid' ? '#137333' : '#D32F2F', fontWeight: 700 }}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ border: '1.5px dashed #DDD0C4', borderRadius: '12px', padding: '1rem', textAlign: 'center', background: '#FAF8F5', cursor: 'pointer' }} onClick={() => pushToast('File selector opened.', 'info')}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E8760A' }}>+ Upload New Document</span>
                  </div>
                  {[
                    { name: 'Trade_License_2026.pdf', size: '2.4 MB', date: '2026-01-12', user: 'Mahesh Maddu' },
                    { name: 'VAT_Certificate.pdf', size: '1.1 MB', date: '2026-01-14', user: 'System Agent' }
                  ].map((doc, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', fontSize: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>Size: {doc.size} • Uploaded by {doc.user} on {doc.date}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button type="button" onClick={() => pushToast(`Previewing ${doc.name}`, 'info')} style={{ padding: '0.3rem 0.5rem', border: '1px solid #DDD0C4', borderRadius: '4px', background: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}>Preview</button>
                        <button type="button" onClick={() => pushToast(`Downloading ${doc.name}`, 'info')} style={{ padding: '0.3rem 0.5rem', border: '1px solid #DDD0C4', borderRadius: '4px', background: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628' }}>Download</button>
                        <button type="button" onClick={() => pushToast(`Deleted ${doc.name}`, 'warning')} style={{ padding: '0.3rem 0.5rem', border: '1px solid #FCE8E6', borderRadius: '4px', background: '#fff', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', color: '#C5221F' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'compliance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', background: '#FAF8F5' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628', marginBottom: '0.5rem' }}>Compliance & Risk Score Checks</div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.8)', lineHeight: 1.6 }}>
                      <li>KYC Verification: <span style={{ color: '#137333', fontWeight: 700 }}>✓ Verified</span></li>
                      <li>AML Screening: <span style={{ color: '#137333', fontWeight: 700 }}>✓ Cleared</span></li>
                      <li>Trade License Expiry: <strong>2027-01-12</strong></li>
                      <li>VAT Registration Status: <strong>Registered</strong></li>
                      <li>Overall AML Risk Score: <strong>Low Risk (98%)</strong></li>
                    </ul>
                  </div>
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid rgba(232,118,10,0.2)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                  {[
                    { event: 'Payment Released', date: '2026-05-01', desc: 'Outstanding paid via bank wire transfer' },
                    { event: 'PO Approved', date: '2026-04-12', desc: 'Purchase order PO-2026-0042 approved' },
                    { event: 'Bank Updated', date: '2026-02-14', desc: 'Emirates NBD bank account IBAN updated' },
                    { event: 'Vendor Created', date: '2023-04-12', desc: 'Supplier database profile initialized' }
                  ].map((step, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 'calc(-1rem - 6px)', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#E8760A', border: '2px solid #fff' }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628' }}>{step.event}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)' }}>{step.desc}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.15rem' }}>{step.date}</div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { action: 'IBAN details modified', user: 'Mahesh Maddu', ip: '194.28.1.19', device: 'Chrome / Windows', location: 'Dubai, UAE', time: '2026-02-14 09:12' },
                    { action: 'Vendor onboarding approved', user: 'System Agent', ip: '10.0.4.12', device: 'Cron Engine', location: 'Dubai, UAE', time: '2023-04-12 10:00' }
                  ].map((act, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#2A1628' }}>{act.action}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.2rem' }}>
                        User: {act.user} • IP: {act.ip} • Device: {act.device}<br />
                        Location: {act.location} • Time: {act.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'notes' && (() => {
                const list = [
                  { id: '1', user: 'Mahesh Maddu', role: 'Reviewer', date: '2026-05-06', text: 'Supplier credentials verification checked.', tag: 'audit', pinned: true }
                ];
                const filteredNotes = list.filter(n => drawerNoteTag === 'all' || n.tag === drawerNoteTag);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea placeholder="Write internal notes here..." style={{ width: '100%', minHeight: '80px', padding: '0.625rem', borderRadius: '10px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit' }} />
                      <button type="button" onClick={() => pushToast('Note added.', 'success')} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Add Note</button>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(42,22,40,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {filteredNotes.map((note, idx) => (
                        <div key={idx} style={{ padding: '0.75rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.03)', borderRadius: '8px', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(42,22,40,0.5)', marginBottom: '0.25rem' }}>
                            <strong>{note.user} ({note.role}) {note.pinned && '📌'}</strong>
                            <span>{note.date}</span>
                          </div>
                          <div style={{ color: '#2A1628' }}>{note.text}</div>
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

      {/* ── 9. CONFIRMATION POPUPS / MODALS ── */}
      {popup.type === 'add' && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Vendors Center"
          titlePlain="Add"
          titleAccent="Vendor Profile"
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleAddSubmit} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Save Vendor</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Company Name</label>
              <input type="text" placeholder="e.g. Acme Supplier LLC" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Category</label>
                <CustomSelect value={newCategory} onChange={setNewCategory} options={CATEGORIES.filter(x => x !== 'All')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Country</label>
                <CustomSelect value={newCountry} onChange={setNewCountry} options={COUNTRIES.filter(x => x !== 'All')} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Contact Person</label>
                <input type="text" placeholder="John Doe" value={newContactPerson} onChange={(e) => setNewContactPerson(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Email</label>
                <input type="text" placeholder="john@acme.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Tax Registration Number</label>
                <input type="text" placeholder="e.g. 100556789" value={newTaxId} onChange={(e) => setNewTaxId(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '10px', border: '1px solid #DDD0C4', outline: 'none', fontSize: '0.8125rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Payment Terms</label>
                <CustomSelect value={newTerms} onChange={setNewTerms} options={TERMS_OPTIONS.filter(x => x !== 'All')} />
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {popup.type === 'import' && (
        <VendorImportModal
          onClose={() => setPopup({ type: null })}
          onImport={(fileName) => {
            setPopup({ type: null });
            pushToast(`Imported ledgers from file: ${fileName}`, 'success');
          }}
          onToast={pushToast}
        />
      )}

      {popup.type === 'export' && (
        <VendorExportModal
          onClose={() => setPopup({ type: null })}
          onExport={(format, scope) => {
            setPopup({ type: null });
            pushToast(`Started registry download in ${format.toUpperCase()} format for ${scope} scope.`, 'success');
          }}
        />
      )}

      {popup.type === 'confirmArchive' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Vendors Center"
          titlePlain="Archive"
          titleAccent={popup.tx.name}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                setData((prev) => prev.map((x) => (x.id === popup.tx?.id ? { ...x, status: 'Archived' } : x)));
                setPopup({ type: null });
                pushToast('Supplier profile archived successfully.', 'warning');
              }} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Archive</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to archive <strong>{popup.tx.name}</strong>?
          </div>
        </ModalShell>
      )}

      {popup.type === 'confirmDelete' && popup.tx && (
        <ModalShell
          onClose={() => setPopup({ type: null })}
          eyebrow="Vendors Center"
          titlePlain="Delete"
          titleAccent={popup.tx.name}
          footer={
            <>
              <button type="button" onClick={() => setPopup({ type: null })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, color: '#2A1628', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={() => {
                setData((prev) => prev.filter((x) => x.id !== popup.tx?.id));
                setPopup({ type: null });
                pushToast('Supplier profile deleted.', 'danger');
              }} style={{ background: '#C5221F', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </>
          }
        >
          <div style={{ fontSize: '0.875rem', color: '#2A1628', lineHeight: 1.4 }}>
            Are you sure you want to delete <strong>{popup.tx.name}</strong>?
          </div>
        </ModalShell>
      )}

    </div>
  );
}
