// src/app/components/LowBalanceAlert.tsx
// ─────────────────────────────────────────────────────────────
//  Shows a pop-up notification whenever the user's balance
//  drops below their configured balance_limit.
//
//  Usage (add to your Layout or App root):
//    <LowBalanceAlert balance={balance} limit={balance_limit} />
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

interface Props {
  balance: number;
  limit: number;
  currency?: string;
}

export default function LowBalanceAlert({ balance, limit, currency = '₹' }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show alert whenever balance drops below limit and hasn't been dismissed this render
    if (balance < limit && !dismissed) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [balance, limit, dismissed]);

  // Re-allow alert if balance changes (e.g. new transaction added)
  useEffect(() => {
    setDismissed(false);
  }, [balance]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        maxWidth: '360px',
        width: 'calc(100vw - 2.5rem)',
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        border: '1px solid #fca5a5',
        borderRadius: '1rem',
        boxShadow: '0 8px 32px rgba(239,68,68,0.18)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease',
      }}
    >
      {/* Icon */}
      <div
        style={{
          background: '#fee2e2',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1.25rem',
        }}
      >
        ⚠️
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#b91c1c', fontSize: '0.95rem' }}>
          Low Balance Alert
        </p>
        <p style={{ margin: '0.25rem 0 0', color: '#dc2626', fontSize: '0.85rem', lineHeight: 1.4 }}>
          Your balance{' '}
          <strong>
            {currency}
            {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>{' '}
          is below your limit of{' '}
          <strong>
            {currency}
            {limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
          .
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ef4444',
          fontSize: '1.1rem',
          padding: '0 0.25rem',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}
