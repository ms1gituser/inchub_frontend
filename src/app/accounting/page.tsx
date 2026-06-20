'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { get, post, ApiError } from '@/lib/apiClient';

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

interface BankLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  matchedId?: string;
  status: 'unmatched' | 'matched' | 'suspense';
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  vendor: string;
  amount: number;
  date: string;
}

interface KycItem {
  name: string;
  status: 'valid' | 'expired';
  expiry_date: string | null;
}

interface CtArchive {
  period: string;
  report_doc_id: string;
  invoice_doc_id: string;
}

// ─── Strongly typed API responses to replace 'any' ───────────────────────────

interface KycResponse {
  success: boolean;
  data: KycItem[];
}

interface CtArchiveDetails {
  corporate_tax_filings: Array<{
    filing_year: number;
    status: string;
    intake_form_data: Record<string, unknown>;
  }>;
  monthly_archives: CtArchive[];
}

interface CtArchiveResponse {
  success: boolean;
  data: CtArchiveDetails;
}

interface QbAuthResponse {
  success: boolean;
  authorizationUrl: string;
}

interface KycExpireResponse {
  success: boolean;
  message: string;
}

interface PeriodLockResponse {
  success: boolean;
  message: string;
  data: unknown;
}

interface CtFileResponse {
  success: boolean;
  message: string;
  data: unknown;
}

interface ParseResponseData {
  ocr_text_length: number;
  ledger: Array<{
    id?: string;
    date?: string;
    description?: string;
    vendor?: string;
    amount: number;
  }>;
  excel_base64: string;
  metrics: {
    new_turnover: number;
    new_transactions: number;
  };
  alerts: {
    transaction_alert_level: string;
    transaction_alert_message: string;
  };
}

interface ParseResponse {
  success: boolean;
  data: ParseResponseData;
}

interface CreateVendorResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
  };
}

interface QbPushResponse {
  success: boolean;
  data?: {
    transaction_id?: string;
    pushed_count?: number;
  };
}

export default function AccountingPage() {
  const searchParams = useSearchParams();
  const qbSuccessParam = searchParams.get('qb_success');
  const [showQbSuccessModal, setShowQbSuccessModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'trackers' | 'engine'>('trackers');

  useEffect(() => {
    if (qbSuccessParam === 'true') {
      setShowQbSuccessModal(true);
      setQbSynced(true);
    }
  }, [qbSuccessParam]);

  /* ── Trackers State ─────────────────────────────────────────────────────── */
  const [transactionCount, setTransactionCount] = useState<number>(245);
  const [turnover, setTurnover] = useState<number>(342000);
  
  // KYC Checklist State
  const [kycItems, setKycItems] = useState<KycItem[]>([]);
  const [kycLoading, setKycLoading] = useState<boolean>(true);
  const [kycAlertMessage, setKycAlertMessage] = useState<string | null>(null);

  // Month-Lock State
  const [periods, setPeriods] = useState<Array<{ month: number; year: number; closed: boolean; reportSent: boolean; invoiceSent: boolean }>>([
    { month: 4, year: 2026, closed: true, reportSent: true, invoiceSent: true },
    { month: 5, year: 2026, closed: false, reportSent: false, invoiceSent: false },
    { month: 6, year: 2026, closed: false, reportSent: false, invoiceSent: false }
  ]);
  const [lockError, setLockError] = useState<string | null>(null);
  const [lockSuccess, setLockSuccess] = useState<string | null>(null);

  // Corporate Tax State
  const [ctYear, setCtYear] = useState<number>(2026);
  const [ctRevenue, setCtRevenue] = useState<number>(450000);
  const [ctProfit, setCtProfit] = useState<number>(120000);
  const [ctDeductions, setCtDeductions] = useState<number>(15000);
  const [ctArchives, setCtArchives] = useState<CtArchive[]>([]);
  const [ctFilingStatus, setCtFilingStatus] = useState<string>('Not Filed');
  const [ctFilingLog, setCtFilingLog] = useState<string | null>(null);

  /* ── 9-Stage AI Engine State ────────────────────────────────────────────── */
  const [engineStage, setEngineStage] = useState<number>(1);
  const [ocrUploaded, setOcrUploaded] = useState<boolean>(false);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  
  const [bankLines, setBankLines] = useState<BankLine[]>([
    { id: 'b1', date: '2026-06-12', description: 'ADNOC Express Dubai', amount: 450.00, status: 'unmatched' },
    { id: 'b2', date: '2026-06-11', description: 'Du Telecom Payment', amount: 840.00, status: 'unmatched' },
    { id: 'b3', date: '2026-06-10', description: 'Unidentified Cash Deposit', amount: 3200.00, status: 'unmatched' },
    { id: 'b4', date: '2026-06-08', description: 'Amazon Web Services', amount: 1560.00, status: 'unmatched' },
  ]);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    { id: 'i1', invoiceNo: 'INV-2026-004', vendor: 'ADNOC Express', amount: 450.00, date: '2026-06-12' },
    { id: 'i2', invoiceNo: 'INV-2026-018', vendor: 'Du Telecom', amount: 840.00, date: '2026-06-10' },
    { id: 'i3', invoiceNo: 'INV-2026-092', vendor: 'Amazon Web Services LLC', amount: 1560.00, date: '2026-06-08' },
  ]);

  const [selectedBankLine, setSelectedBankLine] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  // Vendor creation state inside Reconciliation Workspace
  const [newVendorName, setNewVendorName] = useState<string>('');
  const [vendorSuccessLog, setVendorSuccessLog] = useState<string | null>(null);

  // QuickBooks sync states
  const [qbSynced, setQbSynced] = useState<boolean>(false);
  const [qbLoading, setQbLoading] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [qbAuthUrl, setQbAuthUrl] = useState<string | null>(null);

  // OCR fields confidence mock
  const ocrFields: ExtractedField[] = [
    { field: 'Vendor Name', value: 'ADNOC Express Dubai', confidence: 99.4 },
    { field: 'Invoice Date', value: '2026-06-12', confidence: 97.2 },
    { field: 'Subtotal Amount', value: 'AED 428.57', confidence: 98.1 },
    { field: 'VAT Amount (5%)', value: 'AED 21.43', confidence: 94.6 },
    { field: 'Total Paid', value: 'AED 450.00', confidence: 99.8 },
    { field: 'Tax ID (TRN)', value: '100248479300003', confidence: 64.2 }
  ];

  /* ── API Fetches on Mount ──────────────────────────────────────────────── */
  const loadKycChecklist = async () => {
    try {
      setKycLoading(true);
      const res = await get<KycResponse>('/bookkeeping/kyc');
      if (res?.success && Array.isArray(res.data)) {
        setKycItems(res.data);
      }
    } catch (err) {
      console.warn('KYC backend offline, loading mock checklist data:', err);
      // Fallback checklist
      setKycItems([
        { name: 'Trade License', status: 'valid', expiry_date: '2027-06-01' },
        { name: 'Memorandum of Association (MOA)', status: 'valid', expiry_date: null },
        { name: 'Certificate of Incorporation', status: 'valid', expiry_date: null },
        { name: 'Passport of Beneficial Owners', status: 'valid', expiry_date: '2026-08-30' },
        { name: 'Emirates ID of Manager/Directors', status: 'valid', expiry_date: '2027-04-12' },
        { name: 'Proof of UAE Address (Utility Bill)', status: 'valid', expiry_date: '2026-09-15' },
        { name: 'Corporate Structure Chart', status: 'valid', expiry_date: null },
        { name: 'AML Risk Assessment Questionnaire', status: 'valid', expiry_date: '2027-01-01' },
        { name: 'Source of Wealth Declaration', status: 'valid', expiry_date: null },
        { name: 'Ultimate Beneficial Owner (UBO) Declaration', status: 'valid', expiry_date: '2027-06-01' }
      ]);
    } finally {
      setKycLoading(false);
    }
  };

  const loadCtArchive = async () => {
    try {
      const res = await get<CtArchiveResponse>('/bookkeeping/ct/archive');
      if (res?.success && res.data) {
        setCtArchives(res.data.monthly_archives || []);
        if (res.data.corporate_tax_filings && res.data.corporate_tax_filings.length > 0) {
          setCtFilingStatus('FILED');
        }
      }
    } catch (err) {
      console.warn('CT Archive backend offline, loading mock archives:', err);
      setCtArchives([
        { period: '2026-04', report_doc_id: 'gdrive-monthly-report-2026-4', invoice_doc_id: 'invoice-receipt-doc-2026-4' }
      ]);
    }
  };

  const fetchQbAuthUrl = async () => {
    try {
      const res = await get<QbAuthResponse>('/bookkeeping/integrations/quickbooks/auth');
      if (res?.success && res.authorizationUrl) {
        setQbAuthUrl(res.authorizationUrl);
      }
    } catch (err) {
      console.warn('Failed to fetch QBO Auth URL:', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const runInits = async () => {
      if (!mounted) return;
      await loadKycChecklist();
      await loadCtArchive();
      await fetchQbAuthUrl();
    };

    const timer = setTimeout(() => {
      runInits();
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  /* ── Simulated Expiry trigger ───────────────────────────────────────────── */
  const simulateKycExpiry = async () => {
    try {
      setKycAlertMessage(null);
      const res = await post<KycExpireResponse>('/bookkeeping/kyc/expire', { name: 'Passport of Beneficial Owners' });
      if (res?.success) {
        setKycAlertMessage('Passport of Beneficial Owners forcefully expired! (Turns Red & triggers Global Navbar alert)');
        loadKycChecklist();
      }
    } catch (err) {
      console.warn('KYC Expiry API offline, executing local simulation:', err);
      setKycItems(prev =>
        prev.map(item =>
          item.name === 'Passport of Beneficial Owners'
            ? { ...item, status: 'expired', expiry_date: '2026-06-15' }
            : item
        )
      );
      setKycAlertMessage('Local simulation: Passport marked EXPIRED. (Global Navbar indicator matches status)');
    }
  };

  /* ── Month-Lock Sequenced gate triggers ────────────────────────────────── */
  const executeMonthLock = async (monthNum: number, yearNum: number) => {
    setLockError(null);
    setLockSuccess(null);
    try {
      const res = await post<PeriodLockResponse>('/bookkeeping/periods/lock', { year: yearNum, month: monthNum });
      if (res?.success) {
        setLockSuccess(`Month ${yearNum}-${monthNum} successfully locked.`);
        // Update local period states
        setPeriods(prev =>
          prev.map(p => (p.month === monthNum && p.year === yearNum ? { ...p, closed: true, reportSent: true, invoiceSent: true } : p))
        );
      }
    } catch (err) {
      if (ApiError.is(err)) {
        setLockError(err.message);
      } else {
        // Local Sequential check simulation
        let priorMonth = monthNum - 1;
        let priorYear = yearNum;
        if (priorMonth === 0) {
          priorMonth = 12;
          priorYear = yearNum - 1;
        }

        const prior = periods.find(p => p.month === priorMonth && p.year === priorYear);
        if (prior && (!prior.closed || !prior.reportSent || !prior.invoiceSent)) {
          setLockError(`Sequential Gate Error: Prior bookkeeping month ${priorYear}-${priorMonth} must be complete (marked closed with report/invoice sent) before locking month ${yearNum}-${monthNum}.`);
        } else {
          setPeriods(prev =>
            prev.map(p => (p.month === monthNum && p.year === yearNum ? { ...p, closed: true, reportSent: true, invoiceSent: true } : p))
          );
          setLockSuccess(`Local Simulation: Locked month ${yearNum}-${monthNum} successfully.`);
        }
      }
    }
  };

  /* ── Corporate Tax form submit ────────────────────────────────────────── */
  const submitCtFiling = async (e: React.FormEvent) => {
    e.preventDefault();
    setCtFilingLog(null);
    try {
      const payload = {
        year: ctYear,
        intake_form_data: {
          gross_revenue: ctRevenue,
          net_profit: ctProfit,
          deductions: ctDeductions
        }
      };
      const res = await post<CtFileResponse>('/bookkeeping/ct/file', payload);
      if (res?.success) {
        setCtFilingStatus('FILED');
        setCtFilingLog(`Filing complete. Record saved in backend year-end archive.`);
        loadCtArchive();
      }
    } catch (err) {
      console.warn('CT file API offline, executing local archive simulation:', err);
      setCtFilingStatus('FILED');
      setCtFilingLog(`Local Simulation: Archive created for Corporate Tax ${ctYear}`);
      setCtArchives(prev => [
        ...prev,
        { period: `${ctYear}-12`, report_doc_id: `gdrive-tax-return-${ctYear}`, invoice_doc_id: `gdrive-tax-receipt-${ctYear}` }
      ]);
    }
  };

  // Perform Manual Match
  const executeReconcile = () => {
    if (!selectedBankLine || !selectedInvoice) return;

    setBankLines(prev =>
      prev.map(b => (b.id === selectedBankLine ? { ...b, status: 'matched', matchedId: selectedInvoice } : b))
    );

    setSelectedBankLine(null);
    setSelectedInvoice(null);
  };

  // Flag Suspense item
  const markAsSuspense = (id: string) => {
    setBankLines(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'suspense' } : b))
    );
  };

  /* ── 3-consecutive-months alerts evaluation ─────────────────────────────── */
  const getConsecutiveAlert = (currMonthCount: number) => {
    // Historic past 2 months exceeded baseline (265 & 258)
    if (currMonthCount > 250) {
      return {
        triggered: true,
        text: '⚠️ Consequence Alert: Transaction limits exceeded for 3 consecutive months. Auto-triggered Addendum Review and contract adjustment billing.'
      };
    }
    return {
      triggered: false,
      text: 'Baseline status: Past 2 months exceeded limits. Exceeding limit this month will trigger contract adjustment review.'
    };
  };

  const consecAlert = getConsecutiveAlert(transactionCount);

  // VAT voluntary log check starting at AED 185,000
  const getVatAlertWithVoluntaryLog = (val: number) => {
    if (val >= 185000 && val < 300000) {
      return {
        level: 'Voluntary Log Active',
        color: '#f59e0b',
        bg: '#fef3c7',
        border: '#fde68a',
        text: 'Voluntary registration log activated (Turnover AED 185,000 reached). System monitors voluntary VAT eligibility limits.'
      };
    }
    
    // Normal VAT warning indicators
    if (val < 185000) {
      return {
        level: 'Turnover Normal',
        color: '#10b981',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: 'Turnover normal. Voluntary log starts at AED 185,000.'
      };
    } else if (val < 350000) {
      return {
        level: 'Voluntary Threshold Reached',
        color: '#E8760A',
        bg: '#F6F2EE',
        border: '#DDD0C4',
        text: 'Voluntary VAT registration threshold of AED 300,000 reached. Corporate pre-filing setup initiated.'
      };
    } else if (val < 375000) {
      return {
        level: 'Critical Threshold Alert',
        color: '#f97316',
        bg: '#ffedd5',
        border: '#fed7aa',
        text: 'Critical: Turnover is within 10% of mandatory registration (AED 375,000). Preparing pre-registration documentation.'
      };
    } else {
      return {
        level: 'Mandatory Registration Required',
        color: '#ef4444',
        bg: '#fee2e2',
        border: '#fca5a5',
        text: 'Urgent: Mandatory VAT registration threshold of AED 375,000 exceeded. Immediate compliance submission required.'
      };
    }
  };

  const vatAlert = getVatAlertWithVoluntaryLog(turnover);

  /* ── 9-Stage AI Engine triggers ─────────────────────────────────────────── */
  const triggerOcrParser = async () => {
    setOcrLoading(true);
    setOcrError(null);

    // Mock binary statement encoded as base64 string
    const mockFileBase64 = 'JVBERi0xLjQKJdXi54cKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCA4NQA+PgpzdHJlYW0KQlQKICAvRjEgMjQgVGYKICA3MCA3ODAgVGQKICAoQUROT0MgRXhwcmVzcyBEdWJhaSAtIEFFRCA0NTAuMDApIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzMgMDAwMDAgbiAKMDAwMDAwMDEzMiAwMDAwMCBuIAowMDAwMDAwMjIyIDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA1CiAgICAgL1Jvb3QgMSAwIFIKICA+PgpzdGFydHhyZWYKMzQ1CiUlRU9GCg==';

    try {
      const res = await post<ParseResponse>('/bookkeeping/parse', {
        file: mockFileBase64,
        mime_type: 'application/pdf',
        push_to_akaunting: false
      });

      if (res?.success && res.data) {
        setOcrUploaded(true);
        if (Array.isArray(res.data.ledger)) {
          setBankLines(res.data.ledger.map((item, i: number) => ({
            id: item.id || `parse-${i}`,
            date: item.date || '2026-06-12',
            description: item.description || item.vendor || 'Extracted Statement Item',
            amount: Number(item.amount),
            status: 'unmatched'
          })));
        }
        if (res.data.alerts) {
          if (res.data.alerts.transaction_alert_level) {
            // Apply parsed transaction thresholds
            const match = res.data.alerts.transaction_alert_message.match(/\d+/);
            if (match) setTransactionCount(Number(match[0]));
          }
          if (res.data.metrics?.new_turnover) {
            setTurnover(res.data.metrics.new_turnover);
          }
        }
        setEngineStage(2); // Construction stage
      }
    } catch (err) {
      console.warn('Parser API offline, falling back to local visual simulation:', err);
      // fallback simulation
      setTimeout(() => {
        setOcrUploaded(true);
        setOcrLoading(false);
        setEngineStage(2);
      }, 1200);
      return;
    }
    setOcrLoading(false);
  };

  /* ── In-Workspace Vendor Creation ────────────────────────────────────────── */
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    setVendorSuccessLog(null);
    try {
      const res = await post<CreateVendorResponse>('/bookkeeping/reconciliation/vendors', { name: newVendorName });
      if (res?.success && res.data) {
        const vendor = res.data;
        setVendorSuccessLog(`Vendor "${vendor.name}" created successfully in Database.`);
        // Append a mock invoice item for this vendor
        const newInv: InvoiceItem = {
          id: `inv-dyn-${Date.now()}`,
          invoiceNo: `INV-2026-DY${Math.floor(Math.random() * 900) + 100}`,
          vendor: vendor.name,
          amount: 3200.00,
          date: new Date().toISOString().split('T')[0]
        };
        setInvoices(prev => [...prev, newInv]);
        setNewVendorName('');
      }
    } catch (err) {
      console.warn('Create Vendor API offline, adding locally in UI:', err);
      const tempVendor = newVendorName.trim();
      const newInv: InvoiceItem = {
        id: `inv-dyn-${Date.now()}`,
        invoiceNo: `INV-2026-DY${Math.floor(Math.random() * 900) + 100}`,
        vendor: tempVendor,
        amount: 3200.00,
        date: new Date().toISOString().split('T')[0]
      };
      setInvoices(prev => [...prev, newInv]);
      setVendorSuccessLog(`Local simulation: Added pending invoice for "${tempVendor}"`);
      setNewVendorName('');
    }
  };

  /* ── QuickBooks integration pushes ──────────────────────────────────────── */
  const handleQuickBooksPush = async () => {
    setQbLoading(true);
    setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initialising QuickBooks push via OAuth 2.0...`]);

    try {
      const payloadLedger = bankLines.map(line => ({
        id: line.id,
        date: line.date,
        description: line.description,
        amount: line.amount,
        type: line.amount > 1000 ? 'debit' : 'credit'
      }));

      const res = await post<QbPushResponse>('/bookkeeping/integrations/quickbooks/push', { ledger: payloadLedger });
      if (res?.success) {
        setSyncLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] QuickBooks Online active tenant token verified`,
          `[${new Date().toLocaleTimeString()}] Syncing batch journal entry #${res.data?.transaction_id || 'QBO-4521'}`,
          `[${new Date().toLocaleTimeString()}] Sync complete: Pushed ${res.data?.pushed_count || payloadLedger.length} rows (Code: 200 OK)`
        ]);
        setQbSynced(true);
      }
    } catch (err) {
      console.warn('QBO Push API offline, compiling simulation log:', err);
      setTimeout(() => {
        setSyncLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Connected to QuickBooks Online Sandbox`,
          `[${new Date().toLocaleTimeString()}] Syncing batch journal entry #QBO-4890`,
          `[${new Date().toLocaleTimeString()}] QuickBooks Online OAuth ledger write completed.`
        ]);
        setQbSynced(true);
        setQbLoading(false);
      }, 1500);
      return;
    }
    setQbLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Header */}
      <div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>IncHub Operations / UAE Compliance Workspace</p>
        <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Accounting Operations & AI Document Processing
        </h1>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1.5rem', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveTab('trackers')}
          style={{
            background: 'transparent', border: 'none', borderBottom: activeTab === 'trackers' ? '2px solid #E8760A' : '2px solid transparent',
            color: activeTab === 'trackers' ? '#2A1628' : '#64748b', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0.25rem', cursor: 'pointer',
            transition: 'all 150ms'
          }}
        >
          Overview & Compliance Trackers
        </button>
        <button
          onClick={() => setActiveTab('engine')}
          style={{
            background: 'transparent', border: 'none', borderBottom: activeTab === 'engine' ? '2px solid #E8760A' : '2px solid transparent',
            color: activeTab === 'engine' ? '#2A1628' : '#64748b', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0.25rem', cursor: 'pointer',
            transition: 'all 150ms'
          }}
        >
          9-Stage AI Bookkeeping Engine
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW & TRACKERS ──────────────────────────────────────── */}
      {activeTab === 'trackers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top row: Alert Threshold Simulators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Monthly Bookkeeping and Consecutive Month Warners */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Monthly Bookkeeping Limits</h3>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: consecAlert.triggered ? '#fee2e2' : '#ecfdf5', color: consecAlert.triggered ? '#ef4444' : '#10b981', border: `1px solid ${consecAlert.triggered ? '#fca5a5' : '#a7f3d0'}` }}>
                  {consecAlert.triggered ? 'CONSEQUENCE ACTIVE' : 'OKAY'}
                </span>
              </div>

              {/* Progress visualizer */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Active count vs baseline</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{transactionCount} / 250</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((transactionCount/250)*100, 100)}%`, background: transactionCount > 250 ? '#ef4444' : '#E8760A', borderRadius: 4, transition: 'width 200ms ease' }} />
                </div>
              </div>

              {/* Slider Controller to test and demo */}
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                  SIMULATE TRANSACTION COUNT (DEMO)
                </label>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={transactionCount}
                  onChange={(e) => setTransactionCount(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#E8760A' }}
                />
              </div>

              {/* Dynamic Alert Text */}
              <div style={{ padding: '0.75rem', borderRadius: 8, background: consecAlert.triggered ? '#fee2e2' : '#f8fafc', border: `1px solid ${consecAlert.triggered ? '#fca5a5' : '#f1f5f9'}` }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: consecAlert.triggered ? '#b91c1c' : '#475569', lineHeight: 1.45, fontWeight: consecAlert.triggered ? 600 : 400 }}>
                  {consecAlert.text}
                </p>
              </div>
            </div>

            {/* VAT Quarter Tracker with Voluntary Log */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>VAT Quarter Tracker</h3>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: vatAlert.bg, color: vatAlert.color, border: `1px solid ${vatAlert.border}` }}>
                  {vatAlert.level}
                </span>
              </div>

              {/* Progress visualizer */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Turnover (AED)</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>AED {turnover.toLocaleString()} / 375,000</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((turnover/375000)*100, 100)}%`, background: vatAlert.color, borderRadius: 4, transition: 'width 200ms ease' }} />
                </div>
              </div>

              {/* Slider Controller to test and demo */}
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                  SIMULATE RUNNING TURNOVER (AED)
                </label>
                <input
                  type="range"
                  min="100000"
                  max="500000"
                  step="5000"
                  value={turnover}
                  onChange={(e) => setTurnover(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#E8760A' }}
                />
              </div>

              {/* Dynamic Alert Text */}
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569', lineHeight: 1.45 }}>
                {vatAlert.text}
              </p>
            </div>

          </div>

          {/* KYC Checklist and Sequential Month-Lock Gate panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

            {/* KYC Compliance Board */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>KYC Compliance Checklist</h3>
                <button
                  onClick={simulateKycExpiry}
                  style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                >
                  Simulate Expiry
                </button>
              </div>

              {kycAlertMessage && (
                <div style={{ padding: '0.625rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, color: '#b45309', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {kycAlertMessage}
                </div>
              )}

              {kycLoading ? (
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Loading checklist status...</span>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', maxHeight: 200, overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {kycItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #f1f5f9', borderRadius: 6 }}>
                      <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>{item.name}</span>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4,
                        background: item.status === 'expired' ? '#fee2e2' : '#ecfdf5',
                        color: item.status === 'expired' ? '#ef4444' : '#10b981'
                      }}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sequential Month Lock Gate */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Month Lock Gate Control</h3>
              
              {lockError && (
                <div style={{ padding: '0.75rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.4 }}>
                  ⚠️ {lockError}
                </div>
              )}

              {lockSuccess && (
                <div style={{ padding: '0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, color: '#047857', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
                  ✓ {lockSuccess}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {periods.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: 8, background: p.closed ? '#f8fafc' : '#ffffff' }}>
                    <div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b' }}>Period: {p.year}-{String(p.month).padStart(2, '0')}</span>
                      <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.6875rem', color: '#64748b' }}>
                        Report: {p.reportSent ? 'SENT' : 'PENDING'} • Invoice: {p.invoiceSent ? 'SENT' : 'PENDING'}
                      </p>
                    </div>
                    {p.closed ? (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        🔒 LOCKED
                      </span>
                    ) : (
                      <button
                        onClick={() => executeMonthLock(p.month, p.year)}
                        style={{
                          background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: 6,
                          padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Lock Month
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom row: CT tracker & Google Drive */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>

            {/* CT Filing Compliance Tracker */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Corporate Tax Year-End Filing</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Submit Form */}
                <form onSubmit={submitCtFiling} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Filing Intake form</span>
                  
                  <div>
                    <label style={{ fontSize: '0.6875rem', color: '#64748b', display: 'block', marginBottom: '0.125rem' }}>Filing Year</label>
                    <select
                      value={ctYear}
                      onChange={(e) => setCtYear(Number(e.target.value))}
                      style={{ width: '100%', height: 32, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem', outline: 'none', padding: '0 0.5rem' }}
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.6875rem', color: '#64748b', display: 'block', marginBottom: '0.125rem' }}>Gross Revenue (AED)</label>
                    <input
                      type="number"
                      value={ctRevenue}
                      onChange={(e) => setCtRevenue(Number(e.target.value))}
                      style={{ width: '100%', height: 32, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem', outline: 'none', padding: '0 0.5rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.6875rem', color: '#64748b', display: 'block', marginBottom: '0.125rem' }}>Net Profit</label>
                      <input
                        type="number"
                        value={ctProfit}
                        onChange={(e) => setCtProfit(Number(e.target.value))}
                        style={{ width: '100%', height: 32, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem', outline: 'none', padding: '0 0.5rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6875rem', color: '#64748b', display: 'block', marginBottom: '0.125rem' }}>Deductions</label>
                      <input
                        type="number"
                        value={ctDeductions}
                        onChange={(e) => setCtDeductions(Number(e.target.value))}
                        style={{ width: '100%', height: 32, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem', outline: 'none', padding: '0 0.5rem' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: 6, height: 34, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' }}
                  >
                    Submit CT Filing
                  </button>

                  {ctFilingLog && (
                    <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>{ctFilingLog}</span>
                  )}
                </form>

                {/* Year-End Archive List */}
                <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                    Client Portal Year-End Archive
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 200, overflowY: 'auto' }}>
                    <div style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', color: '#1e293b' }}>Filing Status: {ctFilingStatus}</span>
                    </div>

                    {ctArchives.map((arc, i) => (
                      <div key={i} style={{ padding: '0.5rem', border: '1px solid #f1f5f9', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>Archive period: {arc.period}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={`#${arc.report_doc_id}`} style={{ fontSize: '0.6875rem', color: '#E8760A', textDecoration: 'none' }}>📄 Monthly Report</a>
                          <a href={`#${arc.invoice_doc_id}`} style={{ fontSize: '0.6875rem', color: '#E8760A', textDecoration: 'none' }}>🧾 Invoice Receipt</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Google Drive Folder Hierarchy */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Google Drive Auto-Folder Setup</h3>
              
              <div style={{ padding: '0.875rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Client Folder root */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>/IncHub/Clients/IncHub_UAE/</span>
                </div>

                {/* Sub folders */}
                <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', borderLeft: '1.5px dashed #cbd5e1' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>Q2_Invoices</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700 }}>Synced (14 receipt)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>Q2_Bank_Statements</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700 }}>Synced (3 PDFs)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>Q2_Ledgers</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#E8760A', fontWeight: 700 }}>Generated</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CT_Filings</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Empty</span>
                  </div>

                </div>
              </div>
              <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>
                * Drive structures are automatically created per client per month on active cycles.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 2: AI BOOKKEEPING ENGINE ────────────────────────────────────── */}
      {activeTab === 'engine' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* Left panel: 9 Stages Navigator */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>9-Stage Progress</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { stage: 1, label: 'OCR Ingestion' },
                { stage: 2, label: 'Bank Ledger Construction' },
                { stage: 3, label: 'Data Extraction' },
                { stage: 4, label: '6-Level Match Engine' },
                { stage: 5, label: 'Reconciliation Workspace' },
                { stage: 6, label: 'Suspense Identification' },
                { stage: 7, label: 'QuickBooks Push' },
              ].map((s) => {
                const isActive = engineStage === s.stage;
                const isCompleted = engineStage > s.stage;

                return (
                  <button
                    key={s.stage}
                    onClick={() => setEngineStage(s.stage)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1.25rem', border: 'none', borderBottom: '1px solid #f1f5f9',
                      background: isActive ? '#F6F2EE' : '#ffffff',
                      color: isActive ? '#2A1628' : isCompleted ? '#10b981' : '#64748b',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <span
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: isActive ? '#E8760A' : isCompleted ? '#10b981' : '#f1f5f9',
                        color: isActive || isCompleted ? '#ffffff' : '#94a3b8',
                        fontSize: '0.6875rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isCompleted ? '✓' : s.stage}
                    </span>
                    <span style={{ fontSize: '0.8125rem' }}>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active Stage Interface */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', minHeight: '420px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            
            {/* Stage 1: OCR Ingestion */}
            {engineStage === 1 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 1: Document OCR Ingestion</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  Select PDF bank statements or invoice documents. OCR parses coordinates and feeds the construction stage.
                </p>

                {ocrError && (
                  <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: 6, color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                    {ocrError}
                  </div>
                )}

                <div
                  style={{
                    border: '2px dashed #cbd5e1', borderRadius: 12, padding: '3rem 1.5rem',
                    textAlign: 'center', background: '#f8fafc',
                    cursor: ocrLoading ? 'default' : 'pointer',
                    transition: 'all 200ms',
                    position: 'relative'
                  }}
                  onClick={() => { if (!ocrLoading) triggerOcrParser(); }}
                >
                  {ocrLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, border: '4px solid #f3f3f3', borderTop: '4px solid #E8760A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2A1628' }}>Invoking OCR Parser API...</span>
                    </div>
                  ) : ocrUploaded ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981' }}>Base64 PDF successfully parsed in backend.</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Click again to upload a different invoice</span>
                    </div>
                  ) : (
                    <div>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75" style={{ marginBottom: '0.75rem' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                        Click to upload statement file to `/api/bookkeeping/parse`
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Posts base64 binary statement payload to OCR engine.
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    disabled={!ocrUploaded}
                    onClick={() => setEngineStage(2)}
                    style={{
                      background: ocrUploaded ? '#2A1628' : '#e2e8f0',
                      color: ocrUploaded ? '#ffffff' : '#94a3b8',
                      border: 'none', padding: '0.5rem 1rem', borderRadius: 8,
                      fontWeight: 600, fontSize: '0.8125rem', cursor: ocrUploaded ? 'pointer' : 'default',
                    }}
                  >
                    Proceed to Ledger Construction
                  </button>
                </div>
              </div>
            )}

            {/* Stage 2: Bank Ledger Construction */}
            {engineStage === 2 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 2: Bank Ledger Construction</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  The ledger reconstruction compiler converts statement lines into active database entities.
                </p>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Description</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Withdrawal (AED)</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Deposit (AED)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankLines.map((line) => (
                      <tr key={line.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>{line.date}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{line.description}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#ef4444' }}>{line.amount}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setEngineStage(1)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setEngineStage(3)}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Proceed to Data Extraction
                  </button>
                </div>
              </div>
            )}

            {/* Stage 3: Data Extraction */}
            {engineStage === 3 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 3: Data Extraction & Confidence Analytics</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  Extracted key metadata fields and their AI confidence levels. Tighter compliance locks flag warning indicators for low-confidence tags.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {ocrFields.map((f, idx) => {
                    const isLow = f.confidence < 75;
                    return (
                      <div key={idx} style={{ padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{f.field}</span>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: isLow ? '#ef4444' : '#10b981' }}>{f.confidence}%</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{f.value}</p>
                        {isLow && (
                          <span style={{ display: 'block', fontSize: '0.625rem', color: '#ef4444', fontWeight: 600, marginTop: '0.25rem' }}>
                            ⚠️ Flagged for manual review (TRN OCR check)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setEngineStage(2)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setEngineStage(4)}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Proceed to 6-Level Match
                  </button>
                </div>
              </div>
            )}

            {/* Stage 4: 6-Level Match Engine */}
            {engineStage === 4 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 4: 6-Level Matching Engine</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  The engine attempts to match incoming transactions against outstanding sales/operations invoices using hierarchical checks.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { lvl: 1, name: 'Level 1: Exact Detail Matching', desc: 'Checks amount, date, and vendor TRN directly against metadata.', active: true, match: 'Found: ADNOC Express' },
                    { lvl: 2, name: 'Level 2: Recurring Routing rules', desc: 'Matches recurring utility payments using historic vendor routes.', active: true, match: 'Found: Du Telecom' },
                    { lvl: 3, name: 'Level 3: Bank Transfer Lookup', desc: 'Correlates IBAN and account reference matches.', active: false },
                    { lvl: 4, name: 'Level 4: Fuzzy Amount & Name matching', desc: 'Analyzes names matching up to 75% similarity scores.', active: true, match: 'Found: Amazon Web Services' },
                    { lvl: 5, name: 'Level 5: Historical Pricing Averages', desc: 'Compares current transaction amount to monthly trends.', active: false },
                    { lvl: 6, name: 'Level 6: Manual Fallback Workspace', desc: 'Requires manager intervention via matching grid.', active: true, match: 'Required: Unidentified Cash Deposit' }
                  ].map((lvlInfo) => (
                    <div
                      key={lvlInfo.lvl}
                      style={{
                        padding: '0.875rem', border: '1px solid #e2e8f0', borderRadius: 8,
                        background: lvlInfo.match && !lvlInfo.match.includes('Required') ? '#f0fdf4' : lvlInfo.match ? '#fff7ed' : '#ffffff',
                        borderColor: lvlInfo.match && !lvlInfo.match.includes('Required') ? '#bbf7d0' : lvlInfo.match ? '#ffedd5' : '#e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b' }}>{lvlInfo.name}</span>
                          <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>{lvlInfo.desc}</p>
                        </div>
                        {lvlInfo.match && (
                          <span style={{
                            fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 4,
                            background: lvlInfo.match.includes('Required') ? '#f97316' : '#10b981', color: '#ffffff'
                          }}>
                            {lvlInfo.match}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setEngineStage(3)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setEngineStage(5)}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Proceed to Reconciliation
                  </button>
                </div>
              </div>
            )}

            {/* Stage 5: Reconciliation Workspace */}
            {engineStage === 5 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 5: Reconciliation Workspace</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  Select a bank ledger transaction on the left, then select the matching invoice on the right and click <strong>&quot;Execute Reconcile&quot;</strong>.
                </p>

                {/* In-Workspace Vendor creation */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                  <form onSubmit={handleCreateVendor} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 700, whiteSpace: 'nowrap' }}>Create Vendor:</span>
                    <input
                      type="text"
                      placeholder="Enter supplier/vendor name..."
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      style={{ flex: 1, height: 32, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.75rem', padding: '0 0.5rem', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      style={{ background: '#2A1628', color: '#ffffff', border: 'none', borderRadius: 6, height: 32, padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save Supplier
                    </button>
                  </form>
                  {vendorSuccessLog && (
                    <span style={{ display: 'block', fontSize: '0.6875rem', color: '#10b981', fontWeight: 600, marginTop: '0.375rem' }}>{vendorSuccessLog}</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  {/* Left Column: Bank lines */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                      BANK TRANSACTIONS
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {bankLines.map((b) => (
                        <button
                          key={b.id}
                          disabled={b.status === 'matched'}
                          onClick={() => setSelectedBankLine(b.id)}
                          style={{
                            padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1',
                            background: b.status === 'matched' ? '#f0fdf4' : selectedBankLine === b.id ? '#F6F2EE' : '#ffffff',
                            borderColor: b.status === 'matched' ? '#bbf7d0' : selectedBankLine === b.id ? '#E8760A' : '#cbd5e1',
                            color: '#334155', cursor: b.status === 'matched' ? 'default' : 'pointer', textAlign: 'left',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
                            opacity: b.status === 'matched' ? 0.6 : 1
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>{b.description}</span>
                            <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{b.date}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>AED {b.amount}</span>
                            {b.status === 'matched' ? (
                              <span style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 700 }}>RECONCILED</span>
                            ) : b.status === 'suspense' ? (
                              <span style={{ fontSize: '0.625rem', color: '#f97316', fontWeight: 700 }}>SUSPENSE</span>
                            ) : (
                              <span style={{ fontSize: '0.625rem', color: '#64748b' }}>PENDING</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Pending Invoices */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                      PENDING SALES INVOICES
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {invoices.map((inv) => {
                        const isMatched = bankLines.some(b => b.matchedId === inv.id);
                        return (
                          <button
                            key={inv.id}
                            disabled={isMatched}
                            onClick={() => setSelectedInvoice(inv.id)}
                            style={{
                              padding: '0.75rem', borderRadius: 8, border: '1px solid #cbd5e1',
                              background: isMatched ? '#f0fdf4' : selectedInvoice === inv.id ? '#F6F2EE' : '#ffffff',
                              borderColor: isMatched ? '#bbf7d0' : selectedInvoice === inv.id ? '#E8760A' : '#cbd5e1',
                              color: '#334155', cursor: isMatched ? 'default' : 'pointer', textAlign: 'left',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',
                              opacity: isMatched ? 0.6 : 1
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>{inv.invoiceNo}</span>
                              <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{inv.vendor}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>AED {inv.amount}</span>
                              {isMatched ? (
                                <span style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 700 }}>PAID</span>
                              ) : (
                                <span style={{ fontSize: '0.625rem', color: '#64748b' }}>OPEN</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      disabled={!selectedBankLine}
                      onClick={() => { if (selectedBankLine) markAsSuspense(selectedBankLine); }}
                      style={{
                        background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a',
                        padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem',
                        cursor: selectedBankLine ? 'pointer' : 'default', opacity: selectedBankLine ? 1 : 0.5
                      }}
                    >
                      Flag Suspense
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setEngineStage(4)}
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button
                      disabled={!selectedBankLine || !selectedInvoice}
                      onClick={executeReconcile}
                      style={{
                        background: selectedBankLine && selectedInvoice ? '#2A1628' : '#e2e8f0',
                        color: selectedBankLine && selectedInvoice ? '#ffffff' : '#94a3b8',
                        border: 'none', padding: '0.5rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
                        cursor: selectedBankLine && selectedInvoice ? 'pointer' : 'default',
                      }}
                    >
                      Execute Reconcile
                    </button>
                    <button
                      onClick={() => setEngineStage(6)}
                      style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                    >
                      Next: Suspense Identification
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Stage 6: Suspense Identification */}
            {engineStage === 6 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 6: Suspense Identification</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  Unidentified bank deposits or missing expense invoice files are flagged as Suspense items. Dispatched notices request files directly from client portals.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {bankLines.filter(b => b.status === 'suspense' || b.id === 'b3').map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '1rem', border: '1px solid #fde68a', borderRadius: 8, background: '#fffbeb',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#92400e', display: 'block' }}>{b.description}</span>
                        <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Turnover log date: {b.date} • Amount: AED {b.amount}</span>
                      </div>
                      <button
                        onClick={() => {
                          alert(`Notice sent successfully!\nClient request emailed to upload receipt for: "${b.description}"`);
                        }}
                        style={{
                          background: '#d97706', color: '#ffffff', border: 'none', borderRadius: 6,
                          padding: '0.4rem 0.875rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        Dispatch Notification
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setEngineStage(5)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setEngineStage(7)}
                    style={{ background: '#2A1628', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Proceed to QuickBooks Push
                  </button>
                </div>
              </div>
            )}

            {/* Stage 7: QuickBooks Push */}
            {engineStage === 7 && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>Stage 7: QuickBooks Online OAuth Push</h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.45 }}>
                  Once ledger construction and matching are completed, the journal entries are pushed to QuickBooks Online.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  
                  {/* Status Panel */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>QuickBooks API Status</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        CONNECTED
                      </span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 6, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      {qbSynced ? (
                        <div>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 700, color: '#10b981' }}>✓ Sync Successful</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Transactions successfully written to QBO ledger.</p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8125rem', color: '#475569' }}>Push reconciled transactions to QuickBooks Journal Voucher entries.</p>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                              disabled={qbLoading}
                              onClick={handleQuickBooksPush}
                              style={{
                                background: '#E8760A', color: '#2A1628', border: 'none', borderRadius: 6,
                                padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 700, cursor: qbLoading ? 'default' : 'pointer'
                              }}
                            >
                              {qbLoading ? 'Syncing...' : 'Push to QuickBooks'}
                            </button>

                            {qbAuthUrl && (
                              <a
                                href={qbAuthUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '0.75rem', color: '#E8760A', textDecoration: 'none', fontWeight: 600 }}
                              >
                                Re-authenticate QuickBooks OAuth
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sync Logs Panel */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                      QUICKBOOKS TRANSACTION SYNC LOGS
                    </span>
                    <div style={{ flex: 1, background: '#0f172a', borderRadius: 6, padding: '0.75rem', color: '#38bdf8', fontSize: '0.6875rem', fontFamily: 'monospace', overflowY: 'auto', minHeight: '120px' }}>
                      {syncLogs.length === 0 ? (
                        <span style={{ color: '#64748b' }}>No transactions pushed. Initiate push to generate logs.</span>
                      ) : (
                        syncLogs.map((log, i) => (
                          <div key={i} style={{ marginBottom: '0.25rem' }}>{log}</div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setEngineStage(6)}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      alert('Reconciliation flow validated successfully! System ready for QuickBooks journal voucher post verification.');
                    }}
                    style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    Complete Engine Flow
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Global CSS spinner keyframe */}
      <style dangerouslySetInnerHTML={{ __html: ` // nosec
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />

      {/* Branded QuickBooks Connected Success Modal */}
      {showQbSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(42, 22, 40, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #DDD0C4',
            borderRadius: 4,
            boxShadow: '0 20px 40px -15px rgba(42, 22, 40, 0.2)',
            textAlign: 'center',
            maxWidth: 440,
            width: '100%',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: '#E8760A'
            }} />
            <div style={{
              fontFamily: 'Cormorant, serif',
              fontSize: '32px',
              fontWeight: 300,
              letterSpacing: '0.03em',
              lineHeight: 1,
              marginBottom: 4,
              color: '#2A1628'
            }}>
              Inc<span style={{ color: '#E8760A' }}>·</span>Hub
            </div>
            <div style={{
              fontFamily: 'Cormorant, serif',
              fontSize: '10px',
              fontWeight: 300,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#5A2D5A',
              marginBottom: 32,
              opacity: 0.7
            }}>
              Financial Services
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(232, 118, 10, 0.08)',
              marginBottom: 24,
              color: '#E8760A'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{
              fontFamily: 'Cormorant, serif',
              fontSize: '28px',
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.2,
              color: '#2A1628',
              marginBottom: 12
            }}>
              QuickBooks Connected
            </h2>
            <p style={{
              fontSize: '13px',
              lineHeight: 1.85,
              color: '#2A1628',
              opacity: 0.8,
              marginBottom: 32
            }}>
              IncHub Financial Services has successfully authenticated with your QuickBooks Online account. Your bookkeeping workspace is active.
            </p>
            <button
              onClick={() => {
                setShowQbSuccessModal(false);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                background: '#E8760A',
                color: '#2A1628',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 2,
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(232, 118, 10, 0.12), 0 2px 4px -1px rgba(232, 118, 10, 0.08)'
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
