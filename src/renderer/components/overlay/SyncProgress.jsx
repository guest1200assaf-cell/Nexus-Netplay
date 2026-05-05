// ─── SyncProgress — Save-state transfer progress bar ────────────────────────
import React from 'react';

export default function SyncProgress({ progress = 0, status = 'transferring' }) {
  const isReady = status === 'ready';

  return (
    <div id="sync-progress" style={{
      padding:      '20px 24px',
      borderRadius: 16,
      background:   'rgba(255,255,255,0.04)',
      border:       `1px solid ${isReady ? 'rgba(34,197,94,0.3)' : 'rgba(0,120,212,0.3)'}`,
      boxShadow:    isReady ? '0 0 20px rgba(34,197,94,0.1)' : '0 0 20px rgba(0,120,212,0.1)',
      minWidth:     260,
      transition:   'all 400ms ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          {isReady ? '✅ جاهز للعب' : '⟳ مزامنة حالة اللعبة'}
        </span>
        <span style={{
          fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
          color: isReady ? '#22c55e' : '#3d9bff',
        }}>
          {progress}%
        </span>
      </div>

      {/* Progress track */}
      <div style={{
        height: 6, borderRadius: 99,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${progress}%`,
          background: isReady
            ? 'linear-gradient(90deg, #22c55e, #4ade80)'
            : 'linear-gradient(90deg, #0078d4, #00c8ff)',
          boxShadow: isReady
            ? '0 0 12px rgba(34,197,94,0.6)'
            : '0 0 12px rgba(0,120,212,0.6)',
          transition: 'width 200ms ease, background 400ms ease, box-shadow 400ms ease',
        }} />
      </div>

      {/* Sub-text */}
      <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
        {isReady ? 'يمكن الآن بدء اللعبة' : 'يُرجى الانتظار حتى اكتمال المزامنة…'}
      </div>
    </div>
  );
}
