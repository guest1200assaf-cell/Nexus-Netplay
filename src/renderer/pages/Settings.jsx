// src/renderer/pages/Settings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';

export default function Settings() {
  const navigate  = useNavigate();
  const { settings, updateSettings } = useNexusStore();

  const Field = ({ label, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <span className="text-white/60 text-sm">{label}</span>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-nexus-bg text-white p-8" style={{ direction:'rtl' }}>
      <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white mb-8 text-sm">
        â†گ ط±ط¬ظˆط¹
      </button>
      <h1 className="text-2xl font-bold mb-6">ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ</h1>

      <div className="max-w-md">
        <Field label="ط§ط³ظ…ظƒ ظپظٹ ط§ظ„ظ„ط¹ط¨ط©">
          <input value={settings.nickname}
                 onChange={e => updateSettings({ nickname: e.target.value })}
                 className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-nexus-accent w-40 text-left" />
        </Field>
        <Field label="ط§ظ„ظ…ظ†ظپط° (Port)">
          <input type="number" value={settings.port}
                 onChange={e => updateSettings({ port: parseInt(e.target.value) })}
                 className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-nexus-accent w-24 text-left" />
        </Field>
        <Field label="ظپطھط­ ط§ظ„ظ…ظ†ط§ظپط° طھظ„ظ‚ط§ط¦ظٹط§ظ‹ (UPnP)">
          <button onClick={() => updateSettings({ autoUPnP: !settings.autoUPnP })}
                  className={`w-10 h-6 rounded-full transition-colors ${settings.autoUPnP ? 'bg-nexus-blue' : 'bg-white/10'} relative`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoUPnP ? 'right-1' : 'left-1'}`} />
          </button>
        </Field>
      </div>
    </div>
  );
}
