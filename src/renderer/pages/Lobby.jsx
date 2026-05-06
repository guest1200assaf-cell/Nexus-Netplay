<<<<<<< HEAD
// src/renderer/pages/Lobby.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
=======
// ─── Lobby Page — 4-Player PS5-style ────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';
import { useP2P } from '../hooks/useP2P';
import { useController } from '../hooks/useController';
<<<<<<< HEAD
import { useVoiceChat, useFrameSync } from '../hooks/useController';

const MENU = [
  { icon:'🚀', label:'تشغيل اللعبة' },
  { icon:'📤', label:'إرسال Save State' },
  { icon:'📥', label:'تحميل Save State' },
  { icon:'🎙', label:'الشات الصوتي' },
  { icon:'⚙️', label:'الإعدادات' },
  { icon:'🏠', label:'الخروج' },
];

export default function Lobby() {
  const navigate = useNavigate();
  const store    = useNexusStore();
  const { createPeer, connectSignaling, sendInput, sendSaveState, onData, disconnect, peer } = useP2P();
  const voice    = useVoiceChat();
  const { hostSend, guestReceive } = useFrameSync(peer, () => handleLaunch());

  const [focused,   setFocused]   = useState(0);
  const [chatLog,   setChatLog]   = useState([]);
  const [chatInput, setChatInput] = useState('');
  const voiceRef    = useRef(null);

  // ── إعداد الاتصال ──────────────────────────────────────
  useEffect(() => {
    if (!store.roomCode) { navigate('/'); return; }
    connectSignaling(store.roomCode);
    const isInit = store.isHost;
    voice.init().then(result => {
      if (result) {
        const p = createPeer(isInit, result.stream);
        p.on('stream', remote => { voiceRef.current = voice.playRemote(remote); });
      } else {
        createPeer(isInit);
      }
    });

    // استقبال البيانات
    const unsub = onData((raw) => {
      try {
        const msg = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(new TextDecoder().decode(raw));
        if (msg.type === 'chat') setChatLog(l => [...l, { from:'them', text: msg.text }]);
        if (!store.isHost) guestReceive(raw);
      } catch {
        if (!store.isHost) guestReceive(raw);
      }
    });

    return () => { unsub?.(); disconnect(); voice.stop(); };
  }, []);

  // كتم تلقائي
  useEffect(() => voice.setMuted(store.isMuted), [store.isMuted]);

  // ── تنقل بالكنترولر ───────────────────────────────────
  useController(({ type, button }) => {
    if (type !== 'button' || !button) return;
    if (button === 'up')     setFocused(f => Math.max(0, f-1));
    if (button === 'down')   setFocused(f => Math.min(MENU.length-1, f+1));
    if (button === 'cross')  handleMenuAction(focused);
    if (button === 'circle') navigate('/');
    if (button === 'triangle') store.toggleMute();
    // إرسال ضغطات اللعبة أثناء التشغيل
    if (store.emulatorRunning) sendInput({ button, pressed: true });
  });

  const handleMenuAction = async (index) => {
    switch(index) {
      case 0: await handleLaunch(); break;
      case 1: await handleSendSave(); break;
      case 2: {
        const p = await window.electronAPI?.selectSaveState?.();
        if (p) store.setISOPath(p);
        break;
      }
      case 3: store.toggleMute(); break;
      case 4: navigate('/settings'); break;
      case 5: { disconnect(); store.resetSession(); navigate('/'); break; }
    }
  };

  const handleLaunch = async () => {
    const { selectedEmulator, emulatorPath, isoPath, localIP, settings } = store;
    if (!emulatorPath) return;
    store.setEmulatorRunning(true);
    await window.electronAPI?.launchPCSX2?.({
      executablePath: emulatorPath,
      isoPath,
      networkConfig: { hostIP: localIP || '127.0.0.1', port: settings.port, isHost: store.isHost },
    });
  };

  const handleSendSave = async () => {
    const path = await window.electronAPI?.selectSaveState?.();
    if (!path) return;
    const result = await window.electronAPI?.readSaveState?.(path);
    if (result?.success) {
      const bin = Uint8Array.from(atob(result.data), c => c.charCodeAt(0)).buffer;
      await (store.isHost ? hostSend(bin) : sendSaveState(bin));
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    peer.current?.send(JSON.stringify({ type:'chat', text: chatInput }));
    setChatLog(l => [...l, { from:'me', text: chatInput }]);
    setChatInput('');
  };

  const statusColor = { idle:'bg-white/20', connecting:'bg-yellow-400 animate-pulse', connected:'bg-green-400', error:'bg-red-500' };

  return (
    <div className="min-h-screen bg-nexus-bg text-white flex flex-col" style={{ direction:'rtl' }}>

      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1"
           style={{ WebkitAppRegion:'drag' }}>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span className="font-mono text-nexus-accent font-bold">{store.roomCode}</span>
          <span>·</span>
          <span>{store.isHost ? '👑 مستضيف' : '🎮 ضيف'}</span>
        </div>
        <div className="flex gap-2" style={{ WebkitAppRegion:'no-drag' }}>
          {['minimize','maximize','close'].map((a,i) => (
            <button key={a} onClick={() => window.electronAPI?.[a+'Window']?.()}
                    className={`w-3 h-3 rounded-full opacity-60 hover:opacity-100 ${['bg-yellow-400','bg-green-400','bg-red-500'][i]}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-0">

        {/* ── القائمة الجانبية (PS5 style) ── */}
        <aside className="w-64 flex flex-col justify-center px-6 gap-1 border-l border-white/5">
          {MENU.map((item, i) => (
            <button key={i}
                    onMouseEnter={() => setFocused(i)}
                    onClick={() => handleMenuAction(i)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-150
                      ${focused === i
                        ? 'bg-white text-nexus-bg font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                    `}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
              {focused === i && <span className="mr-auto text-nexus-blue text-xs">●</span>}
            </button>
          ))}
        </aside>

        {/* ── المنطقة الرئيسية ── */}
        <main className="flex-1 flex flex-col items-center justify-center gap-8 px-10">

          {/* بطاقات اللاعبين */}
          <div className="flex gap-6">
            <PlayerCard
              role="host" label="المستضيف"
              active={store.isHost || store.connectionStatus === 'connected'}
              status={store.connectionStatus}
            />
            <div className="flex items-center text-white/20 text-2xl">⚡</div>
            <PlayerCard
              role="guest" label="الضيف"
              active={!store.isHost && store.connectionStatus === 'connected'}
              status={store.connectionStatus}
            />
          </div>

          {/* مؤشر الاتصال */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${statusColor[store.connectionStatus]}`} />
            <span className="text-white/50">
              {{ idle:'في انتظار الاتصال', connecting:'جار الاتصال...', connected:'متصل ✓', error:'خطأ في الاتصال' }[store.connectionStatus]}
            </span>
          </div>

          {/* شريط المزامنة */}
          {store.syncStatus !== 'waiting' && (
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>نقل Save State</span>
                <span>{store.syncProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-nexus-blue to-nexus-accent rounded-full transition-all duration-200"
                     style={{ width:`${store.syncProgress}%` }} />
              </div>
              {store.syncStatus === 'ready' && (
                <p className="text-green-400 text-xs text-center mt-1">✓ جاهز للبداية!</p>
              )}
            </div>
          )}
        </main>

        {/* ── الشات النصي ── */}
        <aside className="w-64 flex flex-col border-r border-white/5 px-4 py-4 gap-3">
          <h3 className="text-white/40 text-xs font-semibold tracking-wider">المحادثة</h3>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
            {chatLog.map((m,i) => (
              <div key={i} className={`text-sm px-3 py-2 rounded-lg max-w-[90%] ${
                m.from==='me' ? 'bg-nexus-blue/20 self-start' : 'bg-white/5 self-end'
              }`}>{m.text}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={chatInput}
                   onChange={e => setChatInput(e.target.value)}
                   onKeyDown={e => e.key==='Enter' && sendChat()}
                   placeholder="اكتب..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-nexus-accent/50"
            />
            <button onClick={sendChat}
                    className="px-3 py-2 bg-nexus-blue/20 rounded-lg hover:bg-nexus-blue/40 transition-colors text-sm">
              ➤
            </button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-3 pt-2 flex items-center justify-between text-white/25 text-xs border-t border-white/5">
        <span>✕ عودة &nbsp; △ كتم الصوت &nbsp; □ Save State</span>
        <span className="flex items-center gap-1">
          {store.isMuted ? '🔇' : '🎙'}
          {store.isMuted ? 'مكتوم' : 'نشط'}
        </span>
      </footer>
    </div>
  );
}

function PlayerCard({ role, label, active, status }) {
  return (
    <div className={`
      w-36 h-44 rounded-2xl border flex flex-col items-center justify-center gap-3
      transition-all duration-500
      ${active
        ? 'border-nexus-accent/50 bg-nexus-accent/5 shadow-[0_0_20px_rgba(0,168,255,0.15)]'
        : 'border-white/10 bg-white/3'
      }
    `}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl
        ${active ? 'bg-nexus-blue/20' : 'bg-white/5'}`}>
        {role === 'host' ? '👑' : '🎮'}
      </div>
      <span className="text-sm font-medium text-white/70">{label}</span>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
=======
import { useFrameSync } from '../hooks/useFrameSync';
import { useVoiceChat } from '../hooks/useVoiceChat';
import StatusPill from '../components/ui/StatusPill';
import SyncProgress from '../components/overlay/SyncProgress';
import VoiceIndicator from '../components/overlay/VoiceIndicator';
import HostPanel from '../components/lobby/HostPanel';
import GuestPanel from '../components/lobby/GuestPanel';

const MAX_SLOTS = 4;

// ── Player slot colors ────────────────────────────────────────────────────────
const SLOT_COLORS = [
  { accent: '#0078d4', glow: 'rgba(0,120,212,0.3)',  label: 'P1', icon: '👑' },
  { accent: '#7c3aed', glow: 'rgba(124,58,237,0.3)', label: 'P2', icon: '🎮' },
  { accent: '#059669', glow: 'rgba(5,150,105,0.3)',  label: 'P3', icon: '🕹' },
  { accent: '#d97706', glow: 'rgba(217,119,6,0.3)',  label: 'P4', icon: '🎯' },
];

// ── 4-Player slot grid ────────────────────────────────────────────────────────
function PlayerGrid({ localPlayerId, peers, settings }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {Array.from({ length: MAX_SLOTS }, (_, slotId) => {
        const isMe = localPlayerId === slotId;
        const peer = peers.find(p => p.id === slotId);
        const occupied = isMe || (peer && peer.connected);
        const cfg = SLOT_COLORS[slotId];
        const name = isMe ? (settings.playerName || 'أنت') : (peer?.name || `Player ${slotId + 1}`);
        return (
          <div key={slotId} style={{
            padding:      '12px 14px',
            borderRadius: 14,
            background:   occupied ? `${cfg.accent}12` : 'rgba(255,255,255,0.03)',
            border:       `1px solid ${occupied ? `${cfg.accent}50` : 'rgba(255,255,255,0.07)'}`,
            boxShadow:    occupied ? `0 0 18px ${cfg.glow}` : 'none',
            transition:   'all 300ms ease',
            display:      'flex', alignItems: 'center', gap: 10,
          }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background:  occupied ? `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}88)` : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: occupied ? `0 0 12px ${cfg.glow}` : 'none',
              transition: 'all 300ms ease',
            }}>
              {occupied ? cfg.icon : ''}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                  color: occupied ? cfg.accent : 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                }}>
                  {cfg.label}
                </span>
                {occupied && (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#22c55e',
                    animation: 'dotPulse 1.5s infinite',
                  }} />
                )}
              </div>
              <div style={{
                fontSize: '0.85rem', fontWeight: 600,
                color: occupied ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {occupied ? name : (isMe === false && peer === undefined ? 'فارغ…' : name)}
              </div>
            </div>

            {/* Status */}
            <div style={{ fontSize: '0.7rem', color: occupied ? '#22c55e' : 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
              {occupied ? (isMe ? 'أنت' : '✓') : '···'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ messages, input, onInputChange, onSend }) {
  const endRef = React.useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, background:'rgba(255,255,255,0.03)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:14, height:'100%' }}>
      <div style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.5)' }}>💬 الشات ({messages.length})</div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:'0.78rem', marginTop:24 }}>لا توجد رسائل</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={{ padding:'7px 10px', borderRadius:9, background:'rgba(255,255,255,0.05)', textAlign:'right' }}>
            <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginBottom:2 }}>{msg.sender} · {msg.ts}</div>
            <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.85)' }}>{msg.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <input id="chat-input" className="input" value={input} onChange={e=>onInputChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onSend()} placeholder="رسالة…" style={{ flex:1, padding:'8px 12px', fontSize:'0.85rem' }} />
        <button id="chat-send-btn" onClick={onSend} style={{ padding:'8px 13px', borderRadius:10, border:'none', background:'#0078d4', color:'#fff', cursor:'pointer', fontSize:'0.85rem' }}>↑</button>
      </div>
    </div>
  );
}

// ── Main Lobby Page ───────────────────────────────────────────────────────────
export default function Lobby() {
  const navigate = useNavigate();
  const {
    connectionStatus, isHost, roomCode, syncStatus, syncProgress,
    isMuted, toggleMute, selectedEmulator, emulatorPath, isoPath,
    setConnectionStatus, chatMessages, addChatMessage, settings,
    peers, localPlayerId, maxPlayers,
  } = useNexusStore();

  const { connectSignaling, broadcast, sendChat, onData, disconnect, peers: peersRef, myId } = useP2P();
  const { initMicrophone, playRemoteAudio, voiceLevel, stopMicrophone } = useVoiceChat();
  const [focusedBtn, setFocusedBtn] = useState(0);
  const [chatInput, setChatInput]   = useState('');
  const [showChat, setShowChat]     = useState(false);

  const connectedCount = peers.filter(p => p.connected).length;
  const totalInRoom    = connectedCount + 1; // +1 for ourselves

  // ── Launch game ───────────────────────────────────────────────────────────
  const handleGameReady = useCallback(async () => {
    if (!window.electronAPI) return;
    const cfg = { executablePath: emulatorPath, isoPath, networkConfig: { hostIP: '127.0.0.1', port: 7500, isHost } };
    const em = selectedEmulator || 'pcsx2';
    if (em === 'pcsx2')   await window.electronAPI.launchPCSX2(cfg);
    if (em === 'dolphin') await window.electronAPI.launchDolphin(cfg);
    if (em === 'ppsspp')  await window.electronAPI.launchPPSSPP(cfg);
  }, [emulatorPath, isoPath, isHost, selectedEmulator]);

  const { hostSendAndWait, guestReceiveAndWait, hostHandleAck } = useFrameSync(peersRef, handleGameReady);

  // ── Data handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onData((msg, bin, fromId) => {
      if (msg) {
        if (msg.type === 'sync_ack' && isHost)  hostHandleAck(msg);
        if (!isHost) guestReceiveAndWait(msg, null);
      }
      if (bin && !isHost) guestReceiveAndWait(null, bin);
    });
    return unsub;
  }, [onData, isHost, hostHandleAck, guestReceiveAndWait]);

  // ── Connect on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    setConnectionStatus('connecting');
    connectSignaling(roomCode);
    setTimeout(() => {
      initMicrophone().then(stream => {
        // Stream is handled inside useP2P when peer connects
      });
    }, 600);
  }, [roomCode, isHost]);

  useEffect(() => () => { disconnect(); stopMicrophone(); }, []);

  // ── PS5 menu items ────────────────────────────────────────────────────────
  const menuItems = isHost
    ? ['🚀 ابدأ اللعبة', isMuted ? '🔇 فك الكتم' : '🎙 كتم الصوت', '💬 الشات', '🔙 خروج']
    : ['💬 الشات', isMuted ? '🔇 فك الكتم' : '🎙 كتم الصوت', '🔙 خروج'];

  useController(({ button }) => {
    if (button === 'down')   setFocusedBtn(i => Math.min(i+1, menuItems.length-1));
    if (button === 'up')     setFocusedBtn(i => Math.max(i-1, 0));
    if (button === 'circle') navigate('/');
    if (button === 'cross') {
      const lbl = menuItems[focusedBtn];
      if (lbl?.includes('كتم') || lbl?.includes('فك')) toggleMute();
      if (lbl?.includes('خروج')) navigate('/');
      if (lbl?.includes('شات')) setShowChat(s => !s);
      if (lbl?.includes('ابدأ')) handleGameReady();
    }
  });

  const handleGuestJoin = (code) => {
    setConnectionStatus('connecting');
    connectSignaling(code);
  };

  const sendChatMsg = () => {
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    addChatMessage({ sender: settings.playerName || 'أنت', text: chatInput.trim() });
    setChatInput('');
  };

  return (
    <div className="page" style={{ paddingTop: 40 }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 40px 0' }}>
        <button id="lobby-back-btn" onClick={()=>navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
          ← رجوع
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'0.72rem', letterSpacing:'0.2em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:3 }}>
            {isHost ? 'المستضيف' : 'الضيف'} · {selectedEmulator?.toUpperCase() || 'Nexus'}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'1rem', fontWeight:700 }}>غرفة اللعب</span>
            {/* Player count badge */}
            <div style={{
              padding:'2px 10px', borderRadius:99, fontSize:'0.75rem', fontWeight:700,
              background: totalInRoom === maxPlayers ? 'rgba(34,197,94,0.15)' : 'rgba(0,120,212,0.15)',
              border: `1px solid ${totalInRoom === maxPlayers ? 'rgba(34,197,94,0.4)' : 'rgba(0,120,212,0.3)'}`,
              color: totalInRoom === maxPlayers ? '#22c55e' : '#3d9bff',
            }}>
              {totalInRoom}/{maxPlayers} لاعبين
            </div>
          </div>
        </div>
        <StatusPill status={connectionStatus} />
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main style={{ flex:1, display:'flex', gap:20, padding:'20px 40px', overflow:'hidden' }}>

        {/* Left — 4-player grid + sync */}
        <div style={{ display:'flex', flexDirection:'column', gap:14, width:320, flexShrink:0 }}>
          <div style={{ fontSize:'0.72rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', fontWeight:600 }}>
            اللاعبون
          </div>
          <PlayerGrid
            localPlayerId={localPlayerId ?? (isHost ? 0 : null)}
            peers={peers}
            settings={settings}
          />
          {syncStatus !== 'waiting' && (
            <SyncProgress progress={syncProgress} status={syncStatus} />
          )}
        </div>

        {/* Center — PS5 menu */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:10, maxWidth:360, margin:'0 auto' }}>
          {menuItems.map((label, i) => (
            <button
              key={label}
              id={`lobby-menu-${i}`}
              onMouseEnter={() => setFocusedBtn(i)}
              onClick={() => {
                setFocusedBtn(i);
                if (label.includes('كتم') || label.includes('فك')) toggleMute();
                if (label.includes('خروج')) navigate('/');
                if (label.includes('شات')) setShowChat(s => !s);
                if (label.includes('ابدأ')) handleGameReady();
              }}
              style={{
                position:'relative', padding:'15px 24px', borderRadius:12,
                fontSize:'0.95rem', fontWeight:500, textAlign:'right', cursor:'pointer',
                transition:'all 180ms ease', fontFamily:'inherit',
                border:     focusedBtn===i ? 'none' : '1px solid rgba(255,255,255,0.08)',
                background: focusedBtn===i ? '#ffffff' : 'rgba(255,255,255,0.05)',
                color:      focusedBtn===i ? '#07071a' : 'rgba(255,255,255,0.75)',
                boxShadow:  focusedBtn===i ? '0 0 32px rgba(255,255,255,0.2)' : 'none',
                transform:  focusedBtn===i ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {focusedBtn===i && (
                <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#0078d4', fontWeight:700 }}>▶</span>
              )}
              {label}
            </button>
          ))}
        </div>

        {/* Right — Panel or Chat */}
        <div style={{ width:300, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }}>
          {showChat
            ? <ChatPanel messages={chatMessages} input={chatInput} onInputChange={setChatInput} onSend={sendChatMsg} />
            : isHost
              ? <HostPanel onLaunch={handleGameReady} />
              : <GuestPanel onJoin={handleGuestJoin} />
          }
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ padding:'12px 40px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.78rem', color:'rgba(255,255,255,0.3)' }}>
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          <span>رمز الغرفة: <span style={{ fontFamily:'var(--font-mono)', color:'rgba(255,255,255,0.65)', letterSpacing:'0.15em' }}>{roomCode||'------'}</span></span>
          <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
          <span>ID: <span style={{ fontFamily:'var(--font-mono)', color: localPlayerId !== null ? SLOT_COLORS[localPlayerId]?.accent : 'rgba(255,255,255,0.3)' }}>P{(localPlayerId ?? '?') + 1}</span></span>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          <span>△ ابدأ</span><span>○ رجوع</span><span>× تأكيد</span>
        </div>
      </footer>

      <VoiceIndicator voiceLevel={voiceLevel} />
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
    </div>
  );
}
