'use client';

import React, { useState } from 'react';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('Inbox');

  const messages = [
    { id: 1, sender: 'Sarah (Account Manager)', subject: 'Welcome to IncHub!', preview: 'Hi there! I am your dedicated account manager. Please let me know if you need anything...', time: '1 week ago', unread: false },
    { id: 2, sender: 'Support Team', subject: 'Your Trade License is ready', preview: 'We have attached the digital copy of your newly issued trade license...', time: '3 days ago', unread: true },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 300, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
            Messages
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(0,0,0,0.6)', fontSize: '0.9375rem' }}>Communicate securely with your IncHub team.</p>
        </div>
        <button style={{ 
          background: 'var(--color-accent)', color: '#ffffff', border: 'none', 
          padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          New Message
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        
        {/* Sidebar */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', padding: '0.25rem' }}>
              {['Inbox', 'Sent', 'Archived'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    flex: 1, padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer',
                    background: activeTab === tab ? '#ffffff' : 'transparent',
                    color: activeTab === tab ? 'var(--color-primary)' : 'rgba(0,0,0,0.6)',
                    fontWeight: activeTab === tab ? 600 : 500, fontSize: '0.8125rem',
                    boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeTab === 'Inbox' ? messages.map(msg => (
              <div key={msg.id} style={{ 
                padding: '1rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer',
                background: msg.unread ? '#ffffff' : 'transparent',
                borderLeft: msg.unread ? '3px solid var(--color-accent)' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: msg.unread ? 700 : 600, fontSize: '0.875rem', color: 'var(--color-primary)' }}>{msg.sender}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(0,0,0,0.5)' }}>{msg.time}</span>
                </div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: msg.unread ? 600 : 500, color: 'var(--color-primary)' }}>{msg.subject}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.preview}</p>
              </div>
            )) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'rgba(0,0,0,0.5)', fontSize: '0.875rem' }}>
                No messages in {activeTab}.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area (Empty State) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', marginBottom: '1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>Select a message to read</h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(0,0,0,0.5)' }}>Click on a message from the sidebar to view the full conversation, or start a new one.</p>
        </div>

      </div>
    </div>
  );
}
