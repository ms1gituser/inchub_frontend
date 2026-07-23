'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { resolveToken } from '@/lib/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActionCard {
  type: 'task_created' | 'ticket_raised' | 'month_locked' | 'info';
  title: string;
  description: string;
  id?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  streaming?: boolean;
  actions?: Array<{ label: string; action: string }>;
  actionCard?: ActionCard;
  msgId?: string; // backend message ID for feedback
  feedback?: 'up' | 'down' | null;
}

// ── Markdown renderer (simple, no external lib) ───────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.07);padding:1px 5px;border-radius:4px;font-size:0.8em">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 style="margin:0.5em 0 0.25em;font-size:0.85em;font-weight:700;color:#2A1628">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:0.5em 0 0.25em;font-size:0.9em;font-weight:700;color:#2A1628">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul style="margin:0.4em 0;padding-left:1.2em">${m}</ul>`)
    .replace(/\n/g, '<br/>');
}

// Build safe inner HTML for AI message bubbles — only whitelisted tags from renderMarkdown
function mkHtml(text: string, streaming: boolean) {
  const cursor = streaming ? '<span style="animation:blink 1s step-end infinite;margin-left:2px">█</span>' : ''; // nosec
  return { __html: renderMarkdown(text) + cursor }; // nosec
}

function getNowTimestamp() {
  return Date.now();
}

function getNowDate() {
  return new Date();
}

const SUGGESTED_PROMPTS = [
  { icon: '📊', text: "What's the VAT status for all my clients?", color: '#E8760A' },
  { icon: '⚠️', text: "Which clients have overdue KYC documents?", color: '#D32F2F' },
  { icon: '🔄', text: "Show reconciliation exceptions this month", color: '#1A73E8' },
  { icon: '✅', text: "Create a task for Priya: Chase CT filing", color: '#047857' },
  { icon: '💰', text: "Which client has the highest outstanding VAT?", color: '#7c3aed' },
  { icon: '📅', text: "Book a meeting slot with our team", color: '#B8892A' },
];

const ACTION_CARD_COLORS: Record<string, string> = {
  task_created: '#047857',
  ticket_raised: '#1A73E8',
  month_locked: '#7c3aed',
  info: '#B8892A',
};

export default function AiChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [feedbackMsgId, setFeedbackMsgId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Keyboard shortcut Ctrl+/ ──────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => {
          const next = !prev;
          if (next) setUnreadCount(0);
          return next;
        });
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // ── Fetch conversation history ────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const token = resolveToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${baseUrl}/chat/history?limit=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const msgs: Message[] = (data.data || []).map((m: any) => ({
          id: m.id || `hist-${Math.random()}`,
          sender: m.role === 'user' ? 'user' : 'ai',
          text: m.text,
          timestamp: new Date(m.timestamp),
          msgId: m.id,
        }));
        setHistoryMessages(msgs);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Socket setup ──────────────────────────────────────────────────────────
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
        // Fetch history on connect
        fetchHistory();
      });

      // ── Welcome message ──
      socket.on('message', (msg: { id?: string; sender?: string; text: string; timestamp?: string; actionCard?: ActionCard }) => {
        if (!isOpen) setUnreadCount(c => c + 1);

        setIsTyping(false);
        const isAi = !msg.id?.startsWith('user-');

        setMessages(prev => {
          if (prev.some(p => p.id === msg.id)) return prev;
          return [...prev, {
            id: msg.id || `msg-${getNowTimestamp()}`,
            sender: isAi ? 'ai' : 'user',
            text: msg.text,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : getNowDate(),
            actionCard: msg.actionCard,
          }];
        });
      });

      // ── Streaming events ──
      socket.on('stream_start', ({ id }: { id: string }) => {
        setStreamingMsgId(id);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id,
          sender: 'ai',
          text: '',
          timestamp: getNowDate(),
          streaming: true,
        }]);
      });

      socket.on('stream_chunk', ({ id, chunk }: { id: string; chunk: string }) => {
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, text: m.text + chunk } : m
        ));
      });

      socket.on('stream_end', ({ id, aiMsgId, fullText, actionCard }: {
        id: string; aiMsgId?: string; fullText: string; actionCard?: ActionCard;
      }) => {
        setStreamingMsgId(null);
        setMessages(prev => prev.map(m =>
          m.id === id
            ? { ...m, text: fullText, streaming: false, msgId: aiMsgId, actionCard }
            : m
        ));
        if (!isOpen) setUnreadCount(c => c + 1);
      });

      // ── Escalation ──
      socket.on('escalation', ({ active }: { active: boolean }) => {
        setIsEscalated(active);
      });

      socket.on('disconnect', () => {
        socketRef.current = null;
      });
    }

    return () => {
      if (!isOpen && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, fetchHistory]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Removed duplicate fetchHistory declaration from bottom

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = (text?: string) => {
    const msg = (text || inputValue).trim();
    if (!msg) return;

    const userMsg: Message = {
      id: `user-${getNowTimestamp()}`,
      sender: 'user',
      text: msg,
      timestamp: getNowDate(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    if (socketRef.current?.connected) {
      socketRef.current.emit('message', msg);
    } else {
      // HTTP fallback
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `ai-${getNowTimestamp()}`,
        sender: 'ai',
        text: 'Reconnecting... Please try again in a moment.',
        timestamp: getNowDate(),
      }]);
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────────
  const handleVoice = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const token = resolveToken();
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${baseUrl}/chat/transcribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ audio_base64: base64, mime_type: 'audio/webm' }),
            });
            if (res.ok) {
              const data = await res.json();
              const transcript = data.data?.transcript || '';
              if (transcript) setInputValue(transcript);
            }
          } catch { /* ignore */ }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch {
      console.warn('[Voice] Microphone access denied');
    }
  };

  // ── Feedback ──────────────────────────────────────────────────────────────
  const handleFeedback = async (msgId: string, isHelpful: boolean, correction?: string) => {
    try {
      const token = resolveToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${baseUrl}/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message_id: msgId, is_helpful: isHelpful, correction_text: correction }),
      });
      setMessages(prev => prev.map(m => m.msgId === msgId ? { ...m, feedback: isHelpful ? 'up' : 'down' } : m));
      setFeedbackMsgId(null);
      setCorrectionText('');
    } catch { /* ignore */ }
  };

  const currentMessages = activeTab === 'chat' ? messages : historyMessages;

  return (
    <>
      {/* ── Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open IncHub Copilot"
          title="Ctrl+/ to toggle"
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            width: '58px', height: '58px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2C1A0E 0%, #B8892A 100%)',
            boxShadow: '0 8px 30px rgba(184,137,42,0.45), inset 0 1px 1px rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(184,137,42,0.5)',
            color: '#ffffff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(184,137,42,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(184,137,42,0.45)'; }}
        >
          <Image src="/logo_page_6.svg" alt="IncHub Copilot" width={30} height={30} style={{ width: '55%', height: '55%', objectFit: 'contain' }} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', background: '#D32F2F', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Overlay ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(3px)', zIndex: 9998, animation: 'fadeIn 200ms ease-out' }}
        />
      )}

      {/* ── Panel ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '520px',
        background: '#F8F6F3',
        boxShadow: '-12px 0 50px rgba(15,23,42,0.18)',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '1rem 1.25rem 0',
          background: 'linear-gradient(135deg, #2C1A0E 0%, #3D2210 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #C9A040 0%, #B8892A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1px rgba(184,137,42,0.4), 0 4px 12px rgba(184,137,42,0.3)' }}>
                <Image src="/logo_page_6.svg" alt="Copilot" width={24} height={24} style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>IncHub Copilot</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isEscalated ? '#F59E0B' : '#10b981', boxShadow: `0 0 6px ${isEscalated ? '#F59E0B' : '#10b981'}` }} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                    {isEscalated ? 'Escalated to Human' : 'AI Active • UAE Compliance'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Ctrl+/</span>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['chat', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem', border: 'none', borderRadius: '8px 8px 0 0',
                  background: activeTab === tab ? '#F8F6F3' : 'transparent',
                  color: activeTab === tab ? '#2A1628' : 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 150ms', textTransform: 'capitalize', letterSpacing: '0.02em',
                }}
              >
                {tab === 'chat' ? '💬 Chat' : '🕐 History'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Escalation Banner ── */}
        {isEscalated && (
          <div style={{ background: '#FEF3C7', borderBottom: '1px solid #F59E0B', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem' }}>⚠️</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400E', flex: 1 }}>Conversation escalated — human support will respond shortly. AI responses paused.</span>
          </div>
        )}

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', scrollbarWidth: 'thin', scrollbarColor: '#DDD0C4 transparent' }}>

          {/* Suggested prompts (shown when no chat messages yet) */}
          {activeTab === 'chat' && messages.length === 0 && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(42,22,40,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
                Suggested prompts
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.text)}
                    style={{
                      background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px',
                      padding: '0.75rem', textAlign: 'left', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: '0.375rem',
                      transition: 'all 150ms', boxShadow: '0 2px 8px rgba(42,22,40,0.04)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = `0 4px 16px rgba(42,22,40,0.08)`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD0C4'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(42,22,40,0.04)'; }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2A1628', lineHeight: 1.3 }}>{p.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History empty state */}
          {activeTab === 'history' && historyMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(42,22,40,0.4)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕐</div>
              <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>No conversation history yet</p>
            </div>
          )}

          {/* Messages list */}
          {currentMessages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.375rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              {/* Sender label for AI */}
              {msg.sender === 'ai' && (
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'rgba(42,22,40,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', paddingLeft: '0.25rem' }}>IncHub Copilot</span>
              )}

              {/* Message bubble */}
              <div style={{
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #2C1A0E 0%, #4A2E1A 100%)' : '#ffffff',
                color: msg.sender === 'user' ? '#ffffff' : '#2A1628',
                padding: '0.875rem 1rem',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '2px 16px 16px 16px',
                fontSize: '0.8125rem', lineHeight: '1.55',
                boxShadow: msg.sender === 'user' ? '0 3px 12px rgba(44,26,14,0.2)' : '0 2px 8px rgba(42,22,40,0.06)',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(221,208,196,0.6)',
              }}>
                {msg.sender === 'ai' ? (() => {
                  const aiProps = { dangerouslySetInnerHTML: mkHtml(msg.text, !!msg.streaming) }; // nosec — content from renderMarkdown whitelist only
                  return <span {...aiProps} />;
                })() : msg.text}
              </div>

              {/* Action Card */}
              {msg.actionCard && (
                <div style={{
                  background: `${ACTION_CARD_COLORS[msg.actionCard.type] || '#047857'}12`,
                  border: `1px solid ${ACTION_CARD_COLORS[msg.actionCard.type] || '#047857'}40`,
                  borderRadius: '10px', padding: '0.75rem 1rem', width: '100%',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: ACTION_CARD_COLORS[msg.actionCard.type] || '#047857', marginBottom: '0.25rem' }}>{msg.actionCard.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(42,22,40,0.7)' }}>{msg.actionCard.description}</div>
                </div>
              )}

              {/* Timestamp + feedback row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: msg.sender === 'ai' ? '0.25rem' : 0 }}>
                <span style={{ fontSize: '0.625rem', color: 'rgba(42,22,40,0.3)' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Feedback buttons for AI messages */}
                {msg.sender === 'ai' && msg.msgId && !msg.streaming && (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      title="Helpful"
                      onClick={() => handleFeedback(msg.msgId!, true)}
                      style={{ background: msg.feedback === 'up' ? 'rgba(4,120,87,0.12)' : 'transparent', border: msg.feedback === 'up' ? '1px solid #047857' : '1px solid rgba(42,22,40,0.12)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '0.65rem', color: msg.feedback === 'up' ? '#047857' : 'rgba(42,22,40,0.35)', transition: 'all 150ms' }}
                    >👍</button>
                    <button
                      title="Not helpful"
                      onClick={() => setFeedbackMsgId(msg.msgId!)}
                      style={{ background: msg.feedback === 'down' ? 'rgba(196,105,90,0.12)' : 'transparent', border: msg.feedback === 'down' ? '1px solid #C4695A' : '1px solid rgba(42,22,40,0.12)', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '0.65rem', color: msg.feedback === 'down' ? '#C4695A' : 'rgba(42,22,40,0.35)', transition: 'all 150ms' }}
                    >👎</button>
                  </div>
                )}
              </div>

              {/* Correction form */}
              {feedbackMsgId === msg.msgId && (
                <div style={{ width: '100%', background: '#fff', border: '1px solid #DDD0C4', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(42,22,40,0.6)' }}>What was wrong? (Optional — improves AI)</span>
                  <textarea
                    rows={2}
                    value={correctionText}
                    onChange={e => setCorrectionText(e.target.value)}
                    placeholder="Enter the correct answer..."
                    style={{ fontSize: '0.75rem', padding: '0.5rem', border: '1px solid #DDD0C4', borderRadius: '6px', resize: 'none', fontFamily: 'inherit', outline: 'none', color: '#2A1628' }}
                  />
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => handleFeedback(msg.msgId!, false, correctionText)} style={{ flex: 1, padding: '0.375rem', background: '#2A1628', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Submit</button>
                    <button onClick={() => setFeedbackMsgId(null)} style={{ padding: '0.375rem 0.75rem', background: 'transparent', color: 'rgba(42,22,40,0.5)', border: '1px solid #DDD0C4', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Action suggestion buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {msg.actions.map((act, i) => (
                    <button key={i} onClick={() => {
                      if (act.action === 'navigate_accounting') { router.push('/accounting'); setIsOpen(false); return; }
                      handleSend(act.label);
                    }} style={{ background: '#fff', border: '1px solid #B8892A', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 600, color: '#B8892A', cursor: 'pointer', transition: 'all 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FDF5E8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >{act.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && !streamingMsgId && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#fff', padding: '0.75rem 1rem', borderRadius: '2px 12px 12px 12px', border: '1px solid rgba(221,208,196,0.6)', alignSelf: 'flex-start', boxShadow: '0 2px 8px rgba(42,22,40,0.04)' }}>
              {[0, 0.16, 0.32].map((delay, i) => (
                <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B8892A', animation: `bounce 1.2s infinite ease-in-out both ${delay}s` }} />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        {activeTab === 'chat' && (
          <div style={{ padding: '1rem 1.25rem 1.25rem', background: '#ffffff', borderTop: '1px solid rgba(221,208,196,0.5)' }}>
            {isEscalated && (
              <div style={{ fontSize: '0.7rem', color: '#92400E', background: '#FEF3C7', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem', fontWeight: 500 }}>
                ⚠️ AI responses paused — awaiting human handoff
              </div>
            )}
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Ask anything about UAE compliance, clients, VAT..."
                  disabled={isEscalated}
                  style={{
                    width: '100%', height: '44px', border: '1.5px solid #DDD0C4', borderRadius: '22px',
                    padding: '0 1.25rem', fontSize: '0.8125rem', outline: 'none',
                    color: '#2A1628', background: '#FAF8F5', transition: 'border-color 150ms, box-shadow 150ms',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#B8892A'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,137,42,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#DDD0C4'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Voice button */}
              <button
                type="button"
                onClick={handleVoice}
                title={isRecording ? 'Stop recording' : 'Voice input'}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: isRecording ? '#D32F2F' : 'rgba(42,22,40,0.06)',
                  color: isRecording ? '#fff' : 'rgba(42,22,40,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 150ms',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {/* Send button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isEscalated}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: inputValue.trim() && !isEscalated ? 'linear-gradient(135deg, #2C1A0E 0%, #4A2E1A 100%)' : '#f1f5f9',
                  color: inputValue.trim() && !isEscalated ? '#ffffff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: inputValue.trim() && !isEscalated ? 'pointer' : 'default',
                  transition: 'all 150ms',
                  boxShadow: inputValue.trim() && !isEscalated ? '0 4px 14px rgba(44,26,14,0.25)' : 'none',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg) translate(-1px,1px)' }}>
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ── Global Animations ── */}
      <style dangerouslySetInnerHTML={{ // nosec
        __html: `
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bounce { 0%,80%,100% { transform: scale(0) } 40% { transform: scale(1) } }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(211,47,47,0.4) } 50% { box-shadow: 0 0 0 8px rgba(211,47,47,0) } }
      `}} />
    </>
  );
}
