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
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        {/* Right column: topbar + page content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <TopNavbar />
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
