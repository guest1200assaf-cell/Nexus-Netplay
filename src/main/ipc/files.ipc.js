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
  });
}

module.exports = { setupFilesIPC };
