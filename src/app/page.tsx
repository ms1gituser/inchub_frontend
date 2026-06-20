import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/* ── Stat card data ───────────────────────────────────────────────────────── */
const STATS = [
  {
    id: 'total-contacts',
    label: 'Total Contacts',
    value: '2,847',
    change: '+12.5%',
    up: true,
    color: '#B8892A',
    bg: '#F6F1E8',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'open-leads',
    label: 'Open Leads',
    value: '148',
    change: '+4.3%',
    up: true,
    color: '#2C1A0E',
    bg: '#EDE7D8',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
  {
    id: 'deals-won',
    label: 'Deals Won',
    value: '₹18.4L',
    change: '+22.1%',
    up: true,
    color: '#E8760A',
    bg: '#F6F2EE',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    id: 'overdue-tasks',
    label: 'Overdue Tasks',
    value: '7',
    change: '-2 today',
    up: false,
    color: '#ef4444',
    bg: '#fef2f2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

/* ── Pipeline stages ──────────────────────────────────────────────────────── */
const PIPELINE = [
  { stage: 'Prospecting',  count: 32, value: '₹4.2L',  pct: 85, color: '#2C1A0E' },
  { stage: 'Qualifying',   count: 18, value: '₹6.8L',  pct: 65, color: '#E8760A' },
  { stage: 'Proposal',     count: 11, value: '₹9.1L',  pct: 45, color: '#B8892A' },
  { stage: 'Negotiation',  count: 6,  value: '₹12.5L', pct: 28, color: '#2A1628' },
  { stage: 'Closing',      count: 3,  value: '₹18.4L', pct: 12, color: '#C9A040' },
];

/* ── Recent activity ──────────────────────────────────────────────────────── */
const ACTIVITY = [
  { id: 1, actor: 'Ravi Mehta',    action: 'created a new lead',    target: 'TechSoft India',        time: '5m ago',  dot: '#2C1A0E', initials: 'RM' },
  { id: 2, actor: 'Priya Sharma',  action: 'moved deal to',         target: 'Negotiation stage',     time: '22m ago', dot: '#E8760A', initials: 'PS' },
  { id: 3, actor: 'Amit Desai',    action: 'completed task',        target: 'Demo call with Acme',   time: '1h ago',  dot: '#B8892A', initials: 'AD' },
  { id: 4, actor: 'Neha Kapoor',   action: 'added contact',         target: 'Suresh Nair at Zeon',   time: '2h ago',  dot: '#E8760A', initials: 'NK' },
  { id: 5, actor: 'Ravi Mehta',    action: 'sent proposal to',      target: 'Bharat Dynamics',       time: '3h ago',  dot: '#2C1A0E', initials: 'RM' },
  { id: 6, actor: 'Kiran Rao',     action: 'won deal with',         target: 'Sunrise Exports',       time: '5h ago',  dot: '#B8892A', initials: 'KR' },
];

/* ── Upcoming tasks ───────────────────────────────────────────────────────── */
const TASKS = [
  { id: 1, title: 'Follow-up call with TechSoft',   due: 'Today, 3:00 PM',  priority: 'high'   },
  { id: 2, title: 'Send revised proposal to Acme',   due: 'Today, 5:00 PM',  priority: 'high'   },
  { id: 3, title: 'Update Q2 sales forecast',        due: 'Tomorrow, 10 AM', priority: 'medium' },
  { id: 4, title: 'Onboarding call — Sunrise Exp.',  due: 'Thu, 2:00 PM',    priority: 'low'    },
];

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#C4695A',
  medium: '#E8760A',
  low:    '#B8892A',
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(44,26,14,0.5)', fontWeight: 500 }}>Monday, 16 June 2026</p>
          <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#2C1A0E', letterSpacing: '-0.02em' }}>
            Good morning, Mahesh
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            style={{
              height: 36, padding: '0 2rem 0 0.875rem',
              border: '1px solid #e2e8f0', borderRadius: 8,
              background: '#ffffff', fontSize: '0.8125rem', color: '#334155',
              cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.625rem center',
              outline: 'none',
            }}
            defaultValue="this_month"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {STATS.map((s) => (
          <div
            key={s.id}
            id={s.id}
            style={{
              background: '#ffffff',
              border: '1px solid #DDD4BE',
              borderRadius: 12,
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 200ms, transform 200ms',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: s.bg, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {s.icon}
              </div>
              <span
                style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                  borderRadius: 6,
                  background: s.up ? 'rgba(184,137,42,0.12)' : 'rgba(196,105,90,0.1)',
                  color: s.up ? '#B8892A' : '#C4695A',
                }}
              >
                {s.change}
              </span>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#2C1A0E', letterSpacing: '-0.03em' }}>{s.value}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle row: Pipeline + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem' }}>

        {/* Pipeline */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2C1A0E' }}>Sales Pipeline</h2>
            <span style={{ fontSize: '0.75rem', color: '#B8892A', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PIPELINE.map((p) => (
              <div key={p.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4A2E1A' }}>{p.stage}</span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.count} deals</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2C1A0E' }}>{p.value}</span>
                  </div>
                </div>
                <div style={{ height: 7, background: '#EDE7D8', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 9999, transition: 'width 600ms ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2C1A0E' }}>Recent Activity</h2>
            <span style={{ fontSize: '0.75rem', color: '#B8892A', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ACTIVITY.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  paddingBottom: i < ACTIVITY.length - 1 ? '0.875rem' : 0,
                  marginBottom: i < ACTIVITY.length - 1 ? '0.875rem' : 0,
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid #f8fafc' : 'none',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${a.dot}1a`, color: a.dot,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.625rem', fontWeight: 800,
                  }}
                >
                  {a.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#4A2E1A', lineHeight: 1.45 }}>
                    <strong style={{ color: '#2C1A0E', fontWeight: 600 }}>{a.actor}</strong>
                    {' '}{a.action}{' '}
                    <span style={{ color: a.dot, fontWeight: 600 }}>{a.target}</span>
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.7125rem', color: '#94a3b8' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Tasks ── */}
      <div style={{ background: '#ffffff', border: '1px solid #DDD4BE', borderRadius: 12, padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2C1A0E' }}>Upcoming Tasks</h2>
          <span style={{ fontSize: '0.75rem', color: '#B8892A', fontWeight: 600, cursor: 'pointer' }}>View all tasks →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
          {TASKS.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: '#F6F1E8', borderRadius: 10,
                border: '1px solid #DDD4BE',
                transition: 'border-color 150ms',
              }}
            >
              <input
                type="checkbox"
                id={`task-${t.id}`}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: '#B8892A', cursor: 'pointer', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <label htmlFor={`task-${t.id}`} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2C1A0E', cursor: 'pointer' }}>
                  {t.title}
                </label>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'rgba(44,26,14,0.5)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 7, height: 7, borderRadius: '50%',
                      background: PRIORITY_COLOR[t.priority],
                      marginRight: 5, verticalAlign: 'middle',
                    }}
                  />
                  {t.due}
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                  borderRadius: 6, textTransform: 'capitalize',
                  background: `${PRIORITY_COLOR[t.priority]}18`,
                  color: PRIORITY_COLOR[t.priority],
                  flexShrink: 0,
                }}
              >
                {t.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
