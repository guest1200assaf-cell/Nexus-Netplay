<<<<<<< HEAD
// src/renderer/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';

const EMULATORS = [
  { id:'pcsx2',   label:'PlayStation 2', icon:'🎮', color:'#00439c', sub:'PCSX2' },
  { id:'dolphin', label:'GameCube / Wii', icon:'🐬', color:'#6b3fa0', sub:'Dolphin' },
  { id:'ppsspp',  label:'PlayStation Portable', icon:'📱', color:'#1a6b3c', sub:'PPSSPP' },
];

export default function Home() {
  const navigate = useNavigate();
  const { selectedEmulator, setSelectedEmulator, setEmulatorPath, setLocalIP, createRoom, joinRoom } = useNexusStore();
  const [joinCode, setJoinCode] = useState('');
  const [focused, setFocused]   = useState(0);
  const [localIP, setLocalIPState] = useState('...');

  useEffect(() => {
    window.electronAPI?.getLocalIP?.().then(ip => {
      setLocalIPState(ip);
      setLocalIP(ip);
    });
  }, []);

  const handleSelectEmulator = async (id) => {
    setSelectedEmulator(id);
    const p = await window.electronAPI?.selectEmulatorPath(id);
    if (p) setEmulatorPath(p);
  };

  const handleHost = () => {
    if (!selectedEmulator) return;
    createRoom();
    navigate('/lobby');
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    joinRoom(joinCode.trim());
=======
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
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
    navigate('/lobby');
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-nexus-bg text-white flex flex-col select-none"
         style={{ direction:'rtl' }}>

      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 app-drag"
           style={{ WebkitAppRegion:'drag' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-accent flex items-center justify-center text-sm font-bold shadow-lg shadow-nexus-blue/30">
            N
          </div>
          <span className="font-semibold tracking-wider text-sm text-white/80">NEXUS NETPLAY HUB</span>
        </div>
        <div className="flex gap-2" style={{ WebkitAppRegion:'no-drag' }}>
          {['minimize','maximize','close'].map((a,i) => (
            <button key={a} onClick={() => window.electronAPI?.[a+'Window']?.()}
                    className={`w-3 h-3 rounded-full transition-opacity opacity-60 hover:opacity-100 ${
                      ['bg-yellow-400','bg-green-400','bg-red-500'][i]
                    }`} />
=======
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
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
          ))}
        </div>
      </div>

<<<<<<< HEAD
      <main className="flex-1 flex flex-col items-center justify-center px-8 gap-10 animate-fade-in">

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-white via-nexus-accent to-nexus-blue bg-clip-text text-transparent">
            العب مع أصدقائك
          </h1>
          <p className="text-white/40 text-sm">بدون سيرفرات · بدون اشتراكات · اتصال مباشر</p>
        </div>

        {/* اختيار المحاكي */}
        <div className="flex gap-4">
          {EMULATORS.map((e, i) => (
            <button key={e.id}
                    onMouseEnter={() => setFocused(i)}
                    onClick={() => handleSelectEmulator(e.id)}
                    className={`
                      relative p-5 rounded-2xl border transition-all duration-200 w-44 text-center
                      ${selectedEmulator === e.id
                        ? 'border-nexus-accent bg-nexus-accent/10 shadow-[0_0_20px_rgba(0,168,255,0.3)] scale-105'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }
                    `}>
              <div className="text-4xl mb-2">{e.icon}</div>
              <div className="font-semibold text-sm">{e.label}</div>
              <div className="text-white/40 text-xs mt-0.5">{e.sub}</div>
              {selectedEmulator === e.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-nexus-accent flex items-center justify-center text-[10px]">✓</div>
              )}
            </button>
          ))}
        </div>

        {/* Host / Join */}
        <div className="flex gap-6 items-end">
          <button onClick={handleHost}
                  disabled={!selectedEmulator}
                  className="px-10 py-4 rounded-xl bg-nexus-blue hover:bg-nexus-accent disabled:opacity-30
                             disabled:cursor-not-allowed font-bold text-lg transition-all duration-200
                             shadow-lg shadow-nexus-blue/30 hover:shadow-nexus-accent/40 hover:scale-105">
            🏠 استضافة غرفة
          </button>

          <div className="flex flex-col gap-2">
            <input value={joinCode}
                   onChange={e => setJoinCode(e.target.value.toUpperCase())}
                   placeholder="كود الغرفة"
                   maxLength={6}
                   className="px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-nexus-accent
                              outline-none text-center font-mono text-lg tracking-widest w-48
                              placeholder:text-white/20 transition-colors"
            />
            <button onClick={handleJoin}
                    disabled={!joinCode.trim()}
                    className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30
                               font-semibold transition-all duration-200">
              🎯 انضمام
            </button>
          </div>
        </div>

        {/* IP المحلي */}
        <div className="text-white/30 text-xs text-center">
          عنوانك المحلي: <span className="font-mono text-white/50">{localIP}</span>
        </div>
      </main>
=======
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
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
    </div>
  );
}
