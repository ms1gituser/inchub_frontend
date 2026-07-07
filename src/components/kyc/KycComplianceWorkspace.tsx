/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity, react-hooks/refs */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { get, put, post } from '@/lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadStatus = 'Missing' | 'Uploaded' | 'Verified' | 'Rejected';
type KycStatus = 'RED' | 'AMBER' | 'GREEN';

interface KycDocument {
  id: string;
  document_name: string;
  is_mandatory: boolean;
  upload_status: UploadStatus;
  file_path: string | null;
  expires_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  notes: string | null;
  updated_at: string;
}

interface EditState {
  upload_status: UploadStatus;
  expires_at: string;
  verified_by: string;
  notes: string;
}

// ─── Status Colors ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<UploadStatus, { bg: string; color: string; label: string }> = {
  Missing:  { bg: '#fee2e2', color: '#dc2626', label: 'Missing'  },
  Rejected: { bg: '#fff1f2', color: '#e11d48', label: 'Rejected' },
  Uploaded: { bg: '#eff6ff', color: '#2563eb', label: 'Uploaded (Pending Review)' },
  Verified: { bg: '#dcfce7', color: '#16a34a', label: 'Verified' },
};

const RAG_CONFIG: Record<KycStatus, { bg: string; border: string; color: string; dot: string; label: string; description: string }> = {
  RED:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', dot: '#dc2626', label: 'RED — ACTION REQUIRED',    description: 'One or more mandatory documents are Missing, Rejected, or expiring within 30 days.' },
  AMBER: { bg: '#fffbeb', border: '#fde047', color: '#ca8a04', dot: '#f59e0b', label: 'AMBER — ATTENTION NEEDED', description: 'All documents are Verified, but one or more expires within 60 days.' },
  GREEN: { bg: '#f0fdf4', border: '#86efac', color: '#16a34a', dot: '#22c55e', label: 'GREEN — COMPLIANT',        description: 'All mandatory documents are Verified and valid for more than 60 days.' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function KycComplianceWorkspace() {
  const currentTime = Date.now();
  const [docs, setDocs] = useState<KycDocument[]>([]);
  const [kycStatus, setKycStatus] = useState<KycStatus>('RED');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ upload_status: 'Missing', expires_at: '', verified_by: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<UploadStatus | 'ALL'>('ALL');

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await get<{ success: boolean; kyc_status: KycStatus; data: KycDocument[] }>('/kyc/checklist');
      if (res?.success) {
        setDocs(res.data);
        setKycStatus(res.kyc_status);
      }
    } catch (err) {
      console.error('[KycWorkspace] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchChecklist(); }, [fetchChecklist]);

  const startEdit = (doc: KycDocument) => {
    setEditingId(doc.id);
    setEditState({
      upload_status: doc.upload_status,
      expires_at: doc.expires_at ? doc.expires_at.split('T')[0] : '',
      verified_by: doc.verified_by ?? '',
      notes: doc.notes ?? '',
    });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const payload: Record<string, string | null> = {
        upload_status: editState.upload_status,
        expires_at: editState.expires_at || null,
        verified_by: editState.verified_by || null,
        notes: editState.notes || null,
      };
      const res = await put<{ success: boolean; kyc_status: KycStatus; data: KycDocument }>(`/kyc/checklist/${id}`, payload);
      if (res?.success) {
        setDocs((prev) => prev.map((d) => d.id === id ? res.data : d));
        setKycStatus(res.kyc_status);
        setEditingId(null);
        // Fire event so TopNavbar badge updates immediately
        window.dispatchEvent(new Event('kyc-changed'));
      }
    } catch (err) {
      console.error('[KycWorkspace] save error', err);
    } finally {
      setSaving(false);
    }
  };

  const resetAll = async () => {
    if (!window.confirm('Reset all KYC documents to defaults? This cannot be undone.')) return;
    try {
      const res = await post<{ success: boolean; kyc_status: KycStatus; data: KycDocument[] }>('/kyc/checklist/reset');
      if (res?.success) {
        setDocs(res.data);
        setKycStatus(res.kyc_status);
      }
    } catch (err) {
      console.error('[KycWorkspace] reset error', err);
    }
  };

  const filteredDocs = filterStatus === 'ALL' ? docs : docs.filter((d) => d.upload_status === filterStatus);
  const counts = {
    Missing:  docs.filter((d) => d.upload_status === 'Missing').length,
    Uploaded: docs.filter((d) => d.upload_status === 'Uploaded').length,
    Verified: docs.filter((d) => d.upload_status === 'Verified').length,
    Rejected: docs.filter((d) => d.upload_status === 'Rejected').length,
  };

  const rag = RAG_CONFIG[kycStatus];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ─── RAG Status Banner ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        background: rag.bg, border: `1px solid ${rag.border}`, borderRadius: 12, padding: '1rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: rag.dot, flexShrink: 0,
            boxShadow: `0 0 0 4px ${rag.dot}33` }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: rag.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              KYC Compliance Status
            </p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.875rem', fontWeight: 700, color: rag.color }}>
              {rag.label}
            </p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: rag.color, opacity: 0.8 }}>
              {rag.description}
            </p>
          </div>
        </div>
        <button onClick={resetAll} style={{
          height: 32, padding: '0 0.875rem', border: `1px solid ${rag.border}`, borderRadius: 6,
          background: 'white', color: rag.color, fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
        }}>RESET DEFAULTS</button>
      </div>

      {/* ─── Summary Metric Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {(['Missing', 'Rejected', 'Uploaded', 'Verified'] as UploadStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
              style={{
                background: filterStatus === s ? cfg.bg : '#ffffff',
                border: `1px solid ${filterStatus === s ? cfg.color : '#e5e7eb'}`,
                borderRadius: 10, padding: '1rem', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms',
              }}
            >
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: cfg.color }}>{counts[s]}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', fontWeight: 700, color: cfg.color }}>{s}</p>
            </button>
          );
        })}
      </div>

      {/* ─── Document Checklist Table ──────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
            Compliance Documents
            {filterStatus !== 'ALL' && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>· Filtered by: {filterStatus}</span>}
          </p>
          {filterStatus !== 'ALL' && (
            <button onClick={() => setFilterStatus('ALL')} style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer' }}>
              Clear filter ✕
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
            Loading KYC compliance data...
          </div>
        ) : (
          <div>
            {filteredDocs.map((doc) => {
              const cfg = STATUS_CONFIG[doc.upload_status];
              const isEditing = editingId === doc.id;
              const daysUntilExpiry = doc.expires_at
                ? Math.ceil((new Date(doc.expires_at).getTime() - currentTime) / 86400000)
                : null;

              return (
                <div
                  key={doc.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6', padding: '1rem 1.5rem',
                    background: isEditing ? '#f9fafb' : '#ffffff', transition: 'background 150ms',
                  }}
                >
                  {/* Document Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Mandatory indicator */}
                    <div style={{ width: 4, height: 36, borderRadius: 2, background: doc.is_mandatory ? '#ef4444' : '#d1d5db', flexShrink: 0 }} />

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{doc.document_name}</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#9ca3af' }}>
                        {doc.is_mandatory ? '★ Mandatory' : '○ Optional'}
                        {doc.verified_at && ` · Verified ${new Date(doc.verified_at).toLocaleDateString()}`}
                        {doc.verified_by && ` by ${doc.verified_by}`}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                      {cfg.label}
                    </span>

                    {/* Expiry */}
                    {doc.expires_at ? (
                      <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                        background: daysUntilExpiry !== null && daysUntilExpiry <= 30 ? '#fee2e2' : daysUntilExpiry !== null && daysUntilExpiry <= 60 ? '#fef9c3' : '#f1f5f9',
                        color: daysUntilExpiry !== null && daysUntilExpiry <= 30 ? '#dc2626' : daysUntilExpiry !== null && daysUntilExpiry <= 60 ? '#ca8a04' : '#6b7280',
                      }}>
                        {daysUntilExpiry !== null && daysUntilExpiry < 0
                          ? `Expired ${Math.abs(daysUntilExpiry)}d ago`
                          : `Expires ${new Date(doc.expires_at).toLocaleDateString()}`}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#d1d5db', flexShrink: 0 }}>No expiry</span>
                    )}

                    {/* Edit button */}
                    {!isEditing ? (
                      <button onClick={() => startEdit(doc)} style={{
                        height: 30, padding: '0 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6,
                        background: '#ffffff', color: '#374151', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      }}>Edit</button>
                    ) : (
                      <button onClick={() => setEditingId(null)} style={{
                        height: 30, padding: '0 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6,
                        background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                      }}>Cancel</button>
                    )}
                  </div>

                  {/* Edit Inline Form */}
                  {isEditing && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>STATUS</label>
                          <select
                            value={editState.upload_status}
                            onChange={(e) => setEditState((s) => ({ ...s, upload_status: e.target.value as UploadStatus }))}
                            style={{ width: '100%', height: 36, padding: '0 0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8rem', background: '#fff' }}
                          >
                            {(['Missing', 'Uploaded', 'Verified', 'Rejected'] as UploadStatus[]).map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>EXPIRY DATE</label>
                          <input
                            type="date"
                            value={editState.expires_at}
                            onChange={(e) => setEditState((s) => ({ ...s, expires_at: e.target.value }))}
                            style={{ width: '100%', height: 36, padding: '0 0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>VERIFIED BY</label>
                          <input
                            type="text"
                            placeholder="Name or email"
                            value={editState.verified_by}
                            onChange={(e) => setEditState((s) => ({ ...s, verified_by: e.target.value }))}
                            style={{ width: '100%', height: 36, padding: '0 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>NOTES</label>
                        <input
                          type="text"
                          placeholder="Optional internal notes"
                          value={editState.notes}
                          onChange={(e) => setEditState((s) => ({ ...s, notes: e.target.value }))}
                          style={{ width: '100%', height: 36, padding: '0 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => saveEdit(doc.id)}
                          disabled={saving}
                          style={{
                            height: 36, padding: '0 1.25rem', background: '#111827', color: '#ffffff',
                            border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                            opacity: saving ? 0.6 : 1,
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Hard Gate Notice ─────────────────────────────────────────────────── */}
      {kycStatus === 'RED' && (
        <div style={{
          padding: '1rem 1.5rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
          fontSize: '0.8rem', color: '#991b1b', fontWeight: 500, lineHeight: 1.6
        }}>
          <strong>⚠ Accounting Period Gate Active:</strong> New monthly accounting periods cannot be opened while KYC status is RED. Please resolve all mandatory document issues above to unblock the accounting workflow.
        </div>
      )}
    </div>
  );
}
