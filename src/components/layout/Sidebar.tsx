/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import type { NavSection } from '@/types/navigation';
import { usePermission, UserRole } from '@/context/PermissionContext';
import { get } from '@/lib/apiClient';

/* ── SVG Icons (inline, zero-dependency) ─────────────────────────────────── */
type IconProps = React.SVGProps<SVGSVGElement>;

function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function DashboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function ContactsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function LeadsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
function DealsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
function TasksIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function ReportsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function EmailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function AccountingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

/* ── Nav configuration ────────────────────────────────────────────────────── */
const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/', icon: DashboardIcon },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Contacts', href: '/contacts', icon: ContactsIcon, badge: 248 },
      { label: 'Leads', href: '/leads', icon: LeadsIcon, badge: 12 },
      { label: 'Deals', href: '/deals', icon: DealsIcon },
      { label: 'Tasks', href: '/tasks', icon: TasksIcon, badge: 5 },
      { label: 'Accounting', href: '/accounting', icon: AccountingIcon },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Email', href: '/email', icon: EmailIcon },
      { label: 'Reports', href: '/reports', icon: ReportsIcon },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: SettingsIcon },
    ],
  },
];

const CLIENT_NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Home', href: '/', icon: DashboardIcon },
    ],
  },
  {
    title: 'Meetings',
    items: [
      { label: 'Book Consultation', href: '/meetings/book', icon: ContactsIcon },
      { label: 'Meeting History', href: '/meetings/history', icon: ReportsIcon },
      { label: 'Notes & Actions', href: '/meetings/notes', icon: TasksIcon },
    ],
  },
  {
    title: 'Proposal & Payments',
    items: [
      { label: 'Engagement Letter', href: '/proposal', icon: EmailIcon },
      { label: 'Invoices & Payments', href: '/payments', icon: AccountingIcon },
    ],
  },
  {
    title: 'Project',
    items: [
      { label: 'Project Tracker', href: '/project', icon: DealsIcon },
      { label: 'Task Status', href: '/project/tasks', icon: TasksIcon },
      { label: 'Upload Documents', href: '/project/upload', icon: EmailIcon },
      { label: 'Download Documents', href: '/project/download', icon: EmailIcon },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { label: 'KYC & Documents', href: '/compliance/kyc', icon: ContactsIcon },
    ],
  },
  {
    title: 'Testing & QA',
    items: [
      { label: 'UAT Checklist', href: '/testing/uat', icon: ReportsIcon },
      { label: 'Feedback & Bugs', href: '/testing/bugs', icon: TasksIcon },
    ],
  },
  {
    title: 'Accounting',
    items: [
      { label: 'Accounting Dashboard', href: '/accounting-client', icon: AccountingIcon },
      { label: 'Annual P&L', href: '/accounting/pl', icon: ReportsIcon },
      { label: 'CT Year-End', href: '/accounting/archive', icon: ReportsIcon },
    ],
  },
  {
    title: 'Growth',
    items: [
      { label: 'Renewal Summary', href: '/growth/renewals', icon: DealsIcon },
      { label: 'Add-On Services', href: '/growth/addons', icon: LeadsIcon },
    ],
  },

  {
    title: 'Support',
    items: [
      { label: 'Help Centre / FAQs', href: '/support', icon: SettingsIcon },
    ],
  },
];

/* ── Props ────────────────────────────────────────────────────────────────── */
interface SidebarProps {
  collapsed: boolean;
  hidden: boolean;
  onToggle: () => void;
  activeBrand?: 'group' | 'corporate' | 'financial';
}

/* ── Component ────────────────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, hidden, onToggle, activeBrand }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || '';
  const { role } = usePermission();
  const isClient = role === UserRole.CLIENT;
  const isFinancial = activeBrand === 'financial' || pathname === '/accounting' || pathname.startsWith('/accounting/');
  const [accountingExpanded, setAccountingExpanded] = useState(pathname.startsWith('/accounting'));
  const [clientStage, setClientStage] = useState(1);

  useEffect(() => {
    if (pathname.startsWith('/accounting')) {
      setAccountingExpanded(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isClient) {
      // Fetch the stage so we can lock/unlock sidebar items
      const fetchProfile = async () => {
        try {
          const res = await get<{ success: boolean; data: any }>('/bookkeeping/profile');
          if (res?.success && res.data?.onboarding_stage) {
            setClientStage(res.data.onboarding_stage);
          }
        } catch (e) {
          // ignore
        }
      };
      fetchProfile();

      // Poll every few seconds since the UAT simulator on Home might change it
      const interval = setInterval(fetchProfile, 5000);
      return () => clearInterval(interval);
    }
  }, [isClient]);

  // Brand details
  const dotColor = isFinancial ? '#E8760A' : '#B8892A';
  const subtext = isFinancial ? 'Financial Services' : 'Corporate Services';

  // Logo mark container styling
  const logoMarkBackground = isFinancial
    ? 'linear-gradient(135deg, #F09040 0%, #E8760A 100%)'
    : 'linear-gradient(135deg, #C9A040 0%, #B8892A 100%)';
  const logoMarkBoxShadow = isFinancial
    ? '0 0 0 1px rgba(232,118,10,0.4), 0 4px 12px rgba(42,22,40,0.4)'
    : '0 0 0 1px rgba(184,137,42,0.4), 0 4px 12px rgba(44,26,14,0.4)';

  return (
    <aside
      style={{
        width: hidden ? 0 : collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        transition: 'width 300ms cubic-bezier(0.4,0,0.2,1), background-color 300ms ease, opacity 300ms cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        overflow: 'hidden',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0' : '0 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          gap: collapsed ? 0 : '0.75rem',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: logoMarkBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: logoMarkBoxShadow,
            transition: 'all 300ms ease',
          }}
        >
          <Image
            src="/logo_page_6.svg"
            alt="IncHub Logo"
            width={48}
            height={48}
            style={{ width: '65%', height: '65%', objectFit: 'contain' }}
          />
        </div>

        <div style={{
          display: collapsed ? 'none' : 'block',
          opacity: collapsed ? 0 : 1,
          visibility: collapsed ? 'hidden' : 'visible',
          transition: 'opacity 200ms ease, visibility 200ms ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          <p style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 600, lineHeight: 1.2, margin: 0, fontFamily: 'var(--font-serif), Georgia, serif' }}>
            Inc<span style={{ color: dotColor, transition: 'color 300ms ease' }}>·</span>Hub
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem', fontWeight: 500, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 300ms ease' }}>
            {subtext}
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.75rem 0' }}>
        {(isClient ? CLIENT_NAV_SECTIONS : NAV_SECTIONS).map((section, si) => (
          <div key={si} style={{ marginBottom: '0.25rem' }}>
            {/* Section title */}
            {section.title && (
              <p
                style={{
                  color: 'rgba(246,241,232,0.35)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '0.625rem 1.25rem 0.375rem',
                  margin: 0,
                  opacity: collapsed ? 0 : 1,
                  visibility: collapsed ? 'hidden' : 'visible',
                  transition: 'opacity 200ms ease, visibility 200ms ease, height 200ms ease',
                  height: collapsed ? 0 : 'auto',
                  overflow: 'hidden',
                }}
              >
                {section.title}
              </p>
            )}
            {section.title && collapsed && (
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 1.125rem' }} />
            )}

            {/* Items */}
            {section.items
              .filter((item) => {
                if (isClient) return true;
                // Settings is admin/ceo only
                if (item.href === '/settings' && role !== UserRole.ADMIN && role !== UserRole.CEO) {
                  return false;
                }
                // Accounting is gated to admin, ceo, accountant
                if (item.href === '/accounting' && role !== UserRole.ADMIN && role !== UserRole.CEO && role !== UserRole.ACCOUNTANT) {
                  return false;
                }
                return true;
              })
              .map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                let isLocked = false;
                let lockReason = '';

                if (isClient) {
                  switch (item.label) {
                    case 'Book Consultation':
                      if (clientStage > 2) {
                        isLocked = true;
                        lockReason = 'Your consultation is already booked or in progress. We will reactivate this if you need to schedule another meeting.';
                      }
                      break;
                    case 'Meeting History':
                      if (clientStage < 2) {
                        isLocked = true;
                        lockReason = 'Your meeting history will appear here after your first consultation with our team.';
                      }
                      break;
                    case 'Notes & Actions':
                      if (clientStage < 2) {
                        isLocked = true;
                        lockReason = 'Notes from your meetings will appear here after your first consultation.';
                      }
                      break;
                    case 'Engagement Letter':
                      if (clientStage < 3) {
                        isLocked = true;
                        lockReason = 'Your personalised proposal will appear here once it has been prepared and sent to you.';
                      }
                      break;
                    case 'Invoices & Payments':
                      if (clientStage < 4) {
                        isLocked = true;
                        lockReason = 'Your invoice will appear here once your proposal has been approved and confirmed.';
                      }
                      break;
                    case 'Project Tracker':
                      if (clientStage < 5) {
                        isLocked = true;
                        lockReason = 'Your project tracker will be activated once your payment is confirmed.';
                      }
                      break;
                    case 'Task Status':
                      if (clientStage < 6) {
                        isLocked = true;
                        lockReason = 'Live task updates will appear here once your project is officially activated by our team.';
                      }
                      break;
                    case 'Upload Documents':
                      if (clientStage < 6) {
                        isLocked = true;
                        lockReason = 'Document upload will be available here once your project begins.';
                      }
                      break;
                    case 'Download Documents':
                      if (clientStage < 6) {
                        isLocked = true;
                        lockReason = 'Your completed documents will appear here as they are issued by the relevant authorities.';
                      }
                      break;
                    case 'KYC & Documents':
                      if (clientStage < 5) {
                        isLocked = true;
                        lockReason = 'KYC documents will be requested once your project is active.';
                      }
                      break;
                    case 'UAT Checklist':
                    case 'Feedback & Bugs':
                      if (clientStage < 6) {
                        isLocked = true;
                        lockReason = 'Testing features will unlock once the project is in active development.';
                      }
                      break;
                    case 'Accounting Dashboard':
                      if (clientStage < 7) {
                        isLocked = true;
                        lockReason = 'Your accounting dashboard will be activated after your first monthly report is completed.';
                      }
                      break;
                    case 'Annual P&L':
                    case 'CT Year-End':
                      if (clientStage < 7) {
                        isLocked = true;
                        lockReason = 'Your annual P&L summary will appear here after your corporate tax return is submitted.';
                      }
                      break;
                    case 'Renewal Summary':
                      if (clientStage < 7) {
                        isLocked = true;
                        lockReason = 'Your renewal summary will appear here once your project is complete.';
                      }
                      break;
                    case 'Add-On Services':
                      if (clientStage < 7) {
                        isLocked = true;
                        lockReason = 'Our full service catalogue will be available here once your project is complete. You will be able to purchase additional services directly from here.';
                      }
                      break;
                  }
                }

                const LinkWrapper: any = (isLocked || !item.href) ? 'div' : Link;

                return (
                  <React.Fragment key={item.href || item.label}>
                    <LinkWrapper
                      {...(!isLocked && item.href ? { href: item.href } : {})}
                      onClick={(e: React.MouseEvent) => {
                        if (isLocked) {
                          e.preventDefault();
                          return;
                        }
                        if (item.href === '/accounting') {
                          setAccountingExpanded(!accountingExpanded);
                        }
                      }}
                      title={isLocked ? lockReason : (collapsed ? item.label : undefined)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: collapsed ? '0.625rem 0' : '0.625rem 1.25rem',
                        margin: '0.125rem 0.5rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        color: isLocked ? 'rgba(246,241,232,0.2)' : isActive ? '#ffffff' : 'rgba(246,241,232,0.5)',
                        background: isActive && !isLocked
                          ? isFinancial
                            ? 'linear-gradient(135deg, rgba(232,118,10,0.2) 0%, rgba(42,22,40,0.3) 100%)'
                            : 'linear-gradient(135deg, rgba(184,137,42,0.2) 0%, rgba(44,26,14,0.3) 100%)'
                          : 'transparent',
                        boxShadow: isActive && !isLocked
                          ? isFinancial
                            ? 'inset 0 0 0 1px rgba(232,118,10,0.25)'
                            : 'inset 0 0 0 1px rgba(184,137,42,0.25)'
                          : 'none',
                        transition: 'all 150ms ease',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                        if (!isActive && !isLocked) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                          e.currentTarget.style.color = 'rgba(246,241,232,0.85)';
                        }
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                        if (!isActive && !isLocked) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'rgba(246,241,232,0.5)';
                        }
                      }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: '60%',
                            background: isFinancial ? '#E8760A' : '#B8892A',
                            borderRadius: '0 4px 4px 0',
                          }}
                        />
                      )}

                      <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />

                      <span style={{
                        display: collapsed ? 'none' : 'block',
                        flex: 1,
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        opacity: collapsed ? 0 : 1,
                        visibility: collapsed ? 'hidden' : 'visible',
                        transition: 'opacity 200ms ease, visibility 200ms ease',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </span>

                      {isLocked && !collapsed && (
                        <svg
                          style={{
                            width: '12px',
                            height: '12px',
                            marginLeft: 'auto',
                            opacity: 0.5,
                            flexShrink: 0
                          }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      )}

                      {item.label === 'Accounting' && !collapsed && (
                        <svg
                          style={{
                            width: '14px',
                            height: '14px',
                            transform: accountingExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 200ms ease',
                            opacity: 0.5,
                            color: 'currentColor',
                            marginLeft: 'auto'
                          }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      )}

                      {item.badge !== undefined && (
                        <span
                          style={{
                            display: collapsed ? 'none' : 'inline-block',
                            background: isActive
                              ? isFinancial
                                ? '#E8760A'
                                : '#B8892A'
                              : 'rgba(255,255,255,0.1)',
                            color: isActive ? '#ffffff' : '#94a3b8',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '9999px',
                            minWidth: 20,
                            textAlign: 'center',
                            opacity: collapsed ? 0 : 1,
                            visibility: collapsed ? 'hidden' : 'visible',
                            transition: 'opacity 200ms ease, visibility 200ms ease',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </LinkWrapper>

                    {/* Accounting Submenus */}
                    {item.label === 'Accounting' && !isClient && accountingExpanded && !collapsed && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginLeft: '2.5rem',
                        marginTop: '0.25rem',
                        marginBottom: '0.5rem',
                        gap: '0.125rem'
                      }}>
                        {[
                          { label: 'Dashboard', tab: 'dashboard' },
                          { label: 'Client List', tab: 'client-list' },
                          { label: 'AI Bookkeeping Queue', tab: 'ai-queue' },
                          { label: 'Reconciliation Center', tab: 'reconciliation' },
                          { label: 'VAT Center', tab: 'vat' },
                          { label: 'Corporate Tax', tab: 'corporate-tax' },
                          { label: 'Reports', tab: 'reports' },
                          { label: 'QuickBooks', tab: 'quickbooks' },
                          { label: 'Vendors', tab: 'vendors' }
                        ].map((subItem) => {
                          const isSubActive = pathname === '/accounting' && currentTab === subItem.tab;
                          return (
                            <Link
                              key={subItem.tab}
                              href={`/accounting?tab=${subItem.tab}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.8125rem',
                                color: isSubActive ? '#ffffff' : 'rgba(246,241,232,0.45)',
                                background: isSubActive ? 'rgba(232,118,10,0.15)' : 'transparent',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontWeight: isSubActive ? 500 : 400,
                                transition: 'all 150ms ease',
                                fontFamily: 'inherit',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubActive) {
                                  e.currentTarget.style.color = 'rgba(246,241,232,0.85)';
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubActive) {
                                  e.currentTarget.style.color = 'rgba(246,241,232,0.45)';
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
          </div>
        ))}
      </nav>

      {/* ── Collapse toggle ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 0.5rem', flexShrink: 0 }}>
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : '0.75rem',
            padding: collapsed ? '0.625rem 0' : '0.625rem 0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'transparent',
            color: 'rgba(246,241,232,0.4)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(246,241,232,0.85)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(246,241,232,0.4)';
          }}
        >
          <ChevronLeftIcon
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
          <span style={{
            display: collapsed ? 'none' : 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            transition: 'opacity 200ms ease, visibility 200ms ease',
            whiteSpace: 'nowrap',
          }}>
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
