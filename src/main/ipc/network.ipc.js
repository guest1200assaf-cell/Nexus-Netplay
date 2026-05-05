// ─── IPC: Network / UPnP ────────────────────────────────────────────────────
const os = require('os');

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

function setupNetworkIPC(ipcMain) {
  ipcMain.handle('network:local-ip', () => getLocalIP());

  // UPnP stubs — nat-upnp can be integrated here when needed
  ipcMain.handle('network:upnp-open', async (_event, port, protocol = 'TCP') => {
    console.log(`[UPnP] Open port ${port}/${protocol} (stub)`);
    return { success: true, port, protocol };
  });

  ipcMain.handle('network:upnp-close', async (_event, port, protocol = 'TCP') => {
    console.log(`[UPnP] Close port ${port}/${protocol} (stub)`);
    return { success: true };
  });
}

module.exports = { setupNetworkIPC, getLocalIP };
