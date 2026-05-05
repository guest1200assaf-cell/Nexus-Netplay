// ─── Signaling Server — Multi-Player Mesh (up to 4) ─────────────────────────
const { WebSocketServer } = require('ws');

const MAX_PLAYERS = 4;

/**
 * rooms: Map<roomCode, Map<playerId, WebSocket>>
 * Each player gets a unique numeric ID (0..3)
 */
const rooms = new Map();

function startSignalingServer(port = 7331) {
  return new Promise((resolve, reject) => {
    const wss = new WebSocketServer({ port }, () => {
      console.log(`[Signaling] ✅ WebSocket server on ws://localhost:${port} (max ${MAX_PLAYERS} players)`);
      resolve(wss);
    });

    wss.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Signaling] ⚠️ Port ${port} already in use — skipping`);
        resolve(null);
      } else reject(err);
    });

    wss.on('connection', (ws) => {
      let assignedRoom  = null;
      let assignedId    = null;

      ws.on('message', (raw) => {
        let msg;
        try { msg = JSON.parse(raw.toString()); } catch { return; }

        // ── JOIN ──────────────────────────────────────────────────────────
        if (msg.type === 'join') {
          const code = String(msg.roomCode);
          if (!rooms.has(code)) rooms.set(code, new Map());
          const room = rooms.get(code);

          if (room.size >= MAX_PLAYERS) {
            ws.send(JSON.stringify({ type: 'room_full', max: MAX_PLAYERS }));
            return;
          }

          // Find next available player ID
          let pid = 0;
          while (room.has(pid)) pid++;

          room.set(pid, ws);
          assignedRoom = code;
          assignedId   = pid;

          // Tell this client their assigned ID + who's already in the room
          const existingPeers = [...room.entries()]
            .filter(([id]) => id !== pid)
            .map(([id]) => id);

          ws.send(JSON.stringify({
            type:         'joined',
            playerId:     pid,
            existingPeers,
            playerCount:  room.size,
            maxPlayers:   MAX_PLAYERS,
          }));

          // Tell existing players a new peer arrived
          room.forEach((client, id) => {
            if (id !== pid && client.readyState === client.OPEN) {
              client.send(JSON.stringify({
                type:        'peer_joined',
                newPeerId:   pid,
                playerCount: room.size,
              }));
            }
          });

          console.log(`[Signaling] 🚪 Room "${code}" — player ${pid} joined (${room.size}/${MAX_PLAYERS})`);
        }

        // ── SIGNAL relay (routed from→to) ─────────────────────────────────
        if (msg.type === 'signal' && assignedRoom !== null) {
          const room = rooms.get(assignedRoom);
          if (!room) return;

          const target = msg.to;
          if (target !== undefined) {
            // Direct routed signal
            const targetWs = room.get(target);
            if (targetWs?.readyState === targetWs?.OPEN) {
              targetWs.send(JSON.stringify({
                type: 'signal',
                from: assignedId,
                data: msg.data,
              }));
            }
          } else {
            // Broadcast signal to all others (legacy 2-player fallback)
            room.forEach((client, id) => {
              if (id !== assignedId && client.readyState === client.OPEN) {
                client.send(JSON.stringify({ type: 'signal', from: assignedId, data: msg.data }));
              }
            });
          }
        }

        // ── CHAT relay ────────────────────────────────────────────────────
        if (msg.type === 'chat' && assignedRoom !== null) {
          const room = rooms.get(assignedRoom);
          if (!room) return;
          room.forEach((client, id) => {
            if (id !== assignedId && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: 'chat', from: assignedId, text: msg.text }));
            }
          });
        }
      });

      ws.on('close', () => {
        if (assignedRoom !== null) {
          const room = rooms.get(assignedRoom);
          if (room) {
            room.delete(assignedId);
            console.log(`[Signaling] 👋 Room "${assignedRoom}" — player ${assignedId} left (${room.size}/${MAX_PLAYERS})`);

            // Notify remaining players
            room.forEach((client) => {
              if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                  type:        'peer_left',
                  peerId:      assignedId,
                  playerCount: room.size,
                }));
              }
            });

            if (room.size === 0) rooms.delete(assignedRoom);
          }
        }
      });

      ws.on('error', (err) => console.error('[Signaling] WS error:', err.message));
    });
  });
}

module.exports = { startSignalingServer, MAX_PLAYERS };
