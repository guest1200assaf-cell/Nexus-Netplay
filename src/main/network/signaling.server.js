// src/main/network/signaling.server.js
const { WebSocketServer } = require('ws');

let wss = null;
const rooms = new Map(); // roomCode => Set of ws clients

function startSignalingServer(port = 7331) {
  return new Promise((resolve, reject) => {
    try {
      wss = new WebSocketServer({ port });

      wss.on('listening', () => {
        console.log(`[Signaling] âœ… ط®ط§ط¯ظ… ط§ظ„ط¥ط´ط§ط±ط© ظٹط¹ظ…ظ„ ط¹ظ„ظ‰ ط§ظ„ظ…ظ†ظپط° ${port}`);
        resolve(wss);
      });

      wss.on('connection', (ws) => {
        let clientRoom = null;

        ws.on('message', (raw) => {
          try {
            const msg = JSON.parse(raw.toString());

            if (msg.type === 'join') {
              clientRoom = msg.roomCode;
              if (!rooms.has(clientRoom)) rooms.set(clientRoom, new Set());
              rooms.get(clientRoom).add(ws);
              console.log(`[Signaling] Client joined room: ${clientRoom} (${rooms.get(clientRoom).size} peers)`);

              // ط¥ط´ط¹ط§ط± ط§ظ„ط·ط±ظپ ط§ظ„ط¢ط®ط± ط¨ظˆط¬ظˆط¯ ظ„ط§ط¹ط¨ ط¬ط¯ظٹط¯
              rooms.get(clientRoom).forEach(peer => {
                if (peer !== ws && peer.readyState === 1) {
                  peer.send(JSON.stringify({ type: 'peer_joined' }));
                }
              });
            }

            if (msg.type === 'signal' && clientRoom) {
              // ط¥ط¹ط§ط¯ط© طھظˆط¬ظٹظ‡ ط¥ط´ط§ط±ط© WebRTC ظ„ظ„ط·ط±ظپ ط§ظ„ط¢ط®ط± ظپظ‚ط·
              rooms.get(clientRoom)?.forEach(peer => {
                if (peer !== ws && peer.readyState === 1) {
                  peer.send(JSON.stringify({ type: 'signal', data: msg.data }));
                }
              });
            }

          } catch (e) {
            console.error('[Signaling] Parse error:', e.message);
          }
        });

        ws.on('close', () => {
          if (clientRoom && rooms.has(clientRoom)) {
            rooms.get(clientRoom).delete(ws);
            if (rooms.get(clientRoom).size === 0) rooms.delete(clientRoom);
            console.log(`[Signaling] Client left room: ${clientRoom}`);
          }
        });
      });

      wss.on('error', reject);
    } catch (e) { reject(e); }
  });
}

function stopSignalingServer() {
  wss?.close();
}

module.exports = { startSignalingServer, stopSignalingServer };
