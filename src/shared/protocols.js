// ─── Nexus Netplay Hub — P2P Channel Protocols ──────────────────────────────

export const MSG = {
  // Signaling
  JOIN:         'join',
  SIGNAL:       'signal',
  PEER_JOINED:  'peer_joined',
  ROOM_FULL:    'room_full',
  ERROR:        'error',

  // Sync flow
  SYNC_START:   'sync_start',
  SYNC_ACK:     'sync_ack',
  SYNC_GO:      'sync_go',

  // Save-state transfer
  SAVESTATE_START: 'savestate_start',

  // Input
  INPUT:        'input',
  AXES:         'axes',

  // Chat
  CHAT:         'chat',

  // Voice signaling
  VOICE_MUTE:   'voice_mute',
};

/**
 * Build a typed message object ready to JSON.stringify
 */
export function buildMsg(type, payload = {}) {
  return { type, ...payload };
}

export function parseMsg(raw) {
  try {
    if (typeof raw === 'string') return JSON.parse(raw);
    if (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw)) return null; // binary chunk
    return null;
  } catch {
    return null;
  }
}
