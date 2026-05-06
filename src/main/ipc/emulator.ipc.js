// src/main/ipc/emulator.ipc.js
const { dialog } = require('electron');
const { injectPCSX2NetworkConfig, launchPCSX2, restorePCSX2Config } = require('../emulators/pcsx2.config');
const { injectDolphinNetplayConfig, launchDolphin }                 = require('../emulators/dolphin.config');
const { injectPPSSPPNetplayConfig, launchPPSSPP }                   = require('../emulators/ppsspp.config');

function setupEmulatorIPC(ipcMain) {

  ipcMain.handle('emulator:select-path', async (_, name) => {
    const filters = {
      pcsx2:  [{ name: 'PCSX2',  extensions: ['exe',''] }],
      dolphin:[{ name: 'Dolphin',extensions: ['exe',''] }],
      ppsspp: [{ name: 'PPSSPP', extensions: ['exe',''] }],
    };
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: `اختر ${name}`,
      properties: ['openFile'],
      filters: filters[name] || [],    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle('emulator:select-iso', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'اختر ملف اللعبة',
      properties: ['openFile'],
      filters: [{ name: 'Game Files', extensions: ['iso','cso','bin','elf','gcm','wbfs','rvz'] }],    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle('emulator:launch-pcsx2', async (event, { executablePath, isoPath, networkConfig }) => {
    try {
      injectPCSX2NetworkConfig(networkConfig);
      const pid = launchPCSX2(executablePath, isoPath, code =>
        event.sender.send('emulator:process-exited', { emulator:'pcsx2', code })
      );
      return { success: true, pid };
    } catch (e) { return { success: false, error: e.message }; }
  });

  ipcMain.handle('emulator:launch-dolphin', async (event, { executablePath, gameFile, networkConfig }) => {
    try {
      injectDolphinNetplayConfig(networkConfig);
      const pid = launchDolphin(executablePath, gameFile, code =>
        event.sender.send('emulator:process-exited', { emulator:'dolphin', code })
      );
      return { success: true, pid };
    } catch (e) { return { success: false, error: e.message }; }
  });

  ipcMain.handle('emulator:launch-ppsspp', async (event, { executablePath, isoPath, networkConfig }) => {
    try {
      injectPPSSPPNetplayConfig(networkConfig);
      const pid = launchPPSSPP(executablePath, isoPath, code =>
        event.sender.send('emulator:process-exited', { emulator:'ppsspp', code })
      );
      return { success: true, pid };
    } catch (e) { return { success: false, error: e.message }; }
  });

  ipcMain.handle('emulator:restore-config', async (_, name) => {
    const map = { pcsx2: restorePCSX2Config };
    return map[name] ? map[name]() : { success: false };  });
}

module.exports = { setupEmulatorIPC };
