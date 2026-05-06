// ─── UPnP Manager ────────────────────────────────────────────────────────────
// Full implementation using nat-upnp when available, graceful fallback otherwise.

let client = null;

async function getClient() {
  if (client) return client;
  try {
    const natUpnp = require('nat-upnp');
    client = natUpnp.createClient();
    return client;
  } catch {
    console.warn('[UPnP] nat-upnp not available — port mapping disabled');
    return null;
  }
}

async function openPort(externalPort, internalPort, protocol = 'TCP', description = 'Nexus Netplay') {
  const c = await getClient();
  if (!c) return { success: false, reason: 'UPnP unavailable' };

  return new Promise((resolve) => {
    c.portMapping({
      public:  externalPort,
      private: internalPort || externalPort,
      protocol,
      description,
      ttl: 3600,
    }, (err) => {
      if (err) {
        console.error('[UPnP] portMapping error:', err.message);
        resolve({ success: false, reason: err.message });
      } else {
        console.log(`[UPnP] ✅ Port ${externalPort}/${protocol} opened`);
        resolve({ success: true, externalPort, protocol });
      }
    });
  });
}

async function closePort(externalPort, protocol = 'TCP') {
  const c = await getClient();
  if (!c) return { success: false };

  return new Promise((resolve) => {
    c.portUnmapping({ public: externalPort, protocol }, (err) => {
      if (err) resolve({ success: false, reason: err.message });
      else { console.log(`[UPnP] 🔒 Port ${externalPort}/${protocol} closed`); resolve({ success: true }); }
    });
  });
}

async function getExternalIP() {
  const c = await getClient();
  if (!c) return null;
  return new Promise((resolve) => {
    c.externalIp((err, ip) => resolve(err ? null : ip));
  });
}

module.exports = { openPort, closePort, getExternalIP };
