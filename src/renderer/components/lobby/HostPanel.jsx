// ─── HostPanel — Host lobby controls ────────────────────────────────────────
import React, { useState } from 'react';
import { useNexusStore } from '../../store/nexusStore';

export default function HostPanel({ onLaunch }) {
  const { roomCode, emulatorPath, isoPath, setEmulatorPath, setIsoPath, selectedEmulator } = useNexusStore();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const browsePath = async (type) => {
    if (!window.electronAPI) return;
    if (type === 'exe') {
      const p = await window.electronAPI.selectEmulatorPath(selectedEmulator);
      if (p) setEmulatorPath(p);
    } else {
      const p = await window.electronAPI.selectEmulatorPath('iso');
      if (p) setIsoPath(p);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Room code */}
      <div style={{
        padding: '20px 24px', borderRadius: 16,
        background: 'rgba(0,120,212,0.08)', border: '1px solid rgba(0,120,212,0.25)',
      }}>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, textAlign: 'right' }}>
          رمز الغرفة — شارك مع صديقك
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            id="copy-room-code"
            onClick={copyCode}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem',
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#22c55e' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'all 200ms',
            }}
          >
            {copied ? '✓ تم النسخ' : 'نسخ'}
          </button>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 600,
            letterSpacing: '0.3em', color: '#3d9bff',
            textShadow: '0 0 20px rgba(61,155,255,0.5)',
          }}>
            {roomCode || '------'}
          </span>
        </div>
      </div>

      {/* Executable path */}
      <PathRow label="مسار المحاكي" value={emulatorPath} onBrowse={() => browsePath('exe')} id="browse-exe" />
      {/* ISO path */}
      <PathRow label="ملف اللعبة (ISO)" value={isoPath} onBrowse={() => browsePath('iso')} id="browse-iso" />

      {/* Launch button */}
      <button
        id="host-launch-btn"
        onClick={onLaunch}
        disabled={!emulatorPath}
        style={{
          padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
          background: emulatorPath
            ? 'linear-gradient(135deg, #0078d4, #7c3aed)'
            : 'rgba(255,255,255,0.06)',
          color: emulatorPath ? '#fff' : 'rgba(255,255,255,0.25)',
          border: 'none', cursor: emulatorPath ? 'pointer' : 'not-allowed',
          boxShadow: emulatorPath ? '0 0 28px rgba(0,120,212,0.4)' : 'none',
          transition: 'all 250ms ease',
        }}
      >
        🚀 ابدأ اللعبة كمستضيف
      </button>
    </div>
  );
}

function PathRow({ label, value, onBrowse, id }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>{label}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          id={id}
          onClick={onBrowse}
          style={{
            padding: '8px 14px', borderRadius: 8, fontSize: '0.82rem', flexShrink: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          }}
        >
          📁 تصفح
        </button>
        <div style={{
          flex: 1, padding: '8px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          direction: 'ltr', textAlign: 'left',
        }}>
          {value || 'لم يُحدد بعد'}
        </div>
      </div>
    </div>
  );
}
