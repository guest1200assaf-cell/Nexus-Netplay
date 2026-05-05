// ─── GameCard — Emulator selection card ─────────────────────────────────────
import React from 'react';

const EMULATOR_INFO = {
  pcsx2:  { label: 'PCSX2',   sub: 'PlayStation 2',   icon: '🎮', color: '#0078d4', glow: 'rgba(0,120,212,0.35)' },
  dolphin: { label: 'Dolphin', sub: 'GameCube / Wii',  icon: '🐬', color: '#7c3aed', glow: 'rgba(124,58,237,0.35)' },
  ppsspp: { label: 'PPSSPP',  sub: 'PlayStation Portable', icon: '📱', color: '#00c8ff', glow: 'rgba(0,200,255,0.35)' },
};

export default function GameCard({ emulator, selected = false, onClick }) {
  const info = EMULATOR_INFO[emulator] || EMULATOR_INFO.pcsx2;

  return (
    <button
      id={`game-card-${emulator}`}
      onClick={onClick}
      style={{
        position:    'relative',
        display:     'flex',
        flexDirection:'column',
        alignItems:  'center',
        justifyContent:'center',
        gap:         12,
        padding:     '28px 20px',
        borderRadius: 20,
        background:  selected
          ? `linear-gradient(135deg, ${info.color}22, ${info.color}11)`
          : 'rgba(255,255,255,0.04)',
        border:      `1.5px solid ${selected ? info.color : 'rgba(255,255,255,0.08)'}`,
        boxShadow:   selected ? `0 0 32px ${info.glow}, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
        cursor:      'pointer',
        transition:  'all 250ms cubic-bezier(0.4,0,0.2,1)',
        transform:   selected ? 'translateY(-2px)' : 'translateY(0)',
        width:       '100%',
        fontFamily:  'inherit',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 8, height: 8, borderRadius: '50%',
          background: info.color,
          boxShadow: `0 0 8px ${info.color}`,
          animation: 'dotPulse 1.5s infinite',
        }} />
      )}

      <div style={{ fontSize: 36 }}>{info.icon}</div>

      <div>
        <div style={{
          fontSize:   '1rem', fontWeight: 700,
          color:      selected ? info.color : 'rgba(255,255,255,0.85)',
          transition: 'color 200ms',
        }}>
          {info.label}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
          {info.sub}
        </div>
      </div>
    </button>
  );
}
