'use client';

import { useState, useEffect } from 'react';

interface KycRefreshTimerProps {
  lastRefreshTime?: string;
  onRefresh?: () => void;
}

/**
 * Enterprise-grade KYC 24-hour refresh timer badge
 * Shows countdown to next automatic refresh with visual indicator
 */
export default function KycRefreshTimer({ lastRefreshTime, onRefresh }: KycRefreshTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('Calculating...');
  const [percentComplete, setPercentComplete] = useState(0);
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const lastRefresh = lastRefreshTime ? new Date(lastRefreshTime) : new Date(now.getTime() - 23 * 60 * 60 * 1000);
      const nextRefresh = new Date(lastRefresh.getTime() + 24 * 60 * 60 * 1000);

      const diff = nextRefresh.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Ready to refresh');
        setPercentComplete(100);
        setIsExpiring(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

      // Calculate percentage (24 hours = 100%)
      const totalTime = 24 * 60 * 60 * 1000;
      const elapsed = totalTime - diff;
      setPercentComplete((elapsed / totalTime) * 100);

      // Alert when less than 1 hour left
      setIsExpiring(diff < 60 * 60 * 1000);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  const containerBg = isExpiring ? '#fff5f5' : '#f0fdf4';
  const textColor = isExpiring ? '#dc2626' : '#16a34a';
  const progressBg = isExpiring ? '#fecaca' : '#86efac';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: containerBg,
      border: `1px solid ${isExpiring ? '#fca5a5' : '#86efac'}`,
      borderRadius: 8,
      padding: '0.75rem 1rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: textColor,
    }}>
      {/* Timer Icon */}
      <div style={{ fontSize: '0.875rem' }}>⏱️</div>

      {/* Text + Progress Bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '0.35rem' }}>
          24h Auto-Refresh: {timeLeft}
        </div>
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: 4,
          background: '#e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${percentComplete}%`,
            height: '100%',
            background: progressBg,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        style={{
          padding: '0.4rem 0.8rem',
          background: textColor,
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        title="Manually trigger KYC refresh"
      >
        ↻ Refresh Now
      </button>
    </div>
  );
}
