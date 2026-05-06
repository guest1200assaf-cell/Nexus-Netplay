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
    navigate('/lobby');
  };

  return (
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
          ))}
        </div>
      </div>

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
    </div>
  );
}
