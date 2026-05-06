// ─── TitleBar — Custom frameless window controls ────────────────────────────
import React, { useState, useEffect } from 'react';

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    window.electronAPI?.window.isMaximized().then(setMaximized).catch(() => {});
  }, []);

  const minimize = () => window.electronAPI?.window.minimize();
  const toggleMax = async () => {
    window.electronAPI?.window.maximize();
    const isMax = await window.electronAPI?.window.isMaximized().catch(() => false);
    setMaximized(!!isMax);
  };
  const close = () => window.electronAPI?.window.close();

  return (
    <div className="titlebar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0078d4, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff',
        }}>N</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>
          NEXUS NETPLAY
        </span>
      </div>

      {/* Window controls */}
      <div className="titlebar-controls" style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'min', icon: '—', action: minimize, color: '#f59e0b' },
          { id: 'max', icon: maximized ? '❐' : '□', action: toggleMax, color: '#22c55e' },
          { id: 'cls', icon: '✕', action: close,    color: '#ef4444' },
        ].map(btn => (
          <button
            key={btn.id}
            id={`titlebar-${btn.id}`}
            onClick={btn.action}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: btn.color, fontSize: 11, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms, transform 150ms',
              WebkitAppRegion: 'no-drag',
            }}
            onMouseEnter={e => { e.target.style.background = `${btn.color}22`; e.target.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.transform = 'scale(1)'; }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
