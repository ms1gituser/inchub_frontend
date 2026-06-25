'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePermission } from './PermissionContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  onClose?: () => void;
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
  showAlert: (message: string, title?: string, onClose?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const { currentBrand } = usePermission();

  const isFinancial = currentBrand === 'financial';
  const primaryBg = isFinancial ? '#2A1628' : '#2C1A0E';
  const accentColor = isFinancial ? '#E8760A' : '#B8892A';
  const accentHover = isFinancial ? '#F09040' : '#C9A040';
  const cardBorderColor = isFinancial ? '#DDD0C4' : '#DDD4BE';
  const textPrimary = isFinancial ? '#2A1628' : '#2C1A0E';
  const surfaceBg = isFinancial ? '#F6F2EE' : '#F6F1E8';

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const showConfirm = (message: string, onConfirm: () => void, title: string = 'Confirm Action') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const showAlert = (message: string, title: string = 'Attention', onClose?: () => void) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      onClose: () => {
        if (onClose) onClose();
        setAlertState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Automatically dismiss toasts after 2 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast, showConfirm, showAlert }}>
      {children}

      {/* ── Toast Notifications List (Status Bars) ── */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          let typeColor = accentColor;
          let typeIcon = (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          );

          if (toast.type === 'success') {
            typeColor = 'var(--color-success, #047857)';
            typeIcon = (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            );
          } else if (toast.type === 'error') {
            typeColor = 'var(--color-error, #b91c1c)';
            typeIcon = (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            );
          } else if (toast.type === 'warning') {
            typeColor = 'var(--color-warning, #b45309)';
            typeIcon = (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            );
          }

          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: surfaceBg,
                borderLeft: `4px solid ${typeColor}`,
                borderTop: `1px solid ${cardBorderColor}`,
                borderRight: `1px solid ${cardBorderColor}`,
                borderBottom: `1px solid ${cardBorderColor}`,
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'auto',
                animation: 'slideIn 0.3s ease forwards',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 300,
                fontSize: '0.8125rem',
                color: textPrimary,
              }}
            >
              <span style={{ color: typeColor, display: 'flex', flexShrink: 0 }}>{typeIcon}</span>
              <div style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  outline: 'none',
                }}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Confirmation Modal (Popup) ── */}
      {confirmState.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(42, 22, 40, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.25s ease forwards',
          }}
        >
          <div
            style={{
              background: surfaceBg,
              border: `1px solid ${cardBorderColor}`,
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                borderBottom: `1px solid ${cardBorderColor}`,
                padding: '16px 24px',
                background: primaryBg,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor }} />
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'Cormorant, serif',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                }}
              >
                {confirmState.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '24px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.85,
                color: textPrimary,
                fontWeight: 300,
              }}
            >
              {confirmState.message}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                borderTop: `1px solid ${cardBorderColor}`,
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                onClick={confirmState.onCancel}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: `1px solid ${cardBorderColor}`,
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: textPrimary,
                  cursor: 'pointer',
                  transition: 'background-color 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmState.onConfirm}
                style={{
                  padding: '8px 20px',
                  background: primaryBg,
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background-color 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = accentHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = primaryBg;
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Alert Modal (Popup) ── */}
      {alertState.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(42, 22, 40, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.25s ease forwards',
          }}
        >
          <div
            style={{
              background: surfaceBg,
              border: `1px solid ${cardBorderColor}`,
              borderRadius: '16px',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                borderBottom: `1px solid ${cardBorderColor}`,
                padding: '16px 24px',
                background: primaryBg,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor }} />
              <h3
                style={{
                  margin: 0,
                  fontFamily: 'Cormorant, serif',
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                }}
              >
                {alertState.title}
              </h3>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '24px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                lineHeight: 1.85,
                color: textPrimary,
                fontWeight: 300,
              }}
            >
              {alertState.message}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                borderTop: `1px solid ${cardBorderColor}`,
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={alertState.onClose}
                style={{
                  padding: '8px 20px',
                  background: primaryBg,
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background-color 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = accentHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = primaryBg;
                }}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Slide-In and Fade-In Animations */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
