// ─── Zustand Global Store — 4-Player Support ────────────────────────────────
import { create } from 'zustand';

const MAX_PLAYERS = 4;

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useNexusStore = create((set, get) => ({
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
  isMuted:     false,
  voiceActive: false,
  voiceLevel:  0,

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
  }),
}));
