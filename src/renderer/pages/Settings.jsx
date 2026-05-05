// ─── Settings Page ──────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';

function SettingRow({ label, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.75)' }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useNexusStore();

  return (
    <div className="page" style={{ paddingTop:40 }}>
      <header style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 40px 0' }}>
        <button id="settings-back-btn" onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>← رجوع</button>
        <h2 style={{ fontSize:'1.4rem', fontWeight:700 }}>⚙️ الإعدادات</h2>
      </header>

      <main style={{ flex:1, overflowY:'auto', padding:'32px 40px' }}>
        <div style={{ maxWidth:560, margin:'0 auto' }}>

          {/* Profile */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(0,120,212,0.8)', marginBottom:16, fontWeight:600 }}>الملف الشخصي</div>
            <SettingRow label="اسم اللاعب">
              <input id="settings-player-name" className="input" value={settings.playerName} onChange={e=>updateSettings({ playerName: e.target.value })} style={{ width:200, padding:'8px 12px', textAlign:'right' }} placeholder="اسمك" />
            </SettingRow>
          </div>

          {/* Network */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(0,120,212,0.8)', marginBottom:16, fontWeight:600 }}>الشبكة</div>
            <SettingRow label="منفذ الإشارة (Signaling Port)">
              <input id="settings-sig-port" className="input" type="number" value={settings.signalingPort} onChange={e=>updateSettings({ signalingPort: Number(e.target.value) })} style={{ width:120, padding:'8px 12px', textAlign:'center', fontFamily:'var(--font-mono)' }} />
            </SettingRow>
            <SettingRow label="منفذ Netplay">
              <input id="settings-net-port" className="input" type="number" value={settings.netplayPort} onChange={e=>updateSettings({ netplayPort: Number(e.target.value) })} style={{ width:120, padding:'8px 12px', textAlign:'center', fontFamily:'var(--font-mono)' }} />
            </SettingRow>
          </div>

          {/* About */}
          <div style={{ padding:'20px 24px', borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.82rem' }}>الإصدار</span>
              <span style={{ fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>1.0.0</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.82rem' }}>المحاكيات المدعومة</span>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>PCSX2 · Dolphin · PPSSPP</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.82rem' }}>البروتوكول</span>
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem' }}>WebRTC P2P + WebSocket</span>
            </div>
          </div>

          <button id="settings-save-btn" className="btn btn-primary" style={{ marginTop:24, width:'100%' }} onClick={()=>navigate('/')}>
            💾 حفظ والعودة
          </button>
        </div>
      </main>
    </div>
  );
}
