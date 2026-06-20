'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AiChatbot from '../chat/AiChatbot';
import { PermissionProvider } from '@/context/PermissionContext';
import { resolveToken } from '@/lib/apiClient';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell manages the sidebar collapsed/expanded state and
 * composes the full CRM chrome (sidebar + topbar + main content).
 * Handles dynamic auth page layout styling and route protection.
 */
export default function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthRoute = pathname === '/login' || pathname === '/forgot-password';
  const isFinancial = pathname === '/accounting' || pathname.startsWith('/accounting/');

  useEffect(() => {
    const root = document.documentElement;
    if (isFinancial) {
      root.style.setProperty('--bg-page', '#F6F2EE'); // Warm White
      root.style.setProperty('--bg-sidebar', '#2A1628'); // Deep Aubergine
      root.style.setProperty('--border-subtle', '#DDD0C4'); // FS Border
    } else {
      root.style.setProperty('--bg-page', '#F6F1E8'); // Warm Parchment
      root.style.setProperty('--bg-sidebar', '#2C1A0E'); // Deep Cognac
      root.style.setProperty('--border-subtle', '#DDD4BE'); // CS Border
    }
  }, [isFinancial]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    // Guard CRM workspace routes (Milestone 1 Session Lock)
    if (pathname !== '/login' && pathname !== '/forgot-password') {
      const token = resolveToken();
      if (!token) {
        router.replace('/login');
      }
    }

    return () => clearTimeout(timer);
  }, [pathname, router]);

  if (!mounted) {
    return null; // Avoid hydration flash
  }

  // Auth pages render outside of App shell chrome
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <PermissionProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <Sidebar
          collapsed={collapsed}
          hidden={hidden}
          onToggle={() => {
            setCollapsed((c) => !c);
            if (hidden) setHidden(false);
          }}
        />

        {/* Floating Sidebar Expand/Collapse Arrow */}
        {!hidden && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              position: 'absolute',
              left: collapsed ? 'calc(var(--sidebar-collapsed-width) - 12px)' : 'calc(var(--sidebar-width) - 12px)',
              top: '75px',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: isFinancial ? '#F6F2EE' : '#F6F1E8',
              border: `1px solid ${isFinancial ? '#DDD0C4' : '#DDD4BE'}`,
              color: isFinancial ? '#2A1628' : '#2C1A0E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 50,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'left 300ms cubic-bezier(0.4,0,0.2,1), background-color 150ms, color 150ms',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isFinancial ? '#EDE6DE' : '#EDE7D8';
              e.currentTarget.style.color = isFinancial ? '#E8760A' : '#B8892A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isFinancial ? '#F6F2EE' : '#F6F1E8';
              e.currentTarget.style.color = isFinancial ? '#2A1628' : '#2C1A0E';
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Right column: topbar + page content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <TopNavbar
            sidebarCollapsed={hidden}
            onToggleSidebar={() => {
              setHidden((h) => !h);
            }}
          />
          <main
            id="main-content"
            style={{
              flex: 1,
              padding: '1.75rem 2rem',
              overflowY: 'auto',
            }}
          >
            {children}
          </main>
        </div>
      </div>
      <AiChatbot />
    </PermissionProvider>
  );
}
