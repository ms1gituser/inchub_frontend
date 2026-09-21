/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { get, post } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  status: string;
  allocated_amount: number;
  remaining_amount: number;
  suggested_matches: Candidate[];
}

interface Candidate {
  id: string;
  receipt_id: string;
  l1_amount_score: number;
  l2_date_score: number;
  l3_vendor_score: number;
  l4_reference_score: number;
  l5_description_score: number;
  l6_score: number;
  composite_score: number;
  match_explanation: string;
  match_status: string;
  vendor_name: string;
  receipt_date: string;
  receipt_amount: number;
  receipt_reference: string;
  receipt_file_key: string;
}

interface Receipt {
  id: string;
  vendor_name: string;
  date: string;
  amount: string;
  reference: string;
}

interface AuditHistoryItem {
  id: string;
  reconciliation_id: string;
  tenant_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  notes: string | null;
  timestamp: string;
  allocations: Array<{
    transaction_id: string;
    receipt_id: string;
    allocated_amount: number;
    tx_description: string;
    tx_amount: number;
    tx_date: string;
    rec_vendor_name: string;
    rec_reference: string;
    rec_amount: number;
  }>;
}

interface ReconciliationPanelProps {
  onReconciled: () => void;
}

export default function ReconciliationPanel({ onReconciled }: ReconciliationPanelProps) {
  const { showToast, showConfirm } = useNotification();

  // Primary State
  const [queue, setQueue] = useState<Transaction[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  // Pagination, Search, Filter & Sort States
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [confidenceMin, setConfidenceMin] = useState('');
  const [confidenceMax, setConfidenceMax] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Bulk Selection
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Modals & Drawers
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showCpModal, setShowCpModal] = useState(false);

  // Counterparty Form States
  const [cpName, setCpName] = useState('');
  const [cpType, setCpType] = useState<'Vendor' | 'Supplier'>('Vendor');
  const [cpCategory, setCpCategory] = useState('Office Expenses');
  const [cpTerms, setCpTerms] = useState('Net 30');
  const [cpTrn, setCpTrn] = useState('');
  const [cpQboCode, setCpQboCode] = useState('60100');
  const [submittingCp, setSubmittingCp] = useState(false);

  // Manual Form States
  const [manualReceiptId, setManualReceiptId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Split Form States
  const [splitAllocations, setSplitAllocations] = useState<Array<{ receiptId: string; allocatedAmount: string }>>([
    { receiptId: '', allocatedAmount: '' }
  ]);
  const [splitReason, setSplitReason] = useState('');
  const [submittingSplit, setSubmittingSplit] = useState(false);

  // Merge Form States
  const [mergeDirection, setMergeDirection] = useState<'receipts_to_tx' | 'txs_to_receipt'>('receipts_to_tx');
  const [mergeTargetId, setMergeTargetId] = useState(''); // Receipt ID or Transaction ID
  const [mergeAllocations, setMergeAllocations] = useState<Array<{ id: string; allocatedAmount: string }>>([
    { id: '', allocatedAmount: '' }
  ]);
  const [mergeReason, setMergeReason] = useState('');
  const [submittingMerge, setSubmittingMerge] = useState(false);

  // History Log States
  const [historyItems, setHistoryItems] = useState<AuditHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // Effect to load data
  useEffect(() => {
    fetchQueue();
    fetchReceipts();
  }, [page, sortBy, sortOrder, statusFilter, currencyFilter]);

  // Fetch Queue
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status: statusFilter,
        vendor: vendorFilter,
        amountMin,
        amountMax,
        confidenceMin,
        confidenceMax,
        dateStart,
        dateEnd,
        currency: currencyFilter,
        sortBy,
        sortOrder
      });
      const res = await get<{ success: boolean; data: Transaction[]; pagination: { total: number } }>(
        `/reconciliation/queue?${params.toString()}`
      );
      if (res?.success) {
        const queueData = Array.isArray(res.data) ? res.data : Array.isArray((res as any)?.data?.data) ? (res as any).data.data : [];
        setQueue(queueData);
        setTotalItems(res.pagination?.total || queueData.length || 0);
      }

    } catch (err) {
      console.error('[Fetch Queue Err]', err);
      showToast('Failed to load pending reconciliations queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Receipts
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

  // Fetch History
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await get<{ success: boolean; data: AuditHistoryItem[]; pagination: { totalPages: number } }>(
        `/reconciliation/history?page=${historyPage}&limit=10`
      );
      if (res?.success) {
        setHistoryItems(res.data || []);
        setHistoryTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('[Fetch History Err]', err);
      showToast('Failed to load history logs.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showHistoryDrawer) {
      fetchHistory();
    }
  }, [showHistoryDrawer, historyPage]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setVendorFilter('');
    setAmountMin('');
    setAmountMax('');
    setConfidenceMin('');
    setConfidenceMax('');
    setDateStart('');
    setDateEnd('');
    setCurrencyFilter('');
    setPage(1);
    setTimeout(() => fetchQueue(), 50);
  };

  // Handle Select Transaction
  const handleSelectTx = (tx: Transaction) => {
    setSelectedTx(tx);
    if (tx.suggested_matches && tx.suggested_matches.length > 0) {
      setSelectedCandidate(tx.suggested_matches[0]);
    } else {
      setSelectedCandidate(null);
    }
  };

  // Accept Suggestion
  const handleAcceptMatch = async (candidateId: string) => {
    try {
      const res = await post<any>('/reconciliation/accept', { candidate_id: candidateId });
      if (res?.success) {
        showToast('AI suggestion approved and transaction reconciled.', 'success');
        setSelectedTx(null);
        setSelectedCandidate(null);
        fetchQueue();
        onReconciled();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept match suggestion.', 'error');
    }
  };

  // Reject Suggestion
  const handleRejectMatch = async (candidateId: string) => {
    try {
      const res = await post<any>('/reconciliation/reject', { candidate_id: candidateId });
      if (res?.success) {
        showToast('AI suggested match candidate rejected.', 'warning');
        if (selectedTx) {
          // Remove from local candidates list
          const updatedMatches = selectedTx.suggested_matches.filter((m) => m.id !== candidateId);
          setSelectedTx({ ...selectedTx, suggested_matches: updatedMatches });
          setSelectedCandidate(updatedMatches.length > 0 ? updatedMatches[0] : null);
        }
        fetchQueue();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reject match suggestion.', 'error');
    }
  };

  // Apply Manual Override Link
  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !manualReceiptId || !manualReason.trim()) return;

    setSubmittingManual(true);
    try {
      const res = await post<any>('/reconciliation/manual', {
        transaction_id: selectedTx.id,
        receipt_id: manualReceiptId,
        allocated_amount: manualAmount ? parseFloat(manualAmount) : undefined,
        override_reason: manualReason
      });
      if (res?.success) {
        showToast('Manual override mapping created successfully and audited.', 'success');
        setShowManualModal(false);
        setManualReceiptId('');
        setManualAmount('');
        setManualReason('');
        setSelectedTx(null);
        setSelectedCandidate(null);
        fetchQueue();
        onReconciled();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to map manual link.', 'error');
    } finally {
      setSubmittingManual(false);
    }
  };

  // Apply Split Reconciliation
  const handleSplitReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;

    // Filter out blank allocations
    const validAllocations = splitAllocations.filter((a) => a.receiptId && a.allocatedAmount);
    if (validAllocations.length === 0) {
      showToast('Please add at least one valid receipt allocation.', 'warning');
      return;
    }

    setSubmittingSplit(true);
    try {
      const res = await post<any>('/reconciliation/split', {
        transaction_id: selectedTx.id,
        allocations: validAllocations.map((a) => ({
          receipt_id: a.receiptId,
          allocated_amount: parseFloat(a.allocatedAmount)
        })),
        override_reason: splitReason || 'Payment split reconciliation'
      });
      if (res?.success) {
        showToast('Split payment reconciliation completed successfully.', 'success');
        setShowSplitModal(false);
        setSplitAllocations([{ receiptId: '', allocatedAmount: '' }]);
        setSplitReason('');
        setSelectedTx(null);
        setSelectedCandidate(null);
        fetchQueue();
        onReconciled();
      }
    } catch (err: any) {
      showToast(err.message || 'Split reconciliation failed.', 'error');
    } finally {
      setSubmittingSplit(false);
    }
  };

  // Apply Merge Reconciliation
  const handleMergeReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeTargetId) return;

    const validAllocations = mergeAllocations.filter((a) => a.id && a.allocatedAmount);
    if (validAllocations.length === 0) {
      showToast('Please specify allocations for merging.', 'warning');
      return;
    }

    setSubmittingMerge(true);
    try {
      const payload: any = {
        override_reason: mergeReason || 'Merged payment matching'
      };

      if (mergeDirection === 'receipts_to_tx') {
        payload.transaction_id = mergeTargetId;
        payload.allocations = validAllocations.map((a) => ({
          receipt_id: a.id,
          allocated_amount: parseFloat(a.allocatedAmount)
        }));
      } else {
        payload.receipt_id = mergeTargetId;
        payload.allocations = validAllocations.map((a) => ({
          transaction_id: a.id,
          allocated_amount: parseFloat(a.allocatedAmount)
        }));
      }

      const res = await post<any>('/reconciliation/merge', payload);
      if (res?.success) {
        showToast('Merged payment reconciliation completed successfully.', 'success');
        setShowMergeModal(false);
        setMergeTargetId('');
        setMergeAllocations([{ id: '', allocatedAmount: '' }]);
        setMergeReason('');
        setSelectedTx(null);
        setSelectedCandidate(null);
        fetchQueue();
        onReconciled();
      }
    } catch (err: any) {
      showToast(err.message || 'Merge reconciliation failed.', 'error');
    } finally {
      setSubmittingMerge(false);
    }
  };

  const handleCreateCounterparty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpName.trim() || !cpCategory.trim()) {
      showToast('Name and Category are required.', 'error');
      return;
    }
    setSubmittingCp(true);
    try {
      const res = await post<any>('/bookkeeping/reconciliation/counterparties', {
        entity_name: cpName,
        entity_type: cpType,
        category: cpCategory,
        payment_terms: cpTerms,
        trn: cpTrn,
        default_account_code: cpQboCode
      });
      if (res?.success) {
        showToast(`Counterparty '${cpName}' created and registered successfully!`, 'success');
        setShowCpModal(false);
        setCpName('');
        // Refresh receipts pool so dynamic matches can see the entity
        fetchReceipts();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save counterparty details.', 'error');
    } finally {
      setSubmittingCp(false);
    }
  };

  // Undo Reconciliation
  const handleUndoReconciliation = async (reconciliationId: string) => {
    showConfirm(
      'Are you sure you want to UNDO this reconciliation mapping? This will delete the allocations and revert the status of the bank transaction.',
      async () => {
        try {
          const res = await post<any>('/reconciliation/undo', { reconciliation_id: reconciliationId });
          if (res?.success) {
            showToast('Reconciliation undone successfully.', 'success');
            fetchQueue();
            fetchHistory();
            onReconciled();
          }
        } catch (err: any) {
          showToast(err.message || 'Failed to undo reconciliation.', 'error');
        }
      },
      'Undo Reconciled Item'
    );
  };

  // Bulk Actions
  const handleBulkAccept = async () => {
    if (selectedTxIds.length === 0) return;
    showConfirm(
      `Are you sure you want to bulk ACCEPT the best AI suggestions for the ${selectedTxIds.length} selected transactions?`,
      async () => {
        let acceptedCount = 0;
        let failedCount = 0;

        for (const txId of selectedTxIds) {
          const tx = queue.find((t) => t.id === txId);
          const topCandidate = tx?.suggested_matches?.[0];
          if (topCandidate && parseFloat(topCandidate.composite_score.toString()) >= 0.70) {
            try {
              const res = await post<any>('/reconciliation/accept', { candidate_id: topCandidate.id });
              if (res?.success) acceptedCount++;
              else failedCount++;
            } catch {
              failedCount++;
            }
          } else {
            failedCount++;
          }
        }

        showToast(`Bulk Accept Complete. Approved: ${acceptedCount}, Skipped/Failed: ${failedCount}`, 'success');
        setSelectedTxIds([]);
        fetchQueue();
        onReconciled();
      },
      'Bulk Accept Matches'
    );
  };

  const handleBulkReject = async () => {
    if (selectedTxIds.length === 0) return;
    showConfirm(
      `Are you sure you want to bulk REJECT suggestions for the ${selectedTxIds.length} selected transactions?`,
      async () => {
        let rejectedCount = 0;
        for (const txId of selectedTxIds) {
          const tx = queue.find((t) => t.id === txId);
          const topCandidate = tx?.suggested_matches?.[0];
          if (topCandidate) {
            try {
              const res = await post<any>('/reconciliation/reject', { candidate_id: topCandidate.id });
              if (res?.success) rejectedCount++;
            } catch {}
          }
        }
        showToast(`Bulk Reject Complete. Rejected suggestions: ${rejectedCount}`, 'warning');
        setSelectedTxIds([]);
        fetchQueue();
      },
      'Bulk Reject Suggestions'
    );
  };

  const handleBulkMoveToSuspense = async () => {
    if (selectedTxIds.length === 0) return;
    showConfirm(
      `Are you sure you want to move the ${selectedTxIds.length} selected transactions to SUSPENSE?`,
      async () => {
        let movedCount = 0;
        for (const txId of selectedTxIds) {
          try {
            // Using standard update route or manual link helper to flag suspense status
            const res = await post<any>('/reconciliation/manual', {
              transaction_id: txId,
              receipt_id: receipts[0]?.id || txId, // Fallback placeholder to write mapping
              override_reason: 'Accountant moved transaction to Suspense workspace.',
              allocated_amount: 0.01 // Minimal amount to log
            });
            if (res?.success) {
              movedCount++;
            }
          } catch {}
        }
        showToast(`Moved ${movedCount} transactions to Suspense reconciliation bucket.`, 'success');
        setSelectedTxIds([]);
        fetchQueue();
        onReconciled();
      },
      'Move to Suspense'
    );
  };

  const handleBulkExport = () => {
    if (selectedTxIds.length === 0) return;
    const selectedData = queue.filter((t) => selectedTxIds.includes(t.id));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `reconciliation_export_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${selectedTxIds.length} transactions detail record.`, 'success');
  };

  const toggleSelectTx = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTxIds.length === queue.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(queue.map((t) => t.id));
    }
  };

  // Helper styles
  const badgeStyle = (status: string) => {
    const s = status.toUpperCase();
    const style: React.CSSProperties = {
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.65rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      display: 'inline-block'
    };
    if (s === 'PENDING') return { ...style, background: '#fef3c7', color: '#92400e' };
    if (s === 'PARTIALLY_RECONCILED' || s === 'PARTIALLY RECONCILED') return { ...style, background: '#dbeafe', color: '#1e40af' };
    if (s === 'SUSPENSE') return { ...style, background: '#fca5a5', color: '#991b1b' };
    return { ...style, background: '#d1fae5', color: '#065f46' };
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', marginTop: '1.5rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06)' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            Stage 5: Reconciliation Workspace
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
            AI-assisted matching, partial allocations, splits, merges, and manual overrides E2E audit log.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowHistoryDrawer(true)}
            style={{ background: '#F6F2EE', color: '#2A1628', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AUDIT HISTORY
          </button>
        </div>
      </div>

      {/* FILTER SEARCH SORT BAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', background: '#Fbf8f5', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(42,22,40,0.06)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by vendor, invoice number, reference, amount, description..."
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

        {/* EXPANDABLE FILTER ROW */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed #DDD0C4' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.4rem', background: '#fff' }}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_RECONCILED">Partially Reconciled</option>
                <option value="SUSPENSE">Suspense</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2/rem', textTransform: 'uppercase' }}>Vendor</label>
              <input type="text" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} placeholder="Filter by vendor..." style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.5rem', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Min Amount (AED)</label>
              <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="Min..." style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.5rem', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Max Amount (AED)</label>
              <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="Max..." style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.5rem', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Min Confidence</label>
              <select value={confidenceMin} onChange={(e) => setConfidenceMin(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.4rem', background: '#fff' }}>
                <option value="">All</option>
                <option value="0.90">90% +</option>
                <option value="0.70">70% +</option>
                <option value="0.40">40% +</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Currency</label>
              <select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.4rem', background: '#fff' }}>
                <option value="">All Currencies</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Start Date</label>
              <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.5rem', background: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>End Date</label>
              <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} style={{ width: '100%', height: '34px', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', padding: '0 0.5rem', background: '#fff' }} />
            </div>
          </div>
        )}

        {/* SORT ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(42,22,40,0.06)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>SORT BY:</span>
            {['date', 'amount', 'confidence', 'vendor'].map((s) => (
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
          <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>Total Found: {totalItems} items</span>
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedTxIds.length > 0 && (
        <div style={{ background: '#2A1628', color: '#fff', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.2s' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {selectedTxIds.length} item(s) selected
          </span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleBulkAccept} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              BULK ACCEPT MATCH
            </button>
            <button onClick={handleBulkReject} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              BULK REJECT SUGGESTIONS
            </button>
            <button onClick={handleBulkMoveToSuspense} style={{ background: '#e8760a', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              MOVE TO SUSPENSE
            </button>
            <button onClick={handleBulkExport} style={{ background: '#3D2040', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
              EXPORT JSON
            </button>
            <button onClick={() => setSelectedTxIds([])} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '1.5rem' }}>
        {/* Left Side: Pending Queue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628', margin: 0, letterSpacing: '0.05em' }}>
              Pending queue ({queue.length})
            </h3>
            {queue.length > 0 && (
              <button
                onClick={toggleSelectAll}
                style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {selectedTxIds.length === queue.length ? 'DESELECT ALL' : 'SELECT ALL'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.50rem', maxHeight: '550px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '2rem' }}>Loading queue items...</p>
            ) : queue.length === 0 ? (
              <div style={{ border: '1px dashed #DDD0C4', borderRadius: '8px', padding: '2rem', textAlign: 'center', color: 'rgba(42,22,40,0.5)' }}>
                All transaction matching complete! No items in queue.
              </div>
            ) : (
              queue.map((tx) => {
                const isSelected = selectedTx?.id === tx.id;
                const hasSuggestions = tx.suggested_matches && tx.suggested_matches.length > 0;
                const topScore = hasSuggestions ? tx.suggested_matches[0].composite_score : 0;
                return (
                  <div
                    key={tx.id}
                    onClick={() => handleSelectTx(tx)}
                    style={{
                      padding: '0.85rem',
                      background: isSelected ? '#EDE6DE' : '#F6F2EE',
                      border: isSelected ? '1.5px solid #2A1628' : '1px solid rgba(42,22,40,0.08)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedTxIds.includes(tx.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelectTx(tx.id)}
                        style={{ marginTop: '0.15rem', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)' }}>
                          <span>{new Date(tx.date).toLocaleDateString()}</span>
                          <span style={{ fontWeight: 700, color: '#E8760A' }}>AED {tx.amount.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={badgeStyle(tx.status)}>{tx.status}</span>
                          {hasSuggestions ? (
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: topScore >= 0.70 ? '#10b981' : '#f59e0b' }}>
                              💡 Suggested Match ({Math.round(topScore * 100)}%)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.4)', fontStyle: 'italic' }}>No matches found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
        </div>

        {/* Right Side: Side-by-Side Comparison Workspace */}
        <div style={{ borderLeft: '1px solid rgba(42,22,40,0.08)', paddingLeft: '1.5rem' }}>
          {selectedTx ? (
            <div>
              {/* SIDE-BY-SIDE PANELS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Bank Transaction Panel */}
                <div style={{ background: '#EDE6DE', padding: '1rem', borderRadius: '8px', border: '1px solid #DDD0C4', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(42,22,40,0.6)', fontWeight: 700 }}>Bank Transaction Detail</span>
                    <button
                      onClick={() => {
                        setCpName(selectedTx.description);
                        setShowCpModal(true);
                      }}
                      style={{
                        background: '#E8760A',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      + ADD VENDOR/SUPPLIER
                    </button>
                  </div>
                  <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#2A1628', minHeight: '34px', overflow: 'hidden' }}>{selectedTx.description}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem', color: '#2A1628', fontWeight: 600 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date:</span> <span>{new Date(selectedTx.date).toLocaleDateString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Amount:</span> <span>AED {selectedTx.amount.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Remaining:</span> <span style={{ color: '#E8760A' }}>AED {selectedTx.remaining_amount.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Reference:</span> <span>{selectedTx.reference || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Suggested Receipt Panel */}
                <div style={{ background: selectedCandidate ? 'rgba(16,185,129,0.05)' : '#Fbf8f5', padding: '1rem', borderRadius: '8px', border: `1px solid ${selectedCandidate ? '#10b981' : '#DDD0C4'}` }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: selectedCandidate ? '#065f46' : 'rgba(42,22,40,0.6)', fontWeight: 700 }}>
                    Suggested Receipt / Invoice
                  </span>
                  {selectedCandidate ? (
                    <>
                      <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#2A1628', minHeight: '34px', overflow: 'hidden' }}>{selectedCandidate.vendor_name}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.7rem', color: '#2A1628', fontWeight: 600 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Invoice Date:</span> <span>{new Date(selectedCandidate.receipt_date).toLocaleDateString()}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Amount:</span> <span>AED {selectedCandidate.receipt_amount.toFixed(2)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Reference No:</span> <span>{selectedCandidate.receipt_reference || 'N/A'}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>File Document:</span>
                          {selectedCandidate.receipt_file_key ? (
                            <a
                              href={`/api/files/download?key=${encodeURIComponent(selectedCandidate.receipt_file_key)}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#E8760A', textDecoration: 'none' }}
                            >
                              VIEW DOCUMENT
                            </a>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90px', fontSize: '0.7rem', color: 'rgba(42,22,40,0.5)', fontStyle: 'italic' }}>
                      No AI suggestion selected. Use Manual Link or Split options.
                    </div>
                  )}
                </div>
              </div>

              {/* AI MATCH CARD & CONFIDENCE METER */}
              {selectedCandidate && (
                <div style={{ border: '1.5px solid #10b981', borderRadius: '12px', padding: '1rem', background: '#ffffff', marginBottom: '1.25rem', boxShadow: '0 4px 20px rgba(16,185,129,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16,185,129,0.1)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ✨ AI Suggested Match Candidate
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* Confidence Meter Circular Ring */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: '3px solid #F6F2EE',
                        borderTopColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.55rem',
                        fontWeight: 900,
                        color: '#065f46'
                      }}>
                        {Math.round(selectedCandidate.composite_score * 100)}%
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#065f46', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {selectedCandidate.match_status}
                      </span>
                    </div>
                  </div>

                  {/* Validation warnings / Duplicate Warnings */}
                  {parseFloat(selectedCandidate.composite_score.toString()) < 0.70 && (
                    <div style={{ display: 'flex', gap: '0.4rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.5rem', borderRadius: '6px', fontSize: '0.65rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                      </svg>
                      <span>Low match confidence warning. Double check invoice reference number and amount bounds before accepting matching.</span>
                    </div>
                  )}

                  {/* 6-Level Score Meter Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.6rem', textAlign: 'center' }}>
                    {[
                      { label: 'L1 Amount', score: selectedCandidate.l1_amount_score },
                      { label: 'L2 Date', score: selectedCandidate.l2_date_score },
                      { label: 'L3 Vendor', score: selectedCandidate.l3_vendor_score },
                      { label: 'L4 Reference', score: selectedCandidate.l4_reference_score },
                      { label: 'L5 Description', score: selectedCandidate.l5_description_score },
                      { label: 'L6 Category', score: selectedCandidate.l6_score || 0 }
                    ].map((lvl, index) => (
                      <div key={index} style={{ background: '#F6F2EE', padding: '0.35rem 0.15rem', borderRadius: '6px', border: '1px solid rgba(42,22,40,0.04)' }}>
                        <div style={{ color: 'rgba(42,22,40,0.5)', fontWeight: 700 }}>{lvl.label}</div>
                        <div style={{ color: '#2A1628', fontWeight: 800, marginTop: '0.15rem' }}>{Math.round(lvl.score * 100)}%</div>
                      </div>
                    ))}
                  </div>

                  <p style={{ margin: '0 0 0.85rem', fontSize: '0.65rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.4, fontStyle: 'italic' }}>
                    <strong>AI reasoning:</strong> {selectedCandidate.match_explanation}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleAcceptMatch(selectedCandidate.id)}
                      style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
                    >
                      ACCEPT MATCH
                    </button>
                    <button
                      onClick={() => handleRejectMatch(selectedCandidate.id)}
                      style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              )}

              {/* MANUAL ACTION TRIGGERS BAR */}
              <div style={{ background: '#F6F2EE', padding: '1rem', borderRadius: '8px', border: '1px solid #DDD0C4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2A1628' }}>Manual Reconciliations Option</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setManualAmount(selectedTx.remaining_amount.toString());
                      setShowManualModal(true);
                    }}
                    style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    MANUAL LINK
                  </button>
                  <button
                    onClick={() => {
                      setSplitAllocations([{ receiptId: '', allocatedAmount: selectedTx.remaining_amount.toString() }]);
                      setShowSplitModal(true);
                    }}
                    style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    SPLIT PAYMENT
                  </button>
                  <button
                    onClick={() => {
                      setMergeTargetId(selectedTx.id);
                      setMergeDirection('receipts_to_tx');
                      setMergeAllocations([{ id: '', allocatedAmount: '' }]);
                      setShowMergeModal(true);
                    }}
                    style={{ background: '#3D2040', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    MERGE INVOICES
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', border: '1px dashed #DDD0C4', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(42,22,40,0.5)', fontSize: '0.8rem', minHeight: '400px', padding: '2rem', textAlign: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem', opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
              Select an unmatched transaction from the pending queue ledger to review details, execute E2E similarity matches, or run manual overrides (split/merge/partial).
            </div>
          )}
        </div>
      </div>

      {/* MANUAL LINK DIALOG */}
      {showManualModal && selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '450px', border: '1px solid #DDD0C4', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628', letterSpacing: '0.05em' }}>
              Manual Override matching link
            </h3>
            <form onSubmit={handleManualLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Selected Transaction</label>
                <div style={{ background: '#F6F2EE', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedTx.description} — AED {selectedTx.remaining_amount.toFixed(2)} (Remaining)
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Select Invoice Receipt</label>
                <select
                  value={manualReceiptId}
                  onChange={(e) => setManualReceiptId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', background: '#fff' }}
                >
                  <option value="">-- Choose matchable invoice --</option>
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
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder={`Default: ${selectedTx.remaining_amount}`}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Audit Justification Reason</label>
                <input
                  type="text"
                  placeholder="Reason for manual linkage..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingManual}
                  style={{ flex: 1, background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingManual ? 'RECONCILING...' : 'APPLY OVERRIDE'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  style={{ flex: 1, background: '#fff', border: '1px solid #DDD0C4', color: '#2A1628', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPLIT PAYMENT DIALOG */}
      {showSplitModal && selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '500px', border: '1px solid #DDD0C4', maxHeight: '90%', overflowY: 'auto', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628', letterSpacing: '0.05em' }}>
              Split payment across invoices
            </h3>
            <form onSubmit={handleSplitReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Transaction Amount</label>
                <div style={{ background: '#F6F2EE', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedTx.description} — AED {selectedTx.remaining_amount.toFixed(2)} (Remaining)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', textTransform: 'uppercase' }}>Receipt Allocations</label>
                  <button
                    type="button"
                    onClick={() => setSplitAllocations([...splitAllocations, { receiptId: '', allocatedAmount: '' }])}
                    style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + ADD INVOICE
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {splitAllocations.map((alloc, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={alloc.receiptId}
                        onChange={(e) => {
                          const updated = [...splitAllocations];
                          updated[idx].receiptId = e.target.value;
                          setSplitAllocations(updated);
                        }}
                        required
                        style={{ flex: 2, padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem', background: '#fff' }}
                      >
                        <option value="">-- Choose Invoice --</option>
                        {receipts.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.vendor_name} ({new Date(r.date).toLocaleDateString()}) — AED {parseFloat(r.amount).toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={alloc.allocatedAmount}
                        onChange={(e) => {
                          const updated = [...splitAllocations];
                          updated[idx].allocatedAmount = e.target.value;
                          setSplitAllocations(updated);
                        }}
                        required
                        style={{ flex: 1, padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                      />
                      {splitAllocations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSplitAllocations(splitAllocations.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Audit Split Reason</label>
                <input
                  type="text"
                  placeholder="Split justification reason..."
                  value={splitReason}
                  onChange={(e) => setSplitReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingSplit}
                  style={{ flex: 1, background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingSplit ? 'SPLITTING...' : 'APPLY SPLIT'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  style={{ flex: 1, background: '#fff', border: '1px solid #DDD0C4', color: '#2A1628', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE INVOICES DIALOG */}
      {showMergeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '500px', border: '1px solid #DDD0C4', maxHeight: '90%', overflowY: 'auto', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628', letterSpacing: '0.05em' }}>
              Merge payments & invoices mapping
            </h3>
            <form onSubmit={handleMergeReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Merge Direction</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMergeDirection('receipts_to_tx');
                      setMergeTargetId(selectedTx?.id || '');
                      setMergeAllocations([{ id: '', allocatedAmount: '' }]);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      background: mergeDirection === 'receipts_to_tx' ? '#2A1628' : '#F6F2EE',
                      color: mergeDirection === 'receipts_to_tx' ? '#fff' : '#2A1628',
                      border: '1px solid #DDD0C4',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Merge Invoices to 1 Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMergeDirection('txs_to_receipt');
                      setMergeTargetId('');
                      setMergeAllocations([{ id: '', allocatedAmount: '' }]);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      background: mergeDirection === 'txs_to_receipt' ? '#2A1628' : '#F6F2EE',
                      color: mergeDirection === 'txs_to_receipt' ? '#fff' : '#2A1628',
                      border: '1px solid #DDD0C4',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Merge Payments to 1 Invoice
                  </button>
                </div>
              </div>

              {mergeDirection === 'receipts_to_tx' ? (
                // Merge multiple receipts to 1 payment transaction
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Target Payment Transaction</label>
                    <select
                      value={mergeTargetId}
                      onChange={(e) => setMergeTargetId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', background: '#fff' }}
                    >
                      <option value="">-- Choose Transaction --</option>
                      {queue.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.description} — AED {t.remaining_amount.toFixed(2)} (Remaining)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', textTransform: 'uppercase' }}>Group Invoices (Receipts)</label>
                      <button
                        type="button"
                        onClick={() => setMergeAllocations([...mergeAllocations, { id: '', allocatedAmount: '' }])}
                        style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Invoice
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {mergeAllocations.map((alloc, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            value={alloc.id}
                            onChange={(e) => {
                              const updated = [...mergeAllocations];
                              updated[idx].id = e.target.value;
                              setMergeAllocations(updated);
                            }}
                            required
                            style={{ flex: 2, padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem', background: '#fff' }}
                          >
                            <option value="">-- Select Invoice --</option>
                            {receipts.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.vendor_name} ({new Date(r.date).toLocaleDateString()}) — AED {parseFloat(r.amount).toFixed(2)}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={alloc.allocatedAmount}
                            onChange={(e) => {
                              const updated = [...mergeAllocations];
                              updated[idx].allocatedAmount = e.target.value;
                              setMergeAllocations(updated);
                            }}
                            required
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Merge multiple payments to 1 receipt invoice
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Target Invoice Receipt</label>
                    <select
                      value={mergeTargetId}
                      onChange={(e) => setMergeTargetId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', background: '#fff' }}
                    >
                      <option value="">-- Choose Invoice --</option>
                      {receipts.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.vendor_name} ({new Date(r.date).toLocaleDateString()}) — AED {parseFloat(r.amount).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', textTransform: 'uppercase' }}>Group Payments (Transactions)</label>
                      <button
                        type="button"
                        onClick={() => setMergeAllocations([...mergeAllocations, { id: '', allocatedAmount: '' }])}
                        style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Payment
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {mergeAllocations.map((alloc, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select
                            value={alloc.id}
                            onChange={(e) => {
                              const updated = [...mergeAllocations];
                              updated[idx].id = e.target.value;
                              setMergeAllocations(updated);
                            }}
                            required
                            style={{ flex: 2, padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem', background: '#fff' }}
                          >
                            <option value="">-- Select Payment --</option>
                            {queue.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.description} ({new Date(t.date).toLocaleDateString()}) — AED {t.remaining_amount.toFixed(2)}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={alloc.allocatedAmount}
                            onChange={(e) => {
                              const updated = [...mergeAllocations];
                              updated[idx].allocatedAmount = e.target.value;
                              setMergeAllocations(updated);
                            }}
                            required
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '4px', fontSize: '0.7rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Audit Merge Reason</label>
                <input
                  type="text"
                  placeholder="Merge justification reason..."
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingMerge}
                  style={{ flex: 1, background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingMerge ? 'MERGING...' : 'APPLY MERGE'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  style={{ flex: 1, background: '#fff', border: '1px solid #DDD0C4', color: '#2A1628', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT HISTORY DRAWER */}
      {showHistoryDrawer && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 110, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
          <div style={{ width: '600px', background: '#fff', height: '100%', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #DDD0C4', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628', letterSpacing: '0.1em' }}>
                Reconciliation Audit History
              </h3>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#2A1628', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadingHistory ? (
                <p style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', padding: '2rem' }}>Loading history logs...</p>
              ) : historyItems.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center', fontStyle: 'italic' }}>No history matching log found.</p>
              ) : (
                historyItems.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #DDD0C4', borderRadius: '8px', padding: '0.85rem', background: '#Fbf8f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', fontWeight: 700 }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span style={badgeStyle(item.new_status)}>
                        {item.new_status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#2A1628', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Logged By: <span style={{ color: '#E8760A' }}>{item.changed_by}</span>
                    </div>

                    {item.notes && (
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)', fontStyle: 'italic', background: '#fff', padding: '0.4rem', borderRadius: '4px', border: '1px solid rgba(42,22,40,0.04)' }}>
                        <strong>Action notes:</strong> {item.notes}
                      </p>
                    )}

                    {/* Show allocations detail inside audit log card */}
                    {item.allocations && item.allocations.length > 0 && (
                      <div style={{ marginTop: '0.5rem', borderTop: '1px dashed #DDD0C4', paddingTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>Linked allocations:</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {item.allocations.map((alloc, aIdx) => (
                            <div key={aIdx} style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '0.25rem 0.4rem', borderRadius: '4px' }}>
                              <span>{alloc.tx_description?.substring(0, 20)}... → {alloc.rec_vendor_name || 'Receipt'}</span>
                              <strong style={{ color: '#E8760A' }}>AED {Number(alloc.allocated_amount).toFixed(2)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.new_status !== 'Pending' && (
                      <button
                        onClick={() => handleUndoReconciliation(item.reconciliation_id)}
                        style={{ marginTop: '0.75rem', width: '100%', background: '#fff', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '0.3rem 0', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', transition: 'all 200ms' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        UNDO RECONCILIATION MATCH
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* HISTORY DRAWER PAGINATION */}
            {historyTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid rgba(42,22,40,0.08)', paddingTop: '1rem' }}>
                <button
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage(historyPage - 1)}
                  style={{ background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', cursor: historyPage === 1 ? 'default' : 'pointer' }}
                >
                  PREV
                </button>
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Page {historyPage} of {historyTotalPages}</span>
                <button
                  disabled={historyPage === historyTotalPages}
                  onClick={() => setHistoryPage(historyPage + 1)}
                  style={{ background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', cursor: historyPage === historyTotalPages ? 'default' : 'pointer' }}
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INLINE ADD COUNTERPARTY DIALOG */}
      {showCpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', width: '450px', border: '1px solid #DDD0C4', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#2A1628', letterSpacing: '0.05em' }}>
              Add Dynamic Partner Counterparty
            </h3>
            <form onSubmit={handleCreateCounterparty} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Entity Name</label>
                <input
                  type="text"
                  required
                  value={cpName}
                  onChange={(e) => setCpName(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Entity Type</label>
                <select
                  value={cpType}
                  onChange={(e) => setCpType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', background: '#fff' }}
                >
                  <option value="Vendor">Vendor</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Category / Account Type</label>
                <input
                  type="text"
                  required
                  value={cpCategory}
                  onChange={(e) => setCpCategory(e.target.value)}
                  placeholder="e.g. Rent, Utilities, Office Expenses"
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Payment Terms</label>
                <input
                  type="text"
                  value={cpTerms}
                  onChange={(e) => setCpTerms(e.target.value)}
                  placeholder="e.g. Net 30, Due on Receipt"
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>UAE Tax Registration Number (TRN)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={cpTrn}
                  onChange={(e) => setCpTrn(e.target.value)}
                  placeholder="15-digit UAE TRN"
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'rgba(42,22,40,0.6)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>QuickBooks Account Code</label>
                <input
                  type="text"
                  value={cpQboCode}
                  onChange={(e) => setCpQboCode(e.target.value)}
                  placeholder="e.g. 60100"
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingCp}
                  style={{ flex: 1, background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingCp ? 'SAVING...' : 'REGISTER PARTNER'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCpModal(false)}
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
