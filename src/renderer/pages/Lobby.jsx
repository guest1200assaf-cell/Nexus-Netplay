// src/renderer/pages/Lobby.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexusStore } from '../store/nexusStore';
import { useP2P } from '../hooks/useP2P';
import { useController } from '../hooks/useController';
import { useVoiceChat, useFrameSync } from '../hooks/useController';

const MENU = [
  { icon:'ًںڑ€', label:'طھط´ط؛ظٹظ„ ط§ظ„ظ„ط¹ط¨ط©' },
  { icon:'ًں“¤', label:'ط¥ط±ط³ط§ظ„ Save State' },
  { icon:'ًں“¥', label:'طھط­ظ…ظٹظ„ Save State' },
  { icon:'ًںژ™', label:'ط§ظ„ط´ط§طھ ط§ظ„طµظˆطھظٹ' },
  { icon:'âڑ™ï¸ڈ', label:'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ' },
  { icon:'ًںڈ ', label:'ط§ظ„ط®ط±ظˆط¬' },
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

  // â”€â”€ ط¥ط¹ط¯ط§ط¯ ط§ظ„ط§طھطµط§ظ„ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // ط§ط³طھظ‚ط¨ط§ظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ
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

  // ظƒطھظ… طھظ„ظ‚ط§ط¦ظٹ
  useEffect(() => voice.setMuted(store.isMuted), [store.isMuted]);

  // â”€â”€ طھظ†ظ‚ظ„ ط¨ط§ظ„ظƒظ†طھط±ظˆظ„ط± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useController(({ type, button }) => {
    if (type !== 'button' || !button) return;
    if (button === 'up')     setFocused(f => Math.max(0, f-1));
    if (button === 'down')   setFocused(f => Math.min(MENU.length-1, f+1));
    if (button === 'cross')  handleMenuAction(focused);
    if (button === 'circle') navigate('/');
    if (button === 'triangle') store.toggleMute();
    // ط¥ط±ط³ط§ظ„ ط¶ط؛ط·ط§طھ ط§ظ„ظ„ط¹ط¨ط© ط£ط«ظ†ط§ط، ط§ظ„طھط´ط؛ظٹظ„
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
          <span>آ·</span>
          <span>{store.isHost ? 'ًں‘‘ ظ…ط³طھط¶ظٹظپ' : 'ًںژ® ط¶ظٹظپ'}</span>
        </div>
        <div className="flex gap-2" style={{ WebkitAppRegion:'no-drag' }}>
          {['minimize','maximize','close'].map((a,i) => (
            <button key={a} onClick={() => window.electronAPI?.[a+'Window']?.()}
                    className={`w-3 h-3 rounded-full opacity-60 hover:opacity-100 ${['bg-yellow-400','bg-green-400','bg-red-500'][i]}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-0">

        {/* â”€â”€ ط§ظ„ظ‚ط§ط¦ظ…ط© ط§ظ„ط¬ط§ظ†ط¨ظٹط© (PS5 style) â”€â”€ */}
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
              {focused === i && <span className="mr-auto text-nexus-blue text-xs">â—ڈ</span>}
            </button>
          ))}
        </aside>

        {/* â”€â”€ ط§ظ„ظ…ظ†ط·ظ‚ط© ط§ظ„ط±ط¦ظٹط³ظٹط© â”€â”€ */}
        <main className="flex-1 flex flex-col items-center justify-center gap-8 px-10">

          {/* ط¨ط·ط§ظ‚ط§طھ ط§ظ„ظ„ط§ط¹ط¨ظٹظ† */}
          <div className="flex gap-6">
            <PlayerCard
              role="host" label="ط§ظ„ظ…ط³طھط¶ظٹظپ"
              active={store.isHost || store.connectionStatus === 'connected'}
              status={store.connectionStatus}
            />
            <div className="flex items-center text-white/20 text-2xl">âڑ،</div>
            <PlayerCard
              role="guest" label="ط§ظ„ط¶ظٹظپ"
              active={!store.isHost && store.connectionStatus === 'connected'}
              status={store.connectionStatus}
            />
          </div>

          {/* ظ…ط¤ط´ط± ط§ظ„ط§طھطµط§ظ„ */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${statusColor[store.connectionStatus]}`} />
            <span className="text-white/50">
              {{ idle:'ظپظٹ ط§ظ†طھط¸ط§ط± ط§ظ„ط§طھطµط§ظ„', connecting:'ط¬ط§ط± ط§ظ„ط§طھطµط§ظ„...', connected:'ظ…طھطµظ„ âœ“', error:'ط®ط·ط£ ظپظٹ ط§ظ„ط§طھطµط§ظ„' }[store.connectionStatus]}
            </span>
          </div>

          {/* ط´ط±ظٹط· ط§ظ„ظ…ط²ط§ظ…ظ†ط© */}
          {store.syncStatus !== 'waiting' && (
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>ظ†ظ‚ظ„ Save State</span>
                <span>{store.syncProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-nexus-blue to-nexus-accent rounded-full transition-all duration-200"
                     style={{ width:`${store.syncProgress}%` }} />
              </div>
              {store.syncStatus === 'ready' && (
                <p className="text-green-400 text-xs text-center mt-1">âœ“ ط¬ط§ظ‡ط² ظ„ظ„ط¨ط¯ط§ظٹط©!</p>
              )}
            </div>
          )}
        </main>

        {/* â”€â”€ ط§ظ„ط´ط§طھ ط§ظ„ظ†طµظٹ â”€â”€ */}
        <aside className="w-64 flex flex-col border-r border-white/5 px-4 py-4 gap-3">
          <h3 className="text-white/40 text-xs font-semibold tracking-wider">ط§ظ„ظ…ط­ط§ط¯ط«ط©</h3>
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
                   placeholder="ط§ظƒطھط¨..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-nexus-accent/50"
            />
            <button onClick={sendChat}
                    className="px-3 py-2 bg-nexus-blue/20 rounded-lg hover:bg-nexus-blue/40 transition-colors text-sm">
              â‍¤
            </button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-3 pt-2 flex items-center justify-between text-white/25 text-xs border-t border-white/5">
        <span>âœ• ط¹ظˆط¯ط© &nbsp; â–³ ظƒطھظ… ط§ظ„طµظˆطھ &nbsp; â–، Save State</span>
        <span className="flex items-center gap-1">
          {store.isMuted ? 'ًں”‡' : 'ًںژ™'}
          {store.isMuted ? 'ظ…ظƒطھظˆظ…' : 'ظ†ط´ط·'}
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
        {role === 'host' ? 'ًں‘‘' : 'ًںژ®'}
      </div>
      <span className="text-sm font-medium text-white/70">{label}</span>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
    </div>
  );
}
