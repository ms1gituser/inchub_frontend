/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { get, post } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';

interface ConnectionInfo {
  connected: boolean;
  realmId?: string;
  expiresAt?: string;
  companyName?: string;
}

interface SyncItem {
  id: string;
  local_id: string;
  entity_type: string;
  qbo_id: string;
  sync_version: number;
  last_sync_status: string;
  last_sync_response: string | null;
  sync_time: string;
  display_name: string;
  amount: number;
}

interface DashboardMetrics {
  pendingSync: number;
  retryQueue: number;
  failedSync: number;
  successSync: number;
  lastSyncTime: string | null;
  apiHealth: string;
}

export default function QuickBooksWorkspace() {
  const { showToast, showConfirm } = useNotification();

  // Status & Metrics States
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Sync Queue History states
  const [history, setHistory] = useState<SyncItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Selected mappings
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submittingSync, setSubmittingSync] = useState(false);

  // Load status and metrics
  useEffect(() => {
    fetchConnectionStatus();
    fetchDashboardMetrics();
    fetchSyncHistory();
  }, [page]);

  const fetchConnectionStatus = async () => {
    setLoadingConnection(true);
    try {
      const res = await get<{ success: boolean; data: ConnectionInfo }>('/quickbooks/status');
      if (res?.success) {
        setConnection(res.data);
      }
    } catch (err: any) {
      console.error('[Connection Status Err]', err);
    } finally {
      setLoadingConnection(false);
    }
  };

  const fetchDashboardMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await get<{ success: boolean; data: DashboardMetrics }>('/quickbooks/dashboard');
      if (res?.success) {
        setMetrics(res.data);
      }
    } catch (err: any) {
      console.error('[Dashboard Metrics Err]', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchSyncHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await get<{
        success: boolean;
        data: SyncItem[];
        pagination: { total: number };
      }>(`/quickbooks/history?page=${page}&limit=${limit}`);
      if (res?.success) {
        setHistory(res.data || []);
        setTotalItems(res.pagination?.total || 0);
      }
    } catch (err: any) {
      console.error('[Sync History Fetch Err]', err);
      showToast('Failed to load sync history ledger.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // OAuth Connect link trigger
  const handleConnect = async () => {
    try {
      const res = await post<{ success: boolean; authUrl: string }>('/quickbooks/connect');
      if (res?.success && res.authUrl) {
        showToast('Initiating QuickBooks connection...', 'success');
        window.location.href = res.authUrl;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to start QuickBooks OAuth.', 'error');
    }
  };

  // Revoke disconnect trigger
  const handleDisconnect = () => {
    showConfirm(
      'Are you sure you want to DISCONNECT QuickBooks? All active credentials and tokens will be wiped.',
      async () => {
        try {
          const res = await post<any>('/quickbooks/disconnect');
          if (res?.success) {
            showToast('Disconnected from QuickBooks successfully.', 'success');
            setConnection({ connected: false });
            fetchDashboardMetrics();
            fetchSyncHistory();
          }
        } catch (err: any) {
          showToast(err.message || 'Failed to disconnect company.', 'error');
        }
      },
      'Disconnect QuickBooks'
    );
  };

  // Trigger token refresh check
  const handleCheckSession = async () => {
    try {
      const res = await post<any>('/quickbooks/refresh-token');
      if (res?.success) {
        showToast(`QBO Session active. Token expires: ${new Date(res.expiresAt).toLocaleTimeString()}`, 'success');
        fetchConnectionStatus();
      }
    } catch (err: any) {
      showToast('QuickBooks session expired or inactive. Please reconnect.', 'warning');
    }
  };

  // Resubmit/Retry failed synchronization queue items
  const handleRetryQueue = async () => {
    if (selectedIds.length === 0) return;
    setSubmittingSync(true);
    try {
      const res = await post<any>('/quickbooks/retry', { queue_ids: selectedIds });
      if (res?.success) {
        showToast('Retry synchronized batch successfully completed.', 'success');
        setSelectedIds([]);
        fetchSyncHistory();
        fetchDashboardMetrics();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retry sync queue.', 'error');
    } finally {
      setSubmittingSync(false);
    }
  };

  // Force rebuild resync mapping
  const handleForceResync = async () => {
    if (selectedIds.length === 0) return;
    showConfirm(
      `Force re-synchronize ${selectedIds.length} selected mappings? This wipes existing linkages and enqueues items again.`,
      async () => {
        setSubmittingSync(true);
        try {
          const res = await post<any>('/quickbooks/force-resync', { mapping_ids: selectedIds });
          if (res?.success) {
            showToast('Force re-sync complete. Items re-queued and synced.', 'success');
            setSelectedIds([]);
            fetchSyncHistory();
            fetchDashboardMetrics();
          }
        } catch (err: any) {
          showToast(err.message || 'Force resync failed.', 'error');
        } finally {
          setSubmittingSync(false);
        }
      },
      'Force QuickBooks Resync'
    );
  };

  // Helper formats
  const statusBadge = (s: string) => {
    const status = s.toUpperCase();
    const style: React.CSSProperties = {
      padding: '0.15rem 0.4rem',
      borderRadius: '4px',
      fontSize: '0.62rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      display: 'inline-block'
    };
    if (status === 'SYNCED') return { ...style, background: '#d1fae5', color: '#059669' };
    if (status === 'FAILED') return { ...style, background: '#fef2f2', color: '#ef4444' };
    if (status === 'PENDING') return { ...style, background: '#fef3c7', color: '#d97706' };
    return { ...style, background: '#e5e7eb', color: '#374151' };
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', marginTop: '1.5rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06)' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            Stage 7: QuickBooks Online Integration Workspace
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
            Establish OAuth connectivity, monitor queues status, configure automatic retries, and check mapping constraints.
          </p>
        </div>
      </div>

      {/* CONNECTION STATUS CARD */}
      <div style={{ background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: connection?.connected ? '#d1fae5' : '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={connection?.connected ? '#059669' : '#ef4444'} strokeWidth="2.5">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
              <polyline points="18 8 22 12 18 16" />
              <line x1="8" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#2A1628', textTransform: 'uppercase' }}>
              Connection: {connection?.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </h4>
            {connection?.connected ? (
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)' }}>
                Realm ID: {connection.realmId} | Expire Time: {connection.expiresAt ? new Date(connection.expiresAt).toLocaleTimeString() : 'N/A'}
              </p>
            ) : (
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)' }}>
                No active Intuit QuickBooks connection exists for this workspace tenant profile.
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {connection?.connected ? (
            <>
              <button
                onClick={handleCheckSession}
                style={{ background: '#fff', border: '1px solid #DDD0C4', borderRadius: '6px', color: '#2A1628', padding: '0.45rem 1rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
              >
                CHECK SESSION
              </button>
              <button
                onClick={handleDisconnect}
                style={{ background: 'transparent', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', padding: '0.45rem 1rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
              >
                REVOKE CONNECTION
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              style={{ background: '#2A1628', border: 'none', borderRadius: '6px', color: '#fff', padding: '0.5rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' }}
            >
              CONNECT TO QUICKBOOKS
            </button>
          )}
        </div>
      </div>

      {/* SYNC METRICS */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Pending Sync', value: metrics.pendingSync, color: '#d97706' },
            { label: 'Retry Queue', value: metrics.retryQueue, color: '#2563eb' },
            { label: 'Failed Sync', value: metrics.failedSync, color: '#ef4444' },
            { label: 'Synced Entities', value: metrics.successSync, color: '#059669' },
            { label: 'API Connection Health', value: metrics.apiHealth, color: '#16a34a' }
          ].map((card, idx) => (
            <div key={idx} style={{
              background: '#F6F2EE',
              border: '1.5px solid rgba(42,22,40,0.06)',
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

      {/* QUEUE CONTROL TOOLBAR */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#2A1628', color: '#fff', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedIds.length} item(s) selected</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleRetryQueue}
              disabled={submittingSync}
              style={{ background: '#E8760A', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
            >
              RETRY SYNC
            </button>
            <button
              onClick={handleForceResync}
              disabled={submittingSync}
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
            >
              FORCE RE-SYNC
            </button>
            <button
              onClick={() => setSelectedIds([])}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.7rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* SYNC HISTORY QUEUE TABLE */}
      <div style={{ border: '1px solid rgba(42,22,40,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ background: '#F6F2EE', borderBottom: '1px solid #DDD0C4', color: '#2A1628', fontWeight: 700 }}>
              <th style={{ padding: '0.75rem', width: '30px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === history.length}
                  onChange={() => {
                    if (selectedIds.length === history.length) setSelectedIds([]);
                    else setSelectedIds(history.map((h) => h.id));
                  }}
                />
              </th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Local Document</th>
              <th style={{ padding: '0.75rem' }}>Entity Type</th>
              <th style={{ padding: '0.75rem' }}>QuickBooks Resource ID</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.75rem' }}>Last Action Time</th>
            </tr>
          </thead>
          <tbody>
            {loadingHistory ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(42,22,40,0.5)' }}>Loading mappings history...</td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'rgba(42,22,40,0.5)' }}>No sync history mapped for this tenant connection.</td>
              </tr>
            ) : (
              history.map((item) => {
                const isRowChecked = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(42,22,40,0.06)',
                      background: isRowChecked ? '#EDE6DE' : '#ffffff',
                      transition: 'background 200ms'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
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
                      <span style={statusBadge(item.last_sync_status)}>{item.last_sync_status}</span>
                      {item.last_sync_response && (
                        <div style={{ fontSize: '0.6rem', color: '#ef4444', marginTop: '0.2rem', fontWeight: 600 }}>
                          {item.last_sync_response}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#2A1628' }}>{item.display_name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>Local Ref: {item.local_id}</div>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{item.entity_type}</td>
                    <td style={{ padding: '0.75rem', color: 'rgba(42,22,40,0.7)' }}>{item.qbo_id || 'Not Mapped'}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#E8760A' }}>
                      AED {Number(item.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>
                      {new Date(item.sync_time).toLocaleString()}
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
    </div>
  );
}
