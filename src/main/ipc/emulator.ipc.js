// ─── IPC: Emulator Launch & Config ──────────────────────────────────────────
const { dialog } = require('electron');
const { injectPCSX2NetworkConfig, launchPCSX2, restorePCSX2Config } = require('../emulators/pcsx2.config');
const { launchDolphin } = require('../emulators/dolphin.config');
const { injectPPSSPPNetworkConfig, launchPPSSPP, restorePPSSPPConfig } = require('../emulators/ppsspp.config');

function setupEmulatorIPC(ipcMain) {

  // ── Pick executable path ─────────────────────────────────────────────────
  ipcMain.handle('emulator:select-path', async (_event, emulatorName) => {
    const filters = {
      pcsx2:   [{ name: 'PCSX2',   extensions: ['exe', ''] }],
      dolphin: [{ name: 'Dolphin', extensions: ['exe', ''] }],
      ppsspp:  [{ name: 'PPSSPP',  extensions: ['exe', ''] }],
    };
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: `Select ${emulatorName} executable`,
      properties: ['openFile'],
      filters: filters[emulatorName] || [],
    });
    return canceled ? null : filePaths[0];
  });

  // ── Pick ISO / ROM path ───────────────────────────────────────────────────
  ipcMain.handle('emulator:select-iso', async (_event, emulatorName) => {
    const extMap = {
      pcsx2:   ['iso', 'bin', 'img', 'mdf', 'nrg', 'gz'],
      dolphin: ['iso', 'gcm', 'gcz', 'wbfs', 'ciso', 'wad', 'elf', 'dol'],
      ppsspp:  ['iso', 'cso', 'pbp'],
    };
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Game ROM / ISO',
      properties: ['openFile'],
      filters: [{ name: 'Game Files', extensions: extMap[emulatorName] || ['iso'] }],
    });
    return canceled ? null : filePaths[0];
  });

  // ── Launch PCSX2 ─────────────────────────────────────────────────────────
  ipcMain.handle('emulator:launch-pcsx2', async (event, { executablePath, isoPath, networkConfig }) => {
    try {
      const inject = injectPCSX2NetworkConfig(networkConfig);
      if (!inject.success) throw new Error('Config injection failed');

      const pid = launchPCSX2(executablePath, isoPath, (exitCode) => {
        event.sender.send('emulator:process-exited', { emulator: 'pcsx2', exitCode });
      });
      return { success: true, pid };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Launch Dolphin ───────────────────────────────────────────────────────
  ipcMain.handle('emulator:launch-dolphin', async (event, { executablePath, networkConfig }) => {
    try {
      const pid = launchDolphin(executablePath, networkConfig, (exitCode) => {
        event.sender.send('emulator:process-exited', { emulator: 'dolphin', exitCode });
      });
      return { success: true, pid };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Launch PPSSPP ────────────────────────────────────────────────────────
  ipcMain.handle('emulator:launch-ppsspp', async (event, { executablePath, isoPath, networkConfig }) => {
    try {
      injectPPSSPPNetworkConfig(networkConfig);
      const pid = launchPPSSPP(executablePath, isoPath, (exitCode) => {
        event.sender.send('emulator:process-exited', { emulator: 'ppsspp', exitCode });
      });
      return { success: true, pid };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Restore config ───────────────────────────────────────────────────────
  ipcMain.handle('emulator:restore-config', async (_event, emulatorName) => {
    if (emulatorName === 'pcsx2')  return restorePCSX2Config();
    if (emulatorName === 'ppsspp') return restorePPSSPPConfig();
    return { success: false, reason: 'Unknown emulator' };
  });
}

module.exports = { setupEmulatorIPC };
