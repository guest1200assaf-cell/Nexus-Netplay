// src/renderer/components/ui/UpdateNotifier.jsx
// شريط التحديث الذي يظهر أسفل الشاشة

import React, { useEffect, useState } from 'react';

const STATES = {
  idle:        null,
  checking:    { icon:'🔍', text:'جار التحقق من التحديثات...', color:'text-white/40' },
  available:   { icon:'⬇️', text:'تحديث جديد متاح! جار التحميل...', color:'text-nexus-accent' },
  downloading: { icon:'⏬', text:'جار تحميل التحديث', color:'text-nexus-accent' },
  downloaded:  { icon:'✅', text:'التحديث جاهز — سيُثبَّت عند الإغلاق', color:'text-green-400' },
  error:       { icon:'⚠️', text:'تعذّر التحقق من التحديثات', color:'text-yellow-400' },
};

export default function UpdateNotifier() {
  const [state,    setState]    = useState('idle');
  const [progress, setProgress] = useState(0);
  const [version,  setVersion]  = useState('');
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;
    const api = window.electronAPI;

    const on = (event, cb) => {
      // يستقبل أحداث ipcRenderer عبر preload
      const cleanup = api[`on_${event}`]?.(cb);
      return cleanup;
    };

    // ── ربط الأحداث ──────────────────────────────────
    api.onUpdaterEvent?.((event, data) => {
      switch (event) {
        case 'checking':
          setState('checking'); setVisible(true);
          // أخفِ بعد 3 ثوانٍ إن لم يكن هناك تحديث
          setTimeout(() => setState(s => s === 'checking' ? 'idle' : s), 3000);
          break;

        case 'available':
          setState('available');
          setVersion(data.version);
          setVisible(true);
          break;

        case 'download-progress':
          setState('downloading');
          setProgress(data.percent);
          setVisible(true);
          break;

        case 'downloaded':
          setState('downloaded');
          setVersion(data.version);
          setVisible(true);
          break;

        case 'not-available':
          setVisible(false);
          break;

        case 'error':
          setState('error');
          setVisible(true);
          setTimeout(() => setVisible(false), 4000);
          break;
      }
    });
  }, []);

  const info = STATES[state];
  if (!visible || !info) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-3 pointer-events-none">
      <div className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl
        bg-black/80 backdrop-blur-md border border-white/10
        shadow-2xl text-sm transition-all duration-300
        pointer-events-auto max-w-md mx-auto
        ${info.color}
      `}>
        <span>{info.icon}</span>

        <span className="flex-1">
          {info.text}
          {version && <span className="font-mono text-xs mr-2 opacity-60">v{version}</span>}
        </span>

        {/* شريط التقدم عند التحميل */}
        {state === 'downloading' && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-nexus-accent rounded-full transition-all duration-300"
                   style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs opacity-60">{progress}%</span>
          </div>
        )}

        {/* زر "ثبّت الآن" عند اكتمال التحميل */}
        {state === 'downloaded' && (
          <button
            onClick={() => window.electronAPI?.installUpdate?.()}
            className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40 border border-green-500/30
                       rounded-lg text-green-400 text-xs transition-colors font-medium"
          >
            ثبّت الآن
          </button>
        )}

        {/* زر الإغلاق */}
        <button onClick={() => setVisible(false)}
                className="opacity-30 hover:opacity-70 transition-opacity text-white">
          ✕
        </button>
      </div>
    </div>
  );
}
