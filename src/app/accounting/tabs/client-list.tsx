'use client';

import React, { useState } from 'react';

interface ClientItem {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  email: string;
  trn: string;
  vatStatusText: string;
  manager: string;
  managerAvatar: string;
  status: 'Active' | 'Onboarding' | 'Inactive';
  kycStatus: 'Verified' | 'Expiring Soon' | 'In Review' | 'Expired' | 'Pending';
  booksStatus: 'Completed' | 'In Progress' | 'Not Started';
  vatDue: string;
  vatDueColor: string;
  ctDue: string;
  ctDueColor: string;
  lastActivity: string;
}

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: '1',
    initials: 'AB',
    avatarBg: '#7C2D12',
    name: 'ABC Trading LLC',
    email: 'info@abctrading.ae',
    trn: '100556789600003',
    vatStatusText: 'VAT Registered',
    manager: 'Mahesh Maddu',
    managerAvatar: '👨‍💼',
    status: 'Active',
    kycStatus: 'Verified',
    booksStatus: 'In Progress',
    vatDue: 'Due in 2 Days',
    vatDueColor: '#EF4444',
    ctDue: 'Due in 5 Days',
    ctDueColor: '#EF4444',
    lastActivity: '2h ago'
  },
  {
    id: '2',
    initials: 'XYZ',
    avatarBg: '#312E81',
    name: 'XYZ Holdings Limited',
    email: 'contact@xyzholdings.com',
    trn: '100556789600004',
    vatStatusText: 'VAT Registered',
    manager: 'Priya Nair',
    managerAvatar: '👩‍💼',
    status: 'Active',
    kycStatus: 'Verified',
    booksStatus: 'Completed',
    vatDue: 'Filed',
    vatDueColor: '#10B981',
    ctDue: 'Filed',
    ctDueColor: '#10B981',
    lastActivity: '4h ago'
  },
  {
    id: '3',
    initials: 'DP',
    avatarBg: '#14532D',
    name: 'Delta Properties FZCO',
    email: 'admin@deltaproperties.ae',
    trn: '100556789600005',
    vatStatusText: 'VAT Registered',
    manager: 'Rohit Sharma',
    managerAvatar: '👨‍💻',
    status: 'Active',
    kycStatus: 'Expiring Soon',
    booksStatus: 'In Progress',
    vatDue: 'Due in 7 Days',
    vatDueColor: '#F59E0B',
    ctDue: 'Due in 12 Days',
    ctDueColor: '#F59E0B',
    lastActivity: '6h ago'
  },
  {
    id: '4',
    initials: 'AT',
    avatarBg: '#1E3A8A',
    name: 'Alpha Tech FZCO',
    email: 'finance@alphatech.ae',
    trn: '100556789600006',
    vatStatusText: 'VAT Registered',
    manager: 'Sneha Iyer',
    managerAvatar: '👩‍💻',
    status: 'Active',
    kycStatus: 'Verified',
    booksStatus: 'Completed',
    vatDue: 'Filed',
    vatDueColor: '#10B981',
    ctDue: 'Due in 20 Days',
    ctDueColor: '#F59E0B',
    lastActivity: '1d ago'
  },
  {
    id: '5',
    initials: 'BI',
    avatarBg: '#3B0764',
    name: 'Beta Industries LLC',
    email: 'operations@betaind.ae',
    trn: '100556789600007',
    vatStatusText: 'VAT Registered',
    manager: 'Mahesh Maddu',
    managerAvatar: '👨‍💼',
    status: 'Active',
    kycStatus: 'Pending',
    booksStatus: 'In Progress',
    vatDue: 'Due in 1 Day',
    vatDueColor: '#EF4444',
    ctDue: 'Due in 3 Days',
    ctDueColor: '#EF4444',
    lastActivity: '1d ago'
  },
  {
    id: '6',
    initials: 'GS',
    avatarBg: '#0F172A',
    name: 'Gamma Solutions FZCO',
    email: 'info@gammasolutions.ae',
    trn: '100556789600008',
    vatStatusText: 'VAT Registered',
    manager: 'Priya Nair',
    managerAvatar: '👩‍💼',
    status: 'Active',
    kycStatus: 'Verified',
    booksStatus: 'Completed',
    vatDue: 'Filed',
    vatDueColor: '#10B981',
    ctDue: 'Filed',
    ctDueColor: '#10B981',
    lastActivity: '2d ago'
  },
  {
    id: '7',
    initials: 'NH',
    avatarBg: '#052E16',
    name: 'Nova Hospitality LLC',
    email: 'accounts@novahospitality.ae',
    trn: '100556789600009',
    vatStatusText: 'VAT Registered',
    manager: 'Rohit Sharma',
    managerAvatar: '👨‍💻',
    status: 'Onboarding',
    kycStatus: 'In Review',
    booksStatus: 'Not Started',
    vatDue: '-',
    vatDueColor: 'rgba(42,22,40,0.4)',
    ctDue: '-',
    ctDueColor: 'rgba(42,22,40,0.4)',
    lastActivity: '2d ago'
  },
  {
    id: '8',
    initials: 'PC',
    avatarBg: '#312E81',
    name: 'Prime Consultants FZCO',
    email: 'contact@primeconsultants.ae',
    trn: '100556789600010',
    vatStatusText: 'VAT Registered',
    manager: 'Sneha Iyer',
    managerAvatar: '👩‍💻',
    status: 'Active',
    kycStatus: 'Verified',
    booksStatus: 'In Progress',
    vatDue: 'Due in 10 Days',
    vatDueColor: '#F59E0B',
    ctDue: 'Due in 18 Days',
    ctDueColor: '#F59E0B',
    lastActivity: '3d ago'
  },
  {
    id: '9',
    initials: 'SS',
    avatarBg: '#1A2E1A',
    name: 'Sigma Services LLC',
    email: 'hello@sigmaservices.ae',
    trn: '100556789600011',
    vatStatusText: 'VAT Registered',
    manager: 'Mahesh Maddu',
    managerAvatar: '👨‍💼',
    status: 'Inactive',
    kycStatus: 'Expired',
    booksStatus: 'Not Started',
    vatDue: 'Overdue',
    vatDueColor: '#EF4444',
    ctDue: 'Overdue',
    ctDueColor: '#EF4444',
    lastActivity: '5d ago'
  },
  {
    id: '10',
    initials: 'TE',
    avatarBg: '#3B0764',
    name: 'Vertex Enterprises LLC',
    email: 'finance@vertex.ae',
    trn: '100556789600012',
    vatStatusText: 'VAT Registered',
    manager: 'Priya Nair',
    managerAvatar: '👩‍💼',
    status: 'Active',
    kycStatus: 'Verified',
    booksStatus: 'Completed',
    vatDue: 'Filed',
    vatDueColor: '#10B981',
    ctDue: 'Filed',
    ctDueColor: '#10B981',
    lastActivity: '5d ago'
  }
];

export default function ClientListTab() {
  const [search, setSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState<'local' | 'drive'>('local');
  const [importDragOver, setImportDragOver] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected' | 'custom'>('all');
  const [exportCustomCount, setExportCustomCount] = useState('10');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [modalKycOpen, setModalKycOpen] = useState(false);
  const [modalBooksOpen, setModalBooksOpen] = useState(false);
  const [addClientForm, setAddClientForm] = useState({
    name: '', email: '', trn: '', manager: '',
    status: 'Active', kycStatus: 'Verified',
    booksStatus: 'In Progress', vatDue: '', ctDue: ''
  });
  const [filters, setFilters] = useState({
    status: 'All',
    manager: 'All',
    bookkeeping: 'All',
    kyc: 'All'
  });

  const filterOptions = {
    status: ['All', 'Active', 'Onboarding', 'Inactive'],
    manager: ['All', 'Mahesh Maddu', 'Priya Nair', 'Rohit Sharma', 'Sneha Iyer'],
    bookkeeping: ['All', 'Completed', 'In Progress', 'Not Started'],
    kyc: ['All', 'Verified', 'Expiring Soon', 'In Review', 'Expired']
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClients(INITIAL_CLIENTS.map(c => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(x => x !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const filteredClients = INITIAL_CLIENTS.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.trn.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = filters.status === 'All' || client.status === filters.status;
    const matchesManager = filters.manager === 'All' || client.manager === filters.manager;
    const matchesBookkeeping = filters.bookkeeping === 'All' || client.booksStatus === filters.bookkeeping;
    const matchesKyc = filters.kyc === 'All' || client.kycStatus === filters.kyc;
    
    return matchesSearch && matchesStatus && matchesManager && matchesBookkeeping && matchesKyc;
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
              Accounting &gt; Client List
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
            Client <span style={{ fontStyle: 'italic', color: '#E8760A' }}>List</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            View and manage all your clients, compliance status, and accounting progress.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
            gap: '0.375rem'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Export
          </button>
          <button
            onClick={() => setImportOpen(true)}
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
            gap: '0.375rem'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#E8760A' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import Clients
          </button>

          {/* ── IMPORT MODAL ── */}
          {importOpen && (
            <div onClick={() => setImportOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
                {/* Header */}
                <div style={{ background: '#FAF8F5', padding: '1.5rem 1.75rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Client List</p>
                    <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>Import <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Clients</span></h2>
                  </div>
                  <button onClick={() => setImportOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                {/* Source Toggle */}
                <div style={{ padding: '1.5rem 1.75rem 0' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(42,22,40,0.04)', borderRadius: '10px', padding: '4px' }}>
                    {(['local', 'drive'] as const).map(src => (
                      <button key={src} onClick={() => { setImportSource(src); setImportFile(null); }}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', background: importSource === src ? '#ffffff' : 'transparent', color: importSource === src ? '#2A1628' : 'rgba(42,22,40,0.5)', boxShadow: importSource === src ? '0 1px 4px rgba(42,22,40,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.15s' }}
                      >
                        {src === 'local' ? (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> Local File</>
                        ) : (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.81 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg> Google Drive</>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem 1.75rem 1.75rem' }}>
                  {importSource === 'local' ? (
                    <div
                      onDragOver={e => { e.preventDefault(); setImportDragOver(true); }}
                      onDragLeave={() => setImportDragOver(false)}
                      onDrop={e => { e.preventDefault(); setImportDragOver(false); const f = e.dataTransfer.files[0]; if (f) setImportFile(f); }}
                      style={{ border: `2px dashed ${importDragOver ? '#E8760A' : '#DDD0C4'}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', background: importDragOver ? 'rgba(232,118,10,0.04)' : '#FAFAF9', transition: 'all 0.15s', cursor: 'pointer' }}
                      onClick={() => document.getElementById('import-file-input')?.click()}
                    >
                      <input id="import-file-input" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setImportFile(f); }} />
                      {importFile ? (
                        <div>
                          <div style={{ width: '40px', height: '40px', background: 'rgba(4,120,87,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#2A1628', fontSize: '0.875rem' }}>{importFile.name}</p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>{(importFile.size / 1024).toFixed(1)} KB — click to change</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ width: '48px', height: '48px', background: 'rgba(232,118,10,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          </div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#2A1628' }}>Drop your Excel file here</p>
                          <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>or click to browse — supports .xlsx, .xls, .csv</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                      <div style={{ width: '56px', height: '56px', background: 'rgba(66,133,244,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#4285F4" />
                          <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#34A853" />
                          <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#FBBC05" />
                          <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#EA4335" />
                        </svg>
                      </div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#2A1628', fontSize: '0.9375rem' }}>Connect Google Drive</p>
                      <p style={{ margin: '0.4rem 0 1.25rem', fontSize: '0.8rem', color: 'rgba(42,22,40,0.5)' }}>Sign in with Google to browse and pick an Excel sheet from your Drive</p>
                      <button
                        onClick={() => alert('Google Drive OAuth — wire your OAuth client ID here')}
                        style={{ background: '#4285F4', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(66,133,244,0.3)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                          <rect x="13" y="3" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                          <rect x="3" y="13" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                          <rect x="13" y="13" width="8" height="8" rx="1" fill="#fff" fillOpacity="0.9" />
                        </svg>
                        Sign in with Google
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', background: 'rgba(232,118,10,0.04)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>
                    <strong style={{ color: '#2A1628' }}>Template columns required:</strong> Company Name, Email, TRN, Manager, Status, KYC, Books, VAT, CT
                    <span style={{ marginLeft: '0.5rem', cursor: 'pointer', color: '#E8760A', fontWeight: 600 }}>Download template →</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.1rem 1.75rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button onClick={() => setImportOpen(false)} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}>Cancel</button>
                  <button
                    disabled={importSource === 'local' && !importFile}
                    onClick={() => { alert('Import triggered — wire to your parse/API logic here'); setImportOpen(false); setImportFile(null); }}
                    style={{ background: importSource === 'local' && !importFile ? 'rgba(42,22,40,0.15)' : '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: importSource === 'local' && !importFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    Import Clients
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setAddClientOpen(true)}
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add New Client
          </button>

          {/* ── ADD CLIENT MODAL ── */}
          {addClientOpen && (
            <div
              onClick={() => setAddClientOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(42,22,40,0.45)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '580px',
                  boxShadow: '0 24px 64px rgba(42,22,40,0.2)',
                  overflow: 'hidden',
                  fontFamily: 'var(--font-sans), Inter, sans-serif'
                }}
              >
                {/* Modal Header */}
                <div style={{
                  background: '#FAF8F5',
                  padding: '1.5rem 1.75rem',
                  borderBottom: '1px solid #DDD0C4',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Client List</p>
                    <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                      Add <span style={{ fontStyle: 'italic', color: '#E8760A' }}>New Client</span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setAddClientOpen(false)}
                    style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Row 1: Name + Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Company Name *</label>
                      <input
                        type="text" placeholder="e.g. ABC Trading LLC"
                        value={addClientForm.name}
                        onChange={e => setAddClientForm(f => ({ ...f, name: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Email Address *</label>
                      <input
                        type="email" placeholder="e.g. info@company.ae"
                        value={addClientForm.email}
                        onChange={e => setAddClientForm(f => ({ ...f, email: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Row 2: TRN + Manager */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>TRN / VAT No.</label>
                      <input
                        type="text" placeholder="e.g. 100556789600001"
                        value={addClientForm.trn}
                        onChange={e => setAddClientForm(f => ({ ...f, trn: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Account Manager</label>
                      <input
                        type="text" placeholder="e.g. Mahesh Maddu"
                        value={addClientForm.manager}
                        onChange={e => setAddClientForm(f => ({ ...f, manager: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Status + KYC */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Status</label>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => { setModalStatusOpen(o => !o); setModalKycOpen(false); setModalBooksOpen(false); }}
                          style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                        >
                          {addClientForm.status}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </button>
                        {modalStatusOpen && (
                          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, overflow: 'hidden' }}>
                            {['Active', 'Onboarding', 'Inactive'].map(opt => (
                              <div key={opt} onClick={() => { setAddClientForm(f => ({ ...f, status: opt })); setModalStatusOpen(false); }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: addClientForm.status === opt ? '#E8760A' : '#2A1628', background: addClientForm.status === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: addClientForm.status === opt ? 600 : 400 }}
                                onMouseEnter={e => { if (addClientForm.status !== opt) (e.currentTarget as HTMLDivElement).style.background = 'rgba(232,118,10,0.04)'; }}
                                onMouseLeave={e => { if (addClientForm.status !== opt) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                              >{opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>KYC Status</label>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => { setModalKycOpen((o: boolean) => !o); setModalStatusOpen(false); setModalBooksOpen(false); }}
                          style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                        >
                          {addClientForm.kycStatus}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </button>
                        {modalKycOpen && (
                          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, overflow: 'hidden' }}>
                            {['Verified', 'Expiring Soon', 'In Review', 'Expired', 'Pending'].map((opt: string) => (
                              <div key={opt} onClick={() => { setAddClientForm((f: typeof addClientForm) => ({ ...f, kycStatus: opt })); setModalKycOpen(false); }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: addClientForm.kycStatus === opt ? '#E8760A' : '#2A1628', background: addClientForm.kycStatus === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: addClientForm.kycStatus === opt ? 600 : 400 }}
                                onMouseEnter={e => { if (addClientForm.kycStatus !== opt) (e.currentTarget as HTMLDivElement).style.background = 'rgba(232,118,10,0.04)'; }}
                                onMouseLeave={e => { if (addClientForm.kycStatus !== opt) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                              >{opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Books + VAT */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Books Status</label>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => { setModalBooksOpen(o => !o); setModalStatusOpen(false); setModalKycOpen(false); }}
                          style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', background: '#fff', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                        >
                          {addClientForm.booksStatus}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                        </button>
                        {modalBooksOpen && (
                          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 200, overflow: 'hidden' }}>
                            {['Completed', 'In Progress', 'Not Started'].map(opt => (
                              <div key={opt} onClick={() => { setAddClientForm(f => ({ ...f, booksStatus: opt })); setModalBooksOpen(false); }}
                                style={{ padding: '0.55rem 0.85rem', fontSize: '0.8125rem', cursor: 'pointer', color: addClientForm.booksStatus === opt ? '#E8760A' : '#2A1628', background: addClientForm.booksStatus === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: addClientForm.booksStatus === opt ? 600 : 400 }}
                                onMouseEnter={e => { if (addClientForm.booksStatus !== opt) (e.currentTarget as HTMLDivElement).style.background = 'rgba(232,118,10,0.04)'; }}
                                onMouseLeave={e => { if (addClientForm.booksStatus !== opt) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                              >{opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>VAT Status</label>
                      <input
                        type="text" placeholder="e.g. Filed / Due in 7 Days"
                        value={addClientForm.vatDue}
                        onChange={e => setAddClientForm(f => ({ ...f, vatDue: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Row 5: CT Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>CT Status</label>
                      <input
                        type="text" placeholder="e.g. Filed / Due in 30 Days"
                        value={addClientForm.ctDue}
                        onChange={e => setAddClientForm(f => ({ ...f, ctDue: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.75rem', fontSize: '0.8125rem', color: '#2A1628', outline: 'none', boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{
                  padding: '1.25rem 1.75rem',
                  borderTop: '1px solid #DDD0C4',
                  background: '#FAF8F5',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem'
                }}>
                  <button
                    onClick={() => setAddClientOpen(false)}
                    style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >Cancel</button>
                  <button
                    onClick={() => {
                      // TODO: wire to API
                      setAddClientOpen(false);
                      setAddClientForm({ name: '', email: '', trn: '', manager: '', status: 'Active', kycStatus: 'Verified', booksStatus: 'In Progress', vatDue: '', ctDue: '' });
                    }}
                    style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.2)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Client
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* ── EXPORT MODAL ── */}
          {exportOpen && (
            <div onClick={() => setExportOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
                {/* Header */}
                <div style={{ background: '#FAF8F5', padding: '1.5rem 1.75rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Client List</p>
                    <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>Export <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Clients</span></h2>
                  </div>
                  <button onClick={() => setExportOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Scope */}
                  <div>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Which clients to export?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {([
                        { id: 'all', label: 'All Clients', sub: 'Export all clients in the system', count: '248' },
                        { id: 'filtered', label: 'Filtered Results', sub: 'Only clients matching current filters', count: String(INITIAL_CLIENTS.length) },
                        { id: 'selected', label: 'Selected Clients', sub: 'Only the clients you have checked', count: String(selectedClients.length) },
                        { id: 'custom', label: 'Custom Count', sub: 'Specify exactly how many to export', count: null },
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
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: exportScope === opt.id ? '#E8760A' : 'rgba(42,22,40,0.4)', background: exportScope === opt.id ? 'rgba(232,118,10,0.08)' : 'rgba(42,22,40,0.04)', borderRadius: '4px', padding: '0.15rem 0.5rem' }}>{opt.count} clients</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Custom count input */}
                    {exportScope === 'custom' && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, whiteSpace: 'nowrap' }}>Number of clients:</label>
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
                      onClick={() => { alert(`Exporting ${exportScope === 'custom' ? exportCustomCount : exportScope} clients as .${exportFormat} \u2014 wire to your export logic`); setExportOpen(false); }}
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
      </div>

      {/* ── METRICS GRID (7 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
        {[
          {
            label: 'Total Clients',
            value: '248',
            sub: '+12 this week',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            label: 'Active Clients',
            value: '210',
            sub: '84.7%',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )
          },
          {
            label: 'Onboarding',
            value: '18',
            sub: '7.3%',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            )
          },
          {
            label: 'Inactive Clients',
            value: '20',
            sub: '8.0%',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )
          },
          {
            label: 'KYC Expiring (30 Days)',
            value: '11',
            sub: 'View All',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )
          },
          {
            label: 'VAT Due This Week',
            value: '9',
            sub: 'View All',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            )
          },
          {
            label: 'CT Due This Week',
            value: '4',
            sub: 'View All',
            bg: 'rgba(232, 118, 10, 0.06)',
            color: '#E8760A',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="15" y2="16" />
              </svg>
            )
          },
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
            minHeight: '105px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{card.value}</div>
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
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(42,22,40,0.01)'
      }}>
        <div style={{ display: 'flex', flex: 1, gap: '0.75rem', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search clients by name, company, email, or TRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.25rem',
                fontSize: '0.8125rem',
                border: '1px solid #DDD0C4',
                borderRadius: '8px',
                background: '#FAF8F5',
                outline: 'none',
                color: '#2A1628'
              }}
            />
          </div>

          {/* Dropdowns */}
          {[
            { label: 'Status', key: 'status' },
            { label: 'Account Manager', key: 'manager' },
            { label: 'Bookkeeping Status', key: 'bookkeeping' },
            { label: 'KYC Status', key: 'kyc' }
          ].map((f) => {
            const isOpen = activeDropdown === f.key;
            const selectedVal = filters[f.key as keyof typeof filters];
            const options = filterOptions[f.key as keyof typeof filterOptions];
            
            return (
              <div key={f.key} style={{ position: 'relative' }}>
                <div
                  onClick={() => setActiveDropdown(isOpen ? null : f.key)}
                  style={{
                    padding: '0.55rem 1rem',
                    fontSize: '0.8125rem',
                    border: '1px solid #DDD0C4',
                    borderRadius: '8px',
                    background: '#FAF8F5',
                    color: '#2A1628',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    userSelect: 'none',
                    minWidth: f.key === 'manager' ? '170px' : f.key === 'bookkeeping' ? '180px' : '120px',
                    justifyContent: 'space-between',
                    fontWeight: 500
                  }}
                >
                  <span>{f.label}: {selectedVal}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                
                {isOpen && (
                  <div style={{
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
                    padding: '4px'
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
                          transition: 'all 100ms ease'
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

          <button 
            onClick={() => {
              setSearch('');
              setFilters({
                status: 'All',
                manager: 'All',
                bookkeeping: 'All',
                kyc: 'All'
              });
            }}
            style={{ 
              padding: '0.55rem 1.25rem',
              fontSize: '0.8125rem', 
              border: '1px solid #DDD0C4',
              borderRadius: '8px',
              background: '#FAF8F5',
              color: 'rgba(42,22,40,0.6)', 
              cursor: 'pointer', 
              fontWeight: 600,
              userSelect: 'none',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
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
      </div>



      {/* ── CLIENT DATA TABLE ── */}
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
                <input type="checkbox" onChange={handleSelectAll} checked={selectedClients.length === INITIAL_CLIENTS.length} />
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
              <th style={{ padding: '1rem' }}>ACCOUNT MANAGER</th>
              <th style={{ padding: '1rem' }}>STATUS</th>
              <th style={{ padding: '1rem' }}>KYC STATUS</th>
              <th style={{ padding: '1rem' }}>BOOKS STATUS</th>
              <th style={{ padding: '1rem' }}>VAT STATUS</th>
              <th style={{ padding: '1rem' }}>CT STATUS</th>
              <th style={{ padding: '1rem' }}>LAST ACTIVITY</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client, idx) => (
              <tr key={client.id} style={{
                borderBottom: idx < filteredClients.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                background: selectedClients.includes(client.id) ? 'rgba(232,118,10,0.02)' : 'transparent'
              }}>
                <td style={{ 
                  padding: '1rem 0.75rem', 
                  textAlign: 'center',
                  position: 'sticky',
                  left: 0,
                  background: selectedClients.includes(client.id) ? '#FAF4EE' : '#ffffff',
                  zIndex: 9
                }}>
                  <input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => handleSelectOne(client.id)} />
                </td>
                
                {/* Client Company info */}
                <td style={{ 
                  padding: '1rem', 
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  left: '48px',
                  background: selectedClients.includes(client.id) ? '#FAF4EE' : '#ffffff',
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
                      {client.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#2A1628' }}>{client.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{client.email}</div>
                    </div>
                  </div>
                </td>

                {/* TRN / VAT */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 500, color: '#2A1628' }}>{client.trn}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)' }}>{client.vatStatusText}</div>
                </td>

                {/* Manager */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(232, 118, 10, 0.06)',
                      color: '#E8760A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span style={{ fontWeight: 500, color: '#2A1628' }}>{client.manager}</span>
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: client.status === 'Active' ? 'rgba(4, 120, 87, 0.08)' : client.status === 'Onboarding' ? 'rgba(184, 137, 42, 0.08)' : 'rgba(42, 22, 40, 0.06)',
                    color: client.status === 'Active' ? '#047857' : client.status === 'Onboarding' ? '#B8892A' : 'rgba(42, 22, 40, 0.6)'
                  }}>{client.status}</span>
                </td>

                {/* KYC status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: client.kycStatus === 'Verified' ? 'rgba(4, 120, 87, 0.08)' : client.kycStatus === 'Expiring Soon' ? 'rgba(184, 137, 42, 0.08)' : client.kycStatus === 'In Review' ? 'rgba(42, 22, 40, 0.06)' : 'rgba(196, 105, 90, 0.08)',
                    color: client.kycStatus === 'Verified' ? '#047857' : client.kycStatus === 'Expiring Soon' ? '#B8892A' : client.kycStatus === 'In Review' ? 'rgba(42, 22, 40, 0.6)' : '#C4695A'
                  }}>
                    {client.kycStatus}
                  </span>
                </td>

                {/* Books status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: client.booksStatus === 'Completed' ? 'rgba(4, 120, 87, 0.08)' : client.booksStatus === 'In Progress' ? 'rgba(184, 137, 42, 0.08)' : 'rgba(42, 22, 40, 0.06)',
                    color: client.booksStatus === 'Completed' ? '#047857' : client.booksStatus === 'In Progress' ? '#B8892A' : 'rgba(42, 22, 40, 0.6)'
                  }}>{client.booksStatus}</span>
                </td>

                {/* VAT Status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  {client.vatDue === 'Filed' ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(4, 120, 87, 0.08)', color: '#047857' }}>Filed</span>
                  ) : client.vatDue === '-' ? (
                    <span style={{ color: 'rgba(42,22,40,0.4)' }}>-</span>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: client.vatDue.includes('Overdue') ? 'rgba(196, 105, 90, 0.08)' : 'rgba(184, 137, 42, 0.08)',
                      color: client.vatDue.includes('Overdue') ? '#C4695A' : '#B8892A'
                    }}>{client.vatDue}</span>
                  )}
                </td>

                {/* CT Status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  {client.ctDue === 'Filed' ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(4, 120, 87, 0.08)', color: '#047857' }}>Filed</span>
                  ) : client.ctDue === '-' ? (
                    <span style={{ color: 'rgba(42,22,40,0.4)' }}>-</span>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: client.ctDue.includes('Overdue') ? 'rgba(196, 105, 90, 0.08)' : 'rgba(184, 137, 42, 0.08)',
                      color: client.ctDue.includes('Overdue') ? '#C4695A' : '#B8892A'
                    }}>{client.ctDue}</span>
                  )}
                </td>

                {/* Last Activity */}
                <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500 }}>
                  {client.lastActivity}
                </td>

                {/* Actions */}
                <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(42,22,40,0.45)', display: 'flex', alignItems: 'center', padding: '4px' }} title="View">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(42,22,40,0.45)', display: 'flex', alignItems: 'center', padding: '4px', fontSize: '1rem', lineHeight: 1 }} title="More">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
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
  );
}
