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
      await new Promise(r => setTimeout(r, 8));
    }
  }, [setSyncProgress]);

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
}
