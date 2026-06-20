'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePermission } from '@/context/PermissionContext';
import { clearTokens, get } from '@/lib/apiClient';

/* ── Icons ────────────────────────────────────────────────────────────────── */
type IconProps = React.SVGProps<SVGSVGElement>;

function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function LogOutIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/* ── Notification data ────────────────────────────────────────────────────── */
const NOTIFICATIONS = [
  { id: 1, text: 'New lead assigned: Acme Corp', time: '2 min ago',  dot: '#B8892A' },
  { id: 2, text: 'Deal "Project X" moved to closing', time: '18 min ago', dot: '#E8760A' },
  { id: 3, text: 'Task overdue: Follow-up with client', time: '1 hr ago',  dot: '#6B3F22' },
  { id: 4, text: 'New comment on deal #4521', time: '3 hr ago',  dot: '#2C1A0E' },
];

/* ── Component ────────────────────────────────────────────────────────────── */
export default function TopNavbar() {
  const { permissions, allAvailablePermissions, togglePermission } = usePermission();
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shieldOpen, setShieldOpen]   = useState(false);
  const [kycExpired, setKycExpired]   = useState(false);
  
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const shieldRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

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
          setKycExpired(hasExpired);
        }
      } catch (err) {
        console.warn('KYC check offline (backend is not running):', err instanceof Error ? err.message : err);
      } finally {
        if (active) {
          timerId = setTimeout(checkKyc, 10000);
        }
      }
    }

    checkKyc();

    return () => {
      active = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (shieldRef.current && !shieldRef.current.contains(e.target as Node))   setShieldOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      id="top-navbar"
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--bg-topbar)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ── Search bar ── */}
      <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
        <SearchIcon
          style={{
            position: 'absolute', left: '0.875rem', top: '50%',
            transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(44,26,14,0.4)',
            pointerEvents: 'none',
          }}
        />
        <input
          id="global-search"
          type="search"
          placeholder="Search contacts, deals, tasks…"
          style={{
            width: '100%',
            height: 38,
            paddingLeft: '2.25rem',
            paddingRight: '0.875rem',
            border: '1px solid #DDD4BE',
            borderRadius: 8,
            background: '#F6F1E8',
            fontSize: '0.875rem',
            color: '#2C1A0E',
            outline: 'none',
            transition: 'border-color 150ms, box-shadow 150ms',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#B8892A';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,137,42,0.15)';
            e.currentTarget.style.background = '#ffffff';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#DDD4BE';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = '#F6F1E8';
          }}
        />
        <kbd
          style={{
            position: 'absolute', right: '0.75rem', top: '50%',
            transform: 'translateY(-50%)',
            background: '#EDE7D8', border: '1px solid #DDD4BE',
            borderRadius: 4, padding: '0.1rem 0.4rem',
            fontSize: '0.625rem', color: 'rgba(44,26,14,0.5)', fontFamily: 'inherit',
            pointerEvents: 'none',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* ── Quick Add button ── */}
      <button
        id="quick-add-btn"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          height: 36, padding: '0 0.875rem',
          background: 'linear-gradient(135deg, #2C1A0E 0%, #B8892A 100%)',
          color: '#ffffff', border: 'none', borderRadius: 8,
          fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(44,26,14,0.3)',
          transition: 'opacity 150ms, transform 150ms',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <PlusIcon style={{ width: 14, height: 14 }} />
        New
      </button>

      {/* ── KYC Expired Alert Badge ── */}
      {kycExpired && (
        <div
          id="global-kyc-alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0 0.75rem',
            height: 36,
            borderRadius: 8,
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          KYC ALERT: DOCUMENT EXPIRED
        </div>
      )}

      {/* ── Dynamic RBAC Switcher ── */}
      <div ref={shieldRef} style={{ position: 'relative' }}>
        <button
          id="rbac-shield-btn"
          aria-label="Dynamic RBAC permissions"
          onClick={() => { setShieldOpen(!shieldOpen); setNotifOpen(false); setProfileOpen(false); }}
          style={{
            position: 'relative', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #DDD4BE', borderRadius: 8,
            background: shieldOpen ? '#EDE7D8' : '#F6F1E8',
            color: 'rgba(44,26,14,0.6)', cursor: 'pointer', transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE7D8'; (e.currentTarget as HTMLButtonElement).style.color = '#2C1A0E'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = shieldOpen ? '#EDE7D8' : '#F6F1E8'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(44,26,14,0.6)'; }}
        >
          <ShieldIcon style={{ width: 18, height: 18, color: permissions.length > 0 ? '#B8892A' : '#6B3F22' }} />
          {/* Active indicator badge */}
          <span
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: permissions.length === allAvailablePermissions.length ? '#B8892A' : permissions.length > 0 ? '#C9A040' : '#6B3F22',
              border: '2px solid white',
            }}
          />
        </button>

        {/* Shield Dropdown */}
        {shieldOpen && (
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 280, background: '#ffffff',
              border: '1px solid #DDD4BE', borderRadius: 12,
              boxShadow: '0 10px 40px rgba(44,26,14,0.12)',
              zIndex: 50, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #EDE7D8' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#2C1A0E', display: 'block' }}>Active RBAC Controls</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(44,26,14,0.45)' }}>Toggle keys to lock/unlock UI fields</span>
            </div>
            
            <div style={{ maxHeight: 240, overflowY: 'auto', padding: '0.375rem 0' }}>
              {allAvailablePermissions.map((perm) => {
                const has = permissions.includes(perm);
                return (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      width: '100%', padding: '0.5rem 1rem', border: 'none',
                      background: 'transparent', cursor: 'pointer', textAlign: 'left',
                      fontSize: '0.8125rem', color: has ? '#2C1A0E' : 'rgba(44,26,14,0.5)',
                      transition: 'background 150ms'
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F6F1E8'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span
                      style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '1px solid #cbd5e1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: has ? '#B8892A' : '#f1f5f9',
                        borderColor: has ? '#B8892A' : '#cbd5e1',
                        flexShrink: 0
                      }}
                    >
                      {has && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span style={{ fontWeight: has ? 600 : 400 }}>{perm}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ borderTop: '1px solid #DDD4BE', padding: '0.625rem 1rem', background: '#F6F1E8', textAlign: 'center' }}>
              <Link
                href="/settings"
                onClick={() => setShieldOpen(false)}
                style={{ fontSize: '0.75rem', color: '#B8892A', fontWeight: 600, textDecoration: 'none' }}
              >
                Go to RBAC Sandbox Console →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Notifications ── */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          id="notifications-btn"
          aria-label="Notifications"
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          style={{
            position: 'relative', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #DDD4BE', borderRadius: 8,
            background: notifOpen ? '#EDE7D8' : '#F6F1E8',
            color: 'rgba(44,26,14,0.6)', cursor: 'pointer', transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE7D8'; (e.currentTarget as HTMLButtonElement).style.color = '#2C1A0E'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = notifOpen ? '#EDE7D8' : '#F6F1E8'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(44,26,14,0.6)'; }}
        >
          <BellIcon style={{ width: 18, height: 18 }} />
          {/* Badge */}
          <span
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: '#B8892A', border: '2px solid white',
            }}
          />
        </button>

        {/* Notification dropdown */}
        {notifOpen && (
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 320, background: '#ffffff',
              border: '1px solid #DDD4BE', borderRadius: 12,
              boxShadow: '0 10px 40px rgba(44,26,14,0.12)',
              zIndex: 50, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #EDE7D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#2C1A0E' }}>Notifications</span>
              <span style={{ fontSize: '0.75rem', color: '#B8892A', cursor: 'pointer', fontWeight: 500 }}>Mark all read</span>
            </div>
            {NOTIFICATIONS.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #EDE7D8',
                  cursor: 'pointer', transition: 'background 150ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F6F1E8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, flexShrink: 0, marginTop: 5 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#2C1A0E', lineHeight: 1.4 }}>{n.text}</p>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'rgba(44,26,14,0.4)' }}>{n.time}</p>
                </div>
              </div>
            ))}
            <Link
              href="/notifications"
              style={{
                display: 'block', textAlign: 'center', padding: '0.75rem',
                fontSize: '0.8125rem', color: '#B8892A', fontWeight: 500,
                textDecoration: 'none',
              }}
              onClick={() => setNotifOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        )}
      </div>

      {/* ── Profile ── */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          id="profile-menu-btn"
          aria-label="Profile menu"
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            height: 36, padding: '0 0.5rem 0 0.375rem',
            border: '1px solid #DDD4BE', borderRadius: 8,
            background: profileOpen ? '#EDE7D8' : '#F6F1E8',
            color: '#2C1A0E', cursor: 'pointer', transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE7D8'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = profileOpen ? '#EDE7D8' : '#F6F1E8'; }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9A040 0%, #B8892A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 700, color: '#ffffff',
              flexShrink: 0,
            }}
          >
            MA
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap' }}>Mahesh</span>
          <ChevronDownIcon
            style={{
              width: 14, height: 14, color: 'rgba(44,26,14,0.4)',
              transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms',
            }}
          />
        </button>

        {/* Profile dropdown */}
        {profileOpen && (
          <div
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 200, background: '#ffffff',
              border: '1px solid #DDD4BE', borderRadius: 12,
              boxShadow: '0 10px 40px rgba(44,26,14,0.12)',
              zIndex: 50, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #EDE7D8' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#2C1A0E' }}>Mahesh</p>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'rgba(44,26,14,0.4)' }}>admin@inchcrm.com</p>
            </div>
            {[
              { label: 'My Profile',  href: '/profile',  icon: UserIcon },
              { label: 'Settings',    href: '/settings', icon: SettingsIconMini },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 1rem',
                    textDecoration: 'none', fontSize: '0.8125rem',
                    color: '#4A2E1A', transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#F6F1E8'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  <Icon style={{ width: 16, height: 16, color: '#64748b' }} />
                  {item.label}
                </Link>
              );
            })}
            <div style={{ borderTop: '1px solid #DDD4BE', padding: '0.375rem 0' }}>
              <button
                id="logout-btn"
                onClick={() => {
                  clearTokens();
                  window.location.href = '/login';
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  width: '100%', padding: '0.625rem 1rem',
                  border: 'none', background: 'transparent',
                  fontSize: '0.8125rem', color: '#ef4444', cursor: 'pointer',
                  transition: 'background 150ms', textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogOutIcon style={{ width: 16, height: 16 }} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* inline mini settings icon for profile menu */
function SettingsIconMini(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
