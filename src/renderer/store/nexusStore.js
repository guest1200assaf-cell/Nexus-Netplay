<<<<<<< HEAD
// src/renderer/store/nexusStore.js
import { create } from 'zustand';

=======
// ─── Zustand Global Store — 4-Player Support ────────────────────────────────
import { create } from 'zustand';

const MAX_PLAYERS = 4;

>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useNexusStore = create((set, get) => ({
<<<<<<< HEAD
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
=======
  // ── Connection ─────────────────────────────────────────────────────────────
  connectionStatus: 'idle',   // idle | connecting | connected | error
  isHost:          false,
  roomCode:        null,
  localPlayerId:   null,      // 0..3 assigned by signaling server
  maxPlayers:      MAX_PLAYERS,
  /**
   * peers: Map-like array of { id: number, connected: bool, name: string }
   * Represents OTHER players (not us)
   */
  peers: [],
  localIP: null,

  // ── Emulators ──────────────────────────────────────────────────────────────
  selectedEmulator: null,
  emulatorPath:    null,
  isoPath:         null,
  emulatorRunning: false,

  // ── Sync ───────────────────────────────────────────────────────────────────
  syncStatus:   'waiting',
  syncProgress: 0,

  // ── Voice ──────────────────────────────────────────────────────────────────
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
  isMuted:     false,
  voiceActive: false,
  voiceLevel:  0,

<<<<<<< HEAD
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
=======
  // ── Chat ───────────────────────────────────────────────────────────────────
  chatMessages: [],

  // ── Settings ───────────────────────────────────────────────────────────────
  settings: {
    theme:         'dark',
    language:      'ar',
    signalingPort: 7331,
    netplayPort:   7500,
    playerName:    'Player',
    maxPlayers:    MAX_PLAYERS,
  },

  // ── Actions ────────────────────────────────────────────────────────────────
  setConnectionStatus: (s)  => set({ connectionStatus: s }),
  setIsHost:     (v)        => set({ isHost: v }),
  setRoomCode:   (c)        => set({ roomCode: c }),
  setLocalPlayerId: (id)    => set({ localPlayerId: id }),
  generateRoom:  ()         => {
    const c = generateRoomCode();
    set({ roomCode: c, isHost: true });
    return c;
  },

  // peers management
  addPeer: (peer) => set(s => {
    const exists = s.peers.find(p => p.id === peer.id);
    if (exists) {
      return { peers: s.peers.map(p => p.id === peer.id ? { ...p, ...peer } : p) };
    }
    return { peers: [...s.peers, peer] };
  }),
  removePeer:  (id)    => set(s => ({ peers: s.peers.filter(p => p.id !== id) })),
  updatePeer:  (id, patch) => set(s => ({ peers: s.peers.map(p => p.id === id ? { ...p, ...patch } : p) })),
  clearPeers:  ()      => set({ peers: [] }),
  setLocalIP:  (ip)    => set({ localIP: ip }),

  setSelectedEmulator: (e) => set({ selectedEmulator: e }),
  setEmulatorPath: (p)     => set({ emulatorPath: p }),
  setIsoPath: (p)          => set({ isoPath: p }),
  setEmulatorRunning: (v)  => set({ emulatorRunning: v }),

  setSyncProgress: (n)  => set({ syncProgress: n, syncStatus: n >= 100 ? 'ready' : 'transferring' }),
  resetSync:    ()      => set({ syncProgress: 0, syncStatus: 'waiting' }),

  toggleMute:   ()      => set(s => ({ isMuted: !s.isMuted })),
  setVoiceActive: (v)   => set({ voiceActive: v }),
  setVoiceLevel: (l)    => set({ voiceLevel: l }),

  addChatMessage: (msg) => set(s => ({
    chatMessages: [
      ...s.chatMessages,
      { id: Date.now(), ts: new Date().toLocaleTimeString(), ...msg },
    ],
  })),
  clearChat: () => set({ chatMessages: [] }),

  updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),

  resetSession: () => set({
    connectionStatus: 'idle', isHost: false, roomCode: null, peers: [],
    localPlayerId: null,
    syncStatus: 'waiting', syncProgress: 0,
    voiceActive: false, emulatorRunning: false, chatMessages: [],
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
  }),
}));
