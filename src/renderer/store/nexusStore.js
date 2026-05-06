// src/renderer/store/nexusStore.js
import { create } from 'zustand';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useNexusStore = create((set, get) => ({
  // ── اتصال ──────────────────────────────────────────────
  connectionStatus: 'idle',   // idle | connecting | connected | error
  isHost:    false,
  roomCode:  null,
  localIP:   null,
  peers:     [],

  // ── محاكيات ─────────────────────────────────────────────
  selectedEmulator: null,     // 'pcsx2' | 'dolphin' | 'ppsspp'
  emulatorPath:     null,
  isoPath:          null,
  emulatorRunning:  false,

  // ── مزامنة ──────────────────────────────────────────────
  syncStatus:   'waiting',    // waiting | transferring | ready
  syncProgress: 0,

  // ── صوت ─────────────────────────────────────────────────
  isMuted:     false,
  voiceActive: false,
  voiceLevel:  0,

  // ── إعدادات ─────────────────────────────────────────────
  settings: {
    port:         7500,
    nickname:     'Player',
    autoUPnP:     true,
    theme:        'ps5',
  },

  // ── Actions ─────────────────────────────────────────────
  setConnectionStatus: (s)  => set({ connectionStatus: s }),
  setIsHost:           (v)  => set({ isHost: v }),
  setRoomCode:         (c)  => set({ roomCode: c }),
  setLocalIP:          (ip) => set({ localIP: ip }),
  addPeer:    (peer) => set(s => ({ peers: [...s.peers, peer] })),
  removePeer: (id)   => set(s => ({ peers: s.peers.filter(p => p.id !== id) })),

  setSelectedEmulator: (name) => set({ selectedEmulator: name }),
  setEmulatorPath:     (p)    => set({ emulatorPath: p }),
  setISOPath:          (p)    => set({ isoPath: p }),
  setEmulatorRunning:  (v)    => set({ emulatorRunning: v }),

  setSyncProgress: (n) => set({
    syncProgress: n,
    syncStatus: n >= 100 ? 'ready' : 'transferring',
  }),
  resetSync: () => set({ syncProgress: 0, syncStatus: 'waiting' }),

  toggleMute:      ()  => set(s => ({ isMuted: !s.isMuted })),
  setVoiceLevel:   (n) => set({ voiceLevel: n }),
  setVoiceActive:  (v) => set({ voiceActive: v }),

  updateSettings: (partial) => set(s => ({ settings: { ...s.settings, ...partial } })),

  // إنشاء غرفة جديدة كـ Host
  createRoom: () => {
    const code = generateRoomCode();
    set({ isHost: true, roomCode: code, connectionStatus: 'connecting' });
    return code;
  },

  // الانضمام كـ Guest
  joinRoom: (code) => {
    set({ isHost: false, roomCode: code.toUpperCase(), connectionStatus: 'connecting' });
  },

  // إعادة تعيين كامل
  resetSession: () => set({
    connectionStatus: 'idle',
    isHost: false,
    roomCode: null,
    peers: [],
    syncStatus: 'waiting',
    syncProgress: 0,
    voiceActive: false,
    emulatorRunning: false,
  }),
}));
