// ─── Nexus Netplay Hub — Context Bridge (Preload) ───────────────────────────
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  // ── Emulator ──────────────────────────────────────────────────────────────
  selectEmulatorPath: (name)   => ipcRenderer.invoke('emulator:select-path', name),
  launchPCSX2:  (cfg)          => ipcRenderer.invoke('emulator:launch-pcsx2', cfg),
  launchDolphin:(cfg)          => ipcRenderer.invoke('emulator:launch-dolphin', cfg),
  launchPPSSPP: (cfg)          => ipcRenderer.invoke('emulator:launch-ppsspp', cfg),
  restoreConfig:(name)         => ipcRenderer.invoke('emulator:restore-config', name),
  onEmulatorExited: (cb)       => ipcRenderer.on('emulator:process-exited', cb),

  // ── Files / Save-States ───────────────────────────────────────────────────
  loadSaveState:  (buf)        => ipcRenderer.invoke('files:load-savestate', buf),
  saveSaveState:  (buf, name)  => ipcRenderer.invoke('files:save-savestate', buf, name),
  listSaveStates: (emulator)   => ipcRenderer.invoke('files:list-savestates', emulator),

  // ── Network ───────────────────────────────────────────────────────────────
  openUPnPPort: (port, proto)  => ipcRenderer.invoke('network:upnp-open', port, proto),
  closeUPnPPort:(port, proto)  => ipcRenderer.invoke('network:upnp-close', port, proto),
  getLocalIP:   ()             => ipcRenderer.invoke('network:local-ip'),

  // ── Window Controls ───────────────────────────────────────────────────────
  window: {
    minimize:    () => ipcRenderer.send('window:minimize'),
    maximize:    () => ipcRenderer.send('window:maximize'),
    close:       () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  },
});
