// ─── StatusPill — Connection status badge ───────────────────────────────────
import React from 'react';

const STATUS_CONFIG = {
  idle:       { label: 'غير متصل',   color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.06)', dot: '#6b7280' },
  connecting: { label: 'جارٍ الاتصال', color: '#f59e0b',              bg: 'rgba(245,158,11,0.12)',  dot: '#f59e0b' },
  connected:  { label: 'متصل',        color: '#22c55e',              bg: 'rgba(34,197,94,0.12)',   dot: '#22c55e' },
  error:      { label: 'خطأ',          color: '#ef4444',              bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444' },
};

export default function StatusPill({ status = 'idle' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div id="status-pill" style={{
      display:        'inline-flex',
      alignItems:     'center',
      gap:            7,
      padding:        '6px 14px',
      borderRadius:   99,
      background:     cfg.bg,
      border:         `1px solid ${cfg.color}33`,
      fontSize:       '0.8rem',
      fontWeight:     600,
      color:          cfg.color,
      letterSpacing:  '0.02em',
      transition:     'all 250ms ease',
    }}>
      <span style={{
        width: 7, height: 7,
        borderRadius: '50%',
        background: cfg.dot,
        animation: status === 'connected' || status === 'connecting'
          ? 'dotPulse 1.5s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      {cfg.label}
    </div>
  );
}
