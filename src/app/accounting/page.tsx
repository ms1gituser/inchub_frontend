'use client';

import React, { useState, useEffect, useRef } from 'react';
import { get, post } from '@/lib/apiClient';

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

export default function AccountingPage() {
  // State variables
  const [kycChecklist, setKycChecklist] = useState<KycItem[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [lockedMonths, setLockedMonths] = useState<string[]>([]);
  const [ctFilings, setCtFilings] = useState<any[]>([]);
  const [lockError, setLockError] = useState<string | null>(null);

  // AI Bookkeeping states
  const [parsing, setParsing] = useState(false);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [parseAlerts, setParseAlerts] = useState<any>(null);
  const [newVendorName, setNewVendorName] = useState('');
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [pushingQb, setPushingQb] = useState(false);

  // Corporate Tax form state
  const [ctYear, setCtYear] = useState('2026');
  const [ctTurnover, setCtTurnover] = useState('520000');
  const [ctTaxableIncome, setCtTaxableIncome] = useState('95000');
  const [filingCt, setFilingCt] = useState(false);

  // Whisper meeting recorder states
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all initial dashboard data
  useEffect(() => {
    fetchKyc();
    fetchProfile();
    fetchCtArchive();
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
      setRecordingDuration(0);
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [recording]);

  const fetchKyc = async () => {
    try {
      setLoadingKyc(true);
      const res = await get<any>('/bookkeeping/kyc');
      if (res?.success) {
        setKycChecklist(res.data);
      }
    } catch (e) {
      console.error('[KYC Fetch Error]', e);
    } finally {
      setLoadingKyc(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await get<any>('/bookkeeping/profile');
      if (res?.success) {
        setProfile(res.data);
      }
    } catch (e) {
      console.error('[Profile Fetch Error]', e);
    }
  };

  const fetchCtArchive = async () => {
    try {
      const res = await get<any>('/bookkeeping/ct/archive');
      if (res?.success) {
        setLockedMonths(res.data.monthly_archives?.map((a: any) => a.period) || []);
        setCtFilings(res.data.corporate_tax_filings || []);
      }
    } catch (e) {
      console.error('[Archive Fetch Error]', e);
    }
  };

  // Triggers immediate expire for testing indicators
  const handleForceExpirePassport = async () => {
    try {
      const res = await post<any>('/bookkeeping/kyc/expire', { name: 'Passport of Beneficial Owners' });
      if (res?.success) {
        await fetchKyc();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('kyc-changed'));
        }
      }
    } catch (e) {
      console.error('[Force Expire Error]', e);
    }
  };

  // Sequential period lock logic
  const handleLockMonth = async (monthNum: number) => {
    try {
      setLockError(null);
      const res = await post<any>('/bookkeeping/periods/lock', { year: 2026, month: monthNum });
      if (res?.success) {
        await fetchCtArchive();
        await fetchProfile();
      }
    } catch (e: any) {
      console.error('[Period Lock Error]', e);
      setLockError(e.message || 'Month-Lock Gate Error: Sequential month close constraints violated.');
    }
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
        const res = await post<any>('/bookkeeping/parse', {
          file: base64,
          mime_type: file.type || 'application/pdf',
          push_to_akaunting: false,
        });

        if (res?.success) {
          setLedger(res.data.ledger || []);
          setParseAlerts(res.data.alerts || null);
          await fetchProfile();
          await fetchCtArchive();
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('[Upload Parse Error]', err);
      alert(err.message || 'OCR parsing failed. Check network or server.');
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
      const res = await post<any>('/bookkeeping/reconciliation/vendors', { name: newVendorName });
      if (res?.success) {
        alert(`Vendor "${newVendorName}" created successfully inside reconciliation workspace.`);
        setNewVendorName('');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to create vendor.');
    } finally {
      setCreatingVendor(false);
    }
  };

  // QuickBooks sync and auth redirection
  const handleQuickBooksPush = async () => {
    if (ledger.length === 0) {
      alert('Please upload and parse a statement first to construct a ledger.');
      return;
    }
    setPushingQb(true);
    try {
      const res = await post<any>('/bookkeeping/integrations/quickbooks/push', { ledger });
      if (res?.success) {
        alert(`QuickBooks sync completed successfully! Reconciled ${res.data.pushed_count} transactions.`);
      }
    } catch (e: any) {
      console.error(e);
      if (e.status === 412) {
        // Redirection for OAuth setup
        try {
          const authRes = await get<any>('/bookkeeping/integrations/quickbooks/auth');
          if (authRes?.success && authRes.authorizationUrl) {
            if (confirm('QuickBooks Online is not connected. Redirect to secure QuickBooks OAuth link?')) {
              window.location.href = authRes.authorizationUrl;
            }
          }
        } catch (authErr) {
          console.error(authErr);
        }
      } else {
        alert(e.message || 'Sync failed. Verify credential parameters.');
      }
    } finally {
      setPushingQb(false);
    }
  };

  // Year-End Corporate Tax submit
  const handleFileCorporateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilingCt(true);
    try {
      const res = await post<any>('/bookkeeping/ct/file', {
        year: parseInt(ctYear),
        intake_form_data: {
          turnover_aed: parseFloat(ctTurnover),
          taxable_income_aed: parseFloat(ctTaxableIncome),
        },
      });

      if (res?.success) {
        alert(`Year-end Corporate Tax return submitted for FY ${ctYear}!`);
        await fetchCtArchive();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit Corporate Tax returns.');
    } finally {
      setFilingCt(false);
    }
  };

  const handleFileDownload = async (key: string) => {
    try {
      const res = await get<any>(`/files/download?key=${encodeURIComponent(key)}`);
      if (res?.success && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else {
        alert('Failed to obtain download URL from server.');
      }
    } catch (err: any) {
      console.error('[Download Error]', err);
      alert(err.message || 'Error fetching secure link.');
    }
  };

  // Whisper simulation trigger
  const handleRecordMeeting = async () => {
    if (!recording) {
      setRecording(true);
    } else {
      setRecording(false);
      setTranscribing(true);
      try {
        const res = await post<any>('/chat/transcribe', { simulate: true });
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

  const currentYear = 2026;
  const currentMonthNum = 5; // May

  // Progress calculations
  const baselineTransactions = profile?.contract_baseline_transactions || 250;
  const currentTransactions = profile?.current_monthly_transactions || 0;
  const transactionPercentage = Math.min((currentTransactions / baselineTransactions) * 100, 100);

  const cumulativeTurnover = Number(profile?.current_turnover_aed || 0);

  // UAE VAT limits definition
  const vatLimitVoluntary = 185000;
  const vatLimitWarning = 300000;
  const vatLimitCritical = 350000;
  const vatLimitMandatory = 375000;

  const getVatStatusText = () => {
    if (cumulativeTurnover >= vatLimitMandatory) return 'MANDATORY REGISTRATION OVERDUE';
    if (cumulativeTurnover >= vatLimitCritical) return 'CRITICAL WARNING LADDER';
    if (cumulativeTurnover >= vatLimitWarning) return 'VOLUNTARY LIMIT APPROACHING';
    if (cumulativeTurnover >= vatLimitVoluntary) return 'VOLUNTARY REGISTRATION AVAILABLE';
    return 'STANDARD RETAINER RETENTION';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: '#2A1628', fontFamily: 'Inter, sans-serif', fontWeight: 300, lineHeight: 1.85 }}>
      {/* Brand Workspace Header */}
      <div style={{ borderBottom: '1px solid #DDD0C4', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E8760A', display: 'inline-block' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Financial Services • UAE Compliance
          </p>
        </div>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, color: '#2A1628', letterSpacing: '-0.02em', fontFamily: 'Cormorant, serif' }}>
          Accounting Operations & <span style={{ fontFamily: 'Cormorant, serif', fontStyle: 'italic' }}>AI Bookkeeping</span>
        </h1>
      </div>

      {/* Empty State Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'rgba(42,22,40,0.5)', background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: 12, padding: '2rem' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F6F2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8760A', marginBottom: '0.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#2A1628', margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Accounting & Bookkeeping Workspace
        </h2>
        <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '380px', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
          This workspace is undergoing compliance configuration. Access is currently restricted.
        </p>
      </div>

      {false && (
        <>
          {/* Row 1: KYC Compliance Checklist & Month-Lock Sequential Gate */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* KYC Compliance Checklist */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
              DNFBP KYC Checklist
            </h2>
            <button
              onClick={handleForceExpirePassport}
              style={{
                background: 'transparent',
                border: '1px dashed #ef4444',
                color: '#ef4444',
                padding: '0.35rem 0.75rem',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Force Expire Passport
            </button>
          </div>

          {loadingKyc ? (
            <p style={{ fontSize: '0.85rem', color: 'rgba(42,22,40,0.5)' }}>Loading KYC checklist data...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {kycChecklist.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#F6F2EE', borderRadius: '6px', border: '1px solid #DDD0C4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(item.status) }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#2A1628' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {item.status.toUpperCase()} {item.expiry_date ? `(${item.expiry_date})` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Month-Lock Sequential Gate */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
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
                    padding: '0.75rem',
                    background: isLocked ? '#EDE6DE' : '#ffffff',
                    border: `1px solid ${isLocked ? '#DDD0C4' : '#E8760A'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
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
                        padding: '0.3rem 0',
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
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{lockError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Transaction Usage Tracker & VAT Voluntary Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Transaction Usage Tracker */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
            Transaction Count limits
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            <span>Monthly Usage</span>
            <span>{currentTransactions} / {baselineTransactions} transactions</span>
          </div>
          {/* Progress Bar */}
          <div style={{ height: '10px', background: '#F6F2EE', borderRadius: '9999px', overflow: 'hidden', border: '1px solid #DDD0C4', marginBottom: '1rem' }}>
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
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
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
            <span>AED 300k (Warning)</span>
            <span>AED 350k (Critical)</span>
            <span>AED 375k (Mandatory)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cumulativeTurnover >= vatLimitMandatory ? '#ef4444' : cumulativeTurnover >= vatLimitVoluntary ? '#f59e0b' : '#10b981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#2A1628' }}>
              CURRENT AUDIT: {getVatStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: 9-Stage AI Bookkeeping Engine Panel */}
      <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)' }}>
        <div style={{ borderBottom: '1px solid #DDD0C4', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
            9-Stage AI Bookkeeping Workspace
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              style={{
                background: '#2A1628',
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
              onMouseEnter={(e) => { e.currentTarget.style.background = '#3D2040'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2A1628'; }}
            >
              {parsing ? 'PROCESSING OCR...' : 'UPLOAD STATEMENT'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleStatementUpload}
              style={{ display: 'none' }}
              accept=".pdf,.csv,.png,.jpg,.jpeg"
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
              {pushingQb ? 'SYNCING...' : 'SYNC TO QUICKBOOKS'}
            </button>
          </div>
        </div>

        {/* Ledger Construction Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.75rem' }}>
            Extracted ledger entries
          </h3>
          {ledger.length === 0 ? (
            <div style={{ height: '140px', border: '1px dashed #DDD0C4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(42,22,40,0.5)', fontSize: '0.85rem' }}>
              No statement parsed yet. Upload a bank statement file to construct the ledger.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #DDD0C4', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: '#F6F2EE', borderBottom: '1px solid #DDD0C4' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Reference</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Amount (AED)</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Match Level</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === ledger.length - 1 ? 'none' : '1px solid #DDD0C4' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{entry.date}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{entry.description}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'rgba(42,22,40,0.6)' }}>{entry.reference || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: entry.type === 'debit' ? '#ef4444' : '#10b981' }}>
                        {entry.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', color: entry.type === 'debit' ? '#ef4444' : '#10b981' }}>
                        {entry.type === 'debit' ? 'DR (OUT)' : 'CR (IN)'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                          Exact AI Match (L1)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Counterparty Creator Panel */}
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

        {/* OCR Warnings Block */}
        {parseAlerts && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Data Integrity warnings
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#b45309', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {parseAlerts.transaction_alert_message && <li>{parseAlerts.transaction_alert_message}</li>}
              {parseAlerts.vat_alert_message && <li>{parseAlerts.vat_alert_message}</li>}
              {parseAlerts.three_month_consequences && <li>{parseAlerts.three_month_consequences}</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Row 4: Corporate Tax return filing & meeting transcribe recorder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '1.5rem' }}>
        {/* Corporate Tax return filing */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
            Year-End CT Filing Form
          </h2>

          <form onSubmit={handleFileCorporateTax} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.35rem' }}>
                Filing Year
              </label>
              <input
                type="number"
                value={ctYear}
                onChange={(e) => setCtYear(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0 0.75rem', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.35rem' }}>
                Annual Turnover (AED)
              </label>
              <input
                type="number"
                value={ctTurnover}
                onChange={(e) => setCtTurnover(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0 0.75rem', fontSize: '0.85rem' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2A1628', marginBottom: '0.35rem' }}>
                Taxable Income (AED)
              </label>
              <input
                type="number"
                value={ctTaxableIncome}
                onChange={(e) => setCtTaxableIncome(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #DDD0C4', borderRadius: '6px', padding: '0 0.75rem', fontSize: '0.85rem' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={filingCt}
              style={{
                width: '100%',
                background: '#2A1628',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.6rem 0',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#3D2040'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2A1628'; }}
            >
              {filingCt ? 'FILING CT RETURN...' : 'SUBMIT TAX FILING'}
            </button>
          </form>

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
                  <div key={idx} style={{ padding: '0.5rem 0.75rem', background: '#F6F2EE', border: '1px solid #DDD0C4', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(42,22,40,0.03)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2A1628' }}>
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
        </>
      )}
    </div>
  );
}
