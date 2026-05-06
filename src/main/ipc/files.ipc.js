// src/main/ipc/files.ipc.js
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { dialog } = require('electron');

const SAVE_DIR = path.join(os.tmpdir(), 'nexus-savestates');
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

function setupFilesIPC(ipcMain) {

  ipcMain.handle('files:select-save-state', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'اختر ملف Save State',
      properties: ['openFile'],
      filters: [{ name: 'Save States', extensions: ['p2s','gci','sav','savestate','bin'] }],
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle('files:read-save-state', async (_, filePath) => {
    try {
      if (!fs.existsSync(filePath)) return { success: false, error: 'File not found' };
      const buffer = fs.readFileSync(filePath);
      return { success: true, data: buffer.toString('base64'), size: buffer.length };
    } catch (e) { return { success: false, error: e.message }; }
  });

  ipcMain.handle('files:write-save-state', async (_, { data, filename }) => {
    try {
      const outPath = path.join(SAVE_DIR, filename || `nexus_${Date.now()}.sav`);
      fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
      return { success: true, path: outPath };
    } catch (e) { return { success: false, error: e.message }; }
  });
}

module.exports = { setupFilesIPC };
