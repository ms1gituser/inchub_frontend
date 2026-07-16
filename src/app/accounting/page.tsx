/* eslint-disable */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { get, post, ApiError } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';
import ReconciliationPanel from './reconciliation-panel';
import SuspenseWorkspace from './suspense-workspace';
import QuickBooksWorkspace from './quickbooks-workspace';
import KycComplianceWorkspace from '@/components/kyc/KycComplianceWorkspace';
import KycSummaryCard from '@/components/kyc/KycSummaryCard';
import DynamicJsonForm from '@/components/ui/DynamicJsonForm';

import DashboardTab from './tabs/dashboard';
import ClientListTab from './tabs/client-list';
import AiQueueTab from './tabs/ai-queue';
import ReconciliationTab from './tabs/reconciliation';
import VatTab from './tabs/vat';
import CorporateTaxTab from './tabs/corporate-tax';
import ReportsTab from './tabs/reports';
import QuickBooksTab from './tabs/quickbooks';
import VendorsTab from './tabs/vendors';
import PeriodLocksTab from './tabs/period-locks';

// Types
interface KycItem {
  name: string;
  status: 'valid' | 'expiring' | 'expired';
  expiry_date: string | null;
}

interface LedgerEntry {
  date: string;
  description: string;
  reference: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface ActionItem {
  task: string;
  assignee: string;
  deadline: string;
  status: string;
}

interface MeetingSummary {
  transcript: string;
  summary: {
    topics: string[];
    decisions: string[];
    action_items: ActionItem[];
  };
}

interface TenantProfile {
  tenant_id: string;
  contract_baseline_transactions: number;
  current_monthly_transactions: number;
  current_turnover_aed: string;
  vat_status: string;
  drive_root_folder_id: string | null;
  qb_access_token: string | null;
  qb_refresh_token: string | null;
  qb_realm_id: string | null;
  qb_token_expires_at: string | null;
  ct_filing_deadline: string | null;
}

interface CtFiling {
  tenant_id: string;
  filing_year: number;
  status: string;
  intake_form_data: {
    turnover_aed: number;
    taxable_income_aed: number;
  };
  ct_return_doc_id: string;
  payment_receipt_doc_id: string;
  financial_statements_doc_id: string;
  filed_at: string;
}

interface ParseAlerts {
  transaction_alert_level?: string;
  transaction_alert_message?: string;
  vat_status?: string;
  vat_alert_message?: string;
  ct_deadline?: string;
  three_month_consequences?: string;
  three_month_triggered?: boolean;
}

interface KycResponse {
  success: boolean;
  data: KycItem[];
  last_refreshed_at: string;
}

interface ProfileResponse {
  success: boolean;
  data: TenantProfile;
}

interface CtArchiveResponse {
  success: boolean;
  data: {
    corporate_tax_filings: CtFiling[];
    monthly_archives: Array<{
      period: string;
      report_doc_id: string;
      invoice_doc_id: string;
    }>;
  };
}

interface GeneralResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

interface ParseResponse {
  success: boolean;
  data: {
    ocr_text_length: number;
    ledger: LedgerEntry[];
    excel_base64: string;
    akaunting_result: unknown;
    metrics: {
      previous_transactions: number;
      new_transactions: number;
      previous_turnover: number;
      new_turnover: number;
      drive_folder_id: string | null;
      drive_folder_path: string;
    };
    alerts: ParseAlerts;
  };
}

export default function AccountingPage() {
  const { showToast, showConfirm } = useNotification();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // State variables
  const [kycChecklist, setKycChecklist] = useState<KycItem[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [lockedMonths, setLockedMonths] = useState<string[]>([]);
  const [ctFilings, setCtFilings] = useState<CtFiling[]>([]);
  const [lockError, setLockError] = useState<string | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'ocr' | 'reconciliation' | 'suspense' | 'quickbooks' | 'kyc' | 'period-locks' | 'corporate-tax'>('ocr');
  const [reportsSubTab, setReportsSubTab] = useState<'reports' | 'period-locks'>('reports');

  // Sync tab selection with query parameter
  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'ocr' || tabParam === 'ai-queue') {
        setActiveWorkspaceTab('ocr');
      } else if (tabParam === 'reconciliation') {
        setActiveWorkspaceTab('reconciliation');
      } else if (tabParam === 'suspense' || tabParam === 'vendors') {
        setActiveWorkspaceTab('suspense');
      } else if (tabParam === 'quickbooks') {
        setActiveWorkspaceTab('quickbooks');
      } else if (tabParam === 'kyc' || tabParam === 'client-list') {
        setActiveWorkspaceTab('kyc');
      } else if (tabParam === 'period-locks' || tabParam === 'reports') {
        setActiveWorkspaceTab('period-locks');
      } else if (tabParam === 'corporate-tax') {
        setActiveWorkspaceTab('corporate-tax');
      }
    }
  }, [tabParam]);

  // VAT Log states
  const [vatLog, setVatLog] = useState<any>(null);
  const [waivedReason, setWaivedReason] = useState('');
  const [submittingWaiver, setSubmittingWaiver] = useState(false);

  // AI Bookkeeping states (Prefixed with _ to silence unused-vars ESLint check)
  const [_parsing, setParsing] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [_parseAlerts, setParseAlerts] = useState<ParseAlerts | null>(null);
  const [newVendorName, setNewVendorName] = useState('');
  const [_creatingVendor, setCreatingVendor] = useState(false);
  const [_pushingQb, setPushingQb] = useState(false);

  // Validation & Suspense state extensions
  const [_validationErrors, setValidationErrors] = useState<string[]>([]);
  const [balancedDiff, setBalancedDiff] = useState<number>(0);
  const [suspenseTxs, setSuspenseTxs] = useState<any[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolvingVendor, setResolvingVendor] = useState('');

  // OCR Ingestion Stage 1 states
  const [ocrDocs, setOcrDocs] = useState<any[]>([]);
  const [selectedOcrDoc, setSelectedOcrDoc] = useState<any | null>(null);
  const [ocrIngesting, setOcrIngesting] = useState(false);
  const [ocrSource, setOcrSource] = useState<'Portal' | 'Staff' | 'Email'>('Portal');
  const [failedOcrJobs, setFailedOcrJobs] = useState<any[]>([]);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);

  // Stage 2 Bank statement construction states
  const [failedStatements, setFailedStatements] = useState<any[]>([]);

  // Stage 3 Human review portal states
  const [pendingOcrDocs, setPendingOcrDocs] = useState<any[]>([]);

  // Corporate Tax form state
  const [ctYear, setCtYear] = useState('2026');
  const [ctTurnover, setCtTurnover] = useState('520000');
  const [ctTaxableIncome, setCtTaxableIncome] = useState('95000');
  const [filingCt, setFilingCt] = useState(false);
  const [ctSchema, setCtSchema] = useState<any>(null);

  // Whisper meeting recorder states
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKyc = async () => {
    try {
      setLoadingKyc(true);
      const res = await get<KycResponse>('/bookkeeping/kyc');
      if (res?.success) {
        setKycChecklist(res.data);
      }
    } catch (e: unknown) {
      console.error('[KYC Fetch Error]', e);
    } finally {
      setLoadingKyc(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await get<ProfileResponse>('/bookkeeping/profile');
      if (res?.success) {
        setProfile(res.data);
      }
    } catch (e: unknown) {
      console.error('[Profile Fetch Error]', e);
    }
  };

  const fetchVatLog = async () => {
    try {
      const res = await get<{ success: boolean; data: any }>('/bookkeeping/vat/log');
      if (res?.success) {
        setVatLog(res.data);
      }
    } catch (e: unknown) {
      console.error('[VAT Log Fetch Error]', e);
    }
  };

  const handleWaiveVat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waivedReason.trim()) {
      showToast('Waiver reason is required.', 'warning');
      return;
    }
    setSubmittingWaiver(true);
    try {
      const res = await post<{ success: boolean; message: string; data: any }>('/bookkeeping/vat/waive', {
        waived_reason: waivedReason.trim()
      });
      if (res?.success) {
        showToast(res.message || 'VAT registration threshold waived successfully.', 'success');
        setWaivedReason('');
        await fetchVatLog();
        await fetchProfile();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit waiver.', 'error');
    } finally {
      setSubmittingWaiver(false);
    }
  };

  const fetchCtArchive = async () => {
    try {
      const res = await get<CtArchiveResponse>('/bookkeeping/ct/archive');
      if (res?.success) {
        setLockedMonths(res.data.monthly_archives?.map((a: { period: string }) => a.period) || []);
        setCtFilings(res.data.corporate_tax_filings || []);
      }
    } catch (e: unknown) {
      console.error('[Archive Fetch Error]', e);
    }
  };

  const fetchCtSchema = async () => {
    try {
      const res = await get<any>('/bookkeeping/ct/schema');
      if (res?.success) {
        setCtSchema(res.schema);
      }
    } catch (e) {
      console.error('[Schema Fetch Error]', e);
    }
  };

  // Triggers immediate expire for testing indicators
  const handleForceExpirePassport = () => {
    showConfirm(
      'Are you sure you want to force expire the Passport of Beneficial Owners? This test action will mark the document as EXPIRED and trigger a persistent red alert indicator across all screens showing this client record.',
      async () => {
        try {
          const res = await post<GeneralResponse>('/bookkeeping/kyc/expire', { name: 'Passport of Beneficial Owners' });
          if (res?.success) {
            await fetchKyc();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('kyc-changed'));
            }
            showToast('Passport status forced to EXPIRED.', 'success');
          }
        } catch (e: unknown) {
          console.error('[Force Expire Error]', e);
          showToast('Failed to force expire passport.', 'error');
        }
      },
      'Force Expire Passport'
    );
  };

  // Sequential period lock logic
  const handleLockMonth = (monthNum: number) => {
    showConfirm(
      `CRITICAL ACTION: Are you sure you want to lock the bookkeeping period for 2026-${String(monthNum).padStart(2, '0')}? This action is IRREVERSIBLE and will close all editing/modifications for this period.`,
      async () => {
        try {
          setLockError(null);
          const res = await post<GeneralResponse>('/bookkeeping/periods/lock', { year: 2026, month: monthNum });
          if (res?.success) {
            await fetchCtArchive();
            await fetchProfile();
            showToast(`Bookkeeping period for 2026-${String(monthNum).padStart(2, '0')} has been locked.`, 'success');
          }
        } catch (e: unknown) {
          console.error('[Period Lock Error]', e);
          if (e instanceof ApiError) {
            setLockError(e.message || 'Month-Lock Gate Error: Sequential month close constraints violated.');
          } else {
            const err = e instanceof Error ? e : new Error(String(e));
            setLockError(err.message || 'Month-Lock Gate Error: Sequential month close constraints violated.');
          }
        }
      },
      'Lock Bookkeeping Period'
    );
  };

  // Statement processing trigger
  const handleStatementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setParseAlerts(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await post<any>('/bookkeeping/statements/upload', {
          file: base64,
          mime_type: file.type || 'application/pdf',
          file_name: file.name,
          source: 'Portal'
        });

        if (res?.success) {
          showToast(res.message || 'Statement parsed and ledger populated.', 'success');
          setLedger(res.transactions || []);
          await fetchFailedStatements();
          await fetchProfile();
          await fetchCtArchive();
          await fetchSuspense();
        }
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      console.error('[Upload Parse Error]', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast(errorMsg || 'Statement ingestion failed.', 'error');
      await fetchFailedStatements();
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Dynamic Counterparty addition
  const handleAddVendor = async () => {
    if (!newVendorName.trim()) return;
    setCreatingVendor(true);
    try {
      const res = await post<GeneralResponse>('/bookkeeping/reconciliation/vendors', { name: newVendorName });
      if (res?.success) {
        showToast(`Vendor "${newVendorName}" created successfully inside reconciliation workspace.`, 'success');
        setNewVendorName('');
      }
    } catch (e: unknown) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      showToast(errorMsg || 'Failed to create vendor.', 'error');
    } finally {
      setCreatingVendor(false);
    }
  };

  // QuickBooks sync and auth redirection
  const handleQuickBooksPush = async () => {
    if (ledger.length === 0) {
      showToast('Please upload and parse a statement first to construct a ledger.', 'warning');
      return;
    }
    setPushingQb(true);
    try {
      const res = await post<GeneralResponse>('/bookkeeping/integrations/quickbooks/push', { ledger });
      if (res?.success) {
        showToast('QuickBooks sync completed successfully!', 'success');
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof ApiError) {
        if (e.status === 412) {
          // Redirection for OAuth setup
          try {
            const authRes = await get<{ success: boolean; authorizationUrl?: string }>('/bookkeeping/integrations/quickbooks/auth');
            if (authRes?.success && authRes.authorizationUrl) {
              showConfirm(
                'QuickBooks Online is not connected. Redirect to secure QuickBooks OAuth link?',
                () => {
                  window.location.href = authRes.authorizationUrl!;
                },
                'Connect to QuickBooks'
              );
            }
          } catch (authErr) {
            console.error(authErr);
          }
        } else {
          showToast(e.message || 'Sync failed. Verify credential parameters.', 'error');
        }
      } else {
        const errorMsg = e instanceof Error ? e.message : String(e);
        showToast(errorMsg || 'Sync failed. Verify credential parameters.', 'error');
      }
    } finally {
      setPushingQb(false);
    }
  };

  const fetchFailedOcrJobs = async () => {
    try {
      const res = await get<{ success: boolean; data: any[] }>('/ocr/failed');
      if (res?.success) {
        setFailedOcrJobs(res.data || []);
      }
    } catch (e) {
      console.error('[OCR Failed Jobs fetch]', e);
    }
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrIngesting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await post<any>('/ocr/upload', {
          file: base64,
          mime_type: file.type || 'application/pdf',
          file_name: file.name,
          source: ocrSource
        });

        if (res?.success) {
          showToast('Stage 1 OCR Ingestion Complete', 'success');
          setSelectedOcrDoc(res.data);
          setOcrDocs(prev => [res.data, ...prev]);
          await fetchFailedOcrJobs();
          await fetchPendingOcrDocs();
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Ingestion failed', 'error');
    } finally {
      setOcrIngesting(false);
      if (ocrFileInputRef.current) ocrFileInputRef.current.value = '';
    }
  };

  const handleRetryOcr = async (id: string) => {
    try {
      showToast('Re-triggering OCR processor...', 'info');
      const res = await post<any>(`/ocr/retry/${id}`);
      if (res?.success) {
        showToast('OCR Retry Complete', 'success');
        setSelectedOcrDoc(res.data);
        setOcrDocs(prev => prev.map(d => d.id === id ? res.data : d));
        await fetchFailedOcrJobs();
        await fetchPendingOcrDocs();
      }
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    }
  };

  const fetchFailedStatements = async () => {
    try {
      const res = await get<{ success: boolean; data: any[] }>('/bookkeeping/statements/failed');
      if (res?.success) {
        setFailedStatements(res.data || []);
      }
    } catch (e) {
      console.error('[Failed statements fetch]', e);
    }
  };

  const handleRetryStatement = async (id: string) => {
    try {
      showToast('Re-processing bank statement...', 'info');
      const res = await post<any>(`/bookkeeping/statements/retry/${id}`);
      if (res?.success) {
        showToast('Statement parsed successfully!', 'success');
        setLedger(res.data || []);
        await fetchFailedStatements();
        await fetchSuspense();
      }
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    }
  };

  const fetchPendingOcrDocs = async () => {
    try {
      const res = await get<{ success: boolean; data: any[] }>('/ocr/low-confidence');
      if (res?.success) {
        setPendingOcrDocs(res.data || []);
      }
    } catch (e) {
      console.error('[Failed pending docs fetch]', e);
    }
  };

  const handleApproveOcr = async (id: string) => {
    try {
      showToast('Approving and promoting invoice to receipts...', 'info');
      const res = await post<any>(`/ocr/review/approve/${id}`);
      if (res?.success) {
        showToast('Document approved and promoted to standard accounting registers!', 'success');
        setSelectedOcrDoc(null);
        await fetchPendingOcrDocs();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleRejectOcr = async (id: string) => {
    try {
      showToast('Rejecting document extraction...', 'info');
      const res = await post<any>(`/ocr/review/reject/${id}`);
      if (res?.success) {
        showToast('Document marked as Rejected.', 'warning');
        setSelectedOcrDoc(null);
        await fetchPendingOcrDocs();
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    }
  };

  // Year-End Corporate Tax submit
  const handleFileCorporateTax = (e: React.FormEvent) => {
    e.preventDefault();
    showConfirm(
      `CRITICAL ACTION: Are you sure you want to submit the Corporate Tax returns and archive files for year ${ctYear}? This submission is official and cannot be undone.`,
      async () => {
        setFilingCt(true);
        try {
          const res = await post<GeneralResponse>('/bookkeeping/ct/file', {
            year: parseInt(ctYear),
            intake_form_data: {
              turnover_aed: parseFloat(ctTurnover),
              taxable_income_aed: parseFloat(ctTaxableIncome),
            },
          });

          if (res?.success) {
            showToast(`Year-end Corporate Tax return submitted for FY ${ctYear}!`, 'success');
            await fetchCtArchive();
          }
        } catch (err: unknown) {
          console.error(err);
          const errorMsg = err instanceof Error ? err.message : String(err);
          showToast(errorMsg || 'Failed to submit Corporate Tax returns.', 'error');
        } finally {
          setFilingCt(false);
        }
      },
      'Submit Corporate Tax Filing'
    );
  };

  const handleFileDownload = async (key: string) => {
    try {
      const res = await get<{ success: boolean; downloadUrl?: string }>(`/files/download?key=${encodeURIComponent(key)}`);
      if (res?.success && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else {
        showToast('Failed to obtain download URL from server.', 'error');
      }
    } catch (err: unknown) {
      console.error('[Download Error]', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast(errorMsg || 'Error fetching secure link.', 'error');
    }
  };

  // Whisper simulation trigger
  const handleRecordMeeting = async () => {
    if (!recording) {
      setRecordingDuration(0); // Reset duration here to avoid setState inside effect body
      setRecording(true);
    } else {
      setRecording(false);
      setTranscribing(true);
      try {
        const res = await post<{ success: boolean; data: MeetingSummary }>('/chat/transcribe', { simulate: true });
        if (res?.success) {
          setMeetingSummary(res.data);
        }
      } catch (err) {
        console.error('[Whisper Simulator Error]', err);
      } finally {
        setTranscribing(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'valid') return '#10b981'; // Green
    if (status === 'expiring') return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const fetchSuspense = async () => {
    try {
      const res = await get<{ success: boolean; data: any[] }>('/bookkeeping/reconciliation/suspense');
      if (res?.success) {
        setSuspenseTxs(res.data || []);
      }
    } catch (e) {
      console.error('[Suspense Fetch Error]', e);
    }
  };

  const handleResolveSuspense = async (txId: string) => {
    if (!resolvingVendor.trim()) return;
    try {
      const res = await post<{ success: boolean }>('/bookkeeping/reconciliation/suspense/resolve', {
        transaction_id: txId,
        vendor_name: resolvingVendor
      });
      if (res?.success) {
        showToast('Suspense transaction resolved successfully', 'success');
        setResolvingVendor('');
        setResolvingId(null);
        await fetchSuspense();
        if (ledger.length > 0) {
          setLedger(prev => prev.map(item => {
            if (item.id === txId) {
              return { ...item, status: 'RECONCILED', description: resolvingVendor, match_level: 'L6' };
            }
            return item;
          }));
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Resolution failed', 'error');
    }
  };

  // Fetch all initial dashboard data
  useEffect(() => {
    const init = async () => {
      await Promise.resolve();
      fetchKyc();
      fetchProfile();
      fetchVatLog();
      fetchCtArchive();
      fetchCtSchema();
      fetchSuspense();
      fetchFailedOcrJobs();
      fetchFailedStatements();
      fetchPendingOcrDocs();
    };
    init();

    // Listen for real-time KYC changes to dynamically refresh page block state
    const handler = () => {
      fetchKyc();
    };
    window.addEventListener('kyc-changed', handler);
    return () => window.removeEventListener('kyc-changed', handler);
  }, []);

  // Timer for meeting recorder duration
  useEffect(() => {
    if (recording) {
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [recording]);



  // Progress calculations
  const baselineTransactions = profile?.contract_baseline_transactions || 250;
  const currentTransactions = profile?.current_monthly_transactions || 0;
  const transactionPercentage = Math.min((currentTransactions / baselineTransactions) * 100, 100);

  const cumulativeTurnover = Number(profile?.current_turnover_aed || 0);

  // UAE VAT limits definition
  const vatLimitVoluntary = 185000;
  const vatLimitWarning = 250000;
  const vatLimitCritical = 350000;
  const vatLimitMandatory = 375000;

  const getVatStatusText = () => {
    if (cumulativeTurnover >= vatLimitMandatory) return 'MANDATORY REGISTRATION OVERDUE';
    if (cumulativeTurnover >= vatLimitCritical) return 'CRITICAL WARNING LADDER';
    if (cumulativeTurnover >= vatLimitWarning) return 'VOLUNTARY LIMIT APPROACHING';
    if (cumulativeTurnover >= vatLimitVoluntary) return 'VOLUNTARY REGISTRATION AVAILABLE';
    return 'STANDARD RETAINER RETENTION';
  };

  if (vatLog?.alert_level === 'EMERGENCY_375K' && vatLog?.status === 'PENDING') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #ef4444',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '550px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(239, 68, 68, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: '#ef4444'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>
            UAE VAT Mandatory Registration Required
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.6, marginBottom: '2rem' }}>
            Annual rolling turnover has reached or exceeded the UAE VAT mandatory registration limit of <strong>AED 375,000</strong> (Current: AED {cumulativeTurnover.toLocaleString()}).
            <br />
            As a result, further accounting and statement processing activities are temporarily locked. To resume operations, a Manager or CEO must submit an official waiver reason below.
          </p>
          <form onSubmit={handleWaiveVat} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Waiver Reason / Acknowledgment Signed by Manager/CEO
              </label>
              <textarea
                required
                value={waivedReason}
                onChange={(e) => setWaivedReason(e.target.value)}
                placeholder="Specify the reason for voluntary delay or CEO/Manager signed waiver approval..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '0.75rem',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={submittingWaiver}
              style={{
                background: '#991b1b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#7f1d1d'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#991b1b'; }}
            >
              {submittingWaiver ? 'SUBMITTING WAIVER...' : 'APPROVE & SIGN WAIVER OVERRIDE'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      color: '#2A1628',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 300,
      lineHeight: 1.85,
      maxWidth: '1536px',
      margin: '0 auto',
      width: '100%',
    }}>
      {!tabParam && (
        <>
          {/* Brand Workspace Header */}
          <div style={{ borderBottom: '1px solid #DDD0C4', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Financial Services • UAE Compliance
              </p>
            </div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>
              Accounting Operations & <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>AI Bookkeeping</span>
            </h1>
          </div>

          {/* Row 1: KYC Compliance Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {/* KYC Compliance — Summary Card (links to full KYC tab) */}
            <KycSummaryCard onOpenTab={() => setActiveWorkspaceTab('kyc')} />
          </div>

          {/* Row 2: Transaction Usage Tracker & VAT Voluntary Log */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Transaction Usage Tracker */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)', transition: 'all 0.3s ease' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
                Transaction Count limits
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Monthly Usage</span>
                <span>{currentTransactions} / {baselineTransactions} transactions</span>
              </div>
              {/* Progress Bar */}
              <div style={{ height: '10px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(42,22,40,0.06)', marginBottom: '1rem' }}>
                <div style={{ width: `${transactionPercentage}%`, height: '100%', background: currentTransactions > baselineTransactions ? '#ef4444' : '#E8760A', transition: 'width 300ms ease' }} />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>
                {currentTransactions > baselineTransactions ? (
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    ⚠️ WARNING: Contracted baseline volume exceeded. Consecutive threshold breach (3 months) will trigger mandatory pricing renegotiation and agreement addendum generation.
                  </span>
                ) : (
                  <span>Your current transaction volume is within the standard contract baseline. Consecutive monthly breaches are monitored.</span>
                )}
              </div>
            </div>

            {/* VAT Voluntary Log & Alert */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)', transition: 'all 0.3s ease' }}>
              <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
                VAT Voluntary log & alerts
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Rolling Annual Turnover</span>
                <span>AED {cumulativeTurnover.toLocaleString()}</span>
              </div>

              {/* Progress bar towards AED 375k */}
              <div style={{ height: '10px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #DDD0C4', marginBottom: '1rem' }}>
                <div style={{ width: `${Math.min((cumulativeTurnover / 375000) * 100, 100)}%`, height: '100%', background: '#E8760A', transition: 'width 300ms ease' }} />
              </div>

              {/* Alert levels indicators */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600, marginBottom: '1rem' }}>
                <span>AED 185k (Voluntary)</span>
                <span>AED 250k (Warning)</span>
                <span>AED 350k (Critical)</span>
                <span>AED 375k (Mandatory)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: vatLog?.status === 'WAIVED' ? '#10b981' : (cumulativeTurnover >= vatLimitMandatory ? '#ef4444' : cumulativeTurnover >= vatLimitVoluntary ? '#f59e0b' : '#10b981') }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#2A1628' }}>
                    CURRENT AUDIT: {vatLog?.status === 'WAIVED' ? 'WAIVED BY MANAGER' : getVatStatusText()}
                  </span>
                </div>
                {vatLog?.status === 'WAIVED' && (
                  <div style={{ fontSize: '0.6875rem', color: 'rgba(42,22,40,0.6)', borderTop: '1px solid #DDD0C4', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                    <strong>Waived By:</strong> {vatLog.waived_by}<br/>
                    <strong>Reason:</strong> {vatLog.waived_reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}


      {/* Tab Section Wrapper to restrict sticky boundary */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!tabParam && (
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            position: 'sticky', 
            top: '-1.75rem', 
            zIndex: 50, 
            background: '#FAF6F0', 
            marginTop: '-1.75rem', 
            paddingTop: '1.75rem', 
            marginLeft: '-2rem', 
            marginRight: '-2rem', 
            paddingLeft: '2rem', 
            paddingRight: '2rem', 
            borderBottom: '2px solid rgba(42,22,40,0.08)', 
            paddingBottom: '0.75rem', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap', 
            scrollbarWidth: 'none' 
          }}>
            <button
              onClick={() => setActiveWorkspaceTab('ocr')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'ocr' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'ocr' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              OCR Ingestion
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('kyc')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'kyc' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'kyc' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              KYC Compliance
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('reconciliation')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'reconciliation' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'reconciliation' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              Reconciliation Panel
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('suspense')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'suspense' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'suspense' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              Suspense Workspace
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('quickbooks')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'quickbooks' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'quickbooks' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              QuickBooks Integration
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('period-locks')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'period-locks' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'period-locks' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              Bookkeeping Period Locks
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('corporate-tax')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeWorkspaceTab === 'corporate-tax' ? '3px solid #2A1628' : 'none',
                color: activeWorkspaceTab === 'corporate-tax' ? '#2A1628' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                flexShrink: 0
              }}
            >
              Corporate Tax
            </button>
          </div>
        )}

      {tabParam === 'dashboard' && <DashboardTab />}
      {tabParam === 'client-list' && <ClientListTab />}
      {tabParam === 'ai-queue' && <AiQueueTab />}
      {tabParam === 'reconciliation' && <ReconciliationTab />}
      {tabParam === 'vat' && <VatTab />}
      {tabParam === 'corporate-tax' && <CorporateTaxTab />}
      {tabParam === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub-tab Switcher Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(42,22,40,0.08)', gap: '1.5rem', marginBottom: '0.5rem' }}>
            <button
              onClick={() => setReportsSubTab('reports')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: reportsSubTab === 'reports' ? '3px solid #E8760A' : 'none',
                color: reportsSubTab === 'reports' ? '#E8760A' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              System Reports
            </button>
            <button
              onClick={() => setReportsSubTab('period-locks')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: reportsSubTab === 'period-locks' ? '3px solid #E8760A' : 'none',
                color: reportsSubTab === 'period-locks' ? '#E8760A' : 'rgba(42,22,40,0.5)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Period Locks & Compliance
            </button>
          </div>
          {reportsSubTab === 'reports' ? <ReportsTab /> : <PeriodLocksTab />}
        </div>
      )}
      {tabParam === 'quickbooks' && <QuickBooksTab />}
      {tabParam === 'vendors' && <VendorsTab />}

      {!tabParam && activeWorkspaceTab === 'kyc' && (
        <KycComplianceWorkspace />
      )}
      {!tabParam && activeWorkspaceTab === 'reconciliation' && (
        <ReconciliationPanel onReconciled={() => {
          fetchSuspense();
        }} />
      )}
      {!tabParam && activeWorkspaceTab === 'suspense' && (
        <SuspenseWorkspace />
      )}
      {!tabParam && activeWorkspaceTab === 'quickbooks' && (
        <QuickBooksWorkspace />
      )}
      {!tabParam && activeWorkspaceTab === 'period-locks' && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            Bookkeeping Period Locks
          </h2>

          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'rgba(42,22,40,0.6)', lineHeight: 1.5 }}>
            Sequential Lock Rule: Month N cannot be locked unless Month N-1 is locked and marked COMPLETE (report and invoice sent). Expiry of any KYC document blocks opening/closing subsequent months.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', flex: 1 }}>
            {[
              { m: 1, name: 'Jan 2026' },
              { m: 2, name: 'Feb 2026' },
              { m: 3, name: 'Mar 2026' },
              { m: 4, name: 'Apr 2026' },
              { m: 5, name: 'May 2026' },
              { m: 6, name: 'Jun 2026' },
            ].map((month) => {
              const isLocked = lockedMonths.includes(`2026-${String(month.m).padStart(2, '0')}`);
              return (
                <div
                  key={month.m}
                  style={{
                    padding: '1.25rem 0.75rem',
                    background: isLocked ? '#EDE6DE' : '#ffffff',
                    border: `1px solid ${isLocked ? '#DDD0C4' : '#E8760A'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all 200ms',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2A1628' }}>{month.name}</span>
                  <span style={{ fontSize: '0.65rem', color: isLocked ? 'rgba(42,22,40,0.5)' : '#E8760A', fontWeight: 700 }}>
                    {isLocked ? 'LOCKED' : 'OPEN'}
                  </span>
                  {!isLocked && (
                    <button
                      onClick={() => handleLockMonth(month.m)}
                      style={{
                        width: '100%',
                        background: '#E8760A',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.35rem 0',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F09040'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#E8760A'; }}
                    >
                      LOCK
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sequential Lock Error Display Panel */}
          {lockError && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{lockError}</span>
            </div>
          )}
        </div>
      )}
      {!tabParam && activeWorkspaceTab === 'ocr' && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06)', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            Stage 1: Document OCR Ingestion Workspace (Enterprise Ingestion)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
            {/* Controls & Upload Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.35rem' }}>
                  Ingestion Channel Source
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Portal', 'Staff', 'Email'].map((src) => (
                    <button
                      key={src}
                      onClick={() => setOcrSource(src as any)}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.75rem',
                        background: ocrSource === src ? '#2A1628' : '#F6F2EE',
                        color: ocrSource === src ? '#ffffff' : '#2A1628',
                        border: '1px solid #DDD0C4',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              {kycChecklist.some((item) => item.status === 'expired') && (
                <div style={{ padding: '0.75rem 1rem', background: '#ef4444', color: '#fff', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>KYC ALERT: Ingestion disabled. A mandatory document is EXPIRED. Please renew it in the compliance checklist tab.</span>
                </div>
              )}

              <div
                onClick={() => {
                  if (kycChecklist.some((item) => item.status === 'expired')) {
                    showToast('Ingestion blocked: Check expired KYC documents!', 'error');
                    return;
                  }
                  ocrFileInputRef.current?.click();
                }}
                style={{
                  border: '2px dashed #DDD0C4',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: kycChecklist.some((item) => item.status === 'expired') ? 'not-allowed' : 'pointer',
                  background: '#Fbf8f5',
                  transition: 'all 200ms',
                  opacity: kycChecklist.some((item) => item.status === 'expired') ? 0.5 : 1
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8760A" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span style={{ fontSize: '0.8rem', color: '#2A1628', fontWeight: 600 }}>
                  {ocrIngesting ? 'UPLOADING & RUNNING OCR...' : 'DRAG OR UPLOAD INVOICE/RECEIPT'}
                </span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)' }}>
                  PDF, JPG, JPEG, PNG (Real Local Tesseract OCR)
                </p>
                <input
                  type="file"
                  ref={ocrFileInputRef}
                  onChange={handleOcrUpload}
                  style={{ display: 'none' }}
                  accept=".pdf,.png,.jpg,.jpeg"
                  disabled={kycChecklist.some((item) => item.status === 'expired')}
                />
              </div>


              {/* Failed Jobs List */}
              {failedOcrJobs.length > 0 && (
                <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Failed OCR Ingestion Jobs ({failedOcrJobs.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {failedOcrJobs.map((job) => (
                      <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                        <span style={{ color: '#b91c1c' }}>{job.original_file_path.substring(0, 25)}...</span>
                        <button
                          onClick={() => handleRetryOcr(job.id)}
                          style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700 }}
                        >
                          RETRY
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Pending Human Review */}
              {pendingOcrDocs.length > 0 && (
                <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Pending Human Review Queue ({pendingOcrDocs.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {pendingOcrDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedOcrDoc(doc)}
                        style={{
                          padding: '0.4rem',
                          background: selectedOcrDoc?.id === doc.id ? '#EDE6DE' : '#fff',
                          border: '1px solid #DDD0C4',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ color: '#2A1628', fontWeight: 600 }}>
                          {doc.original_file_path.split('/').pop().substring(0, 20)}
                        </span>
                        <span style={{
                          background: doc.overall_confidence < 0.80 ? '#fca5a5' : '#fde68a',
                          color: doc.overall_confidence < 0.80 ? '#b91c1c' : '#b45309',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '3px',
                          fontSize: '0.6rem',
                          fontWeight: 700
                        }}>
                          {doc.overall_confidence ? `${(parseFloat(doc.overall_confidence) * 100).toFixed(0)}%` : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Visualizer Panel */}
            <div style={{ borderLeft: '1px solid rgba(42,22,40,0.08)', paddingLeft: '1.5rem' }}>
              {selectedOcrDoc ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2A1628' }}>Document Status:</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{
                        background: selectedOcrDoc.review_status === 'Approved' ? 'rgba(16,185,129,0.1)' : selectedOcrDoc.review_status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: selectedOcrDoc.review_status === 'Approved' ? '#10b981' : selectedOcrDoc.review_status === 'Rejected' ? '#ef4444' : '#f59e0b',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {selectedOcrDoc.review_status}
                      </span>
                      {selectedOcrDoc.overall_confidence !== null && (
                        <span style={{ background: '#2A1628', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                          Conf: {(parseFloat(selectedOcrDoc.overall_confidence) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedOcrDoc.validation_results && selectedOcrDoc.validation_results.length > 0 && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                      <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>AI Validation Rules Log</h5>
                      <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.7rem', color: '#b45309' }}>
                        {selectedOcrDoc.validation_results.map((err: any, idx: number) => (
                          <li key={idx}><strong>{err.field}</strong>: {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOcrDoc.processing_status === 'OCR Failed' ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>OCR Extraction failed on upstream processor.</p>
                      <button
                        onClick={() => handleRetryOcr(selectedOcrDoc.id)}
                        style={{ background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}
                      >
                        RETRY EXTRACTING
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          { label: 'Vendor Name', val: selectedOcrDoc.ocr_json?.vendor_name?.value, conf: selectedOcrDoc.ocr_json?.vendor_name?.confidence, src: selectedOcrDoc.ocr_json?.vendor_name?.source },
                          { label: 'Invoice Number', val: selectedOcrDoc.ocr_json?.invoice_number?.value, conf: selectedOcrDoc.ocr_json?.invoice_number?.confidence, src: selectedOcrDoc.ocr_json?.invoice_number?.source },
                          { label: 'Customer Name', val: selectedOcrDoc.ocr_json?.customer_name?.value, conf: selectedOcrDoc.ocr_json?.customer_name?.confidence, src: selectedOcrDoc.ocr_json?.customer_name?.source },
                          { label: 'Invoice Date', val: selectedOcrDoc.ocr_json?.invoice_date?.value, conf: selectedOcrDoc.ocr_json?.invoice_date?.confidence, src: selectedOcrDoc.ocr_json?.invoice_date?.source },
                          { label: 'Due Date', val: selectedOcrDoc.ocr_json?.due_date?.value, conf: selectedOcrDoc.ocr_json?.due_date?.confidence, src: selectedOcrDoc.ocr_json?.due_date?.source },
                          { label: 'Currency', val: selectedOcrDoc.ocr_json?.currency?.value, conf: selectedOcrDoc.ocr_json?.currency?.confidence, src: selectedOcrDoc.ocr_json?.currency?.source },
                          { label: 'Net Amount', val: selectedOcrDoc.ocr_json?.net_amount?.value, conf: selectedOcrDoc.ocr_json?.net_amount?.confidence, src: selectedOcrDoc.ocr_json?.net_amount?.source },
                          { label: 'VAT Amount', val: selectedOcrDoc.ocr_json?.vat_amount?.value, conf: selectedOcrDoc.ocr_json?.vat_amount?.confidence, src: selectedOcrDoc.ocr_json?.vat_amount?.source },
                          { label: 'Gross Amount', val: selectedOcrDoc.ocr_json?.gross_amount?.value, conf: selectedOcrDoc.ocr_json?.gross_amount?.confidence, src: selectedOcrDoc.ocr_json?.gross_amount?.source },
                          { label: 'TRN', val: selectedOcrDoc.ocr_json?.trn?.value, conf: selectedOcrDoc.ocr_json?.trn?.confidence, src: selectedOcrDoc.ocr_json?.trn?.source }
                        ].map((field, i) => (
                          <div key={i} style={{ padding: '0.5rem 0.75rem', background: '#F6F2EE', borderRadius: '6px', border: '1px solid rgba(42,22,40,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(42,22,40,0.5)', fontWeight: 600 }}>
                              <span style={{ textTransform: 'uppercase' }}>{field.label}</span>
                              <span style={{ color: '#E8760A' }}>{field.src || 'AI'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2A1628' }}>{field.val !== null ? String(field.val) : 'N/A'}</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: field.conf >= 0.85 ? '#10b981' : field.conf >= 0.60 ? '#f59e0b' : '#ef4444' }}>
                                {field.conf ? `${(field.conf * 100).toFixed(0)}%` : '0%'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedOcrDoc.review_status === 'Pending Review' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(42,22,40,0.08)', paddingTop: '1rem' }}>
                          <button
                            onClick={() => handleApproveOcr(selectedOcrDoc.id)}
                            style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            APPROVE EXTRACTION
                          </button>
                          <button
                            onClick={() => handleRejectOcr(selectedOcrDoc.id)}
                            style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 0', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            REJECT DOCUMENT
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '100%', border: '1px dashed #DDD0C4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', color: 'rgba(42,22,40,0.5)', fontSize: '0.8rem', minHeight: '300px' }}>
                  Upload an invoice or select a pending human review item to parse structured details, confidence tags, and math warnings.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Corporate Tax return filing & meeting transcribe recorder */}
      {!tabParam && activeWorkspaceTab === 'corporate-tax' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
          
        {/* Corporate Tax return filing */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)', transition: 'all 0.3s ease' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            Year-End CT Filing Form
          </h2>
          {/* ... existing form ... */}
          <div style={{ background: 'rgba(232, 118, 10, 0.04)', border: '1px solid rgba(232, 118, 10, 0.15)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.75rem', color: '#2A1628', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: '#E8760A', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
              UAE Corporate Tax Schedule Notice
            </span>
            • Net Profit up to <strong>AED 375,000</strong>: <strong>0% Tax Rate</strong><br/>
            • Net Profit exceeding <strong>AED 375,000</strong>: <strong>9% Tax Rate</strong>
          </div>

          {ctSchema ? (
            <DynamicJsonForm
              schema={{
                ...ctSchema,
                sections: [
                  {
                    title: "Filing Basics",
                    fields: [
                      {
                        name: "filing_year",
                        type: "number",
                        label: "Filing Year",
                        defaultValue: 2026,
                        width: "third",
                        validation: { required: "Filing year is required" }
                      },
                      {
                        name: "turnover_aed",
                        type: "number",
                        label: "Annual Turnover (AED)",
                        defaultValue: 520000,
                        width: "third",
                        validation: { required: "Turnover is required" }
                      },
                      {
                        name: "taxable_income_aed",
                        type: "number",
                        label: "Taxable Income (AED)",
                        defaultValue: 95000,
                        width: "third",
                        validation: { required: "Taxable Income is required" }
                      }
                    ]
                  },
                  ...(ctSchema.sections || []),
                  ...(ctSchema.fields ? [{ title: "Intake Fields", fields: ctSchema.fields }] : [])
                ]
              }}
              onSubmit={async (values) => {
                const { filing_year, turnover_aed, taxable_income_aed, ...rest } = values;
                setFilingCt(true);
                try {
                  const res = await post('/bookkeeping/ct/file', {
                    year: Number(filing_year || 2026),
                    intake_form_data: {
                      turnover_aed: Number(turnover_aed || 0),
                      taxable_income_aed: Number(taxable_income_aed || 0),
                      ...rest
                    }
                  });
                  if (res && typeof res === 'object' && 'success' in res && res.success) {
                    showToast(`Year-end Corporate Tax return submitted for FY ${filing_year || 2026}!`, 'success');
                    await fetchCtArchive();
                  }
                } catch (err) {
                  const errMsg = err instanceof Error ? err.message : String(err);
                  showToast(errMsg || 'Filing failed', 'error');
                } finally {
                  setFilingCt(false);
                }
              }}
              successMessage="Corporate Tax Return filed successfully!"
            />
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'rgba(42,22,40,0.5)', padding: '1rem 0' }}>Loading Dynamic Tax Intake Form...</div>
          )}

          {/* Filed CT Archives Grid */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.75rem' }}>
              Corporate Tax Archives
            </h3>
            {ctFilings.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'rgba(42,22,40,0.5)', margin: 0 }}>No files archived.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ctFilings.map((filing, idx) => (
                  <div key={idx} style={{ padding: '0.5rem 0.75rem', background: '#F6F2EE', border: '1px solid rgba(42,22,40,0.06)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2A1628' }}>FY {filing.filing_year} Return Document</span>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); handleFileDownload(filing.ct_return_doc_id); }}
                      style={{ fontSize: '0.7rem', color: '#E8760A', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      DOWNLOAD
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Whisper Meeting Recorder Simulator */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            AI Conference recorder
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center', minHeight: '180px' }}>
            {/* Pulsing microphone animation indicator */}
            <button
              onClick={handleRecordMeeting}
              disabled={transcribing}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: recording ? '#ef4444' : '#F6F2EE',
                border: `1px solid ${recording ? '#ef4444' : '#DDD0C4'}`,
                color: recording ? '#ffffff' : '#E8760A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: recording ? '0 0 0 10px rgba(239, 68, 68, 0.2)' : 'none',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: recording ? '#ef4444' : '#2A1628' }}>
              {recording ? `LIVE RECORDING... ${formatDuration(recordingDuration)}` : transcribing ? 'AI TRANSCRIBING & SUMMARIZING...' : 'RECORD COMPLIANCE DEALS'}
            </span>
          </div>

          {/* Parsed transcript summaries */}
          {meetingSummary && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #DDD0C4', paddingTop: '1.25rem', maxHeight: '200px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.75rem' }}>
                AI Meeting Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.75rem' }}>
                {/* Topics */}
                <div>
                  <strong style={{ textTransform: 'uppercase', color: '#E8760A', fontSize: '0.65rem', letterSpacing: '0.05em' }}>Topics Discussed</strong>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                    {meetingSummary?.summary?.topics?.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>

                {/* Decisions */}
                <div>
                  <strong style={{ textTransform: 'uppercase', color: '#E8760A', fontSize: '0.65rem', letterSpacing: '0.05em' }}>Decisions Made</strong>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                    {meetingSummary?.summary?.decisions?.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>

                {/* Actions Table */}
                <div>
                  <strong style={{ textTransform: 'uppercase', color: '#E8760A', fontSize: '0.65rem', letterSpacing: '0.05em' }}>Action Items</strong>
                  <div style={{ overflowX: 'auto', marginTop: '0.35rem', border: '1px solid #DDD0C4', borderRadius: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.7rem' }}>
                      <thead>
                        <tr style={{ background: '#F6F2EE', borderBottom: '1px solid #DDD0C4' }}>
                          <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Task</th>
                          <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Owner</th>
                          <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meetingSummary?.summary?.action_items?.map((act, i) => (
                          <tr key={i} style={{ borderBottom: i === (meetingSummary?.summary?.action_items?.length ?? 0) - 1 ? 'none' : '1px solid #DDD0C4' }}>
                            <td style={{ padding: '0.4rem 0.6rem', fontWeight: 500 }}>{act.task}</td>
                            <td style={{ padding: '0.4rem 0.6rem' }}>{act.assignee}</td>
                            <td style={{ padding: '0.4rem 0.6rem', color: '#E8760A', fontWeight: 600 }}>{act.deadline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      
        </div>
      )}
      </div>

      {/* 9-Stage AI Bookkeeping Engine Panel (Commented out as requested) */}
      {/*
      <div style={{ background: '#ffffff', border: '1px solid rgba(42,22,40,0.08)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)', transition: 'all 0.3s ease', marginTop: '2rem' }}>
        <div style={{ borderBottom: '1px solid rgba(42,22,40,0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628' }}>
            9-Stage AI Bookkeeping Workspace
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             {kycChecklist.some((item) => item.status === 'expired') && (
               <div style={{ display: 'flex', alignItems: 'center', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                 ⚠️ UPLOADS LOCKED BY KYC GATE
               </div>
             )}
             <button
              onClick={() => {
                if (kycChecklist.some((item) => item.status === 'expired')) {
                  showToast('Cannot upload bank statement while KYC compliance documents are expired.', 'error');
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={parsing || kycChecklist.some((item) => item.status === 'expired')}
              style={{
                background: '#2A1628',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: kycChecklist.some((item) => item.status === 'expired') ? 'not-allowed' : 'pointer',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                opacity: kycChecklist.some((item) => item.status === 'expired') ? 0.4 : 1
              }}
              onMouseEnter={(e) => { 
                if (!kycChecklist.some((item) => item.status === 'expired')) {
                  e.currentTarget.style.background = '#3D2040'; 
                }
              }}
              onMouseLeave={(e) => { 
                if (!kycChecklist.some((item) => item.status === 'expired')) {
                  e.currentTarget.style.background = '#2A1628'; 
                }
              }}
            >
              {parsing ? 'PROCESSING OCR...' : 'UPLOAD STATEMENT'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleStatementUpload}
              style={{ display: 'none' }}
              accept=".pdf,.csv,.xlsx,.xls"
              disabled={kycChecklist.some((item) => item.status === 'expired')}
            />
            <button
              onClick={handleQuickBooksPush}
              disabled={pushingQb}
              style={{
                background: '#E8760A',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F09040'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#E8760A'; }}
            >
              {pushingQb ? 'SYNCING...' : 'PUSH TO QUICKBOOKS'}
            </button>
          </div>
        </div>

        {failedStatements.length > 0 && (
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Failed Bank Statement Imports ({failedStatements.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {failedStatements.map((stmt) => (
                <div key={stmt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: '#b91c1c', fontWeight: 600 }}>{stmt.file_name} (Reason: {stmt.parsing_errors?.error || 'Unknown'})</span>
                  <button
                    onClick={() => handleRetryStatement(stmt.id)}
                    style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                  >
                    RETRY PARSING
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', margin: '0 0 0.75rem' }}>
          Extracted Ledger Entries
        </h3>

        {parsing ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)' }}>Processing Statement & Extracting Ledger Entries...</div>
        ) : ledger.length === 0 ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', border: '1px dashed #DDD0C4', borderRadius: '8px', fontSize: '0.85rem', color: 'rgba(42,22,40,0.4)', marginBottom: '1.25rem' }}>
            No statement parsed yet. Upload a bank statement file to construct the ledger.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginBottom: '1.25rem', border: '1px solid #DDD0C4', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#F6F2EE', borderBottom: '2px solid #DDD0C4', color: '#2A1628' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Match Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry: any, idx) => (
                  <tr key={entry.id || idx} style={{ borderBottom: '1px solid #DDD0C4', background: entry.status === 'matched' ? 'rgba(16, 185, 129, 0.02)' : 'rgba(239, 68, 68, 0.02)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{entry.date}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{entry.description}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'rgba(42,22,40,0.6)' }}>{entry.reference || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: entry.type === 'debit' ? '#ef4444' : '#10b981' }}>
                      AED {Number(entry.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', color: entry.type === 'debit' ? '#ef4444' : '#10b981' }}>
                      {entry.type === 'debit' ? 'DR (OUT)' : 'CR (IN)'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        background: entry.match_level === 'L1' || entry.match_level === 'L2' ? 'rgba(16, 185, 129, 0.1)' : entry.match_level === 'L6' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: entry.match_level === 'L1' || entry.match_level === 'L2' ? '#10b981' : entry.match_level === 'L6' ? '#ef4444' : '#f59e0b',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {entry.match_level ? `${entry.match_level} - ${entry.status}` : 'Exact AI Match (L1)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '1rem', background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', margin: '0 0 0.75rem' }}>
            In-Workspace counterparty creator
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              placeholder="Enter Vendor or Supplier Name..."
              style={{
                flex: 1,
                height: '38px',
                border: '1px solid #DDD0C4',
                borderRadius: '6px',
                padding: '0 0.875rem',
                fontSize: '0.85rem',
                outline: 'none',
                color: '#2A1628',
              }}
            />
            <button
              onClick={handleAddVendor}
              disabled={creatingVendor || !newVendorName.trim()}
              style={{
                background: '#2A1628',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: newVendorName.trim() ? 'pointer' : 'default',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                opacity: newVendorName.trim() ? 1 : 0.6,
              }}
            >
              Add Partner
            </button>
          </div>
        </div>

        {parseAlerts && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Data Integrity warnings
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#b45309', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {parseAlerts?.transaction_alert_message && <li>{parseAlerts?.transaction_alert_message}</li>}
              {parseAlerts?.vat_alert_message && <li>{parseAlerts?.vat_alert_message}</li>}
              {parseAlerts?.three_month_consequences && <li>{parseAlerts?.three_month_consequences}</li>}
            </ul>
          </div>
        )}
      </div>
      */}
    </div>
  );
}

