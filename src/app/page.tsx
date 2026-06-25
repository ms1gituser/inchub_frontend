'use client';

import React, { useState, useEffect } from 'react';
import { get } from '@/lib/apiClient';
import { usePermission } from '@/context/PermissionContext';
import { useNotification } from '@/context/NotificationContext';
import ClientPortal from '@/components/portal/ClientPortal';

/* ── Types & Interfaces ─────────────────────────────────────────────────── */
interface StatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: string;
  pct: number;
}

interface Deal {
  name: string;
  company: string;
  value: string;
  stage: string;
  type: 'corporate' | 'financial';
  owner: string;
}

interface InvoiceItem {
  id: string;
  client: string;
  service: string;
  value: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Draft';
  type: 'corporate' | 'financial';
}

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  initials: string;
  type: 'corporate' | 'financial' | 'internal';
}

interface LeadChannel {
  name: string;
  count: number;
  pct: number;
  color: string;
}

/* ── Static Mock Data adapted by View Mode ───────────────────────────────── */
const STATS_DATA: Record<'group' | 'corporate' | 'financial', StatCard[]> = {
  group: [
    { id: 'total-contacts', label: 'Total Contacts', value: '2,847', change: '+12.5%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: 'open-leads', label: 'Open Leads', value: '148', change: '+4.3%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg> },
    { id: 'deals-won', label: 'Total Revenue', value: 'AED 1.84M', change: '+22.1%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg> },
    { id: 'win-rate', label: 'Avg Win Rate', value: '24.8%', change: '+1.8% vs last Mo', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  ],
  corporate: [
    { id: 'total-contacts', label: 'Corporate Contacts', value: '1,420', change: '+9.2%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
    { id: 'open-leads', label: 'Corporate Leads', value: '82', change: '+6.1%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /></svg> },
    { id: 'deals-won', label: 'Corporate Deals Value', value: 'AED 920K', change: '+18.5%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /></svg> },
    { id: 'win-rate', label: 'Licensing Win Rate', value: '22.4%', change: '+0.5% vs last Mo', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  ],
  financial: [
    { id: 'total-contacts', label: 'Financial Clients', value: '1,427', change: '+15.8%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg> },
    { id: 'open-leads', label: 'Tax & VAT Mandates', value: '66', change: '+2.2%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg> },
    { id: 'deals-won', label: 'Financial Billings', value: 'AED 920K', change: '+25.9%', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /></svg> },
    { id: 'win-rate', label: 'VAT Conversion Rate', value: '27.2%', change: '+3.1% vs last Mo', up: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  ],
};

const PIPELINE_DATA: Record<'group' | 'corporate' | 'financial', PipelineStage[]> = {
  group: [
    { stage: 'Prospecting', count: 32, value: 'AED 420K', pct: 85 },
    { stage: 'Qualifying', count: 18, value: 'AED 680K', pct: 65 },
    { stage: 'Proposal', count: 11, value: 'AED 910K', pct: 45 },
    { stage: 'Negotiation', count: 6, value: 'AED 1.25M', pct: 28 },
    { stage: 'Closing', count: 3, value: 'AED 1.84M', pct: 12 },
  ],
  corporate: [
    { stage: 'Jurisdiction Check', count: 16, value: 'AED 210K', pct: 80 },
    { stage: 'Document Pre-approval', count: 10, value: 'AED 340K', pct: 60 },
    { stage: 'MOA Drafting & Notary', count: 6, value: 'AED 450K', pct: 40 },
    { stage: 'Trade License Issuance', count: 4, value: 'AED 620K', pct: 25 },
    { stage: 'Visa Stamping Phase', count: 2, value: 'AED 920K', pct: 10 },
  ],
  financial: [
    { stage: 'Tax Assessment Audit', count: 16, value: 'AED 210K', pct: 90 },
    { stage: 'Corporate Tax Scope', count: 8, value: 'AED 340K', pct: 70 },
    { stage: 'VAT Pre-Registration', count: 5, value: 'AED 460K', pct: 50 },
    { stage: 'Audit Engagement Review', count: 2, value: 'AED 630K', pct: 30 },
    { stage: 'Active Filing / Retention', count: 1, value: 'AED 920K', pct: 15 },
  ],
};

const RECENT_DEALS: Deal[] = [
  { name: 'Sunrise Exports Setup', company: 'Sunrise Exports Providers', value: 'AED 45,000', stage: 'Proposal Sent', type: 'corporate', owner: 'Ravi Mehta' },
  { name: 'Al Jaber Bookkeeping & Tax', company: 'Al Jaber Group', value: 'AED 120,000', stage: 'In Progress', type: 'financial', owner: 'Priya Sharma' },
  { name: 'Silicon Oasis Tech RRL', company: 'Silicon Oasis Ltd', value: 'AED 85,000', stage: 'Lead', type: 'corporate', owner: 'Amit Desai' },
  { name: 'Vertex Advisory & Audit', company: 'Vertex FZCO', value: 'AED 60,000', stage: 'Engagement Active', type: 'financial', owner: 'Neha Kapoor' },
];

const INVOICES: InvoiceItem[] = [
  { id: 'INV-2026-042', client: 'Sunrise Exports', service: 'Jurisdiction Licensing Fee', value: 'AED 8,500.00', date: '15 June 2026', status: 'Paid', type: 'corporate' },
  { id: 'INV-2026-043', client: 'Al Jaber Group', service: 'VAT Return Filing (Q1)', value: 'AED 4,500.00', date: '14 June 2026', status: 'Pending', type: 'financial' },
  { id: 'INV-2026-044', client: 'Silicon Oasis Ltd', service: 'PRO Visa Processing Fees', value: 'AED 2,200.00', date: '12 June 2026', status: 'Paid', type: 'corporate' },
  { id: 'INV-2026-045', client: 'Vertex FZCO', service: 'Audit Engagement retainer', value: 'AED 7,500.00', date: '10 June 2026', status: 'Draft', type: 'financial' },
];

const EMAILS: EmailItem[] = [
  { id: 'em-1', sender: 'Suresh Nair (Zeon)', subject: 'VAT Return document checklist', preview: 'Hi Priya, I have compiled the VAT excel worksheets for Q2...', time: '14m ago', read: false, initials: 'SN', type: 'financial' },
  { id: 'em-2', sender: 'Amit Desai (IncHub)', subject: 'Sunrise Exports MOA draft approval', preview: 'Mahesh, please check the attached mainland MOA draft, looks good to...', time: '1h ago', read: true, initials: 'AD', type: 'corporate' },
  { id: 'em-3', sender: 'Al Jaber Admin', subject: 'Tax invoice payment confirmation', preview: 'We have processed the wire transfer for Invoice #FS-2026-001. Please find...', time: '3h ago', read: true, initials: 'AJ', type: 'financial' },
  { id: 'em-4', sender: 'Ravi Mehta (IncHub)', subject: 'Weekly Pipeline Report (Corporate)', preview: 'Summary of offshore and freezone applications registered this week for the...', time: '5h ago', read: true, initials: 'RM', type: 'corporate' },
];

const LEAD_CHANNELS: Record<'group' | 'corporate' | 'financial', LeadChannel[]> = {
  group: [
    { name: 'Website Organic Forms', count: 68, pct: 45, color: '#B8892A' },
    { name: 'LinkedIn Executive Outreach', count: 42, pct: 28, color: '#E8760A' },
    { name: 'Direct Corporate Referrals', count: 28, pct: 18, color: '#2C1A0E' },
    { name: 'Authorized Agency Partners', count: 10, pct: 9, color: '#6B3F22' },
  ],
  corporate: [
    { name: 'DIFC/ADGM Web Enquiries', count: 38, pct: 48, color: '#B8892A' },
    { name: 'PRO Network Referrals', count: 22, pct: 28, color: '#2C1A0E' },
    { name: 'Succession Seminar Leads', count: 14, pct: 18, color: '#4A2E1A' },
    { name: 'Offshore Partner Agents', count: 8, pct: 6, color: '#6B3F22' },
  ],
  financial: [
    { name: 'FTA Registered Agent Portal', count: 30, pct: 42, color: '#E8760A' },
    { name: 'Corporate Tax Assistance Forms', count: 20, pct: 28, color: '#2A1628' },
    { name: 'Bookkeeping Packages Landing Page', count: 12, pct: 17, color: '#F09040' },
    { name: 'Payroll/VAT Referral Network', count: 9, pct: 13, color: '#5A2D5A' },
  ],
};

const MEETINGS_DATA: Record<'group' | 'corporate' | 'financial', { title: string; client: string; time: string; type: 'corporate' | 'financial' | 'internal' }[]> = {
  group: [
    { title: 'VAT Pre-filing Session', client: 'Al Jaber Group', time: '11:00 AM - 11:45 AM', type: 'financial' },
    { title: 'DIFC Corporate Licensing', client: 'Silicon Oasis Ltd', time: '1:30 PM - 2:15 PM', type: 'corporate' },
    { title: 'Weekly Progress Sync', client: 'Internal Team', time: '4:00 PM - 4:30 PM', type: 'internal' },
  ],
  corporate: [
    { title: 'DIFC Corporate Licensing', client: 'Silicon Oasis Ltd', time: '1:30 PM - 2:15 PM', type: 'corporate' },
    { title: 'Mainland Shareholder Signing', client: 'Sunrise Exports', time: '3:00 PM - 3:30 PM', type: 'corporate' },
  ],
  financial: [
    { title: 'VAT Pre-filing Session', client: 'Al Jaber Group', time: '11:00 AM - 11:45 AM', type: 'financial' },
    { title: 'Corporate Tax Scope Review', client: 'Vertex FZCO', time: '2:30 PM - 3:15 PM', type: 'financial' },
  ],
};

const ACTIVITIES_DATA: Record<'group' | 'corporate' | 'financial', { actor: string; action: string; target: string; time: string; dot: string; initials: string }[]> = {
  group: [
    { actor: 'Ravi Mehta', action: 'created a new lead', target: 'TechSoft India', time: '5m ago', dot: '#2C1A0E', initials: 'RM' },
    { actor: 'Priya Sharma', action: 'moved deal to', target: 'Negotiation stage', time: '22m ago', dot: '#E8760A', initials: 'PS' },
    { actor: 'Amit Desai', action: 'completed task', target: 'Demo call with Acme', time: '1h ago', dot: '#B8892A', initials: 'AD' },
    { actor: 'Neha Kapoor', action: 'added contact', target: 'Suresh Nair at Zeon', time: '2h ago', dot: '#E8760A', initials: 'NK' },
  ],
  corporate: [
    { actor: 'Ravi Mehta', action: 'created a new lead', target: 'TechSoft India', time: '5m ago', dot: '#2C1A0E', initials: 'RM' },
    { actor: 'Amit Desai', action: 'completed task', target: 'Demo call with Acme', time: '1h ago', dot: '#B8892A', initials: 'AD' },
    { actor: 'Ravi Mehta', action: 'uploaded mainland MOA draft', target: 'Sunrise Exports', time: '3h ago', dot: '#2C1A0E', initials: 'RM' },
  ],
  financial: [
    { actor: 'Priya Sharma', action: 'moved deal to', target: 'Negotiation stage', time: '22m ago', dot: '#E8760A', initials: 'PS' },
    { actor: 'Neha Kapoor', action: 'added contact', target: 'Suresh Nair at Zeon', time: '2h ago', dot: '#E8760A', initials: 'NK' },
    { actor: 'Priya Sharma', action: 'generated draft invoice for', target: 'Vertex FZCO', time: '4h ago', dot: '#E8760A', initials: 'PS' },
  ],
};

export default function DashboardPage() {
  const { currentBrand, setCurrentBrand, role } = usePermission();
  const { showToast, showConfirm, showAlert } = useNotification();

  if (role === 'client') {
    return <ClientPortal />;
  }

  const viewMode = currentBrand;
  const setViewMode = setCurrentBrand;
  const [kycAlert, setKycAlert] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function checkKyc() {
      try {
        interface KycItemLocal {
          name: string;
          status: string;
          expiry_date: string | null;
        }
        interface KycResponseLocal {
          success: boolean;
          data: KycItemLocal[];
        }
        const response = await get<KycResponseLocal>('/bookkeeping/kyc');
        if (active && response?.success && Array.isArray(response.data)) {
          const hasExpired = response.data.some((item) => item.status === 'expired');
          setKycAlert(hasExpired);
        }
      } catch (err) {
        console.warn('KYC check offline (backend is not running):', err);
      }
    }
    checkKyc();
    return () => {
      active = false;
    };
  }, []);

  // Theme settings based on current viewMode
  const activeDotColor = viewMode === 'financial' ? '#E8760A' : '#B8892A';
  const accentColor = viewMode === 'financial' ? '#E8760A' : '#B8892A';
  const primaryBg = viewMode === 'financial' ? '#2A1628' : '#2C1A0E';
  const cardBorderColor = viewMode === 'financial' ? '#DDD0C4' : '#DDD4BE';

  // Filter components by viewMode
  const filteredDeals = RECENT_DEALS.filter(d => viewMode === 'group' || d.type === viewMode);
  const filteredInvoices = INVOICES.filter(inv => viewMode === 'group' || inv.type === viewMode);
  const filteredEmails = EMAILS.filter(em => viewMode === 'group' || em.type === viewMode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: primaryBg, transition: 'all 300ms ease' }}>
      
      {/* ── Executive Brand Welcome Hero Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryBg} 0%, #110510 100%)`,
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        color: '#ffffff',
        border: `1px solid ${cardBorderColor}`,
        boxShadow: '0 12px 35px -10px rgba(42, 22, 40, 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle division accent glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '50%',
          height: '200%',
          background: `radial-gradient(circle, ${accentColor}12 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeDotColor }} />
              <p style={{ margin: 0, fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                {viewMode === 'financial' ? 'Division II — Financial Operations' : viewMode === 'corporate' ? 'Division I — Corporate Advisory' : 'IncHub Group Portfolio'}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  background: kycAlert ? '#fee2e2' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${kycAlert ? '#fca5a5' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: kycAlert ? '#ef4444' : '#ffffff',
                  fontFamily: 'Inter, sans-serif',
                  marginLeft: '0.5rem',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: kycAlert ? '#ef4444' : activeDotColor }} />
                {kycAlert ? 'KYC Action Required' : 'KYC Compliant'}
              </span>
            </div>
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              fontFamily: 'Cormorant, serif',
            }}>
              Welcome to the Hub, <span style={{ fontStyle: 'italic', color: accentColor }}>Mahesh</span>
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}>
              IncHub Workspace Suite • Connected to database node active
            </p>
          </div>

          {/* Brand tabs switcher (CEO / Admin privileges) */}
          {(role === 'admin' || role === 'ceo') && (
            <div style={{ 
              display: 'flex', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '10px', 
              padding: '0.25rem',
              backdropFilter: 'blur(10px)',
            }}>
              {([
                { mode: 'group', label: 'Group Overview', dot: '#B8892A' },
                { mode: 'corporate', label: 'Corporate Services', dot: '#B8892A' },
                { mode: 'financial', label: 'Financial Services', dot: '#E8760A' }
              ] as const).map(tab => (
                <button
                  key={tab.mode}
                  onClick={() => setViewMode(tab.mode)}
                  style={{
                    padding: '0.45rem 0.875rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === tab.mode ? '#ffffff' : 'transparent',
                    color: viewMode === tab.mode ? primaryBg : 'rgba(255, 255, 255, 0.65)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <span style={{ 
                    width: 5, 
                    height: 5, 
                    borderRadius: '50%', 
                    background: viewMode === tab.mode ? primaryBg : tab.dot, 
                    display: 'inline-block' 
                  }} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Integrated sleek CRM console toolbar */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            Quick Actions Command:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { label: 'Create Lead', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> },
              { label: 'Add Contact', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
              { label: 'Log Call/Task', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> },
              { label: 'New Invoice', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
              { label: 'Compose Email', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> }
            ].map((act, i) => (
              <button
                key={i}
                onClick={() => showToast(`${act.label} widget window is coming soon.`, 'info')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.45rem 0.875rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = primaryBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                {act.icon}
                {act.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Metrics Overview Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {STATS_DATA[viewMode].map((s) => (
          <div
            key={s.id}
            id={s.id}
            className="kpi-card"
            style={{
              background: '#ffffff',
              border: `1px solid ${cardBorderColor}`,
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 4px 15px -3px rgba(42, 22, 40, 0.02)',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 12px 25px -8px ${accentColor}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = cardBorderColor;
              e.currentTarget.style.boxShadow = '0 4px 15px -3px rgba(42, 22, 40, 0.02)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: viewMode === 'financial' ? 'rgba(232,118,10,0.06)' : 'rgba(184,137,42,0.06)',
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {s.icon}
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: s.up ? (viewMode === 'financial' ? 'rgba(232,118,10,0.1)' : 'rgba(184,137,42,0.1)') : 'rgba(239, 68, 68, 0.08)',
                  color: s.up ? accentColor : '#ef4444',
                }}
              >
                {s.change}
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.875rem', fontWeight: 300, letterSpacing: '-0.02em', color: primaryBg, fontFamily: 'Cormorant, serif' }}>
                {s.value}
              </p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.625rem', color: 'rgba(42, 22, 40, 0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-Column High-End Operational Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Pipeline, Active Deals & Billing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Sales Pipeline Card */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${cardBorderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px -3px rgba(42, 22, 40, 0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: primaryBg }}>
                Sales Pipeline
              </h2>
              <span style={{ fontSize: '0.625rem', color: accentColor, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                {viewMode.toUpperCase()} STAGES
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {PIPELINE_DATA[viewMode].map((p) => (
                <div key={p.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: 'rgba(42, 22, 40, 0.8)' }}>{p.stage}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(42, 22, 40, 0.4)' }}>{p.count} deals</span>
                      <span style={{ fontWeight: 700, color: primaryBg }}>{p.value}</span>
                    </div>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(42, 22, 40, 0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.pct}%`, background: accentColor, borderRadius: '99px', transition: 'width 800ms ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Deals Table Card */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${cardBorderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px -3px rgba(42, 22, 40, 0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: primaryBg }}>
                Active Engagement Pipeline
              </h2>
              <span style={{ fontSize: '0.625rem', color: accentColor, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Show all ({filteredDeals.length})
              </span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${cardBorderColor}`, color: 'rgba(42, 22, 40, 0.4)', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>DEAL DETAILS</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>VALUE</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>STAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((d, i) => (
                    <tr key={i} style={{ borderBottom: i < filteredDeals.length - 1 ? '1px solid rgba(42, 22, 40, 0.05)' : 'none' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ fontWeight: 600, display: 'block', color: primaryBg }}>{d.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(42, 22, 40, 0.4)' }}>Owner: {d.owner} • {d.company}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: primaryBg }}>{d.value}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: d.type === 'corporate' ? 'rgba(44, 26, 14, 0.08)' : 'rgba(42, 22, 40, 0.08)',
                          color: d.type === 'corporate' ? '#2C1A0E' : '#2A1628',
                        }}>
                          <span style={{ 
                            width: 5, 
                            height: 5, 
                            borderRadius: '50%', 
                            background: d.type === 'corporate' 
                              ? (d.stage === 'Lead' ? '#2C1A0E' : d.stage === 'Proposal Sent' ? '#4A2E1A' : d.stage === 'In Progress' ? '#6B3F22' : '#B8892A')
                              : (d.stage === 'Lead' ? '#2A1628' : d.stage === 'Proposal Sent' ? '#3D2040' : d.stage === 'In Progress' ? '#5A2D5A' : '#E8760A')
                          }} />
                          {d.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing & Invoice Widget */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${cardBorderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px -3px rgba(42, 22, 40, 0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: primaryBg }}>
                Billing &amp; Invoices
              </h2>
              <span style={{ fontSize: '0.625rem', color: accentColor, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                Recent Billings
              </span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${cardBorderColor}`, color: 'rgba(42, 22, 40, 0.4)', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>INVOICE ID</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>CLIENT</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>VALUE</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.625rem', letterSpacing: '0.18em', fontFamily: 'Inter, sans-serif' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(42, 22, 40, 0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: primaryBg }}>{inv.id}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ fontWeight: 600, display: 'block', color: primaryBg }}>{inv.client}</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(42, 22, 40, 0.4)' }}>{inv.service}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: primaryBg }}>{inv.value}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.08)' : inv.status === 'Pending' ? 'rgba(232, 118, 10, 0.08)' : 'rgba(42, 22, 40, 0.04)',
                          color: inv.status === 'Paid' ? '#10b981' : inv.status === 'Pending' ? '#E8760A' : 'rgba(42, 22, 40, 0.5)',
                        }}>
                          <span style={{ 
                            width: 5, 
                            height: 5, 
                            borderRadius: '50%', 
                            background: inv.status === 'Paid' ? '#10b981' : inv.status === 'Pending' ? '#E8760A' : 'rgba(42, 22, 40, 0.5)' 
                          }} />
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Communications & Timeline Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Unified Communications Hub Card */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${cardBorderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px -3px rgba(42, 22, 40, 0.02)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: primaryBg }}>
              Unified Comms Hub
            </h2>

            {/* Sub-Header: Email Communications */}
            <div style={{ borderBottom: `1px solid ${cardBorderColor}`, paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase' }}>
                Recent E-Mail Communication
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {filteredEmails.map((em) => (
                <div key={em.id} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  fontSize: '0.8125rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: em.read ? 'transparent' : 'rgba(42, 22, 40, 0.02)',
                  borderLeft: em.read ? '2px solid transparent' : `2px solid ${accentColor}`,
                  transition: 'all 200ms ease'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: em.type === 'financial' ? 'rgba(232,118,10,0.08)' : 'rgba(184,137,42,0.08)',
                    color: em.type === 'financial' ? '#E8760A' : '#B8892A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem', fontWeight: 700
                  }}>
                    {em.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: em.read ? 500 : 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: primaryBg }}>
                        {em.sender}
                      </span>
                      <span style={{ fontSize: '0.625rem', color: 'rgba(42, 22, 40, 0.4)', flexShrink: 0 }}>
                        {em.time}
                      </span>
                    </div>
                    <p style={{ margin: '0.1rem 0 0', fontWeight: em.read ? 400 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: primaryBg, fontSize: '0.75rem' }}>
                      {em.subject}
                    </p>
                  </div>
                </div>
              ))}
              {filteredEmails.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(42, 22, 40, 0.4)', textAlign: 'center', padding: '1rem 0' }}>
                  No active emails logged.
                </p>
              )}
            </div>

            {/* Sub-Header: Today's Meetings */}
            <div style={{ borderBottom: `1px solid ${cardBorderColor}`, paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase' }}>
                Today's Briefing Calendar
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {MEETINGS_DATA[viewMode].map((m, idx) => (
                <div key={idx} style={{ 
                  padding: '0.625rem 0.875rem', 
                  background: m.type === 'financial' ? '#F6F2EE' : m.type === 'corporate' ? '#F6F1E8' : 'rgba(42, 22, 40, 0.02)', 
                  border: `1px solid ${m.type === 'financial' ? '#DDD0C4' : m.type === 'corporate' ? '#DDD4BE' : 'rgba(42, 22, 40, 0.08)'}`, 
                  borderRadius: '6px',
                  transition: 'all 300ms ease'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: primaryBg }}>{m.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.6875rem', color: 'rgba(42, 22, 40, 0.5)' }}>
                    <span>{m.client}</span>
                    <span style={{ fontWeight: 600, color: accentColor }}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Timeline Activity Logs */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${cardBorderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px -3px rgba(42, 22, 40, 0.02)',
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', color: primaryBg }}>
              Operations Feed
            </h2>
            
            {/* Timeline structure */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1rem', borderLeft: `1px solid ${cardBorderColor}` }}>
              {ACTIVITIES_DATA[viewMode].map((a, i) => (
                <div key={i} style={{ position: 'relative', fontSize: '0.8125rem' }}>
                  {/* Timeline dot marker */}
                  <span style={{
                    position: 'absolute',
                    left: '-21px',
                    top: '5px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: a.dot,
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 2px rgba(42, 22, 40, 0.04)',
                  }} />
                  
                  <div style={{ lineHeight: 1.4 }}>
                    <p style={{ margin: 0, color: 'rgba(42, 22, 40, 0.85)' }}>
                      <strong style={{ color: primaryBg, fontWeight: 600 }}>{a.actor}</strong> {a.action} <span style={{ color: a.dot, fontWeight: 600 }}>{a.target}</span>
                    </p>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(42, 22, 40, 0.4)', fontWeight: 500, display: 'block', marginTop: '0.15rem' }}>
                      {a.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

