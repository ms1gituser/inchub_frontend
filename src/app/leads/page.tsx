'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/context/PermissionContext';
import { get, post, put } from '@/lib/apiClient';

interface Lead {
  id: string;
  name: string;
  email: string;
  stage: string;
  value: string;
  created_at: string;
}

export default function LeadsPage() {
  const { currentBrand } = usePermission();
  const isFinancial = currentBrand === 'financial';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', stage: 'Lead Intake', value: '' });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await get<{ success: boolean; data: Lead[] }>('/leads');
      if (res.success) {
        setLeads(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await post('/leads', formData);
      setFormData({ name: '', email: '', stage: 'Lead Intake', value: '' });
      fetchLeads();
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleUpdateStage = async (id: string, newStage: string) => {
    try {
      await put(`/leads/${id}/stage`, { stage: newStage });
      fetchLeads();
    } catch (error) {
      console.error('Failed to update lead stage:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: 'var(--color-primary)' }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', fontWeight: 600, letterSpacing: '0.2em', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
          Customer Relationship Management • {isFinancial ? 'Financial Services' : 'Corporate Services'}
        </p>
        <h1 style={{ margin: '0.35rem 0 0', fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.02em', fontFamily: 'var(--font-serif)' }}>
          Leads <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-accent)' }}>Pipeline (Live Beta)</span>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Create Lead Form */}
        <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Lead</h2>
          <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" placeholder="Client Name" required 
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc' }} 
            />
            <input 
              type="email" placeholder="Email Address" required 
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc' }} 
            />
            <input 
              type="number" placeholder="Estimated Value (AED)" 
              value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc' }} 
            />
            <select 
              value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: 6, border: '1px solid #ccc' }}
            >
              <option value="Lead Intake">Lead Intake</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Closed Won">Closed Won</option>
            </select>
            <button type="submit" style={{ padding: '0.75rem', borderRadius: 6, border: 'none', background: 'var(--color-accent)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              Create Lead
            </button>
          </form>
        </div>

        {/* Lead List */}
        <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Leads</h2>
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leads.length === 0 ? <p>No leads found in database.</p> : leads.map(lead => (
                <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{lead.name}</h3>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#666' }}>{lead.email} • AED {lead.value}</p>
                  </div>
                  <div>
                    <select 
                      value={lead.stage} onChange={e => handleUpdateStage(lead.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
                    >
                      <option value="Lead Intake">Lead Intake</option>
                      <option value="Qualification">Qualification</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Closed Won">Closed Won</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
