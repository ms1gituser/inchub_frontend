import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '75vh', gap: '1.25rem' 
    }}>
      <div style={{
        width: '48px', height: '48px', 
        border: '3px solid rgba(44, 26, 14, 0.1)', 
        borderTop: '3px solid #b38b4d', 
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', color: '#2c1a0e', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>IncHub</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(44,26,14,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
          {message}
        </p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
