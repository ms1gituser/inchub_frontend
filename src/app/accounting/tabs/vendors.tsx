'use client';

import React, { useState } from 'react';

interface VendorItem {
  id: string;
  vendorId: string;
  initials: string;
  avatarBg: string;
  name: string;
  category: string;
  categoryBg: string;
  categoryColor: string;
  client: string;
  contactName: string;
  contactEmail: string;
  terms: string;
  paymentStatus: 'Paid' | 'Overdue' | 'Due Soon' | 'On Hold';
  outstanding: string;
  isOutRed: boolean;
}

const INITIAL_VENDORS: VendorItem[] = [
  {
    id: '1',
    vendorId: 'VND-00248',
    initials: 'AD',
    avatarBg: '#FAF2EC',
    name: 'Alpha Digital LLC',
    category: 'IT Services',
    categoryBg: '#F0F6FC',
    categoryColor: '#1E3A8A',
    client: 'ABC Trading LLC',
    contactName: 'John Smith',
    contactEmail: 'john@alphadigital.com',
    terms: 'Net 30',
    paymentStatus: 'Paid',
    outstanding: '0.00',
    isOutRed: false
  },
  {
    id: '2',
    vendorId: 'VND-00247',
    initials: 'OS',
    avatarBg: '#FAF2EC',
    name: 'Office Supplies Co.',
    category: 'Office Supplies',
    categoryBg: '#EFF6FF',
    categoryColor: '#1E3A8A',
    client: 'XYZ Holdings Limited',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@officesupplies.com',
    terms: 'Net 15',
    paymentStatus: 'Overdue',
    outstanding: '3,450.00',
    isOutRed: true
  },
  {
    id: '3',
    vendorId: 'VND-00246',
    initials: 'PW',
    avatarBg: '#FAF2EC',
    name: 'Prime Workspace',
    category: 'Rent & Utilities',
    categoryBg: '#F3E8FF',
    categoryColor: '#581C87',
    client: 'Delta Properties FZCO',
    contactName: 'Michael Brown',
    contactEmail: 'michael@primeworkspace.com',
    terms: 'Net 30',
    paymentStatus: 'Paid',
    outstanding: '0.00',
    isOutRed: false
  },
  {
    id: '4',
    vendorId: 'VND-00245',
    initials: 'TC',
    avatarBg: '#FAF2EC',
    name: 'Tech Connect Solutions',
    category: 'IT Services',
    categoryBg: '#F0F6FC',
    categoryColor: '#1E3A8A',
    client: 'Alpha Tech FZCO',
    contactName: 'David Wilson',
    contactEmail: 'david@techconnect.com',
    terms: 'Net 45',
    paymentStatus: 'Due Soon',
    outstanding: '1,250.00',
    isOutRed: true
  },
  {
    id: '5',
    vendorId: 'VND-00244',
    initials: 'GS',
    avatarBg: '#FAF2EC',
    name: 'Global Services LLC',
    category: 'Professional Services',
    categoryBg: '#FEF3C7',
    categoryColor: '#92400E',
    client: 'Beta Industries LLC',
    contactName: 'Emma Davis',
    contactEmail: 'emma@globalservices.com',
    terms: 'Net 30',
    paymentStatus: 'Paid',
    outstanding: '0.00',
    isOutRed: false
  }
];

export default function VendorsTab() {
  const [vendors, setVendors] = useState<VendorItem[]>(INITIAL_VENDORS);
  const [selectedSubTab, setSelectedSubTab] = useState<'All Vendors' | 'Active' | 'On Hold' | 'Inactive' | 'Pending Approval'>('All Vendors');
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Custom dropdown states for filter selectors
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    paymentStatus: 'All',
    client: 'All'
  });

  const filterOptions = {
    status: ['All', 'Active', 'On Hold', 'Inactive'],
    category: ['All', 'IT Services', 'Office Supplies', 'Rent & Utilities', 'Professional Services'],
    paymentStatus: ['All', 'Paid', 'Overdue', 'Due Soon'],
    client: ['All', 'ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC']
  };

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPageOpen, setRowsPerPageOpen] = useState(false);

  // Modals state
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Add vendor form
  const [addForm, setAddForm] = useState({
    name: '',
    category: 'IT Services',
    client: 'ABC Trading LLC',
    contactName: '',
    contactEmail: '',
    terms: 'Net 30',
    outstanding: '0.00'
  });
  const [addCatDropdownOpen, setAddCatDropdownOpen] = useState(false);
  const [addClientDropdownOpen, setAddClientDropdownOpen] = useState(false);

  const toggleSelectAll = () => {
    if (selectedRows.length === vendors.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(vendors.map(v => v.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(x => x !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Filter & Search logic
  const filteredVendors = vendors.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filters.category === 'All' || item.category === filters.category;
    const matchesPaymentStatus = filters.paymentStatus === 'All' || item.paymentStatus === filters.paymentStatus;
    const matchesClient = filters.client === 'All' || item.client === filters.client;
    
    return matchesSearch && matchesCategory && matchesPaymentStatus && matchesClient;
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
              Accounting &gt; Vendors
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
            Vendors <span style={{ fontStyle: 'italic', color: '#E8760A' }}>Center</span>
          </h1>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>
            Manage all vendors, track payments, and monitor vendor performance across your clients.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setCategoriesOpen(true)}
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
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
            </svg>
            Categories
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
              gap: '0.5rem'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import Vendors
          </button>

          <button 
            onClick={() => setAddOpen(true)}
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
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(42,22,40,0.15)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Vendor
          </button>
        </div>
      </div>

      {/* ── METRICS GRID (5 CARDS ROW) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Total Vendors', value: '248', sub: '+12 this month', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
          { label: 'Active Vendors', value: '193', sub: '78% of total', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
          { label: 'Payments Month', value: 'AED 1,245,780', sub: '+15% vs last month', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
          { label: 'Overdue Payments', value: 'AED 128,450', sub: '18 Vendors', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
          { label: 'On Hold Vendors', value: '12', sub: '5% of total', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> },
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
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(42,22,40,0.6)', lineHeight: 1.2, marginRight: '0.5rem', flex: 1 }}>{card.label}</span>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: '#FAF2EC',
                border: '1px solid #F3DEC9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8760A',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2A1628', lineHeight: 1.1 }}>{card.value}</div>
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
        boxShadow: '0 4px 12px rgba(42,22,40,0.01)',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', flex: 1, gap: '0.75rem', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', opacity: 0.4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search vendors by name, email, or category..."
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
                color: '#2A1628',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {/* Custom filter dropdowns */}
          {['category', 'paymentStatus', 'client'].map((key) => {
            const isOpen = activeDropdown === key;
            const selectedVal = filters[key as keyof typeof filters];
            const options = filterOptions[key as keyof typeof filterOptions];
            const label = key === 'category' ? 'Category' : key === 'paymentStatus' ? 'Status' : 'Client';

            return (
              <div key={key} style={{ position: 'relative' }}>
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : key)}
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
                    minWidth: key === 'category' ? '125px' : key === 'paymentStatus' ? '120px' : '150px'
                  }}
                >
                  <span>{label}: {selectedVal}</span>
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
                      overflowY: 'auto'
                    }}>
                    {options.map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setFilters({ ...filters, [key]: option });
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

          <button 
            onClick={() => {
              setSearch('');
              setFilters({ status: 'All', category: 'All', paymentStatus: 'All', client: 'All' });
            }}
            style={{ 
              background: '#FAF8F5',
              border: '1px solid #DDD0C4',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#2A1628',
              fontFamily: 'inherit'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT (TABLE ABOVE, CARDS BELOW) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Left Column Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          


          {/* Table wrapper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>Showing 1 to {filteredVendors.length} of {filteredVendors.length} vendors</span>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(42,22,40,0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(42,22,40,0.01)'
            }}>
              <div className="client-table-scroll" style={{ overflowX: 'auto' }}>
                <style>{`
                  .client-table-scroll::-webkit-scrollbar { height: 6px; }
                  .client-table-scroll::-webkit-scrollbar-track { background: rgba(42,22,40,0.03); border-radius: 4px; }
                  .client-table-scroll::-webkit-scrollbar-thumb { background: rgba(42,22,40,0.15); border-radius: 4px; }
                  .client-table-scroll::-webkit-scrollbar-thumb:hover { background: rgba(42,22,40,0.25); }
                `}</style>
                <table style={{ width: '100%', minWidth: '1250px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(42,22,40,0.06)', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>
                      <th style={{ padding: '1rem 0.75rem', width: '40px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div
                          onClick={toggleSelectAll}
                          style={{
                            width: '15px', height: '15px', borderRadius: '4px',
                            border: `1px solid ${selectedRows.length === vendors.length ? '#E8760A' : '#DDD0C4'}`,
                            background: selectedRows.length === vendors.length ? '#E8760A' : '#FAF8F5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', margin: '0 auto', transition: 'all 150ms ease'
                          }}
                        >
                          {selectedRows.length === vendors.length && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </div>
                      </th>
                      <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>VENDOR</th>
                      <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>CATEGORY</th>
                      <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>CLIENT / COMPANY</th>
                      <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>CONTACT</th>
                      <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>PAYMENT TERMS</th>
                      <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>PAYMENT STATUS</th>
                      <th style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>OUTSTANDING (AED)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map((item, idx) => (
                      <tr key={item.id} style={{
                        borderBottom: idx < filteredVendors.length - 1 ? '1px solid rgba(42,22,40,0.04)' : 'none',
                        background: selectedRows.includes(item.id) ? 'rgba(232, 118, 10, 0.02)' : 'transparent'
                      }}>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div
                            onClick={() => handleSelectOne(item.id)}
                            style={{
                              width: '15px', height: '15px', borderRadius: '4px',
                              border: `1px solid ${selectedRows.includes(item.id) ? '#E8760A' : '#DDD0C4'}`,
                              background: selectedRows.includes(item.id) ? '#E8760A' : '#FAF8F5',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', margin: '0 auto', transition: 'all 150ms ease'
                            }}
                          >
                            {selectedRows.includes(item.id) && (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4.5"><polyline points="20 6 9 17 4 12" /></svg>
                            )}
                          </div>
                        </td>
                        
                        {/* Vendor name details */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#FAF2EC',
                              border: '1px solid #F3DEC9',
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
                              <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>Vendor ID: {item.vendorId}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category badge */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: item.categoryBg,
                            color: item.categoryColor,
                            border: `1px solid ${item.categoryColor}20`
                          }}>{item.category}</span>
                        </td>

                        {/* Client company */}
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#2A1628', whiteSpace: 'nowrap' }}>
                          {item.client}
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 500, color: '#2A1628' }}>{item.contactName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.45)' }}>{item.contactEmail}</div>
                        </td>

                        {/* Payment terms */}
                        <td style={{ padding: '1rem', color: 'rgba(42,22,40,0.7)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {item.terms}
                        </td>

                        {/* Payment Status badge */}
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            background: item.paymentStatus === 'Paid' ? 'rgba(4, 120, 87, 0.08)'
                              : item.paymentStatus === 'Overdue' ? 'rgba(196, 105, 90, 0.08)'
                              : item.paymentStatus === 'Due Soon' ? 'rgba(184, 137, 42, 0.08)' : 'rgba(42, 22, 40, 0.08)',
                            color: item.paymentStatus === 'Paid' ? '#047857'
                              : item.paymentStatus === 'Overdue' ? '#C4695A'
                              : item.paymentStatus === 'Due Soon' ? '#B8892A' : '#2A1628'
                          }}>{item.paymentStatus}</span>
                        </td>

                        {/* Outstanding amount */}
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: item.isOutRed ? '#C4695A' : '#2A1628', whiteSpace: 'nowrap' }}>
                          {item.outstanding}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, color: '#2A1628' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── PAGINATION FOOTER (SEPARATE BOX) ── */}
            <div style={{
              background: '#FAF8F5',
              border: '1px solid rgba(42,22,40,0.06)',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'rgba(42,22,40,0.6)',
              marginTop: '0.25rem',
              boxShadow: '0 4px 12px rgba(42,22,40,0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Rows per page:</span>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setRowsPerPageOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      border: '1px solid #DDD0C4', borderRadius: '6px',
                      padding: '0.25rem 0.6rem', background: '#fff',
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
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.3, color: '#2A1628', fontSize: '0.75rem', padding: '0.25rem' }}>◀</button>
                <button style={{ background: '#1D0B1A', color: '#fff', border: 'none', borderRadius: '6px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>1</button>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '26px', height: '26px', color: 'rgba(42, 22, 40, 0.4)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>2</button>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '26px', height: '26px', color: 'rgba(42, 22, 40, 0.4)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>3</button>
                <span style={{ color: 'rgba(42, 22, 40, 0.3)', padding: '0 0.1rem', fontSize: '0.75rem' }}>...</span>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '26px', height: '26px', color: 'rgba(42, 22, 40, 0.4)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>25</button>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, color: '#2A1628', fontSize: '0.75rem', padding: '0.25rem' }}>▶</button>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', alignItems: 'stretch', marginTop: '0.5rem' }}>
          
          {/* Vendor Summary Donut Chart */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: '0 0 1rem' }}>Vendor Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeDasharray="100" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E8760A" strokeWidth="3.2" strokeDasharray="78 22" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2A1628', lineHeight: 1 }}>{vendors.length}</div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(42,22,40,0.5)', marginTop: '2px' }}>Total Vendors</div>
                </div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#E8760A', fontWeight: 600 }}>● Active</span> <strong>{vendors.length} (100%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#B8892A', fontWeight: 600 }}>● On Hold</span> <strong>0 (0%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#C4695A', fontWeight: 600 }}>● Inactive</span> <strong>0 (0%)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: 0 }}>Upcoming Payments</h4>
              <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
              {[
                { name: 'Alpha Digital LLC', invoice: 'Invoice #INV-2458', date: 'Due in 2 days', amount: '1,250.00', isOverdue: true },
                { name: 'Tech Connect Solutions', invoice: 'Invoice #INV-2457', date: 'Due in 6 days', amount: '1,250.00', isOverdue: false },
                { name: 'Fast Courier Services', invoice: 'Invoice #INV-2456', date: 'Due in 7 days', amount: '850.00', isOverdue: false }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: idx < 2 ? '1px solid rgba(42,22,40,0.04)' : 'none', paddingBottom: '0.4rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#2A1628' }}>{item.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', marginTop: '0.125rem' }}>{item.invoice}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#2A1628', fontSize: '0.75rem' }}>{item.amount}</div>
                    <div style={{ fontSize: '0.65rem', color: item.isOverdue ? '#C4695A' : '#E8760A', fontWeight: 700, marginTop: '0.125rem' }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendor Categories list */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: 0 }}>Top Categories</h4>
              <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.4)' }}>This Month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
              {[
                { name: 'IT Services', count: '42 Vendors', pct: 85, color: '#E8760A' },
                { name: 'Professional Services', count: '38 Vendors', pct: 75, color: '#E8760A' },
                { name: 'Office Supplies', count: '31 Vendors', pct: 60, color: '#E8760A' }
              ].map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 500 }}>
                    <span style={{ color: 'rgba(42,22,40,0.8)', fontWeight: 600 }}>{cat.name}</span>
                    <span style={{ color: 'rgba(42,22,40,0.5)' }}>{cat.count}</span>
                  </div>
                  <div style={{ height: '6px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Alerts */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(42,22,40,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628', margin: 0 }}>Vendor Alerts</h4>
              <a href="#" style={{ fontSize: '0.7rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}>View All</a>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              {[
                { title: '3 Overdue Payments', desc: 'Total AED 6,480.00', bg: 'rgba(196, 105, 90, 0.08)', border: 'rgba(196, 105, 90, 0.15)', color: '#C4695A', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
                { title: '2 Vendors On Hold', desc: 'Require attention', bg: 'rgba(184, 137, 42, 0.08)', border: 'rgba(184, 137, 42, 0.15)', color: '#B8892A', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> }
              ].map((alert, idx) => (
                <div key={idx} style={{ background: alert.bg, border: `1px solid ${alert.border}`, padding: '0.625rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: alert.color }}>{alert.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: alert.color }}>{alert.title}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', marginTop: '0.125rem' }}>{alert.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── 1. VENDOR CATEGORIES MODAL ── */}
      {categoriesOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '440px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Vendor Categories</h3>
              </div>
              <button onClick={() => setCategoriesOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Manage categorization tokens for tracking billing overheads.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              {['IT Services', 'Office Supplies', 'Rent & Utilities', 'Professional Services', 'Utilities', 'Logistics', 'Marketing', 'Facility Management'].map(c => (
                <div key={c} style={{ padding: '0.5rem 0.75rem', border: '1px solid #DDD0C4', borderRadius: '6px', background: '#FAF8F5', color: '#2A1628', fontWeight: 600 }}>{c}</div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setCategoriesOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. IMPORT VENDORS MODAL ── */}
      {importOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '440px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Import Vendors List</h3>
              </div>
              <button onClick={() => setImportOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)' }}>
              Upload your CSV, XLSX or Google Sheets log to batch import multiple vendor profiles.
            </p>

            <div style={{ border: '2px dashed #DDD0C4', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#FAF8F5' }}>
              <span style={{ fontSize: '0.8125rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>Drag and drop file here, or click to browse</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setImportOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { alert('Import processing initialized!'); setImportOpen(false); }} style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}>Upload File</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. ADD VENDOR MODAL ── */}
      {addOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(42,22,40,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1px solid rgba(42,22,40,0.08)',
            boxShadow: '0 24px 50px rgba(42,22,40,0.12)', width: '100%', maxWidth: '460px',
            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            fontFamily: 'var(--font-sans), Inter, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2A1628' }}>Add New Vendor</h3>
              </div>
              <button onClick={() => setAddOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'rgba(42,22,40,0.4)', padding: 0 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Category */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Category</label>
                <button
                  onClick={() => setAddCatDropdownOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {addForm.category}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {addCatDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['IT Services', 'Office Supplies', 'Rent & Utilities', 'Professional Services', 'Utilities', 'Logistics'].map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          setAddForm({ ...addForm, category: c });
                          setAddCatDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: addForm.category === c ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: addForm.category === c ? 600 : 400
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Company */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Client Company</label>
                <button
                  onClick={() => setAddClientDropdownOpen(o => !o)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0.85rem', border: '1px solid #DDD0C4', borderRadius: '8px',
                    background: '#FAF8F5', color: '#2A1628', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500
                  }}
                >
                  {addForm.client}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {addClientDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    background: '#fff', border: '1px solid #DDD0C4', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(42,22,40,0.1)', zIndex: 110, padding: '4px'
                  }}>
                    {['ABC Trading LLC', 'XYZ Holdings Limited', 'Alpha Tech FZCO', 'Delta Properties FZCO', 'Beta Industries LLC'].map(c => (
                      <div
                        key={c}
                        onClick={() => {
                          setAddForm({ ...addForm, client: c });
                          setAddClientDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#2A1628',
                          cursor: 'pointer', borderRadius: '6px',
                          background: addForm.client === c ? 'rgba(232, 118, 10, 0.06)' : 'transparent',
                          fontWeight: addForm.client === c ? 600 : 400
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Contact Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={addForm.contactName}
                    onChange={e => setAddForm({ ...addForm, contactName: e.target.value })}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Contact Email</label>
                  <input
                    type="text"
                    placeholder="john@example.com"
                    value={addForm.contactEmail}
                    onChange={e => setAddForm({ ...addForm, contactEmail: e.target.value })}
                    style={{ width: '100%', border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.8125rem', background: '#FAF8F5', color: '#2A1628', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setAddOpen(false)} style={{ padding: '0.55rem 1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px', background: '#fff', color: '#2A1628', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button
                onClick={() => {
                  if (!addForm.name) {
                    alert('Please enter vendor name');
                    return;
                  }
                  
                  // Setup initial tags
                  let catColor = '#1E3A8A';
                  let catBg = '#F0F6FC';
                  
                  if (addForm.category === 'Rent & Utilities') {
                    catColor = '#581C87';
                    catBg = '#F3E8FF';
                  } else if (addForm.category === 'Professional Services') {
                    catColor = '#92400E';
                    catBg = '#FEF3C7';
                  }

                  const initials = addForm.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);

                  const newItem: VendorItem = {
                    id: String(vendors.length + 1),
                    vendorId: `VND-00${248 + vendors.length}`,
                    initials: initials || 'VD',
                    avatarBg: '#FAF2EC',
                    name: addForm.name,
                    category: addForm.category,
                    categoryBg: catBg,
                    categoryColor: catColor,
                    client: addForm.client,
                    contactName: addForm.contactName || 'N/A',
                    contactEmail: addForm.contactEmail || 'N/A',
                    terms: addForm.terms,
                    paymentStatus: 'Paid',
                    outstanding: addForm.outstanding,
                    isOutRed: false
                  };

                  setVendors([newItem, ...vendors]);
                  setAddOpen(false);
                }}
                style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2A1628', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(42,22,40,0.15)' }}
              >
                Add Vendor Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
