<<<<<<< HEAD
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
=======
// ─── IPC: Save-State File Management ────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const SAVE_DIR = path.join(os.homedir(), '.nexus-netplay', 'savestates');

function ensureSaveDir() {
  if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
}

function setupFilesIPC(ipcMain) {
  // ── Load a save-state file and return its buffer ──────────────────────────
  ipcMain.handle('files:load-savestate', async (_event, filePath) => {
    try {
      if (typeof filePath === 'string' && fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        return { success: true, data: buf.buffer };
      }
      // filePath may already be an ArrayBuffer transferred from renderer
      return { success: true, data: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Save an ArrayBuffer to disk ───────────────────────────────────────────
  ipcMain.handle('files:save-savestate', async (_event, buffer, name) => {
    try {
      ensureSaveDir();
      const fileName = name || `state_${Date.now()}.sav`;
      const dest     = path.join(SAVE_DIR, fileName);
      fs.writeFileSync(dest, Buffer.from(buffer));
      console.log(`[Files] 💾 Save state written → ${dest}`);
      return { success: true, path: dest };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── List available save states for an emulator ────────────────────────────
  ipcMain.handle('files:list-savestates', async (_event, emulator) => {
    try {
      ensureSaveDir();
      const files = fs.readdirSync(SAVE_DIR)
        .filter(f => f.endsWith('.sav') || f.endsWith('.state'))
        .map(f => ({ name: f, path: path.join(SAVE_DIR, f), mtime: fs.statSync(path.join(SAVE_DIR, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime);
      return { success: true, files };
    } catch (err) {
      return { success: false, error: err.message };
    }
>>>>>>> f2a15ce2b0ec8fe19827c78a926291a93c7a800e
  });
}

module.exports = { setupFilesIPC };
