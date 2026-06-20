'use client';

import React from 'react';
import { usePermission } from '@/context/PermissionContext';

interface PermissionGuardProps {
  permission: string;
  mode?: 'hide' | 'lock';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard secures frontend components dynamically.
 * Under "hide" mode, it prevents the component from rendering entirely.
 * Under "lock" mode, it renders the component disabled, grayscaled, and overlays a 🔒 padlock badge.
 */
export default function PermissionGuard({
  permission,
  mode = 'hide',
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = usePermission();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const allowed = hasPermission(permission);

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return <>{fallback}</>;
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        cursor: 'not-allowed',
      }}
      title={`Requires permission: ${permission}`}
    >
      {/* Visual lock filter */}
      <div
        style={{
          opacity: 0.4,
          pointerEvents: 'none',
          filter: 'grayscale(1) blur(0.5px)',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Dynamic 🔒 Padlock Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#2C1A0E',
          color: '#F6F1E8',
          padding: '0.3rem 0.6rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.6875rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(44,26,14,0.35)',
          border: '1px solid rgba(184,137,42,0.2)',
          zIndex: 10,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B8892A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span style={{ color: '#F6F1E8' }}>Locked</span>
      </div>
    </div>
  );
}
