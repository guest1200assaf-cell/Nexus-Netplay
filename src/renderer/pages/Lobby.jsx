// ─── Lobby Page — 4-Player PS5-style ────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';
import { useP2P } from '../hooks/useP2P';
import { useController } from '../hooks/useController';
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
    </div>
  );
}
