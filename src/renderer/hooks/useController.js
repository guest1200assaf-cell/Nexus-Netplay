<<<<<<< HEAD
// src/renderer/hooks/useController.js
import { useEffect, useRef, useCallback } from 'react';

const BTN = {
  0:'cross',1:'circle',2:'square',3:'triangle',
  4:'l1',5:'r1',6:'l2',7:'r2',
  8:'share',9:'options',10:'l3',11:'r3',
  12:'up',13:'down',14:'left',15:'right',16:'ps',
};

export function useController(onInput) {
  const frame = useRef(null);
  const prev  = useRef({});

  const poll = useCallback(() => {
    const gp = navigator.getGamepads()[0];
    if (gp) {
      gp.buttons.forEach((btn, i) => {
        const name = BTN[i];
        if (!name) return;
        if (btn.pressed !== (prev.current[name] || false)) {
          onInput?.({ type:'button', button: name, pressed: btn.pressed, value: btn.value });
          prev.current[name] = btn.pressed;
        }
      });
      if (gp.axes.length >= 4) {
        onInput?.({ type:'axes', lx: gp.axes[0], ly: gp.axes[1], rx: gp.axes[2], ry: gp.axes[3] });
      }
    }
    frame.current = requestAnimationFrame(poll);
  }, [onInput]);

  useEffect(() => {
    frame.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame.current);
  }, [poll]);
}

// ─────────────────────────────────────────────────────────────────────────────

// src/renderer/hooks/useVoiceChat.js — exported separately below
export function useVoiceChat() {
  const streamRef   = useRef(null);
  const ctxRef      = useRef(null);

  const init = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true },
        video: false,
      });
      streamRef.current = s;

      // Analyser للـ UI
      ctxRef.current = new AudioContext();
      const analyser = ctxRef.current.createAnalyser();
      analyser.fftSize = 256;
      ctxRef.current.createMediaStreamSource(s).connect(analyser);

      return { stream: s, analyser };
    } catch (e) {
      console.error('[Voice]', e.message);
      return null;
    }
  }, []);

  const playRemote = useCallback((remoteStream) => {
    const a = new Audio();
    a.srcObject = remoteStream;
    a.autoplay  = true;
    document.body.appendChild(a);
    a.play().catch(console.error);
    return a;
  }, []);

  const setMuted = useCallback((muted) => {
    streamRef.current?.getAudioTracks().forEach(t => t.enabled = !muted);
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    ctxRef.current?.close();
  }, []);

  return { init, playRemote, setMuted, stop, streamRef };
}

// ─────────────────────────────────────────────────────────────────────────────

// src/renderer/hooks/useFrameSync.js — exported separately below
export function useFrameSync(peerRef, onReady) {
  const chunks   = useRef([]);
  const expected = useRef(0);

  const hostSend = useCallback(async (buffer) => {
    const p     = peerRef.current;
    const total = Math.ceil(buffer.byteLength / (64*1024));
    p.send(JSON.stringify({ type:'sync_start', total }));

    for (let i = 0; i < total; i++) {
      p.send(buffer.slice(i*64*1024, (i+1)*64*1024));
      await new Promise(r => setTimeout(r, 8));
    }

    // انتظار ACK
    const handler = (data) => {
      try {
        const m = JSON.parse(data);
        if (m.type === 'sync_ack') { p.send(JSON.stringify({ type:'sync_go' })); onReady?.(); }
      } catch {}
    };
    p.once?.('data', handler) || p.on('data', handler);
  }, [peerRef, onReady]);

  const guestReceive = useCallback((rawData) => {
    try {
      const m = JSON.parse(rawData);
      if (m.type === 'sync_start') { expected.current = m.total; chunks.current = []; return; }
      if (m.type === 'sync_go')    { onReady?.(); return; }
    } catch {
      chunks.current.push(rawData);
      if (chunks.current.length >= expected.current) {
        const total = chunks.current.reduce((s, c) => s + c.byteLength, 0);
        const out   = new Uint8Array(total);
        let off = 0;
        chunks.current.forEach(c => { out.set(new Uint8Array(c), off); off += c.byteLength; });
        window.electronAPI.writeSaveState({ data: btoa(String.fromCharCode(...out)), filename: 'received.sav' })
          .then(() => peerRef.current.send(JSON.stringify({ type:'sync_ack' })));
      }
    }
  }, [peerRef, onReady]);

  return { hostSend, guestReceive };
}
=======
// ─── useController — Gamepad API polling ────────────────────────────────────
import { useEffect, useRef, useCallback } from 'react';

export const BUTTON_MAP = {
  0:  'cross',    // ✕
  1:  'circle',   // ○
  2:  'square',   // □
  3:  'triangle', // △
  4:  'l1',  5:  'r1',
  6:  'l2',  7:  'r2',
  8:  'share',  9: 'options',
  10: 'l3',    11: 'r3',
  12: 'up',    13: 'down',
  14: 'left',  15: 'right',
  16: 'ps',
};

const AXIS_DEADZONE = 0.12;

/**
 * Polls the Gamepad API at 60fps and fires `onInput` callbacks.
 *
 * @param {Function} onInput  - ({ button?, pressed?, value?, type?, lx?, ly?, rx?, ry? }) => void
 * @param {number}   [index]  - Gamepad index (default 0)
 */
export function useController(onInput, index = 0) {
  const frameRef       = useRef(null);
  const prevButtonsRef = useRef({});
  const prevAxesRef    = useRef({});
  const onInputRef     = useRef(onInput);

  useEffect(() => { onInputRef.current = onInput; }, [onInput]);

  const poll = useCallback(() => {
    const gp = navigator.getGamepads()[index];

    if (gp) {
      // ── Buttons ────────────────────────────────────────────────────────
      gp.buttons.forEach((btn, i) => {
        const name = BUTTON_MAP[i];
        if (!name) return;
        const was = prevButtonsRef.current[name] ?? false;
        if (btn.pressed !== was) {
          onInputRef.current?.({ button: name, pressed: btn.pressed, value: btn.value });
          prevButtonsRef.current[name] = btn.pressed;
        }
      });

      // ── Axes ───────────────────────────────────────────────────────────
      const axes = {
        lx: Math.abs(gp.axes[0]) > AXIS_DEADZONE ? gp.axes[0] : 0,
        ly: Math.abs(gp.axes[1]) > AXIS_DEADZONE ? gp.axes[1] : 0,
        rx: Math.abs(gp.axes[2]) > AXIS_DEADZONE ? gp.axes[2] : 0,
        ry: Math.abs(gp.axes[3]) > AXIS_DEADZONE ? gp.axes[3] : 0,
      };
      const prev = prevAxesRef.current;
      if (axes.lx !== prev.lx || axes.ly !== prev.ly || axes.rx !== prev.rx || axes.ry !== prev.ry) {
        onInputRef.current?.({ type: 'axes', ...axes });
        prevAxesRef.current = axes;
      }
    }

    frameRef.current = requestAnimationFrame(poll);
  }, [index]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frameRef.current);
  }, [poll]);
}
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
