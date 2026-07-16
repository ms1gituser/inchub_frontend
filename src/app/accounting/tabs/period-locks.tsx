'use client';

import React, { useState, useEffect } from 'react';
import { get, post } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';

interface MonthPeriod {
  id: string;
  year: number;
  month: number;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  transaction_count: number;
  report_generated: boolean;
  invoice_sent: boolean;
  closed_at: string | null;
  report_file_path: string | null;
  invoice_file_path: string | null;
}

interface ComplianceData {
  transaction_threshold: {
    current_month_count: number;
    last_3_months_total: number;
    baseline: number;
    exceeds_threshold: boolean;
    should_trigger_addendum: boolean;
  };
  vat_threshold: {
    current_revenue: number;
    thresholds: {
      minimum: { reached: boolean; amount: number };
      voluntary: { reached: boolean; amount: number };
      critical: { reached: boolean; amount: number };
      mandatory: { reached: boolean; amount: number };
    };
    alerts: string[];
  };
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'COMPLETED';
  created_at: string;
}

export default function PeriodLocksTab() {
  const { showToast, showConfirm } = useNotification();
  
  // State
  const [months, setMonths] = useState<MonthPeriod[]>([]);
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Create / Close month modal state
  const [showCloseModal, setShowCloseModal] = useState<MonthPeriod | null>(null);
  const [reportPath, setReportPath] = useState('');
  const [invoicePath, setInvoicePath] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await get<{ success: boolean; data: MonthPeriod[]; compliance: ComplianceData }>('/bookkeeping/months');
      if (res?.success) {
        setMonths(res.data || []);
        setCompliance(res.compliance || null);
      }
      
      const tasksRes = await get<{ success: boolean; data: TaskItem[] }>('/bookkeeping/compliance/tasks');
      if (tasksRes?.success) {
        setTasks(tasksRes.data || []);
      }
    } catch (e: any) {
      console.error('[Fetch Period Locks Error]', e);
      showToast(e.message || 'Failed to fetch compliance periods data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMonth = async () => {
    // Propose opening the next sequential month
    let nextMonth = 1;
    let nextYear = new Date().getFullYear();

    if (months.length > 0) {
      const latest = months[0]; // Ordered DESC
      if (latest.month === 12) {
        nextMonth = 1;
        nextYear = latest.year + 1;
      } else {
        nextMonth = latest.month + 1;
        nextYear = latest.year;
      }
    }

    showConfirm(
      `Open accounting period for ${nextYear}-${String(nextMonth).padStart(2, '0')}? This will verify client KYC checklist status before opening.`,
      async () => {
        setActionLoading(true);
        try {
          const res = await post<{ success: boolean; message: string }>('/bookkeeping/months/create', {
            year: nextYear,
            month: nextMonth
          });
          if (res?.success) {
            showToast(res.message || 'New accounting period created.', 'success');
            await fetchData();
          }
        } catch (e: any) {
          showToast(e.message || 'Failed to create new period.', 'error');
        } finally {
          setActionLoading(false);
        }
      },
      'Open New Period'
    );
  };

  const handleCloseMonthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCloseModal) return;
    if (!reportPath.trim() || !invoicePath.trim()) {
      showToast('Report and Invoice file paths are required.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const res = await post<{ success: boolean; message: string }>(`/bookkeeping/months/${showCloseModal.id}/close`, {
        report_file_path: reportPath.trim(),
        invoice_file_path: invoicePath.trim()
      });
      if (res?.success) {
        showToast(res.message || 'Period closed successfully.', 'success');
        setShowCloseModal(null);
        setReportPath('');
        setInvoicePath('');
        await fetchData();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to close period.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setActionLoading(true);
    try {
      const res = await post<{ success: boolean; message: string }>(`/bookkeeping/compliance/tasks/${taskId}/complete`);
      if (res?.success) {
        showToast(res.message || 'Compliance task completed.', 'success');
        await fetchData();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to complete task.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>LOADING COMPLIANCE SYSTEM...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Header Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {/* Transaction Volume Card */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transaction Baseline</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', margin: '0.25rem 0' }}>
            {compliance?.transaction_threshold.last_3_months_total} <span style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>/ {compliance?.transaction_threshold.baseline} TX</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: compliance?.transaction_threshold.exceeds_threshold ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {compliance?.transaction_threshold.exceeds_threshold 
              ? '⚠ Exceeded baseline volume! Addendum required.' 
              : '✓ Safe. Within baseline limits.'}
          </p>
        </div>

        {/* VAT Revenue Card */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>UAE VAT Gross Turnover</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#2A1628', margin: '0.25rem 0' }}>
            AED {compliance?.vat_threshold.current_revenue.toLocaleString()}
          </div>
          <p style={{ margin: 0, fontSize: '0.7rem', color: compliance?.vat_threshold.alerts.length ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
            {compliance?.vat_threshold.alerts.length 
              ? `⚠ Alert: ${compliance.vat_threshold.alerts.join(', ').replace('_', ' ')}` 
              : '✓ Tracking active. No registration warnings.'}
          </p>
        </div>

        {/* Action / Create Period Card */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <button
            onClick={handleCreateMonth}
            disabled={actionLoading}
            style={{
              background: '#E8760A',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'background 0.2s',
              width: '100%'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F09040'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#E8760A'; }}
          >
            Open New Period
          </button>
          <span style={{ fontSize: '0.6rem', color: 'rgba(42,22,40,0.5)', textAlign: 'center' }}>
            KYC Red Gate is active. Missing documents will block opening.
          </span>
        </div>
      </div>

      {/* 2. Month-Locks Management Section */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2A1628' }}>
          Month Closing & Period Locks
        </h3>
        
        {months.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.5)', margin: 0 }}>No bookkeeping periods initialized yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {months.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '1.25rem',
                  background: m.status === 'CLOSED' ? '#F6F2EE' : '#ffffff',
                  border: `1px solid ${m.status === 'CLOSED' ? '#DDD0C4' : '#E8760A'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2A1628' }}>
                    {new Date(m.year, m.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: m.status === 'CLOSED' ? '#10b981' : '#E8760A',
                    background: m.status === 'CLOSED' ? 'rgba(16,185,129,0.1)' : 'rgba(232,118,10,0.1)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {m.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>Transactions: <strong>{m.transaction_count}</strong></div>
                  <div>Report: <strong>{m.report_generated ? 'Generated' : 'Pending'}</strong></div>
                  <div>Invoice: <strong>{m.invoice_sent ? 'Sent' : 'Pending'}</strong></div>
                  {m.status === 'CLOSED' && (
                    <a
                      href="https://drive.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#E8760A',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        marginTop: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      View Folder on GDrive
                    </a>
                  )}
                </div>

                {m.status === 'OPEN' && (
                  <button
                    onClick={() => setShowCloseModal(m)}
                    style={{
                      background: '#2A1628',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Close & Lock
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Compliance Tasks / Addendums */}
      <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2A1628' }}>
          Compliance & Pricing Addendum Tasks
        </h3>

        {tasks.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.5)', margin: 0 }}>No compliance tasks generated.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '1rem',
                  border: '1px solid rgba(42,22,40,0.08)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: t.status === 'COMPLETED' ? '#fbfcfb' : '#ffffff',
                  opacity: t.status === 'COMPLETED' ? 0.7 : 1
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#2A1628' }}>{t.title}</h4>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)' }}>{t.description}</p>
                </div>

                {t.status === 'PENDING' ? (
                  <button
                    onClick={() => handleCompleteTask(t.id)}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>✓ COMPLETED</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Month Modal */}
      {showCloseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#2A1628', fontWeight: 700 }}>
                Close Period: {new Date(showCloseModal.year, showCloseModal.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)' }}>
                Closing this period is irreversible and locks edits.
              </p>
            </div>

            <form onSubmit={handleCloseMonthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', marginBottom: '0.25rem' }}>Financial Report PDF File Path</label>
                <input
                  type="text"
                  placeholder="e.g. /d/mahesh/reports/PL_Q1.pdf"
                  value={reportPath}
                  onChange={(e) => setReportPath(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#2A1628', marginBottom: '0.25rem' }}>Tax Invoice PDF File Path</label>
                <input
                  type="text"
                  placeholder="e.g. /d/mahesh/invoices/INV_102.pdf"
                  value={invoicePath}
                  onChange={(e) => setInvoicePath(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.4rem', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCloseModal(null)}
                  style={{ padding: '0.4rem 0.8rem', background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '0.4rem 0.8rem', background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Confirm Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
