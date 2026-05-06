// src/main/ipc/network.ipc.js
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

function setupNetworkIPC(ipcMain) {

  ipcMain.handle('network:get-local-ip', () => getLocalIP());

  ipcMain.handle('network:upnp-open', async (_, port) => {
    try {
      // nat-upnp ظٹطھط·ظ„ط¨ طھط«ط¨ظٹطھ ط§ظ„ظ…ظƒطھط¨ط©
      const upnp = require('nat-upnp').createClient();
      await new Promise((resolve, reject) => {
        upnp.portMapping({
          public:       port,
          private:      port,
          protocol:     'UDP',
          description:  'Nexus Netplay',
          ttl:          7200,
        }, err => err ? reject(err) : resolve());
      });
      upnp.close();
      console.log(`[UPnP] âœ… Port ${port} opened`);
      return { success: true, port };
    } catch (e) {
      console.warn('[UPnP] âڑ ï¸ڈ', e.message);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('network:upnp-close', async (_, port) => {
    try {
      const upnp = require('nat-upnp').createClient();
      await new Promise((resolve, reject) => {
        upnp.portUnmapping({ public: port, protocol: 'UDP' },
          err => err ? reject(err) : resolve()
        );
      });
      upnp.close();
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  });
}

module.exports = { setupNetworkIPC, getLocalIP };
