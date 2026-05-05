// ─── Home Page — Nexus Netplay Hub Landing ───────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';
import GameCard from '../components/ui/GameCard';
import { useController } from '../hooks/useController';

const EMULATORS = ['pcsx2', 'dolphin', 'ppsspp'];

export default function Home() {
  const navigate = useNavigate();
  const { selectedEmulator, setSelectedEmulator, generateRoom, setIsHost, resetSession } = useNexusStore();
  const [focusedEmulator, setFocusedEmulator] = useState(0);
  const [localIP, setLocalIP] = useState('...');

  useEffect(() => {
    resetSession();
    window.electronAPI?.getLocalIP()
      .then(ip => setLocalIP(ip || '127.0.0.1'))
      .catch(() => setLocalIP('127.0.0.1'));
  }, []);

  // Gamepad navigation on Home
  useController(({ button }) => {
    if (button === 'right') setFocusedEmulator(i => Math.min(i + 1, EMULATORS.length - 1));
    if (button === 'left')  setFocusedEmulator(i => Math.max(i - 1, 0));
    if (button === 'cross') {
      setSelectedEmulator(EMULATORS[focusedEmulator]);
    }
    if (button === 'triangle') handleHost();
    if (button === 'circle')   handleGuest();
  });

  const handleHost = () => {
    setIsHost(true);
    generateRoom();
    navigate('/lobby');
  };

  const handleGuest = () => {
    setIsHost(false);
    navigate('/lobby');
  };

  return (
    <div className="page" style={{ paddingTop: 40 }}>
      {/* Hero section */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 48px', gap: 40,
      }}>

        {/* Title */}
        <div className="fade-up" style={{ textAlign: 'center', animationDelay: '0ms' }}>
          <div style={{
            fontSize: '0.8rem', letterSpacing: '0.25em', fontWeight: 600, textTransform: 'uppercase',
            color: 'rgba(0,120,212,0.9)', marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ width: 24, height: 1, background: '#0078d4', display: 'inline-block' }} />
            P2P NETPLAY PLATFORM
            <span style={{ width: 24, height: 1, background: '#0078d4', display: 'inline-block' }} />
          </div>
          <h1 style={{
            fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #fff 30%, rgba(0,120,212,0.8) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Nexus Netplay Hub
          </h1>
          <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>
            العب مع أصدقائك عبر الإنترنت — بدون سيرفر مركزي
          </p>
        </div>

        {/* Emulator picker */}
        <div className="fade-up" style={{ animationDelay: '100ms', width: '100%', maxWidth: 560 }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: 12, textAlign: 'right' }}>
            اختر المحاكي
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {EMULATORS.map((em, i) => (
              <GameCard
                key={em}
                emulator={em}
                selected={selectedEmulator === em || (!selectedEmulator && focusedEmulator === i)}
                onClick={() => { setSelectedEmulator(em); setFocusedEmulator(i); }}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="fade-up" style={{ animationDelay: '200ms', display: 'flex', gap: 16, width: '100%', maxWidth: 560 }}>
          <button
            id="home-host-btn"
            className="btn btn-primary"
            onClick={handleHost}
            style={{ flex: 1, fontSize: '1rem', padding: '16px 24px' }}
          >
            👑 استضافة لعبة
          </button>
          <button
            id="home-guest-btn"
            className="btn btn-ghost"
            onClick={handleGuest}
            style={{ flex: 1, fontSize: '1rem', padding: '16px 24px' }}
          >
            🕹 الانضمام إلى لعبة
          </button>
        </div>

        {/* Info strip */}
        <div className="fade-up" style={{
          animationDelay: '300ms',
          display: 'flex', gap: 32, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)',
        }}>
          {[
            { icon: '🌐', label: 'IP المحلي', value: localIP },
            { icon: '🔒', label: 'مشفّر', value: 'WebRTC' },
            { icon: '⚡', label: 'بروتوكول', value: 'P2P Direct' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{item.icon}</span>
              <span>{item.label}:</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        padding: '16px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>v1.0.0</span>
        <button
          id="home-settings-btn"
          onClick={() => navigate('/settings')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ⚙️ الإعدادات
        </button>
      </div>
    </div>
  );
}
