/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { get, post, put } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';
import { usePermission } from '@/context/PermissionContext';
import Image from 'next/image';
import Link from 'next/link';

interface TenantProfile {
  tenant_id: string;
  onboarding_stage?: number;
  is_contract_signed?: boolean;
  contract_signature_name?: string | null;
  is_retainer_paid?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  accentColor: string;
  primaryBg: string;
}

export default function ClientPortal() {
  const { showToast } = useNotification();
  const { currentBrand, setCurrentBrand } = usePermission();
  const activeBrand = currentBrand === 'financial' ? 'financial' : 'corporate';

  const [currentUnlockedStage, setCurrentUnlockedStage] = useState<number>(3); 
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  
  const [isContractSigned, setIsContractSigned] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [kycChecklist, setKycChecklist] = useState<any[]>([]);

  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    Promise.resolve().then(() =>
      setDateStr(
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).toUpperCase()
      )
    );
  }, []);

  const fetchData = async () => {
    try {
      try {
        const kycRes = await get<{ success: boolean; data: any[] }>('/bookkeeping/kyc');
        if (kycRes?.success) setKycChecklist(kycRes.data);
      } catch (e) {}

      try {
        const profileRes = await get<{ success: boolean; data: TenantProfile }>('/bookkeeping/profile');
        if (profileRes?.success) setProfile(profileRes.data);
      } catch (e) {}
    } catch (e) {}
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.onboarding_stage !== undefined && profile.onboarding_stage !== null) {
        setCurrentUnlockedStage(profile.onboarding_stage);
      }
      if (profile.is_contract_signed !== undefined && profile.is_contract_signed !== null) {
        setIsContractSigned(profile.is_contract_signed);
      }
      if (profile.is_retainer_paid !== undefined && profile.is_retainer_paid !== null) {
        setPaymentDone(profile.is_retainer_paid);
      }
    }
  }, [profile]);

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
      showToast('Simulator override applied in offline mode.', 'info');
    }
  };

  const isCorporate = activeBrand === 'corporate';
  const primaryColor = isCorporate ? '#2C1A0E' : '#2A1628';
  const accentColor = isCorporate ? '#B8892A' : '#E8760A';
  const borderColor = isCorporate ? '#DDD4BE' : '#DDD0C4';
  const bgThemeColor = isCorporate ? '#F6F1E8' : '#F6F2EE';

  // Redefined for admin style
  const primaryBg = primaryColor;
  const cardBorderColor = 'var(--border-subtle)';
  const brandBg = 'var(--bg-page)';

  const stages = [
    { step: 1, name: 'Lead Created' },
    { step: 2, name: 'Call Booked' },
    { step: 3, name: 'Proposal Sent' },
    { step: 4, name: 'EL Approved' },
    { step: 5, name: 'Payment Confirmed' },
    { step: 6, name: 'Project Active' },
    { step: 7, name: 'Project Completed' }
  ];

  const getContextualText = (stage: number) => {
    switch(stage) {
      case 1: return "Please book a consultation call or complete your initial KYC.";
      case 2: return "Your consultation call is booked. We are preparing your tailored proposal.";
      case 3: return "Your proposal is ready. Please review and sign the engagement letter to proceed.";
      case 4: return "Engagement letter approved. Please complete the initial retainer payment.";
      case 5: return "Payment confirmed. Your project workspace is now active and being set up.";
      case 6: return "Your project is actively being managed. Track your task status in real-time.";
      case 7: return "Congratulations! Your project is complete. You can access all your deliverables and archives.";
      default: return "Welcome to IncHub.";
    }
  };

  const getQuickActions = (stage: number) => {
    const actions = [];
    if (stage === 1) {
      actions.push({ label: 'Book Call', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>, href: '/meetings/book' });
      actions.push({ label: 'Upload KYC', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>, href: '/compliance/kyc' });
    }
    if (stage === 2) {
      actions.push({ label: 'Meeting Details', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, href: '/meetings/history' });
    }
    if (stage === 3) {
      actions.push({ label: 'Review Proposal', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, href: '/proposal' });
    }
    if (stage === 4) {
      actions.push({ label: 'Pay Invoice', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line></svg>, href: '/payments' });
    }
    if (stage === 5 || stage === 6) {
      actions.push({ label: 'Project Tracker', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>, href: '/project' });
      actions.push({ label: 'Upload Doc', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>, href: '/project/upload' });
    }
    if (stage === 7) {
      actions.push({ label: 'View Archives', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8v13H3V8"></path><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>, href: '/accounting/archive' });
      actions.push({ label: 'Renewals', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>, href: '/growth/renewals' });
    }
    actions.push({ label: 'Contact RM', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>, href: '/communication/messages' });
    return actions;
  };

  const getStatusCards = (stage: number) => {
    const cards = [];
    if (stage <= 2) {
      cards.push({ id: 'mtg', label: 'Next Meeting', value: 'Wed, 2 PM', change: 'Consultation Call', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> });
    }
    if (stage === 3) {
      cards.push({ id: 'prop', label: 'Proposal Status', value: 'Pending', change: 'Action Required', up: false, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> });
    }
    if (stage === 4) {
      cards.push({ id: 'inv', label: 'Unpaid Invoice', value: 'AED 8,500', change: 'Due Immediately', up: false, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line></svg> });
    }
    if (stage >= 5) {
      cards.push({ id: 'tasks', label: 'Pending Tasks', value: '3', change: 'Project Tracker', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> });
      cards.push({ id: 'docs', label: 'Documents Needed', value: '2', change: 'Action Required', up: false, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> });
    }
    cards.push({ id: 'msg', label: 'Unread Messages', value: '1', change: 'From RM', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> });
    return cards;
  };

  const kycAlert = currentUnlockedStage === 1;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      color: primaryBg,
      transition: 'all 300ms ease',
      maxWidth: '1536px',
      margin: '0 auto',
      width: '100%',
    }}>
      
      {/* ── Executive Clean Header Area (Admin Style) ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: `1px solid ${cardBorderColor}`,
      }}>
        <div>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(44, 26, 14, 0.5)',
            fontFamily: 'Inter, sans-serif'
          }}>
            {dateStr || 'MONDAY, 16 JUNE 2026'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '0.25rem' }}>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-primary)'
            }}>
              Welcome, <span style={{ fontStyle: 'italic', color: accentColor }}>Alpha Corporate Ltd</span>
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: kycAlert ? 'color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent)' : 'color-mix(in srgb, var(--color-success, #10b981) 10%, transparent)',
                border: `1px solid ${kycAlert ? 'color-mix(in srgb, var(--color-error, #ef4444) 20%, transparent)' : 'color-mix(in srgb, var(--color-success, #10b981) 20%, transparent)'}`,
                color: kycAlert ? 'var(--color-error, #b91c1c)' : 'var(--color-success, #047857)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: kycAlert ? 'var(--color-error, #ef4444)' : 'var(--color-success, #10b981)' }} />
              {kycAlert ? 'KYC Action Required' : 'KYC Compliant'}
            </span>
          </div>
        </div>

        {/* Dynamic Brand Tabs Switcher (For testing) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-topbar)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.25rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          {([
            { mode: 'corporate', label: 'Corporate Desk', dot: '#B8892A' },
            { mode: 'financial', label: 'Financial Desk', dot: '#E8760A' }
          ] as const).map(tab => (
            <button
              key={tab.mode}
              onClick={() => setCurrentBrand(tab.mode)}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '6px',
                border: 'none',
                background: activeBrand === tab.mode ? primaryBg : 'transparent',
                color: activeBrand === tab.mode ? '#ffffff' : 'var(--color-secondary)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 200ms ease',
              }}
            >
              <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: activeBrand === tab.mode ? '#ffffff' : tab.dot,
                display: 'inline-block'
              }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Horizontal Quick Client Actions Row ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-secondary)',
        }}>
          Quick Actions:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {getQuickActions(currentUnlockedStage).map((act, i) => (
            <Link href={act.href} key={i} style={{ textDecoration: 'none' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.45rem 0.875rem',
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--color-primary)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = primaryBg;
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = primaryBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-page)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {act.icon}
                {act.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI Row (Dynamic Status Cards) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {getStatusCards(currentUnlockedStage).map(card => (
          <StatCard key={card.id} {...card} accentColor={accentColor} primaryBg={primaryBg} />
        ))}
      </div>

      {/* ── Journey Stage Indicator ── */}
      <div style={{
        background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px',
        padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }}>
        <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
          Project Lifecycle Conversion
        </h2>
        
        {/* Contextual Subtext */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-page)', borderRadius: 8, borderLeft: `4px solid ${accentColor}` }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: primaryBg, fontWeight: 500 }}>
            <strong style={{ color: accentColor, marginRight: '0.5rem' }}>Current Focus:</strong>
            {getContextualText(currentUnlockedStage)}
          </p>
        </div>

        {/* Funnel/Stepper UI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '0.5rem 0' }}>
          {stages.map((item) => {
            const isDone = currentUnlockedStage > item.step;
            const isActive = currentUnlockedStage === item.step;
            const isLocked = currentUnlockedStage < item.step;

            const baseWidth = 100;
            const widthPct = Math.max(40, baseWidth - (item.step - 1) * 10);
            
            const itemBg = isActive 
              ? `linear-gradient(90deg, ${primaryBg} 0%, ${accentColor} 100%)`
              : isDone
                ? `linear-gradient(90deg, ${primaryBg}99 0%, ${primaryBg}80 100%)`
                : 'var(--bg-page)';
            
            const textColor = (isActive || isDone) ? '#ffffff' : 'var(--color-secondary)';
            const borderStyle = isLocked ? '1px dashed var(--border-subtle)' : 'none';

            return (
              <div key={item.step} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: `${widthPct}%`,
                  background: itemBg,
                  borderRadius: 6,
                  border: borderStyle,
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: textColor,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: (isActive || isDone) ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 300ms'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      width: 18, height: 18, borderRadius: '50%', 
                      background: isActive || isDone ? '#ffffff' : 'transparent',
                      color: isActive ? accentColor : isDone ? primaryBg : 'var(--color-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.625rem', fontWeight: 700,
                      border: isLocked ? '1px solid var(--border-subtle)' : 'none'
                    }}>
                      {isDone ? '✓' : item.step}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Active Stage
                    </span>
                  )}
                  {isDone && (
                    <span style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>
                      Completed
                    </span>
                  )}
                  {isLocked && (
                    <span style={{ fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.5 }}>
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2-Column Grid (Recent Activity & Overview) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* Recent Activity */}
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
            Operational Activity Stream
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { time: '2 hours ago', title: 'System Notification', desc: 'Your account was successfully provisioned.' },
              { time: '1 day ago', title: 'Document Uploaded', desc: 'Trade License copy was uploaded by Admin.' },
              { time: '2 days ago', title: 'Meeting Notes Added', desc: 'Notes from Initial Consultation have been published.' },
            ].map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid rgba(0,0,0,0.02)', paddingBottom: '0.5rem' }}>
                <span>
                  <strong style={{ fontWeight: 600 }}>{activity.title}:</strong> {activity.desc}
                </span>
                <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overview */}
        <div style={{ background: '#ffffff', border: `1px solid ${cardBorderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: 'var(--bg-page)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: `0 0 0 1px ${cardBorderColor}` }}>
            <Image src="/logo_page_6.svg" alt="IncHub" width={24} height={24} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600, fontFamily: 'var(--font-serif)', color: primaryBg }}>IncHub Business Suite</h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8125rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5 }}>
            Your dedicated partner for seamless corporate setup, compliance, and financial services in the UAE.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 500 }}>
            <a href="tel:+971501234567" style={{ color: primaryBg, textDecoration: 'none' }}>📞 +971 50 123 4567</a>
            <a href="mailto:support@inchub.com" style={{ color: primaryBg, textDecoration: 'none' }}>✉️ support@inchub.com</a>
          </div>
        </div>

      </div>

      {/* ── UAT Tester Simulator Panel (Extra Executive Drawer style) ── */}
      <div style={{ background: brandBg, border: `1px dashed ${accentColor}`, borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: primaryBg, fontFamily: 'Inter, sans-serif' }}>
          ⚙️ UAT Compliance Stage Simulator
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.4 }}>
          Milestone 2 enforces **7 unlock stages** to gate specific resources. Choose an onboarding checkpoint below to override and preview the dynamic Client Dashboard:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', overflowX: 'auto' }}>
          {[
            { st: 1, label: 'Stage 1: Lead Created' },
            { st: 2, label: 'Stage 2: Call Booked' },
            { st: 3, label: 'Stage 3: Proposal Sent' },
            { st: 4, label: 'Stage 4: EL Approved' },
            { st: 5, label: 'Stage 5: Payment Confirmed' },
            { st: 6, label: 'Stage 6: Project Active' },
            { st: 7, label: 'Stage 7: Completed' },
          ].map(item => (
            <div 
              key={item.st} 
              onClick={() => setSimulatorStage(item.st)}
              style={{ 
                padding: '0.75rem', 
                background: currentUnlockedStage === item.st ? primaryBg : '#ffffff', 
                borderRadius: 8, 
                border: `1px solid ${currentUnlockedStage === item.st ? primaryBg : 'var(--border-subtle)'}`,
                color: currentUnlockedStage === item.st ? '#ffffff' : primaryBg,
                cursor: 'pointer',
                transition: 'all 200ms ease'
              }}
            >
              <span style={{ fontSize: '0.625rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Onboarding Phase {item.st}</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', fontWeight: 700 }}>{item.label} {currentUnlockedStage === item.st ? '✓' : ''}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── KPI Stat Card Sub-Component ── */
function StatCard({ label, value, change, up, icon, accentColor, primaryBg }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: `1px solid var(--border-subtle)`,
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: hovered 
          ? `0 12px 24px -6px color-mix(in srgb, ${accentColor} 12%, transparent)`
          : '0 2px 8px rgba(0, 0, 0, 0.01)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        borderColor: hovered ? accentColor : 'var(--border-subtle)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: `color-mix(in srgb, ${accentColor} 6%, transparent)`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: up ? 'color-mix(in srgb, #276749 12%, transparent)' : 'color-mix(in srgb, #9B2C2C 12%, transparent)',
            color: up ? '#276749' : '#9B2C2C',
          }}
        >
          {change}
        </span>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '1.875rem', fontWeight: 300, letterSpacing: '-0.02em', color: primaryBg, fontFamily: 'var(--font-serif)' }}>
          {value}
        </p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.625rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </p>
      </div>
    </div>
  );
}
