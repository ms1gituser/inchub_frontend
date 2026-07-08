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

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: '1', initials: 'AB', avatarBg: '#7C2D12',
    name: 'ABC Trading LLC', email: 'info@abctrading.ae',
    trn: '100556789600003', vatStatusText: 'VAT Registered',
    manager: 'Mahesh Maddu', managerAvatar: '👨‍💼',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'In Progress',
    vatDue: 'Due in 2 Days', vatDueColor: '#EF4444',
    ctDue: 'Due in 5 Days', ctDueColor: '#EF4444', lastActivity: '2h ago',
    clientCode: 'ACC-001', industry: 'Trading', entityType: 'LLC',
    bookkeeper: 'Alex Mercer', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Connected', riskLevel: 'High', overallProgress: 72,
    activeTasks: 8, documents: 24, nextDeadline: 'VAT in 2 days',
    tags: ['Priority', 'VAT'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '2', initials: 'XYZ', avatarBg: '#312E81',
    name: 'XYZ Holdings Limited', email: 'contact@xyzholdings.com',
    trn: '100556789600004', vatStatusText: 'VAT Registered',
    manager: 'Priya Nair', managerAvatar: '👩‍💼',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'Completed',
    vatDue: 'Filed', vatDueColor: '#10B981',
    ctDue: 'Filed', ctDueColor: '#10B981', lastActivity: '4h ago',
    clientCode: 'ACC-002', industry: 'Finance', entityType: 'LLC',
    bookkeeper: 'Emma Watson', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Connected', riskLevel: 'Low', overallProgress: 98,
    activeTasks: 1, documents: 42, nextDeadline: 'CT in 45 days',
    tags: ['Premium'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '3', initials: 'DP', avatarBg: '#14532D',
    name: 'Delta Properties FZCO', email: 'admin@deltaproperties.ae',
    trn: '100556789600005', vatStatusText: 'VAT Registered',
    manager: 'Rohit Sharma', managerAvatar: '👨‍💻',
    status: 'Active', kycStatus: 'Expiring Soon', booksStatus: 'In Progress',
    vatDue: 'Due in 7 Days', vatDueColor: '#F59E0B',
    ctDue: 'Due in 12 Days', ctDueColor: '#F59E0B', lastActivity: '6h ago',
    clientCode: 'ACC-003', industry: 'Real Estate', entityType: 'FZCO',
    bookkeeper: 'Liam Neeson', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Syncing', riskLevel: 'Medium', overallProgress: 55,
    activeTasks: 12, documents: 18, nextDeadline: 'VAT in 7 days',
    tags: ['KYC Alert'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '4', initials: 'AT', avatarBg: '#1E3A8A',
    name: 'Alpha Tech FZCO', email: 'finance@alphatech.ae',
    trn: '100556789600006', vatStatusText: 'VAT Registered',
    manager: 'Sneha Iyer', managerAvatar: '👩‍💻',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'Completed',
    vatDue: 'Filed', vatDueColor: '#10B981',
    ctDue: 'Due in 20 Days', ctDueColor: '#F59E0B', lastActivity: '1d ago',
    clientCode: 'ACC-004', industry: 'Technology', entityType: 'FZCO',
    bookkeeper: 'Sarah Khan', financialYear: 'Apr–Mar 2024',
    qbStatus: 'Connected', riskLevel: 'Low', overallProgress: 88,
    activeTasks: 3, documents: 31, nextDeadline: 'CT in 20 days',
    tags: ['Premium', 'Tech'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '5', initials: 'BI', avatarBg: '#3B0764',
    name: 'Beta Industries LLC', email: 'operations@betaind.ae',
    trn: '100556789600007', vatStatusText: 'VAT Registered',
    manager: 'Mahesh Maddu', managerAvatar: '👨‍💼',
    status: 'Active', kycStatus: 'Pending', booksStatus: 'In Progress',
    vatDue: 'Due in 1 Day', vatDueColor: '#EF4444',
    ctDue: 'Due in 3 Days', ctDueColor: '#EF4444', lastActivity: '1d ago',
    clientCode: 'ACC-005', industry: 'Manufacturing', entityType: 'LLC',
    bookkeeper: 'Alex Mercer', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Error', riskLevel: 'High', overallProgress: 38,
    activeTasks: 15, documents: 9, nextDeadline: 'VAT in 1 day',
    tags: ['Urgent', 'QBO Error'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '6', initials: 'GS', avatarBg: '#0F172A',
    name: 'Gamma Solutions FZCO', email: 'info@gammasolutions.ae',
    trn: '100556789600008', vatStatusText: 'VAT Registered',
    manager: 'Priya Nair', managerAvatar: '👩‍💼',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'Completed',
    vatDue: 'Filed', vatDueColor: '#10B981',
    ctDue: 'Filed', ctDueColor: '#10B981', lastActivity: '2d ago',
    clientCode: 'ACC-006', industry: 'Consulting', entityType: 'FZCO',
    bookkeeper: 'Emma Watson', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Connected', riskLevel: 'Low', overallProgress: 100,
    activeTasks: 0, documents: 56, nextDeadline: 'VAT in 90 days',
    tags: ['VIP'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '7', initials: 'NH', avatarBg: '#052E16',
    name: 'Nova Hospitality LLC', email: 'accounts@novahospitality.ae',
    trn: '100556789600009', vatStatusText: 'VAT Registered',
    manager: 'Rohit Sharma', managerAvatar: '👨‍💻',
    status: 'Onboarding', kycStatus: 'In Review', booksStatus: 'Not Started',
    vatDue: '-', vatDueColor: 'rgba(42,22,40,0.4)',
    ctDue: '-', ctDueColor: 'rgba(42,22,40,0.4)', lastActivity: '2d ago',
    clientCode: 'ACC-007', industry: 'Hospitality', entityType: 'LLC',
    bookkeeper: 'Liam Neeson', financialYear: 'Jan–Dec 2025',
    qbStatus: 'Disconnected', riskLevel: 'Medium', overallProgress: 25,
    activeTasks: 6, documents: 4, nextDeadline: 'KYC Review pending',
    tags: ['New Client'], country: 'UAE', onboardingStage: 'KYC Verification',
  },
  {
    id: '8', initials: 'PC', avatarBg: '#312E81',
    name: 'Prime Consultants FZCO', email: 'contact@primeconsultants.ae',
    trn: '100556789600010', vatStatusText: 'VAT Registered',
    manager: 'Sneha Iyer', managerAvatar: '👩‍💻',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'In Progress',
    vatDue: 'Due in 10 Days', vatDueColor: '#F59E0B',
    ctDue: 'Due in 18 Days', ctDueColor: '#F59E0B', lastActivity: '3d ago',
    clientCode: 'ACC-008', industry: 'Consulting', entityType: 'FZCO',
    bookkeeper: 'Sarah Khan', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Connected', riskLevel: 'Medium', overallProgress: 65,
    activeTasks: 5, documents: 28, nextDeadline: 'VAT in 10 days',
    tags: ['Review'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '9', initials: 'SS', avatarBg: '#1A2E1A',
    name: 'Sigma Services LLC', email: 'hello@sigmaservices.ae',
    trn: '100556789600011', vatStatusText: 'VAT Registered',
    manager: 'Mahesh Maddu', managerAvatar: '👨‍💼',
    status: 'Inactive', kycStatus: 'Expired', booksStatus: 'Not Started',
    vatDue: 'Overdue', vatDueColor: '#EF4444',
    ctDue: 'Overdue', ctDueColor: '#EF4444', lastActivity: '5d ago',
    clientCode: 'ACC-009', industry: 'Services', entityType: 'LLC',
    bookkeeper: 'Alex Mercer', financialYear: 'Jan–Dec 2023',
    qbStatus: 'Disconnected', riskLevel: 'High', overallProgress: 10,
    activeTasks: 0, documents: 6, nextDeadline: 'KYC Expired',
    tags: ['Attention'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '10', initials: 'TE', avatarBg: '#3B0764',
    name: 'Vertex Enterprises LLC', email: 'finance@vertex.ae',
    trn: '100556789600012', vatStatusText: 'VAT Registered',
    manager: 'Priya Nair', managerAvatar: '👩‍💼',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'Completed',
    vatDue: 'Filed', vatDueColor: '#10B981',
    ctDue: 'Filed', ctDueColor: '#10B981', lastActivity: '5d ago',
    clientCode: 'ACC-010', industry: 'Trading', entityType: 'LLC',
    bookkeeper: 'Emma Watson', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Connected', riskLevel: 'Low', overallProgress: 95,
    activeTasks: 2, documents: 38, nextDeadline: 'CT in 60 days',
    tags: ['Premium'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '11', initials: 'OM', avatarBg: '#7F1D1D',
    name: 'Omega Media Group', email: 'accounts@omegamedia.ae',
    trn: '100556789600013', vatStatusText: 'VAT Registered',
    manager: 'Rohit Sharma', managerAvatar: '👨‍💻',
    status: 'Active', kycStatus: 'Verified', booksStatus: 'Review',
    vatDue: 'Due in 14 Days', vatDueColor: '#F59E0B',
    ctDue: 'Due in 30 Days', ctDueColor: '#F59E0B', lastActivity: '6h ago',
    clientCode: 'ACC-011', industry: 'Media', entityType: 'LLC',
    bookkeeper: 'Liam Neeson', financialYear: 'Jan–Dec 2024',
    qbStatus: 'Syncing', riskLevel: 'Medium', overallProgress: 60,
    activeTasks: 7, documents: 22, nextDeadline: 'VAT in 14 days',
    tags: ['Review'], country: 'UAE', onboardingStage: 'Complete',
  },
  {
    id: '12', initials: 'NG', avatarBg: '#064E3B',
    name: 'NovaTech Gulf FZE', email: 'finance@novatechgulf.ae',
    trn: '100556789600014', vatStatusText: 'VAT Registered',
    manager: 'Sneha Iyer', managerAvatar: '👩‍💻',
    status: 'Onboarding', kycStatus: 'Pending', booksStatus: 'Not Started',
    vatDue: '-', vatDueColor: 'rgba(42,22,40,0.4)',
    ctDue: '-', ctDueColor: 'rgba(42,22,40,0.4)', lastActivity: '1d ago',
    clientCode: 'ACC-012', industry: 'Technology', entityType: 'FZE',
    bookkeeper: 'Sarah Khan', financialYear: 'Jan–Dec 2025',
    qbStatus: 'Disconnected', riskLevel: 'Low', overallProgress: 15,
    activeTasks: 4, documents: 2, nextDeadline: 'KYC Submission',
    tags: ['New Client', 'Tech'], country: 'UAE', onboardingStage: 'Document Collection',
  },
];

export default function ClientListTab() {
  const [clients, setClients] = useState<ClientItem[]>(INITIAL_CLIENTS);
  const [bulkAction, setBulkAction] = useState<{ type: 'manager' | 'bookkeeper' | 'status' | 'tag' | 'delete' | 'archive' | null, title: string }>({ type: null, title: '' });
  const [bulkValue, setBulkValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | null }>({ message: '', type: null });
  const [aiReviewing, setAiReviewing] = useState(false);
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };
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
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv' | 'pdf' | 'print'>('xlsx');
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
      setSelectedClients(filteredClients.map(c => c.id));
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

  const filteredClients = clients.filter(client => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      client.name.toLowerCase().includes(q) ||
      client.email.toLowerCase().includes(q) ||
      client.trn.toLowerCase().includes(q) ||
      client.clientCode.toLowerCase().includes(q) ||
      client.industry.toLowerCase().includes(q) ||
      client.manager.toLowerCase().includes(q) ||
      client.bookkeeper.toLowerCase().includes(q) ||
      (client.tags || []).some(t => t.toLowerCase().includes(q));
      
    const matchesStatus = filters.status === 'All' || client.status === filters.status;
    const matchesManager = filters.manager === 'All' || client.manager === filters.manager;
    const matchesBookkeeping = filters.bookkeeping === 'All' || client.booksStatus === filters.bookkeeping;
    const matchesKyc = filters.kyc === 'All' || client.kycStatus === filters.kyc;

    const matchesBookkeeper = advancedFilters.bookkeeper === 'All' || client.bookkeeper === advancedFilters.bookkeeper;
    const matchesIndustry = advancedFilters.industry === 'All' || client.industry === advancedFilters.industry;
    const matchesEntityType = advancedFilters.entityType === 'All' || client.entityType === advancedFilters.entityType;
    const matchesCountry = advancedFilters.country === 'All' || client.country === advancedFilters.country;
    const matchesFY = advancedFilters.financialYear === 'All' || client.financialYear === advancedFilters.financialYear;
    const matchesQb = advancedFilters.qbStatus === 'All' || client.qbStatus === advancedFilters.qbStatus;
    const matchesRisk = advancedFilters.riskLevel === 'All' || client.riskLevel === advancedFilters.riskLevel;
    
    let matchesSavedView = true;
    if (savedView === 'My Clients') matchesSavedView = client.manager === 'Mahesh Maddu' || client.bookkeeper === 'Alex Mercer';
    else if (savedView === 'Active') matchesSavedView = client.status === 'Active';
    else if (savedView === 'Onboarding') matchesSavedView = client.status === 'Onboarding';
    else if (savedView === 'Inactive') matchesSavedView = client.status === 'Inactive';
    else if (savedView === 'KYC Expiring') matchesSavedView = client.kycStatus === 'Expiring Soon';
    else if (savedView === 'VAT Due') matchesSavedView = client.vatDue !== 'Filed' && client.vatDue !== '-';
    else if (savedView === 'CT Due') matchesSavedView = client.ctDue !== 'Filed' && client.ctDue !== '-';
    else if (savedView === 'High Risk') matchesSavedView = client.riskLevel === 'High';
    else if (savedView === 'QB Errors') matchesSavedView = client.qbStatus === 'Error';
    else if (savedView === 'QB Connected') matchesSavedView = client.qbStatus === 'Connected';

    return matchesSearch && matchesStatus && matchesManager && matchesBookkeeping && matchesKyc &&
      matchesBookkeeper && matchesIndustry && matchesEntityType && matchesCountry && matchesFY &&
      matchesQb && matchesRisk && matchesSavedView;
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
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
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

      {/* ── KPI ROW 2: QUICKBOOKS & PIPELINE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'QuickBooks Connected', value: '186', sub: '75.0% of clients', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
          { label: 'QuickBooks Errors', value: '3', sub: 'Needs attention', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
          { label: 'Books Pending', value: '32', sub: 'Action required', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
          { label: 'New This Month', value: '8', sub: '+3 this week', color: '#E8760A', bg: 'rgba(232, 118, 10, 0.06)',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
        ].map((card, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(42,22,40,0.02)', minHeight: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2 }}>{card.label}</span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#2A1628', lineHeight: 1.1, fontFamily: 'var(--font-serif), Georgia, serif' }}>{card.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem', fontWeight: 500 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SAVED VIEWS BAR ── */}
      <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'All Clients', label: 'All Clients', count: '248' },
          { id: 'My Clients', label: 'My Clients', count: '45' },
          { id: 'Active', label: 'Active', count: '210' },
          { id: 'Onboarding', label: 'Onboarding', count: '18' },
          { id: 'Inactive', label: 'Inactive', count: '20' },
          { id: 'KYC Expiring', label: 'KYC Expiring', count: '11' },
          { id: 'VAT Due', label: 'VAT Due', count: '9' },
          { id: 'CT Due', label: 'CT Due', count: '4' },
          { id: 'High Risk', label: 'High Risk', count: '7' },
          { id: 'QB Errors', label: 'QB Errors', count: '3' },
          { id: 'QB Connected', label: 'QB Connected', count: '186' },
        ].map(view => (
          <button
            key={view.id}
            onClick={() => setSavedView(view.id)}
            style={{ padding: '0.375rem 0.875rem', borderRadius: '20px', border: savedView === view.id ? '1.5px solid #E8760A' : '1px solid #DDD0C4', background: savedView === view.id ? 'rgba(232,118,10,0.06)' : '#ffffff', color: savedView === view.id ? '#E8760A' : 'rgba(42,22,40,0.6)', fontWeight: savedView === view.id ? 700 : 500, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 150ms ease', fontFamily: 'Inter, sans-serif' }}
          >
            {view.label}
            <span style={{ background: savedView === view.id ? '#E8760A' : 'rgba(42,22,40,0.08)', color: savedView === view.id ? '#fff' : 'rgba(42,22,40,0.5)', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', lineHeight: 1.5 }}>{view.count}</span>
          </button>
        ))}
      </div>

      {/* ── BULK ACTIONS TOOLBAR ── */}
      {selectedClients.length > 1 && (
        <div className="no-scrollbar" style={{ background: '#2A1628', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.25rem', flexShrink: 0 }}>
            {selectedClients.length} clients selected
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'Assign Manager', ic: '👤', onClick: () => setBulkAction({ type: 'manager', title: 'Assign Account Manager' }) },
              { label: 'Assign Bookkeeper', ic: '📚', onClick: () => setBulkAction({ type: 'bookkeeper', title: 'Assign Bookkeeper' }) },
              { label: 'Change Status', ic: '🔄', onClick: () => setBulkAction({ type: 'status', title: 'Change Status' }) },
              { label: 'Send Reminder', ic: '📧', onClick: () => { triggerToast(`Sent compliance reminders to ${selectedClients.length} clients successfully!`, 'success'); setSelectedClients([]); } },
              { label: 'Export', ic: '📤', onClick: () => { setExportScope('selected'); setExportOpen(true); } },
              { label: 'Add Tag', ic: '🏷️', onClick: () => setBulkAction({ type: 'tag', title: 'Add Tag' }) },
              { label: 'AI Review', ic: '🤖', onClick: () => {
                setAiReviewing(true);
                setTimeout(() => {
                  setAiReviewing(false);
                  setClients(prev => prev.map(c => selectedClients.includes(c.id) ? { ...c, overallProgress: Math.min(c.overallProgress + 15, 100), tags: Array.from(new Set([...(c.tags || []), 'AI Reviewed'])) } : c));
                  triggerToast(`AI Review completed for ${selectedClients.length} clients!`, 'success');
                  setSelectedClients([]);
                }, 2000);
              } },
              { label: 'Archive', ic: '🗄️', onClick: () => setBulkAction({ type: 'archive', title: 'Archive Clients' }) },
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Advanced
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showAdvancedFilters ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
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
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><polyline points="6 9 12 15 18 9"/></svg>
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
              <th style={{ padding: '1rem' }}>CLIENT CODE</th>
              <th style={{ padding: '1rem' }}>INDUSTRY / TYPE</th>
              <th style={{ padding: '1rem' }}>BOOKKEEPER</th>
              <th style={{ padding: '1rem' }}>FIN. YEAR</th>
              <th style={{ padding: '1rem' }}>RISK</th>
              <th style={{ padding: '1rem' }}>QUICKBOOKS</th>
              <th style={{ padding: '1rem' }}>PROGRESS</th>
              <th style={{ padding: '1rem' }}>TASKS</th>
              <th style={{ padding: '1rem' }}>DOCS</th>
              <th style={{ padding: '1rem' }}>NEXT DEADLINE</th>
              <th style={{ padding: '1rem' }}>TAGS</th>
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

                {/* ── ACTIONS DROPDOWN ── */}
                <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('overview'); }}
                      style={{ background: 'rgba(232,118,10,0.06)', border: '1px solid rgba(232,118,10,0.15)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#E8760A', display: 'flex', alignItems: 'center', fontSize: '0.65rem', fontWeight: 600, gap: '4px' }}
                      title="Quick Preview"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setRowActionOpen(rowActionOpen === client.id ? null : client.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(42,22,40,0.1)', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', color: 'rgba(42,22,40,0.55)', display: 'flex', alignItems: 'center' }}
                        title="More actions"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>
                      {rowActionOpen === client.id && (
                        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: '#fff', border: '1px solid #DDD0C4', borderRadius: '12px', boxShadow: '0 12px 36px rgba(42,22,40,0.14)', zIndex: 200, minWidth: '200px', overflow: 'hidden', padding: '4px' }}>
                          {[
                            { label: 'Open Profile', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, action: () => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('overview'); } },
                            { label: 'View Timeline', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, action: () => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('timeline'); } },
                            { label: 'Open Documents', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, action: () => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('documents'); } },
                            { label: 'Upload Documents', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, action: () => alert('Upload docs: ' + client.name) },
                            { label: 'AI Bookkeeping', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M12 2v2M8 5h8M7 11V7a5 5 0 0 1 10 0v4"/></svg>, action: () => alert('AI Bookkeeping: ' + client.name) },
                            { label: 'Reconciliation', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="12" x2="19" y2="12"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/></svg>, action: () => alert('Reconciliation: ' + client.name) },
                            { label: 'VAT Center', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, action: () => alert('VAT Center: ' + client.name) },
                            { label: 'Corporate Tax', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>, action: () => alert('CT: ' + client.name) },
                            { label: 'Reports', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, action: () => alert('Reports: ' + client.name) },
                            { label: 'QuickBooks Sync', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>, action: () => alert('QBO: ' + client.name) },
                            { label: 'Notes', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, action: () => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('activity'); } },
                            { label: 'Activity Log', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, action: () => { setPreviewClient(client); setPreviewOpen(true); setPreviewTab('activity'); } },
                            { label: 'Archive', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, action: () => alert('Archive: ' + client.name) },
                            { label: 'Delete Client', ic: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>, action: () => alert('Delete: ' + client.name), danger: true },
                          ].map((item, ai) => (
                            <div key={ai}
                              onClick={() => { item.action(); setRowActionOpen(null); }}
                              style={{ padding: '0.45rem 0.75rem', fontSize: '0.775rem', cursor: 'pointer', color: (item as {danger?: boolean}).danger ? '#EF4444' : '#2A1628', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                              onMouseEnter={e => (e.currentTarget.style.background = (item as {danger?: boolean}).danger ? 'rgba(239,68,68,0.06)' : 'rgba(232,118,10,0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span style={{ fontSize: '0.7rem', width: '16px', textAlign: 'center', color: (item as {danger?: boolean}).danger ? '#EF4444' : '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.ic}</span>
                              {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* ── ENTERPRISE COLUMNS ── */}
                {/* Client Code */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: '#E8760A', background: 'rgba(232,118,10,0.06)', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>{client.clientCode}</span>
                </td>

                {/* Industry / Entity Type */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600, color: '#2A1628', fontSize: '0.75rem' }}>{client.industry}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '2px' }}>{client.entityType}</div>
                </td>

                {/* Bookkeeper */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(232,118,10,0.08)', color: '#E8760A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#2A1628' }}>{client.bookkeeper}</span>
                  </div>
                </td>

                {/* Financial Year */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', fontWeight: 500 }}>
                  {client.financialYear}
                </td>

                {/* Risk Level */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: client.riskLevel === 'High' ? 'rgba(239,68,68,0.08)' : client.riskLevel === 'Medium' ? 'rgba(245,158,11,0.08)' : 'rgba(4,120,87,0.08)', color: client.riskLevel === 'High' ? '#EF4444' : client.riskLevel === 'Medium' ? '#D97706' : '#047857' }}>{client.riskLevel}</span>
                </td>

                {/* QuickBooks Status */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: client.qbStatus === 'Connected' ? 'rgba(4,120,87,0.08)' : client.qbStatus === 'Syncing' ? 'rgba(232,118,10,0.08)' : client.qbStatus === 'Error' ? 'rgba(239,68,68,0.08)' : 'rgba(42,22,40,0.06)', color: client.qbStatus === 'Connected' ? '#047857' : client.qbStatus === 'Syncing' ? '#E8760A' : client.qbStatus === 'Error' ? '#EF4444' : 'rgba(42,22,40,0.5)' }}>{client.qbStatus}</span>
                </td>

                {/* Overall Progress */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', minWidth: '110px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(42,22,40,0.06)', borderRadius: '2px', overflow: 'hidden', minWidth: '60px' }}>
                      <div style={{ width: `${client.overallProgress}%`, height: '100%', background: client.overallProgress >= 90 ? '#2EA44F' : client.overallProgress >= 60 ? '#E8760A' : '#EF4444', borderRadius: '2px', transition: 'width 300ms' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', minWidth: '28px' }}>{client.overallProgress}%</span>
                  </div>
                </td>

                {/* Active Tasks */}
                <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: client.activeTasks > 10 ? '#EF4444' : client.activeTasks > 4 ? '#E8760A' : '#047857' }}>{client.activeTasks}</span>
                </td>

                {/* Documents */}
                <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.7)' }}>{client.documents}</span>
                </td>

                {/* Next Deadline */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', fontSize: '0.7rem', color: client.nextDeadline.toLowerCase().includes('1 day') || client.nextDeadline.toLowerCase().includes('expired') ? '#EF4444' : client.nextDeadline.toLowerCase().includes('2 day') || client.nextDeadline.toLowerCase().includes('pending') ? '#E8760A' : 'rgba(42,22,40,0.6)', fontWeight: 600 }}>
                  {client.nextDeadline}
                </td>

                {/* Tags */}
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {client.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.55)', whiteSpace: 'nowrap' }}>{tag}</span>
                    ))}
                    {client.tags.length > 2 && <span style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.35)' }}>+{client.tags.length - 2}</span>}
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                    { role: 'Account Manager', name: previewClient.manager, ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                    { role: 'Bookkeeper', name: previewClient.bookkeeper, ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
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
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Open Tasks ({previewClient.activeTasks})</div>
                  {[
                    { task: 'Collect VAT Invoices for Q2', done: false },
                    { task: 'Reconcile 12 QuickBooks Suspense items', done: false },
                    { task: 'Verify KYC documentation baseline', done: true },
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                      <input type="checkbox" checked={t.done} readOnly style={{ accentColor: '#E8760A', cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.75rem', color: t.done ? 'rgba(42,22,40,0.45)' : '#2A1628', textDecoration: t.done ? 'line-through' : 'none', fontWeight: 500 }}>{t.task}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Documents Widget */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Recent Documents</div>
                  {[
                    { name: 'VAT_Return_Q1_2025.pdf', size: '2.4 MB', date: '2d ago' },
                    { name: 'Trade_License_Renewal_2025.pdf', size: '4.1 MB', date: '1w ago' },
                    { name: 'Q1_Ledger_Extract.xlsx', size: '890 KB', date: '2w ago' },
                  ].map((doc, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{doc.name}</span>
                      </div>
                      <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', whiteSpace: 'nowrap' }}>{doc.date}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Reports Widget */}
                <div style={{ background: '#FAF8F5', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Recent Reports</div>
                  {[
                    { name: 'Profit & Loss Statement Q1', type: 'Financial' },
                    { name: 'Balance Sheet March 2025', type: 'Financial' },
                    { name: 'Compliance Summary', type: 'Audit' },
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
                    <span>&quot;Onboarded tech division setup, client prefers weekly Slack checkpoints instead of email.&quot;</span>
                    <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.4)', marginTop: '0.5rem', alignSelf: 'flex-end', fontWeight: 600 }}>Last updated: 3d ago by Priya Nair</span>
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
                    { event: 'Client Created', date: 'Jan 5, 2024', status: 'done', note: 'Client added by Mahesh Maddu' },
                    { event: 'Onboarding Started', date: 'Jan 8, 2024', status: 'done', note: 'Onboarding wizard completed' },
                    { event: 'KYC Submitted', date: 'Jan 15, 2024', status: 'done', note: previewClient.kycStatus },
                    { event: 'Bookkeeping Q1', date: 'Apr 1, 2024', status: 'done', note: previewClient.booksStatus },
                    { event: 'VAT Filing Q1', date: 'Apr 28, 2024', status: previewClient.vatDue === 'Filed' ? 'done' : 'pending', note: previewClient.vatDue },
                    { event: 'CT Filing', date: 'Sep 30, 2024', status: previewClient.ctDue === 'Filed' ? 'done' : 'upcoming', note: previewClient.ctDue },
                    { event: 'QuickBooks Sync', date: 'Ongoing', status: previewClient.qbStatus === 'Connected' ? 'done' : 'alert', note: previewClient.qbStatus },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.875rem', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.status === 'done' ? '#2EA44F' : item.status === 'alert' ? '#EF4444' : item.status === 'pending' ? '#E8760A' : '#DDD0C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.status === 'done' && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        {i < 6 && <div style={{ width: '1px', flex: 1, background: '#DDD0C4', margin: '4px 0', minHeight: '20px' }} />}
                      </div>
                      <div style={{ paddingBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2A1628' }}>{item.event}</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', marginTop: '1px' }}>{item.date}</div>
                        <div style={{ fontSize: '0.7rem', color: item.status === 'alert' ? '#EF4444' : 'rgba(42,22,40,0.55)', marginTop: '3px' }}>{item.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {previewTab === 'documents' && (<>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Document Status</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                  {[
                    { label: 'Uploaded', count: previewClient.documents, color: '#2EA44F', bg: 'rgba(46,164,79,0.06)' },
                    { label: 'Verified', count: Math.floor(previewClient.documents * 0.7), color: '#047857', bg: 'rgba(4,120,87,0.06)' },
                    { label: 'OCR Pending', count: Math.floor(previewClient.documents * 0.15), color: '#E8760A', bg: 'rgba(232,118,10,0.06)' },
                    { label: 'Rejected', count: 0, color: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
                    { label: 'Missing', count: 3, color: '#E8760A', bg: 'rgba(232,118,10,0.06)' },
                    { label: 'Expired', count: previewClient.kycStatus === 'Expired' ? 1 : 0, color: '#B8892A', bg: 'rgba(184,137,42,0.06)' },
                  ].map((d, i) => (
                    <div key={i} style={{ background: d.bg, border: `1px solid ${d.color}20`, borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 300, color: d.color, fontFamily: 'Georgia, serif' }}>{d.count}</div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px', fontWeight: 600 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
                <button style={{ padding: '0.6rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => alert('Upload documents for ' + previewClient.name)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload Documents
                </button>
              </>)}

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
                  { label: 'AI Alerts', val: previewClient.activeTasks > 8 ? '3 critical alerts' : '1 alert', color: '#EF4444', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                  { label: 'Recommendations', val: '2 optimizations available', color: '#E8760A', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A7.5 7.5 0 0 0 11 1C7 1 3.5 4.5 3.5 8.5c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg> },
                  { label: 'Missing Documents', val: '3 required', color: '#E8760A', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                  { label: 'OCR Confidence', val: '94.2%', color: '#2EA44F', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2EA44F" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
                  { label: 'Matching Confidence', val: '91.7%', color: '#2EA44F', ic: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2EA44F" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> },
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
                {[
                  { actor: 'AI System', action: 'OCR completed for Q2 invoices', time: '2h ago', type: 'ai' },
                  { actor: previewClient.bookkeeper, action: 'Updated books status to ' + previewClient.booksStatus, time: '4h ago', type: 'bookkeeper' },
                  { actor: previewClient.manager, action: 'Reviewed compliance report', time: '1d ago', type: 'manager' },
                  { actor: 'System', action: 'QuickBooks sync: ' + previewClient.qbStatus, time: '2d ago', type: 'system' },
                  { actor: 'Client', action: 'Uploaded 4 new documents', time: '3d ago', type: 'client' },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.875rem', borderBottom: i < 4 ? '1px solid rgba(42,22,40,0.04)' : 'none' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(232,118,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {a.type === 'ai' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M12 2v2M8 5h8M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ) : a.type === 'manager' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      ) : a.type === 'bookkeeper' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      ) : a.type === 'client' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M9 8h2M9 12h2M13 8h2M13 12h2"/></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
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
              <button onClick={() => alert('AI Bookkeeping: ' + previewClient.name)} style={{ flex: 1, padding: '0.55rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M12 2v2M8 5h8M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                AI Review
              </button>
              <button onClick={() => alert('VAT Center: ' + previewClient.name)} style={{ flex: 1, padding: '0.55rem', background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                VAT
              </button>
              <button onClick={() => alert('Reports: ' + previewClient.name)} style={{ flex: 1, padding: '0.55rem', background: '#ffffff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
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
                onClick={() => {
                  if (bulkAction.type === 'delete') {
                    setClients(clients.filter(c => !selectedClients.includes(c.id)));
                    triggerToast(`Permanently deleted ${selectedClients.length} clients.`, 'error');
                  } else if (bulkAction.type === 'archive') {
                    setClients(clients.map(c => selectedClients.includes(c.id) ? { ...c, status: 'Archived' } : c));
                    triggerToast(`Archived ${selectedClients.length} clients successfully!`, 'success');
                  } else {
                    setClients(clients.map(c => {
                      if (selectedClients.includes(c.id)) {
                        if (bulkAction.type === 'manager') return { ...c, manager: bulkValue || c.manager };
                        if (bulkAction.type === 'bookkeeper') return { ...c, bookkeeper: bulkValue || c.bookkeeper };
                        if (bulkAction.type === 'status') return { ...c, status: (bulkValue || c.status) as ClientItem['status'] };
                        if (bulkAction.type === 'tag') return { ...c, tags: Array.from(new Set([...(c.tags || []), bulkValue])) };
                      }
                      return c;
                    }));
                    triggerToast(`Successfully updated ${selectedClients.length} clients.`, 'success');
                  }
                  setSelectedClients([]);
                  setBulkAction({ type: null, title: '' });
                  setBulkValue('');
                }}
                style={{ background: bulkAction.type === 'delete' ? '#EF4444' : '#2A1628', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm
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
          {toast.type === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          {toast.type === 'error' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {toast.type === 'info' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          {toast.message}
        </div>
      )}
    </div>
  );
}
