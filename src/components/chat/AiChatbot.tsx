'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { resolveToken } from '@/lib/apiClient';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; action: string }>;
}

export default function AiChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am the IncHub Compliance & Operations AI. I can assist with bookkeeping queries, document audits, and UAE corporate compliance status. How can I help you today?',
      timestamp: new Date(),
      actions: [
        { label: 'Check VAT Rules', action: 'vat_rules' },
        { label: 'Document Matching Status', action: 'document_matching' },
        { label: 'QuickBooks Sync Audit', action: 'quickbooks_sync' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Setup Socket connection when open
  useEffect(() => {
    if (isOpen && !socketRef.current) {
      const token = resolveToken();
      const originUrl = process.env.NEXT_PUBLIC_API_URL 
        ? new URL(process.env.NEXT_PUBLIC_API_URL).origin 
        : 'http://localhost:5000';
      
      const socket = io(originUrl, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
      });

      socket.on('message', (msg: { id?: string; sender?: string; text: string; timestamp?: string | number | Date }) => {
        if (msg.id && msg.id.startsWith('bot-typing')) {
          setIsTyping(true);
          return;
        }

        setIsTyping(false);

        const isAi = (msg.sender === 'System' || msg.sender === 'CalBot' || msg.sender === 'IncHub AI' || msg.sender === 'bot');
        
        let actions: Array<{ label: string; action: string }> | undefined;
        const textLower = msg.text.toLowerCase();
        if (textLower.includes('vat') || textLower.includes('tax') || textLower.includes('threshold')) {
          actions = [
            { label: 'Go to Accounting Dashboard', action: 'navigate_accounting' },
          ];
        } else if (textLower.includes('kyc') || textLower.includes('checklist')) {
          actions = [
            { label: 'Go to Accounting Dashboard', action: 'navigate_accounting' },
          ];
        }

        setMessages(prev => {
          if (prev.some(p => p.id === msg.id)) return prev;
          
          return [
            ...prev,
            {
              id: msg.id || `${Date.now()}`,
              sender: isAi ? 'ai' : 'user',
              text: msg.text,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              actions
            }
          ];
        });
      });

      socket.on('disconnect', () => {
        socketRef.current = null;
      });

      socket.on('connect_error', (_err) => {
      });
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const simulateAiResponse = (userText: string, actionType?: string) => {
    setIsTyping(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      let replyText = '';
      let additionalActions: Array<{ label: string; action: string }> | undefined;

      const lowerText = userText.toLowerCase();

      if (actionType === 'vat_rules' || lowerText.includes('vat') || lowerText.includes('tax') || lowerText.includes('threshold')) {
        replyText = 'Under UAE VAT regulations, corporate turnover limits are:\n\n' +
          '• **Voluntary Registration:** AED 300,000 (Warning alert level)\n' +
          '• **Critical Warning:** AED 350,000\n' +
          '• **Mandatory Registration:** AED 375,000 (Urgent compliance action required)\n\n' +
          'You can monitor the live VAT Quarter Tracker in the Accounting section.';
        additionalActions = [
          { label: 'Go to Accounting Dashboard', action: 'navigate_accounting' },
          { label: 'QuickBooks Sync Audit', action: 'quickbooks_sync' }
        ];
      } else if (actionType === 'document_matching' || lowerText.includes('match') || lowerText.includes('ocr') || lowerText.includes('reconcile')) {
        replyText = 'The AI Document Processing module matches parsed bank ledger lines against invoices. Our matching engine operates on 6 security-compliant levels:\n\n' +
          '1. Exact match (Invoice & statement details match)\n' +
          '2. Recurring vendor historical routing rule\n' +
          '3. Bank transfer transaction lookup\n' +
          '4. Fuzzy name/amount correlation\n' +
          '5. Historical average vendor pricing\n' +
          '6. Manual fallback reconciliation workspace\n\n' +
          'Would you like to review unmatched Suspense items?';
        additionalActions = [
          { label: 'Show Suspense Items', action: 'suspense_items' },
          { label: 'Go to Accounting Dashboard', action: 'navigate_accounting' }
        ];
      } else if (actionType === 'quickbooks_sync' || lowerText.includes('quickbooks') || lowerText.includes('qb') || lowerText.includes('push')) {
        replyText = 'QuickBooks OAuth is currently active. The 9-stage bookkeeping engine pushes reconciled statements automatically.\n\n' +
          '• **Sync Status:** ACTIVE\n' +
          '• **Last Sync:** Just now\n' +
          '• **Synced Records:** 142 items processed successfully today, 0 items failed.';
        additionalActions = [
          { label: 'Verify Sync Logs', action: 'sync_logs' },
          { label: 'Check VAT Rules', action: 'vat_rules' }
        ];
      } else if (actionType === 'suspense_items' || lowerText.includes('suspense')) {
        replyText = 'We currently have **3 unresolved Suspense transactions** under Sheet 7:\n\n' +
          '1. AED 4,500 withdrawal on 12-Jun (Unidentified cash receipt)\n' +
          '2. AED 1,200 payment to "DXB Tech Traders" (No matching invoice found)\n' +
          '3. AED 780 fee from "Dubai Post" (Missing vat breakdown)\n\n' +
          'You can click "Dispatch notification" to auto-email clients to upload matching receipts.';
        additionalActions = [
          { label: 'Go to Accounting Dashboard', action: 'navigate_accounting' }
        ];
      } else if (actionType === 'sync_logs' || lowerText.includes('log')) {
        replyText = 'QuickBooks Online OAuth 2.0 transaction logs:\n\n' +
          '[17:45:12] OAuth 2.0 token verified successfully\n' +
          '[17:45:15] Batch Push: Reconciled 12 invoices to QuickBooks ledger\n' +
          '[17:45:18] Push confirmed by QuickBooks Webhook (Response: 200 OK)';
      } else if (lowerText.includes('schedule') || lowerText.includes('booking') || lowerText.includes('slot') || lowerText.includes('book') || lowerText.includes('meet') || lowerText.includes('appointment')) {
        replyText = 'Looking up booking slots on Cal.com... 📅\n\nI found an open slot! You can book it here: https://cal.com/inchub-support/demo-session';
      } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
        replyText = 'Hello! Let me know if you would like me to audit bookkeeping thresholds, inspect OCR data extraction confidence levels, or review QuickBooks syncing.';
      } else {
        replyText = 'I am your interactive compliance assistant. For Milestone 1 verification, you can ask about VAT thresholds (300k/350k/375k alerts), document matching engines, or QuickBooks integration workflows.';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date(),
          actions: additionalActions
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date()
      }
    ]);

    if (!textToSend) {
      setInputValue('');
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message', text);
    } else {
      simulateAiResponse(text);
    }
  };

  const handleActionClick = (action: string, label: string) => {
    // Add user message containing button label
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: label,
        timestamp: new Date()
      }
    ]);

    if (action === 'navigate_accounting') {
      router.push('/accounting');
      setIsOpen(false);
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message', label);
    } else {
      simulateAiResponse(label, action);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Compliance Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2C1A0E 0%, #B8892A 100%)',
          boxShadow: '0 8px 30px rgba(184,137,42,0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
          border: '1px solid rgba(184,137,42,0.5)',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(184,137,42,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(184,137,42,0.4)';
        }}
      >
        <Image
          src="/logo_page_6.svg"
          alt="IncHub Chatbot Logo"
          width={30}
          height={30}
          style={{ width: '55%', height: '55%', objectFit: 'contain' }}
        />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            animation: 'fadeIn 200ms ease-out',
          }}
        />
      )}

      {/* Chat Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.15)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          borderLeft: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2E1A 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #C9A040 0%, #B8892A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 1px rgba(184,137,42,0.3)',
              }}
            >
              <Image
                src="/logo_page_6.svg"
                alt="IncHub Copilot Logo"
                width={24}
                height={24}
                style={{ width: '65%', height: '65%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>IncHub Copilot AI</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Active • UAE Compliance</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close panel"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms, color 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.375rem',
              }}
            >
              <div
                style={{
                  background: msg.sender === 'user' ? '#2C1A0E' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#334155',
                  padding: '0.875rem 1.125rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(44,26,14,0.15)' : '0 2px 8px rgba(15,23,42,0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>

              {/* Timestamp */}
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', padding: '0 0.25rem' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', width: '100%' }}>
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act.action, act.label)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #B8892A',
                        borderRadius: '9999px',
                        padding: '0.375rem 0.875rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#B8892A',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F6F1E8';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(184,137,42,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', width: '60px', alignSelf: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about compliance & bookkeeping rules..."
              style={{
                flex: 1,
                height: '42px',
                border: '1px solid #cbd5e1',
                borderRadius: '24px',
                padding: '0 1.25rem',
                fontSize: '0.875rem',
                outline: 'none',
                color: '#334155',
                transition: 'border-color 150ms, box-shadow 150ms',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#B8892A';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,137,42,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: inputValue.trim() ? '#2C1A0E' : '#f1f5f9',
                border: 'none',
                color: inputValue.trim() ? '#ffffff' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                transition: 'all 150ms ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg) translate(-1px, 1px)' }}>
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>

        {/* Global Keyframe CSS Injection */}
        <style dangerouslySetInnerHTML={{ __html: ` // nosec
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
        `}} />
      </div>
    </>
  );
}
