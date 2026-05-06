// ─── Nexus Netplay Hub — Shared Constants ───────────────────────────────────

export const SIGNALING_PORT = 7331;
export const NETPLAY_PORT   = 7500;
export const CHUNK_SIZE     = 64 * 1024; // 64 KB

export const EMULATORS = {
  PCSX2:  'pcsx2',
  DOLPHIN: 'dolphin',
  PPSSPP: 'ppsspp',
};

export const CONNECTION_STATUS = {
  IDLE:       'idle',
  CONNECTING: 'connecting',
  CONNECTED:  'connected',
  ERROR:      'error',
};

export const SYNC_STATUS = {
  WAITING:      'waiting',
  TRANSFERRING: 'transferring',
  READY:        'ready',
};

export const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];
