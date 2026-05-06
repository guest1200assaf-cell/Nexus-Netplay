// ─── VoiceIndicator — Mic level bars + mute toggle ──────────────────────────
import React from 'react';
import { useNexusStore } from '../../store/nexusStore';

export default function VoiceIndicator({ voiceLevel = 0 }) {
  const { isMuted, toggleMute } = useNexusStore();

  const bars = Array.from({ length: 5 }, (_, i) => {
    const threshold = i * 20;
    return {
      active: !isMuted && voiceLevel > threshold,
      height: 8 + i * 4,   // 8 10 12 16 20 px
    };
  });

  return (
    <button
      id="voice-indicator"
      onClick={toggleMute}
      title={isMuted ? 'فك الكتم' : 'كتم الصوت'}
      style={{
        position:    'fixed',
        bottom:      24,
        left:        24,
        display:     'flex',
        alignItems:  'center',
        gap:         6,
        padding:     '8px 16px',
        borderRadius: 99,
        background:  'rgba(0,0,0,0.55)',
        border:      `1px solid ${isMuted ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
        backdropFilter: 'blur(12px)',
        cursor:      'pointer',
        transition:  'all 200ms ease',
        zIndex:      50,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = isMuted ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'; }}
    >
      {isMuted ? (
        <span style={{ fontSize: 16, color: '#ef4444' }}>🔇</span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
          {bars.map((bar, i) => (
            <div
              key={i}
              style={{
                width:        4,
                height:       bar.height,
                borderRadius: 2,
                background:   bar.active ? '#22c55e' : 'rgba(255,255,255,0.2)',
                transition:   'background 75ms, height 75ms',
              }}
            />
          ))}
        </div>
      )}
      <span style={{
        fontSize: '0.78rem',
        color:    isMuted ? '#ef4444' : 'rgba(255,255,255,0.5)',
        marginRight: 4,
        transition: 'color 200ms',
      }}>
        {isMuted ? 'مكتوم' : 'نشط'}
      </span>
    </button>
  );
}
