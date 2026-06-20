'use client';

import Link from 'next/link';
import { usePermission } from '@/context/PermissionContext';
import PermissionGuard from '@/components/ui/PermissionGuard';

export default function SettingsDashboard() {
  const { role, permissions, allAvailablePermissions, togglePermission, setAllPermissions, setRole } = usePermission();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>System Management</p>
        <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#2C1A0E', letterSpacing: '-0.02em' }}>
          Control Panel
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Dynamic Forms */}
        <Link
          href="/settings/forms"
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#B8892A';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(184,137,42,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F6F1E8', color: '#B8892A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2C1A0E' }}>Dynamic Forms Playground</h2>
              <span style={{ fontSize: '0.75rem', color: 'rgba(44,26,14,0.5)' }}>Zero-Developer UI</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A2E1A', lineHeight: 1.5 }}>
            Modify form schemas and add fields in real-time. Render text fields, textareas, selectors, and checkboxes dynamically from JSON definitions.
          </p>
          <span style={{ fontSize: '0.8125rem', color: '#B8892A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
            Launch Playground →
          </span>
        </Link>

        {/* Card 2: Pipelines */}
        <Link
          href="/settings/pipelines"
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#B8892A';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(184,137,42,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EDE7D8', color: '#6B3F22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2C1A0E' }}>Sales Pipelines</h2>
              <span style={{ fontSize: '0.75rem', color: 'rgba(44,26,14,0.5)' }}>Fractional Ordering Editor</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A2E1A', lineHeight: 1.5 }}>
            Configure and order deal stages using fractional midpoints (e.g. Stage 1.5 = 1500). Insert, reorder, or remove stages without database disruption.
          </p>
          <span style={{ fontSize: '0.8125rem', color: '#B8892A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
            Configure Stages →
          </span>
        </Link>
      </div>

      {/* RBAC Quick Config Panel */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2C1A0E' }}>Dynamic RBAC Permissions Console</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'rgba(44,26,14,0.5)' }}>
              Toggle permissions on/off to instantly test components protected by `PermissionGuard`.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setAllPermissions(true)}
              style={{
                height: 30, padding: '0 0.75rem', borderRadius: 6, border: '1px solid #B8892A',
                background: '#F6F1E8', color: '#B8892A', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Grant All
            </button>
            <button
              onClick={() => setAllPermissions(false)}
              style={{
                height: 30, padding: '0 0.75rem', borderRadius: 6, border: '1px solid #DDD4BE',
                background: '#EDE7D8', color: '#4A2E1A', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Revoke All
            </button>
          </div>
        </div>

        {/* Predefined Role Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            padding: '0.75rem 1rem',
            background: '#F6F1E8',
            borderRadius: 8,
            border: '1px solid #DDD4BE',
          }}
        >
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2C1A0E' }}>
            Predefined User Role:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {([
              { key: 'admin', label: 'Admin (Full Access)' },
              { key: 'accountant', label: 'Accountant' },
              { key: 'sales', label: 'Sales Agent' },
              { key: 'client', label: 'External Client' },
            ] as const).map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  style={{
                    height: 28,
                    padding: '0 0.75rem',
                    borderRadius: 14,
                    border: active ? '1px solid #B8892A' : '1px solid #DDD4BE',
                    background: active ? '#B8892A' : '#F6F1E8',
                    color: active ? '#ffffff' : '#4A2E1A',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Permission pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {allAvailablePermissions.map((perm) => {
            const has = permissions.includes(perm);
            return (
              <button
                key={perm}
                onClick={() => togglePermission(perm)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: 20,
                  border: has ? '1px solid #DDD4BE' : '1px solid #DDD4BE',
                  background: has ? '#F6F1E8' : 'rgba(44,26,14,0.03)',
                  color: has ? '#B8892A' : 'rgba(44,26,14,0.35)',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: has ? '#B8892A' : 'rgba(44,26,14,0.2)'
                  }}
                />
                {perm}
              </button>
            );
          })}
        </div>

        {/* Dynamic guard sandbox demo */}
        <div style={{ background: '#F6F1E8', border: '1px solid #DDD4BE', borderRadius: 8, padding: '1rem' }}>
          <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(44,26,14,0.5)' }}>
            RBAC Live Component Sandbox
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            
            {/* Guard item 1 */}
            <div>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>
                Contacts Delete Button (Requires `contacts:delete`)
              </p>
              <PermissionGuard permission="contacts:delete" mode="lock">
                <button
                  style={{
                    width: '100%', height: 36,
                    background: 'linear-gradient(135deg, #8B2E2E 0%, #6B1C1C 100%)',
                    color: '#ffffff',
                    border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(139,46,46,0.25)',
                  }}
                >
                  Delete Selected Leads
                </button>
              </PermissionGuard>
            </div>

            {/* Guard item 2 */}
            <div>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>
                Configure Pipelines (Requires `pipelines:configure`)
              </p>
              <PermissionGuard permission="pipelines:configure" mode="lock">
                <button
                  style={{
                    width: '100%', height: 36,
                    background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2E1A 100%)',
                    color: '#F6F1E8',
                    border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(44,26,14,0.2)',
                  }}
                >
                  Adjust Database Config
                </button>
              </PermissionGuard>
            </div>

            {/* Guard item 3 */}
            <div>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>
                Create Lead (Requires `leads:create` - Hide mode)
              </p>
              <PermissionGuard permission="leads:create" mode="hide" fallback={
                <div style={{ border: '1px dashed #DDD4BE', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: '0.75rem', color: 'rgba(44,26,14,0.35)' }}>
                  🔒 Hidden (No permissions)
                </div>
              }>
                <button
                  style={{
                    width: '100%', height: 36,
                    background: 'linear-gradient(135deg, #B8892A 0%, #8A6520 100%)',
                    color: '#ffffff',
                    border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(184,137,42,0.25)',
                  }}
                >
                  Add Custom Lead Form
                </button>
              </PermissionGuard>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
