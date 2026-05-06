<<<<<<< HEAD
// src/main/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // نافذة
  minimizeWindow:  () => ipcRenderer.send('window:minimize'),
  maximizeWindow:  () => ipcRenderer.send('window:maximize'),
  closeWindow:     () => ipcRenderer.send('window:close'),

  // تحديثات
  checkForUpdates:  () => ipcRenderer.invoke('updater:check-now'),
  installUpdate:    () => ipcRenderer.send('updater:install-now'),
  onUpdaterEvent:   (cb) => ipcRenderer.on('updater:checking',         (_, d) => cb('checking', d))
                         || ipcRenderer.on('updater:available',        (_, d) => cb('available', d))
                         || ipcRenderer.on('updater:not-available',    (_, d) => cb('not-available', d))
                         || ipcRenderer.on('updater:download-progress',(_, d) => cb('download-progress', d))
                         || ipcRenderer.on('updater:downloaded',       (_, d) => cb('downloaded', d))
                         || ipcRenderer.on('updater:error',            (_, d) => cb('error', d)),

  // محاكيات
  selectEmulatorPath: (name)   => ipcRenderer.invoke('emulator:select-path', name),
  selectISOPath:      ()       => ipcRenderer.invoke('emulator:select-iso'),
  launchPCSX2:        (config) => ipcRenderer.invoke('emulator:launch-pcsx2', config),
  launchDolphin:      (config) => ipcRenderer.invoke('emulator:launch-dolphin', config),
  launchPPSSPP:       (config) => ipcRenderer.invoke('emulator:launch-ppsspp', config),
  restoreConfig:      (name)   => ipcRenderer.invoke('emulator:restore-config', name),
  onEmulatorExit:     (cb)     => ipcRenderer.on('emulator:process-exited', (_, d) => cb(d)),

  // ملفات Save State
  readSaveState:    (filePath) => ipcRenderer.invoke('files:read-save-state', filePath),
  writeSaveState:   (data)     => ipcRenderer.invoke('files:write-save-state', data),
  selectSaveState:  ()         => ipcRenderer.invoke('files:select-save-state'),

  // شبكة / UPnP
  openPort:  (port) => ipcRenderer.invoke('network:upnp-open', port),
  closePort: (port) => ipcRenderer.invoke('network:upnp-close', port),
  getLocalIP: ()    => ipcRenderer.invoke('network:get-local-ip'),
=======
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    let validChannels = ['window:minimize', 'window:maximize', 'window:close'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    let validChannels = ['window:is-maximized'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
});
