'use client';

import React from 'react';

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: 'alert', title: 'KYC Document Expiring', message: 'Your Passport copy on file is expiring in 15 days. Please upload a new copy to avoid service interruption.', time: '2 hours ago', read: false },
    { id: 2, type: 'info', title: 'Project Status Updated', message: 'Your "Trade License" project has moved to the next stage: "Awaiting Final Approval".', time: '1 day ago', read: false },
    { id: 3, type: 'success', title: 'Payment Received', message: 'We have received your payment of AED 15,000 for Invoice #INV-2026-004.', time: '3 days ago', read: true },
    { id: 4, type: 'info', title: 'New Document Uploaded', message: 'The admin team has uploaded "Draft Memorandum of Association" for your review.', time: '1 week ago', read: true },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
            All Notifications
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(0,0,0,0.6)', fontSize: '0.9375rem' }}>View your recent alerts and updates.</p>
        </div>
        <button style={{ 
          background: 'transparent', border: 'none', color: 'var(--color-accent)', 
          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' 
        }}>
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ 
            background: n.read ? '#ffffff' : 'var(--bg-page)', 
            border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--color-accent)'}`, 
            borderRadius: '8px', padding: '1.5rem', display: 'flex', gap: '1.25rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: n.type === 'alert' ? 'rgba(239, 68, 68, 0.1)' : n.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(184, 137, 42, 0.1)',
              color: n.type === 'alert' ? '#ef4444' : n.type === 'success' ? '#10b981' : 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {n.type === 'alert' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}
              {n.type === 'success' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
              {n.type === 'info' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{n.title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>{n.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5 }}>{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
