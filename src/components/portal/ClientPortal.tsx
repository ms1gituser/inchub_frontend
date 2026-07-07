/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { get, post, put } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';

interface KycItem {
  name: string;
  status: 'valid' | 'expiring' | 'expired';
  expiry_date: string | null;
}

interface TenantProfile {
  tenant_id: string;
  contract_baseline_transactions: number;
  current_monthly_transactions: number;
  current_turnover_aed: string;
  vat_status: string;
  drive_root_folder_id: string | null;
  ct_filing_deadline: string | null;
  onboarding_stage?: number;
  is_contract_signed?: boolean;
  contract_signature_name?: string | null;
  is_retainer_paid?: boolean;
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

export default function ClientPortal() {
  const { showToast, showConfirm } = useNotification();
  // Theme & brand toggle
  const [activeBrand, setActiveBrand] = useState<'corporate' | 'financial'>('corporate');

  // Stepper Stage state (1 to 7)
  const [currentUnlockedStage, setCurrentUnlockedStage] = useState<number>(3); // Default Stage 3 unlocked

  // Real DB state (fallbacks to mock if backend is down)
  const [kycChecklist, setKycChecklist] = useState<KycItem[]>([]);
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [ctFilings, setCtFilings] = useState<CtFiling[]>([]);
  const [lockedMonths, setLockedMonths] = useState<string[]>([]);

  // VAT Log states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vatLog, setVatLog] = useState<any>(null);
  const [waivedReason, setWaivedReason] = useState('');
  const [submittingWaiver, setSubmittingWaiver] = useState(false);

  // Signature state
  const [signatureName, setSignatureName] = useState('');
  const [isContractSigned, setIsContractSigned] = useState(false);

  // Card Payment simulation state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 9010');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('311');

  // Corporate Tax Filing intake form state
  const [ctYear, setCtYear] = useState('2026');
  const [ctTurnover, setCtTurnover] = useState('480000');
  const [ctTaxableIncome, setCtTaxableIncome] = useState('85000');
  const [filingCt, setFilingCt] = useState(false);

  // KYC upload mock state
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  // Adverse media checks list
  const amlLogs = [
    { source: 'CBUAE Sanctions List', status: 'Passed', date: '2026-06-20' },
    { source: 'UN Security Council (UNSC) Consolidated', status: 'Passed', date: '2026-06-20' },
    { source: 'EU Financial Sanctions Files', status: 'Passed', date: '2026-06-20' },
    { source: 'OFAC SDN List Search', status: 'Passed', date: '2026-06-20' },
    { source: 'World-Check Politically Exposed Persons', status: 'Passed', date: '2026-06-20' },
    { source: 'UAE Local Terrorist List search', status: 'Passed', date: '2026-06-20' },
  ];

  // Fetch real data
  const fetchData = async () => {
    try {

      // KYC Checklist
      try {
        const kycRes = await get<{ success: boolean; data: KycItem[] }>('/bookkeeping/kyc');
        if (kycRes?.success) setKycChecklist(kycRes.data);
      } catch (e) {
        console.warn('KYC check offline (database connection fallback used):', e);
      }

      // Profile details
      try {
        const profileRes = await get<{ success: boolean; data: TenantProfile }>('/bookkeeping/profile');
        if (profileRes?.success) setProfile(profileRes.data);
      } catch (e) {
        console.warn('Profile offline:', e);
      }

      // VAT Log
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vatRes = await get<{ success: boolean; data: any }>('/bookkeeping/vat/log');
        if (vatRes?.success) setVatLog(vatRes.data);
      } catch (e) {
        console.warn('VAT Log offline:', e);
      }

      // Corporate Tax Archive & month lock statuses
      try {
        const archiveRes = await get<CtArchiveResponse>('/bookkeeping/ct/archive');
        if (archiveRes?.success) {
          setCtFilings(archiveRes.data.corporate_tax_filings || []);
          setLockedMonths(archiveRes.data.monthly_archives?.map(a => a.period) || []);
        }
      } catch (e) {
        console.warn('Tax archives offline:', e);
      }

    } catch (e) {
      console.warn('Top level fetch error:', e);
    }
  };

  const handleFileDownload = async (key: string) => {
    try {
      const res = await get<{ success: boolean; downloadUrl?: string }>(`/files/download?key=${encodeURIComponent(key)}`);
      if (res?.success && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else {
        showToast('Failed to obtain download URL from server.', 'error');
      }
    } catch (err) {
      console.error('[Download Error]', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast(errorMsg || 'Error fetching secure link.', 'error');
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await post<{ success: boolean; message: string; data: any }>('/bookkeeping/vat/waive', {
        waived_reason: waivedReason.trim()
      });
      if (res?.success) {
        showToast(res.message || 'VAT registration threshold waived successfully.', 'success');
        setWaivedReason('');
        await fetchData();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Failed to submit waiver.', 'error');
    } finally {
      setSubmittingWaiver(false);
    }
  };

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, []);

  // Sync local states from the database profile when fetched
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (profile) {
      if (profile.onboarding_stage !== undefined && profile.onboarding_stage !== null) {
        setCurrentUnlockedStage(profile.onboarding_stage);
      }
      if (profile.is_contract_signed !== undefined && profile.is_contract_signed !== null) {
        setIsContractSigned(profile.is_contract_signed);
      }
      if (profile.contract_signature_name) {
        setSignatureName(profile.contract_signature_name);
      }
      if (profile.is_retainer_paid !== undefined && profile.is_retainer_paid !== null) {
        setPaymentDone(profile.is_retainer_paid);
      }
    }
  }, [profile]);

  // Simulator helper: advance or go back in stages and persist in DB
  const setSimulatorStage = async (stageNum: number) => {
    setCurrentUnlockedStage(stageNum);
    const contractSigned = stageNum >= 4;
    const paymentDone = stageNum >= 5;

    setIsContractSigned(contractSigned);
    setPaymentDone(paymentDone);

    try {
      await put('/bookkeeping/profile/onboarding', {
        stage: stageNum,
        is_contract_signed: contractSigned,
        is_retainer_paid: paymentDone,
      });
      showToast(`Simulator: updated database onboarding state to Stage ${stageNum}`, 'success');
      await fetchData();
    } catch (e) {
      console.warn('Failed to sync simulator stage to database:', e);
      showToast('Simulator override applied in offline mode.', 'info');
    }
  };

  // Sign contract trigger (M3 Agreement stage)
  const handleSignContract = () => {
    if (!signatureName.trim()) {
      showToast('Please enter your full name to sign the service agreement.', 'warning');
      return;
    }
    showConfirm(
      `Do you agree to all the terms of the service agreement and want to digitally sign as "${signatureName.trim()}"?`,
      async () => {
        try {
          const res = await post<{ success: boolean; data: TenantProfile }>('/bookkeeping/profile/sign-contract', {
            signature_name: signatureName.trim(),
          });
          if (res?.success) {
            setIsContractSigned(true);
            if (currentUnlockedStage < 4) {
              setCurrentUnlockedStage(4);
            }
            showToast('Contract signed digitally. Proceeding to retainer payment.', 'success');
            await fetchData();
          }
        } catch (e) {
          console.error('[Contract Sign Error]', e);
          showToast('Failed to sign contract. Using offline fallback.', 'warning');
          setIsContractSigned(true);
          if (currentUnlockedStage < 4) {
            setCurrentUnlockedStage(4);
          }
        }
      },
      'Sign Service Agreement'
    );
  };

  // Pay retainer trigger (M3 Payment stage)
  const handlePayRetainer = (e: React.FormEvent) => {
    e.preventDefault();
    showConfirm(
      "Confirm payment of AED 8,500 retainer fee via PayTabs? This transaction will debit your card.",
      async () => {
        setPaymentLoading(true);
        try {
          const res = await post<{ success: boolean; data: { profile: TenantProfile } }>('/bookkeeping/profile/pay-retainer', {});
          if (res?.success) {
            setPaymentDone(true);
            if (currentUnlockedStage < 5) {
              setCurrentUnlockedStage(5);
            }
            showToast('Payment authorized successfully via PayTabs! GDrive workspace activated.', 'success');
            await fetchData();
          }
        } catch (err) {
          console.error('[Retainer Pay Error]', err);
          showToast('Retainer payment failed. Using offline fallback.', 'warning');
          setPaymentDone(true);
          if (currentUnlockedStage < 5) {
            setCurrentUnlockedStage(5);
          }
        } finally {
          setPaymentLoading(false);
        }
      },
      'Confirm Retainer Payment'
    );
  };

  // CT Intake Submit trigger
  const handleFileCorporateTax = (e: React.FormEvent) => {
    e.preventDefault();
    showConfirm(
      `CRITICAL ACTION: Are you sure you want to submit the Corporate Tax intake form for FY ${ctYear}? This submission is official and cannot be undone.`,
      async () => {
        setFilingCt(true);
        try {
          const res = await post<{ success: boolean }>('/bookkeeping/ct/file', {
            year: parseInt(ctYear),
            intake_form_data: {
              turnover_aed: parseFloat(ctTurnover),
              taxable_income_aed: parseFloat(ctTaxableIncome),
            },
          });
          if (res?.success) {
            showToast(`Year-end Corporate Tax return submitted for FY ${ctYear}!`, 'success');
            await fetchData();
          }
        } catch (err) {
          console.error(err);
          showToast('Mock submission generated. Archive entry created.', 'success');
          // Offline fallback: push a dummy CT filing record
          const mockFiling: CtFiling = {
            tenant_id: profile?.tenant_id || 'tenant-alpha',
            filing_year: parseInt(ctYear),
            status: 'FILED',
            intake_form_data: {
              turnover_aed: parseFloat(ctTurnover),
              taxable_income_aed: parseFloat(ctTaxableIncome),
            },
            ct_return_doc_id: `mock-gdrive-ct-return-${ctYear}`,
            payment_receipt_doc_id: `mock-gdrive-ct-receipt-${ctYear}`,
            financial_statements_doc_id: `mock-gdrive-ct-financials-${ctYear}`,
            filed_at: new Date().toISOString(),
          };
          setCtFilings([mockFiling, ...ctFilings]);
        } finally {
          setFilingCt(false);
        }
      },
      'Submit Corporate Tax Intake'
    );
  };

  // Document uploader trigger
  const handleDocUpload = (docType: string) => {
    if (uploadedDocs.includes(docType)) {
      showToast(`${docType} is already uploaded.`, 'warning');
      return;
    }
    setUploadedDocs([...uploadedDocs, docType]);
    // Check if we uploaded essential files and advance stage
    if (uploadedDocs.length + 1 >= 3 && currentUnlockedStage < 2) {
      setCurrentUnlockedStage(2);
    }
    showToast(`${docType} uploaded successfully.`, 'success');
  };

  // Force expire helper (test red dot trigger)
  const handleForceExpirePassport = () => {
    showConfirm(
      'Are you sure you want to force expire the Passport of Beneficial Owners? This test action will set its status to EXPIRED and trigger a persistent RED indicator across all screens.',
      async () => {
        try {
          await post('/bookkeeping/kyc/expire', { name: 'Passport of Beneficial Owners' });
          await fetchData();
          window.dispatchEvent(new Event('kyc-changed'));
          showToast('Passport status forced to EXPIRED.', 'success');
        } catch {
          // Mock fallback: expire it in local checklist
          const updated = kycChecklist.map(item => {
            if (item.name.includes('Passport')) {
              item.status = 'expired';
              item.expiry_date = '2026-06-24'; // yesterday
            }
            return item;
          });
          setKycChecklist(updated);
          showToast('Offline fallback: Passport of Beneficial Owners set to EXPIRED (Indicator is now RED).', 'error');
        }
      },
      'Force Expire KYC Document'
    );
  };

  const isCorporate = activeBrand === 'corporate';
  const primaryColor = isCorporate ? '#2C1A0E' : '#2A1628';
  const accentColor = isCorporate ? '#B8892A' : '#E8760A';
  const borderColor = isCorporate ? '#DDD4BE' : '#DDD0C4';
  const bgThemeColor = isCorporate ? '#F6F1E8' : '#F6F2EE';
  const dotColor = isCorporate ? '#B8892A' : '#E8760A';

  // Checklist expired validator for RED badge
  const isKycExpired = kycChecklist.some(item => item.status === 'expired');

  // Gating wrapper helper (replicates PermissionGuard motif)
  const renderGatedFeature = (stageNum: number, featureName: string, children: React.ReactNode) => {
    const isUnlocked = currentUnlockedStage >= stageNum;
    if (isUnlocked) {
      return children;
    }

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Grayed-out filter */}
        <div style={{ opacity: 0.35, pointerEvents: 'none', filter: 'grayscale(1) blur(0.6px)', userSelect: 'none' }}>
          {children}
        </div>
        {/* Padlock lock overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.01)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, padding: '1rem', textAlign: 'center', zIndex: 10,
        }}>
          <div style={{
            background: primaryColor, color: '#ffffff', border: `1px solid ${accentColor}`,
            padding: '0.4rem 0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Locked</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: primaryColor, fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Unlocks at Stage {stageNum}
          </span>
          <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.45)', marginTop: '0.2rem' }}>
            Requires {featureName}
          </span>
        </div>
      </div>
    );
  };

  // Transaction limits computations
  const currentMonthlyTx = profile?.current_monthly_transactions || 45;
  const baselineTx = profile?.contract_baseline_transactions || 100;
  const cumulativeTurnover = Number(profile?.current_turnover_aed || 285000);
  const transactionPercentage = Math.min((currentMonthlyTx / baselineTx) * 100, 100);

  // VAT alert ladders text helper
  const getVatStatusText = () => {
    if (cumulativeTurnover >= 375000) return 'MANDATORY UAE VAT REGISTRATION LIMIT EXCEEDED';
    if (cumulativeTurnover >= 350000) return 'CRITICAL COMPLIANCE THRESHOLD MATCHED';
    if (cumulativeTurnover >= 250000) return 'VOLUNTARY LIMIT EXCEEDED (AED 250K)';
    if (cumulativeTurnover >= 185000) return 'VOLUNTARY REGISTER LOG ELIGIBLE';
    return 'Turnover is under AED 185K voluntary limit';
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
      color: primaryColor,
      fontFamily: 'Inter, sans-serif',
      transition: 'all 300ms ease',
      maxWidth: '1536px',
      margin: '0 auto',
      width: '100%',
    }}>
      
      {/* ── Visual Brand Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, rgba(0,0,0,0.9) 100%)`,
        borderRadius: 16, padding: '2rem', color: '#ffffff',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 8px 30px rgba(0,0,0,0.05)`,
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Theme accents */}
        <div style={{
          position: 'absolute', top: '-50%', right: '-20%', width: '60%', height: '200%',
          background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`, pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 5 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                {isCorporate ? 'Division I — Corporate Setup' : 'Division II — Financial Compliance'}
              </span>
              {isKycExpired && (
                <span style={{
                  background: '#fecaca', color: '#b91c1c', fontSize: '0.625rem', fontWeight: 700,
                  padding: '0.15rem 0.45rem', borderRadius: 4, letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '3px'
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#b91c1c' }} />
                  KYC Action Required
                </span>
              )}
            </div>
            <h1 style={{
              margin: 0, fontSize: '2.25rem', fontWeight: 300, letterSpacing: '-0.02em',
              fontFamily: 'var(--font-serif)'
            }}>
              Welcome to your <span style={{ fontStyle: 'italic', color: accentColor }}>IncHub Workspace</span>
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              Tenant ID: <strong style={{ color: '#ffffff' }}>tenant-alpha</strong> • Client ID: <strong style={{ color: '#ffffff' }}>CLI-2026-991</strong>
            </p>
          </div>

          {/* Division Toggles */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0.25rem'
          }}>
            <button
              onClick={() => setActiveBrand('corporate')}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                background: isCorporate ? '#ffffff' : 'transparent',
                color: isCorporate ? '#2C1A0E' : 'rgba(255,255,255,0.6)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.18em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 200ms ease'
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isCorporate ? '#2C1A0E' : '#B8892A' }} />
              Corporate Services
            </button>
            <button
              onClick={() => setActiveBrand('financial')}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                background: !isCorporate ? '#ffffff' : 'transparent',
                color: !isCorporate ? '#2A1628' : 'rgba(255,255,255,0.6)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.18em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'all 200ms ease'
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: !isCorporate ? '#2A1628' : '#E8760A' }} />
              Financial Services
            </button>
          </div>
        </div>
      </div>

      {/* ── UAT Tester Simulator Panel (Premium Integration) ── */}
      <div style={{
        background: '#ffffff', border: `1px dashed ${borderColor}`, borderRadius: 12,
        padding: '1.25rem 1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: '0.25rem'
          }}>
            ⚙️ UAT Compliance Stage Simulator
          </span>
          <button
            onClick={handleForceExpirePassport}
            style={{
              background: 'transparent', border: '1px dashed #ef4444', color: '#ef4444',
              padding: '0.25rem 0.5rem', fontSize: '0.625rem', fontWeight: 600, borderRadius: 4,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            Force Expired Passport (Triggers Red Alarm)
          </button>
        </div>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
          Milestone 2 enforces **7 unlock stages** to gate specific resources. Choose an onboarding checkpoint below to override and preview the locked / unlocked views of all 19 features:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { st: 1, label: 'Stage 1: KYC Submit' },
            { st: 2, label: 'Stage 2: Compliance Verify' },
            { st: 3, label: 'Stage 3: Signed Agreement' },
            { st: 4, label: 'Stage 4: Retainer Paid' },
            { st: 5, label: 'Stage 5: Drive Activated' },
            { st: 6, label: 'Stage 6: Bookkeeping Lock' },
            { st: 7, label: 'Stage 7: Tax Archive Access' },
          ].map(item => (
            <button
              key={item.st}
              onClick={() => setSimulatorStage(item.st)}
              style={{
                padding: '0.4rem 0.75rem', borderRadius: 6, border: 'none',
                background: currentUnlockedStage === item.st ? primaryColor : 'rgba(0,0,0,0.04)',
                color: currentUnlockedStage === item.st ? '#ffffff' : primaryColor,
                fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 150ms'
              }}
            >
              {item.label} {currentUnlockedStage === item.st ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* ── Onboarding Stepper Roadmap (Visual Timeline) ── */}
      <div style={{
        background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 12,
        padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }}>
        <h2 style={{
          margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: primaryColor
        }}>
          Compliance & Onboarding Milestones Progress
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative' }}>
          {[
            { step: 1, name: 'KYC Details', desc: '10 Item Checklist' },
            { step: 2, name: 'Compliance', desc: 'AML Database checks' },
            { step: 3, name: 'Agreement', desc: 'Sign contract document' },
            { step: 4, name: 'Retainer Billing', desc: 'Setup deposit retainer' },
            { step: 5, name: 'Workspace Setup', desc: 'Google Drive sync keys' },
            { step: 6, name: 'Operations Log', desc: 'Monthly locking ledger' },
            { step: 7, name: 'Year-End Archives', desc: 'Corporate Tax records' }
          ].map((item) => {
            const isDone = currentUnlockedStage > item.step;
            const isActive = currentUnlockedStage === item.step;
            const isLocked = currentUnlockedStage < item.step;

            return (
              <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 100, textAlign: 'center', gap: '0.375rem', position: 'relative' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isDone ? accentColor : isActive ? primaryColor : 'rgba(0,0,0,0.04)',
                  color: isDone || isActive ? '#ffffff' : 'rgba(0,0,0,0.3)',
                  border: isActive ? `2px solid ${accentColor}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8125rem', fontWeight: 700, transition: 'all 200ms'
                }}>
                  {isDone ? '✓' : item.step}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: isActive || isDone ? 600 : 400, color: isLocked ? 'rgba(0,0,0,0.3)' : primaryColor }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                  {item.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Core View Switcher Layout ── */}
      {isCorporate ? (
        /* ─────────────────────────────────────────────────────────────────────────────
           CORPORATE SERVICES DASHBOARD VIEW
           ───────────────────────────────────────────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Stage 1 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 1</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Client Profile &amp; KYC Verification
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Feature 1: Client Profile Form */}
              <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  F1 — Client Profile Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem' }}>
                  <div><strong>Company Legal Entity:</strong> Alpha Corporate Solutions Ltd</div>
                  <div><strong>Registered Address:</strong> Silicon Oasis Tech RRL, Dubai, UAE</div>
                  <div><strong>Primary Administrator:</strong> client@inchcrm.com</div>
                  <div><strong>Compliance Officer:</strong> Mahesh (IncHub Advisor)</div>
                </div>
              </div>

              {/* Feature 2: Real KYC Checklist */}
              <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  F2 — DNFBP KYC Compliance Checklist
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 150, overflowY: 'auto' }}>
                  {kycChecklist.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>Loading compliance checklists...</div>
                  ) : (
                    kycChecklist.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.status === 'valid' ? '#10b981' : '#ef4444' }} />
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: '0.625rem', color: item.status === 'valid' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Feature 3: KYC Uploader Gate */}
              <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  F3 — Compliance Document Upload
                </h4>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
                  Provide missing high-quality copies for review:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
                  {[
                    { key: 'Passport', label: 'Upload Passport copy' },
                    { key: 'Trade License', label: 'Upload Trade License' },
                    { key: 'UBO Declaration', label: 'Upload Signed UBO' },
                  ].map(doc => {
                    const isUploaded = uploadedDocs.includes(doc.key);
                    return (
                      <button
                        key={doc.key}
                        onClick={() => handleDocUpload(doc.key)}
                        style={{
                          width: '100%', padding: '0.4rem', border: isUploaded ? 'none' : `1px dashed ${accentColor}`,
                          borderRadius: 6, background: isUploaded ? 'rgba(16, 185, 129, 0.1)' : '#ffffff',
                          color: isUploaded ? '#10b981' : primaryColor, fontSize: '0.75rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 150ms'
                        }}
                      >
                        {isUploaded ? `✓ ${doc.key} Verified` : doc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 2</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Compliance Auditing &amp; CDD Risk Rating
              </h3>
            </div>
            
            {renderGatedFeature(2, 'Stage 1 KYC Completion', (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Feature 4: CDD Risk Classification */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', width: '100%' }}>
                    F4 — Customer Due Diligence (CDD)
                  </h4>
                  <div style={{
                    background: '#d1fae5', color: '#065f46', border: '1px solid #10b981',
                    padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase'
                  }}>
                    LOW RISK TIER
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
                    Automated client onboarding CDD check passed. Isolated tenant RLS sandbox security certified.
                  </span>
                </div>

                {/* Feature 5: AML/CFT Screening Search Logs */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F5 — 22 Official Data Sources Screening
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 110, overflowY: 'auto' }}>
                    {amlLogs.map((log, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', background: '#ffffff', padding: '0.3rem 0.5rem', borderRadius: 4 }}>
                        <span style={{ color: 'rgba(0,0,0,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>{log.source}</span>
                        <strong style={{ color: '#10b981' }}>{log.status}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature 6: Compliance Stamp */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%', border: `3px double ${accentColor}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.5rem', fontWeight: 800, color: accentColor, transform: 'rotate(-10deg)', flexShrink: 0
                  }}>
                    <span>APPROVED</span>
                    <span>2026</span>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      F6 — Auditor Seal
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.6875rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
                      IncHub Compliance Board verified. Onboarding sandbox access granted.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 3 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 3</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Engagement Letter &amp; Contract Signature
              </h3>
            </div>
            
            {renderGatedFeature(3, 'Stage 2 Auditor Approval', (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
                {/* Feature 7: Service Engagement Agreement Viewer */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F7 — Service Engagement Contract Agreement
                  </h4>
                  <div style={{
                    background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 6,
                    padding: '0.875rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', maxHeight: 180,
                    overflowY: 'auto', flex: 1, fontFamily: 'serif', lineHeight: 1.7
                  }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: primaryColor, fontFamily: 'sans-serif', fontWeight: 700 }}>SOFTWARE DEVELOPMENT &amp; COMPLIANCE CONSULTANCY SERVICE AGREEMENT</h5>
                    <p>This Service Agreement is entered into by and between <strong>IncHub Corporate Services Providers LLC</strong> and <strong>Alpha Corporate Solutions Ltd</strong> (hereafter referred to as &quot;Client&quot;).</p>
                    <p>1. <strong>Scope of Service</strong>: IncHub will deliver bookkeeping audits, corporate licensing formations, and VAT quarter alerts tracking.</p>
                    <p>2. <strong>Transaction Baselines</strong>: Contract baseline is set to 100 transactions per calendar month. Exceeding transactions will trigger renegotiation tasks.</p>
                    <p>3. <strong>Retainer Payment</strong>: A one-time initial retainer fee of AED 8,500.00 is due immediately upon execution of this agreement.</p>
                  </div>
                </div>

                {/* Feature 8 & 9: Sign contract & pricing breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Feature 9: Pricing sheet */}
                  <div style={{ background: bgThemeColor, padding: '1rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      F9 — Price Book &amp; Retainer Details
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <span>Initial Setup Retainer Fee</span>
                      <strong>AED 8,500.00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', paddingTop: '0.25rem' }}>
                      <span>Recurring Monthly Audit Scope</span>
                      <strong>AED 1,800.00/Mo</strong>
                    </div>
                  </div>

                  {/* Feature 8: Digital signature widget */}
                  <div style={{ background: bgThemeColor, padding: '1rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ margin: '0', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      F8 — Digital Sign Agreement
                    </h4>
                    {isContractSigned ? (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: 6, padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        ✓ Signed Digitally by: {signatureName || 'Authorized Signatory'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          placeholder="Type your full name to sign..."
                          style={{
                            flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`,
                            borderRadius: 6, outline: 'none'
                          }}
                        />
                        <button
                          onClick={handleSignContract}
                          disabled={!signatureName.trim()}
                          style={{
                            background: primaryColor, color: '#ffffff', border: 'none', borderRadius: 6,
                            padding: '0 0.75rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                            textTransform: 'uppercase', letterSpacing: '0.05em', opacity: signatureName.trim() ? 1 : 0.6
                          }}
                        >
                          Sign Contract
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 5 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 5</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Google Drive Hierarchical Workspace Activation
              </h3>
            </div>
            
            {renderGatedFeature(5, 'Stage 4 Payment Authorization', (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Feature 13: Drive Sync Status */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', width: '100%' }}>
                    F13 — Google Drive Sync Status
                  </h4>
                  <div style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #10b981', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    WORKSPACE ACTIVE
                  </div>
                  <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.45)' }}>
                    Folder ID: {profile?.drive_root_folder_id || 'gdrive-folder-alpha-2026'}
                  </span>
                </div>

                {/* Feature 14: Google Drive Folder Structure path */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F14 — Google Drive Directory Trees
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div style={{ padding: '0.35rem', background: '#ffffff', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)' }}>
                      📁 <strong>/Client_Workspace/2026/06</strong> (Current Period)
                    </div>
                    <div style={{ padding: '0.35rem', background: '#ffffff', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)' }}>
                      📁 <strong>/Client_Workspace/Tax_Archive/CT_2025</strong>
                    </div>
                  </div>
                </div>

                {/* Feature 15: Client documents drawer */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F15 — Client Files Library Archive
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 110, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', background: '#ffffff', padding: '0.3rem 0.5rem', borderRadius: 4 }}>
                      <span>📄 Trade_License_2026.pdf</span>
                      <a href="#" style={{ color: accentColor, textDecoration: 'none', fontWeight: 600 }}>Download</a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', background: '#ffffff', padding: '0.3rem 0.5rem', borderRadius: 4 }}>
                      <span>📄 Mainland_MOA_Draft.pdf</span>
                      <a href="#" style={{ color: accentColor, textDecoration: 'none', fontWeight: 600 }}>Download</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────────────────
           FINANCIAL SERVICES DASHBOARD VIEW
           ───────────────────────────────────────────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Stage 4 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 4</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Initial Retainer Billing &amp; Payment Gateway
              </h3>
            </div>
            
            {renderGatedFeature(4, 'Stage 3 Signed Service Agreement', (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Feature 10: Retainer Invoice Details */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      F10 — Setup Retainer Invoice Summary
                    </h4>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', fontStyle: 'italic' }}>Invoice ID: INV-RET-2026-001</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 8, border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>RETAINER FEE DUE</span>
                      <strong style={{ fontSize: '1.1rem', color: primaryColor }}>AED 8,500.00</strong>
                    </div>
                    <span style={{
                      background: paymentDone ? '#d1fae5' : '#fee2e2',
                      color: paymentDone ? '#065f46' : '#ef4444',
                      padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {paymentDone ? 'PAID' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Feature 11: PayTabs/Telr Checkout Gateway */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F11 — Integrated Mock Checkout Gateway
                  </h4>
                  {paymentDone ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 110, gap: '0.25rem' }}>
                      <span style={{ fontSize: '2rem' }}>💳</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>Mock Transaction Successful</span>
                      <span style={{ fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)' }}>Auth Ref: PayTabs-REF-992381</span>
                    </div>
                  ) : (
                    <form onSubmit={handlePayRetainer} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="Card Number"
                        style={{ padding: '0.35rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`, borderRadius: 6 }}
                      />
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          style={{ width: '60%', padding: '0.35rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`, borderRadius: 6 }}
                        />
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          style={{ width: '40%', padding: '0.35rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`, borderRadius: 6 }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={paymentLoading}
                        style={{
                          background: accentColor, color: '#ffffff', border: 'none', borderRadius: 6,
                          padding: '0.4rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                          textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem'
                        }}
                      >
                        {paymentLoading ? 'AUTHORIZING TELR...' : 'PAY RETAINER (AED 8,500)'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Feature 12: Historical Receipts Archive */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F12 — Invoices &amp; Receipts Ledger
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.725rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: 4 }}>
                      <span>Setup Retainer Invoice</span>
                      <strong style={{ color: paymentDone ? '#10b981' : '#ef4444' }}>{paymentDone ? 'Receipt' : 'Unpaid'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ffffff', padding: '0.35rem 0.5rem', borderRadius: 4, opacity: 0.5 }}>
                      <span>Monthly Auditing Fee (Q3)</span>
                      <span>Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 6 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 6</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Bookkeeping Month-Lock Gate &amp; Transaction Limits
              </h3>
            </div>
            
            {renderGatedFeature(6, 'Stage 5 Shared Workspace Setup', (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Feature 16: Sequential Monthly locks checklist */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F16 — Monthly Lock-Gate Sequencer
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {[
                      { m: 4, name: 'April 2026', locked: true },
                      { m: 5, name: 'May 2026', locked: lockedMonths.includes('2026-05') },
                      { m: 6, name: 'June 2026', locked: lockedMonths.includes('2026-06') },
                    ].map(month => (
                      <div
                        key={month.m}
                        style={{
                          padding: '0.5rem', background: '#ffffff', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{month.name}</span>
                        <span style={{
                          fontSize: '0.625rem', color: month.locked ? 'rgba(0,0,0,0.45)' : accentColor,
                          fontWeight: 700, letterSpacing: '0.05em'
                        }}>
                          {month.locked ? '🔒 LOCKED' : '🔓 OPEN'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature 17: Monthly transaction counter vs baseline */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F17 — Transaction count limits
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                    <span>Monthly counter</span>
                    <span>{currentMonthlyTx} / {baselineTx} tx</span>
                  </div>
                  <div style={{ height: 8, background: '#ffffff', borderRadius: 999, border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <div style={{ height: '100%', width: `${transactionPercentage}%`, background: accentColor }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
                    Breaching baseline limit across 3 consecutive months will automatically trigger a billing addendum.
                  </p>
                </div>

                {/* Feature 18: VAT Warning alerts ladder */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F18 — VAT voluntary registration ladder
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                    <span>Rolling Turnover</span>
                    <span>AED {cumulativeTurnover.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid rgba(0,0,0,0.04)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cumulativeTurnover >= 185000 ? '#f59e0b' : '#10b981' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: primaryColor, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {getVatStatusText()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stage 7 Features Container */}
          <div style={{ background: '#ffffff', border: `1px solid ${borderColor}`, borderRadius: 16, padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.18em', color: accentColor, textTransform: 'uppercase' }}>STAGE 7</span>
              <h3 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                Corporate Tax Filing Intake &amp; Document Archive
              </h3>
            </div>
            
            {renderGatedFeature(7, 'Stage 6 Sequential month locking checks', (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'stretch' }}>
                {/* Feature 19a: Year-End Corporate Tax Intake Form */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}` }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F19 (Part A) — Corporate Tax Intake
                  </h4>
                  <form onSubmit={handleFileCorporateTax} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)', display: 'block', marginBottom: '0.2rem' }}>Filing Year</label>
                      <input
                        type="text"
                        value={ctYear}
                        onChange={(e) => setCtYear(e.target.value)}
                        placeholder="Year (e.g. 2026)"
                        style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`, borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)', display: 'block', marginBottom: '0.2rem' }}>Turnover (AED)</label>
                      <input
                        type="text"
                        value={ctTurnover}
                        onChange={(e) => setCtTurnover(e.target.value)}
                        placeholder="Turnover AED"
                        style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`, borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)', display: 'block', marginBottom: '0.2rem' }}>Taxable Income (AED)</label>
                      <input
                        type="text"
                        value={ctTaxableIncome}
                        onChange={(e) => setCtTaxableIncome(e.target.value)}
                        placeholder="Taxable Income AED"
                        style={{ width: '100%', padding: '0.35rem', fontSize: '0.75rem', border: `1px solid ${borderColor}`, borderRadius: 6 }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={filingCt}
                      style={{
                        background: primaryColor, color: '#ffffff', border: 'none', borderRadius: 6,
                        padding: '0.4rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem'
                      }}
                    >
                      {filingCt ? 'SUBMITTING FILING...' : 'Submit CT Intake returns'}
                    </button>
                  </form>
                </div>

                {/* Feature 19b: Year-End Document Archive */}
                <div style={{ background: bgThemeColor, padding: '1.25rem', borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    F19 (Part B) — Year-End document archive
                  </h4>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
                    Tax filings returns history, payment receipts, monthly statements, and reports repository:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, maxHeight: 200 }}>
                    {ctFilings.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                        No filings archived yet.
                      </div>
                    ) : (
                      ctFilings.map((filing, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '0.75rem', background: '#ffffff', borderRadius: 8, border: '1px solid rgba(0,0,0,0.04)',
                            display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span>FY {filing.filing_year} CT Return</span>
                            <span style={{ color: '#10b981' }}>{filing.status}</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleFileDownload(filing.ct_return_doc_id); }} style={{ fontSize: '0.65rem', color: accentColor, textDecoration: 'none', fontWeight: 600 }}>[Return document]</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleFileDownload(filing.payment_receipt_doc_id); }} style={{ fontSize: '0.65rem', color: accentColor, textDecoration: 'none', fontWeight: 600 }}>[Receipt]</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleFileDownload(filing.financial_statements_doc_id); }} style={{ fontSize: '0.65rem', color: accentColor, textDecoration: 'none', fontWeight: 600 }}>[Financial Statements]</a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
