// ─── useVoiceChat — WebRTC Audio (microphone + remote playback) ──────────────
import { useRef, useCallback, useEffect, useState } from 'react';
import { useNexusStore } from '../store/nexusStore';

export function useVoiceChat() {
  const localStreamRef  = useRef(null);
  const audioCtxRef     = useRef(null);
  const analyserRef     = useRef(null);
  const animFrameRef    = useRef(null);
  const remoteAudioRef  = useRef(null);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const { isMuted, setVoiceActive } = useNexusStore();

  // ── Request microphone ────────────────────────────────────────────────────
  const initMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation:  true,
          noiseSuppression:  true,
          autoGainControl:   true,
          sampleRate:        48000,
          channelCount:      1,
        },
        video: false,
      });

      localStreamRef.current = stream;
      setVoiceActive(true);

      // Set up analyser for voice-level UI
      audioCtxRef.current  = new AudioContext();
      analyserRef.current  = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const src = audioCtxRef.current.createMediaStreamSource(stream);
      src.connect(analyserRef.current);

      const measure = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVoiceLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(measure);
      };
      animFrameRef.current = requestAnimationFrame(measure);

      console.log('[Voice] 🎙 Microphone ready');
      return stream;
    } catch (err) {
      console.error('[Voice] ❌ Mic error:', err.message);
      return null;
    }
  }, [setVoiceActive]);

  // ── Play remote stream ────────────────────────────────────────────────────
  const playRemoteAudio = useCallback((remoteStream) => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      return remoteAudioRef.current;
    }

    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.autoplay  = true;
    audio.volume    = 1.0;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    remoteAudioRef.current = audio;
    audio.play().catch(console.warn);
    return audio;
  }, []);

  // ── Mute / unmute ────────────────────────────────────────────────────────
  const setMuted = useCallback((muted) => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !muted; });
  }, []);

  // Sync muted state from store
  useEffect(() => { setMuted(isMuted); }, [isMuted, setMuted]);

  // ── Stop microphone ───────────────────────────────────────────────────────
  const stopMicrophone = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    localStreamRef.current = null;
    analyserRef.current    = null;
    setVoiceActive(false);
    setVoiceLevel(0);
    console.log('[Voice] 🔇 Microphone stopped');
  }, [setVoiceActive]);

  useEffect(() => () => stopMicrophone(), [stopMicrophone]);

  return {
    initMicrophone,
    playRemoteAudio,
    setMuted,
    stopMicrophone,
    voiceLevel,
    localStream: localStreamRef,
  };
}
