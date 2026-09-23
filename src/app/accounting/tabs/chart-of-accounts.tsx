import React, { useState, useEffect, useCallback } from 'react';
import { get, post, put, del } from '@/lib/apiClient';
import { useNotification } from '@/context/NotificationContext';

export interface COAAccount {
    id: string;
    account_code: string;
    account_name: string;
    account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    parent_account_id: string | null;
    normal_balance: 'DEBIT' | 'CREDIT';
    is_active: boolean;
    vat_applicable: boolean;
    children?: COAAccount[];
}

export default function ChartOfAccountsTab() {
  const { showToast, showConfirm } = useNotification();
  const [accounts, setAccounts] = useState<COAAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<COAAccount>>({
      account_code: '',
      account_name: '',
      account_type: 'ASSET',
      parent_account_id: null,
      normal_balance: 'DEBIT',
      is_active: true,
      vat_applicable: false
  });

  const fetchAccounts = useCallback(async () => {
      setLoading(true);
      try {
          const res = await get<{success: boolean, data: COAAccount[]}>('/chart-of-accounts');
          if (res?.success) {
              setAccounts(res.data);
              // Auto-expand top level nodes
              const initialExpanded: Record<string, boolean> = {};
              res.data.filter(a => !a.parent_account_id).forEach(a => initialExpanded[a.id] = true);
              setExpandedNodes(initialExpanded);
          }
      } catch (err: any) {
          showToast(err.message || 'Failed to load chart of accounts', 'error');
      } finally {
          setLoading(false);
      }
  }, [showToast]);

  useEffect(() => {
      fetchAccounts();
  }, [fetchAccounts]);

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      const payload = { ...formData, parent_account_id: formData.parent_account_id || null };
      try {
          if (editingId) {
              const res = await put<{success: boolean, data: COAAccount}>(`/chart-of-accounts/${editingId}`, payload);
              if (res?.success) {
                  showToast('Account updated successfully', 'success');
              }
          } else {
              const res = await post<{success: boolean, data: COAAccount}>('/chart-of-accounts', payload);
              if (res?.success) {
                  showToast('Account created successfully', 'success');
              }
          }
          setIsModalOpen(false);
          fetchAccounts();
      } catch (err: any) {
          showToast(err.message || 'Failed to save account', 'error');
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeactivate = (id: string) => {
      showConfirm('Are you sure you want to deactivate this account? Sub-accounts will not be deactivated.', async () => {
          try {
              const res = await del<{success: boolean}>(`/chart-of-accounts/${id}`);
              if (res?.success) {
                  showToast('Account deactivated successfully', 'success');
                  fetchAccounts();
              }
          } catch (err: any) {
              showToast(err.message || 'Failed to deactivate account', 'error');
          }
      }, 'Deactivate Account');
  };

  const toggleExpand = (id: string) => {
      setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAccounts = accounts.filter(acc => {
      if (filterType !== 'ALL' && acc.account_type !== filterType) return false;
      if (search && !acc.account_name.toLowerCase().includes(search.toLowerCase()) && !acc.account_code.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
  });

  // Build Tree
  const buildTree = (allAccs: COAAccount[]) => {
      const map = new Map<string, COAAccount & { children: any[] }>();
      allAccs.forEach(acc => map.set(acc.id, { ...acc, children: [] }));
      const roots: any[] = [];
      
      map.forEach(acc => {
          if (acc.parent_account_id && map.has(acc.parent_account_id)) {
              map.get(acc.parent_account_id)!.children.push(acc);
          } else {
              roots.push(acc);
          }
      });
      return roots.sort((a, b) => a.account_code.localeCompare(b.account_code));
  };

  const tree = buildTree(filteredAccounts);

  const renderNode = (node: any, level: number = 0) => {
      const hasChildren = node.children.length > 0;
      const isExpanded = !!expandedNodes[node.id];
      const indent = level * 24;

      return (
          <React.Fragment key={node.id}>
              <tr style={{ borderBottom: '1px solid #F5F0EB', background: level === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#2A1628', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: `${indent + 20}px` }}>
                      {hasChildren ? (
                          <button onClick={() => toggleExpand(node.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(42,22,40,0.5)' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                  <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                          </button>
                      ) : <span style={{ width: 16 }} />}
                      {node.account_code}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#2A1628' }}>
                      {node.account_name}
                      {node.vat_applicable && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: 'rgba(232,118,10,0.1)', color: '#E8760A', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>VAT</span>}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: 'rgba(42,22,40,0.7)' }}>{node.account_type}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: node.is_active ? '#10b981' : '#ef4444', background: node.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          {node.is_active ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => { setEditingId(node.id); setFormData(node); setIsModalOpen(true); }}
                        style={{ background: 'transparent', border: 'none', color: '#E8760A', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                      {node.is_active && (
                          <button 
                            onClick={() => handleDeactivate(node.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Deactivate</button>
                      )}
                  </td>
              </tr>
              {isExpanded && hasChildren && node.children.sort((a: any, b: any) => a.account_code.localeCompare(b.account_code)).map((child: any) => renderNode(child, level + 1))}
          </React.Fragment>
      );
  };

  return (
    <div style={{ fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600, color: '#2A1628' }}>Chart of Accounts</h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(42,22,40,0.6)' }}>Manage your master general ledger accounts.</p>
        </div>
        <button 
          onClick={() => {
              setEditingId(null);
              setFormData({ account_code: '', account_name: '', account_type: 'ASSET', parent_account_id: null, normal_balance: 'DEBIT', is_active: true, vat_applicable: false });
              setIsModalOpen(true);
          }}
          style={{ background: '#E8760A', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Account
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by code or name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.625rem 1rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.875rem', flex: 1, outline: 'none' }}
        />
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.625rem 1rem', border: '1px solid #DDD0C4', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff' }}
        >
          <option value="ALL">All Types</option>
          <option value="ASSET">Assets</option>
          <option value="LIABILITY">Liabilities</option>
          <option value="EQUITY">Equity</option>
          <option value="REVENUE">Revenue</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(42,22,40,0.5)' }}>Loading chart of accounts...</div>
      ) : (
          <div style={{ background: '#ffffff', border: '1px solid #DDD0C4', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FAF8F5', borderBottom: '1px solid #DDD0C4' }}>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Code</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(42,22,40,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tree.map(node => renderNode(node))}
                {tree.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'rgba(42,22,40,0.5)' }}>No accounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      )}

      {/* Modal */}
      {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,22,40,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ background: '#fff', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '2rem', boxShadow: '0 24px 64px rgba(42,22,40,0.2)' }}>
                  <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Edit Account' : 'Create New Account'}</h3>
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Code</label>
                              <input required type="text" value={formData.account_code} onChange={e => setFormData({...formData, account_code: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none' }} />
                          </div>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Account Name</label>
                              <input required type="text" value={formData.account_name} onChange={e => setFormData({...formData, account_name: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none' }} />
                          </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Account Type</label>
                              <select value={formData.account_type} onChange={e => setFormData({...formData, account_type: e.target.value as any})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none', background: '#fff' }}>
                                  <option value="ASSET">Asset</option>
                                  <option value="LIABILITY">Liability</option>
                                  <option value="EQUITY">Equity</option>
                                  <option value="REVENUE">Revenue</option>
                                  <option value="EXPENSE">Expense</option>
                              </select>
                          </div>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Parent Account</label>
                              <select value={formData.parent_account_id || ''} onChange={e => setFormData({...formData, parent_account_id: e.target.value || null})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none', background: '#fff' }}>
                                  <option value="">(None)</option>
                                  {accounts.filter(a => a.id !== editingId && a.account_type === formData.account_type).map(a => (
                                      <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Normal Balance</label>
                              <select value={formData.normal_balance} onChange={e => setFormData({...formData, normal_balance: e.target.value as any})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none', background: '#fff' }}>
                                  <option value="DEBIT">Debit</option>
                                  <option value="CREDIT">Credit</option>
                              </select>
                          </div>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>VAT Applicable?</label>
                              <select value={formData.vat_applicable ? 'true' : 'false'} onChange={e => setFormData({...formData, vat_applicable: e.target.value === 'true'})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none', background: '#fff' }}>
                                  <option value="false">No</option>
                                  <option value="true">Yes</option>
                              </select>
                          </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Is Active?</label>
                              <select value={formData.is_active ? 'true' : 'false'} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #DDD0C4', borderRadius: '8px', outline: 'none', background: '#fff' }}>
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                              </select>
                          </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid #DDD0C4', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} disabled={isSaving}>Cancel</button>
                          <button type="submit" style={{ background: '#E8760A', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} disabled={isSaving}>
                              {isSaving ? 'Saving...' : (editingId ? 'Update Account' : 'Create Account')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
