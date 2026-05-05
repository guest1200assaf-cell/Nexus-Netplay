// ─── GuestPanel — Guest join controls ───────────────────────────────────────
import React, { useState } from 'react';
import { useNexusStore } from '../../store/nexusStore';

export default function GuestPanel({ onJoin }) {
  const [inputCode, setInputCode] = useState('');
  const { setRoomCode, connectionStatus } = useNexusStore();

  const handleJoin = () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length < 4) return;
    setRoomCode(code);
    onJoin?.(code);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Info */}
      <div style={{
        padding: '16px 20px', borderRadius: 16,
        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)',
        fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, textAlign: 'right',
      }}>
        أدخل رمز الغرفة الذي شاركه معك المستضيف للانضمام إلى جلسة اللعب
      </div>

      {/* Code input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
          رمز الغرفة
        </label>
        <input
          id="guest-room-code-input"
          className="input"
          value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase().slice(0, 8))}
          onKeyDown={handleKey}
          placeholder="أدخل الرمز هنا…"
          maxLength={8}
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.4rem',
            letterSpacing: '0.25em',
            fontWeight: 600,
          }}
        />
      </div>

      {/* Join button */}
      <button
        id="guest-join-btn"
        onClick={handleJoin}
        disabled={inputCode.trim().length < 4 || connectionStatus === 'connecting'}
        style={{
          padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
          background: inputCode.trim().length >= 4
            ? 'linear-gradient(135deg, #7c3aed, #0078d4)'
            : 'rgba(255,255,255,0.06)',
          color: inputCode.trim().length >= 4 ? '#fff' : 'rgba(255,255,255,0.25)',
          border: 'none',
          cursor: inputCode.trim().length >= 4 ? 'pointer' : 'not-allowed',
          boxShadow: inputCode.trim().length >= 4 ? '0 0 28px rgba(124,58,237,0.4)' : 'none',
          transition: 'all 250ms ease',
        }}
      >
        {connectionStatus === 'connecting' ? '⟳ جارٍ الاتصال…' : '🔗 انضم إلى الغرفة'}
      </button>
    </div>
  );
}
