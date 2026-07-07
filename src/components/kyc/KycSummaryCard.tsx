'use client';

import { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/apiClient';

type KycRagStatus = 'RED' | 'AMBER' | 'GREEN';

interface KycSummaryCardProps {
  onOpenTab: () => void;
}

const RAG = {
  RED:   { dot: '#dc2626', bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', label: 'ACTION REQUIRED',    sub: 'One or more mandatory documents are Missing, Rejected, or expiring in < 30 days.' },
  AMBER: { dot: '#f59e0b', bg: '#fffbeb', border: '#fde047', color: '#ca8a04', label: 'EXPIRING SOON',       sub: 'All documents are Verified — one or more expires within 60 days.' },
  GREEN: { dot: '#22c55e', bg: '#f0fdf4', border: '#86efac', color: '#16a34a', label: 'FULLY COMPLIANT',     sub: 'All mandatory KYC documents are Verified and valid for more than 60 days.' },
};

interface DocRow {
  document_name: string;
  is_mandatory: boolean;
  upload_status: string;
  expires_at: string | null;
}

export default function KycSummaryCard({ onOpenTab }: KycSummaryCardProps) {
  const [status, setStatus] = useState<KycRagStatus | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await get<{ success: boolean; kyc_status: KycRagStatus; data: DocRow[] }>('/kyc/checklist');
      if (res?.success) {
        setStatus(res.kyc_status);
        setDocs(res.data);
      }
    } catch {
      /* silently fail if backend offline */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    // Re-fetch whenever a KYC update happens (from workspace tab)
    const handler = () => fetch();
    window.addEventListener('kyc-changed', handler);
    return () => window.removeEventListener('kyc-changed', handler);
  }, [fetch]);

  const counts = {
    Missing:  docs.filter(d => d.upload_status === 'Missing').length,
    Rejected: docs.filter(d => d.upload_status === 'Rejected').length,
    Uploaded: docs.filter(d => d.upload_status === 'Uploaded').length,
    Verified: docs.filter(d => d.upload_status === 'Verified').length,
  };

  // Next expiry date among Verified docs
  const nextExpiry = docs
    .filter(d => d.upload_status === 'Verified' && d.expires_at)
    .map(d => new Date(d.expires_at!))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const rag = status ? RAG[status] : null;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(42,22,40,0.08)',
      borderRadius: '16px',
      padding: '1.75rem',
      boxShadow: '0 10px 30px -10px rgba(42,22,40,0.06), 0 1px 3px rgba(42,22,40,0.02)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      transition: 'all 0.3s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A1628', fontFamily: 'Inter, sans-serif' }}>
          DNFBP KYC Compliance
        </h2>
        <span style={{ fontSize: '0.65rem', color: 'rgba(42,22,40,0.45)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {docs.length} Documents
        </span>
      </div>

      {/* RAG Status Banner */}
      {loading ? (
        <div style={{ padding: '1rem', background: '#F6F2EE', borderRadius: 8, fontSize: '0.8rem', color: 'rgba(42,22,40,0.5)' }}>
          Loading compliance data...
        </div>
      ) : rag && status ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: '1rem 1.25rem', borderRadius: 10,
          background: rag.bg, border: `1px solid ${rag.border}`,
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%', background: rag.dot, flexShrink: 0,
            boxShadow: `0 0 0 4px ${rag.dot}33`,
            animation: status !== 'GREEN' ? 'pulse 2s infinite' : 'none',
          }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: rag.color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {status} — {rag.label}
            </p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: rag.color, opacity: 0.85, lineHeight: 1.4 }}>
              {rag.sub}
            </p>
          </div>
        </div>
      ) : null}

      {/* Document Count Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {([
          { label: 'Missing',  val: counts.Missing,  color: '#dc2626', bg: '#fef2f2' },
          { label: 'Rejected', val: counts.Rejected, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Uploaded', val: counts.Uploaded, color: '#ca8a04', bg: '#fef9c3' },
          { label: 'Verified', val: counts.Verified, color: '#16a34a', bg: '#dcfce7' },
        ] as const).map(({ label, val, color, bg }) => (
          <div key={label} style={{ background: val > 0 ? bg : '#F6F2EE', borderRadius: 8, padding: '0.6rem 0.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: val > 0 ? color : 'rgba(42,22,40,0.4)' }}>{val}</p>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.6rem', fontWeight: 700, color: val > 0 ? color : 'rgba(42,22,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Next Expiry */}
      {nextExpiry && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#F6F2EE', borderRadius: 8 }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(42,22,40,0.6)', fontWeight: 600 }}>Next document expiry</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#E8760A' }}>
            {nextExpiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={onOpenTab}
        style={{
          width: '100%', padding: '0.7rem',
          background: '#2A1628', color: '#ffffff',
          border: 'none', borderRadius: 8,
          fontSize: '0.72rem', fontWeight: 700,
          cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase',
          transition: 'background 200ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#3d2040'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#2A1628'; }}
      >
        Open Full KYC Compliance Workspace →
      </button>
    </div>
  );
}
