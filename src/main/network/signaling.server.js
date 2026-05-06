// src/main/network/signaling.server.js
const { WebSocketServer } = require('ws');

let wss = null;
const rooms = new Map(); // roomCode => Set of ws clients

function startSignalingServer(port = 7331) {
  return new Promise((resolve, reject) => {
    try {
      wss = new WebSocketServer({ port });

      wss.on('listening', () => {
        console.log(`[Signaling] ✅ خادم الإشارة يعمل على المنفذ ${port}`);
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

              // إشعار الطرف الآخر بوجود لاعب جديد
              rooms.get(clientRoom).forEach(peer => {
                if (peer !== ws && peer.readyState === 1) {
                  peer.send(JSON.stringify({ type: 'peer_joined' }));
                }
              });
            }

            if (msg.type === 'signal' && clientRoom) {
              // إعادة توجيه إشارة WebRTC للطرف الآخر فقط
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
