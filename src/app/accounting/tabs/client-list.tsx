'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import {
  useGetClientsQuery,
  useGetClientKpisQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useBulkUpdateClientsMutation,
  useImportClientsMutation,
  useGetClientDrawerDetailsQuery,
  useUploadClientDocumentMutation,
} from '@/lib/clientapi';

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
  status: 'Active' | 'Onboarding' | 'Inactive' | 'Archived' | 'Suspended';
  kycStatus: 'Verified' | 'Expiring Soon' | 'In Review' | 'Expired' | 'Pending';
  booksStatus: 'Completed' | 'In Progress' | 'Not Started' | 'Review' | 'Overdue';
  vatDue: string;
  vatDueColor: string;
  ctDue: string;
  ctDueColor: string;
  lastActivity: string;
  // ── Enterprise Fields ──
  clientCode: string;
  industry: string;
  entityType: string;
  bookkeeper: string;
  financialYear: string;
  isVatRegistered: string;
  vatFilingPeriod: string;
  vatCycle: string;
  qbStatus: 'Connected' | 'Syncing' | 'Error' | 'Disconnected';
  riskLevel: 'Low' | 'Medium' | 'High';
  overallProgress: number;
  activeTasks: number;
  documents: number;
  nextDeadline: string;
  tags: string[];
  country: string;
  onboardingStage: string;
}


export default function ClientListTab() {
  const [bulkAction, setBulkAction] = useState<{ type: 'manager' | 'bookkeeper' | 'status' | 'tag' | 'delete' | 'archive' | null, title: string }>({ type: null, title: '' });
  const [bulkValue, setBulkValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | null }>({ message: '', type: null });
  const [aiReviewing, setAiReviewing] = useState(false);
  const [docCategory, setDocCategory] = useState<string>('Trade License');
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };
  const [search, setSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionParam = searchParams.get('action');

  const [addClientOpen, setAddClientOpen] = useState(actionParam === 'add-client');
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState<'local' | 'drive'>('local');
  const [importDragOver, setImportDragOver] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected' | 'custom'>('all');
  const [exportCustomCount, setExportCustomCount] = useState('10');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'pdf' | 'print'>('xlsx');
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [modalKycOpen, setModalKycOpen] = useState(false);
  const [modalBooksOpen, setModalBooksOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [addClientForm, setAddClientForm] = useState({ 
    name: '', 
    email: '', 
    tradeLicense: '',
    authorizedSignatory: '',
    phoneNumber: '',
    isVatRegistered: 'Yes', 
    trn: '', 
    vatFilingPeriod: 'Quarterly', 
    vatCycle: 'Jan-Apr-Jul-Oct', 
    estimatedTurnover: '',
    financialYearEnd: '',
    tradeLicenseExpiry: '',
    ctStatus: 'Not registered',
    ctTrn: '',
    manager: 'Sara Al Mansoori', 
    caAssigned: 'Amit Shah (FTA Agent #4021)'
  });
  const [filters, setFilters] = useState({
    status: 'All',
    manager: 'All',
    bookkeeping: 'All',
    kyc: 'All'
  });

  // ── Enterprise State ──
  const [advancedFilters, setAdvancedFilters] = useState({
    bookkeeper: 'All', industry: 'All', entityType: 'All',
    country: 'All', financialYear: 'All', qbStatus: 'All',
    riskLevel: 'All', tags: 'All',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewClient, setPreviewClient] = useState<ClientItem | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'timeline' | 'documents' | 'ai' | 'activity'>('overview');
  const [savedView, setSavedView] = useState('All Clients');
  const [rowActionOpen, setRowActionOpen] = useState<string | null>(null);
  const [advFilterOpen, setAdvFilterOpen] = useState<string | null>(null);
  const [deleteClientConfirm, setDeleteClientConfirm] = useState<any>(null);

  // ── API Mutators & Queries ──
  const [addClient, { isLoading: isAddingClient }] = useAddClientMutation();
  const [deleteClient, { isLoading: isDeletingClient }] = useDeleteClientMutation();
  const [bulkUpdateClients, { isLoading: isBulkUpdating }] = useBulkUpdateClientsMutation();
  const [importClients] = useImportClientsMutation();
  const [uploadClientDoc] = useUploadClientDocumentMutation();

  const { data: clientsRes, isLoading: clientsLoading } = useGetClientsQuery({
    page: currentPage,
    limit: rowsPerPage,
    search,
    filters: {
      ...filters,
      ...advancedFilters,
      savedView
    }
  });

  const { data: kpisRes, isLoading: kpisLoading } = useGetClientKpisQuery();
  const { data: drawerDetailsRes } = useGetClientDrawerDetailsQuery(previewClient?.id || '', { skip: !previewClient });
  const drawerDetails = drawerDetailsRes?.data || { tasks: [], documents: [], activities: [] };

  const clients = clientsRes?.data?.clients || [];
  const totalItems = clientsRes?.data?.total || 0;

  const kpis = kpisRes?.data || {
    totalClients: 0,
    activeClients: 0,
    overdueBooks: 0,
    kycWarnings: 0,
    qboSyncErrors: 0
  };

  const filterOptions = {
    status: ['All', 'Active', 'Onboarding', 'Inactive', 'Archived', 'Suspended'],
    manager: ['All', 'Mahesh Maddu', 'Priya Nair', 'Rohit Sharma', 'Sneha Iyer'],
    bookkeeping: ['All', 'Completed', 'In Progress', 'Not Started', 'Review', 'Overdue'],
    kyc: ['All', 'Verified', 'Expiring Soon', 'In Review', 'Expired']
  };

  const advancedFilterOptions = {
    bookkeeper: ['All', 'Alex Mercer', 'Emma Watson', 'Liam Neeson', 'Sarah Khan'],
    industry: ['All', 'Trading', 'Finance', 'Real Estate', 'Technology', 'Manufacturing', 'Consulting', 'Hospitality', 'Services', 'Media'],
    entityType: ['All', 'LLC', 'FZCO', 'FZE', 'Partnership', 'Sole Proprietorship'],
    country: ['All', 'UAE', 'Saudi Arabia', 'Qatar', 'Bahrain'],
    financialYear: ['All', 'Jan–Dec 2024', 'Jan–Dec 2023', 'Apr–Mar 2024', 'Jan–Dec 2025'],
    qbStatus: ['All', 'Connected', 'Syncing', 'Error', 'Disconnected'],
    riskLevel: ['All', 'Low', 'Medium', 'High'],
    tags: ['All', 'Priority', 'Premium', 'VIP', 'Urgent', 'New Client', 'Attention', 'Review', 'Tech'],
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClients(clients.map((c: any) => c.id));
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

  const filteredClients = clients;

  
  const getNextVatDeadline = () => {
    if (addClientForm.isVatRegistered === 'No') return 'Not applicable';
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11
    
    if (addClientForm.vatFilingPeriod === 'Monthly') {
      return `28 ${new Date(year, month + 1, 1).toLocaleString('default', { month: 'short' })} ${month === 11 ? year + 1 : year}`;
    }
    
    if (addClientForm.vatCycle === 'Jan-Apr-Jul-Oct') {
      if (month <= 1) return `28 Feb ${year}`;
      if (month <= 4) return `28 May ${year}`;
      if (month <= 7) return `28 Aug ${year}`;
      if (month <= 10) return `28 Nov ${year}`;
      return `28 Feb ${year + 1}`;
    }
    if (addClientForm.vatCycle === 'Feb-May-Aug-Nov') {
      if (month <= 2) return `28 Mar ${year}`;
      if (month <= 5) return `28 Jun ${year}`;
      if (month <= 8) return `28 Sep ${year}`;
      if (month <= 11) return `28 Dec ${year}`;
      return `28 Mar ${year + 1}`;
    }
    if (addClientForm.vatCycle === 'Mar-Jun-Sep-Dec') {
      if (month <= 3) return `28 Apr ${year}`;
      if (month <= 6) return `28 Jul ${year}`;
      if (month <= 9) return `28 Oct ${year}`;
      return `28 Jan ${year + 1}`;
    }
    return 'Pending Calculation';
  };

  const getCtDeadline = () => {
    if (!addClientForm.financialYearEnd) return 'Pending FY End Date';
    const fye = new Date(addClientForm.financialYearEnd);
    fye.setMonth(fye.getMonth() + 9);
    return fye.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\//g, ' ');
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
            <div onClick={() => { setImportOpen(false); setImportFile(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
                {/* Header */}
                <div style={{ padding: '2rem 2rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.4)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>CLIENT LIST</p>
                    <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.625rem', fontWeight: 300, color: '#2A1628', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                      Import <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Clients</span>
                    </h2>
                  </div>
                  <button onClick={() => { setImportOpen(false); setImportFile(null); }} style={{ background: 'rgba(42,22,40,0.04)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(42,22,40,0.06)' }} />



                {/* Body */}
                <div style={{ padding: '1.5rem 2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div
                      onDragOver={e => { e.preventDefault(); setImportDragOver(true); }}
                      onDragLeave={() => setImportDragOver(false)}
                      onDrop={e => { e.preventDefault(); setImportDragOver(false); const f = e.dataTransfer.files[0]; if (f) setImportFile(f); }}
                      style={{ border: `1.5px dashed ${importDragOver ? '#E8760A' : '#DDD0C4'}`, borderRadius: '16px', padding: '2.5rem 1.5rem', textAlign: 'center', background: importDragOver ? 'rgba(232,118,10,0.04)' : '#FAF8F5', transition: 'all 0.15s', cursor: 'pointer' }}
                      onClick={() => document.getElementById('import-file-input')?.click()}
                    >
                      <input id="import-file-input" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setImportFile(f); }} />
                      {importFile ? (
                        <div>
                          <div style={{ width: '48px', height: '48px', background: 'rgba(4,120,87,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#047857' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#2A1628' }}>{importFile.name}</h4>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>{(importFile.size / 1024).toFixed(1)} KB — click to change</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ width: '48px', height: '48px', background: 'rgba(232,118,10,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#E8760A' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#2A1628' }}>Drop your Excel file here</h4>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)' }}>or click to browse — supports .xlsx, .xls, .csv</p>
                        </div>
                      )}
                    </div>

                  <div style={{ background: '#FFFDF9', border: '1px solid #FFE7D0', borderRadius: '12px', padding: '1rem', fontSize: '0.75rem', lineHeight: 1.4, color: 'rgba(42,22,40,0.7)', textAlign: 'left' }}>
                    Template columns required: <span style={{ color: 'rgba(42,22,40,0.45)' }}>Company Name, Email, TRN, Manager, Status, KYC, Books, VAT, CT</span>.{' '}
                    <span onClick={() => {
                      const headers = "Company Name,Email,TRN,Manager,Status,KYC,Books,VAT,CT\n";
                      const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement("a");
                      const url = URL.createObjectURL(blob);
                      link.setAttribute("href", url);
                      link.setAttribute("download", "incHub_client_import_template.csv");
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      triggerToast('Template downloaded.', 'success');
                    }} style={{ cursor: 'pointer', color: '#E8760A', fontWeight: 600 }}>Download template →</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 2rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(42,22,40,0.06)', background: '#FAF8F5' }}>
                  <button onClick={() => { setImportOpen(false); setImportFile(null); }} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}>Cancel</button>
                  <button
                    disabled={!importFile}
                    onClick={async () => {
                      if (!importFile) return;
                      const reader = new FileReader();
                      reader.readAsDataURL(importFile);
                      reader.onload = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        try {
                          await importClients({ file: base64 }).unwrap();
                          triggerToast('Clients imported successfully!', 'success');
                          setImportOpen(false);
                          setImportFile(null);
                        } catch (e: any) {
                          triggerToast(e?.data?.message || 'Failed to import clients', 'error');
                        }
                      };
                    }}
                    style={{ background: !importFile ? 'rgba(42,22,40,0.12)' : '#2A1628', color: !importFile ? 'rgba(42,22,40,0.3)' : '#fff', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', fontSize: '0.8125rem', fontWeight: 700, cursor: !importFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
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
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Step Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '30%', left: '0', right: '0', height: '2px', background: '#DDD0C4', zIndex: 0 }}></div>
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '25%' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep >= step ? '#2A1628' : '#fff', border: `2px solid ${currentStep >= step ? '#2A1628' : '#DDD0C4'}`, color: currentStep >= step ? '#fff' : '#2A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.3s' }}>
                          {currentStep > step ? '✓' : step}
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: currentStep >= step ? '#2A1628' : 'rgba(42,22,40,0.5)', textTransform: 'uppercase', textAlign: 'center' }}>
                          {step === 1 ? 'Basic Info' : step === 2 ? 'VAT & Tax' : step === 3 ? 'Deadlines' : 'Assign Team'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {currentStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Company Name *</label>
                          <input type="text" placeholder="e.g. ABC Trading LLC" value={addClientForm.name} onChange={e => setAddClientForm({ ...addClientForm, name: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Email Address *</label>
                          <input type="email" placeholder="e.g. info@company.ae" value={addClientForm.email} onChange={e => setAddClientForm({ ...addClientForm, email: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Trade License Number *</label>
                        <input type="text" placeholder="e.g. 1234567" value={addClientForm.tradeLicense} onChange={e => setAddClientForm({ ...addClientForm, tradeLicense: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Authorized Signatory</label>
                          <input type="text" placeholder="e.g. Mahesh Maddu" value={addClientForm.authorizedSignatory} onChange={e => setAddClientForm({ ...addClientForm, authorizedSignatory: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Phone Number</label>
                          <input type="text" placeholder="e.g. +971 50 123 4567" value={addClientForm.phoneNumber} onChange={e => setAddClientForm({ ...addClientForm, phoneNumber: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Is VAT Registered?</label>
                          <select value={addClientForm.isVatRegistered} onChange={e => setAddClientForm({ ...addClientForm, isVatRegistered: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                            <option value="Yes">Yes, Registered</option>
                            <option value="No">No (Not Registered / Pending)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Financial Year End *</label>
                          <input type="date" value={addClientForm.financialYearEnd} onChange={e => setAddClientForm({ ...addClientForm, financialYearEnd: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
                        </div>
                      </div>
                      
                      {addClientForm.isVatRegistered === 'Yes' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>TRN / VAT NO. (15 Digits)</label>
                              <input type="text" maxLength={15} placeholder="e.g. 100556789600001" value={addClientForm.trn} onChange={e => setAddClientForm({ ...addClientForm, trn: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>VAT Filing Period</label>
                              <select value={addClientForm.vatFilingPeriod} onChange={e => setAddClientForm({ ...addClientForm, vatFilingPeriod: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                              </select>
                            </div>
                          </div>
                          
                          {addClientForm.vatFilingPeriod === 'Quarterly' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#E8760A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>FTA Stagger Group *</label>
                              <select value={addClientForm.vatCycle} onChange={e => setAddClientForm({ ...addClientForm, vatCycle: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #E8760A', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: 'rgba(232,118,10,0.02)', color: '#2A1628' }}>
                                <option value="Jan-Apr-Jul-Oct">Jan - Apr - Jul - Oct</option>
                                <option value="Feb-May-Aug-Nov">Feb - May - Aug - Nov</option>
                                <option value="Mar-Jun-Sep-Dec">Mar - Jun - Sep - Dec</option>
                              </select>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Estimated Annual Turnover (AED)</label>
                          <input type="number" placeholder="e.g. 200000" value={addClientForm.estimatedTurnover} onChange={e => setAddClientForm({ ...addClientForm, estimatedTurnover: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                          <p style={{ margin: '0.4rem 0 0', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Mandatory VAT threshold: AED 375,000 | Voluntary threshold: AED 187,500</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Trade License Expiry Date</label>
                          <input type="date" value={addClientForm.tradeLicenseExpiry} onChange={e => setAddClientForm({ ...addClientForm, tradeLicenseExpiry: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Next VAT Return Deadline</label>
                          <input type="text" readOnly value={getNextVatDeadline()} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid transparent', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', outline: 'none', background: 'rgba(42,22,40,0.04)', color: addClientForm.isVatRegistered === 'No' ? 'rgba(42,22,40,0.4)' : '#E8760A', cursor: 'default' }} />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: addClientForm.ctStatus !== 'Not registered' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Corporate Tax Status</label>
                          <select value={addClientForm.ctStatus} onChange={e => setAddClientForm({ ...addClientForm, ctStatus: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none', background: '#fff' }}>
                            <option value="Not registered">Not registered</option>
                            <option value="Registered — pending first return">Registered — pending first return</option>
                            <option value="Registered — filing">Registered — filing</option>
                          </select>
                        </div>
                        {addClientForm.ctStatus !== 'Not registered' && (
                          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>CT TRN</label>
                            <input type="text" placeholder="e.g. 1004455..." value={addClientForm.ctTrn} onChange={e => setAddClientForm({ ...addClientForm, ctTrn: e.target.value })} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }} />
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Corporate Tax Filing Deadline</label>
                        <input type="text" readOnly value={getCtDeadline()} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid transparent', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', outline: 'none', background: 'rgba(42,22,40,0.04)', color: !addClientForm.financialYearEnd ? 'rgba(42,22,40,0.4)' : '#2A1628', cursor: 'default' }} />
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Calculated as Financial Year End + 9 Months</p>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Account Manager</label>
                          <div style={{ position: 'relative' }}>
                            <div 
                              onClick={() => setActiveDropdown(activeDropdown === 'addClient_manager' ? null : 'addClient_manager')}
                              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: activeDropdown === 'addClient_manager' ? '1px solid #E8760A' : '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <span>{addClientForm.manager}</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: activeDropdown === 'addClient_manager' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                            </div>
                            {activeDropdown === 'addClient_manager' && (
                              <div style={{ position: 'absolute', bottom: '100%', top: 'auto', left: 0, right: 0, marginBottom: '4px', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 -4px 12px rgba(42,22,40,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                {['Sara Al Mansoori', 'Ravi Menon', 'Fatima Hassan'].map(opt => (
                                  <div 
                                    key={opt}
                                    onClick={() => { setAddClientForm({ ...addClientForm, manager: opt }); setActiveDropdown(null); }}
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', borderBottom: '1px solid #F5F0EB', background: addClientForm.manager === opt ? 'rgba(232,118,10,0.05)' : '#fff', color: addClientForm.manager === opt ? '#E8760A' : '#2A1628', fontWeight: addClientForm.manager === opt ? 600 : 400 }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(232,118,10,0.02)')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = addClientForm.manager === opt ? 'rgba(232,118,10,0.05)' : '#fff')}
                                  >
                                    {opt}
                                  </div>
                                ))}
                                {!['Sara Al Mansoori', 'Ravi Menon', 'Fatima Hassan'].includes(addClientForm.manager) && addClientForm.manager && (
                                  <div 
                                    onClick={() => setActiveDropdown(null)}
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', borderBottom: '1px solid #F5F0EB', background: 'rgba(232,118,10,0.05)', color: '#E8760A', fontWeight: 600 }}
                                  >
                                    {addClientForm.manager}
                                  </div>
                                )}
                                <div 
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    const newName = window.prompt('Enter new Account Manager name:');
                                    if (newName && newName.trim()) {
                                      setAddClientForm({ ...addClientForm, manager: newName.trim() });
                                    }
                                  }}
                                  style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', color: '#E8760A', fontWeight: 700 }}
                                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(232,118,10,0.02)')}
                                  onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                                >
                                  + Add New Manager...
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Chartered Accountant / Tax Agent</label>
                          <div style={{ position: 'relative' }}>
                            <div 
                              onClick={() => setActiveDropdown(activeDropdown === 'addClient_ca' ? null : 'addClient_ca')}
                              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: activeDropdown === 'addClient_ca' ? '1px solid #E8760A' : '1px solid #DDD0C4', fontSize: '0.8125rem', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <span>{addClientForm.caAssigned}</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: activeDropdown === 'addClient_ca' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                            </div>
                            {activeDropdown === 'addClient_ca' && (
                              <div style={{ position: 'absolute', bottom: '100%', top: 'auto', left: 0, right: 0, marginBottom: '4px', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 -4px 12px rgba(42,22,40,0.1)', zIndex: 100, overflow: 'hidden' }}>
                                {['Amit Shah (FTA Agent #4021)', 'Lena Kovac (FTA Agent #3187)'].map(opt => (
                                  <div 
                                    key={opt}
                                    onClick={() => { setAddClientForm({ ...addClientForm, caAssigned: opt }); setActiveDropdown(null); }}
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', borderBottom: '1px solid #F5F0EB', background: addClientForm.caAssigned === opt ? 'rgba(232,118,10,0.05)' : '#fff', color: addClientForm.caAssigned === opt ? '#E8760A' : '#2A1628', fontWeight: addClientForm.caAssigned === opt ? 600 : 400 }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(232,118,10,0.02)')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = addClientForm.caAssigned === opt ? 'rgba(232,118,10,0.05)' : '#fff')}
                                  >
                                    {opt}
                                  </div>
                                ))}
                                {!['Amit Shah (FTA Agent #4021)', 'Lena Kovac (FTA Agent #3187)'].includes(addClientForm.caAssigned) && addClientForm.caAssigned && (
                                  <div 
                                    onClick={() => setActiveDropdown(null)}
                                    style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', borderBottom: '1px solid #F5F0EB', background: 'rgba(232,118,10,0.05)', color: '#E8760A', fontWeight: 600 }}
                                  >
                                    {addClientForm.caAssigned}
                                  </div>
                                )}
                                <div 
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    const newName = window.prompt('Enter new Chartered Accountant / Tax Agent name:');
                                    if (newName && newName.trim()) {
                                      setAddClientForm({ ...addClientForm, caAssigned: newName.trim() });
                                    }
                                  }}
                                  style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem', cursor: 'pointer', color: '#E8760A', fontWeight: 700 }}
                                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(232,118,10,0.02)')}
                                  onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                                >
                                  + Add New Agent...
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(42,22,40,0.06)', display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: '#FAF8F5', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                  <button
                    onClick={() => {
                      if (currentStep > 1) {
                        setCurrentStep(currentStep - 1);
                      } else {
                        setAddClientOpen(false);
                        setCurrentStep(1);
                      }
                    }}
                    style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit' }}
                  >
                    {currentStep > 1 ? 'Back' : 'Cancel'}
                  </button>
                  <button
                    disabled={isAddingClient}
                    onClick={async () => {
                      if (currentStep === 1) {
                        if (!addClientForm.name.trim() || !addClientForm.email.trim() || !addClientForm.tradeLicense.trim()) {
                          triggerToast('Please fill in Company Name, Email, and Trade License.', 'error');
                          return;
                        }
                      }
                      if (currentStep === 2) {
                        if (!addClientForm.financialYearEnd) {
                          triggerToast('Financial Year End is required.', 'error');
                          return;
                        }
                        if (addClientForm.isVatRegistered === 'Yes' && !addClientForm.trn.trim()) {
                          triggerToast('TRN is required for VAT registered clients.', 'error');
                          return;
                        }
                      }

                      if (currentStep < 4) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        if (isAddingClient) return;
                        try {
                          await addClient({
                            ...addClientForm,
                            name: addClientForm.name,
                            email: addClientForm.email,
                            trn: addClientForm.trn,
                            manager: addClientForm.manager || 'Unassigned',
                            bookkeeper: addClientForm.caAssigned || 'Unassigned',
                            status: 'Onboarding', // Initial status
                            kycStatus: 'Pending',
                            booksStatus: 'Not Started',
                            vatDue: addClientForm.isVatRegistered === 'Yes' ? `Registered (${addClientForm.vatFilingPeriod})` : 'Not Registered',
                            ctDue: addClientForm.ctStatus,
                            nextDeadline: getNextVatDeadline(),
                            isVatRegistered: addClientForm.isVatRegistered,
                            vatFilingPeriod: addClientForm.vatFilingPeriod,
                            vatCycle: addClientForm.vatCycle,
                            financialYear: addClientForm.financialYearEnd,
                          }).unwrap();
                          triggerToast('Client boarded successfully! Google Drive folders are being created.', 'success');
                          setAddClientOpen(false);
                          setCurrentStep(1);
                          setAddClientForm({ 
                            name: '', email: '', tradeLicense: '', authorizedSignatory: '', phoneNumber: '',
                            isVatRegistered: 'Yes', trn: '', vatFilingPeriod: 'Quarterly', vatCycle: 'Jan-Apr-Jul-Oct', 
                            estimatedTurnover: '', financialYearEnd: '', tradeLicenseExpiry: '',
                            ctStatus: 'Not registered', ctTrn: '', manager: 'Sara Al Mansoori', caAssigned: 'Amit Shah (FTA Agent #4021)'
                          });
                        } catch (e: any) {
                          triggerToast(e?.data?.message || 'Failed to add client', 'error');
                        }
                      }
                    }}
                    style={{ background: isAddingClient ? '#7A6B78' : '#2A1628', color: '#ffffff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: isAddingClient ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}
                  >
                    {isAddingClient && currentStep === 4 ? 'Adding...' : currentStep < 4 ? 'Next Step' : '+ Complete Onboarding'}
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
                        { id: 'all', label: 'All Clients', sub: 'Export all clients in the system', count: String(totalItems) },
                        { id: 'filtered', label: 'Filtered Results', sub: 'Only clients matching current filters', count: String(clients.length) },
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
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {(['xlsx', 'csv', 'pdf', 'print'] as const).map(fmt => (
                        <button key={fmt} onClick={() => setExportFormat(fmt)}
                          style={{ flex: '1 1 calc(50% - 0.25rem)', padding: '0.6rem', border: `1.5px solid ${exportFormat === fmt ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: exportFormat === fmt ? 'rgba(232,118,10,0.04)' : '#fff', color: exportFormat === fmt ? '#E8760A' : '#2A1628', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          {fmt === 'print' ? 'PRINT' : `.${fmt.toUpperCase()}`}
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
                      onClick={() => {
                        if (exportFormat === 'print' || exportFormat === 'pdf') {
                          // Handle Print and PDF using browser print functionality
                          window.print();
                          setExportOpen(false);
                          return;
                        }

                        // For XLSX and CSV, hit the backend export API
                        const token = localStorage.getItem('crm_access_token');
                        const queryParams = new URLSearchParams();
                        if (search) queryParams.append('search', search);
                        Object.entries(filters).forEach(([key, val]) => {
                          if (val !== 'All') queryParams.append(key, val);
                        });
                        queryParams.append('format', exportFormat);
                        if (token) queryParams.append('token', token);
                        
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                        window.open(`${baseUrl}/v1/clients/export?${queryParams.toString()}`);
                        setExportOpen(false);
                      }}
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
            value: String(kpis.totalClients),
            sub: 'In database',
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
            value: String(kpis.activeClients),
            sub: kpis.totalClients ? `${((kpis.activeClients / kpis.totalClients) * 100).toFixed(1)}%` : '0%',
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
            value: String(clients.filter((c: any) => c.status === 'Onboarding').length),
            sub: 'Clients',
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
            value: String(clients.filter((c: any) => c.status === 'Inactive').length),
            sub: 'Clients',
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
            value: String(kpis.kycWarnings),
            sub: 'Alerts',
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
            label: 'VAT Due This Month',
            value: String(clients.filter((c: any) => c.vatDue !== 'Filed' && c.vatDue !== '-').length),
            sub: 'Action needed',
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
            label: 'CT Due This Month',
            value: String(clients.filter((c: any) => c.ctDue !== 'Filed' && c.ctDue !== '-').length),
            sub: 'Action needed',
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
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {(clientsLoading || kpisLoading) ? (
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

      {/* ── KPI ROW 2: QUICKBOOKS & PIPELINE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          {
            label: 'QuickBooks Connected', value: String(kpis.totalClients - kpis.qboSyncErrors), sub: 'Connected clients', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          },
          {
            label: 'QuickBooks Errors', value: String(kpis.qboSyncErrors), sub: 'Needs attention', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          },
          {
            label: 'Books Pending', value: String(kpis.overdueBooks), sub: 'Action required', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          },
          {
            label: 'New This Month', value: String(clients.filter((c: any) => c.status === 'Onboarding').length), sub: 'Onboarding stage', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
          },
        ].map((card, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(42,22,40,0.02)', minHeight: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {(clientsLoading || kpisLoading) ? (
                  <div style={{ width: '48px', height: '32px', background: 'rgba(42,22,40,0.06)', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                ) : (
                  card.value
                )}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SAVED VIEWS BAR ── */}
      <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'All Clients', label: 'All Clients', count: String(kpis.totalClients) },
          { id: 'My Clients', label: 'My Clients', count: String(clients.filter((c: any) => c.manager === 'Mahesh Maddu').length) },
          { id: 'Active', label: 'Active', count: String(kpis.activeClients) },
          { id: 'Onboarding', label: 'Onboarding', count: String(clients.filter((c: any) => c.status === 'Onboarding').length) },
          { id: 'Inactive', label: 'Inactive', count: String(clients.filter((c: any) => c.status === 'Inactive').length) },
          { id: 'KYC Expiring', label: 'KYC Expiring', count: String(kpis.kycWarnings) },
          { id: 'VAT Due', label: 'VAT Due', count: String(clients.filter((c: any) => c.vatDue !== 'Filed' && c.vatDue !== '-').length) },
          { id: 'CT Due', label: 'CT Due', count: String(clients.filter((c: any) => c.ctDue !== 'Filed' && c.ctDue !== '-').length) },
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setSavedView(view.id)}
            style={{ padding: '0.375rem 0.875rem', borderRadius: '20px', border: savedView === view.id ? '1.5px solid #E8760A' : '1px solid #DDD0C4', background: savedView === view.id ? 'rgba(232,118,10,0.06)' : '#ffffff', color: savedView === view.id ? '#E8760A' : 'rgba(42,22,40,0.6)', fontWeight: savedView === view.id ? 700 : 500, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 150ms ease', fontFamily: 'Inter, sans-serif' }}
          >
            {view.label}
            <span style={{ background: savedView === view.id ? '#E8760A' : 'rgba(42,22,40,0.08)', color: savedView === view.id ? '#fff' : 'rgba(42,22,40,0.5)', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', lineHeight: 1.5 }}>
              {(clientsLoading || kpisLoading) ? '...' : view.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── BULK ACTIONS TOOLBAR ── */}
      {selectedClients.length > 0 && (
        <div className="no-scrollbar" style={{ background: '#2A1628', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.25rem', flexShrink: 0 }}>
            {selectedClients.length} clients selected
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'Assign Manager', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, onClick: () => setBulkAction({ type: 'manager', title: 'Assign Account Manager' }) },
              { label: 'Assign Bookkeeper', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M16 2v20M4 6h16M4 10h16"/></svg>, onClick: () => setBulkAction({ type: 'bookkeeper', title: 'Assign Bookkeeper' }) },
              { label: 'Change Status', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>, onClick: () => setBulkAction({ type: 'status', title: 'Change Status' }) },
              { label: 'Send Reminder', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>, onClick: () => { triggerToast(`Sent compliance reminders to ${selectedClients.length} clients successfully!`, 'success'); setSelectedClients([]); } },
              { label: 'Export', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>, onClick: () => { setExportScope('selected'); setExportOpen(true); } },
              { label: 'Add Tag', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>, onClick: () => setBulkAction({ type: 'tag', title: 'Add Tag' }) },
              {
                label: 'AI Review', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M12 2v2M8 5h8M7 11V7a5 5 0 0 1 10 0v4" /></svg>, onClick: async () => {
                  setAiReviewing(true);
                  try {
                    await bulkUpdateClients({ ids: selectedClients, action: 'tag', value: 'AI Reviewed' }).unwrap();
                    triggerToast(`AI Review completed for ${selectedClients.length} clients!`, 'success');
                  } catch (err) {
                    triggerToast('AI Review failed', 'error');
                  } finally {
                    setAiReviewing(false);
                    setSelectedClients([]);
                  }
                }
              },
              { label: 'Archive', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>, onClick: () => setBulkAction({ type: 'archive', title: 'Archive Clients' }) },
            ].map((a, i) => (
              <button key={i} onClick={a.onClick} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.3rem 0.6rem', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif', transition: 'background 120ms', whiteSpace: 'nowrap', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <span style={{ fontSize: '0.6rem' }}>{a.ic}</span>{a.label}
              </button>
            ))}
            <button onClick={() => setBulkAction({ type: 'delete', title: 'Delete Clients' })} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '0.3rem 0.6rem', color: '#EF4444', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>🗑️ Delete</button>
          </div>

          <button onClick={() => setSelectedClients([])} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', flexShrink: 0, paddingLeft: '0.5rem' }}>✕ Clear</button>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(42,22,40,0.06)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(42,22,40,0.01)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
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
              setAdvancedFilters({ bookkeeper: 'All', industry: 'All', entityType: 'All', country: 'All', financialYear: 'All', qbStatus: 'All', riskLevel: 'All', tags: 'All' });
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

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(v => !v)}
            style={{ padding: '0.55rem 1rem', fontSize: '0.8125rem', border: `1px solid ${showAdvancedFilters ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: showAdvancedFilters ? 'rgba(232,118,10,0.06)' : '#FAF8F5', color: showAdvancedFilters ? '#E8760A' : 'rgba(42,22,40,0.6)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap', transition: 'all 150ms', fontFamily: 'inherit' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
            Advanced
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showAdvancedFilters ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
        </div>

        {/* ── ADVANCED FILTERS PANEL ── */}
        {showAdvancedFilters && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {([
              { label: 'Bookkeeper', key: 'bookkeeper' },
              { label: 'Industry', key: 'industry' },
              { label: 'Entity Type', key: 'entityType' },
              { label: 'Country', key: 'country' },
              { label: 'Financial Year', key: 'financialYear' },
              { label: 'QuickBooks', key: 'qbStatus' },
              { label: 'Risk Level', key: 'riskLevel' },
              { label: 'Tags', key: 'tags' },
            ] as const).map(f => {
              const isOpen = advFilterOpen === f.key;
              const val = advancedFilters[f.key];
              const opts = advancedFilterOptions[f.key];
              return (
                <div key={f.key} style={{ position: 'relative' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{f.label}</div>
                  <div onClick={() => setAdvFilterOpen(isOpen ? null : f.key)} style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', border: `1px solid ${val !== 'All' ? '#E8760A' : '#DDD0C4'}`, borderRadius: '8px', background: '#ffffff', color: val !== 'All' ? '#E8760A' : '#2A1628', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: val !== 'All' ? 700 : 400, userSelect: 'none' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{val}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {isOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '8px', boxShadow: '0 8px 24px rgba(42,22,40,0.12)', zIndex: 50, overflow: 'hidden', minWidth: '160px' }}>
                      {opts.map(opt => (
                        <div key={opt} onClick={() => { setAdvancedFilters(p => ({ ...p, [f.key]: opt })); setAdvFilterOpen(null); }}
                          style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', color: val === opt ? '#E8760A' : '#2A1628', background: val === opt ? 'rgba(232,118,10,0.06)' : 'transparent', fontWeight: val === opt ? 700 : 400 }}
                          onMouseEnter={e => { if (val !== opt) (e.currentTarget as HTMLDivElement).style.background = 'rgba(232,118,10,0.04)'; }}
                          onMouseLeave={e => { if (val !== opt) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >{opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
                minWidth: '48px',
                maxWidth: '48px',
                textAlign: 'center',
                position: 'sticky',
                left: 0,
                background: '#FAF8F5',
                zIndex: 10
              }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedClients.length === clients.length} />
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
              <th style={{ padding: '1rem' }}>CA ASSIGNED</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>VAT REGISTERED?</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>CT STATUS</th>
              <th style={{ padding: '1rem' }}>VAT CYCLE</th>
              <th style={{ padding: '1rem' }}>FINANCIAL YEAR</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client: any, idx: number) => (
              <tr key={client.id} onClick={() => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab("overview"); }} style={{ cursor: "pointer",
                borderBottom: idx < filteredClients.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                background: selectedClients.includes(client.id) ? 'rgba(232,118,10,0.02)' : 'transparent'
              }}>
                <td onClick={(e) => e.stopPropagation()} style={{
                    padding: "1rem 0.75rem",
                    width: "48px",
                  minWidth: '48px',
                  maxWidth: '48px',
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
                  <div style={{ fontWeight: 500, color: '#2A1628' }}>{client.trn || '-'}</div>
                </td>

                {/* Manager */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500, color: (client.accountManager || client.manager) ? '#2A1628' : 'rgba(42,22,40,0.4)' }}>{client.accountManager || client.manager || 'Unassigned'}</span>
                  </div>
                </td>
                
                {/* CA Assigned / Bookkeeper */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500, color: (client.bookkeeper && client.bookkeeper !== '-') ? '#2A1628' : 'rgba(42,22,40,0.4)' }}>{client.bookkeeper || '-'}</span>
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: client.status === 'Active' ? 'rgba(4, 120, 87, 0.08)' : client.status === 'Onboarding' ? 'rgba(184, 137, 42, 0.08)' : 'rgba(42, 22, 40, 0.06)',
                    color: client.status === 'Active' ? '#047857' : client.status === 'Onboarding' ? '#B8892A' : 'rgba(42, 22, 40, 0.6)'
                  }}>{client.status}</span>
                </td>

                {/* VAT REGISTERED? */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: client.isVatRegistered === 'Yes' ? 'rgba(4, 120, 87, 0.08)' : 'rgba(184, 137, 42, 0.08)',
                    color: client.isVatRegistered === 'Yes' ? '#047857' : '#B8892A'
                  }}>{client.isVatRegistered || 'Yes'}</span>
                </td>

                {/* CT STATUS */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  {client.ctDue && client.ctDue !== '-' ? (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: client.ctDue.includes('Registered') ? 'rgba(4, 120, 87, 0.08)' : 'rgba(42,22,40,0.06)',
                      color: client.ctDue.includes('Registered') ? '#047857' : 'rgba(42,22,40,0.6)'
                    }}>{client.ctDue}</span>
                  ) : (
                    <span style={{ color: 'rgba(42,22,40,0.4)', fontWeight: 600 }}>-</span>
                  )}
                </td>

                {/* VAT CYCLE */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 600, color: client.vatCycle && client.vatCycle !== '-' ? '#E8760A' : 'rgba(42,22,40,0.4)' }}>
                  {client.vatCycle || '-'}
                </td>
                
                {/* FINANCIAL YEAR */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 600, color: client.financialYear && client.financialYear !== '-' ? '#2A1628' : 'rgba(42,22,40,0.4)' }}>
                  {client.financialYear || '-'}
                </td>

                {/* ── ACTIONS DROPDOWN ── */}
                <td onClick={(e) => e.stopPropagation()} style={{ padding: "1rem", textAlign: "center", whiteSpace: "nowrap" }}>
                  <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('overview'); }}
                      style={{ background: 'rgba(232,118,10,0.06)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#E8760A', display: 'flex', alignItems: 'center', fontSize: '0.65rem', fontWeight: 600, gap: '4px' }}
                      title="Quick Preview"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      View
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setRowActionOpen(rowActionOpen === client.id ? null : client.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(42,22,40,0.1)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'rgba(42,22,40,0.55)', display: 'flex', alignItems: 'center' }}
                        title="More actions"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                      </button>
                      {rowActionOpen === client.id && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '12px', boxShadow: '0 12px 36px rgba(42,22,40,0.14)', zIndex: 200, minWidth: '200px', overflow: 'hidden', padding: '4px' }}>
                          {[
                            { label: 'Open Profile', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, action: () => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('overview'); } },
                            {
                              label: 'Delete Client', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>, action: () => {
                                setRowActionOpen(null);
                                setDeleteClientConfirm(client);
                              }, danger: true
                            },
                          ].map((item, ai) => (
                            <div key={ai}
                              onClick={() => { item.action(); setRowActionOpen(null); }}
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.775rem', cursor: 'pointer', color: (item as { danger?: boolean }).danger ? '#EF4444' : '#2A1628', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                              onMouseEnter={e => (e.currentTarget.style.background = (item as { danger?: boolean }).danger ? 'rgba(239,68,68,0.06)' : 'rgba(232,118,10,0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span style={{ fontSize: '0.7rem', width: '16px', textAlign: 'center', color: (item as { danger?: boolean }).danger ? '#EF4444' : '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.ic}</span>
                              {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredClients.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        itemLabel="clients"
      />

      {/* ── CLIENT QUICK PREVIEW DRAWER ── */}
      {previewOpen && previewClient && (
        <>
          {/* Backdrop */}
          <div onClick={() => setPreviewOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.3)', zIndex: 400, backdropFilter: 'blur(2px)' }} />

          {/* Drawer */}
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '100vw', background: '#ffffff', zIndex: 401, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(42,22,40,0.18)', fontFamily: 'Inter, sans-serif' }}>

            {/* Drawer Header */}
            <div style={{ background: '#FAF8F5', padding: '1.25rem 1.5rem', borderBottom: '1px solid #DDD0C4', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(232,118,10,0.1)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700 }}>{previewClient.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#2A1628' }}>{previewClient.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>{previewClient.clientCode} · {previewClient.industry} · {previewClient.entityType}</div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: previewClient.status === 'Active' ? 'rgba(4,120,87,0.08)' : previewClient.status === 'Onboarding' ? 'rgba(184,137,42,0.08)' : 'rgba(42,22,40,0.06)', color: previewClient.status === 'Active' ? '#047857' : previewClient.status === 'Onboarding' ? '#B8892A' : 'rgba(42,22,40,0.5)' }}>{previewClient.status}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: previewClient.riskLevel === 'High' ? 'rgba(239,68,68,0.08)' : previewClient.riskLevel === 'Medium' ? 'rgba(245,158,11,0.08)' : 'rgba(4,120,87,0.08)', color: previewClient.riskLevel === 'High' ? '#EF4444' : previewClient.riskLevel === 'Medium' ? '#D97706' : '#047857' }}>{previewClient.riskLevel} Risk</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Drawer Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #DDD0C4', padding: '0 1.5rem', flexShrink: 0, overflowX: 'auto' }}>
              {(['overview', 'timeline', 'documents', 'ai', 'activity'] as const).map(tab => (
                <button key={tab} onClick={() => setPreviewTab(tab)} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: previewTab === tab ? '2px solid #E8760A' : '2px solid transparent', color: previewTab === tab ? '#E8760A' : 'rgba(42,22,40,0.5)', fontWeight: previewTab === tab ? 700 : 500, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif', transition: 'all 150ms', marginBottom: '-1px' }}>{tab}</button>
              ))}
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* OVERVIEW TAB */}
              {previewTab === 'overview' && (<>
                {/* KPIs row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { label: 'Progress', value: `${previewClient.overallProgress}%`, color: previewClient.overallProgress >= 80 ? '#2EA44F' : '#E8760A' },
                    { label: 'Active Tasks', value: String(previewClient.activeTasks), color: previewClient.activeTasks > 8 ? '#EF4444' : '#E8760A' },
                    { label: 'Documents', value: String(previewClient.documents), color: '#2A1628' },
                  ].map((k, i) => (
                    <div key={i} style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 300, color: k.color, fontFamily: 'Georgia, serif' }}>{k.value}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px', fontWeight: 600 }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Client Health Score */}
                <div style={{ background: 'linear-gradient(135deg, rgba(232,118,10,0.05) 0%, rgba(42,22,40,0.02) 100%)', border: '1px solid rgba(232,118,10,0.12)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', background: '#fff', border: '3px solid #E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#E8760A', flexShrink: 0 }}>
                    92%
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628' }}>Client Health Score</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.55)', marginTop: '2px', lineHeight: 1.25 }}>Excellent compliance standing. All regular filings completed on schedule.</div>
                  </div>
                </div>

                {/* Assignment info */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Team Assignment</div>
                  {[
                    { role: 'Account Manager', name: previewClient.manager, ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
                    { role: 'Bookkeeper', name: previewClient.bookkeeper, ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: i === 0 ? '0.625rem' : 0 }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(232, 118, 10, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {a.ic}
                      </div>
                      <div><div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600 }}>{a.role}</div><div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#2A1628' }}>{a.name}</div></div>
                    </div>
                  ))}
                </div>

                {/* Upcoming Deadlines Widget */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Upcoming Deadlines</div>
                  {[
                    { title: previewClient.nextDeadline, date: 'in 12 days', type: 'High' },
                    { title: 'VAT Return Q2', date: 'Jul 28, 2025', type: 'Medium' },
                    { title: 'Corporate Tax Return', date: 'Dec 31, 2025', type: 'Low' },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{d.title}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '1px' }}>{d.date}</div>
                      </div>
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: d.type === 'High' ? 'rgba(239,68,68,0.06)' : d.type === 'Medium' ? 'rgba(232,118,10,0.06)' : 'rgba(42,22,40,0.04)', color: d.type === 'High' ? '#EF4444' : d.type === 'Medium' ? '#E8760A' : 'rgba(42,22,40,0.6)' }}>{d.type}</span>
                    </div>
                  ))}
                </div>

                {/* Open Tasks Widget */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Open Tasks ({drawerDetails.tasks.length})</div>
                  {drawerDetails.tasks.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No active tasks.</div>
                  ) : drawerDetails.tasks.map((t: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                      <input type="checkbox" checked={t.status === 'Completed'} readOnly style={{ accentColor: '#E8760A', cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.75rem', color: t.status === 'Completed' ? 'rgba(42,22,40,0.45)' : '#2A1628', textDecoration: t.status === 'Completed' ? 'line-through' : 'none', fontWeight: 500 }}>{t.name}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Documents Widget */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Recent Documents ({drawerDetails?.documents?.length || 0})</div>
                  {(!drawerDetails?.documents || drawerDetails.documents.length === 0) ? (
                    <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.45)', fontStyle: 'italic' }}>No documents uploaded.</div>
                  ) : drawerDetails.documents.slice(0, 5).map((doc: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < Math.min(drawerDetails.documents.length, 5) - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc.name}</span>
                      </div>
                      <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', whiteSpace: 'nowrap' }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Reports Widget */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Recent Reports</div>
                  {[
                    { name: 'Onboarding & KYC Compliance Summary', type: 'Audit' },
                    { name: 'VAT Return Status Report', type: 'Tax' },
                    { name: 'Financial Ledger Overview', type: 'Financial' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>{r.name}</span>
                      <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.45)', background: 'rgba(42,22,40,0.04)', borderRadius: '4px', padding: '1px 5px' }}>{r.type}</span>
                    </div>
                  ))}
                </div>

                {/* Client Notes Preview */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Client Notes Preview</div>
                  <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #DDD0C4', padding: '0.625rem', fontSize: '0.75rem', color: 'rgba(42,22,40,0.85)', minHeight: '60px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span>&quot;Client profile setup completed for {previewClient.name}. Onboarding & compliance verification in progress.&quot;</span>
                    <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.5rem', alignSelf: 'flex-end', fontWeight: 600 }}>Assigned: {previewClient.manager || 'Sara Al Mansoori'}</span>
                  </div>
                </div>

                {/* Compliance Snapshot */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Compliance Snapshot</div>
                  {[
                    { label: 'KYC', val: previewClient.kycStatus, ok: previewClient.kycStatus === 'Verified' },
                    { label: 'VAT', val: previewClient.vatDue, ok: previewClient.vatDue === 'Filed' },
                    { label: 'CT', val: previewClient.ctDue, ok: previewClient.ctDue === 'Filed' },
                    { label: 'QBO', val: previewClient.qbStatus, ok: previewClient.qbStatus === 'Connected' },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < 3 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)' }}>{c.label}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.ok ? '#047857' : '#E8760A' }}>{c.val}</span>
                    </div>
                  ))}
                </div>
              </>)}

              {/* TIMELINE TAB */}
              {previewTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Client Timeline</div>
                  {[
                    { event: 'Client Created', date: 'Just now', status: 'done', note: `Profile created by ${previewClient.manager || 'Admin'}` },
                    { event: 'Onboarding Completed', date: 'Today', status: 'done', note: 'Wizard setup completed' },
                    { event: 'KYC Verification', date: previewClient.kycStatus === 'Verified' ? 'Verified' : 'Pending Review', status: previewClient.kycStatus === 'Verified' ? 'done' : 'pending', note: previewClient.kycStatus },
                    { event: 'Bookkeeping Status', date: 'Active Period', status: previewClient.booksStatus === 'Completed' ? 'done' : 'pending', note: previewClient.booksStatus },
                    { event: 'VAT Return Filing', date: 'Upcoming', status: previewClient.vatDue === 'Filed' ? 'done' : 'pending', note: previewClient.vatDue },
                    { event: 'Corporate Tax Filing', date: 'Upcoming', status: previewClient.ctDue === 'Filed' ? 'done' : 'upcoming', note: previewClient.ctDue },
                    { event: 'QuickBooks Sync', date: 'Integration Status', status: previewClient.qbStatus === 'Connected' ? 'done' : 'alert', note: previewClient.qbStatus },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.875rem', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.status === 'done' ? '#2EA44F' : item.status === 'alert' ? '#EF4444' : item.status === 'pending' ? '#E8760A' : '#DDD0C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.status === 'done' && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        {i < 6 && <div style={{ width: '1px', flex: 1, background: '#DDD0C4', margin: '4px 0', minHeight: '20px' }} />}
                      </div>
                      <div style={{ paddingBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628' }}>{item.event}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', marginTop: '1px' }}>{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {previewTab === 'documents' && (
                <>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Document Status & Compliance</div>
                  {(() => {
                    const docsList: any[] = drawerDetails?.documents || [];
                    const uploadedCount = docsList.length > 0 ? docsList.length : (previewClient.documents || 0);
                    const verifiedCount = docsList.filter((d: any) => d.status === 'Verified').length;
                    const ocrPendingCount = docsList.filter((d: any) => d.status === 'Processing' || d.status === 'Uploaded' || d.status === 'OCR Complete').length;
                    const rejectedCount = docsList.filter((d: any) => d.status === 'Rejected').length;
                    
                    // Mandatory Onboarding Categories
                    const mandatoryTypes = ['Trade License', 'VAT Certificate', 'Emirates ID'];
                    const uploadedCats = docsList.map((d: any) => d.category || 'Invoice');
                    const missingRequired = mandatoryTypes.filter(type => !uploadedCats.includes(type));
                    const missingCount = missingRequired.length;
                    const expiredCount = previewClient.kycStatus === 'Expired' ? 1 : 0;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                          {[
                            { label: 'Uploaded', count: uploadedCount, color: '#2EA44F', bg: 'rgba(46,164,79,0.06)' },
                            { label: 'Verified', count: verifiedCount, color: '#047857', bg: 'rgba(4,120,87,0.06)' },
                            { label: 'OCR Pending', count: ocrPendingCount, color: '#E8760A', bg: 'rgba(232,118,10,0.06)' },
                            { label: 'Rejected', count: rejectedCount, color: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
                            { label: 'Missing', count: missingCount, color: '#E8760A', bg: 'rgba(232,118,10,0.06)' },
                            { label: 'Expired', count: expiredCount, color: '#B8892A', bg: 'rgba(184,137,42,0.06)' },
                          ].map((d, i) => (
                            <div key={i} style={{ background: d.bg, border: `1px solid ${d.color}20`, borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: d.color, fontFamily: 'Georgia, serif' }}>{d.count}</div>
                              <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px', fontWeight: 600 }}>{d.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Mandatory Compliance Checklist */}
                        <div style={{ background: '#FAF8F5', border: '1px solid #EBE0D6', borderRadius: '10px', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2A1628', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Mandatory Compliance Checklist</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {mandatoryTypes.map((type, idx) => {
                              const isPresent = uploadedCats.includes(type);
                              return (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                  <span style={{ color: '#2A1628', fontWeight: 500 }}>{type}</span>
                                  {isPresent ? (
                                    <span style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 700, background: 'rgba(4,120,87,0.1)', padding: '2px 8px', borderRadius: '10px' }}>✓ Uploaded</span>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', color: '#E8760A', fontWeight: 700, background: 'rgba(232,118,10,0.1)', padding: '2px 8px', borderRadius: '10px' }}>⚠ Missing</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Upload Controls with Category Dropdown */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      style={{ flex: 1, padding: '0.55rem 0.75rem', background: '#FFFFFF', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.75rem', color: '#2A1628', fontWeight: 500, outline: 'none' }}
                    >
                      <option value="Trade License">📜 Trade License</option>
                      <option value="VAT Certificate">📄 VAT / TRN Certificate</option>
                      <option value="Emirates ID">🪪 Emirates ID / Passport</option>
                      <option value="Bank Statement">🏦 Bank Statement</option>
                      <option value="Invoice">🧾 Sales / Expense Invoice</option>
                    </select>

                    <input
                      type="file"
                      id={`drawer-upload-${previewClient.id}`}
                      multiple
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          for (let i = 0; i < files.length; i++) {
                            try {
                              await uploadClientDoc({ id: previewClient.id, name: files[i].name, category: docCategory }).unwrap();
                            } catch (err: any) {
                              console.error('File upload error:', err);
                            }
                          }
                          triggerToast(`${files.length} document(s) (${docCategory}) uploaded for ${previewClient.name}`, 'success');
                        }
                      }}
                    />
                    <button
                      style={{ padding: '0.6rem 1rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                      onClick={() => document.getElementById(`drawer-upload-${previewClient.id}`)?.click()}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      Upload File
                    </button>
                  </div>

                  {/* Uploaded Documents List */}
                  {drawerDetails?.documents && drawerDetails.documents.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Uploaded Files</div>
                      {drawerDetails.documents.map((doc: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#FAF8F5', border: '1px solid #DDD0C4', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>{doc.name}</div>
                              <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)' }}>{doc.category || 'Invoice'} • {new Date(doc.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#047857', background: 'rgba(4,120,87,0.08)', padding: '2px 8px', borderRadius: '12px' }}>{doc.status || 'Uploaded'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* AI TAB */}
              {previewTab === 'ai' && (<>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Bookkeeping Intelligence</div>
                {/* AI Health Score */}
                <div style={{ background: 'linear-gradient(135deg, #2A1628 0%, #3B1F36 100%)', borderRadius: '12px', padding: '1.25rem', color: '#fff' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>AI Health Score</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 300, color: previewClient.overallProgress >= 80 ? '#2EA44F' : '#E8760A', fontFamily: 'Georgia, serif' }}>{previewClient.overallProgress}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Based on {previewClient.documents} processed documents</div>
                </div>
                {[
                  { label: 'AI Alerts', val: previewClient.activeTasks > 8 ? '3 critical alerts' : '1 alert', color: '#EF4444', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
                  { label: 'Recommendations', val: '2 optimizations available', color: '#E8760A', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A7.5 7.5 0 0 0 11 1C7 1 3.5 4.5 3.5 8.5c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" /><path d="M9 18h6M10 22h4" /></svg> },
                  { label: 'Missing Documents', val: '3 required', color: '#E8760A', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                  { label: 'OCR Confidence', val: '94.2%', color: '#2EA44F', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2EA44F" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
                  { label: 'Matching Confidence', val: '91.7%', color: '#2EA44F', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2EA44F" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg> },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(42,22,40,0.04)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {a.ic}
                      {a.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: a.color }}>{a.val}</span>
                  </div>
                ))}
              </>)}

              {/* ACTIVITY TAB */}
              {previewTab === 'activity' && (<>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Activity</div>
                {((drawerDetails?.activities && drawerDetails.activities.length > 0)
                  ? drawerDetails.activities.map((act: any) => ({
                      actor: act.changedBy || previewClient.manager || 'System',
                      action: act.operation ? `${act.operation.replace(/_/g, ' ')} on ${act.tableName || 'profile'}` : 'Profile Activity',
                      time: new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      type: act.operation?.includes('AI') ? 'ai' : act.operation?.includes('CLIENT') ? 'manager' : 'system'
                    }))
                  : [
                      { actor: previewClient.manager || 'Manager', action: `Client profile created for ${previewClient.name}`, time: 'Just now', type: 'manager' },
                      { actor: 'AI System', action: 'Default Chart of Accounts (COA) seeded', time: 'Just now', type: 'ai' },
                    ]
                ).map((a: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.875rem', borderBottom: i < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(232,118,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {a.type === 'ai' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M12 2v2M8 5h8M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      ) : a.type === 'manager' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      ) : a.type === 'bookkeeper' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                      ) : a.type === 'client' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" /><path d="M9 8h2M9 12h2M13 8h2M13 12h2" /></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>{a.actor}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)', marginTop: '2px' }}>{a.action}</div>
                      <div style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.35)', marginTop: '2px' }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </>)}
            </div>

            {/* Drawer Footer Quick Actions */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button onClick={() => router.push(`/accounting?tab=ai-queue&search=${encodeURIComponent(previewClient.name)}`)} style={{ flex: 1, padding: '0.55rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M12 2v2M8 5h8M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                AI Review
              </button>
              <button onClick={() => router.push(`/accounting?tab=vat&search=${encodeURIComponent(previewClient.name)}`)} style={{ flex: 1, padding: '0.55rem', background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                VAT
              </button>
              <button onClick={() => router.push(`/accounting?tab=reports&search=${encodeURIComponent(previewClient.name)}`)} style={{ flex: 1, padding: '0.55rem', background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                Reports
              </button>
            </div>
          </div>
        </>
      )}
      {/* ── BULK ACTION MODAL ── */}
      {bulkAction.type !== null && (
        <div onClick={() => setBulkAction({ type: null, title: '' })} style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', backdropFilter: 'blur(4px)', zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(42,22,40,0.2)', overflow: 'hidden', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ background: '#FAF8F5', padding: '1.25rem 1.5rem', borderBottom: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#2A1628' }}>{bulkAction.title}</h3>
              <button onClick={() => setBulkAction({ type: null, title: '' })} style={{ background: 'rgba(42,22,40,0.06)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2A1628' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(42,22,40,0.6)' }}>Perform action for <strong style={{ color: '#2A1628' }}>{selectedClients.length}</strong> selected clients.</p>

              {bulkAction.type === 'manager' && (
                <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', color: '#2A1628', fontSize: '0.8125rem' }}>
                  <option value="">Select Account Manager...</option>
                  {filterOptions.manager.filter(m => m !== 'All').map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
              {bulkAction.type === 'bookkeeper' && (
                <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', color: '#2A1628', fontSize: '0.8125rem' }}>
                  <option value="">Select Bookkeeper...</option>
                  {advancedFilterOptions.bookkeeper.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              )}
              {bulkAction.type === 'status' && (
                <select value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', color: '#2A1628', fontSize: '0.8125rem' }}>
                  <option value="">Select Status...</option>
                  {filterOptions.status.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {bulkAction.type === 'tag' && (
                <input type="text" placeholder="Enter tag name (e.g. Priority)..." value={bulkValue} onChange={e => setBulkValue(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDD0C4', outline: 'none', color: '#2A1628', fontSize: '0.8125rem' }} />
              )}
              {bulkAction.type === 'delete' && (
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#EF4444' }}>Are you sure you want to permanently delete these {selectedClients.length} clients? This action cannot be undone.</p>
              )}
              {bulkAction.type === 'archive' && (
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#2A1628' }}>Are you sure you want to archive these {selectedClients.length} clients? They will be marked with Archived status.</p>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #DDD0C4', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setBulkAction({ type: null, title: '' })} style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628' }}>Cancel</button>
              <button
                disabled={isBulkUpdating}
                onClick={async () => {
                  try {
                    await bulkUpdateClients({
                      ids: selectedClients,
                      action: bulkAction.type || '',
                      value: bulkValue
                    }).unwrap();
                    triggerToast('Bulk action completed successfully!', 'success');
                    setSelectedClients([]);
                    setBulkAction({ type: null, title: '' });
                    setBulkValue('');
                  } catch (e: any) {
                    triggerToast(e?.data?.message || 'Failed to execute bulk action', 'error');
                  }
                }}
                style={{ background: bulkAction.type === 'delete' ? '#EF4444' : '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: isBulkUpdating ? 'not-allowed' : 'pointer', opacity: isBulkUpdating ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isBulkUpdating ? (
                  <>
                    <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    {bulkAction.type === 'delete' ? 'Deleting...' : 'Updating...'}
                  </>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI REVIEWING LOADING OVERLAY ── */}
      {aiReviewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.5)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(232,118,10,0.2)', borderTopColor: '#E8760A', animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>AI Engine Reviewing Selected Clients...</div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
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
          {toast.type === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
          {toast.type === 'error' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
          {toast.type === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteClientConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(26,13,24,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', width: '400px', maxWidth: '90%',
            boxShadow: '0 24px 48px rgba(42,22,40,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                background: 'rgba(239,68,68,0.1)', color: '#EF4444', width: '48px', height: '48px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#2A1628', fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>Delete Client</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong>{deleteClientConfirm.name}</strong>? This action cannot be undone and will permanently remove the client and their data.
                </p>
              </div>
            </div>
            <div style={{
              padding: '1rem 1.5rem', background: '#FAF8F5', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
              borderTop: '1px solid rgba(42,22,40,0.06)'
            }}>
              <button
                onClick={() => setDeleteClientConfirm(null)}
                style={{
                  background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.5rem 1rem',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: '#2A1628', fontFamily: 'inherit'
                }}
              >Cancel</button>
              <button
                disabled={isDeletingClient}
                onClick={async () => {
                  try {
                    await deleteClient(deleteClientConfirm.id).unwrap();
                    triggerToast('Client deleted successfully!', 'success');
                  } catch (e: any) {
                    triggerToast(e?.data?.message || 'Failed to delete client', 'error');
                  }
                  setDeleteClientConfirm(null);
                }}
                style={{
                  background: '#EF4444', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: isDeletingClient ? 'not-allowed' : 'pointer', color: '#fff', fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.2)', opacity: isDeletingClient ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                {isDeletingClient ? (
                  <>
                    <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Deleting...
                  </>
                ) : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
