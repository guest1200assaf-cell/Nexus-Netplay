<<<<<<< HEAD
// src/renderer/hooks/useP2P.js
import { useRef, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { useNexusStore } from '../store/nexusStore';

const CHUNK = 64 * 1024; // 64 KB

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

export function useP2P() {
  const peerRef      = useRef(null);
  const signalingRef = useRef(null);
  const dataHandlers = useRef([]);

  const { setConnectionStatus, setSyncProgress, addPeer, roomCode } = useNexusStore();

  // ── خادم الإشارة المحلي ──────────────────────────────
  const connectSignaling = useCallback((code) => {
    const ws = new WebSocket('ws://localhost:7331');
    signalingRef.current = ws;

    ws.onopen  = () => ws.send(JSON.stringify({ type: 'join', roomCode: code }));
    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'signal' && peerRef.current) peerRef.current.signal(msg.data);
      if (msg.type === 'peer_joined' && peerRef.current?.initiator) {
        // لا شيء — SimplePeer يبدأ تلقائياً
      }
    };
    ws.onerror = (e) => console.error('[WS]', e);
    return ws;
  }, []);

  // ── إنشاء Peer ───────────────────────────────────────
  const createPeer = useCallback((isInitiator, mediaStream = null) => {
    if (peerRef.current) { peerRef.current.destroy(); }

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle:   true,
      stream:    mediaStream,
      config:    { iceServers: ICE_SERVERS },
    });

    peer.on('signal', data => {
      signalingRef.current?.readyState === WebSocket.OPEN &&
        signalingRef.current.send(JSON.stringify({ type: 'signal', data }));
    });

    peer.on('connect', () => {
      console.log('✅ P2P متصل!');
      setConnectionStatus('connected');
      addPeer({ id: Date.now(), connected: true });
    });

    peer.on('data',  data => dataHandlers.current.forEach(fn => fn(data)));
    peer.on('close', ()   => setConnectionStatus('idle'));
    peer.on('error', err  => { console.error('[P2P]', err); setConnectionStatus('error'); });

    peerRef.current = peer;
    return peer;
  }, [setConnectionStatus, addPeer]);

  // ── إرسال ضغطات الأزرار ─────────────────────────────
  const sendInput = useCallback((input) => {
    if (!peerRef.current?.connected) return;
    peerRef.current.send(JSON.stringify({ type: 'input', ...input }));
  }, []);

  // ── إرسال Save State مجزأ ───────────────────────────
  const sendSaveState = useCallback(async (fileBuffer) => {
    if (!peerRef.current?.connected) return;
    const total = Math.ceil(fileBuffer.byteLength / CHUNK);

    peerRef.current.send(JSON.stringify({ type: 'savestate_start', total, size: fileBuffer.byteLength }));

    for (let i = 0; i < total; i++) {
      peerRef.current.send(fileBuffer.slice(i * CHUNK, (i + 1) * CHUNK));
      setSyncProgress(Math.round(((i + 1) / total) * 90));
=======
// ─── useP2P — Mesh WebRTC for up to 4 players ───────────────────────────────
import { useEffect, useRef, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { useNexusStore } from '../store/nexusStore';

const CHUNK_SIZE  = 64 * 1024;
const MAX_PLAYERS = 4;

/**
 * Full-mesh topology: each player maintains a direct P2P connection
 * to every other player. With 4 players that's 6 simultaneous connections.
 *
 * peersRef: Map<peerId:number, SimplePeer>
 */
export function useP2P() {
  const peersRef      = useRef(new Map());   // peerId → SimplePeer
  const signalingRef  = useRef(null);
  const myIdRef       = useRef(null);
  const dataHandlers  = useRef([]);

  const {
    setConnectionStatus, setSyncProgress,
    addPeer, removePeer, addChatMessage, setLocalPlayerId,
  } = useNexusStore();

  // ── Signaling ──────────────────────────────────────────────────────────────
  const connectSignaling = useCallback((roomCode) => {
    if (signalingRef.current?.readyState === WebSocket.OPEN) return signalingRef.current;

    const ws = new WebSocket('ws://localhost:7331');
    signalingRef.current = ws;

    ws.onopen = () => {
      console.log('[Signaling] Connected → joining room:', roomCode);
      ws.send(JSON.stringify({ type: 'join', roomCode }));
    };

    ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      // ── Assigned our seat ─────────────────────────────────────────────
      if (msg.type === 'joined') {
        myIdRef.current = msg.playerId;
        setLocalPlayerId?.(msg.playerId);
        console.log(`[P2P] I am player #${msg.playerId}, existing: [${msg.existingPeers}]`);

        // Initiate connections TO all existing peers (we are the newcomer)
        msg.existingPeers.forEach((peerId) => {
          _createPeerConnection(peerId, true);  // we initiate
        });
      }

      // ── New peer joined — they will initiate to us ─────────────────────
      if (msg.type === 'peer_joined') {
        console.log(`[P2P] New player #${msg.newPeerId} joined (total: ${msg.playerCount})`);
        addPeer({ id: msg.newPeerId, connected: false, name: `Player ${msg.newPeerId + 1}` });
        // They initiate to us, so we just wait for their signal
        _createPeerConnection(msg.newPeerId, false);
      }

      // ── Routed signal ─────────────────────────────────────────────────
      if (msg.type === 'signal') {
        const peer = peersRef.current.get(msg.from);
        if (peer && !peer.destroyed) {
          peer.signal(msg.data);
        } else {
          // Peer object might not exist yet — create it
          const p = _createPeerConnection(msg.from, false);
          p.signal(msg.data);
        }
      }

      // ── Peer disconnected ─────────────────────────────────────────────
      if (msg.type === 'peer_left') {
        const peer = peersRef.current.get(msg.peerId);
        if (peer) { peer.destroy(); peersRef.current.delete(msg.peerId); }
        removePeer(msg.peerId);
        console.log(`[P2P] Player #${msg.peerId} disconnected`);
        if (peersRef.current.size === 0) setConnectionStatus('idle');
      }

      // ── Chat relay from signaling ─────────────────────────────────────
      if (msg.type === 'chat') {
        addChatMessage({ sender: `Player ${msg.from + 1}`, text: msg.text });
      }
    };

    ws.onerror = (e) => console.error('[Signaling] error', e);
    ws.onclose = ()  => console.log('[Signaling] closed');

    return ws;
  }, [addPeer, removePeer, setConnectionStatus, addChatMessage]);

  // ── Create a single peer connection ──────────────────────────────────────
  const _createPeerConnection = useCallback((peerId, initiator) => {
    if (peersRef.current.has(peerId)) {
      const existing = peersRef.current.get(peerId);
      if (!existing.destroyed) return existing;
    }

    console.log(`[P2P] Creating peer → #${peerId} (initiator: ${initiator})`);

    const peer = new SimplePeer({
      initiator,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (data) => {
      const ws = signalingRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'signal', to: peerId, data }));
      }
    });

    peer.on('connect', () => {
      console.log(`[P2P] ✅ Connected to player #${peerId}`);
      addPeer({ id: peerId, connected: true, name: `Player ${peerId + 1}` });
      setConnectionStatus('connected');
    });

    peer.on('data', (raw) => {
      try {
        const text = raw instanceof Uint8Array ? new TextDecoder().decode(raw) : raw;
        const msg  = JSON.parse(text);
        dataHandlers.current.forEach(h => h(msg, null, peerId));
        if (msg.type === 'chat') addChatMessage({ sender: `Player ${peerId + 1}`, text: msg.text });
      } catch {
        const buf = raw instanceof Uint8Array ? raw.buffer : raw;
        dataHandlers.current.forEach(h => h(null, buf, peerId));
      }
    });

    peer.on('stream', (remoteStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.autoplay  = true;
      audio.volume    = 1.0;
      document.body.appendChild(audio);
      audio.play().catch(console.warn);
    });

    peer.on('close', () => {
      console.log(`[P2P] Peer #${peerId} closed`);
      peersRef.current.delete(peerId);
      removePeer(peerId);
      if (peersRef.current.size === 0) setConnectionStatus('idle');
    });

    peer.on('error', (err) => {
      console.error(`[P2P] Error with peer #${peerId}:`, err.message);
    });

    peersRef.current.set(peerId, peer);
    return peer;
  }, [addPeer, removePeer, setConnectionStatus, addChatMessage]);

  // ── Broadcast to ALL connected peers ──────────────────────────────────────
  const broadcast = useCallback((msg) => {
    const data = JSON.stringify(msg);
    let sent = 0;
    peersRef.current.forEach((peer) => {
      if (peer.connected && !peer.destroyed) { peer.send(data); sent++; }
    });
    return sent;
  }, []);

  // ── Send to a specific peer ───────────────────────────────────────────────
  const sendToPeer = useCallback((peerId, msg) => {
    const peer = peersRef.current.get(peerId);
    if (peer?.connected) peer.send(JSON.stringify(msg));
  }, []);

  // ── Chat (via signaling server for reliability) ───────────────────────────
  const sendChat = useCallback((text) => {
    const ws = signalingRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'chat', text }));
    }
    // Also try direct P2P
    broadcast({ type: 'chat', text });
  }, [broadcast]);

  // ── Input broadcast ───────────────────────────────────────────────────────
  const sendInput = useCallback((inputData) => {
    broadcast({ type: 'input', ...inputData });
  }, [broadcast]);

  // ── Save-state send to all ────────────────────────────────────────────────
  const sendSaveState = useCallback(async (fileBuffer) => {
    const connectedPeers = [...peersRef.current.entries()]
      .filter(([, p]) => p.connected && !p.destroyed);
    if (connectedPeers.length === 0) return;

    const total = Math.ceil(fileBuffer.byteLength / CHUNK_SIZE);

    connectedPeers.forEach(([, peer]) => {
      peer.send(JSON.stringify({ type: 'savestate_start', totalChunks: total, size: fileBuffer.byteLength }));
    });

    for (let i = 0; i < total; i++) {
      const chunk = fileBuffer.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      connectedPeers.forEach(([, peer]) => { if (peer.connected) peer.send(chunk); });
      setSyncProgress(Math.round(((i + 1) / total) * 100));
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
      await new Promise(r => setTimeout(r, 8));
    }
  }, [setSyncProgress]);

<<<<<<< HEAD
  // ── تسجيل معالج بيانات ──────────────────────────────
  const onData = useCallback((fn) => {
    dataHandlers.current.push(fn);
    return () => { dataHandlers.current = dataHandlers.current.filter(h => h !== fn); };
  }, []);

  const disconnect = useCallback(() => {
    peerRef.current?.destroy();
    signalingRef.current?.close();
    setConnectionStatus('idle');
  }, [setConnectionStatus]);

  return { createPeer, connectSignaling, sendInput, sendSaveState, onData, disconnect, peer: peerRef };
=======
  // ── Register a data handler ───────────────────────────────────────────────
  const onData = useCallback((handler) => {
    dataHandlers.current.push(handler);
    return () => { dataHandlers.current = dataHandlers.current.filter(h => h !== handler); };
  }, []);

  // ── Disconnect all ────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    peersRef.current.forEach(p => p.destroy());
    peersRef.current.clear();
    signalingRef.current?.close();
    signalingRef.current = null;
    myIdRef.current = null;
    setConnectionStatus('idle');
  }, [setConnectionStatus]);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    connectSignaling,
    broadcast,
    sendToPeer,
    sendInput,
    sendChat,
    sendSaveState,
    onData,
    disconnect,
    peers:  peersRef,
    myId:   myIdRef,
  };
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
}
