'use client';

import React, { useState, useEffect } from 'react';
import { get, post } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';

interface SuspenseItem {
  id: string;
  tenant_id: string;
  transaction_id: string;
  suggested_receipt_id: string | null;
  status: string;
  reason_code: string;
  priority: string;
  assigned_user_id: string | null;
  ai_confidence: number;
  notes: string;
  attachments: Attachment[];
  retry_count: number;
  retry_history: Array<{ attempted_at: string; attempted_by: string; outcome: string }>;
  assigned_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  resolution_type: string | null;
  is_escalated: boolean;
  created_at: string;
  updated_at: string;
  transaction_date: string;
  transaction_description: string;
  transaction_reference: string;
  transaction_amount: number;
  transaction_remaining: number;
  suggested_vendor?: string;
  suggested_date?: string;
  suggested_amount?: number;
  suggested_reference?: string;
  age_hours: number;
  is_overdue: boolean;
}

interface Attachment {
  name: string;
  file_key: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  version: number;
  hash: string;
}

interface Metrics {
  open: number;
  under_review: number;
  waiting_client: number;
  critical: number;
  overdue: number;
  resolved_today: number;
  resolved_this_week: number;
  resolved_this_month: number;
  avg_resolution_time_hours: string;
}

interface Receipt {
  id: string;
  vendor_name: string;
  date: string;
  amount: string;
  reference: string;
}

export default function SuspenseWorkspace() {
  const { showToast, showConfirm } = useNotification();

  // Data States
  const [queue, setQueue] = useState<SuspenseItem[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [selectedItem, setSelectedItem] = useState<SuspenseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  // Pagination & Filters
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [reasonCodeFilter, setReasonCodeFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState('');

  // Modals & Action States
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveReceiptId, setResolveReceiptId] = useState('');
  const [resolveAmount, setResolveAmount] = useState('');
  const [resolveType, setResolveType] = useState('MANUAL_MATCH');
  const [resolveReason, setResolveReason] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Mock Upload State
  const [mockFileName, setMockFileName] = useState('');
  const [mockFileSize, setMockFileSize] = useState('');
  const [mockMime, setMockMime] = useState('application/pdf');
  const [submittingAttach, setSubmittingAttach] = useState(false);

  // Fetch metrics & data
  useEffect(() => {
    fetchMetrics();
    fetchQueue();
    fetchReceipts();
  }, [page, statusFilter, priorityFilter, reasonCodeFilter, sortBy, sortOrder]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status: statusFilter,
        priority: priorityFilter,
        reasonCode: reasonCodeFilter,
        dateStart,
        dateEnd,
        amountMin,
        amountMax,
        sortBy,
        sortOrder
      });
      const res = await get<{ success: boolean; data: SuspenseItem[]; pagination: { total: number } }>(
        `/suspense/queue?${params.toString()}`
      );
      if (res?.success) {
        setQueue(res.data || []);
        setTotalItems(res.pagination?.total || 0);
        // Sync selected item detail if open
        if (selectedItem) {
          const fresh = res.data.find((item) => item.id === selectedItem.id);
          if (fresh) setSelectedItem(fresh);
        }
      }
    } catch (err) {
      console.error('[Fetch Suspense Queue Err]', err);
      showToast('Failed to load suspense queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await get<{ success: boolean; data: Metrics }>('/suspense/metrics');
      if (res?.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('[Fetch Metrics Err]', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const res = await get<{ success: boolean; data: Receipt[] }>('/bookkeeping/matching/receipts');
      if (res?.success) {
        setReceipts(res.data || []);
      }
    } catch (err) {
      console.error('[Fetch Receipts Err]', err);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setReasonCodeFilter('');
    setDateStart('');
    setDateEnd('');
    setAmountMin('');
    setAmountMax('');
    setPage(1);
    setTimeout(() => {
      fetchQueue();
      fetchMetrics();
    }, 50);
  };

  // Bulk assign action
  const handleBulkAssign = async () => {
    if (selectedIds.length === 0 || !bulkAssignee) return;
    try {
      const res = await post<any>('/suspense/assign', {
        suspense_ids: selectedIds,
        assignee_id: bulkAssignee
      });
      if (res?.success) {
        showToast(`Successfully assigned ${selectedIds.length} items to ${bulkAssignee}`, 'success');
        setSelectedIds([]);
        setBulkAssignee('');
        fetchQueue();
        fetchMetrics();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to bulk assign items.', 'error');
    }
  };

  // Bulk retry AI matching action
  const handleBulkRetry = async () => {
    if (selectedIds.length === 0) return;
    showConfirm(
      `Are you sure you want to trigger AI retry matching for ${selectedIds.length} items?`,
      async () => {
        try {
          const res = await post<any>('/suspense/retry-match', { suspense_ids: selectedIds });
          if (res?.success) {
            showToast('AI retry matching run triggered.', 'success');
            setSelectedIds([]);
            fetchQueue();
          }
        } catch (err: any) {
          showToast(err.message || 'Bulk AI retry failed.', 'error');
        }
      },
      'Bulk AI Retry Match'
    );
  };

  // Bulk export suspense items
  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    const selectedData = queue.filter((item) => selectedIds.includes(item.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `suspense_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${selectedIds.length} suspense records details.`, 'success');
  };

  // Single Item Actions
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await post<{ success: boolean; data: SuspenseItem }>('/suspense/notes', {
        suspense_id: selectedItem.id,
        notes: newNote
      });
      if (res?.success) {
        showToast('Investigation note appended successfully.', 'success');
        setNewNote('');
        setSelectedItem(res.data);
        fetchQueue();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add note.', 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  // Upload attachment metadata
  const handleAttachMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !mockFileName) return;

    setSubmittingAttach(true);
    try {
      const res = await post<{ success: boolean; data: SuspenseItem }>('/suspense/attach', {
        suspense_id: selectedItem.id,
        name: mockFileName,
        file_key: `uploads/suspense/${selectedItem.id}/${mockFileName}`,
        file_size: mockFileSize ? parseInt(mockFileSize, 10) : 102450,
        mime_type: mockMime,
        version: 1,
        hash: 'sha256_' + Math.random().toString(36).substring(7)
      });
      if (res?.success) {
        showToast('Supporting file document attached and audited.', 'success');
        setMockFileName('');
        setMockFileSize('');
        setSelectedItem(res.data);
        fetchQueue();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to attach document.', 'error');
    } finally {
      setSubmittingAttach(false);
    }
  };

  // Single Retry AI match
  const handleSingleRetry = async (id: string) => {
    try {
      const res = await post<any>('/suspense/retry-match', { suspense_ids: [id] });
      if (res?.success) {
        showToast('AI retry match complete.', 'success');
        fetchQueue();
      }
    } catch (err: any) {
      showToast(err.message || 'AI retry match failed.', 'error');
    }
  };

  // Single Retry Reconciliation
  const handleSingleRetryReconcile = async (id: string) => {
    try {
      const res = await post<any>('/suspense/retry-reconcile', { suspense_ids: [id] });
      if (res?.success) {
        showToast('High-confidence AI retry auto-reconciled successfully!', 'success');
        setSelectedItem(null);
        fetchQueue();
        fetchMetrics();
      }
    } catch (err: any) {
      showToast(err.message || 'Auto reconciliation retry failed (threshold score not satisfied).', 'warning');
    }
  };

  // Resolve suspense item
  const handleResolveSuspense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !resolveReceiptId || !resolveReason.trim()) return;

    setSubmittingResolve(true);
    try {
      const res = await post<any>('/suspense/resolve', {
        suspense_id: selectedItem.id,
        receipt_id: resolveReceiptId,
        allocated_amount: resolveAmount ? parseFloat(resolveAmount) : undefined,
        resolution_type: resolveType,
        override_reason: resolveReason
      });
      if (res?.success) {
        showToast('Suspense item resolved manually and updated in ledger.', 'success');
        setShowResolveModal(false);
        setResolveReceiptId('');
        setResolveAmount('');
        setResolveReason('');
        setSelectedItem(null);
        fetchQueue();
        fetchMetrics();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve suspense.', 'error');
    } finally {
      setSubmittingResolve(false);
    }
  };

  // Close item
  const handleCloseSuspense = async (id: string) => {
    try {
      const res = await post<any>('/suspense/close', { suspense_id: id });
      if (res?.success) {
        showToast('Suspense item closed successfully.', 'success');
        setSelectedItem(null);
        fetchQueue();
        fetchMetrics();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to close item. Verify status is Resolved.', 'error');
    }
  };

  // Archive / Soft Delete
  const handleArchiveSuspense = async (id: string) => {
    showConfirm(
      'Are you sure you want to ARCHIVE this suspense item? It will be archived and soft-deleted from the active list.',
      async () => {
        try {
          const res = await post<any>('/suspense/delete', { suspense_id: id });
          if (res?.success) {
            showToast('Suspense item archived successfully.', 'success');
            setSelectedItem(null);
            fetchQueue();
            fetchMetrics();
          }
        } catch (err: any) {
          showToast(err.message || 'Failed to archive suspense item.', 'error');
        }
      },
      'Archive Suspense Record'
    );
  };

  // Helper styles
  const priorityStyle = (p: string) => {
    const s = p.toUpperCase();
    const style: React.CSSProperties = {
      padding: '0.15rem 0.4rem',
      borderRadius: '4px',
      fontSize: '0.6rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      display: 'inline-block'
    };
    if (s === 'CRITICAL') return { ...style, background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2' };
    if (s === 'HIGH') return { ...style, background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' };
    if (s === 'MEDIUM') return { ...style, background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' };
    return { ...style, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
  };

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    const style: React.CSSProperties = {
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.65rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      display: 'inline-block'
    };
    if (s === 'OPEN') return { ...style, background: '#fef3c7', color: '#d97706' };
    if (s === 'UNDER REVIEW') return { ...style, background: '#dbeafe', color: '#2563eb' };
    if (s === 'WAITING FOR CLIENT' || s === 'WAITING') return { ...style, background: '#fce7f3', color: '#db2777' };
    if (s === 'RESOLVED') return { ...style, background: '#d1fae5', color: '#059669' };
    return { ...style, background: '#e5e7eb', color: '#374151' }; // Closed
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', marginTop: '1.5rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06)' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            Stage 6: Suspense Handling Workspace
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
            Track unresolved entries, SLA age indicators, document uploads, and manual resolutions.
          </p>
        </div>
      </div>

      {/* DASHBOARD METRICS CARDS */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Open Suspense', value: metrics.open, color: '#d97706' },
            { label: 'Under Review', value: metrics.under_review, color: '#2563eb' },
            { label: 'Waiting Client', value: metrics.waiting_client, color: '#db2777' },
            { label: 'Critical Items', value: metrics.critical, color: '#ef4444', isCritical: true },
            { label: 'Overdue SLA (>48h)', value: metrics.overdue, color: '#ea580c' },
            { label: 'Resolved Today/W/M', value: `${metrics.resolved_today}/${metrics.resolved_this_week}/${metrics.resolved_this_month}`, color: '#059669' }
          ].map((card, idx) => (
            <div key={idx} style={{
              background: card.isCritical && card.value > 0 ? '#fef2f2' : '#F6F2EE',
              border: `1.5px solid ${card.isCritical && card.value > 0 ? '#ef4444' : 'rgba(42,22,40,0.06)'}`,
              borderRadius: '8px',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{card.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', background: '#Fbf8f5', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.06)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by transaction description, notes, reason code or assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchQueue()}
              style={{ width: '100%', height: '38px', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0 0.75rem 0 2.2rem', fontSize: '0.8rem', background: '#fff' }}
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,22,40,0.4)" strokeWidth="2.5" style={{ position: 'absolute', left: '0.75rem', top: '12px' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            onClick={() => fetchQueue()}
            style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 1.25rem', height: '38px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
          >
            SEARCH
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ background: '#fff', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0 1rem', height: '38px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            FILTERS
          </button>
          <button
            onClick={handleResetFilters}
            style={{ background: 'transparent', color: 'rgba(42,22,40,0.6)', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            RESET
          </button>
        </div>

        {/* EXPANDABLE FILTERS */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #DDD0C4' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.4rem', background: '#fff' }}>
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Waiting for Client">Waiting for Client</option>
                <option value="AI Retry Pending">AI Retry Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.4rem', background: '#fff' }}>
                <option value="">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Reason Code</label>
              <select value={reasonCodeFilter} onChange={(e) => setReasonCodeFilter(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.4rem', background: '#fff' }}>
                <option value="">All Reasons</option>
                <option value="NO_MATCH_FOUND">No Match Found</option>
                <option value="LOW_AI_CONFIDENCE">Low AI Confidence</option>
                <option value="DUPLICATE_INVOICE">Duplicate Invoice</option>
                <option value="DUPLICATE_TRANSACTION">Duplicate Transaction</option>
                <option value="AMOUNT_MISMATCH">Amount Mismatch</option>
                <option value="DATE_MISMATCH">Date Mismatch</option>
                <option value="VENDOR_MISMATCH">Vendor Mismatch</option>
                <option value="INVALID_RECEIPT">Invalid Receipt</option>
                <option value="MANUAL_REVIEW">Manual Review</option>
                <option value="CLIENT_DOCUMENT_REQUIRED">Client Document Required</option>
                <option value="SYSTEM_ERROR">System Error</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Min Amount</label>
              <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="Min..." style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.5rem', background: '#fff' }} />
            </div>
          </div>
        )}

        {/* SORTING ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(42,22,40,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>SORT BY:</span>
            {['created_at', 'date', 'amount', 'priority', 'status'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (sortBy === s) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(s);
                    setSortOrder('desc');
                  }
                }}
                style={{
                  background: sortBy === s ? '#EDE6DE' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: sortBy === s ? '#2A1628' : 'rgba(42,22,40,0.6)'
                }}
              >
                {s.toUpperCase()} {sortBy === s ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>Found: {totalItems} items</span>
        </div>
      </div>

      {/* BULK OPERATIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#2A1628', color: '#fff', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedIds.length} item(s) selected</span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={bulkAssignee}
              onChange={(e) => setBulkAssignee(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', border: 'none', background: '#fff', color: '#2A1628' }}
            >
              <option value="">-- Assign To --</option>
              <option value="acc_expert@firm.com">acc_expert@firm.com</option>
              <option value="senior_bookkeeper@firm.com">senior_bookkeeper@firm.com</option>
              <option value="compliance_lead@firm.com">compliance_lead@firm.com</option>
            </select>
            <button onClick={handleBulkAssign} style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              BULK ASSIGN
            </button>
            <button onClick={handleBulkRetry} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              BULK RETRY MATCH
            </button>
            <button onClick={handleBulkExport} style={{ background: '#3D2040', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              EXPORT JSON
            </button>
            <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.7rem', cursor: 'pointer' }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* SUSPENSE QUEUE LIST TABLE */}
      <div style={{ border: '1px solid rgba(42,22,40,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ background: '#F6F2EE', borderBottom: '1px solid #DDD0C4', color: '#2A1628', fontWeight: 700 }}>
              <th style={{ padding: '0.75rem', width: '30px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === queue.length}
                  onChange={() => {
                    if (selectedIds.length === queue.length) setSelectedIds([]);
                    else setSelectedIds(queue.map((q) => q.id));
                  }}
                />
              </th>
              <th style={{ padding: '0.75rem' }}>Priority</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Bank Transaction</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.75rem' }}>Reason Code</th>
              <th style={{ padding: '0.75rem' }}>Assignee</th>
              <th style={{ padding: '0.75rem' }}>Age</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(42,22,40,0.5)' }}>Loading suspense records...</td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(42,22,40,0.5)' }}>No items in the suspense queue.</td>
              </tr>
            ) : (
              queue.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isRowChecked = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      borderBottom: '1px solid rgba(42,22,40,0.06)',
                      background: isSelected ? '#EDE6DE' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background 200ms'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isRowChecked}
                        onChange={() => {
                          setSelectedIds((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          );
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={priorityStyle(item.priority)}>{item.priority}</span>
                      {item.is_escalated && (
                        <span style={{ fontSize: '0.55rem', background: '#ef4444', color: '#fff', padding: '0.1rem 0.25rem', borderRadius: '3px', marginLeft: '0.25rem', fontWeight: 700 }}>
                          ESCALATED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={statusBadge(item.status)}>{item.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#2A1628' }}>{item.transaction_description}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Ref: {item.transaction_reference || 'N/A'} | Date: {new Date(item.transaction_date).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#E8760A' }}>
                      AED {item.transaction_amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      {item.reason_code}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'rgba(42,22,40,0.7)' }}>
                      {item.assigned_user_id || '- Unassigned -'}
                    </td>
                    <td style={{ padding: '0.75rem', color: item.is_overdue ? '#ef4444' : '#4b5563', fontWeight: item.is_overdue ? 700 : 500 }}>
                      {item.age_hours.toFixed(1)}h {item.is_overdue ? '(SLA Overdue)' : ''}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{ background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
          >
            PREV
          </button>
          <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{ background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
          >
            NEXT
          </button>
        </div>
      )}

      {/* DETAIL ACTION DRAWER */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 110, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '600px', background: '#fff', height: '100%', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #DDD0C4', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#2A1628', letterSpacing: '0.05em' }}>
                  Suspense Record Details
                </h3>
                <span style={{ fontSize: '0.62rem', color: 'rgba(42,22,40,0.5)' }}>ID: {selectedItem.id}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
              {/* Transaction details card */}
              <div style={{ background: '#F6F2EE', padding: '0.85rem', borderRadius: '8px', border: '1px solid #DDD0C4' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(42,22,40,0.5)', fontWeight: 700, marginBottom: '0.25rem' }}>Suspended Bank Transaction</div>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#2A1628', fontWeight: 800 }}>{selectedItem.transaction_description}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem', color: '#2A1628', fontWeight: 600 }}>
                  <div>Date: {new Date(selectedItem.transaction_date).toLocaleDateString()}</div>
                  <div style={{ color: '#E8760A' }}>Amount: AED {selectedItem.transaction_amount.toFixed(2)}</div>
                  <div>Reference: {selectedItem.transaction_reference || 'N/A'}</div>
                  <div>Status: <span style={statusBadge(selectedItem.status)}>{selectedItem.status}</span></div>
                </div>
              </div>

              {/* suggested invoice */}
              {selectedItem.suggested_receipt_id && (
                <div style={{ border: '1px solid #10b981', background: 'rgba(16,185,129,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#065f46', fontWeight: 700, marginBottom: '0.25rem' }}>AI Suggested Receipt Match ({Math.round(selectedItem.ai_confidence * 100)}%)</div>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#2A1628', fontWeight: 700 }}>{selectedItem.suggested_vendor}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem', color: '#2A1628', fontWeight: 600 }}>
                    <div>Date: {selectedItem.suggested_date ? new Date(selectedItem.suggested_date).toLocaleDateString() : 'N/A'}</div>
                    <div>Amount: AED {selectedItem.suggested_amount ? parseFloat(selectedItem.suggested_amount.toString()).toFixed(2) : 'N/A'}</div>
                    <div>Ref No: {selectedItem.suggested_reference || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Assignment controller */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#Fbf8f5', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(42,22,40,0.05)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2A1628' }}>ASSIGN ACTION:</span>
                <select
                  value={selectedItem.assigned_user_id || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      post('/suspense/assign', { suspense_ids: [selectedItem.id], assignee_id: e.target.value }).then((res: any) => {
                        if (res?.success) {
                          showToast('Item assigned successfully.', 'success');
                          fetchQueue();
                        }
                      });
                    }
                  }}
                  style={{ flex: 1, padding: '0.35rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                >
                  <option value="">-- Assign Accountant --</option>
                  <option value="acc_expert@firm.com">acc_expert@firm.com</option>
                  <option value="senior_bookkeeper@firm.com">senior_bookkeeper@firm.com</option>
                  <option value="compliance_lead@firm.com">compliance_lead@firm.com</option>
                </select>
              </div>

              {/* Action buttons (Retry, Resolve, Close, soft-delete) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSingleRetry(selectedItem.id)}
                  disabled={selectedItem.retry_count >= 3}
                  style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.45rem 0', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', opacity: selectedItem.retry_count >= 3 ? 0.5 : 1 }}
                >
                  RETRY MATCH ({selectedItem.retry_count}/3)
                </button>
                <button
                  onClick={() => handleSingleRetryReconcile(selectedItem.id)}
                  style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.45rem 0', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  RETRY RECONCILE (AUTO)
                </button>
                <button
                  onClick={() => {
                    setResolveAmount(selectedItem.transaction_remaining.toString());
                    setShowResolveModal(true);
                  }}
                  style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.45rem 0', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  RESOLVE WORKFLOW
                </button>
                {selectedItem.status === 'Resolved' && (
                  <button
                    onClick={() => handleCloseSuspense(selectedItem.id)}
                    style={{ background: '#3D2040', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.45rem 0', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    CLOSE SUSPENSE
                  </button>
                )}
                <button
                  onClick={() => handleArchiveSuspense(selectedItem.id)}
                  style={{ gridColumn: 'span 2', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0.4rem 0', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ARCHIVE / SOFT DELETE RECORD
                </button>
              </div>

              {/* Attachments panel */}
              <div style={{ border: '1px solid rgba(42,22,40,0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#2A1628' }}>Supporting Documents Attached</h5>
                {selectedItem.attachments && selectedItem.attachments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {selectedItem.attachments.map((att, idx) => (
                      <div key={idx} style={{ background: '#F6F2EE', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#2A1628' }}>{att.name}</div>
                          <div style={{ color: 'rgba(42,22,40,0.5)', fontSize: '0.55rem' }}>Uploaded by: {att.uploaded_by} | Size: {(att.file_size / 1024).toFixed(1)} KB</div>
                        </div>
                        <a href={`/api/files/download?key=${encodeURIComponent(att.file_key)}`} target="_blank" rel="noreferrer" style={{ color: '#E8760A', fontWeight: 700, textDecoration: 'none' }}>
                          VIEW
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', fontStyle: 'italic', margin: '0 0 0.75rem' }}>No documents attached.</p>
                )}

                {/* Upload Form */}
                <form onSubmit={handleAttachMock} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Attach invoice / bank advice file name..."
                    value={mockFileName}
                    onChange={(e) => setMockFileName(e.target.value)}
                    required
                    style={{ flex: 1, padding: '0.35rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                  />
                  <input
                    type="number"
                    placeholder="Size"
                    value={mockFileSize}
                    onChange={(e) => setMockFileSize(e.target.value)}
                    style={{ width: '60px', padding: '0.35rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                  />
                  <button type="submit" disabled={submittingAttach} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 0.60rem', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
                    ATTACH
                  </button>
                </form>
              </div>

              {/* Notes logs timeline */}
              <div style={{ border: '1px solid rgba(42,22,40,0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#2A1628' }}>Investigation Notes Timeline</h5>
                <div style={{ background: '#Fbf8f5', padding: '0.6rem', borderRadius: '6px', fontSize: '0.68rem', whiteSpace: 'pre-line', color: '#2A1628', maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(42,22,40,0.04)', marginBottom: '0.75rem' }}>
                  {selectedItem.notes || 'No log messages.'}
                </div>
                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Log a new notes entry here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    required
                    style={{ flex: 1, padding: '0.35rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                  />
                  <button type="submit" disabled={submittingNote} style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 0.75rem', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
                    LOG NOTE
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION DIALOG MODAL */}
      {showResolveModal && selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '480px', border: '1px solid #DDD0C4', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628' }}>
              Resolve Suspense Workflow Link
            </h3>
            <form onSubmit={handleResolveSuspense} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Resolution Type</label>
                <select
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', background: '#fff' }}
                >
                  <option value="MANUAL_MATCH">Manual Match (Linked Invoice)</option>
                  <option value="CLIENT_DOCUMENT">Client Document Linked</option>
                  <option value="WRITE_OFF">Write Off Expense</option>
                  <option value="DUPLICATE">Duplicate Void</option>
                  <option value="OTHER">Other Resolution</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Select Match Receipt Invoice</label>
                <select
                  value={resolveReceiptId}
                  onChange={(e) => setResolveReceiptId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', background: '#fff' }}
                >
                  <option value="">-- Choose matching receipt --</option>
                  {receipts.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.vendor_name} ({new Date(r.date).toLocaleDateString()}) — AED {parseFloat(r.amount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Allocation Amount (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={resolveAmount}
                  onChange={(e) => setResolveAmount(e.target.value)}
                  placeholder={`Default: ${selectedItem.transaction_remaining}`}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Override reason justification</label>
                <input
                  type="text"
                  placeholder="Reason for manual linkage..."
                  value={resolveReason}
                  onChange={(e) => setResolveReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingResolve}
                  style={{ flex: 1, background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingResolve ? 'RESOLVING...' : 'APPLY RESOLUTION'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  style={{ flex: 1, background: '#fff', border: '1px solid #DDD0C4', color: '#2A1628', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
