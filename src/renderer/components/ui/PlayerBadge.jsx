// ─── PlayerBadge — Player card with avatar + status ─────────────────────────
import React from 'react';

const EMULATOR_ICONS = { pcsx2: '🎮', dolphin: '🐬', ppsspp: '📱', null: '🎮' };
const ROLE_ICONS     = { Host: '👑', Guest: '🕹' };

export default function PlayerBadge({ role = 'Host', name = '---', connected = false, emulator = null, ping = null }) {
  const isConnected = connected;

  return (
    <div id={`player-badge-${role.toLowerCase()}`} style={{
      padding:         '16px 20px',
      borderRadius:    16,
      background:      isConnected ? 'rgba(0,120,212,0.10)' : 'rgba(255,255,255,0.04)',
      border:          `1px solid ${isConnected ? 'rgba(0,120,212,0.40)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow:       isConnected ? '0 0 20px rgba(0,120,212,0.15)' : 'none',
      transition:      'all 300ms ease',
      display:         'flex',
      alignItems:      'center',
      gap:             14,
    }}>
      {/* Avatar circle */}
      <div style={{
        width:          46, height: 46, borderRadius: '50%',
        background:     isConnected
          ? 'linear-gradient(135deg, #0078d4, #7c3aed)'
          : 'rgba(255,255,255,0.08)',
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        fontSize:       20, flexShrink: 0,
        boxShadow:      isConnected ? '0 0 16px rgba(0,120,212,0.4)' : 'none',
        transition:     'all 300ms ease',
      }}>
        {ROLE_ICONS[role] || '🎮'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize:   '0.82rem',
            fontWeight: 600,
            color:      isConnected ? 'rgba(0,120,212,0.9)' : 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {role === 'Host' ? 'المستضيف' : 'الضيف'}
          </span>
          {/* Online dot */}
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isConnected ? '#22c55e' : 'rgba(255,255,255,0.2)',
            animation: isConnected ? 'dotPulse 1.5s infinite' : 'none',
          }} />
        </div>

        <div style={{
          fontSize:   '0.95rem',
          fontWeight: 600,
          color:      isConnected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
          overflow:   'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>

        {/* Emulator + Ping */}
        {isConnected && (
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {emulator && (
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                {EMULATOR_ICONS[emulator]} {emulator.toUpperCase()}
              </span>
            )}
            {ping !== null && (
              <span style={{
                fontSize: '0.75rem',
                color: ping < 60 ? '#22c55e' : ping < 120 ? '#f59e0b' : '#ef4444',
              }}>
                {ping}ms
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status text */}
      <div style={{
        fontSize:   '0.78rem',
        color:      isConnected ? '#22c55e' : 'rgba(255,255,255,0.25)',
        textAlign:  'right', flexShrink: 0,
      }}>
        {isConnected ? 'متصل ✓' : 'ينتظر…'}
      </div>
    </div>
  );
}
