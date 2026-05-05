// ─── useFrameSync — Save-State sync protocol ────────────────────────────────
import { useRef, useCallback } from 'react';
import { useNexusStore } from '../store/nexusStore';

const CHUNK = 64 * 1024;

/**
 * HOST:  hostSendAndWait(saveStateBuffer)
 *   1. Sends sync_start  →  splits buffer into chunks  →  waits for sync_ack
 *   2. On ack → sends sync_go → calls onReadyToStart()
 *
 * GUEST: guestReceiveAndWait(rawData)
 *   1. Receives sync_start  →  accumulates chunks  →  assembles buffer
 *   2. Loads save-state via electronAPI  →  sends sync_ack
 *   3. On sync_go → calls onReadyToStart()
 */
export function useFrameSync(peerRef, onReadyToStart) {
  const receivedChunks = useRef([]);
  const expectedChunks = useRef(0);
  const receivedCount  = useRef(0);
  const waitingForAck  = useRef(false);

  const { setSyncProgress } = useNexusStore();

  // ── Host side ─────────────────────────────────────────────────────────────
  const hostSendAndWait = useCallback(async (saveStateBuffer) => {
    const peer = peerRef.current;
    if (!peer?.connected) return;

    const totalChunks = Math.ceil(saveStateBuffer.byteLength / CHUNK);
    peer.send(JSON.stringify({ type: 'sync_start', totalChunks }));

    for (let i = 0; i < totalChunks; i++) {
      peer.send(saveStateBuffer.slice(i * CHUNK, (i + 1) * CHUNK));
      setSyncProgress(Math.round(((i + 1) / totalChunks) * 85));
      await new Promise(r => setTimeout(r, 8));
    }

    setSyncProgress(90);
    waitingForAck.current = true;
    console.log('[FrameSync] Host: waiting for ACK…');
  }, [peerRef, setSyncProgress]);

  // ── Guest side ────────────────────────────────────────────────────────────
  const guestReceiveAndWait = useCallback(async (msg, binaryChunk) => {
    // JSON message
    if (msg) {
      if (msg.type === 'sync_start') {
        expectedChunks.current = msg.totalChunks;
        receivedChunks.current = [];
        receivedCount.current  = 0;
        setSyncProgress(0);
        console.log('[FrameSync] Guest: expecting', msg.totalChunks, 'chunks');
        return;
      }

      if (msg.type === 'sync_go') {
        console.log('[FrameSync] Guest: received GO — starting game');
        setSyncProgress(100);
        onReadyToStart?.();
        return;
      }
    }

    // Binary chunk
    if (binaryChunk && expectedChunks.current > 0) {
      receivedChunks.current.push(binaryChunk);
      receivedCount.current++;
      setSyncProgress(Math.round((receivedCount.current / expectedChunks.current) * 85));

      if (receivedCount.current >= expectedChunks.current) {
        // Assemble all chunks
        const totalSize = receivedChunks.current.reduce((a, c) => a + c.byteLength, 0);
        const assembled = new Uint8Array(totalSize);
        let offset = 0;
        for (const chunk of receivedChunks.current) {
          assembled.set(new Uint8Array(chunk), offset);
          offset += chunk.byteLength;
        }

        setSyncProgress(92);

        // Load save-state via Electron IPC
        try {
          await window.electronAPI?.loadSaveState(assembled.buffer);
        } catch (e) {
          console.warn('[FrameSync] loadSaveState not available (dev mode)');
        }

        setSyncProgress(98);

        // Send ACK to host
        peerRef.current?.send(JSON.stringify({ type: 'sync_ack' }));
        console.log('[FrameSync] Guest: ACK sent');
      }
    }
  }, [peerRef, setSyncProgress, onReadyToStart]);

  // ── Host: handle incoming ACK ─────────────────────────────────────────────
  const hostHandleAck = useCallback((msg) => {
    if (msg?.type === 'sync_ack' && waitingForAck.current) {
      waitingForAck.current = false;
      setSyncProgress(100);

      // Send GO signal
      peerRef.current?.send(JSON.stringify({ type: 'sync_go' }));
      console.log('[FrameSync] Host: GO sent');
      onReadyToStart?.();
    }
  }, [peerRef, setSyncProgress, onReadyToStart]);

  return { hostSendAndWait, guestReceiveAndWait, hostHandleAck };
}
